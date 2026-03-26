/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { RefreshService } from './services/refresh-service';

type AssetBinding = {
  fetch(input: RequestInfo | URL | string, init?: RequestInit): Promise<Response>;
};

type Bindings = {
  DB: D1Database;
  ASSETS?: AssetBinding;
  IMAGE_PROXY_ALLOWED_HOSTS?: string;
};

const app = new Hono<{ Bindings: Bindings }>();
const refreshService = new RefreshService();
const blockedExactHosts = new Set([
  'localhost',
  '0.0.0.0',
  '127.0.0.1',
  '::1',
  '[::1]',
  'metadata.google.internal',
  '169.254.169.254',
]);

app.use('/api/*', cors());

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radiusKm = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusKm * c;
}

function hasUserCoordinates(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
}

function parseAllowedHosts(value?: string) {
  if (!value) return null;
  const hosts = value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return hosts.length ? new Set(hosts) : null;
}

function isPrivateHostname(hostname: string) {
  const normalized = hostname.toLowerCase();

  if (blockedExactHosts.has(normalized)) return true;
  if (normalized.endsWith('.internal') || normalized.endsWith('.local')) return true;

  if (/^(10)\./.test(normalized)) return true;
  if (/^(127)\./.test(normalized)) return true;
  if (/^(192\.168)\./.test(normalized)) return true;
  if (/^(169\.254)\./.test(normalized)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)) return true;
  if (/^0\.0\.0\.0$/.test(normalized)) return true;

  return false;
}

async function findNearestStore(db: D1Database, marketName: string, lat: number, lng: number) {
  const { results } = await db
    .prepare('SELECT * FROM store_locations WHERE market_name = ? AND is_active = 1')
    .bind(marketName)
    .all();

  let nearestStore: Record<string, unknown> | null = null;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const store of results as Array<Record<string, any>>) {
    const distance = getDistance(lat, lng, Number(store.latitude), Number(store.longitude));
    if (distance < minDistance) {
      minDistance = distance;
      nearestStore = store;
    }
  }

  if (!nearestStore || !Number.isFinite(minDistance)) {
    return { nearestStore: null, distanceKm: null };
  }

  return {
    nearestStore,
    distanceKm: Number(minDistance.toFixed(2)),
  };
}

app.get('/api/products/search', async (c) => {
  const q = c.req.query('q') || '';
  const sort = c.req.query('sort') || 'price_asc';
  const lat = Number.parseFloat(c.req.query('lat') || '0');
  const lng = Number.parseFloat(c.req.query('lng') || '0');
  const includeNearestStore = hasUserCoordinates(lat, lng);

  let sql = `
    SELECT p.*, 
           json_group_array(
             json_object(
               'market_name', pr.market_name,
               'price', pr.price,
               'promo_price', pr.promo_price,
               'currency', pr.currency,
               'stock_status', pr.stock_status,
               'confidence_level', pr.confidence_level,
               'source_type', pr.source_type,
               'last_updated', pr.last_updated
             )
           ) AS offers,
           MIN(COALESCE(pr.promo_price, pr.price)) AS min_price
    FROM products p
    JOIN prices pr ON p.id = pr.product_id
    WHERE p.name LIKE ? OR p.category LIKE ? OR p.brand LIKE ?
    GROUP BY p.id
  `;

  if (sort === 'price_asc') {
    sql += ' ORDER BY min_price ASC';
  } else if (sort === 'alpha_asc') {
    sql += ' ORDER BY p.name ASC';
  } else {
    sql += ' ORDER BY p.created_at DESC';
  }

  const { results } = await c.env.DB.prepare(sql)
    .bind(`%${q}%`, `%${q}%`, `%${q}%`)
    .all();

  const formattedResults = await Promise.all(
    (results as Array<Record<string, any>>).map(async (row) => {
      const offers = JSON.parse(String(row.offers ?? '[]'));
      const cheapestOffer = offers.reduce((previous: any, current: any) =>
        (current.promo_price || current.price) < (previous.promo_price || previous.price)
          ? current
          : previous,
      );

      if (!includeNearestStore || !cheapestOffer?.market_name) {
        return {
          ...row,
          offers,
          nearest_store: null,
          distance_km: null,
        };
      }

      const { nearestStore, distanceKm } = await findNearestStore(c.env.DB, cheapestOffer.market_name, lat, lng);

      return {
        ...row,
        offers,
        nearest_store: nearestStore,
        distance_km: distanceKm,
      };
    }),
  );

  return c.json(formattedResults);
});

app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  const lat = Number.parseFloat(c.req.query('lat') || '0');
  const lng = Number.parseFloat(c.req.query('lng') || '0');
  const includeNearestStore = hasUserCoordinates(lat, lng);

  const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
  if (!product) {
    return c.json({ error: 'Məhsul tapılmadı' }, 404);
  }

  const { results } = await c.env.DB
    .prepare('SELECT * FROM prices WHERE product_id = ? ORDER BY COALESCE(promo_price, price) ASC')
    .bind(id)
    .all();

  const offers = await Promise.all(
    (results as Array<Record<string, any>>).map(async (offer) => {
      if (!includeNearestStore) {
        return offer;
      }

      const { nearestStore, distanceKm } = await findNearestStore(c.env.DB, String(offer.market_name), lat, lng);
      return {
        ...offer,
        nearest_store: nearestStore,
        distance_km: distanceKm,
      };
    }),
  );

  return c.json({ ...product, offers });
});

app.get('/api/stores/nearby', async (c) => {
  const market = c.req.query('market');
  const lat = Number.parseFloat(c.req.query('lat') || '0');
  const lng = Number.parseFloat(c.req.query('lng') || '0');

  let query = 'SELECT * FROM store_locations WHERE is_active = 1';
  const params: string[] = [];

  if (market) {
    query += ' AND market_name = ?';
    params.push(market);
  }

  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  if (hasUserCoordinates(lat, lng)) {
    const sorted = (results as Array<Record<string, any>>)
      .map((store) => ({
        ...store,
        distance_km: Number(getDistance(lat, lng, Number(store.latitude), Number(store.longitude)).toFixed(2)),
      }))
      .sort((a, b) => a.distance_km - b.distance_km);
    return c.json(sorted);
  }

  return c.json(results);
});

app.get('/api/admin/status', async (c) => {
  const productCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM products').first('count');
  const priceCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM prices').first('count');
  const lastUpdate = await c.env.DB
    .prepare("SELECT value FROM system_metadata WHERE key = 'last_refresh'")
    .first('value');

  return c.json({
    productCount,
    priceCount,
    lastUpdate,
    adapters: refreshService.getAdapterStatus(),
  });
});

app.post('/api/admin/refresh', async (c) => {
  try {
    const count = await refreshService.runRefresh(c.env.DB);
    return c.json({ success: true, count });
  } catch (error: any) {
    return c.json({ success: false, error: error?.message || 'Yeniləmə uğursuz oldu' }, 500);
  }
});

app.get('/api/images/proxy', async (c) => {
  const urlValue = c.req.query('url');
  if (!urlValue) {
    return c.text('URL tələb olunur', 400);
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(urlValue);
  } catch {
    return c.text('URL düzgün deyil', 400);
  }

  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    return c.text('Yalnız http və https dəstəklənir', 400);
  }

  if (isPrivateHostname(targetUrl.hostname)) {
    return c.text('Bu hosta giriş qadağandır', 403);
  }

  const allowedHosts = parseAllowedHosts(c.env.IMAGE_PROXY_ALLOWED_HOSTS);
  if (allowedHosts && !allowedHosts.has(targetUrl.hostname.toLowerCase())) {
    return c.text('Bu host icazəli siyahıda deyil', 403);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'image/*',
        'User-Agent': 'QIYMET.AZ Image Proxy/1.0',
      },
      cf: {
        cacheTtl: 60 * 60 * 24,
        cacheEverything: true,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return c.text('Şəkil yüklənmədi', 502);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return c.text('Yalnız şəkil faylları dəstəklənir', 400);
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error?.name === 'AbortError') {
      return c.text('Şəkilin yüklənmə vaxtı bitdi', 504);
    }
    return c.text('Şəkil yüklənmədi', 502);
  }
});

app.get('*', async (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.notFound();
  }

  const assets = c.env.ASSETS;
  if (!assets) {
    return c.text('Statik fayllar tapılmadı', 500);
  }

  const requestUrl = new URL(c.req.url);
  const assetResponse = await assets.fetch(c.req.raw);

  if (assetResponse.status !== 404) {
    return assetResponse;
  }

  requestUrl.pathname = '/index.html';
  return assets.fetch(requestUrl.toString());
});

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(refreshService.runRefresh(env.DB));
  },
};
