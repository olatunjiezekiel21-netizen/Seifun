import { ethers } from 'ethers';

// Sei network configuration
export const SEI_NETWORKS = {
  mainnet: {
    rpc: 'https://evm-rpc.sei-apis.com',
    chainId: 1329,
    name: 'Sei Network'
  },
  testnet: {
    rpc: 'https://evm-rpc-testnet.sei-apis.com',
    chainId: 1328,
    name: 'Sei Testnet'
  }
};

// Known Sei tokens registry
export const KNOWN_SEI_TOKENS = {
  // Native SEI token
  '0x0000000000000000000000000000000000000000': {
    name: 'Sei',
    symbol: 'SEI',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/28205/large/Sei_Logo_-_Transparent.png',
    verified: true,
    type: 'native'
  },
  // CHIPS - Popular Sei meme token
  '0xbd82f3bfe1df0c84faec88a22ebc34c9a86595dc': {
    name: 'CHIPS',
    symbol: 'CHIPS',
    decimals: 18,
    logoUrl: 'https://raw.githubusercontent.com/sei-protocol/sei-chain/main/assets/chips.png',
    verified: true,
    type: 'erc20',
    description: 'CHIPS - The original Sei meme token with gaming utility',
    website: 'https://chipscoin.io',
    twitter: '@ChipsCoinSei',
    telegram: 'https://t.me/chipscoin',
    marketData: {
      price: 0.00234,
      marketCap: 2340000,
      volume24h: 456789,
      priceChange24h: 23.45
    }
  },
  // SEIYAN - Another popular Sei meme token
  '0x95597eb8d227a7c4b4f5e807a815c5178ee6dbe1': {
    name: 'SEIYAN',
    symbol: 'SEIYAN',
    decimals: 18,
    logoUrl: 'https://raw.githubusercontent.com/sei-protocol/sei-chain/main/assets/seiyan.png',
    verified: true,
    type: 'erc20',
    description: 'SEIYAN - The Super Saiyan of Sei Network meme tokens',
    website: 'https://seiyan.network',
    twitter: '@SeiyanToken',
    telegram: 'https://t.me/seiyan',
    marketData: {
      price: 0.00567,
      marketCap: 4400000,
      volume24h: 789123,
      priceChange24h: 45.67
    }
  }
};

export interface SeiTokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: string;
  logoUrl?: string;
  verified: boolean;
  type: 'native' | 'erc20' | 'cw20';
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  coingeckoId?: string;
  marketData?: {
    price?: number;
    marketCap?: number;
    volume24h?: number;
    priceChange24h?: number;
  };
}

export class SeiTokenRegistry {
  private provider: ethers.JsonRpcProvider;
  private isTestnet: boolean;

  constructor(isTestnet = false) {
    this.isTestnet = isTestnet;
    const network = isTestnet ? SEI_NETWORKS.testnet : SEI_NETWORKS.mainnet;
    this.provider = new ethers.JsonRpcProvider(network.rpc);
  }

  // Fetch token information from multiple sources
  async getTokenInfo(address: string): Promise<SeiTokenInfo | null> {
    try {
      // Handle special cases first
      if (address.toLowerCase() === 'sei' || address === '0x0000000000000000000000000000000000000000') {
        const seiToken = KNOWN_SEI_TOKENS['0x0000000000000000000000000000000000000000'];
        return {
          address: '0x0000000000000000000000000000000000000000',
          ...seiToken
        };
      }

      // Normalize address
      let normalizedAddress: string;
      try {
        normalizedAddress = ethers.getAddress(address.toLowerCase());
      } catch (error) {
        console.error('Invalid address format:', address);
        return null;
      }

      // Check if it's a known token (case-insensitive)
      const knownToken = KNOWN_SEI_TOKENS[normalizedAddress] || 
                        KNOWN_SEI_TOKENS[address.toLowerCase()] ||
                        Object.entries(KNOWN_SEI_TOKENS).find(([key, token]) => 
                          key.toLowerCase() === address.toLowerCase() ||
                          token.symbol.toLowerCase() === address.toLowerCase()
                        )?.[1];
      
      if (knownToken) {
        return {
          address: normalizedAddress,
          ...knownToken
        };
      }

      // Fetch from blockchain
      const blockchainInfo = await this.getTokenFromBlockchain(normalizedAddress);
      if (!blockchainInfo) return null;

      // Try to get additional metadata
      const metadata = await this.getTokenMetadata(normalizedAddress, blockchainInfo.symbol);

      return {
        ...blockchainInfo,
        ...metadata,
        verified: false // Mark as unverified unless in known tokens
      };
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  }

  // Get token info directly from blockchain with enhanced detection
  private async getTokenFromBlockchain(address: string): Promise<Partial<SeiTokenInfo> | null> {
    try {
      // First check if it's a contract
      const code = await this.provider.getCode(address);
      if (code === '0x') {
        // This is an EOA (wallet), not a contract
        return null;
      }

      // Try multiple contract interfaces for better compatibility
      const erc20Contract = new ethers.Contract(address, [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function totalSupply() view returns (uint256)',
        'function balanceOf(address) view returns (uint256)'
      ], this.provider);

      // Try to get basic token info with more robust error handling
      let name = 'Unknown Token';
      let symbol = 'UNKNOWN';
      let decimals = 18;
      let totalSupply = BigInt(0);
      let hasERC20Functions = false;

      try {
        // Test if this contract has ERC20 functions by calling balanceOf with zero address
        await erc20Contract.balanceOf('0x0000000000000000000000000000000000000000');
        hasERC20Functions = true;
      } catch (error) {
        // Not an ERC20, might be a different type of contract
        console.log('Not a standard ERC20 contract:', error);
      }

      if (hasERC20Functions) {
        // Try to get token details
        try {
          name = await erc20Contract.name();
        } catch (e) {
          // Some tokens don't implement name()
          console.log('No name() function:', e);
        }

        try {
          symbol = await erc20Contract.symbol();
        } catch (e) {
          // Some tokens don't implement symbol()
          console.log('No symbol() function:', e);
        }

        try {
          decimals = await erc20Contract.decimals();
        } catch (e) {
          // Default to 18 if decimals() fails
          console.log('No decimals() function, using default 18:', e);
        }

        try {
          totalSupply = await erc20Contract.totalSupply();
        } catch (e) {
          // Some tokens don't implement totalSupply()
          console.log('No totalSupply() function:', e);
        }

        return {
          address,
          name: String(name),
          symbol: String(symbol),
          decimals: Number(decimals),
          totalSupply: totalSupply.toString(),
          type: 'erc20',
          verified: true
        };
      } else {
        // It's a contract but not ERC20 - might be a factory or other contract
        // Try to get some basic info if possible
        return {
          address,
          name: 'Smart Contract',
          symbol: 'CONTRACT',
          decimals: 0,
          totalSupply: '0',
          type: 'erc20', // Keep as erc20 for compatibility
          verified: false
        };
      }
    } catch (error) {
      console.error('Error fetching from blockchain:', error);
      return null;
    }
  }

  // Get token metadata from external sources
  private async getTokenMetadata(address: string, symbol: string): Promise<Partial<SeiTokenInfo>> {
    const metadata: Partial<SeiTokenInfo> = {};

    try {
      // Try CoinGecko API for logo and market data
      const coingeckoData = await this.fetchFromCoinGecko(address, symbol);
      if (coingeckoData) {
        metadata.logoUrl = coingeckoData.logoUrl;
        metadata.marketData = coingeckoData.marketData;
        metadata.coingeckoId = coingeckoData.id;
        metadata.description = coingeckoData.description;
        metadata.website = coingeckoData.website;
      }

      // Try other sources if CoinGecko fails
      if (!metadata.logoUrl) {
        metadata.logoUrl = await this.fetchLogoFromAlternativeSources(address, symbol);
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }

    return metadata;
  }

  // Fetch data from CoinGecko API
  private async fetchFromCoinGecko(address: string, symbol: string): Promise<any> {
    try {
      // First try to find by contract address
      const contractResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (contractResponse.ok) {
        const data = await contractResponse.json();
        return {
          id: data.id,
          logoUrl: data.image?.large || data.image?.small,
          description: data.description?.en,
          website: data.links?.homepage?.[0],
          marketData: {
            price: data.market_data?.current_price?.usd,
            marketCap: data.market_data?.market_cap?.usd,
            volume24h: data.market_data?.total_volume?.usd,
            priceChange24h: data.market_data?.price_change_percentage_24h
          }
        };
      }

      // Fallback: search by symbol
      const searchResponse = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${symbol}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const coin = searchData.coins?.find((c: any) => 
          c.symbol.toLowerCase() === symbol.toLowerCase()
        );
        
        if (coin) {
          return {
            id: coin.id,
            logoUrl: coin.large || coin.small,
            description: null,
            website: null,
            marketData: null
          };
        }
      }
    } catch (error) {
      console.error('CoinGecko API error:', error);
    }

    return null;
  }

  // Fetch logo from alternative sources
  private async fetchLogoFromAlternativeSources(address: string, symbol: string): Promise<string | undefined> {
    const sources = [
      // Trust Wallet assets
      `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`,
      // TokenLists
      `https://tokens.1inch.io/${address}.png`,
      // Fallback to symbol-based logos
      `https://assets.coingecko.com/coins/images/1/large/${symbol.toLowerCase()}.png`
    ];

    for (const url of sources) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          return url;
        }
      } catch {
        continue;
      }
    }

    return undefined;
  }

  // Search tokens by name or symbol
  async searchTokens(query: string): Promise<SeiTokenInfo[]> {
    const results: SeiTokenInfo[] = [];

    // Search in known tokens
    for (const [address, token] of Object.entries(KNOWN_SEI_TOKENS)) {
      if (
        token.name.toLowerCase().includes(query.toLowerCase()) ||
        token.symbol.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({
          address,
          ...token
        });
      }
    }

    return results;
  }

  // Get trending tokens (placeholder for future implementation)
  async getTrendingTokens(): Promise<SeiTokenInfo[]> {
    // This would integrate with Sei DEX APIs or other data sources
    // For now, return known tokens
    return Object.entries(KNOWN_SEI_TOKENS).map(([address, token]) => ({
      address,
      ...token
    }));
  }

  // Validate if address is a wallet or contract
  async isWalletAddress(address: string): Promise<boolean> {
    try {
      const code = await this.provider.getCode(address);
      return code === '0x'; // EOA has no code
    } catch {
      return false;
    }
  }

  // Get wallet balance
  async getWalletBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch {
      return '0';
    }
  }
}