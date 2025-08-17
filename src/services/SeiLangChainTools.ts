import { Tool } from "@langchain/core/tools";
import { cambrianSeiAgent } from './CambrianSeiAgent';
import { portfolioOptimizer } from './PortfolioOptimizer';
import { marketIntelligence } from './MarketIntelligence';

// SEI Balance Tool
export class SeiBalanceTool extends Tool {
  name = "sei_balance";
  description = "Get SEI balance for the connected wallet. No input required.";
  
  async _call(): Promise<string> {
    try {
      const balance = await cambrianSeiAgent.getBalance();
      return `Current SEI balance: ${balance} SEI`;
    } catch (error) {
      return `Error getting balance: ${error.message}`;
    }
  }
}

// SEI Transfer Tool
export class SeiTransferTool extends Tool {
  name = "sei_transfer";
  description = "Transfer SEI tokens to another address. Input should be JSON: {\"amount\": number, \"recipient\": \"0x...\"}";
  
  async _call(input: string): Promise<string> {
    try {
      const { amount, recipient } = JSON.parse(input);
      
      // Validate inputs
      if (!amount || !recipient) {
        return "Error: Both amount and recipient are required";
      }
      
      if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
        return "Error: Invalid recipient address format";
      }
      
      // Check balance first
      const currentBalance = await cambrianSeiAgent.getBalance();
      const balanceNum = parseFloat(currentBalance);
      
      if (balanceNum < amount) {
        return `Error: Insufficient balance. Available: ${currentBalance} SEI, Requested: ${amount} SEI`;
      }
      
      // Execute transfer
      const txHash = await cambrianSeiAgent.transferToken(amount.toString(), recipient);
      return `Transfer successful! ${amount} SEI sent to ${recipient}. Transaction hash: ${txHash}`;
      
    } catch (error) {
      return `Transfer failed: ${error.message}`;
    }
  }
}

// SEI Swap Tool
export class SeiSwapTool extends Tool {
  name = "sei_swap";
  description = "Swap tokens on Symphony DEX. Input should be JSON: {\"tokenIn\": \"SEI\", \"tokenOut\": \"USDC\", \"amount\": number}";
  
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      
      if (!params.tokenIn || !params.tokenOut || !params.amount) {
        return "Error: tokenIn, tokenOut, and amount are required";
      }
      
      const result = await cambrianSeiAgent.swapTokens(params);
      return `Swap executed: ${params.amount} ${params.tokenIn} → ${params.tokenOut}. Result: ${result}`;
      
    } catch (error) {
      return `Swap failed: ${error.message}`;
    }
  }
}

// SEI Staking Tool
export class SeiStakingTool extends Tool {
  name = "sei_staking";
  description = "Stake SEI tokens on Silo protocol. Input should be JSON: {\"amount\": number}";
  
  async _call(input: string): Promise<string> {
    try {
      const { amount } = JSON.parse(input);
      
      if (!amount) {
        return "Error: Amount is required for staking";
      }
      
      const result = await cambrianSeiAgent.stakeTokens({
        amount: amount.toString(),
        validator: 'silo-protocol'
      });
      
      return `Staking successful: ${amount} SEI staked on Silo. ${result}`;
      
    } catch (error) {
      return `Staking failed: ${error.message}`;
    }
  }
}

// SEI Lending Tool
export class SeiLendingTool extends Tool {
  name = "sei_lending";
  description = "Lend tokens on Takara protocol. Input should be JSON: {\"amount\": number, \"token\": \"USDC\"}";
  
  async _call(input: string): Promise<string> {
    try {
      const { amount, token } = JSON.parse(input);
      
      if (!amount || !token) {
        return "Error: Amount and token are required for lending";
      }
      
      const result = await cambrianSeiAgent.lendTokens({
        amount: amount.toString(),
        token
      });
      
      return `Lending successful: ${amount} ${token} lent on Takara. ${result}`;
      
    } catch (error) {
      return `Lending failed: ${error.message}`;
    }
  }
}

// Portfolio Analysis Tool
export class PortfolioAnalysisTool extends Tool {
  name = "portfolio_analysis";
  description = "Get comprehensive portfolio analysis including allocation, risk assessment, and optimization recommendations. No input required.";
  
  async _call(): Promise<string> {
    try {
      return await portfolioOptimizer.getPortfolioSummary();
    } catch (error) {
      return `Portfolio analysis failed: ${error.message}`;
    }
  }
}

// Portfolio Optimization Tool
export class PortfolioOptimizationTool extends Tool {
  name = "portfolio_optimize";
  description = "Get detailed portfolio optimization recommendations and rebalancing actions. No input required.";
  
  async _call(): Promise<string> {
    try {
      const analysis = await portfolioOptimizer.analyzePortfolio();
      
      return `📊 **Portfolio Optimization Report**

**Current Portfolio**:
• Total Value: $${analysis.totalValue.toFixed(2)}
• Risk Score: ${analysis.riskScore.toFixed(1)}/3.0
• Expected Return: ${(analysis.expectedReturn * 100).toFixed(1)}% APY

**Asset Allocation**:
${analysis.allocation.map(asset => 
  `• ${asset.symbol}: ${asset.percentage.toFixed(1)}% (${asset.category}, ${asset.risk} risk)`
).join('\n')}

**Key Recommendations**:
${analysis.recommendations.map(rec => 
  `• ${rec.type.toUpperCase()} ${rec.asset}: ${rec.reason} (${rec.priority} priority)`
).join('\n')}

**Rebalancing Actions**:
${analysis.rebalancing.map(action => 
  `• ${action.action.toUpperCase()} ${action.amount.toFixed(1)}% of ${action.action}`
).join('\n')}

**Performance Metrics**:
• Total Return: ${analysis.performance.totalReturn.toFixed(1)}%
• Volatility: ${analysis.performance.volatility.toFixed(1)}%
• Sharpe Ratio: ${analysis.performance.sharpeRatio.toFixed(2)}
• Max Drawdown: ${analysis.performance.maxDrawdown.toFixed(1)}%`;
      
    } catch (error) {
      return `Portfolio optimization failed: ${error.message}`;
    }
  }
}

// Asset Recommendation Tool
export class AssetRecommendationTool extends Tool {
  name = "asset_recommendation";
  description = "Get specific recommendations for a particular asset. Input should be the asset symbol (e.g., 'SEI', 'USDC').";
  
  async _call(symbol: string): Promise<string> {
    try {
      return await portfolioOptimizer.getAssetRecommendations(symbol);
    } catch (error) {
      return `Asset recommendation failed: ${error.message}`;
    }
  }
}

// Market Overview Tool
export class MarketOverviewTool extends Tool {
  name = "market_overview";
  description = "Get comprehensive market overview including statistics, top performers, and market sentiment. No input required.";
  
  async _call(): Promise<string> {
    try {
      return await marketIntelligence.getMarketOverview();
    } catch (error) {
      return `Market overview failed: ${error.message}`;
    }
  }
}

// Market Sentiment Tool
export class MarketSentimentTool extends Tool {
  name = "market_sentiment";
  description = "Get detailed market sentiment analysis across different indicators. No input required.";
  
  async _call(): Promise<string> {
    try {
      return await marketIntelligence.getMarketSentiment();
    } catch (error) {
      return `Market sentiment analysis failed: ${error.message}`;
    }
  }
}

// Token Trend Analysis Tool
export class TokenTrendAnalysisTool extends Tool {
  name = "token_trend_analysis";
  description = "Analyze market trends for a specific token. Input should be the token symbol (e.g., 'SEI').";
  
  async _call(symbol: string): Promise<string> {
    try {
      return await marketIntelligence.analyzeTokenTrend(symbol);
    } catch (error) {
      return `Token trend analysis failed: ${error.message}`;
    }
  }
}

// Trading Opportunities Tool
export class TradingOpportunitiesTool extends Tool {
  name = "trading_opportunities";
  description = "Get current trading opportunities with entry/exit points and risk assessment. No input required.";
  
  async _call(): Promise<string> {
    try {
      return await marketIntelligence.getTradingOpportunities();
    } catch (error) {
      return `Trading opportunities analysis failed: ${error.message}`;
    }
  }
}

// Market Alert Tool
export class MarketAlertTool extends Tool {
  name = "market_alert";
  description = "Set up market alerts for price movements, volume changes, or technical conditions. Input should be JSON: {\"symbol\": \"SEI\", \"type\": \"price\", \"condition\": \"above $0.85\", \"severity\": \"medium\"}";
  
  async _call(input: string): Promise<string> {
    try {
      const { symbol, type, condition, severity } = JSON.parse(input);
      
      if (!symbol || !type || !condition || !severity) {
        return "Error: symbol, type, condition, and severity are required";
      }
      
      return await marketIntelligence.setMarketAlert(symbol, type, condition, severity);
      
    } catch (error) {
      return `Market alert setup failed: ${error.message}`;
    }
  }
}

// Active Alerts Tool
export class ActiveAlertsTool extends Tool {
  name = "active_alerts";
  description = "Get all active market alerts. No input required.";
  
  async _call(): Promise<string> {
    try {
      return await marketIntelligence.getActiveAlerts();
    } catch (error) {
      return `Failed to retrieve active alerts: ${error.message}`;
    }
  }
}

// Wallet Info Tool
export class WalletInfoTool extends Tool {
  name = "wallet_info";
  description = "Get comprehensive wallet information including address, balance, and capabilities";
  
  async _call(): Promise<string> {
    try {
      const walletInfo = await cambrianSeiAgent.getWalletInfo();
      return `Wallet Information:\n${JSON.stringify(walletInfo, null, 2)}`;
    } catch (error) {
      return `Error getting wallet info: ${error.message}`;
    }
  }
}

// Token Scan Tool
export class TokenScanTool extends Tool {
  name = "token_scan";
  description = "Scan and analyze a token by address. Input should be the token contract address (0x...)";
  
  async _call(tokenAddress: string): Promise<string> {
    try {
      if (!tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        return "Error: Invalid token address format";
      }
      
      // Get token balance
      const balance = await cambrianSeiAgent.getBalance(tokenAddress as any);
      
      return `Token Analysis for ${tokenAddress}:\n- Balance: ${balance}\n- Contract appears valid\n- Ready for interactions`;
      
    } catch (error) {
      return `Token scan failed: ${error.message}`;
    }
  }
}

// Create all Sei tools with enhanced AI capabilities
export const createSeiTools = () => [
  // Core blockchain tools
  new SeiBalanceTool(),
  new SeiTransferTool(),
  new SeiSwapTool(),
  new SeiStakingTool(),
  new SeiLendingTool(),
  new WalletInfoTool(),
  new TokenScanTool(),
  
  // Advanced AI-powered tools
  new PortfolioAnalysisTool(),
  new PortfolioOptimizationTool(),
  new AssetRecommendationTool(),
  new MarketOverviewTool(),
  new MarketSentimentTool(),
  new TokenTrendAnalysisTool(),
  new TradingOpportunitiesTool(),
  new MarketAlertTool(),
  new ActiveAlertsTool()
];