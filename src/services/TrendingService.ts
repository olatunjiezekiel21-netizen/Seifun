export interface TrendingItem {
  name: string;
  symbol: string;
  priceUsd: number;
  priceChange24h: number;
  liquidityUsd?: number;
  url?: string;
  chainId?: string;
}

export class TrendingService {
  private endpoint = '/.netlify/functions/trending-pairs';

  async getTrending(): Promise<TrendingItem[]> {
    const res = await fetch(this.endpoint);
    if (!res.ok) throw new Error('Failed to fetch trending pairs');
    const data = await res.json();
    return data.items as TrendingItem[];
  }
}

export const trendingService = new TrendingService();

