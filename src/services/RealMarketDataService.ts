// Real Market Data Service - No Mock Data
// Fetches actual market data from multiple sources

export interface RealMarketData {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  marketCapRank?: number;
  circulatingSupply?: number;
  totalSupply: number;
  maxSupply?: number;
  ath?: number;
  atl?: number;
  athChange?: number;
  atlChange?: number;
  lastUpdated: number;
  source: 'coingecko' | 'dexscreener' | 'multiple';
}

export interface TokenPriceHistory {
  timestamp: number;
  price: number;
  volume: number;
}

export interface LiquidityData {
  totalLiquidity: number;
  liquidityChange24h: number;
  topPairs: Array<{
    pair: string;
    exchange: string;
    liquidity: number;
    volume24h: number;
    price: number;
  }>;
}

export class RealMarketDataService {
  private readonly COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;
  private readonly DEXSCREENER_API_KEY = import.meta.env.VITE_DEXSCREENER_API_KEY;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private cache = new Map<string, { data: any; timestamp: number }>();

  /**
   * Get comprehensive market data for a token
   */
  async getMarketData(tokenAddress: string, symbol?: string): Promise<RealMarketData> {
    const cacheKey = `market_${tokenAddress}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Try multiple sources in parallel
      const [coingeckoData, dexScreenerData] = await Promise.allSettled([
        this.fetchCoinGeckoData(tokenAddress),
        this.fetchDexScreenerData(tokenAddress)
      ]);

      let marketData: RealMarketData;

      if (coingeckoData.status === 'fulfilled' && coingeckoData.value) {
        marketData = coingeckoData.value;
        marketData.source = 'coingecko';
      } else if (dexScreenerData.status === 'fulfilled' && dexScreenerData.value) {
        marketData = dexScreenerData.value;
        marketData.source = 'dexscreener';
      } else {
        throw new Error('No market data available from any source');
      }

      // If we have data from both sources, merge for better accuracy
      if (coingeckoData.status === 'fulfilled' && dexScreenerData.status === 'fulfilled') {
        marketData = this.mergeMarketData(coingeckoData.value, dexScreenerData.value);
        marketData.source = 'multiple';
      }

      this.setCachedData(cacheKey, marketData);
      return marketData;
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      throw new Error(`Market data unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch data from CoinGecko API
   */
  private async fetchCoinGeckoData(tokenAddress: string): Promise<RealMarketData | null> {
    try {
      const headers: Record<string, string> = {
        'accept': 'application/json',
      };
      
      if (this.COINGECKO_API_KEY) {
        headers['X-CG-Pro-API-Key'] = this.COINGECKO_API_KEY;
      }

      const url = `https://api.coingecko.com/api/v3/coins/sei-network/contract/${tokenAddress.toLowerCase()}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Token not found on CoinGecko');
        }
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const marketData = data.market_data;

      if (!marketData) {
        throw new Error('No market data available from CoinGecko');
      }

      return {
        price: marketData.current_price?.usd || 0,
        marketCap: marketData.market_cap?.usd || 0,
        volume24h: marketData.total_volume?.usd || 0,
        priceChange24h: marketData.price_change_percentage_24h || 0,
        priceChange7d: marketData.price_change_percentage_7d || 0,
        priceChange30d: marketData.price_change_percentage_30d || 0,
        marketCapRank: marketData.market_cap_rank,
        circulatingSupply: marketData.circulating_supply,
        totalSupply: marketData.total_supply || 0,
        maxSupply: marketData.max_supply,
        ath: marketData.ath?.usd,
        atl: marketData.atl?.usd,
        athChange: marketData.ath_change_percentage?.usd,
        atlChange: marketData.atl_change_percentage?.usd,
        lastUpdated: Date.now(),
        source: 'coingecko'
      };
    } catch (error) {
      console.error('CoinGecko fetch failed:', error);
      return null;
    }
  }

  /**
   * Fetch data from DexScreener API
   */
  private async fetchDexScreenerData(tokenAddress: string): Promise<RealMarketData | null> {
    try {
      const headers: Record<string, string> = {
        'accept': 'application/json',
      };
      
      if (this.DEXSCREENER_API_KEY) {
        headers['Authorization'] = `Bearer ${this.DEXSCREENER_API_KEY}`;
      }

      const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.pairs || data.pairs.length === 0) {
        throw new Error('No trading pairs found on DexScreener');
      }

      // Use the pair with highest liquidity
      const bestPair = data.pairs.reduce((best: any, current: any) => {
        return (current.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? current : best;
      });

      const price = parseFloat(bestPair.priceUsd) || 0;
      const totalSupply = parseFloat(bestPair.info?.totalSupply) || 0;
      const marketCap = price * totalSupply;

      return {
        price,
        marketCap,
        volume24h: parseFloat(bestPair.volume?.h24) || 0,
        priceChange24h: parseFloat(bestPair.priceChange?.h24) || 0,
        priceChange7d: parseFloat(bestPair.priceChange?.h6) || 0, // Approximate 7d from 6h
        priceChange30d: 0, // Not available from DexScreener
        totalSupply,
        lastUpdated: Date.now(),
        source: 'dexscreener'
      };
    } catch (error) {
      console.error('DexScreener fetch failed:', error);
      return null;
    }
  }

  /**
   * Merge data from multiple sources for better accuracy
   */
  private mergeMarketData(coingecko: RealMarketData, dexScreener: RealMarketData): RealMarketData {
    return {
      price: this.averageValues(coingecko.price, dexScreener.price),
      marketCap: coingecko.marketCap || dexScreener.marketCap,
      volume24h: Math.max(coingecko.volume24h, dexScreener.volume24h),
      priceChange24h: this.averageValues(coingecko.priceChange24h, dexScreener.priceChange24h),
      priceChange7d: coingecko.priceChange7d || 0,
      priceChange30d: coingecko.priceChange30d || 0,
      marketCapRank: coingecko.marketCapRank,
      circulatingSupply: coingecko.circulatingSupply,
      totalSupply: coingecko.totalSupply || dexScreener.totalSupply,
      maxSupply: coingecko.maxSupply,
      ath: coingecko.ath,
      atl: coingecko.atl,
      athChange: coingecko.athChange,
      atlChange: coingecko.atlChange,
      lastUpdated: Date.now(),
      source: 'multiple'
    };
  }

  /**
   * Get price history for a token
   */
  async getPriceHistory(tokenAddress: string, days: number = 30): Promise<TokenPriceHistory[]> {
    const cacheKey = `history_${tokenAddress}_${days}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const headers: Record<string, string> = {
        'accept': 'application/json',
      };
      
      if (this.COINGECKO_API_KEY) {
        headers['X-CG-Pro-API-Key'] = this.COINGECKO_API_KEY;
      }

      const url = `https://api.coingecko.com/api/v3/coins/sei-network/contract/${tokenAddress.toLowerCase()}/market_chart?vs_currency=usd&days=${days}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.prices || data.prices.length === 0) {
        throw new Error('No price history available');
      }

      const priceHistory: TokenPriceHistory[] = data.prices.map((price: [number, number], index: number) => ({
        timestamp: price[0],
        price: price[1],
        volume: data.total_volumes?.[index]?.[1] || 0
      }));

      this.setCachedData(cacheKey, priceHistory);
      return priceHistory;
    } catch (error) {
      console.error('Failed to fetch price history:', error);
      throw new Error(`Price history unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get liquidity data for a token
   */
  async getLiquidityData(tokenAddress: string): Promise<LiquidityData> {
    try {
      const headers: Record<string, string> = {
        'accept': 'application/json',
      };
      
      if (this.DEXSCREENER_API_KEY) {
        headers['Authorization'] = `Bearer ${this.DEXSCREENER_API_KEY}`;
      }

      const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.pairs || data.pairs.length === 0) {
        return {
          totalLiquidity: 0,
          liquidityChange24h: 0,
          topPairs: []
        };
      }

      const totalLiquidity = data.pairs.reduce((sum: number, pair: any) => 
        sum + (parseFloat(pair.liquidity?.usd) || 0), 0
      );

      const topPairs = data.pairs
        .filter((pair: any) => pair.liquidity?.usd > 0)
        .sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))
        .slice(0, 5)
        .map((pair: any) => ({
          pair: pair.pairAddress,
          exchange: pair.dexId,
          liquidity: parseFloat(pair.liquidity?.usd) || 0,
          volume24h: parseFloat(pair.volume?.h24) || 0,
          price: parseFloat(pair.priceUsd) || 0
        }));

      return {
        totalLiquidity,
        liquidityChange24h: 0, // Not available from DexScreener
        topPairs
      };
    } catch (error) {
      console.error('Failed to fetch liquidity data:', error);
      throw new Error(`Liquidity data unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get multiple tokens market data
   */
  async getMultipleTokensData(tokenAddresses: string[]): Promise<Map<string, RealMarketData>> {
    const results = new Map<string, RealMarketData>();
    
    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < tokenAddresses.length; i += batchSize) {
      const batch = tokenAddresses.slice(i, i + batchSize);
      const promises = batch.map(async (address) => {
        try {
          const data = await this.getMarketData(address);
          results.set(address, data);
        } catch (error) {
          console.error(`Failed to fetch data for ${address}:`, error);
        }
      });
      
      await Promise.allSettled(promises);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < tokenAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Cache management
   */
  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Helper method to average two values
   */
  private averageValues(value1: number, value2: number): number {
    if (value1 === 0) return value2;
    if (value2 === 0) return value1;
    return (value1 + value2) / 2;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const realMarketDataService = new RealMarketDataService();