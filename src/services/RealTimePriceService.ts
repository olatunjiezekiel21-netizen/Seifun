import { ethers } from 'ethers';

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface PriceUpdate {
  symbol: string;
  oldPrice: number;
  newPrice: number;
  change: number;
  changePercent: number;
}

class RealTimePriceService {
  private provider: ethers.JsonRpcProvider | null = null;
  private isInitialized = false;
  private priceCache: Map<string, TokenPrice> = new Map();
  private updateCallbacks: ((update: PriceUpdate) => void)[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  // DEX contract addresses for price feeds
  private dexAddresses = {
    // Replace with actual DEX contract addresses on Sei EVM testnet
    router: '0x1234567890123456789012345678901234567890',
    factory: '0x1234567890123456789012345678901234567890',
    pair: '0x1234567890123456789012345678901234567890'
  };

  // DEX ABI for getting reserves and calculating prices
  private pairAbi = [
    'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)'
  ];

  async initialize(): Promise<boolean> {
    try {
      const rpcUrl = import.meta.env.VITE_SEI_TESTNET_RPC_URL;
      
      if (!rpcUrl) {
        console.error('Missing RPC URL for price service');
        return false;
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Test connection
      const blockNumber = await this.provider.getBlockNumber();
      console.log('Connected to Sei EVM testnet, block:', blockNumber);

      this.isInitialized = true;
      
      // Start real-time price updates
      this.startPriceUpdates();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize price service:', error);
      return false;
    }
  }

  private startPriceUpdates(): void {
    // Update prices every 10 seconds
    this.updateInterval = setInterval(async () => {
      await this.updateAllPrices();
    }, 10000);
  }

  private async updateAllPrices(): Promise<void> {
    try {
      // Get SEI/USDC pair price
      const seiPrice = await this.getSEIPrice();
      const oldSeiPrice = this.priceCache.get('SEI')?.price || 0;
      
      if (seiPrice) {
        const seiPriceData: TokenPrice = {
          symbol: 'SEI',
          price: seiPrice,
          change24h: -6.88, // This would come from historical data
          volume24h: 1000000, // This would come from DEX volume
          marketCap: 250000000, // This would be calculated
          lastUpdated: new Date()
        };

        this.priceCache.set('SEI', seiPriceData);

        // Notify subscribers of price change
        if (oldSeiPrice !== 0 && oldSeiPrice !== seiPrice) {
          const update: PriceUpdate = {
            symbol: 'SEI',
            oldPrice: oldSeiPrice,
            newPrice: seiPrice,
            change: seiPrice - oldSeiPrice,
            changePercent: ((seiPrice - oldSeiPrice) / oldSeiPrice) * 100
          };
          this.notifyPriceUpdate(update);
        }
      }

      // USDC price is stable
      const usdcPriceData: TokenPrice = {
        symbol: 'USDC',
        price: 1.00,
        change24h: 0.10,
        volume24h: 5000000,
        marketCap: 1000000000,
        lastUpdated: new Date()
      };
      this.priceCache.set('USDC', usdcPriceData);

    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  }

  private async getSEIPrice(): Promise<number> {
    try {
      if (!this.provider) return 0.25; // Fallback price

      // This would integrate with actual DEX contracts to get real-time SEI price
      // For now, we'll simulate price movement around $0.25
      const basePrice = 0.25;
      const volatility = 0.02; // 2% volatility
      const randomChange = (Math.random() - 0.5) * volatility;
      const newPrice = basePrice * (1 + randomChange);
      
      return Math.max(0.01, newPrice); // Minimum price of $0.01
    } catch (error) {
      console.error('Failed to get SEI price:', error);
      return 0.25; // Fallback price
    }
  }

  async getTokenPrice(symbol: string): Promise<TokenPrice | null> {
    if (!this.isInitialized) {
      throw new Error('Price service not initialized');
    }

    return this.priceCache.get(symbol) || null;
  }

  async getAllPrices(): Promise<TokenPrice[]> {
    if (!this.isInitialized) {
      throw new Error('Price service not initialized');
    }

    return Array.from(this.priceCache.values());
  }

  subscribeToPriceUpdates(callback: (update: PriceUpdate) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  private notifyPriceUpdate(update: PriceUpdate): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in price update callback:', error);
      }
    });
  }

  // Get price change indicator
  getPriceChangeIndicator(change24h: number): { emoji: string; color: string; text: string } {
    if (change24h > 5) {
      return { emoji: '🚀', color: 'text-green-500', text: 'Strong Buy' };
    } else if (change24h > 2) {
      return { emoji: '📈', color: 'text-green-500', text: 'Buy' };
    } else if (change24h > 0) {
      return { emoji: '🟢', color: 'text-green-500', text: 'Hold' };
    } else if (change24h > -2) {
      return { emoji: '🟡', color: 'text-yellow-500', text: 'Watch' };
    } else if (change24h > -5) {
      return { emoji: '📉', color: 'text-red-500', text: 'Sell' };
    } else {
      return { emoji: '🔴', color: 'text-red-500', text: 'Strong Sell' };
    }
  }

  // Get trading suggestion based on price action
  getTradingSuggestion(symbol: string, change24h: number): string {
    const indicator = this.getPriceChangeIndicator(change24h);
    
    switch (symbol) {
      case 'SEI':
        if (change24h > 0) {
          return `${indicator.emoji} ${indicator.text} - Consider staking for 12% APY`;
        } else {
          return `${indicator.emoji} ${indicator.text} - Good entry point for accumulation`;
        }
      case 'USDC':
        if (change24h > 0) {
          return `${indicator.emoji} ${indicator.text} - Excellent for lending at 8% APY`;
        } else {
          return `${indicator.emoji} ${indicator.text} - Stable store of value`;
        }
      default:
        return `${indicator.emoji} ${indicator.text}`;
    }
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  isServiceReady(): boolean {
    return this.isInitialized;
  }
}

export const realTimePriceService = new RealTimePriceService();