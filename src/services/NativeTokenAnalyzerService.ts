// Native Token Analyzer Service
// Integrates with CosmWasm contract for professional native token analysis

export interface NativeTokenAnalysisResult {
  denom: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  isNative: boolean;
  isIBC: boolean;
  isCW20: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  isVerified: boolean;
  warnings: string[];
  lastAnalyzed: number;
  description?: string;
  image?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

export interface TokenAnalyzerContract {
  contractAddress: string;
  chainId: string;
  rpcEndpoint: string;
}

export class NativeTokenAnalyzerService {
  private readonly SEI_RPC_ENDPOINT = 'https://sei-rpc.polkachu.com';
  private readonly SEI_REST_ENDPOINT = 'https://sei-api.polkachu.com';
  private readonly SEI_CHAIN_ID = 'pacific-1';
  
  // Contract addresses for token analyzer (would be deployed contracts)
  private readonly TOKEN_ANALYZER_CONTRACT = 'sei1...'; // Placeholder for deployed contract
  
  /**
   * Analyze a native SEI token using the smart contract
   */
  async analyzeTokenWithContract(denom: string): Promise<NativeTokenAnalysisResult> {
    try {
      console.log(`🔍 Analyzing native token with smart contract: ${denom}`);
      
      // Query the token analyzer contract
      const analysis = await this.queryTokenAnalysis(denom);
      
      if (analysis) {
        return this.convertContractResult(analysis);
      }
      
      // Fallback to direct blockchain analysis if contract not available
      return await this.analyzeTokenDirect(denom);
      
    } catch (error) {
      console.error('❌ Smart contract analysis failed:', error);
      // Fallback to direct analysis
      return await this.analyzeTokenDirect(denom);
    }
  }
  
  /**
   * Query token analysis from the CosmWasm contract
   */
  private async queryTokenAnalysis(denom: string): Promise<any> {
    try {
      const queryMsg = {
        get_token_analysis: { denom }
      };
      
      const response = await fetch(`${this.SEI_REST_ENDPOINT}/cosmwasm/wasm/v1/contract/${this.TOKEN_ANALYZER_CONTRACT}/smart/${btoa(JSON.stringify(queryMsg))}`);
      
      if (!response.ok) {
        throw new Error(`Contract query failed: ${response.status}`);
      }
      
      const data = await response.json();
      return JSON.parse(atob(data.data));
      
    } catch (error) {
      console.warn('Contract query failed, using fallback:', error);
      return null;
    }
  }
  
  /**
   * Direct blockchain analysis (fallback method)
   */
  private async analyzeTokenDirect(denom: string): Promise<NativeTokenAnalysisResult> {
    try {
      // Get token metadata from bank module
      const metadata = await this.getTokenMetadata(denom);
      
      // Perform risk analysis
      const { riskLevel, warnings } = this.analyzeTokenRisk(denom, metadata);
      
      // Check verification status
      const isVerified = this.isTokenVerified(denom);
      
      return {
        denom,
        name: metadata.name || 'Unknown Token',
        symbol: metadata.symbol || denom,
        decimals: metadata.decimals || 6,
        totalSupply: '0', // Would need separate query
        isNative: denom === 'usei',
        isIBC: denom.startsWith('ibc/'),
        isCW20: denom.startsWith('sei1'),
        riskLevel,
        isVerified,
        warnings,
        lastAnalyzed: Date.now(),
        description: metadata.description,
        image: metadata.image,
        website: metadata.website,
        twitter: metadata.twitter,
        telegram: metadata.telegram,
      };
      
    } catch (error) {
      console.error('Direct analysis failed:', error);
      throw new Error(`Failed to analyze token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get token metadata from Sei blockchain
   */
  private async getTokenMetadata(denom: string): Promise<any> {
    try {
      const response = await fetch(`${this.SEI_REST_ENDPOINT}/cosmos/bank/v1beta1/denoms_metadata/${denom}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.metadata;
      }
      
      // Fallback for unknown tokens
      return {
        name: 'Unknown Token',
        symbol: denom,
        decimals: 6,
        description: null,
      };
      
    } catch (error) {
      console.warn('Failed to fetch token metadata:', error);
      return {
        name: 'Unknown Token',
        symbol: denom,
        decimals: 6,
        description: null,
      };
    }
  }
  
  /**
   * Analyze token risk factors
   */
  private analyzeTokenRisk(denom: string, metadata: any): { riskLevel: 'low' | 'medium' | 'high', warnings: string[] } {
    const warnings: string[] = [];
    let riskScore = 0;
    
    // Check for suspicious patterns
    if (denom.includes('scam') || denom.includes('fake')) {
      warnings.push('Token denom contains suspicious keywords');
      riskScore += 50;
    }
    
    // Check for very long denoms
    if (denom.length > 50) {
      warnings.push('Unusually long token denom');
      riskScore += 20;
    }
    
    // Native tokens are generally safer
    if (denom === 'usei') {
      riskScore -= 30;
    }
    
    // IBC tokens require additional verification
    if (denom.startsWith('ibc/')) {
      warnings.push('IBC token - verify source chain and token authenticity');
      riskScore += 10;
    }
    
    // CW20 tokens need contract verification
    if (denom.startsWith('sei1')) {
      warnings.push('CW20 token - verify contract code and ownership');
      riskScore += 15;
    }
    
    // Determine risk level
    const riskLevel = riskScore >= 50 ? 'high' : riskScore >= 20 ? 'medium' : 'low';
    
    return { riskLevel, warnings };
  }
  
  /**
   * Check if token is verified
   */
  private isTokenVerified(denom: string): boolean {
    const verifiedTokens = ['usei']; // Add more verified tokens
    return verifiedTokens.includes(denom);
  }
  
  /**
   * Convert contract result to our interface
   */
  private convertContractResult(contractResult: any): NativeTokenAnalysisResult {
    return {
      denom: contractResult.token_info.denom,
      name: contractResult.token_info.name,
      symbol: contractResult.token_info.symbol,
      decimals: contractResult.token_info.decimals,
      totalSupply: contractResult.token_info.total_supply,
      isNative: contractResult.token_info.is_native,
      isIBC: contractResult.token_info.is_ibc,
      isCW20: contractResult.token_info.is_cw20,
      riskLevel: contractResult.risk_level,
      isVerified: contractResult.is_verified,
      warnings: contractResult.warnings,
      lastAnalyzed: contractResult.last_analyzed,
      description: contractResult.token_info.description,
      image: contractResult.token_info.image,
      website: contractResult.token_info.website,
      twitter: contractResult.token_info.twitter,
      telegram: contractResult.token_info.telegram,
    };
  }
  
  /**
   * Get all analyzed tokens from the contract
   */
  async getAllAnalyzedTokens(): Promise<NativeTokenAnalysisResult[]> {
    try {
      const queryMsg = {
        list_tokens: {}
      };
      
      const response = await fetch(`${this.SEI_REST_ENDPOINT}/cosmwasm/wasm/v1/contract/${this.TOKEN_ANALYZER_CONTRACT}/smart/${btoa(JSON.stringify(queryMsg))}`);
      
      if (!response.ok) {
        throw new Error(`Contract query failed: ${response.status}`);
      }
      
      const data = await response.json();
      const tokens = JSON.parse(atob(data.data));
      
      return tokens.map(([denom, analysis]: [string, any]) => 
        this.convertContractResult(analysis)
      );
      
    } catch (error) {
      console.error('Failed to get analyzed tokens:', error);
      return [];
    }
  }
  
  /**
   * Update token information in the contract
   */
  async updateTokenInfo(denom: string, tokenInfo: Partial<NativeTokenAnalysisResult>): Promise<boolean> {
    try {
      // This would require a wallet connection and transaction signing
      // For now, we'll just log the intent
      console.log(`Would update token info for ${denom}:`, tokenInfo);
      
      // In a real implementation, this would:
      // 1. Connect to user's wallet
      // 2. Create and sign a transaction
      // 3. Broadcast the transaction
      // 4. Wait for confirmation
      
      return true;
      
    } catch (error) {
      console.error('Failed to update token info:', error);
      return false;
    }
  }
}

// Export singleton instance
export const nativeTokenAnalyzerService = new NativeTokenAnalyzerService();