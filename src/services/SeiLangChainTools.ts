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

// SEI Swap Tool - REAL TESTNET FUNCTIONALITY!
export class SeiSwapTool extends Tool {
  name = "sei_swap";
  description = "Swap tokens on Symphony DEX on Sei Testnet. Input should be JSON: {\"tokenIn\": \"0x...\", \"tokenOut\": \"0x...\", \"amount\": number}";
  
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      
      if (!params.tokenIn || !params.tokenOut || !params.amount) {
        return "Error: tokenIn, tokenOut, and amount are required";
      }
      
      const result = await cambrianSeiAgent.swapTokens(params);
      return `Swap executed on Sei Testnet: ${params.amount} tokens swapped. Result: ${result}`;
      
    } catch (error) {
      return `Swap failed: ${error.message}`;
    }
  }
}

// Token Creation Tool - INNOVATIVE FEATURE!
export class TokenCreationTool extends Tool {
  name = "create_token";
  description = "Create a new token on Sei Testnet. Input should be JSON: {\"name\": \"Token Name\", \"symbol\": \"TKN\", \"totalSupply\": \"1000000\", \"decimals\": 18}";
  
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      
      if (!params.name || !params.symbol || !params.totalSupply) {
        return "Error: name, symbol, and totalSupply are required";
      }
      
      const result = await cambrianSeiAgent.createToken(params);
      return `Token created successfully on Sei Testnet! ${result}`;
      
    } catch (error) {
      return `Token creation failed: ${error.message}`;
    }
  }
}

// Add Liquidity Tool - REAL TESTNET FUNCTIONALITY!
export class AddLiquidityTool extends Tool {
  name = "add_liquidity";
  description = "Add liquidity to Symphony DEX on Sei Testnet. Input should be JSON: {\"tokenA\": \"0x...\", \"tokenB\": \"0x...\", \"amountA\": \"100\", \"amountB\": \"100\"}";
  
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      
      if (!params.tokenA || !params.tokenB || !params.amountA || !params.amountB) {
        return "Error: tokenA, tokenB, amountA, and amountB are required";
      }
      
      const result = await cambrianSeiAgent.addLiquidity(params);
      return `Liquidity added successfully on Sei Testnet! ${result}`;
      
    } catch (error) {
      return `Add liquidity failed: ${error.message}`;
    }
  }
}

// Remove Liquidity Tool - REAL TESTNET FUNCTIONALITY!
export class RemoveLiquidityTool extends Tool {
  name = "remove_liquidity";
  description = "Remove liquidity from Symphony DEX on Sei Testnet. Input should be JSON: {\"tokenA\": \"0x...\", \"tokenB\": \"0x...\", \"amountA\": \"100\", \"amountB\": \"100\"}";
  
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      
      if (!params.tokenA || !params.tokenB || !params.amountA || !params.amountB) {
        return "Error: tokenA, tokenB, amountA, and amountB are required";
      }
      
      const result = await cambrianSeiAgent.removeLiquidity(params);
      return `Liquidity removed successfully on Sei Testnet! ${result}`;
      
    } catch (error) {
      return `Remove liquidity failed: ${error.message}`;
    }
  }
}

// Liquidity Lock Tool - INNOVATIVE FEATURE - FIRST ON SEI!
export class LiquidityLockTool extends Tool {
  name = "lock_liquidity";
  description = "Lock liquidity on Sei Testnet - INNOVATIVE FEATURE! Input should be JSON: {\"tokenAddress\": \"0x...\", \"lockAmount\": \"1000\", \"lockDuration\": 30, \"lockType\": \"time\"}";
  
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      
      if (!params.tokenAddress || !params.lockAmount || !params.lockDuration || !params.lockType) {
        return "Error: tokenAddress, lockAmount, lockDuration, and lockType are required";
      }
      
      if (!['time', 'milestone', 'governance'].includes(params.lockType)) {
        return "Error: lockType must be 'time', 'milestone', or 'governance'";
      }
      
      const result = await cambrianSeiAgent.lockLiquidity(params);
      return `🚀 INNOVATIVE FEATURE: Liquidity locked successfully on Sei Testnet! ${result}`;
      
    } catch (error) {
      return `Liquidity lock failed: ${error.message}`;
    }
  }
}

// Unlock Liquidity Tool
export class UnlockLiquidityTool extends Tool {
  name = "unlock_liquidity";
  description = "Unlock liquidity after lock period on Sei Testnet. Input should be the lock ID.";
  
  async _call(lockId: string): Promise<string> {
    try {
      if (!lockId) {
        return "Error: lockId is required";
      }
      
      const result = await cambrianSeiAgent.unlockLiquidity(lockId);
      return `Liquidity unlocked successfully on Sei Testnet! ${result}`;
      
    } catch (error) {
      return `Liquidity unlock failed: ${error.message}`;
    }
  }
}

// Burn Token Tool - REAL TESTNET FUNCTIONALITY!
export class BurnTokenTool extends Tool {
  name = "burn_token";
  description = "Burn tokens on Sei Testnet. Input should be JSON: {\"tokenAddress\": \"0x...\", \"amount\": \"100\"}";
  
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      
      if (!params.tokenAddress || !params.amount) {
        return "Error: tokenAddress and amount are required";
      }
      
      const result = await cambrianSeiAgent.burnToken(params.tokenAddress, params.amount);
      return `Tokens burned successfully on Sei Testnet! ${result}`;
      
    } catch (error) {
      return `Token burn failed: ${error.message}`;
    }
  }
}

// Token Scan Tool - REAL TESTNET FUNCTIONALITY!
export class TokenScanTool extends Tool {
  name = "scan_token";
  description = "Scan and analyze a token on Sei Testnet. Input should be the token contract address (0x...).";
  
  async _call(tokenAddress: string): Promise<string> {
    try {
      if (!tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        return "Error: Invalid token address format";
      }
      
      const scanResult = await cambrianSeiAgent.scanToken(tokenAddress as any);
      
      return `🔍 Token Analysis for ${tokenAddress} on Sei Testnet:

📝 Basic Info:
• Name: ${scanResult.name}
• Symbol: ${scanResult.symbol}
• Total Supply: ${scanResult.totalSupply}
• Decimals: ${scanResult.decimals}
• Your Balance: ${scanResult.balance}

🔒 Security:
• Verified: ${scanResult.isVerified ? 'Yes' : 'No'}
• Security Score: ${scanResult.securityScore}/100
• Risks: ${scanResult.risks.join(', ')}

💧 Liquidity:
• Liquidity: $${scanResult.liquidity}
• Holders: ${scanResult.holders}

✅ Token appears valid and ready for interactions!`;
      
    } catch (error) {
      return `Token scan failed: ${error.message}`;
    }
  }
}

// Get Liquidity Locks Tool
export class GetLiquidityLocksTool extends Tool {
  name = "get_liquidity_locks";
  description = "Get all liquidity locks for a token on Sei Testnet. Input should be the token contract address (0x...).";
  
  async _call(tokenAddress: string): Promise<string> {
    try {
      if (!tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        return "Error: Invalid token address format";
      }
      
      const locks = await cambrianSeiAgent.getLiquidityLocks(tokenAddress as any);
      
      if (locks.length === 0) {
        return `No liquidity locks found for token ${tokenAddress}`;
      }
      
      return `🔒 Liquidity Locks for ${tokenAddress}:

${locks.map((lock, index) => 
  `${index + 1}. Lock ID: ${lock.id}
   • Amount: ${lock.amount}
   • Duration: ${lock.duration} days
   • Type: ${lock.type}
   • Status: ${lock.isActive ? 'Active' : 'Expired'}`
).join('\n\n')}`;
      
    } catch (error) {
      return `Failed to get liquidity locks: ${error.message}`;
    }
  }
}

// SEI Staking Tool
export class SeiStakingTool extends Tool {
  name = "sei_staking";
  description = "Stake SEI tokens on Silo protocol on Sei Testnet. Input should be JSON: {\"amount\": number}";
  
  async _call(input: string): Promise<string> {
    try {
      const { amount } = JSON.parse(input);
      
      if (!amount) {
        return "Error: Amount is required for staking";
      }
      
      const result = await cambrianSeiAgent.stakeTokens({
        amount: amount.toString()
      });
      
      return `Staking initiated on Sei Testnet: ${amount} SEI. ${result}`;
      
    } catch (error) {
      return `Staking failed: ${error.message}`;
    }
  }
}

// SEI Lending Tool
export class SeiLendingTool extends Tool {
  name = "sei_lending";
  description = "Lend tokens on Takara protocol on Sei Testnet. Input should be JSON: {\"amount\": number, \"token\": \"USDC\"}";
  
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
      
      return `Lending initiated on Sei Testnet: ${amount} ${token}. ${result}`;
      
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

// Create all Sei tools with enhanced AI capabilities and REAL TESTNET FUNCTIONALITY
export const createSeiTools = () => [
  // Core blockchain tools - REAL TESTNET FUNCTIONALITY
  new SeiBalanceTool(),
  new SeiTransferTool(),
  new SeiSwapTool(),
  new SeiStakingTool(),
  new SeiLendingTool(),
  new WalletInfoTool(),
  
  // NEW: Advanced Token Management - INNOVATIVE FEATURES!
  new TokenCreationTool(),
  new AddLiquidityTool(),
  new RemoveLiquidityTool(),
  new LiquidityLockTool(), // 🚀 FIRST ON SEI!
  new UnlockLiquidityTool(),
  new BurnTokenTool(),
  new TokenScanTool(),
  new GetLiquidityLocksTool(),
  
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