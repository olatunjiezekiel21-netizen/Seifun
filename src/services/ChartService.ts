// Chart Service - Integrates with real market data APIs
// This service provides real-time price data and chart information

import { realMarketDataService, RealMarketData } from './RealMarketDataService';
import { technicalAnalysisService, PriceData } from './TechnicalAnalysisService';

export interface TokenPrice {
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartTimeframe {
  id: string;
  label: string;
  interval: number; // in milliseconds
  dataPoints: number;
}

export class ChartService {
  private static instance: ChartService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  public static getInstance(): ChartService {
    if (!ChartService.instance) {
      ChartService.instance = new ChartService();
    }
    return ChartService.instance;
  }

  // Available timeframes
  public static readonly TIMEFRAMES: ChartTimeframe[] = [
    { id: '1H', label: '1 Hour', interval: 5 * 60 * 1000, dataPoints: 60 },
    { id: '4H', label: '4 Hours', interval: 15 * 60 * 1000, dataPoints: 80 },
    { id: '1D', label: '1 Day', interval: 60 * 60 * 1000, dataPoints: 100 },
    { id: '1W', label: '1 Week', interval: 4 * 60 * 60 * 1000, dataPoints: 120 },
    { id: '1M', label: '1 Month', interval: 24 * 60 * 60 * 1000, dataPoints: 150 }
  ];

  /**
   * Get real-time token price from CoinGecko (free tier)
   */
  async getTokenPrice(symbol: string): Promise<TokenPrice | null> {
    try {
      const cacheKey = `price_${symbol}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      // CoinGecko free API endpoint
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${this.getCoinGeckoId(symbol)}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const tokenData = data[this.getCoinGeckoId(symbol)];

      if (!tokenData) {
        throw new Error(`Token ${symbol} not found`);
      }

      const price: TokenPrice = {
        symbol: symbol.toUpperCase(),
        price: tokenData.usd,
        priceChange24h: tokenData.usd_24h_change || 0,
        priceChangePercent24h: tokenData.usd_24h_change || 0,
        volume24h: tokenData.usd_24h_vol || 0,
        marketCap: tokenData.usd_market_cap || 0,
        lastUpdated: new Date()
      };

      this.cacheData(cacheKey, price);
      return price;

    } catch (error) {
      console.error(`Failed to get price for ${symbol}:`, error);
      
      throw new Error(`Price data unavailable for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get historical chart data from CoinGecko (free tier)
   */
  async getChartData(symbol: string, timeframe: string): Promise<ChartDataPoint[]> {
    try {
      const cacheKey = `chart_${symbol}_${timeframe}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      // Convert timeframe to days for CoinGecko
      const days = this.timeframeToDays(timeframe);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${this.getCoinGeckoId(symbol)}/ohlc?vs_currency=usd&days=${days}`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko chart API error: ${response.status}`);
      }

      const data = await response.json();
      
      const chartData: ChartDataPoint[] = data.map((point: number[]) => ({
        timestamp: point[0],
        open: point[1],
        high: point[2],
        low: point[3],
        close: point[4],
        volume: 0 // CoinGecko OHLC doesn't include volume
      }));

      this.cacheData(cacheKey, chartData);
      return chartData;

    } catch (error) {
      console.error(`Failed to get chart data for ${symbol}:`, error);
      
      throw new Error(`Chart data unavailable for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get multiple token prices for portfolio view
   */
  async getMultipleTokenPrices(symbols: string[]): Promise<TokenPrice[]> {
    try {
      const prices = await Promise.all(
        symbols.map(symbol => this.getTokenPrice(symbol))
      );
      
      return prices.filter(price => price !== null) as TokenPrice[];
    } catch (error) {
      console.error('Failed to get multiple token prices:', error);
      return [];
    }
  }

  /**
   * Search for tokens by name or symbol
   */
  async searchTokens(query: string): Promise<Array<{ id: string; symbol: string; name: string }>> {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko search API error: ${response.status}`);
      }

      const data = await response.json();
      return data.coins.slice(0, 10).map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name
      }));

    } catch (error) {
      console.error('Failed to search tokens:', error);
      return [];
    }
  }

  /**
   * Get trending tokens
   */
  async getTrendingTokens(): Promise<TokenPrice[]> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/search/trending'
      );

      if (!response.ok) {
        throw new Error(`CoinGecko trending API error: ${response.status}`);
      }

      const data = await response.json();
      const trendingCoins = data.coins.slice(0, 7);
      
      const prices = await Promise.all(
        trendingCoins.map((coin: any) => 
          this.getTokenPrice(coin.item.symbol)
        )
      );
      
      return prices.filter(price => price !== null) as TokenPrice[];

    } catch (error) {
      console.error('Failed to get trending tokens:', error);
      return [];
    }
  }

  // Helper methods

  private getCoinGeckoId(symbol: string): string {
    // Map common symbols to CoinGecko IDs
    const symbolMap: { [key: string]: string } = {
      'SEI': 'sei-network',
      'USDC': 'usd-coin',
      'USDT': 'tether',
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'MATIC': 'matic-network',
      'LINK': 'chainlink'
    };
    
    return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  private timeframeToDays(timeframe: string): number {
    const timeframeMap: { [key: string]: number } = {
      '1H': 1,
      '4H': 1,
      '1D': 1,
      '1W': 7,
      '1M': 30
    };
    
    return timeframeMap[timeframe] || 1;
  }

  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private cacheData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Real data only - no mock data

  // Mock data methods removed - using real data only

  // Clear cache (useful for testing)
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const chartService = ChartService.getInstance();