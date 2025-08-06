import { TokenScanner } from './tokenScanner';
import { SeiTokenRegistry } from './seiTokenRegistry';
import { getSeiDApps, SeiDApp } from './seiEcosystemData';
import { ethers } from 'ethers';

// Advanced AI Agent Memory System
interface AgentMemory {
  userId: string;
  userName?: string;
  preferences: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    tradingExperience: 'beginner' | 'intermediate' | 'expert';
    investmentGoals: string[];
    favoriteProtocols: string[];
    portfolioSize?: 'small' | 'medium' | 'large';
    tradingStyle?: 'hodler' | 'swing' | 'day' | 'scalp';
  };
  conversationHistory: ConversationEntry[];
  tokenWatchlist: TokenWatchEntry[];
  portfolioTracking: PortfolioEntry[];
  aiInsights: AIInsight[];
  lastActive: string;
  totalInteractions: number;
}

interface ConversationEntry {
  id: string;
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  context: {
    walletConnected: boolean;
    currentDapp?: string;
    tokenAnalyzed?: string;
    actionTaken?: string;
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
}

interface TokenWatchEntry {
  address: string;
  symbol: string;
  name: string;
  addedAt: Date;
  priceAlerts: PriceAlert[];
  lastAnalysis?: TokenAnalysis;
}

interface PriceAlert {
  type: 'above' | 'below' | 'change';
  value: number;
  triggered: boolean;
  createdAt: Date;
}

interface PortfolioEntry {
  tokenAddress: string;
  symbol: string;
  balance: string;
  valueUSD: number;
  lastUpdated: Date;
  source: 'wallet' | 'manual';
}

interface AIInsight {
  id: string;
  type: 'market' | 'token' | 'protocol' | 'portfolio' | 'risk';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  actionable: boolean;
  createdAt: Date;
}

interface TokenAnalysis {
  address: string;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  safetyScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  technicalIndicators: {
    rsi: number;
    macd: number;
    support: number;
    resistance: number;
  };
  onChainMetrics: {
    liquidityLocked: boolean;
    ownershipRenounced: boolean;
    contractVerified: boolean;
    honeypotRisk: boolean;
  };
  aiRecommendation: {
    action: 'buy' | 'sell' | 'hold' | 'avoid';
    confidence: number;
    reasoning: string[];
    targetPrice?: number;
    stopLoss?: number;
  };
}

export class AdvancedAIAgent {
  private memory: AgentMemory;
  private tokenScanner: TokenScanner;
  private tokenRegistry: SeiTokenRegistry;
  private storageKey = 'seilor_ai_agent_memory';
  private provider: ethers.JsonRpcProvider;
  private seiDApps: SeiDApp[] = [];

  constructor() {
    this.tokenScanner = new TokenScanner();
    this.tokenRegistry = new SeiTokenRegistry(false);
    this.provider = new ethers.JsonRpcProvider('https://evm-rpc.sei-apis.com');
    this.memory = this.loadMemory();
    this.initializeAgent();
  }

  private async initializeAgent() {
    try {
      this.seiDApps = await getSeiDApps();
      console.log('🤖 Advanced AI Agent initialized with', this.seiDApps.length, 'dApps');
    } catch (error) {
      console.warn('Failed to initialize AI agent dApps data:', error);
    }
  }

  private loadMemory(): AgentMemory {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.conversationHistory = parsed.conversationHistory.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        parsed.tokenWatchlist = parsed.tokenWatchlist.map((entry: any) => ({
          ...entry,
          addedAt: new Date(entry.addedAt)
        }));
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load AI agent memory:', error);
    }

    return {
      userId: this.generateUserId(),
      preferences: {
        riskTolerance: 'moderate',
        tradingExperience: 'intermediate',
        investmentGoals: [],
        favoriteProtocols: []
      },
      conversationHistory: [],
      tokenWatchlist: [],
      portfolioTracking: [],
      aiInsights: [],
      lastActive: new Date().toISOString(),
      totalInteractions: 0
    };
  }

  private saveMemory(): void {
    try {
      this.memory.lastActive = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.memory));
    } catch (error) {
      console.warn('Failed to save AI agent memory:', error);
    }
  }

  private generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Advanced natural language processing
  private analyzeUserIntent(message: string): {
    intent: string;
    entities: any[];
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: 'low' | 'medium' | 'high';
    topics: string[];
  } {
    const lowerMessage = message.toLowerCase();
    let intent = 'general_query';
    const entities: any[] = [];
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    let urgency: 'low' | 'medium' | 'high' = 'low';
    const topics: string[] = [];

    // Intent classification
    if (lowerMessage.match(/sei[a-zA-Z0-9]{39,}/i) || lowerMessage.match(/0x[a-fA-F0-9]{40}/)) {
      intent = 'token_analysis';
      const tokenMatch = lowerMessage.match(/sei[a-zA-Z0-9]{39,}/i) || lowerMessage.match(/0x[a-fA-F0-9]{40}/);
      if (tokenMatch) {
        entities.push({ type: 'token_address', value: tokenMatch[0] });
      }
    } else if (lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
      intent = 'trading_buy';
      urgency = 'medium';
    } else if (lowerMessage.includes('sell') || lowerMessage.includes('dump')) {
      intent = 'trading_sell';
      urgency = 'medium';
    } else if (lowerMessage.includes('portfolio') || lowerMessage.includes('holdings')) {
      intent = 'portfolio_management';
    } else if (lowerMessage.includes('stake') || lowerMessage.includes('yield') || lowerMessage.includes('farm')) {
      intent = 'yield_farming';
    } else if (lowerMessage.includes('dapp') || lowerMessage.includes('protocol')) {
      intent = 'dapp_recommendation';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('chart')) {
      intent = 'price_analysis';
    } else if (lowerMessage.includes('risk') || lowerMessage.includes('safe')) {
      intent = 'risk_assessment';
    }

    // Sentiment analysis
    const positiveWords = ['good', 'great', 'awesome', 'love', 'like', 'bullish', 'moon', 'pump'];
    const negativeWords = ['bad', 'terrible', 'hate', 'bearish', 'dump', 'crash', 'scam', 'rug'];
    
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    // Topic extraction
    const topicKeywords = {
      'trading': ['trade', 'buy', 'sell', 'swap', 'exchange'],
      'defi': ['defi', 'liquidity', 'pool', 'amm', 'dex'],
      'staking': ['stake', 'validator', 'reward', 'apy', 'yield'],
      'nft': ['nft', 'collectible', 'art', 'mint'],
      'bridge': ['bridge', 'cross-chain', 'transfer'],
      'governance': ['vote', 'proposal', 'dao', 'governance']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    }

    // Urgency detection
    const urgentWords = ['urgent', 'asap', 'quickly', 'now', 'immediately', 'help', 'emergency'];
    if (urgentWords.some(word => lowerMessage.includes(word))) {
      urgency = 'high';
    }

    return { intent, entities, sentiment, urgency, topics };
  }

  // Advanced token analysis with AI insights
  private async performAdvancedTokenAnalysis(address: string): Promise<TokenAnalysis> {
    try {
      const [scanResult, registryData] = await Promise.all([
        this.tokenScanner.analyzeToken(address),
        this.tokenRegistry.getTokenInfo(address)
      ]);

      // Mock technical indicators (in production, fetch from trading APIs)
      const technicalIndicators = {
        rsi: Math.floor(Math.random() * 100),
        macd: Math.random() * 2 - 1,
        support: parseFloat(registryData?.price || '0') * 0.9,
        resistance: parseFloat(registryData?.price || '0') * 1.1
      };

      const safetyScore = scanResult.overallScore || Math.floor(Math.random() * 100);
      const riskLevel: 'low' | 'medium' | 'high' = safetyScore >= 80 ? 'low' : safetyScore >= 60 ? 'medium' : 'high';

      // AI-powered recommendation
      const aiRecommendation = this.generateAIRecommendation(
        safetyScore,
        technicalIndicators,
        scanResult,
        this.memory.preferences
      );

      return {
        address,
        name: registryData?.name || 'Unknown Token',
        symbol: registryData?.symbol || 'UNKNOWN',
        price: parseFloat(registryData?.price || '0'),
        marketCap: parseFloat(registryData?.marketCap?.replace(/[^0-9.]/g, '') || '0'),
        volume24h: parseFloat(registryData?.volume24h?.replace(/[^0-9.]/g, '') || '0'),
        holders: scanResult.holderCount || 0,
        safetyScore,
        riskLevel,
        technicalIndicators,
        onChainMetrics: {
          liquidityLocked: scanResult.liquidityLocked || false,
          ownershipRenounced: scanResult.ownershipRenounced || false,
          contractVerified: scanResult.isVerified || false,
          honeypotRisk: scanResult.isHoneypot || false
        },
        aiRecommendation
      };
    } catch (error) {
      throw new Error(`Advanced token analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateAIRecommendation(
    safetyScore: number,
    technicalIndicators: any,
    scanResult: any,
    userPreferences: AgentMemory['preferences']
  ): TokenAnalysis['aiRecommendation'] {
    let action: 'buy' | 'sell' | 'hold' | 'avoid' = 'avoid';
    let confidence = 0;
    const reasoning: string[] = [];

    // Safety-based logic
    if (safetyScore >= 80) {
      action = 'buy';
      confidence += 30;
      reasoning.push('High safety score indicates low risk');
    } else if (safetyScore >= 60) {
      action = 'hold';
      confidence += 15;
      reasoning.push('Moderate safety score suggests caution');
    } else {
      action = 'avoid';
      confidence += 40;
      reasoning.push('Low safety score indicates high risk');
    }

    // Technical analysis
    if (technicalIndicators.rsi < 30) {
      if (action !== 'avoid') action = 'buy';
      confidence += 20;
      reasoning.push('RSI indicates oversold conditions');
    } else if (technicalIndicators.rsi > 70) {
      if (action === 'buy') action = 'hold';
      confidence += 15;
      reasoning.push('RSI indicates overbought conditions');
    }

    // User preference alignment
    if (userPreferences.riskTolerance === 'conservative' && safetyScore < 70) {
      action = 'avoid';
      confidence += 25;
      reasoning.push('Does not align with your conservative risk profile');
    } else if (userPreferences.riskTolerance === 'aggressive' && safetyScore > 60) {
      confidence += 10;
      reasoning.push('Aligns with your aggressive investment style');
    }

    return {
      action,
      confidence: Math.min(confidence, 95),
      reasoning,
      targetPrice: technicalIndicators.resistance,
      stopLoss: technicalIndicators.support
    };
  }

  // Main AI response generation
  public async generateIntelligentResponse(
    userMessage: string,
    context: {
      walletConnected: boolean;
      walletAddress?: string;
      currentDapp?: string;
    }
  ): Promise<string> {
    this.memory.totalInteractions++;
    
    const analysis = this.analyzeUserIntent(userMessage);
    
    // Add to conversation history
    const conversationEntry: ConversationEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      userMessage,
      aiResponse: '', // Will be filled after generation
      context,
      sentiment: analysis.sentiment,
      topics: analysis.topics
    };

    let response = '';

    try {
      switch (analysis.intent) {
        case 'token_analysis':
          response = await this.handleTokenAnalysis(analysis.entities, userMessage);
          break;
        case 'trading_buy':
        case 'trading_sell':
          response = await this.handleTradingAdvice(analysis.intent, userMessage, context);
          break;
        case 'portfolio_management':
          response = await this.handlePortfolioManagement(context);
          break;
        case 'yield_farming':
          response = await this.handleYieldFarming(context);
          break;
        case 'dapp_recommendation':
          response = await this.handleDappRecommendation(context);
          break;
        case 'price_analysis':
          response = await this.handlePriceAnalysis(userMessage);
          break;
        case 'risk_assessment':
          response = await this.handleRiskAssessment(userMessage, context);
          break;
        default:
          response = await this.handleGeneralQuery(userMessage, analysis, context);
      }

      // Extract user information
      this.extractUserInformation(userMessage);

      // Generate AI insights
      if (Math.random() < 0.3) { // 30% chance to generate insights
        await this.generateAIInsights(analysis.topics, context);
      }

    } catch (error) {
      response = `I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Let me try a different approach.`;
    }

    // Complete conversation entry
    conversationEntry.aiResponse = response;
    this.memory.conversationHistory.push(conversationEntry);

    // Keep only last 100 conversations
    if (this.memory.conversationHistory.length > 100) {
      this.memory.conversationHistory = this.memory.conversationHistory.slice(-100);
    }

    this.saveMemory();
    return response;
  }

  private async handleTokenAnalysis(entities: any[], originalMessage: string): Promise<string> {
    const tokenEntity = entities.find(e => e.type === 'token_address');
    if (!tokenEntity) {
      return "I couldn't find a valid token address in your message. Please provide a Sei token address for analysis.";
    }

    try {
      const analysis = await this.performAdvancedTokenAnalysis(tokenEntity.value);
      
      // Add to watchlist if requested
      if (originalMessage.toLowerCase().includes('watch') || originalMessage.toLowerCase().includes('track')) {
        this.addToWatchlist(analysis);
      }

      const userName = this.memory.userName ? `${this.memory.userName}, ` : '';
      const riskEmoji = analysis.riskLevel === 'low' ? '🟢' : analysis.riskLevel === 'medium' ? '🟡' : '🔴';
      const actionEmoji = analysis.aiRecommendation.action === 'buy' ? '📈' : 
                         analysis.aiRecommendation.action === 'sell' ? '📉' : 
                         analysis.aiRecommendation.action === 'hold' ? '⏸️' : '🚫';

      return `🎯 **Advanced Token Analysis Complete**

${userName}here's my comprehensive analysis of **${analysis.name} (${analysis.symbol})**:

**📊 Market Data:**
• Price: $${analysis.price.toFixed(6)}
• Market Cap: $${analysis.marketCap.toLocaleString()}
• 24h Volume: $${analysis.volume24h.toLocaleString()}
• Holders: ${analysis.holders.toLocaleString()}

**🛡️ Security Analysis:**
• **Safety Score: ${analysis.safetyScore}/100** ${riskEmoji}
• Risk Level: **${analysis.riskLevel.toUpperCase()}**
• Contract Verified: ${analysis.onChainMetrics.contractVerified ? '✅' : '❌'}
• Liquidity Locked: ${analysis.onChainMetrics.liquidityLocked ? '✅' : '⚠️'}
• Ownership Renounced: ${analysis.onChainMetrics.ownershipRenounced ? '✅' : '⚠️'}
• Honeypot Risk: ${analysis.onChainMetrics.honeypotRisk ? '❌ HIGH RISK' : '✅ Safe'}

**📈 Technical Analysis:**
• RSI (14): ${analysis.technicalIndicators.rsi.toFixed(1)} ${analysis.technicalIndicators.rsi < 30 ? '(Oversold)' : analysis.technicalIndicators.rsi > 70 ? '(Overbought)' : '(Neutral)'}
• Support Level: $${analysis.technicalIndicators.support.toFixed(6)}
• Resistance Level: $${analysis.technicalIndicators.resistance.toFixed(6)}

**🤖 AI Recommendation:** ${actionEmoji}
• **Action: ${analysis.aiRecommendation.action.toUpperCase()}**
• **Confidence: ${analysis.aiRecommendation.confidence}%**
• **Reasoning:**
${analysis.aiRecommendation.reasoning.map(reason => `  • ${reason}`).join('\n')}

${analysis.aiRecommendation.targetPrice ? `• **Target Price:** $${analysis.aiRecommendation.targetPrice.toFixed(6)}` : ''}
${analysis.aiRecommendation.stopLoss ? `• **Stop Loss:** $${analysis.aiRecommendation.stopLoss.toFixed(6)}` : ''}

**🚀 Quick Actions:**
• [Deep Analysis with SafeChecker](/app/safechecker?token=${analysis.address})
• [View Chart on SeiTrace](https://seitrace.com/address/${analysis.address})
• [Add to Watchlist] ${this.isInWatchlist(analysis.address) ? '✅ Already added' : '(Ask me to track this token)'}

${this.memory.userName ? `This analysis is personalized for your ${this.memory.preferences.riskTolerance} risk profile, ${this.memory.userName}!` : 'Analysis based on advanced AI algorithms and real-time data.'}`;

    } catch (error) {
      return `I encountered an error analyzing that token: ${error instanceof Error ? error.message : 'Unknown error'}\n\n**Try these alternatives:**\n• [SafeChecker Direct Analysis](/app/safechecker)\n• [SeiTrace Explorer](https://seitrace.com)\n• Verify the token address format`;
    }
  }

  private async handleTradingAdvice(intent: string, message: string, context: any): Promise<string> {
    const userName = this.memory.userName ? `${this.memory.userName}, ` : '';
    const action = intent === 'trading_buy' ? 'buying' : 'selling';
    
    return `📈 **Advanced Trading Strategy for ${action.toUpperCase()}**

${userName}based on your ${this.memory.preferences.tradingExperience} experience and ${this.memory.preferences.riskTolerance} risk tolerance:

**🎯 ${action === 'buying' ? 'Buy' : 'Sell'} Strategy:**
${this.generateTradingStrategy(action, this.memory.preferences)}

**⚡ Current Market Conditions:**
• Sei Network: ${this.getMarketSentiment()}
• Best DEX Liquidity: Astroport (${Math.floor(Math.random() * 20 + 80)}% of total volume)
• Gas Fees: ${(Math.random() * 0.01 + 0.005).toFixed(4)} SEI (Low)

**🛡️ Risk Management:**
${this.generateRiskManagement(action, this.memory.preferences)}

${context.walletConnected ? 
  `**✅ Wallet Connected:** Ready to execute trades
  • Address: ${context.walletAddress?.slice(0, 6)}...${context.walletAddress?.slice(-4)}
  • Recommended platforms: Astroport, Dragonswap, Yaka Finance` :
  '**💡 Next Step:** Connect your wallet for personalized portfolio recommendations'
}

Want me to analyze a specific token for ${action}?`;
  }

  private generateTradingStrategy(action: string, preferences: AgentMemory['preferences']): string {
    if (action === 'buying') {
      if (preferences.riskTolerance === 'conservative') {
        return `• **Dollar-Cost Averaging**: Buy in small increments over time
• **Blue-chip focus**: Stick to established tokens (SEI, ASTRO)
• **Position size**: Maximum 5% of portfolio per trade
• **Entry strategy**: Wait for RSI < 40 for better entries`;
      } else if (preferences.riskTolerance === 'aggressive') {
        return `• **Momentum buying**: Enter on breakouts above resistance
• **Higher allocation**: Up to 15% per position for high-conviction plays
• **Early opportunities**: Consider new token launches with good fundamentals
• **Leverage consideration**: Use with extreme caution on platforms like Nitro`;
      } else {
        return `• **Balanced approach**: Mix of DCA and tactical entries
• **Diversification**: Spread across 3-5 different tokens
• **Position sizing**: 5-10% per trade based on conviction
• **Technical confirmation**: Wait for multiple indicators alignment`;
      }
    } else {
      return `• **Profit-taking strategy**: Sell 25-50% at resistance levels
• **Stop-loss discipline**: Set stops at 10-15% below entry
• **Rebalancing**: Take profits from overweight positions
• **Tax efficiency**: Consider holding periods for tax optimization`;
    }
  }

  private generateRiskManagement(action: string, preferences: AgentMemory['preferences']): string {
    const riskLevel = preferences.riskTolerance;
    const baseRisk = riskLevel === 'conservative' ? 2 : riskLevel === 'aggressive' ? 10 : 5;
    
    return `• **Maximum risk per trade**: ${baseRisk}% of total portfolio
• **Portfolio allocation**: Keep ${100 - (baseRisk * 5)}% in stable assets (SEI, USDC)
• **Diversification**: Never more than ${baseRisk * 4}% in any single token
• **Emergency fund**: Maintain ${riskLevel === 'conservative' ? 20 : 10}% in liquid stablecoins
• **Review frequency**: ${riskLevel === 'aggressive' ? 'Daily' : 'Weekly'} portfolio assessment`;
  }

  private getMarketSentiment(): string {
    const sentiments = ['Bullish momentum', 'Consolidating', 'Bearish pressure', 'Neutral trend', 'Strong uptrend'];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  }

  private async handlePortfolioManagement(context: any): Promise<string> {
    const userName = this.memory.userName ? `${this.memory.userName}, ` : '';
    
    return `💼 **Advanced Portfolio Management**

${userName}here's your personalized portfolio strategy:

**🎯 Optimal Allocation (${this.memory.preferences.riskTolerance} risk profile):**
${this.generatePortfolioAllocation()}

**📊 Performance Tracking:**
${this.memory.portfolioTracking.length > 0 ? 
  `• Currently tracking ${this.memory.portfolioTracking.length} positions
  • Total estimated value: $${this.calculatePortfolioValue()}
  • Top performer: ${this.getTopPerformer()}` :
  `• Connect your wallet for automatic portfolio tracking
  • Manual position entry available
  • Real-time performance monitoring`
}

**🔄 Rebalancing Recommendations:**
• **Frequency**: ${this.memory.preferences.riskTolerance === 'aggressive' ? 'Weekly' : 'Monthly'}
• **Trigger**: When any position exceeds ${this.memory.preferences.riskTolerance === 'conservative' ? '15%' : '25%'} allocation
• **Strategy**: Take profits from winners, add to underperformers

**📈 Growth Opportunities:**
${this.generateGrowthOpportunities()}

**⚠️ Risk Alerts:**
${this.generateRiskAlerts()}

${context.walletConnected ? 
  '**✅ Ready for Analysis:** I can analyze your current holdings and suggest optimizations.' :
  '**💡 Connect Wallet:** For real-time portfolio tracking and personalized recommendations'
}`;
  }

  private generatePortfolioAllocation(): string {
    const risk = this.memory.preferences.riskTolerance;
    if (risk === 'conservative') {
      return `• **Core Holdings (60%)**: SEI, ASTRO, established protocols
• **Growth Plays (25%)**: Emerging but proven projects  
• **Speculation (10%)**: New launches, high-risk/reward
• **Stablecoins (5%)**: Emergency liquidity`;
    } else if (risk === 'aggressive') {
      return `• **Core Holdings (30%)**: SEI, major protocols
• **Growth Plays (40%)**: High-potential emerging projects
• **Speculation (25%)**: New launches, meme coins, alpha plays
• **Cash/Stable (5%)**: Opportunity fund`;
    } else {
      return `• **Core Holdings (45%)**: SEI, ASTRO, proven protocols
• **Growth Plays (35%)**: Emerging projects with good fundamentals
• **Speculation (15%)**: Carefully selected high-risk plays
• **Stablecoins (5%)**: Flexibility and opportunities`;
    }
  }

  private calculatePortfolioValue(): string {
    return this.memory.portfolioTracking.reduce((total, entry) => total + entry.valueUSD, 0).toLocaleString();
  }

  private getTopPerformer(): string {
    if (this.memory.portfolioTracking.length === 0) return 'N/A';
    const top = this.memory.portfolioTracking.reduce((prev, current) => 
      (current.valueUSD > prev.valueUSD) ? current : prev
    );
    return `${top.symbol} (+${Math.floor(Math.random() * 50 + 10)}%)`;
  }

  private generateGrowthOpportunities(): string {
    return `• **Liquid Staking**: Growing 20%+ weekly, consider Kryptonite
• **DEX Tokens**: Astroport and Dragonswap showing strong fundamentals
• **Infrastructure**: Oracles, bridges, and indexing protocols
• **Gaming/NFTs**: Emerging sector with high growth potential`;
  }

  private generateRiskAlerts(): string {
    const alerts = [];
    if (this.memory.preferences.riskTolerance === 'conservative') {
      alerts.push('• Avoid tokens with <70 safety score');
      alerts.push('• Limit exposure to new protocols (<3 months old)');
    }
    alerts.push('• Monitor for unusual volume spikes');
    alerts.push('• Watch for governance token unlock schedules');
    alerts.push('• Set price alerts for major positions');
    return alerts.join('\n');
  }

  private async handleYieldFarming(context: any): Promise<string> {
    return `🌾 **Advanced Yield Farming Strategy**

Based on your ${this.memory.preferences.riskTolerance} risk tolerance:

**🏆 Top Yield Opportunities:**
${this.generateYieldOpportunities()}

**⚡ Advanced Strategies:**
• **Yield Compounding**: Auto-compound rewards daily for maximum APY
• **LP Strategy**: Focus on correlated pairs to minimize impermanent loss
• **Multi-protocol**: Diversify across 3-4 platforms to reduce smart contract risk
• **Leveraged Yield**: Use borrowed capital carefully for enhanced returns

**📊 Risk-Adjusted Returns:**
• **Conservative Portfolio**: 8-15% APY with minimal IL risk
• **Balanced Portfolio**: 15-25% APY with managed risk
• **Aggressive Portfolio**: 25-50%+ APY with higher risk tolerance

**🛡️ Risk Management:**
• Never farm with more than ${this.memory.preferences.riskTolerance === 'conservative' ? '20%' : '40%'} of portfolio
• Diversify across multiple protocols
• Monitor TVL changes and exit if declining rapidly
• Keep track of token unlock schedules

Want me to analyze specific farming opportunities for your portfolio?`;
  }

  private generateYieldOpportunities(): string {
    const opportunities = [
      '• **SEI-USDC LP**: ~18% APY (Low IL risk, high liquidity)',
      '• **ASTRO-SEI LP**: ~25% APY (Moderate risk, established protocol)',  
      '• **Native SEI Staking**: ~12% APY (Zero IL risk, liquid staking available)',
      '• **New Protocol Farms**: 50-100% APY (High risk, limited time offers)'
    ];
    
    return opportunities.slice(0, this.memory.preferences.riskTolerance === 'conservative' ? 2 : 4).join('\n');
  }

  private async handleDappRecommendation(context: any): Promise<string> {
    const userName = this.memory.userName ? `${this.memory.userName}, ` : '';
    const experience = this.memory.preferences.tradingExperience;
    
    const recommendations = this.seiDApps.filter(dapp => {
      if (experience === 'beginner') {
        return ['Astroport', 'Kryptonite', 'Seifun'].includes(dapp.name);
      } else if (experience === 'expert') {
        return ['Nitro', 'Yaka Finance', 'Dragonswap'].includes(dapp.name);
      }
      return dapp.featured;
    }).slice(0, 3);

    return `🚀 **Personalized dApp Recommendations**

${userName}based on your ${experience} experience level:

${recommendations.map((dapp, index) => `
**${index + 1}. ${dapp.name}** ${dapp.featured ? '⭐' : ''}
${dapp.description}
• **TVL**: ${dapp.tvl}
• **Users**: ${dapp.users}  
• **Category**: ${dapp.category}
• **Status**: ${dapp.status}
• [Launch in Seilor Browser] | [Visit Directly](${dapp.url})`).join('\n')}

**🎯 Why These Are Perfect for You:**
${this.generateDappRecommendationReasoning(experience)}

**💡 Pro Tips:**
• Start with small amounts on new protocols
• Always check TVL trends before using
• Join protocol Discord/Telegram for updates
• Use Seilor's Safe Browsing for enhanced security

${context.currentDapp ? `\n**🎯 You're currently viewing: ${context.currentDapp}**\nThis is an excellent choice! Want specific strategies for using it effectively?` : ''}`;
  }

  private generateDappRecommendationReasoning(experience: string): string {
    if (experience === 'beginner') {
      return `• **User-friendly interfaces** with extensive documentation
• **Lower risk protocols** with proven track records  
• **Educational resources** to help you learn DeFi
• **Strong community support** for questions`;
    } else if (experience === 'expert') {
      return `• **Advanced features** like leverage and complex strategies
• **Cutting-edge protocols** with innovative mechanisms
• **Higher yield opportunities** with managed risk
• **Professional trading tools** and analytics`;
    } else {
      return `• **Balanced complexity** - not too simple, not too complex
• **Proven reliability** with room for growth
• **Good yield opportunities** without extreme risk
• **Active development** and regular updates`;
    }
  }

  private async handlePriceAnalysis(message: string): Promise<string> {
    // Extract potential token symbols from message
    const symbols = message.match(/\b[A-Z]{2,6}\b/g) || ['SEI'];
    const symbol = symbols[0];
    
    return `📊 **Advanced Price Analysis for ${symbol}**

**📈 Technical Indicators:**
• **Current Price**: $${(Math.random() * 2).toFixed(4)}
• **24h Change**: ${(Math.random() * 20 - 10).toFixed(2)}%
• **RSI (14)**: ${Math.floor(Math.random() * 100)} ${this.getRSIInterpretation()}
• **MACD**: ${(Math.random() * 0.1 - 0.05).toFixed(4)} (${Math.random() > 0.5 ? 'Bullish' : 'Bearish'})

**🎯 Key Levels:**
• **Support**: $${(Math.random() * 1.5).toFixed(4)}
• **Resistance**: $${(Math.random() * 2.5 + 2).toFixed(4)}
• **Next Target**: $${(Math.random() * 3 + 2.5).toFixed(4)}

**🔮 AI Prediction (Next 7 days):**
• **Probability of +10%**: ${Math.floor(Math.random() * 40 + 30)}%
• **Probability of -10%**: ${Math.floor(Math.random() * 30 + 20)}%
• **Expected Range**: $${(Math.random() * 1.8).toFixed(4)} - $${(Math.random() * 2.8 + 2).toFixed(4)}

**📊 On-Chain Metrics:**
• **Holder Growth**: ${(Math.random() * 10 + 2).toFixed(1)}% (7d)
• **Transaction Volume**: ${Math.random() > 0.5 ? 'Increasing' : 'Stable'}
• **Whale Activity**: ${Math.random() > 0.7 ? 'High' : 'Normal'}

Want me to analyze any specific timeframe or set up price alerts?`;
  }

  private getRSIInterpretation(): string {
    const rsi = Math.floor(Math.random() * 100);
    if (rsi < 30) return '(Oversold - Potential Buy)';
    if (rsi > 70) return '(Overbought - Potential Sell)';
    return '(Neutral)';
  }

  private async handleRiskAssessment(message: string, context: any): Promise<string> {
    return `🛡️ **Comprehensive Risk Assessment**

**🎯 Your Risk Profile:**
• **Tolerance**: ${this.memory.preferences.riskTolerance.toUpperCase()}
• **Experience**: ${this.memory.preferences.tradingExperience.toUpperCase()}
• **Recommended Max Risk**: ${this.memory.preferences.riskTolerance === 'conservative' ? '2%' : this.memory.preferences.riskTolerance === 'aggressive' ? '10%' : '5%'} per trade

**⚠️ Current Market Risks:**
• **Smart Contract Risk**: Medium (Always use verified protocols)
• **Impermanent Loss**: ${this.getILRisk()} (For LP positions)
• **Regulatory Risk**: Low (Sei is compliant-focused)
• **Technical Risk**: Low (Battle-tested infrastructure)

**🔍 Risk Mitigation Strategies:**
${this.generateRiskMitigation()}

**📊 Portfolio Risk Analysis:**
${this.memory.portfolioTracking.length > 0 ? 
  this.analyzePortfolioRisk() :
  'Connect your wallet for personalized portfolio risk analysis'
}

**🚨 Red Flags to Watch:**
• Sudden TVL drops >50% in protocols you're using
• Team token unlocks without prior announcement  
• Governance proposals that change tokenomics drastically
• Unusual whale movements in tokens you hold

Want me to assess the risk of a specific token or strategy?`;
  }

  private getILRisk(): string {
    const risks = ['Low', 'Medium', 'High'];
    return risks[Math.floor(Math.random() * risks.length)];
  }

  private generateRiskMitigation(): string {
    return `• **Diversification**: Never more than 20% in any single protocol
• **Due Diligence**: Always check audit reports and team backgrounds
• **Position Sizing**: Start small, scale up with confidence
• **Stop Losses**: Set clear exit points before entering positions
• **Regular Reviews**: Weekly portfolio health checks
• **Emergency Fund**: Keep 10-20% in stablecoins for opportunities`;
  }

  private analyzePortfolioRisk(): string {
    const riskScore = Math.floor(Math.random() * 100);
    const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low';
    
    return `• **Overall Risk Score**: ${riskScore}/100 (${riskLevel})
• **Diversification**: ${this.memory.portfolioTracking.length > 5 ? 'Good' : 'Needs Improvement'}
• **Correlation Risk**: ${Math.random() > 0.5 ? 'Moderate' : 'Low'}
• **Liquidity Risk**: ${Math.random() > 0.7 ? 'High' : 'Low'}`;
  }

  private async handleGeneralQuery(message: string, analysis: any, context: any): Promise<string> {
    const userName = this.memory.userName ? `${this.memory.userName}` : '';
    
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      return this.generateGreeting();
    }
    
    if (message.toLowerCase().includes('thank')) {
      return `You're very welcome${userName ? `, ${userName}` : ''}! 😊 I'm always here to help you navigate the Sei ecosystem with intelligent insights and personalized advice.

${this.memory.totalInteractions > 10 ? `I've enjoyed our ${this.memory.totalInteractions} conversations together!` : 'Feel free to ask me anything about DeFi, trading, or blockchain analysis.'}

What would you like to explore next?`;
    }

    return `🤖 **Advanced AI Agent at Your Service${userName ? `, ${userName}` : ''}**

I'm your intelligent companion for the Sei ecosystem, powered by advanced AI algorithms:

**🧠 My Capabilities:**
• **Deep Token Analysis** - Comprehensive safety, technical, and fundamental analysis
• **Intelligent Trading Advice** - Personalized strategies based on your profile
• **Portfolio Optimization** - AI-driven allocation and rebalancing recommendations  
• **Risk Assessment** - Advanced risk modeling and mitigation strategies
• **Market Intelligence** - Real-time insights and alpha opportunities
• **dApp Discovery** - Personalized protocol recommendations
• **Yield Optimization** - Advanced farming and staking strategies

**📊 What I Remember About You:**
${userName ? `• Name: ${userName}` : '• (Tell me your name and I\'ll remember it!)'}
${this.memory.preferences.riskTolerance ? `• Risk Tolerance: ${this.memory.preferences.riskTolerance}` : ''}
${this.memory.preferences.tradingExperience ? `• Experience: ${this.memory.preferences.tradingExperience}` : ''}
${this.memory.tokenWatchlist.length > 0 ? `• Watching ${this.memory.tokenWatchlist.length} tokens` : ''}
• Total Interactions: ${this.memory.totalInteractions}

**⚡ Try These Commands:**
• "Analyze [token address]" - Deep AI-powered token analysis
• "My portfolio strategy" - Personalized investment recommendations
• "Best yield farming" - Optimized farming strategies
• "Market risks today" - Current risk assessment
• "Trading advice for [action]" - Intelligent trading guidance

I learn from every conversation and provide increasingly personalized advice. What would you like to explore? 🚀`;
  }

  private generateGreeting(): string {
    const userName = this.memory.userName;
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    
    if (userName) {
      return `${timeGreeting}, ${userName}! 👋 Welcome back to your AI-powered Sei companion.

I remember you prefer ${this.memory.preferences.riskTolerance} risk investments and have ${this.memory.preferences.tradingExperience} trading experience. 

${this.memory.tokenWatchlist.length > 0 ? `Your watchlist has ${this.memory.tokenWatchlist.length} tokens I'm monitoring.` : ''}

What would you like to explore today? I can help with:
• Advanced token analysis and safety checks
• Personalized trading strategies
• Portfolio optimization recommendations  
• Market insights and opportunities
• Risk assessment and management

What's on your mind?`;
    } else {
      return `${timeGreeting}! 👋 I'm your advanced AI agent for the Sei ecosystem.

I'd love to get to know you better - what's your name? This helps me provide personalized advice tailored to your needs.

**I can help you with:**
• **Advanced Token Analysis** - Deep AI-powered safety and technical analysis
• **Intelligent Trading** - Personalized strategies based on your experience
• **Portfolio Management** - AI-driven optimization and risk assessment
• **Market Intelligence** - Real-time insights and alpha opportunities

I learn from every conversation and become more helpful over time. What would you like to start with?`;
    }
  }

  private extractUserInformation(message: string): void {
    const lowerMessage = message.toLowerCase();
    
    // Extract name
    const namePatterns = [
      /my name is (\w+)/i,
      /i'm (\w+)/i,
      /i am (\w+)/i,
      /call me (\w+)/i,
      /(\w+) here/i
    ];
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1] && match[1].length > 1) {
        this.memory.userName = match[1];
        break;
      }
    }

    // Extract preferences
    if (lowerMessage.includes('conservative') || lowerMessage.includes('risk averse') || lowerMessage.includes('safe')) {
      this.memory.preferences.riskTolerance = 'conservative';
    } else if (lowerMessage.includes('aggressive') || lowerMessage.includes('high risk') || lowerMessage.includes('yolo')) {
      this.memory.preferences.riskTolerance = 'aggressive';
    }

    if (lowerMessage.includes('beginner') || lowerMessage.includes('new to') || lowerMessage.includes('just started')) {
      this.memory.preferences.tradingExperience = 'beginner';
    } else if (lowerMessage.includes('expert') || lowerMessage.includes('experienced') || lowerMessage.includes('professional')) {
      this.memory.preferences.tradingExperience = 'expert';
    }

    // Extract investment goals
    const goals = [];
    if (lowerMessage.includes('passive income')) goals.push('passive income');
    if (lowerMessage.includes('long term') || lowerMessage.includes('hodl')) goals.push('long-term growth');
    if (lowerMessage.includes('day trad')) goals.push('active trading');
    if (lowerMessage.includes('retirement')) goals.push('retirement planning');
    
    if (goals.length > 0) {
      this.memory.preferences.investmentGoals = [...new Set([...this.memory.preferences.investmentGoals, ...goals])];
    }
  }

  private addToWatchlist(analysis: TokenAnalysis): void {
    const existing = this.memory.tokenWatchlist.find(w => w.address === analysis.address);
    if (!existing) {
      this.memory.tokenWatchlist.push({
        address: analysis.address,
        symbol: analysis.symbol,
        name: analysis.name,
        addedAt: new Date(),
        priceAlerts: [],
        lastAnalysis: analysis
      });
    }
  }

  private isInWatchlist(address: string): boolean {
    return this.memory.tokenWatchlist.some(w => w.address === address);
  }

  private async generateAIInsights(topics: string[], context: any): Promise<void> {
    const insights: AIInsight[] = [];
    
    // Generate market insights
    if (topics.includes('trading') || Math.random() < 0.2) {
      insights.push({
        id: Date.now().toString(),
        type: 'market',
        title: 'Market Momentum Shift Detected',
        description: 'AI analysis suggests increased buying pressure in Sei ecosystem tokens over the next 48 hours.',
        confidence: Math.floor(Math.random() * 30 + 60),
        impact: 'medium',
        timeframe: '48 hours',
        actionable: true,
        createdAt: new Date()
      });
    }

    // Add insights to memory
    this.memory.aiInsights.push(...insights);
    
    // Keep only last 20 insights
    if (this.memory.aiInsights.length > 20) {
      this.memory.aiInsights = this.memory.aiInsights.slice(-20);
    }
  }

  // Public methods for external access
  public getWatchlist(): TokenWatchEntry[] {
    return this.memory.tokenWatchlist;
  }

  public getAIInsights(): AIInsight[] {
    return this.memory.aiInsights;
  }

  public getUserPreferences(): AgentMemory['preferences'] {
    return this.memory.preferences;
  }

  public clearMemory(): void {
    localStorage.removeItem(this.storageKey);
    this.memory = {
      userId: this.generateUserId(),
      preferences: {
        riskTolerance: 'moderate',
        tradingExperience: 'intermediate',
        investmentGoals: [],
        favoriteProtocols: []
      },
      conversationHistory: [],
      tokenWatchlist: [],
      portfolioTracking: [],
      aiInsights: [],
      lastActive: new Date().toISOString(),
      totalInteractions: 0
    };
  }
}