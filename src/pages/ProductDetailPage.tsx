import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Clock,
  ShieldCheck,
  TrendingDown,
  MapPin,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { ProductWithOffers, StoreLocation } from '../types';
import { formatPrice, getProxyImageUrl, cn } from '../utils';
import { SkeletonDetail } from '../components/Skeleton';
import { motion } from 'motion/react';
import { useGeolocation } from '../hooks/useGeolocation';

function buildDirectionsUrl(store: StoreLocation, latitude: number | null, longitude: number | null) {
  const destination = `${store.latitude},${store.longitude}`;
  if (latitude !== null && longitude !== null) {
    return `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destination}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
}

function buildMapUrl(store: StoreLocation) {
  const query = encodeURIComponent(`${store.branch_name}, ${store.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { latitude, longitude, loading: geoLoading, error: geoError } = useGeolocation();
  const [product, setProduct] = React.useState<ProductWithOffers | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedStore, setSelectedStore] = React.useState<StoreLocation | undefined>(undefined);

  React.useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const query = latitude !== null && longitude !== null ? `?lat=${latitude}&lng=${longitude}` : '';
        const response = await fetch(`/api/products/${id}${query}`);
        if (!response.ok) throw new Error('Məhsul tapılmadı');
        const data = (await response.json()) as ProductWithOffers;
        setProduct(data);

        if (data.offers[0]?.nearest_store) {
          setSelectedStore(data.offers[0].nearest_store);
        }
      } catch (err: any) {
        setError(err.message || 'Məhsul məlumatı yüklənmədi');
      } finally {
        setLoading(false);
      }
    };

    if (!geoLoading) {
      void fetchProduct();
    }
  }, [id, latitude, longitude, geoLoading]);

  if (loading) return <SkeletonDetail />;
  if (error || !product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{error || 'Məhsul tapılmadı'}</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 font-bold flex items-center gap-2 mx-auto">
          <ArrowLeft size={20} /> Geri qayıt
        </button>
      </div>
    );
  }

  const cheapestOffer = product.offers[0];
  const hasPromo = Boolean(cheapestOffer.promo_price);
  const allStores = product.offers.map((offer) => offer.nearest_store).filter((store): store is StoreLocation => Boolean(store));
  const uniqueStores = Array.from(new Map(allStores.map((store) => [store.id, store])).values());
  const activeStore = selectedStore ?? uniqueStores[0];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors"
      >
        <ArrowLeft size={18} /> Geri qayıt
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-slate-200 p-8 flex items-center justify-center aspect-square shadow-sm"
        >
          <img
            src={getProxyImageUrl(product.image_url)}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                {product.category}
              </span>
              <span className="text-slate-400 text-sm font-medium">{product.brand}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-2">{product.name}</h1>
            <p className="text-slate-500 font-medium">{product.package_size}</p>
          </div>

          <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <TrendingDown size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Ən yaxşı təklif</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black">{formatPrice(cheapestOffer.promo_price || cheapestOffer.price)}</span>
                {hasPromo && <span className="text-xl opacity-60 line-through">{formatPrice(cheapestOffer.price)}</span>}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <p className="text-xs opacity-70 font-medium">Market</p>
                    <p className="font-bold">{cheapestOffer.market_name}</p>
                  </div>
                </div>
                {cheapestOffer.distance_km !== null && cheapestOffer.distance_km !== undefined && (
                  <div className="text-right">
                    <p className="text-xs opacity-70 font-medium">Məsafə</p>
                    <p className="text-sm font-bold">{cheapestOffer.distance_km} km</p>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </div>

          {cheapestOffer.nearest_store && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ən yaxın filial</p>
                  <p className="font-bold text-slate-900">{cheapestOffer.nearest_store.branch_name}</p>
                  <p className="text-sm text-slate-500">{cheapestOffer.nearest_store.address}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedStore(cheapestOffer.nearest_store)}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors"
                >
                  <Navigation size={14} /> Filiala bax
                </button>
                <a
                  href={buildDirectionsUrl(cheapestOffer.nearest_store, latitude, longitude)}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-100 transition-colors"
                >
                  <Navigation size={14} /> Yol tarifi aç
                </a>
                <a
                  href={buildMapUrl(cheapestOffer.nearest_store)}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors"
                >
                  <ExternalLink size={14} /> Xəritədə aç
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Yaxınlıqdakı filiallar</h2>
            <p className="text-sm text-slate-500 mt-1">
              {latitude !== null && longitude !== null
                ? 'Filiallar mövcud mövqeyinizə görə sıralanıb.'
                : 'Məsafə və yol tarifi üçün brauzerdə məkan icazəsini aktiv edin.'}
            </p>
          </div>
          {geoError && <span className="text-sm text-amber-600 font-medium">{geoError}</span>}
        </div>

        {uniqueStores.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Seçilmiş filial</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">
                    {activeStore?.branch_name ?? 'Filial seçin'}
                  </h3>
                  <p className="text-slate-500 mt-2">{activeStore?.address ?? 'Filial seçildikdən sonra ünvan burada görünəcək.'}</p>
                </div>
                {activeStore && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    <MapPin size={14} /> {activeStore.market_name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ünvan</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">{activeStore?.address ?? 'Filial seçin'}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Koordinatlar</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {activeStore ? `${activeStore.latitude}, ${activeStore.longitude}` : 'Filial seçin'}
                  </p>
                </div>
              </div>

              {activeStore && (
                <div className="flex flex-wrap gap-3">
                  <a
                    href={buildDirectionsUrl(activeStore, latitude, longitude)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                  >
                    <Navigation size={16} /> Yol tarifi aç
                  </a>
                  <a
                    href={buildMapUrl(activeStore)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <ExternalLink size={16} /> Xəritədə aç
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
              {product.offers.map((offer, idx) => (
                <div
                  key={`${offer.market_name}-${idx}`}
                  onClick={() => offer.nearest_store && setSelectedStore(offer.nearest_store)}
                  className={cn(
                    'p-4 rounded-2xl border cursor-pointer transition-all',
                    selectedStore?.id === offer.nearest_store?.id
                      ? 'border-blue-200 bg-blue-50/30 ring-1 ring-blue-100'
                      : 'border-slate-100 bg-white hover:border-slate-200',
                  )}
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{offer.market_name}</span>
                    <span className="text-lg font-black text-slate-900">
                      {formatPrice(offer.promo_price || offer.price)}
                    </span>
                  </div>
                  {offer.nearest_store ? (
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-700">{offer.nearest_store.branch_name}</p>
                      <p className="text-xs text-slate-500">{offer.nearest_store.address}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500 gap-3">
                        <span className="flex items-center gap-1">
                          <Navigation size={12} />
                          {offer.distance_km !== undefined && offer.distance_km !== null ? `${offer.distance_km} km` : 'Məsafə yoxdur'}
                        </span>
                        <a
                          href={buildDirectionsUrl(offer.nearest_store, latitude, longitude)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="font-bold text-blue-600 hover:text-blue-700"
                        >
                          Yol tarifi
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Filial məlumatı tapılmadı</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-700 font-bold">Filial məlumatı tapılmadı</p>
            <p className="text-sm text-slate-500 mt-2">Bu məhsul üçün hələ filial koordinatları əlavə edilməyib.</p>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">Bütün təkliflər</h2>
          <span className="text-sm text-slate-500 font-medium">{product.offers.length} market tapıldı</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {product.offers.map((offer, idx) => (
            <motion.div
              key={`${offer.market_name}-${idx}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                'bg-white rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all',
                idx === 0 ? 'border-blue-200 ring-2 ring-blue-50' : 'border-slate-100',
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{offer.market_name}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider',
                        offer.stock_status === 'in_stock' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600',
                      )}
                    >
                      {offer.stock_status === 'in_stock' ? 'Anbarda var' : 'Tükənib'}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <ShieldCheck size={12} />
                      {offer.confidence_level === 'high' ? 'Yüksək etibarlılıq' : 'Orta etibarlılıq'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Qiymət</p>
                  <div className="flex items-baseline gap-2">
                    {offer.promo_price && (
                      <span className="text-sm text-slate-400 line-through">{formatPrice(offer.price)}</span>
                    )}
                    <span className="text-2xl font-black text-slate-900">
                      {formatPrice(offer.promo_price || offer.price)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Son yenilənmə</p>
                  <p className="text-sm font-medium text-slate-600">{offer.last_updated}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
