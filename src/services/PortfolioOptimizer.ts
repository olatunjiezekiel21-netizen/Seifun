import { unifiedTokenService } from './UnifiedTokenService';
import { privateKeyWallet } from './PrivateKeyWallet';

export interface PortfolioAnalysis {
  totalValue: number;
  allocation: AssetAllocation[];
  riskScore: number;
  expectedReturn: number;
  recommendations: PortfolioRecommendation[];
  rebalancing: RebalancingAction[];
  performance: PerformanceMetrics;
}

export interface AssetAllocation {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  risk: 'low' | 'medium' | 'high';
  expectedReturn: number;
  category: 'core' | 'growth' | 'stable' | 'defi';
}

export interface PortfolioRecommendation {
  type: 'buy' | 'sell' | 'hold' | 'rebalance';
  asset: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
}

export interface RebalancingAction {
  asset: string;
  currentPercentage: number;
  targetPercentage: number;
  action: 'buy' | 'sell';
  amount: number;
  priority: 'high' | 'medium' | 'low';
}

export interface PerformanceMetrics {
  totalReturn: number;
  dailyReturn: number;
  weeklyReturn: number;
  monthlyReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export class PortfolioOptimizer {
  private riskFreeRate = 0.05; // 5% risk-free rate
  
  async analyzePortfolio(): Promise<PortfolioAnalysis> {
    try {
      // Get current wallet balances
      const [seiBalance, usdcBalance, myTokens] = await Promise.all([
        privateKeyWallet.getSeiBalance(),
        privateKeyWallet.getUSDCBalance(),
        privateKeyWallet.getMyTokens()
      ]);
      
      // Get all available tokens for analysis
      const allTokens = unifiedTokenService.getAllTokens();
      
      // Calculate portfolio value and allocation
      const portfolioValue = this.calculatePortfolioValue(seiBalance, usdcBalance, myTokens, allTokens);
      const allocation = this.calculateAssetAllocation(seiBalance, usdcBalance, myTokens, allTokens, portfolioValue);
      
      // Calculate risk metrics
      const riskScore = this.calculateRiskScore(allocation);
      const expectedReturn = this.calculateExpectedReturn(allocation);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(allocation, riskScore);
      const rebalancing = this.calculateRebalancing(allocation);
      
      // Calculate performance metrics
      const performance = this.calculatePerformanceMetrics(allocation);
      
      return {
        totalValue: portfolioValue,
        allocation,
        riskScore,
        expectedReturn,
        recommendations,
        rebalancing,
        performance
      };
      
    } catch (error) {
      console.error('Portfolio analysis failed:', error);
      throw new Error(`Portfolio analysis failed: ${error.message}`);
    }
  }
  
  private calculatePortfolioValue(
    seiBalance: any, 
    usdcBalance: any, 
    myTokens: any[], 
    allTokens: any[]
  ): number {
    let totalValue = 0;
    
    // SEI balance value
    totalValue += seiBalance.usd || 0;
    
    // USDC balance value
    totalValue += usdcBalance.usd || 0;
    
    // Custom tokens value
    myTokens.forEach(myToken => {
      const tokenData = allTokens.find(t => t.address === myToken.address);
      if (tokenData && myToken.balance) {
        totalValue += tokenData.price * myToken.balance;
      }
    });
    
    return totalValue;
  }
  
  private calculateAssetAllocation(
    seiBalance: any,
    usdcBalance: any,
    myTokens: any[],
    allTokens: any[],
    totalValue: number
  ): AssetAllocation[] {
    const allocation: AssetAllocation[] = [];
    
    // SEI allocation
    if (seiBalance.usd > 0) {
      allocation.push({
        symbol: 'SEI',
        name: 'Sei Network',
        value: seiBalance.usd,
        percentage: (seiBalance.usd / totalValue) * 100,
        risk: 'medium',
        expectedReturn: 0.15, // 15% expected return
        category: 'core'
      });
    }
    
    // USDC allocation
    if (usdcBalance.usd > 0) {
      allocation.push({
        symbol: 'USDC',
        name: 'USD Coin',
        value: usdcBalance.usd,
        percentage: (usdcBalance.usd / totalValue) * 100,
        risk: 'low',
        expectedReturn: 0.08, // 8% expected return (yield farming)
        category: 'stable'
      });
    }
    
    // Custom tokens allocation
    myTokens.forEach(myToken => {
      const tokenData = allTokens.find(t => t.address === myToken.address);
      if (tokenData && myToken.balance) {
        const tokenValue = tokenData.price * myToken.balance;
        allocation.push({
          symbol: tokenData.symbol,
          name: tokenData.name,
          value: tokenValue,
          percentage: (tokenValue / totalValue) * 100,
          risk: this.assessTokenRisk(tokenData),
          expectedReturn: this.calculateTokenExpectedReturn(tokenData),
          category: this.categorizeToken(tokenData)
        });
      }
    });
    
    return allocation.sort((a, b) => b.percentage - a.percentage);
  }
  
  private assessTokenRisk(tokenData: any): 'low' | 'medium' | 'high' {
    let riskScore = 0;
    
    // Security score (0-100)
    if (tokenData.securityScore) {
      if (tokenData.securityScore >= 80) riskScore += 1;
      else if (tokenData.securityScore >= 60) riskScore += 2;
      else riskScore += 3;
    }
    
    // Liquidity assessment
    if (tokenData.liquidity) {
      if (tokenData.liquidity > 100000) riskScore += 1; // High liquidity
      else if (tokenData.liquidity > 10000) riskScore += 2; // Medium liquidity
      else riskScore += 3; // Low liquidity
    }
    
    // Trading volume
    if (tokenData.volume24h) {
      if (tokenData.volume24h > 50000) riskScore += 1;
      else if (tokenData.volume24h > 5000) riskScore += 2;
      else riskScore += 3;
    }
    
    // Age of token
    if (tokenData.createdAt) {
      const ageInDays = (Date.now() - new Date(tokenData.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays > 30) riskScore += 1; // Established
      else if (ageInDays > 7) riskScore += 2; // New
      else riskScore += 3; // Very new
    }
    
    if (riskScore <= 3) return 'low';
    else if (riskScore <= 6) return 'medium';
    else return 'high';
  }
  
  private calculateTokenExpectedReturn(tokenData: any): number {
    let baseReturn = 0.12; // 12% base return
    
    // Adjust based on risk
    const risk = this.assessTokenRisk(tokenData);
    if (risk === 'high') baseReturn += 0.08; // Higher risk, higher return
    else if (risk === 'low') baseReturn -= 0.04; // Lower risk, lower return
    
    // Adjust based on market performance
    if (tokenData.priceChange24h) {
      if (tokenData.priceChange24h > 10) baseReturn += 0.05; // Strong momentum
      else if (tokenData.priceChange24h < -10) baseReturn -= 0.05; // Weak momentum
    }
    
    return Math.max(0.05, Math.min(0.30, baseReturn)); // Cap between 5% and 30%
  }
  
  private categorizeToken(tokenData: any): 'core' | 'growth' | 'stable' | 'defi' {
    if (tokenData.symbol === 'SEI' || tokenData.symbol === 'ATOM') return 'core';
    if (tokenData.symbol === 'USDC' || tokenData.symbol === 'USDT') return 'stable';
    if (tokenData.verified && tokenData.securityScore > 70) return 'defi';
    return 'growth';
  }
  
  private calculateRiskScore(allocation: AssetAllocation[]): number {
    let totalRisk = 0;
    let totalWeight = 0;
    
    allocation.forEach(asset => {
      const riskWeight = asset.risk === 'low' ? 1 : asset.risk === 'medium' ? 2 : 3;
      totalRisk += (riskWeight * asset.percentage);
      totalWeight += asset.percentage;
    });
    
    return totalWeight > 0 ? (totalRisk / totalWeight) : 0;
  }
  
  private calculateExpectedReturn(allocation: AssetAllocation[]): number {
    let totalReturn = 0;
    let totalWeight = 0;
    
    allocation.forEach(asset => {
      totalReturn += (asset.expectedReturn * asset.percentage);
      totalWeight += asset.percentage;
    });
    
    return totalWeight > 0 ? (totalReturn / totalWeight) : 0;
  }
  
  private generateRecommendations(
    allocation: AssetAllocation[], 
    riskScore: number
  ): PortfolioRecommendation[] {
    const recommendations: PortfolioRecommendation[] = [];
    
    // Risk management recommendations
    if (riskScore > 2.5) {
      recommendations.push({
        type: 'rebalance',
        asset: 'Portfolio',
        reason: 'High risk exposure detected',
        priority: 'high',
        expectedImpact: 'Reduce portfolio volatility by 15-20%'
      });
    }
    
    // Diversification recommendations
    const corePercentage = allocation
      .filter(a => a.category === 'core')
      .reduce((sum, a) => sum + a.percentage, 0);
    
    if (corePercentage < 40) {
      recommendations.push({
        type: 'buy',
        asset: 'SEI',
        reason: 'Increase core holdings for stability',
        priority: 'medium',
        expectedImpact: 'Improve portfolio stability and reduce risk'
      });
    }
    
    // Stable asset recommendations
    const stablePercentage = allocation
      .filter(a => a.category === 'stable')
      .reduce((sum, a) => sum + a.percentage, 0);
    
    if (stablePercentage < 20) {
      recommendations.push({
        type: 'buy',
        asset: 'USDC',
        reason: 'Increase stable asset allocation',
        priority: 'medium',
        expectedImpact: 'Provide liquidity for opportunities and reduce volatility'
      });
    }
    
    // High-risk asset management
    const highRiskAssets = allocation.filter(a => a.risk === 'high');
    highRiskAssets.forEach(asset => {
      if (asset.percentage > 15) {
        recommendations.push({
          type: 'sell',
          asset: asset.symbol,
          reason: 'Reduce exposure to high-risk asset',
          priority: 'high',
          expectedImpact: 'Lower portfolio risk and improve stability'
        });
      }
    });
    
    return recommendations;
  }
  
  private calculateRebalancing(allocation: AssetAllocation[]): RebalancingAction[] {
    const rebalancing: RebalancingAction[] = [];
    
    // Target allocations
    const targets = {
      core: 40,
      stable: 20,
      defi: 25,
      growth: 15
    };
    
    // Calculate current vs target
    const current = {
      core: allocation.filter(a => a.category === 'core').reduce((sum, a) => sum + a.percentage, 0),
      stable: allocation.filter(a => a.category === 'stable').reduce((sum, a) => sum + a.percentage, 0),
      defi: allocation.filter(a => a.category === 'defi').reduce((sum, a) => sum + a.percentage, 0),
      growth: allocation.filter(a => a.category === 'growth').reduce((sum, a) => sum + a.percentage, 0)
    };
    
    // Generate rebalancing actions
    Object.entries(targets).forEach(([category, target]) => {
      const currentPercentage = current[category as keyof typeof current];
      const difference = target - currentPercentage;
      
      if (Math.abs(difference) > 5) { // Only rebalance if difference > 5%
        const categoryAssets = allocation.filter(a => a.category === category);
        if (categoryAssets.length > 0) {
          const asset = categoryAssets[0]; // Use first asset in category
          rebalancing.push({
            asset: asset.symbol,
            currentPercentage: asset.percentage,
            targetPercentage: target,
            action: difference > 0 ? 'buy' : 'sell',
            amount: Math.abs(difference),
            priority: Math.abs(difference) > 10 ? 'high' : 'medium'
          });
        }
      }
    });
    
    return rebalancing;
  }
  
  private calculatePerformanceMetrics(allocation: AssetAllocation[]): PerformanceMetrics {
    // Mock performance data - in real implementation, this would use historical data
    const totalReturn = allocation.reduce((sum, asset) => sum + asset.expectedReturn, 0) / allocation.length;
    const volatility = this.calculateVolatility(allocation);
    const sharpeRatio = (totalReturn - this.riskFreeRate) / volatility;
    
    return {
      totalReturn: totalReturn * 100, // Convert to percentage
      dailyReturn: (totalReturn / 365) * 100,
      weeklyReturn: (totalReturn / 52) * 100,
      monthlyReturn: (totalReturn / 12) * 100,
      volatility: volatility * 100,
      sharpeRatio,
      maxDrawdown: Math.min(0, -volatility * 2) * 100 // Estimate max drawdown
    };
  }
  
  private calculateVolatility(allocation: AssetAllocation[]): number {
    // Simplified volatility calculation based on risk scores
    let totalVolatility = 0;
    let totalWeight = 0;
    
    allocation.forEach(asset => {
      const assetVolatility = asset.risk === 'low' ? 0.1 : asset.risk === 'medium' ? 0.2 : 0.4;
      totalVolatility += (assetVolatility * asset.percentage);
      totalWeight += asset.percentage;
    });
    
    return totalWeight > 0 ? (totalVolatility / totalWeight) : 0.2;
  }
  
  // Get portfolio summary for quick overview
  async getPortfolioSummary(): Promise<string> {
    try {
      const analysis = await this.analyzePortfolio();
      
      return `📊 **Portfolio Summary**

**Total Value**: $${analysis.totalValue.toFixed(2)}
**Risk Score**: ${analysis.riskScore.toFixed(1)}/3.0
**Expected Return**: ${(analysis.expectedReturn * 100).toFixed(1)}% APY

**Top Holdings**:
${analysis.allocation.slice(0, 3).map(asset => 
  `• ${asset.symbol}: ${asset.percentage.toFixed(1)}% ($${asset.value.toFixed(2)})`
).join('\n')}

**Key Recommendations**:
${analysis.recommendations.slice(0, 2).map(rec => 
  `• ${rec.action === 'buy' ? '🟢' : rec.action === 'sell' ? '🔴' : '🟡'} ${rec.asset}: ${rec.reason}`
).join('\n')}

**Performance**: ${analysis.performance.totalReturn.toFixed(1)}% total return, ${analysis.performance.volatility.toFixed(1)}% volatility`;
      
    } catch (error) {
      return `❌ Unable to generate portfolio summary: ${error.message}`;
    }
  }
  
  // Get specific recommendations for an asset
  async getAssetRecommendations(symbol: string): Promise<string> {
    try {
      const analysis = await this.analyzePortfolio();
      const asset = analysis.allocation.find(a => a.symbol.toUpperCase() === symbol.toUpperCase());
      
      if (!asset) {
        return `❌ Asset ${symbol} not found in portfolio`;
      }
      
      const recommendations = analysis.recommendations.filter(r => r.asset === symbol);
      
      return `📈 **${asset.symbol} Analysis**

**Current Position**:
• Value: $${asset.value.toFixed(2)}
• Allocation: ${asset.percentage.toFixed(1)}%
• Risk Level: ${asset.risk.toUpperCase()}
• Expected Return: ${(asset.expectedReturn * 100).toFixed(1)}%

**Recommendations**:
${recommendations.length > 0 ? 
  recommendations.map(rec => 
    `• ${rec.type.toUpperCase()}: ${rec.reason} (${rec.priority} priority)`
  ).join('\n') : 
  '• HOLD: Current position is optimal'
}

**Risk Assessment**: ${asset.risk === 'high' ? '⚠️ High risk - consider reducing exposure' : 
  asset.risk === 'medium' ? '🟡 Medium risk - monitor closely' : 
  '🟢 Low risk - stable position'}`;
      
    } catch (error) {
      return `❌ Unable to analyze asset ${symbol}: ${error.message}`;
    }
  }
}

// Export singleton instance
export const portfolioOptimizer = new PortfolioOptimizer();