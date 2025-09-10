// Native SEI Token Scanner
// Handles native SEI blockchain tokens (not EVM-based)

export interface NativeSeiTokenInfo {
  denom: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  contractAddress?: string;
  isNative: boolean;
  isIBC: boolean;
  isCW20: boolean;
  isCW721: boolean;
}

export interface NativeSeiTokenBalance {
  denom: string;
  amount: string;
  formattedAmount: string;
  tokenInfo: NativeSeiTokenInfo;
}

export interface NativeSeiTokenScanResult {
  tokenInfo: NativeSeiTokenInfo;
  balance?: NativeSeiTokenBalance;
  isVerified: boolean;
  isScam: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  warnings: string[];
  metadata: {
    description?: string;
    image?: string;
    website?: string;
    twitter?: string;
    telegram?: string;
  };
}

export class NativeSeiTokenScanner {
  private readonly SEI_RPC_ENDPOINT = 'https://sei-rpc.polkachu.com';
  private readonly SEI_REST_ENDPOINT = 'https://sei-api.polkachu.com';
  private readonly SEI_DENOM = 'usei';
  private readonly SEI_DISPLAY_DENOM = 'SEI';

  // Known native SEI tokens
  private readonly KNOWN_TOKENS: Record<string, NativeSeiTokenInfo> = {
    'usei': {
      denom: 'usei',
      name: 'Sei',
      symbol: 'SEI',
      decimals: 6,
      totalSupply: '0', // Native token, supply is dynamic
      isNative: true,
      isIBC: false,
      isCW20: false,
      isCW721: false
    }
  };

  // Known scam/high-risk tokens
  private readonly SCAM_TOKENS = new Set([
    // Add known scam token denoms here
  ]);

  // Known verified tokens
  private readonly VERIFIED_TOKENS = new Set([
    'usei', // Native SEI token
    // Add other verified token denoms here
  ]);

  /**
   * Scan a native SEI token by denom
   */
  async scanToken(denom: string, userAddress?: string): Promise<NativeSeiTokenScanResult> {
    try {
      console.log(`🔍 Scanning native SEI token: ${denom}`);

      // Get token info
      const tokenInfo = await this.getTokenInfo(denom);
      
      // Get user balance if address provided
      let balance: NativeSeiTokenBalance | undefined;
      if (userAddress) {
        balance = await this.getTokenBalance(denom, userAddress);
      }

      // Perform security checks
      const securityResult = await this.performSecurityChecks(denom, tokenInfo);

      // Get metadata
      const metadata = await this.getTokenMetadata(denom);

      return {
        tokenInfo,
        balance,
        isVerified: securityResult.isVerified,
        isScam: securityResult.isScam,
        riskLevel: securityResult.riskLevel,
        warnings: securityResult.warnings,
        metadata
      };
    } catch (error) {
      console.error('❌ Native SEI token scan failed:', error);
      throw new Error(`Failed to scan native SEI token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get token information by denom
   */
  private async getTokenInfo(denom: string): Promise<NativeSeiTokenInfo> {
    // Check if it's a known token
    if (this.KNOWN_TOKENS[denom]) {
      return this.KNOWN_TOKENS[denom];
    }

    // Try to get token info from blockchain
    try {
      const response = await fetch(`${this.SEI_REST_ENDPOINT}/cosmos/bank/v1beta1/denoms_metadata/${denom}`);
      
      if (response.ok) {
        const data = await response.json();
        const metadata = data.metadata;
        
        return {
          denom,
          name: metadata.name || 'Unknown Token',
          symbol: metadata.symbol || denom,
          decimals: parseInt(metadata.denom_units?.find((unit: any) => unit.denom === denom)?.exponent || '6'),
          totalSupply: '0', // Would need to query total supply separately
          isNative: denom === this.SEI_DENOM,
          isIBC: denom.startsWith('ibc/'),
          isCW20: denom.startsWith('sei1'),
          isCW721: false // Would need to check if it's an NFT
        };
      }
    } catch (error) {
      console.warn('Failed to fetch token metadata from blockchain:', error);
    }

    // Fallback for unknown tokens
    return {
      denom,
      name: 'Unknown Token',
      symbol: denom,
      decimals: 6,
      totalSupply: '0',
      isNative: false,
      isIBC: denom.startsWith('ibc/'),
      isCW20: denom.startsWith('sei1'),
      isCW721: false
    };
  }

  /**
   * Get token balance for a user
   */
  private async getTokenBalance(denom: string, userAddress: string): Promise<NativeSeiTokenBalance> {
    try {
      const response = await fetch(`${this.SEI_REST_ENDPOINT}/cosmos/bank/v1beta1/balances/${userAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        const balance = data.balances?.find((b: any) => b.denom === denom);
        
        if (balance) {
          const tokenInfo = await this.getTokenInfo(denom);
          const formattedAmount = this.formatTokenAmount(balance.amount, tokenInfo.decimals);
          
          return {
            denom,
            amount: balance.amount,
            formattedAmount,
            tokenInfo
          };
        }
      }
    } catch (error) {
      console.warn('Failed to fetch token balance:', error);
    }

    // Return zero balance if not found
    const tokenInfo = await this.getTokenInfo(denom);
    return {
      denom,
      amount: '0',
      formattedAmount: '0',
      tokenInfo
    };
  }

  /**
   * Perform security checks on the token
   */
  private async performSecurityChecks(denom: string, tokenInfo: NativeSeiTokenInfo): Promise<{
    isVerified: boolean;
    isScam: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    warnings: string[];
  }> {
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check if it's a known scam
    if (this.SCAM_TOKENS.has(denom)) {
      return {
        isVerified: false,
        isScam: true,
        riskLevel: 'high',
        warnings: ['This token is flagged as a known scam']
      };
    }

    // Check if it's verified
    const isVerified = this.VERIFIED_TOKENS.has(denom);

    // Check for suspicious patterns
    if (denom.includes('scam') || denom.includes('fake')) {
      warnings.push('Token denom contains suspicious keywords');
      riskLevel = 'high';
    }

    // Check for very long or complex denoms (potential scam)
    if (denom.length > 50) {
      warnings.push('Unusually long token denom');
      riskLevel = 'medium';
    }

    // Check if it's a native token (safer)
    if (tokenInfo.isNative) {
      riskLevel = 'low';
    }

    // Check if it's an IBC token (requires additional verification)
    if (tokenInfo.isIBC) {
      warnings.push('IBC token - verify source chain and token authenticity');
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    // Check if it's a CW20 token (smart contract token)
    if (tokenInfo.isCW20) {
      warnings.push('CW20 token - verify contract code and ownership');
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    return {
      isVerified,
      isScam: false,
      riskLevel,
      warnings
    };
  }

  /**
   * Get token metadata (description, image, social links)
   */
  private async getTokenMetadata(denom: string): Promise<{
    description?: string;
    image?: string;
    website?: string;
    twitter?: string;
    telegram?: string;
  }> {
    // For now, return empty metadata
    // In a real implementation, this would query token metadata from:
    // - Token registry
    // - IPFS
    // - Centralized metadata services
    // - On-chain metadata
    
    return {};
  }

  /**
   * Format token amount with proper decimals
   */
  private formatTokenAmount(amount: string, decimals: number): string {
    const num = parseFloat(amount);
    const divisor = Math.pow(10, decimals);
    const formatted = (num / divisor).toFixed(6);
    
    // Remove trailing zeros
    return parseFloat(formatted).toString();
  }

  /**
   * Get all tokens for a user
   */
  async getUserTokens(userAddress: string): Promise<NativeSeiTokenBalance[]> {
    try {
      const response = await fetch(`${this.SEI_REST_ENDPOINT}/cosmos/bank/v1beta1/balances/${userAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        const balances = data.balances || [];
        
        const tokenBalances: NativeSeiTokenBalance[] = [];
        
        for (const balance of balances) {
          if (parseFloat(balance.amount) > 0) {
            const tokenInfo = await this.getTokenInfo(balance.denom);
            const formattedAmount = this.formatTokenAmount(balance.amount, tokenInfo.decimals);
            
            tokenBalances.push({
              denom: balance.denom,
              amount: balance.amount,
              formattedAmount,
              tokenInfo
            });
          }
        }
        
        return tokenBalances;
      }
    } catch (error) {
      console.error('Failed to fetch user tokens:', error);
    }

    return [];
  }

  /**
   * Search for tokens by symbol or name
   */
  async searchTokens(query: string): Promise<NativeSeiTokenInfo[]> {
    const results: NativeSeiTokenInfo[] = [];
    const lowerQuery = query.toLowerCase();

    // Search in known tokens
    for (const token of Object.values(this.KNOWN_TOKENS)) {
      if (
        token.name.toLowerCase().includes(lowerQuery) ||
        token.symbol.toLowerCase().includes(lowerQuery) ||
        token.denom.toLowerCase().includes(lowerQuery)
      ) {
        results.push(token);
      }
    }

    return results;
  }

  /**
   * Get token price (would integrate with price APIs)
   */
  async getTokenPrice(denom: string): Promise<number> {
    // For native SEI token, get price from CoinGecko
    if (denom === this.SEI_DENOM) {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=sei-network&vs_currencies=usd');
        if (response.ok) {
          const data = await response.json();
          return data['sei-network']?.usd || 0;
        }
      } catch (error) {
        console.warn('Failed to fetch SEI price:', error);
      }
    }

    // For other tokens, would need to integrate with DEX APIs or price oracles
    return 0;
  }
}

// Export singleton instance
export const nativeSeiTokenScanner = new NativeSeiTokenScanner();