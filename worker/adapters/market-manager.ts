import { Product, PriceOffer } from '../../src/types';

export interface MarketAdapter {
  name: string;
  type: string;
  fetchData(): Promise<{ product: Product; offer: PriceOffer }[]>;
}

export class MarketManager {
  private adapters: MarketAdapter[] = [];

  registerAdapter(adapter: MarketAdapter) {
    this.adapters.push(adapter);
  }

  async fetchAll() {
    const allData = [];
    for (const adapter of this.adapters) {
      try {
        const data = await adapter.fetchData();
        allData.push(...data);
      } catch (err) {
        console.error(`Error fetching from ${adapter.name}:`, err);
      }
    }
    return allData;
  }

  getAdapterStatus() {
    return this.adapters.map(a => ({
      name: a.name,
      status: 'active' as const,
      type: a.type
    }));
  }
}
