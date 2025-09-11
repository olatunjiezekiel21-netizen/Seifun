export interface TokenInfo {
  name: string;
  symbol: string;
  priceUsd: number;
  priceChange24h: number;
  liquidityUsd?: number;
  image?: string;
  url?: string;
  twitter?: string;
  website?: string;
}

export class TokenInfoService {
  private endpoint = '/.netlify/functions/token-info';

  async getInfo(query: string): Promise<TokenInfo> {
    const res = await fetch(`${this.endpoint}?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Token not found');
    return res.json();
  }
}

export const tokenInfoService = new TokenInfoService();

