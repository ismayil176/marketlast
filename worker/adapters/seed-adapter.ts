import { MarketAdapter } from './market-manager';
import { Product, PriceOffer } from '../../src/types';

export class SeedAdapter implements MarketAdapter {
  name = 'Seed Data System';
  type = 'internal';

  async fetchData(): Promise<{ product: Product; offer: PriceOffer }[]> {
    const products: Product[] = [
      { id: 'coca-cola-1l', name: 'Coca-Cola 1L', category: 'İçkilər', brand: 'Coca-Cola', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400', package_size: '1L' },
      { id: 'sirab-1-5l', name: 'Sirab 1.5L', category: 'İçkilər', brand: 'Sirab', image_url: 'https://images.unsplash.com/photo-1548919973-5dea5846f669?w=400', package_size: '1.5L' },
      { id: 'milla-sud-1l', name: 'Milla Süd 1L', category: 'Süd məhsulları', brand: 'Milla', image_url: 'https://images.unsplash.com/photo-1563636619-e9107da5a1bb?w=400', package_size: '1L' },
      { id: 'atena-qatiq-500g', name: 'Atena Qatıq 500g', category: 'Süd məhsulları', brand: 'Atena', image_url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400', package_size: '500g' },
      { id: 'final-yag-1l', name: 'Final Günəbaxan Yağı 1L', category: 'Yağlar', brand: 'Final', image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', package_size: '1L' },
      { id: 'azersun-qend-1kg', name: 'Azərsun Qənd 1kg', category: 'Baqallıq', brand: 'Azərsun', image_url: 'https://images.unsplash.com/photo-1581447100595-3a813599346f?w=400', package_size: '1kg' },
      { id: 'azercay-100g', name: 'Azərçay 100g', category: 'Çay və Qəhvə', brand: 'Azərçay', image_url: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400', package_size: '100g' },
      { id: 'yumurta-10', name: 'Yumurta 10 ədəd', category: 'Təzə qida', brand: 'Yerli', image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400', package_size: '10 ədəd' },
      { id: 'ariel-3kg', name: 'Ariel 3kg', category: 'Təmizlik', brand: 'Ariel', image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', package_size: '3kg' },
      { id: 'lays-150g', name: 'Lays 150g', category: 'Qəlyanaltı', brand: 'Lays', image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', package_size: '150g' },
    ];

    const markets = ['Araz', 'Bazarstore', 'Bolmart', 'Bravo'];
    const results: { product: Product; offer: PriceOffer }[] = [];

    for (const product of products) {
      // Each product gets 2-4 offers
      const numOffers = Math.floor(Math.random() * 3) + 2;
      const selectedMarkets = [...markets].sort(() => 0.5 - Math.random()).slice(0, numOffers);

      for (const market of selectedMarkets) {
        const basePrice = 1 + Math.random() * 10;
        const hasPromo = Math.random() > 0.7;
        
        results.push({
          product,
          offer: {
            product_id: product.id,
            market_name: market,
            price: parseFloat(basePrice.toFixed(2)),
            promo_price: hasPromo ? parseFloat((basePrice * 0.8).toFixed(2)) : undefined,
            currency: 'AZN',
            stock_status: Math.random() > 0.1 ? 'in_stock' : 'out_of_stock',
            confidence_level: 'high',
            source_type: 'online',
            last_updated: new Date().toISOString()
          }
        });
      }
    }

    return results;
  }
}
