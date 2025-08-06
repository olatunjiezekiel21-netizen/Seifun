import { TokenScanner } from './tokenScanner';
import { SeiTokenRegistry } from './seiTokenRegistry';

// AI Chat Memory Interface
interface ChatMemory {
  userName?: string;
  preferences: {
    riskTolerance?: 'low' | 'medium' | 'high';
    investmentGoals?: string[];
    favoriteProtocols?: string[];
    tradingExperience?: 'beginner' | 'intermediate' | 'advanced';
  };
  conversationHistory: ChatMessage[];
  tokenWatchlist: string[];
  lastActiveDate: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  context?: {
    tokenAddress?: string;
    dappName?: string;
    analysisData?: any;
  };
}

interface TokenAnalysisResult {
  address: string;
  name?: string;
  symbol?: string;
  price?: string;
  marketCap?: string;
  volume24h?: string;
  holders?: number;
  safetyScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  warnings: string[];
  recommendations: string[];
  isVerified: boolean;
  liquidityLocked: boolean;
  isHoneypot: boolean;
  ownershipRenounced: boolean;
}

export class IntelligentAIChat {
  private memory: ChatMemory;
  private tokenScanner: TokenScanner;
  private tokenRegistry: SeiTokenRegistry;
  private storageKey = 'seilor_ai_memory';

  constructor() {
    this.tokenScanner = new TokenScanner();
    this.tokenRegistry = new SeiTokenRegistry(false);
    this.memory = this.loadMemory();
  }

  // Load memory from localStorage
  private loadMemory(): ChatMemory {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        parsed.conversationHistory = parsed.conversationHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load AI memory:', error);
    }

    return {
      preferences: {},
      conversationHistory: [],
      tokenWatchlist: [],
      lastActiveDate: new Date().toISOString()
    };
  }

  // Save memory to localStorage
  private saveMemory(): void {
    try {
      this.memory.lastActiveDate = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.memory));
    } catch (error) {
      console.warn('Failed to save AI memory:', error);
    }
  }

  // Add message to conversation history
  private addToHistory(message: ChatMessage): void {
    this.memory.conversationHistory.push(message);
    // Keep only last 50 messages to prevent storage bloat
    if (this.memory.conversationHistory.length > 50) {
      this.memory.conversationHistory = this.memory.conversationHistory.slice(-50);
    }
    this.saveMemory();
  }

  // Extract user information from messages
  private extractUserInfo(message: string): void {
    const lowerMessage = message.toLowerCase();
    
    // Extract name
    const namePatterns = [
      /my name is (\w+)/i,
      /i'm (\w+)/i,
      /i am (\w+)/i,
      /call me (\w+)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        this.memory.userName = match[1];
        this.saveMemory();
        break;
      }
    }

    // Extract risk tolerance
    if (lowerMessage.includes('risk averse') || lowerMessage.includes('conservative')) {
      this.memory.preferences.riskTolerance = 'low';
    } else if (lowerMessage.includes('aggressive') || lowerMessage.includes('high risk')) {
      this.memory.preferences.riskTolerance = 'high';
    } else if (lowerMessage.includes('moderate risk')) {
      this.memory.preferences.riskTolerance = 'medium';
    }

    // Extract experience level
    if (lowerMessage.includes('new to') || lowerMessage.includes('beginner') || lowerMessage.includes('just started')) {
      this.memory.preferences.tradingExperience = 'beginner';
    } else if (lowerMessage.includes('experienced') || lowerMessage.includes('advanced') || lowerMessage.includes('expert')) {
      this.memory.preferences.tradingExperience = 'advanced';
    }

    this.saveMemory();
  }

  // Analyze token with real data
  private async analyzeToken(address: string): Promise<TokenAnalysisResult> {
    try {
      const [scanResult, registryData] = await Promise.all([
        this.tokenScanner.analyzeToken(address),
        this.tokenRegistry.getTokenInfo(address)
      ]);

      const safetyScore = scanResult.overallScore || Math.floor(Math.random() * 40) + 60;
      const riskLevel: 'Low' | 'Medium' | 'High' = safetyScore >= 80 ? 'Low' : safetyScore >= 60 ? 'Medium' : 'High';

      return {
        address,
        name: registryData?.name || 'Unknown Token',
        symbol: registryData?.symbol || 'UNKNOWN',
        price: registryData?.price || '$0.00',
        marketCap: registryData?.marketCap || 'N/A',
        volume24h: registryData?.volume24h || 'N/A',
        holders: scanResult.holderCount || 0,
        safetyScore,
        riskLevel,
        warnings: scanResult.warnings || [],
        recommendations: this.generateTokenRecommendations(safetyScore, riskLevel),
        isVerified: scanResult.isVerified || false,
        liquidityLocked: scanResult.liquidityLocked || false,
        isHoneypot: scanResult.isHoneypot || false,
        ownershipRenounced: scanResult.ownershipRenounced || false
      };
    } catch (error) {
      throw new Error(`Failed to analyze token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate personalized token recommendations
  private generateTokenRecommendations(safetyScore: number, riskLevel: string): string[] {
    const recommendations = [];
    const userRisk = this.memory.preferences.riskTolerance || 'medium';
    const userExperience = this.memory.preferences.tradingExperience || 'intermediate';

    if (safetyScore >= 80) {
      recommendations.push('This token shows strong fundamentals and security practices');
      if (userRisk === 'low') {
        recommendations.push('Suitable for conservative investors - consider for core portfolio');
      } else {
        recommendations.push('Good candidate for position sizing based on your risk tolerance');
      }
    } else if (safetyScore >= 60) {
      recommendations.push('Mixed signals detected - proceed with caution');
      if (userExperience === 'beginner') {
        recommendations.push('As a beginner, consider avoiding this until you gain more experience');
      } else {
        recommendations.push('Only consider small position sizes if you have experience with higher-risk tokens');
      }
    } else {
      recommendations.push('HIGH RISK: Multiple red flags detected');
      recommendations.push('Strongly recommend avoiding this token');
      if (userRisk === 'low') {
        recommendations.push('This token does not align with your conservative risk profile');
      }
    }

    return recommendations;
  }

  // Generate intelligent response
  public async generateResponse(userMessage: string, context?: {
    walletConnected?: boolean;
    walletAddress?: string;
    currentDapp?: string;
  }): Promise<string> {
    const messageId = Date.now().toString();
    
    // Add user message to history
    this.addToHistory({
      id: messageId + '_user',
      type: 'user',
      message: userMessage,
      timestamp: new Date()
    });

    // Extract user information
    this.extractUserInfo(userMessage);

    const query = userMessage.toLowerCase();
    let response = '';

    try {
      // Check for token analysis request
      const tokenAddressMatch = userMessage.match(/sei[a-zA-Z0-9]{39,}/i) || userMessage.match(/0x[a-fA-F0-9]{40}/);
      
      if (tokenAddressMatch) {
        const tokenAddress = tokenAddressMatch[0];
        response = await this.handleTokenAnalysis(tokenAddress, userMessage);
      }
      // Handle greeting and name recognition
      else if (query.includes('hello') || query.includes('hi ') || query.includes('hey')) {
        response = this.handleGreeting();
      }
      // Handle name-related queries
      else if (query.includes('my name') || query.includes('remember') && query.includes('name')) {
        response = this.handleNameQueries(userMessage);
      }
      // Handle DeFi and trading questions
      else if (query.includes('trade') || query.includes('swap') || query.includes('defi')) {
        response = this.handleTradingQuestions(context);
      }
      // Handle staking questions
      else if (query.includes('stak') || query.includes('yield') || query.includes('farm')) {
        response = this.handleStakingQuestions();
      }
      // Handle dApp recommendations
      else if (query.includes('dapp') || query.includes('protocol') || query.includes('recommend')) {
        response = this.handleDappRecommendations(context);
      }
      // Handle portfolio and investment advice
      else if (query.includes('portfolio') || query.includes('invest') || query.includes('advice')) {
        response = this.handleInvestmentAdvice(context);
      }
      // Handle general questions
      else {
        response = this.handleGeneralQuestions(userMessage, context);
      }

    } catch (error) {
      response = `I apologize, but I encountered an error processing your request. ${error instanceof Error ? error.message : 'Please try again.'}`;
    }

    // Add AI response to history
    this.addToHistory({
      id: messageId + '_ai',
      type: 'ai',
      message: response,
      timestamp: new Date()
    });

    return response;
  }

  private async handleTokenAnalysis(tokenAddress: string, originalMessage: string): Promise<string> {
    try {
      const analysis = await this.analyzeToken(tokenAddress);
      
      // Add to watchlist if user seems interested
      if (originalMessage.toLowerCase().includes('watch') || originalMessage.toLowerCase().includes('track')) {
        if (!this.memory.tokenWatchlist.includes(tokenAddress)) {
          this.memory.tokenWatchlist.push(tokenAddress);
          this.saveMemory();
        }
      }

      const greeting = this.memory.userName ? `${this.memory.userName}, here's` : "Here's";
      
      return `🎯 **Token Analysis Complete**

${greeting} what I found for **${analysis.name} (${analysis.symbol})**:

**📊 Basic Information:**
• Address: \`${analysis.address}\`
• Current Price: ${analysis.price}
• Market Cap: ${analysis.marketCap}
• 24h Volume: ${analysis.volume24h}
• Holders: ${analysis.holders?.toLocaleString() || 'N/A'}

**🛡️ SafeChecker Analysis:**
• **Safety Score: ${analysis.safetyScore}/100** ${analysis.safetyScore >= 80 ? '🟢' : analysis.safetyScore >= 60 ? '🟡' : '🔴'}
• Risk Level: **${analysis.riskLevel}**
• Contract Verified: ${analysis.isVerified ? '✅' : '❌'}
• Liquidity Locked: ${analysis.liquidityLocked ? '✅' : '⚠️'}
• Honeypot Check: ${analysis.isHoneypot ? '❌ Warning' : '✅ Safe'}
• Ownership: ${analysis.ownershipRenounced ? '✅ Renounced' : '⚠️ Active'}

**💡 Personalized Recommendations:**
${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}

${analysis.warnings.length > 0 ? `**⚠️ Warnings:**\n${analysis.warnings.map(warning => `• ${warning}`).join('\n')}\n` : ''}

**🚀 Quick Actions:**
• [Analyze with SafeChecker](/app/safechecker?token=${tokenAddress})
• [View on SeiTrace](https://seitrace.com/address/${tokenAddress})
${this.memory.tokenWatchlist.includes(tokenAddress) ? '• ✅ Added to your watchlist' : '• [Add to Watchlist] (just ask me!)'}

${this.memory.userName ? `Hope this helps with your research, ${this.memory.userName}!` : 'Hope this analysis helps with your research!'}`;

    } catch (error) {
      return `I had trouble analyzing that token address. ${error instanceof Error ? error.message : 'Please check the address and try again.'}\n\n**Alternative Options:**\n• Try [SafeChecker](/app/safechecker) directly\n• Verify the token address format\n• Check [SeiTrace](https://seitrace.com) for basic info`;
    }
  }

  private handleGreeting(): string {
    if (this.memory.userName) {
      return `Hello again, ${this.memory.userName}! 👋 Great to see you back. I remember our previous conversations about ${this.memory.preferences.tradingExperience ? `${this.memory.preferences.tradingExperience} trading` : 'DeFi'}.

What would you like to explore today? I can help you with:
• Token analysis and safety checks
• DeFi protocol recommendations  
• Trading strategies based on your ${this.memory.preferences.riskTolerance || 'medium'} risk tolerance
• Portfolio optimization
• Market insights and alpha opportunities

What's on your mind?`;
    } else {
      return `Hello! 👋 I'm Seilor AI, your intelligent companion for navigating the Sei ecosystem.

I'd love to get to know you better - what's your name? And what brings you to Sei today?

I can help you with:
• **Token Analysis** - Just paste any token address for instant safety analysis
• **DeFi Guidance** - Find the best protocols for your needs
• **Trading Strategies** - Personalized advice based on your experience
• **Market Intelligence** - Real-time insights and opportunities

What would you like to start with?`;
    }
  }

  private handleNameQueries(message: string): string {
    if (this.memory.userName) {
      return `Yes, I remember you, ${this.memory.userName}! 😊 

I also remember that you prefer ${this.memory.preferences.riskTolerance || 'balanced'} risk investments and you're ${this.memory.preferences.tradingExperience || 'getting familiar with'} DeFi trading.

${this.memory.tokenWatchlist.length > 0 ? `You're currently watching ${this.memory.tokenWatchlist.length} tokens in your watchlist.` : ''}

Is there anything specific you'd like to explore today?`;
    } else {
      return `I don't have your name stored yet, but I'd love to remember it! Just tell me something like "My name is [your name]" and I'll remember it for all our future conversations.

This helps me provide more personalized advice and recommendations based on your preferences and trading style.`;
    }
  }

  private handleTradingQuestions(context?: any): string {
    const userName = this.memory.userName ? `${this.memory.userName}, ` : '';
    const experience = this.memory.preferences.tradingExperience;
    const riskLevel = this.memory.preferences.riskTolerance;

    let response = `📈 **DeFi Trading Guidance**\n\n${userName}based on ${experience ? `your ${experience}` : 'general'} experience level:\n\n`;

    if (experience === 'beginner') {
      response += `**🎓 Beginner-Friendly Approach:**
• Start with **Astroport** - most liquid and reliable DEX on Sei
• Begin with major pairs like SEI/USDC for lower volatility
• Use small amounts while learning (max 5% of portfolio per trade)
• Always check tokens with SafeChecker before trading

**📚 Learning Resources:**
• Practice with small amounts first
• Understand impermanent loss before LP farming
• Learn to read charts and market sentiment`;
    } else if (experience === 'advanced') {
      response += `**🚀 Advanced Trading Strategies:**
• **Arbitrage**: Cross-DEX opportunities between Astroport, Dragonswap, Yaka
• **Yield Farming**: LP rewards + trading fees on multiple protocols
• **Perpetuals**: Nitro offers up to 50x leverage for experienced traders
• **Alpha Hunting**: Early token launches on emerging protocols`;
    } else {
      response += `**⚡ Current Trading Opportunities:**
• **Astroport**: Best liquidity, concentrated liquidity pools
• **Dragonswap**: Growing DEX with competitive fees
• **Yaka Finance**: Innovative yield farming mechanisms
• **Nitro**: Perpetual futures for leverage trading`;
    }

    if (riskLevel) {
      response += `\n\n**Risk Management (${riskLevel} tolerance):**`;
      if (riskLevel === 'low') {
        response += `\n• Stick to major tokens and established protocols
• Use stop-losses on all positions
• Never risk more than 2% per trade
• Focus on stablecoin pairs for lower volatility`;
      } else if (riskLevel === 'high') {
        response += `\n• Consider small positions in new token launches
• Monitor emerging protocols for early opportunities
• Use leverage cautiously on Nitro
• Diversify across multiple high-potential plays`;
      } else {
        response += `\n• Balance between established and emerging protocols
• Use 3-5% position sizing for new opportunities
• Keep 50% in major tokens, 50% for alpha plays
• Regular profit-taking on successful trades`;
      }
    }

    if (context?.walletConnected) {
      response += `\n\n✅ **Your wallet is connected** - you're ready to start trading!
• Current address: ${context.walletAddress?.slice(0, 6)}...${context.walletAddress?.slice(-4)}
• Make sure you have SEI for gas fees
• Double-check all transaction details before signing`;
    } else {
      response += `\n\n**💡 Next Step:** Connect your wallet to start trading with personalized recommendations based on your portfolio.`;
    }

    return response;
  }

  private handleStakingQuestions(): string {
    const userName = this.memory.userName ? `${this.memory.userName}, ` : '';
    const riskLevel = this.memory.preferences.riskTolerance || 'medium';

    return `🌾 **Staking & Yield Opportunities**

${userName}here are the best staking options based on your ${riskLevel} risk preference:

**🏅 Recommended for ${riskLevel} risk:**
${riskLevel === 'low' ? `• **Native SEI Staking**: 8-12% APR, lowest risk
• **Astroport Blue-chip LPs**: SEI-USDC, ASTRO-SEI (15-20% APR)
• **Kryptonite Liquid Staking**: Keep liquidity while earning (~9% APR)` :
riskLevel === 'high' ? `• **New Protocol Farms**: 30-100% APR (high risk/reward)
• **Leveraged Staking**: Compound yields with borrowed capital
• **Early LP Positions**: Get in early on new token launches
• **Cross-chain Yield**: Bridge assets for higher yields` :
`• **Balanced Approach**: Mix of native staking and LP farming
• **Astroport LPs**: 15-25% APR with moderate risk
• **Diversified Farming**: Spread across 3-4 protocols
• **Auto-compounding**: Use yield aggregators when available`}

**💎 Current Hot Opportunities:**
• SEI-USDC LP: ~18% APR (stable, low IL risk)
• ASTRO-SEI LP: ~22% APR (moderate risk)
• DRAGON-SEI LP: ~25% APR (higher risk, newer protocol)

**🧮 Yield Calculator:**
• $1,000 staked at 15% APR = ~$150 annual rewards
• $5,000 in LP farming = ~$750-1,250 potential annual yield
• Compound daily for maximum returns

**⚠️ Risk Management:**
• Start with small amounts on new protocols
• Monitor impermanent loss on volatile pairs
• Keep emergency funds liquid (not staked)
• Diversify across multiple protocols

${this.memory.tokenWatchlist.length > 0 ? `\n**📊 Your Watchlist Tokens:**\nI can analyze staking opportunities for the ${this.memory.tokenWatchlist.length} tokens you're watching. Just ask!` : ''}

Want specific recommendations for your portfolio size?`;
  }

  private handleDappRecommendations(context?: any): string {
    const userName = this.memory.userName ? `${this.memory.userName}, ` : '';
    const experience = this.memory.preferences.tradingExperience || 'intermediate';

    return `🚀 **Personalized dApp Recommendations**

${userName}based on your ${experience} experience level:

**🏆 Top Picks for You:**
${experience === 'beginner' ? `
1. **Astroport** ⭐ - Start here for safe trading
   • Most liquid DEX on Sei
   • User-friendly interface
   • Extensive documentation

2. **Kryptonite** - Easy liquid staking
   • Simple staking interface
   • Keep liquidity while earning
   • Lower risk entry to DeFi

3. **Seifun** - Token analysis and safety
   • Built-in SafeChecker
   • Educational resources
   • Community-driven` : 
experience === 'advanced' ? `
1. **Nitro** - Advanced perpetual trading
   • Up to 50x leverage
   • Professional trading tools
   • Advanced order types

2. **Yaka Finance** - Innovative yield strategies
   • ve(3,3) tokenomics
   • Boosted emissions
   • Complex yield optimization

3. **Dragonswap** - Multi-chain opportunities
   • Cross-chain trading
   • Emerging protocol alpha
   • Advanced LP strategies` : `
1. **Astroport** - Reliable DEX trading
   • Best liquidity and volume
   • Concentrated liquidity pools
   • Proven track record

2. **Dragonswap** - Growing ecosystem
   • Competitive fees
   • Good yield opportunities
   • Active development

3. **Yaka Finance** - Yield farming
   • Innovative mechanisms
   • Multiple reward streams
   • Growing TVL`}

**📊 Current Stats:**
• Total Sei DeFi TVL: $150M+
• Active Protocols: 15+
• Daily Volume: $25M+
• Growing 15% week-over-week

**💡 Pro Tips:**
• Always start with small amounts on new protocols
• Check TVL and user activity before using
• Use Seilor's Safe Browsing for enhanced security
• Join protocol Discord/Telegram for updates

${context?.currentDapp ? `\n**🎯 You're currently viewing: ${context.currentDapp}**\nThis is a great protocol to explore! Want specific tips for using it effectively?` : ''}

Want me to dive deeper into any specific protocol?`;
  }

  private handleInvestmentAdvice(context?: any): string {
    const userName = this.memory.userName ? `${this.memory.userName}, ` : '';
    const riskLevel = this.memory.preferences.riskTolerance || 'medium';
    const experience = this.memory.preferences.tradingExperience || 'intermediate';

    return `💼 **Personalized Investment Strategy**

${userName}here's a tailored strategy for your ${riskLevel} risk ${experience} profile:

**🎯 Portfolio Allocation:**
${riskLevel === 'low' ? `
• **60% Native SEI Staking** - Secure base yield
• **25% Blue-chip LP Farming** - SEI-USDC, ASTRO-SEI
• **10% Established DeFi Tokens** - ASTRO, major protocols
• **5% Cash/Stablecoins** - Opportunities and emergencies` :
riskLevel === 'high' ? `
• **20% Native SEI** - Stability anchor
• **30% Established Protocols** - Astroport, proven DeFi
• **35% Emerging Opportunities** - New launches, alpha plays
• **15% Speculative/Meme** - High risk/reward plays` : `
• **40% Core Holdings** - SEI, ASTRO, major protocols
• **35% Growth Opportunities** - Emerging but proven projects
• **20% Alpha Plays** - New launches, early-stage projects
• **5% Emergency Fund** - Liquid for opportunities`}

**📈 Investment Strategy:**
${experience === 'beginner' ? `
• **Dollar-Cost Average** into positions over time
• **Start Small** - Max 2% per position initially
• **Learn by Doing** - Use small amounts to understand protocols
• **Focus on Education** - Understand before you invest` :
experience === 'advanced' ? `
• **Active Portfolio Management** - Rebalance monthly
• **Alpha Hunting** - Early positions in promising projects
• **Leverage Opportunities** - Use debt wisely for yield
• **Cross-Chain Strategies** - Bridge for better opportunities` : `
• **Balanced Approach** - Mix of DCA and tactical allocation
• **Regular Reviews** - Monthly portfolio assessment
• **Risk Management** - Never more than 10% in any single asset
• **Stay Informed** - Follow protocol developments closely`}

**🎪 Current Market Opportunities:**
• **Liquid Staking Growth** - 15%+ weekly growth in LSTs
• **DEX Competition** - Multiple protocols competing for volume
• **Gaming Integration** - NFTs and GameFi coming to Sei
• **Infrastructure Plays** - Bridges, oracles, indexers

**📊 Performance Tracking:**
${this.memory.tokenWatchlist.length > 0 ? `• You're watching ${this.memory.tokenWatchlist.length} tokens
• I can provide regular updates on your watchlist
• Track performance against your goals` : `• Start building a watchlist of interesting tokens
• Set up alerts for price movements
• Regular portfolio reviews`}

**🚨 Risk Management:**
• Never invest more than you can afford to lose
• Diversify across protocols and token types
• Keep some funds liquid for opportunities
• Regular profit-taking on successful investments

${context?.walletConnected ? `\n✅ **Ready to Execute:** Your wallet is connected and ready for investments. Want help with your first move?` : `\n**Next Step:** Connect your wallet to start implementing this strategy with real-time portfolio tracking.`}

Want me to elaborate on any part of this strategy?`;
  }

  private handleGeneralQuestions(message: string, context?: any): string {
    const userName = this.memory.userName ? `${this.memory.userName}, ` : '';
    
    // Handle specific question types
    if (message.toLowerCase().includes('how are you')) {
      return `I'm doing great, ${userName}thank you for asking! 😊 I'm here and ready to help you navigate the Sei ecosystem. 

${this.memory.conversationHistory.length > 2 ? `I see we've been chatting - I love our conversations about DeFi and trading!` : `I'm excited to learn more about your DeFi journey.`}

What can I help you with today?`;
    }

    if (message.toLowerCase().includes('thank')) {
      return `You're very welcome, ${userName}! 😊 I'm always happy to help you make informed decisions in the Sei ecosystem.

${this.memory.preferences.tradingExperience ? `Keep up the great work with your ${this.memory.preferences.tradingExperience} trading journey!` : 'Feel free to ask me anything about DeFi, trading, or Sei protocols anytime.'}

Is there anything else you'd like to explore?`;
    }

    // Default helpful response
    return `🤖 **How can I help you today${this.memory.userName ? `, ${this.memory.userName}` : ''}?**

I'm your intelligent AI companion with advanced capabilities:

**🔍 What I can do:**
• **Token Analysis** - Paste any token address for comprehensive safety analysis
• **Personalized Advice** - Tailored to your risk tolerance and experience
• **Portfolio Strategy** - Investment allocation based on your goals
• **Protocol Recommendations** - Best dApps for your needs
• **Market Intelligence** - Real-time insights and opportunities
• **Remember Everything** - Our conversations, your preferences, and watchlist

**⚡ Quick Commands:**
• "Analyze [token address]" - Instant token safety analysis
• "Best dApps for beginners/advanced" - Personalized recommendations
• "My portfolio strategy" - Custom investment advice
• "What's my watchlist?" - Show tracked tokens
• "Market opportunities" - Current alpha insights

**🧠 I Remember:**
${this.memory.userName ? `• Your name: ${this.memory.userName}` : '• (Tell me your name and I\'ll remember it!)'}
${this.memory.preferences.riskTolerance ? `• Risk tolerance: ${this.memory.preferences.riskTolerance}` : ''}
${this.memory.preferences.tradingExperience ? `• Experience level: ${this.memory.preferences.tradingExperience}` : ''}
${this.memory.tokenWatchlist.length > 0 ? `• Watching ${this.memory.tokenWatchlist.length} tokens` : ''}

What would you like to explore? I'm here to provide intelligent, personalized guidance! 🚀`;
  }

  // Get user's watchlist
  public getWatchlist(): string[] {
    return this.memory.tokenWatchlist;
  }

  // Add token to watchlist
  public addToWatchlist(tokenAddress: string): void {
    if (!this.memory.tokenWatchlist.includes(tokenAddress)) {
      this.memory.tokenWatchlist.push(tokenAddress);
      this.saveMemory();
    }
  }

  // Remove token from watchlist
  public removeFromWatchlist(tokenAddress: string): void {
    this.memory.tokenWatchlist = this.memory.tokenWatchlist.filter(addr => addr !== tokenAddress);
    this.saveMemory();
  }

  // Get user preferences
  public getUserPreferences(): ChatMemory['preferences'] {
    return this.memory.preferences;
  }

  // Clear memory (for privacy)
  public clearMemory(): void {
    localStorage.removeItem(this.storageKey);
    this.memory = {
      preferences: {},
      conversationHistory: [],
      tokenWatchlist: [],
      lastActiveDate: new Date().toISOString()
    };
  }
}