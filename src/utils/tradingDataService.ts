// Real-time Trading Data Service
// Aggregates data from multiple sources for comprehensive token trading information

export interface TokenPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
    decimals?: number;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
    decimals?: number;
  };
  priceUsd: number;
  priceNative: number;
  volume24h: number;
  volume6h: number;
  volume1h: number;
  volume5m: number;
  priceChange24h: number;
  priceChange6h: number;
  priceChange1h: number;
  priceChange5m: number;
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  marketCap?: number;
  fdv?: number;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  pairCreatedAt?: number;
  url?: string;
  info?: {
    imageUrl?: string;
    websites?: Array<{ label: string; url: string }>;
    socials?: Array<{ type: string; url: string }>;
  };
}

export interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradingMetrics {
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  holders?: number;
  buys24h: number;
  sells24h: number;
  makers24h: number;
  topHolders?: Array<{
    address: string;
    balance: number;
    percentage: number;
  }>;
}

export interface RecentTrade {
  timestamp: number;
  type: 'buy' | 'sell';
  amount: number;
  amountUsd: number;
  price: number;
  maker: string;
  txHash: string;
}

export class TradingDataService {
  private readonly DEXSCREENER_API = 'https://api.dexscreener.com';
  private readonly GECKOTERMINAL_API = 'https://api.geckoterminal.com/api/v2';
  private readonly BITQUERY_API = 'https://graphql.bitquery.io';
  
  // API Keys (optional - fallback to free tiers)
  private readonly COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;
  private readonly MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API_KEY;
  private readonly BITQUERY_API_KEY = import.meta.env.VITE_BITQUERY_API_KEY;

  // Cache for reducing API calls
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_CACHE_TTL = 30000; // 30 seconds

  constructor() {
    console.log('🚀 TradingDataService initialized');
  }

  // Main method to get comprehensive token pair data
  async getTokenPairData(chainId: string, pairAddress: string): Promise<TokenPair | null> {
    const cacheKey = `pair_${chainId}_${pairAddress}`;
    
    // Check cache first
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // Try DexScreener first (most comprehensive free data)
      let pairData = await this.fetchFromDexScreener(chainId, pairAddress);
      
      if (!pairData) {
        // Fallback to GeckoTerminal
        pairData = await this.fetchFromGeckoTerminal(chainId, pairAddress);
      }

      if (pairData) {
        this.setCache(cacheKey, pairData, this.DEFAULT_CACHE_TTL);
        return pairData;
      }

      return null;
    } catch (error) {
      console.error('❌ Error fetching token pair data:', error);
      return null;
    }
  }

  // Get trending pairs by chain
  async getTrendingPairs(chainId: string = 'ethereum', limit: number = 20): Promise<TokenPair[]> {
    const cacheKey = `trending_${chainId}_${limit}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // Try DexScreener trending
      let pairs = await this.fetchTrendingFromDexScreener(chainId, limit);
      
      if (!pairs.length) {
        // Fallback to GeckoTerminal
        pairs = await this.fetchTrendingFromGeckoTerminal(chainId, limit);
      }

      this.setCache(cacheKey, pairs, 60000); // Cache for 1 minute
      return pairs;
    } catch (error) {
      console.error('❌ Error fetching trending pairs:', error);
      return [];
    }
  }

  // Get OHLCV chart data
  async getOHLCVData(
    chainId: string, 
    pairAddress: string, 
    timeframe: '5m' | '15m' | '1h' | '4h' | '1d' = '1h',
    limit: number = 100
  ): Promise<OHLCVData[]> {
    const cacheKey = `ohlcv_${chainId}_${pairAddress}_${timeframe}_${limit}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // Try GeckoTerminal for OHLCV (has good free OHLCV data)
      let ohlcvData = await this.fetchOHLCVFromGeckoTerminal(chainId, pairAddress, timeframe, limit);
      
      if (!ohlcvData.length && this.COINGECKO_API_KEY) {
        // Try CoinGecko Pro API if available
        ohlcvData = await this.fetchOHLCVFromCoinGecko(chainId, pairAddress, timeframe, limit);
      }

      this.setCache(cacheKey, ohlcvData, 60000); // Cache for 1 minute
      return ohlcvData;
    } catch (error) {
      console.error('❌ Error fetching OHLCV data:', error);
      return [];
    }
  }

  // Get recent trades
  async getRecentTrades(chainId: string, pairAddress: string, limit: number = 50): Promise<RecentTrade[]> {
    const cacheKey = `trades_${chainId}_${pairAddress}_${limit}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      let trades: RecentTrade[] = [];

      // Try Bitquery for recent trades (good free tier)
      if (this.BITQUERY_API_KEY) {
        trades = await this.fetchTradesFromBitquery(chainId, pairAddress, limit);
      }

      // Fallback to DexScreener (limited trade data)
      if (!trades.length) {
        trades = await this.fetchTradesFromDexScreener(chainId, pairAddress, limit);
      }

      this.setCache(cacheKey, trades, 15000); // Cache for 15 seconds
      return trades;
    } catch (error) {
      console.error('❌ Error fetching recent trades:', error);
      return [];
    }
  }

  // Get comprehensive trading metrics
  async getTradingMetrics(chainId: string, tokenAddress: string): Promise<TradingMetrics | null> {
    const cacheKey = `metrics_${chainId}_${tokenAddress}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // Combine data from multiple sources
      const [pairData, holderData] = await Promise.all([
        this.getTokenPairsForToken(chainId, tokenAddress),
        this.getTopHolders(chainId, tokenAddress)
      ]);

      if (!pairData.length) return null;

      // Aggregate metrics from all pairs
      const mainPair = pairData[0]; // Use the highest liquidity pair
      const metrics: TradingMetrics = {
        price: mainPair.priceUsd,
        priceChange24h: mainPair.priceChange24h,
        volume24h: pairData.reduce((sum, pair) => sum + pair.volume24h, 0),
        marketCap: mainPair.marketCap || 0,
        liquidity: pairData.reduce((sum, pair) => sum + pair.liquidity.usd, 0),
        buys24h: pairData.reduce((sum, pair) => sum + pair.txns.h24.buys, 0),
        sells24h: pairData.reduce((sum, pair) => sum + pair.txns.h24.sells, 0),
        makers24h: 0, // Will be calculated from trade data
        topHolders: holderData
      };

      this.setCache(cacheKey, metrics, 60000); // Cache for 1 minute
      return metrics;
    } catch (error) {
      console.error('❌ Error fetching trading metrics:', error);
      return null;
    }
  }

  // Get all pairs for a specific token
  async getTokenPairsForToken(chainId: string, tokenAddress: string): Promise<TokenPair[]> {
    const cacheKey = `token_pairs_${chainId}_${tokenAddress}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // Try DexScreener token endpoint
      let pairs = await this.fetchTokenPairsFromDexScreener(chainId, tokenAddress);
      
      if (!pairs.length) {
        // Try GeckoTerminal
        pairs = await this.fetchTokenPairsFromGeckoTerminal(chainId, tokenAddress);
      }

      // Sort by liquidity (highest first)
      pairs.sort((a, b) => b.liquidity.usd - a.liquidity.usd);

      this.setCache(cacheKey, pairs, 60000); // Cache for 1 minute
      return pairs;
    } catch (error) {
      console.error('❌ Error fetching token pairs:', error);
      return [];
    }
  }

  // Private methods for API calls

  private async fetchFromDexScreener(chainId: string, pairAddress: string): Promise<TokenPair | null> {
    try {
      const response = await fetch(`${this.DEXSCREENER_API}/latest/dex/pairs/${chainId}/${pairAddress}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      if (!data.pair) return null;

      return this.formatDexScreenerPair(data.pair);
    } catch (error) {
      console.error('❌ DexScreener API error:', error);
      return null;
    }
  }

  private async fetchFromGeckoTerminal(chainId: string, pairAddress: string): Promise<TokenPair | null> {
    try {
      const networkMap: { [key: string]: string } = {
        'ethereum': 'eth',
        'bsc': 'bsc',
        'polygon': 'polygon_pos',
        'arbitrum': 'arbitrum',
        'optimism': 'optimism',
        'base': 'base',
        'avalanche': 'avax',
        'fantom': 'ftm',
        'sei': 'sei' // Add Sei network
      };

      const network = networkMap[chainId] || chainId;
      const response = await fetch(`${this.GECKOTERMINAL_API}/networks/${network}/pools/${pairAddress}`);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (!data.data) return null;

      return this.formatGeckoTerminalPair(data.data);
    } catch (error) {
      console.error('❌ GeckoTerminal API error:', error);
      return null;
    }
  }

  private async fetchTrendingFromDexScreener(chainId: string, limit: number): Promise<TokenPair[]> {
    try {
      const response = await fetch(`${this.DEXSCREENER_API}/latest/dex/search/?q=${chainId}&limit=${limit}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      if (!data.pairs) return [];

      return data.pairs.map((pair: any) => this.formatDexScreenerPair(pair)).filter(Boolean);
    } catch (error) {
      console.error('❌ DexScreener trending API error:', error);
      return [];
    }
  }

  private async fetchTrendingFromGeckoTerminal(chainId: string, limit: number): Promise<TokenPair[]> {
    try {
      const networkMap: { [key: string]: string } = {
        'ethereum': 'eth',
        'bsc': 'bsc',
        'polygon': 'polygon_pos',
        'arbitrum': 'arbitrum',
        'optimism': 'optimism',
        'base': 'base',
        'avalanche': 'avax',
        'fantom': 'ftm',
        'sei': 'sei'
      };

      const network = networkMap[chainId] || chainId;
      const response = await fetch(`${this.GECKOTERMINAL_API}/networks/${network}/trending_pools?page=1&include=base_token,quote_token`);
      
      if (!response.ok) return [];
      
      const data = await response.json();
      if (!data.data) return [];

      return data.data.slice(0, limit).map((pool: any) => this.formatGeckoTerminalPair(pool)).filter(Boolean);
    } catch (error) {
      console.error('❌ GeckoTerminal trending API error:', error);
      return [];
    }
  }

  private async fetchOHLCVFromGeckoTerminal(
    chainId: string, 
    pairAddress: string, 
    timeframe: string, 
    limit: number
  ): Promise<OHLCVData[]> {
    try {
      const networkMap: { [key: string]: string } = {
        'ethereum': 'eth',
        'bsc': 'bsc',
        'polygon': 'polygon_pos',
        'arbitrum': 'arbitrum',
        'optimism': 'optimism',
        'base': 'base',
        'avalanche': 'avax',
        'fantom': 'ftm',
        'sei': 'sei'
      };

      const timeframeMap: { [key: string]: string } = {
        '5m': 'minute',
        '15m': 'minute',
        '1h': 'hour',
        '4h': 'hour',
        '1d': 'day'
      };

      const network = networkMap[chainId] || chainId;
      const tf = timeframeMap[timeframe] || 'hour';
      
      let aggregate = 1;
      if (timeframe === '5m') aggregate = 5;
      if (timeframe === '15m') aggregate = 15;
      if (timeframe === '4h') aggregate = 4;

      const response = await fetch(
        `${this.GECKOTERMINAL_API}/networks/${network}/pools/${pairAddress}/ohlcv/${tf}?aggregate=${aggregate}&limit=${limit}`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      if (!data.data?.attributes?.ohlcv_list) return [];

      return data.data.attributes.ohlcv_list.map((item: any[]) => ({
        timestamp: item[0] * 1000, // Convert to milliseconds
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5])
      }));
    } catch (error) {
      console.error('❌ GeckoTerminal OHLCV API error:', error);
      return [];
    }
  }

  private async fetchOHLCVFromCoinGecko(
    chainId: string, 
    pairAddress: string, 
    timeframe: string, 
    limit: number
  ): Promise<OHLCVData[]> {
    if (!this.COINGECKO_API_KEY) return [];

    try {
      const networkMap: { [key: string]: string } = {
        'ethereum': 'eth',
        'bsc': 'bsc',
        'polygon': 'polygon_pos',
        'arbitrum': 'arbitrum',
        'optimism': 'optimism',
        'base': 'base',
        'avalanche': 'avax',
        'fantom': 'ftm'
      };

      const network = networkMap[chainId] || chainId;
      const response = await fetch(
        `https://pro-api.coingecko.com/api/v3/onchain/networks/${network}/pools/${pairAddress}/ohlcv/${timeframe}`,
        {
          headers: {
            'x-cg-pro-api-key': this.COINGECKO_API_KEY
          }
        }
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      if (!data.data?.attributes?.ohlcv_list) return [];

      return data.data.attributes.ohlcv_list.map((item: any[]) => ({
        timestamp: item[0] * 1000,
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5])
      }));
    } catch (error) {
      console.error('❌ CoinGecko OHLCV API error:', error);
      return [];
    }
  }

  private async fetchTradesFromBitquery(chainId: string, pairAddress: string, limit: number): Promise<RecentTrade[]> {
    if (!this.BITQUERY_API_KEY) return [];

    try {
      const query = `
        query RecentTrades($network: EthereumNetwork!, $address: String!, $limit: Int!) {
          ethereum(network: $network) {
            dexTrades(
              exchangeAddress: {is: $address}
              options: {limit: $limit, desc: "block.timestamp.time"}
            ) {
              block {
                timestamp {
                  time
                }
              }
              transaction {
                hash
              }
              buyCurrency {
                symbol
                address
              }
              sellCurrency {
                symbol
                address
              }
              buyAmount
              sellAmount
              buyAmountInUsd: buyAmount(in: USD)
              sellAmountInUsd: sellAmount(in: USD)
              maker: taker {
                address
              }
            }
          }
        }
      `;

      const variables = {
        network: chainId === 'ethereum' ? 'ethereum' : 'bsc',
        address: pairAddress,
        limit: limit
      };

      const response = await fetch(this.BITQUERY_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.BITQUERY_API_KEY
        },
        body: JSON.stringify({ query, variables })
      });

      if (!response.ok) return [];

      const data = await response.json();
      if (!data.data?.ethereum?.dexTrades) return [];

      return data.data.ethereum.dexTrades.map((trade: any) => ({
        timestamp: new Date(trade.block.timestamp.time).getTime(),
        type: trade.buyAmountInUsd > trade.sellAmountInUsd ? 'buy' : 'sell',
        amount: parseFloat(trade.buyAmount),
        amountUsd: parseFloat(trade.buyAmountInUsd),
        price: parseFloat(trade.sellAmount) / parseFloat(trade.buyAmount),
        maker: trade.maker.address,
        txHash: trade.transaction.hash
      }));
    } catch (error) {
      console.error('❌ Bitquery trades API error:', error);
      return [];
    }
  }

  private async fetchTradesFromDexScreener(chainId: string, pairAddress: string, limit: number): Promise<RecentTrade[]> {
    // DexScreener doesn't provide individual trade data in their free API
    // This would require scraping or paid services
    return [];
  }

  private async fetchTokenPairsFromDexScreener(chainId: string, tokenAddress: string): Promise<TokenPair[]> {
    try {
      const response = await fetch(`${this.DEXSCREENER_API}/latest/dex/tokens/${tokenAddress}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      if (!data.pairs) return [];

      return data.pairs
        .filter((pair: any) => pair.chainId === chainId)
        .map((pair: any) => this.formatDexScreenerPair(pair))
        .filter(Boolean);
    } catch (error) {
      console.error('❌ DexScreener token pairs API error:', error);
      return [];
    }
  }

  private async fetchTokenPairsFromGeckoTerminal(chainId: string, tokenAddress: string): Promise<TokenPair[]> {
    try {
      const networkMap: { [key: string]: string } = {
        'ethereum': 'eth',
        'bsc': 'bsc',
        'polygon': 'polygon_pos',
        'arbitrum': 'arbitrum',
        'optimism': 'optimism',
        'base': 'base',
        'avalanche': 'avax',
        'fantom': 'ftm',
        'sei': 'sei'
      };

      const network = networkMap[chainId] || chainId;
      const response = await fetch(`${this.GECKOTERMINAL_API}/networks/${network}/tokens/${tokenAddress}/pools?page=1`);
      
      if (!response.ok) return [];
      
      const data = await response.json();
      if (!data.data) return [];

      return data.data.map((pool: any) => this.formatGeckoTerminalPair(pool)).filter(Boolean);
    } catch (error) {
      console.error('❌ GeckoTerminal token pairs API error:', error);
      return [];
    }
  }

  private async getTopHolders(chainId: string, tokenAddress: string): Promise<Array<{address: string; balance: number; percentage: number}>> {
    // This would require paid APIs like Moralis, CoinGecko Pro, or Bitquery Pro
    // For now, return empty array
    return [];
  }

  // Format data from different APIs to unified structure

  private formatDexScreenerPair(pair: any): TokenPair {
    return {
      chainId: pair.chainId,
      dexId: pair.dexId,
      pairAddress: pair.pairAddress,
      baseToken: {
        address: pair.baseToken.address,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol
      },
      quoteToken: {
        address: pair.quoteToken.address,
        name: pair.quoteToken.name,
        symbol: pair.quoteToken.symbol
      },
      priceUsd: parseFloat(pair.priceUsd || '0'),
      priceNative: parseFloat(pair.priceNative || '0'),
      volume24h: pair.volume?.h24 || 0,
      volume6h: pair.volume?.h6 || 0,
      volume1h: pair.volume?.h1 || 0,
      volume5m: pair.volume?.m5 || 0,
      priceChange24h: pair.priceChange?.h24 || 0,
      priceChange6h: pair.priceChange?.h6 || 0,
      priceChange1h: pair.priceChange?.h1 || 0,
      priceChange5m: pair.priceChange?.m5 || 0,
      liquidity: {
        usd: pair.liquidity?.usd || 0,
        base: pair.liquidity?.base || 0,
        quote: pair.liquidity?.quote || 0
      },
      marketCap: pair.marketCap,
      fdv: pair.fdv,
      txns: {
        m5: { buys: pair.txns?.m5?.buys || 0, sells: pair.txns?.m5?.sells || 0 },
        h1: { buys: pair.txns?.h1?.buys || 0, sells: pair.txns?.h1?.sells || 0 },
        h6: { buys: pair.txns?.h6?.buys || 0, sells: pair.txns?.h6?.sells || 0 },
        h24: { buys: pair.txns?.h24?.buys || 0, sells: pair.txns?.h24?.sells || 0 }
      },
      pairCreatedAt: pair.pairCreatedAt,
      url: pair.url,
      info: pair.info
    };
  }

  private formatGeckoTerminalPair(pool: any): TokenPair {
    const attributes = pool.attributes;
    const relationships = pool.relationships;
    
    return {
      chainId: attributes.network || 'unknown',
      dexId: attributes.dex_id || 'unknown',
      pairAddress: attributes.address,
      baseToken: {
        address: relationships?.base_token?.data?.id?.split('_')[1] || '',
        name: attributes.base_token_name || '',
        symbol: attributes.base_token_symbol || ''
      },
      quoteToken: {
        address: relationships?.quote_token?.data?.id?.split('_')[1] || '',
        name: attributes.quote_token_name || '',
        symbol: attributes.quote_token_symbol || ''
      },
      priceUsd: parseFloat(attributes.base_token_price_usd || '0'),
      priceNative: parseFloat(attributes.base_token_price_native_currency || '0'),
      volume24h: parseFloat(attributes.volume_usd?.h24 || '0'),
      volume6h: parseFloat(attributes.volume_usd?.h6 || '0'),
      volume1h: parseFloat(attributes.volume_usd?.h1 || '0'),
      volume5m: parseFloat(attributes.volume_usd?.m5 || '0'),
      priceChange24h: parseFloat(attributes.price_change_percentage?.h24 || '0'),
      priceChange6h: parseFloat(attributes.price_change_percentage?.h6 || '0'),
      priceChange1h: parseFloat(attributes.price_change_percentage?.h1 || '0'),
      priceChange5m: parseFloat(attributes.price_change_percentage?.m5 || '0'),
      liquidity: {
        usd: parseFloat(attributes.reserve_in_usd || '0'),
        base: 0, // Not provided by GeckoTerminal
        quote: 0 // Not provided by GeckoTerminal
      },
      marketCap: parseFloat(attributes.market_cap_usd || '0'),
      fdv: parseFloat(attributes.fdv_usd || '0'),
      txns: {
        m5: { 
          buys: parseInt(attributes.transactions?.m5?.buys || '0'), 
          sells: parseInt(attributes.transactions?.m5?.sells || '0') 
        },
        h1: { 
          buys: parseInt(attributes.transactions?.h1?.buys || '0'), 
          sells: parseInt(attributes.transactions?.h1?.sells || '0') 
        },
        h6: { 
          buys: parseInt(attributes.transactions?.h6?.buys || '0'), 
          sells: parseInt(attributes.transactions?.h6?.sells || '0') 
        },
        h24: { 
          buys: parseInt(attributes.transactions?.h24?.buys || '0'), 
          sells: parseInt(attributes.transactions?.h24?.sells || '0') 
        }
      },
      pairCreatedAt: new Date(attributes.pool_created_at).getTime(),
      url: `https://www.geckoterminal.com/${attributes.network}/pools/${attributes.address}`
    };
  }

  // Cache management
  private isValidCache(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    return Date.now() - cached.timestamp < cached.ttl;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Utility methods
  formatNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  }

  formatPrice(price: number): string {
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.01) return price.toFixed(6);
    return price.toFixed(8);
  }

  formatPercentage(percentage: number): string {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  }
}

// Export singleton instance
export const tradingDataService = new TradingDataService();