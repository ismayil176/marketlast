import { MarketManager } from '../adapters/market-manager';
import { SeedAdapter } from '../adapters/seed-adapter';

export class RefreshService {
  private marketManager: MarketManager;

  constructor() {
    this.marketManager = new MarketManager();
    this.marketManager.registerAdapter(new SeedAdapter());
  }

  async runRefresh(db: D1Database) {
    console.log('Starting refresh cycle...');
    const data = await this.marketManager.fetchAll();
    
    const statements = [];
    
    for (const item of data) {
      statements.push(
        db.prepare(`
          INSERT INTO products (id, name, category, brand, image_url, package_size)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            category = excluded.category,
            brand = excluded.brand,
            image_url = excluded.image_url,
            package_size = excluded.package_size
        `).bind(
          item.product.id, 
          item.product.name, 
          item.product.category, 
          item.product.brand, 
          item.product.image_url, 
          item.product.package_size
        )
      );

      statements.push(
        db.prepare('DELETE FROM prices WHERE product_id = ? AND market_name = ?')
          .bind(item.product.id, item.offer.market_name)
      );

      statements.push(
        db.prepare(`
          INSERT INTO prices (product_id, market_name, price, promo_price, currency, stock_status, confidence_level, source_type, last_updated)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          item.product.id,
          item.offer.market_name,
          item.offer.price,
          item.offer.promo_price,
          item.offer.currency,
          item.offer.stock_status,
          item.offer.confidence_level,
          item.offer.source_type,
          new Date().toISOString()
        )
      );
    }

    statements.push(
      db.prepare("UPDATE system_metadata SET value = ? WHERE key = 'last_refresh'")
        .bind(new Date().toLocaleString('az-AZ'))
    );

    await db.batch(statements);
    console.log(`Refresh complete. Processed ${data.length} items.`);
    return data.length;
  }

  getAdapterStatus() {
    return this.marketManager.getAdapterStatus();
  }
}
