import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, MapPin, Navigation } from 'lucide-react';
import { ProductWithOffers, StoreLocation } from '../types';
import { formatPrice, getProxyImageUrl } from '../utils';
import { motion } from 'motion/react';

function buildDirectionsUrl(store: StoreLocation) {
  return `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}&travelmode=driving`;
}

const ProductCard: React.FC<{ product: ProductWithOffers }> = ({ product }) => {
  const cheapestOffer = product.offers.reduce((prev, curr) =>
    (curr.promo_price || curr.price) < (prev.promo_price || prev.price) ? curr : prev,
  );

  const displayPrice = cheapestOffer.promo_price || cheapestOffer.price;
  const hasPromo = Boolean(cheapestOffer.promo_price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
    >
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={getProxyImageUrl(product.image_url)}
          alt={product.name}
          className="w-full h-full object-contain p-4"
          referrerPolicy="no-referrer"
        />
        {hasPromo && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            Endirim
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</span>
          <span className="text-[10px] font-medium text-slate-500">{product.package_size}</span>
        </div>

        <Link to={`/product/${product.id}`} className="block group">
          <h3 className="font-bold text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 h-10">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mb-2">{product.brand}</p>
        </Link>

        {product.nearest_store && (
          <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
              <MapPin size={12} />
              <span>Sizə ən yaxın filial</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{product.nearest_store.branch_name}</p>
                <p className="text-[10px] text-slate-500">{product.distance_km} km məsafədə</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/product/${product.id}`}
                  className="bg-white text-blue-600 border border-blue-200 px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Ətraflı
                </Link>
                <a
                  href={buildDirectionsUrl(product.nearest_store)}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-900 text-white px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  <Navigation size={12} /> Yol
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-50">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Ən ucuz qiymət</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-blue-600">{formatPrice(displayPrice)}</span>
                {hasPromo && <span className="text-xs text-slate-400 line-through">{formatPrice(cheapestOffer.price)}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <ShoppingCart size={12} />
                {cheapestOffer.market_name}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{product.offers.length} marketdə</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
