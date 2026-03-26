export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  image_url: string;
  package_size?: string;
  created_at?: string;
}

export interface PriceOffer {
  id?: number;
  product_id: string;
  market_name: string;
  price: number;
  promo_price?: number;
  currency: string;
  stock_status: 'in_stock' | 'out_of_stock' | 'unknown';
  confidence_level: 'high' | 'medium' | 'low' | 'unknown';
  source_type: 'online' | 'in_store' | 'manual';
  last_updated: string;
  nearest_store?: StoreLocation;
  distance_km?: number;
}

export interface StoreLocation {
  id: string;
  market_name: string;
  branch_name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  place_id?: string;
}

export interface ProductWithOffers extends Product {
  offers: PriceOffer[];
  min_price: number;
  nearest_store?: StoreLocation | null;
  distance_km?: number | null;
}

export interface AdminStatus {
  productCount: number;
  priceCount: number;
  lastUpdate: string;
  adapters: {
    name: string;
    status: 'active' | 'inactive';
    type: string;
  }[];
}
