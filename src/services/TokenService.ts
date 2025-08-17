import { ethers } from 'ethers';

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  creator: string;
  createdAt: Date;
  verified: boolean;
  securityScore: number;
  holders: number;
  price?: string;
  marketCap?: string;
  volume24h?: string;
  priceChange24h?: string;
}

export interface TokenActivity {
  type: 'launch' | 'trade' | 'scan' | 'alert';
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
  txHash?: string;
}

export interface SecurityAlert {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  riskLevel: 'low' | 'medium' | 'high';
  alertType: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
}

class TokenService {
  private provider: ethers.JsonRpcProvider;
  private tokens: Map<string, TokenData> = new Map();
  private activities: TokenActivity[] = [];
  private alerts: SecurityAlert[] = [];

  constructor() {
    this.provider = new ethers.JsonRpcProvider('https://evm-rpc.sei-apis.com');
  }

  // Add a new token to tracking (called when token is created)
  async addToken(tokenData: Partial<TokenData>): Promise<void> {
    if (!tokenData.address) throw new Error('Token address is required');
    
    const fullTokenData: TokenData = {
      address: tokenData.address,
      name: tokenData.name || 'Unknown Token',
      symbol: tokenData.symbol || 'UNK',
      totalSupply: tokenData.totalSupply || '0',
      decimals: tokenData.decimals || 18,
      creator: tokenData.creator || '',
      createdAt: tokenData.createdAt || new Date(),
      verified: false,
      securityScore: 0,
      holders: 0,
      ...tokenData
    };

    this.tokens.set(tokenData.address, fullTokenData);
    
    // Add launch activity
    this.activities.unshift({
      type: 'launch',
      tokenAddress: fullTokenData.address,
      tokenName: fullTokenData.name,
      tokenSymbol: fullTokenData.symbol,
      description: `Token ${fullTokenData.name} (${fullTokenData.symbol}) launched`,
      timestamp: new Date(),
      status: 'success'
    });

    // Perform initial security scan
    await this.performSecurityScan(tokenData.address);
  }

  // Get all tracked tokens
  getTrackedTokens(): TokenData[] {
    return Array.from(this.tokens.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Get token by address
  getToken(address: string): TokenData | undefined {
    return this.tokens.get(address.toLowerCase());
  }

  // Get recent activities
  getRecentActivities(limit: number = 10): TokenActivity[] {
    return this.activities.slice(0, limit);
  }

  // Get security alerts
  getSecurityAlerts(resolved: boolean = false): SecurityAlert[] {
    return this.alerts.filter(alert => alert.resolved === resolved);
  }

  // Perform security scan on a token
  async performSecurityScan(tokenAddress: string): Promise<number> {
    try {
      const token = this.tokens.get(tokenAddress.toLowerCase());
      if (!token) throw new Error('Token not found');

      // Check if address is a contract
      const code = await this.provider.getCode(tokenAddress);
      const isContract = code !== '0x';
      
      let securityScore = 50; // Base score

      if (isContract) {
        securityScore += 30; // Contract exists
        
        // Try to get contract details
        try {
          const contract = new ethers.Contract(tokenAddress, [
            'function name() view returns (string)',
            'function symbol() view returns (string)',
            'function totalSupply() view returns (uint256)',
            'function balanceOf(address) view returns (uint256)',
          ], this.provider);

          const [name, symbol, totalSupply] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.totalSupply()
          ]);

          if (name && symbol && totalSupply) {
            securityScore += 20; // Valid ERC20 interface
          }
        } catch (error) {
          securityScore -= 10; // Interface issues
        }
      } else {
        securityScore = 10; // Not a contract
      }

      // Update token security score
      token.securityScore = securityScore;
      this.tokens.set(tokenAddress.toLowerCase(), token);

      // Add security scan activity
      this.activities.unshift({
        type: 'scan',
        tokenAddress: token.address,
        tokenName: token.name,
        tokenSymbol: token.symbol,
        description: `Security scan completed - Score: ${securityScore}/100`,
        timestamp: new Date(),
        status: securityScore >= 70 ? 'success' : securityScore >= 40 ? 'warning' : 'error'
      });

      // Generate alert if high risk
      if (securityScore < 40) {
        this.alerts.unshift({
          tokenAddress: token.address,
          tokenName: token.name,
          tokenSymbol: token.symbol,
          riskLevel: 'high',
          alertType: 'Low Security Score',
          description: `Token has a low security score of ${securityScore}/100`,
          timestamp: new Date(),
          resolved: false
        });
      }

      return securityScore;
    } catch (error) {
      console.error('Security scan failed:', error);
      return 0;
    }
  }

  // Update token price data (would integrate with price feeds in production)
  async updateTokenPrice(tokenAddress: string, priceData: {
    price?: string;
    marketCap?: string;
    volume24h?: string;
    priceChange24h?: string;
  }): Promise<void> {
    const token = this.tokens.get(tokenAddress.toLowerCase());
    if (!token) return;

    Object.assign(token, priceData);
    this.tokens.set(tokenAddress.toLowerCase(), token);
  }

  // Resolve a security alert
  resolveAlert(tokenAddress: string, alertType: string): void {
    const alertIndex = this.alerts.findIndex(alert => 
      alert.tokenAddress === tokenAddress && alert.alertType === alertType
    );
    
    if (alertIndex >= 0) {
      this.alerts[alertIndex].resolved = true;
    }
  }

  // Get analytics data
  getAnalytics() {
    const tokens = this.getTrackedTokens();
    const totalTokens = tokens.length;
    const verifiedTokens = tokens.filter(t => t.verified).length;
    const avgSecurityScore = totalTokens > 0 
      ? tokens.reduce((sum, t) => sum + t.securityScore, 0) / totalTokens 
      : 0;
    const highRiskTokens = tokens.filter(t => t.securityScore < 40).length;

    return {
      totalTokens,
      verifiedTokens,
      avgSecurityScore: Math.round(avgSecurityScore * 10) / 10,
      highRiskTokens,
      recentActivities: this.activities.slice(0, 5).length,
      unresolvedAlerts: this.alerts.filter(a => !a.resolved).length
    };
  }

  // Clear old activities (keep last 100)
  cleanupActivities(): void {
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(0, 100);
    }
  }

  // Export token data for backup/analysis
  exportData() {
    return {
      tokens: Array.from(this.tokens.entries()),
      activities: this.activities,
      alerts: this.alerts,
      timestamp: new Date()
    };
  }
}

// Export singleton instance
export const tokenService = new TokenService();
export default tokenService;