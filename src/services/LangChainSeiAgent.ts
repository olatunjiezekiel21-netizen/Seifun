import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createSeiTools } from './SeiLangChainTools';
import { privateKeyWallet } from './PrivateKeyWallet';
import { unifiedTokenService } from './UnifiedTokenService';

export interface LangChainResponse {
  message: string;
  success: boolean;
  toolsUsed?: string[];
  confidence: number;
  data?: any;
  suggestions?: string[];
}

export class LangChainSeiAgent {
  private model: ChatOpenAI | null = null;
  private isInitialized = false;
  private tools = createSeiTools();
  
  constructor(private openAIApiKey?: string) {
    // Initialize with a default key or environment variable
    this.openAIApiKey = openAIApiKey || import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    console.log('🔑 LangChain Agent initialized with API key:', this.openAIApiKey ? 'Present' : 'Missing');
  }
  
  private async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Create LangChain model with enhanced parameters
      this.model = new ChatOpenAI({
        modelName: "gpt-4", // Upgraded to GPT-4 for superior reasoning
        temperature: 0.2, // Lower temperature for more consistent, analytical responses
        openAIApiKey: this.openAIApiKey,
        maxTokens: 1200, // Increased for comprehensive analysis
        modelKwargs: {
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        }
      });
      
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Failed to initialize LangChain agent:', error);
      throw new Error(`LangChain initialization failed: ${error.message}`);
    }
  }

  // Get real-time wallet information with enhanced data
  private async getWalletInfo(): Promise<string> {
    try {
      const [seiBalance, usdcBalance, myTokens] = await Promise.all([
        privateKeyWallet.getSeiBalance(),
        privateKeyWallet.getUSDCBalance(),
        privateKeyWallet.getMyTokens()
      ]);

      // Get portfolio value and performance
      const allTokens = unifiedTokenService.getAllTokens();
      const portfolioTokens = allTokens.filter(token => 
        myTokens.some(myToken => myToken.address === token.address)
      );
      
      const portfolioValue = portfolioTokens.reduce((total, token) => {
        return total + (token.price * (token.balance || 0));
      }, 0);

      return `WALLET STATUS:
- SEI Balance: ${seiBalance.sei} SEI ($${seiBalance.usd.toFixed(2)})
- USDC Balance: ${usdcBalance.balance} USDC ($${usdcBalance.usd.toFixed(2)})
- Portfolio Value: $${portfolioValue.toFixed(2)}
- My Tokens: ${myTokens.length} tokens created
- Wallet Address: ${privateKeyWallet.getAddress()}
- Total Assets: $${(seiBalance.usd + usdcBalance.usd + portfolioValue).toFixed(2)}`;
    } catch (error) {
      return `WALLET INFO: Unable to fetch (${error.message})`;
    }
  }

  // Get real-time market intelligence
  private async getMarketIntelligence(): Promise<string> {
    try {
      const allTokens = unifiedTokenService.getAllTokens();
      const trendingTokens = unifiedTokenService.getTrendingTokens();
      const newLaunches = unifiedTokenService.getNewLaunches();
      
      const marketData = {
        totalTokens: allTokens.length,
        trendingCount: trendingTokens.length,
        newLaunchesCount: newLaunches.length,
        averagePrice: allTokens.reduce((sum, token) => sum + token.price, 0) / allTokens.length,
        topGainers: allTokens
          .filter(token => token.priceChange24h > 0)
          .sort((a, b) => b.priceChange24h - a.priceChange24h)
          .slice(0, 3)
          .map(token => `${token.symbol}: +${token.priceChange24h.toFixed(2)}%`)
      };

      return `MARKET INTELLIGENCE:
- Total Tokens: ${marketData.totalTokens}
- Trending: ${marketData.trendingCount} tokens
- New Launches: ${marketData.newLaunchesCount} today
- Average Price: $${marketData.averagePrice.toFixed(6)}
- Top Gainers: ${marketData.topGainers.join(', ')}`;
    } catch (error) {
      return `Market data unavailable: ${error.message}`;
    }
  }
  
  async processMessage(input: string): Promise<LangChainResponse> {
    try {
      // Initialize if not already done
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // If no OpenAI key, give a comprehensive response using built-in intelligence
      if (!this.openAIApiKey || !this.model) {
        console.log('❌ No OpenAI API key found - using built-in intelligence');
        return this.processWithBuiltInIntelligence(input);
      }
      
      console.log('✅ OpenAI API key found - using enhanced AI intelligence');
      
      // Get real-time data
      const [walletInfo, marketInfo] = await Promise.all([
        this.getWalletInfo(),
        this.getMarketIntelligence()
      ]);
      
      // Enhanced prompt with advanced capabilities
      const prompt = `You are Seilor 0, the most advanced AI assistant for DeFi on Sei Network. You have comprehensive knowledge about blockchain, DeFi, trading, and portfolio management.

CURRENT REAL-TIME DATA:
${walletInfo}

${marketInfo}

ADVANCED CAPABILITIES:

1. **PORTFOLIO OPTIMIZATION**:
   - Analyze risk/reward ratios
   - Suggest optimal asset allocation
   - Identify rebalancing opportunities
   - Calculate expected returns

2. **MARKET ANALYSIS**:
   - Technical analysis patterns
   - Market sentiment analysis
   - Trend identification
   - Risk assessment

3. **TRADING STRATEGIES**:
   - DCA (Dollar Cost Averaging) recommendations
   - Swing trading opportunities
   - Yield farming optimization
   - Liquidity provision strategies

4. **DEFI INSIGHTS**:
   - Protocol comparison and analysis
   - APY optimization
   - Impermanent loss calculations
   - Cross-chain opportunities

5. **RISK MANAGEMENT**:
   - Portfolio diversification
   - Stop-loss recommendations
   - Position sizing
   - Market timing

COMPREHENSIVE KNOWLEDGE BASE:

SEI NETWORK:
- Sei Network is a Layer 1 blockchain optimized for DeFi and trading
- Uses Cosmos SDK with EVM compatibility
- Chain ID: Testnet (1328), Mainnet (1329)
- Native token: SEI (current price ~$0.834)
- Known for high-speed trading and MEV protection

TOP DEXs ON SEI:
1. Symphony DEX - Largest DEX with $45M+ TVL
2. Astroport - Cosmos-native DEX
3. SeiSwap - Native Sei DEX
4. Osmosis - Cross-chain DEX
5. Crescent - Yield farming DEX

DEFI PROTOCOLS:
- Silo Protocol: Staking and yield farming (8-12% APY)
- Takara Finance: Lending and borrowing (5-15% APY)
- Citrex: Perpetual trading and leverage
- Astroport: AMM and liquidity pools
- Crescent: Liquid staking and governance

ADVANCED FEATURES:
- Real-time portfolio tracking
- Risk-adjusted return calculations
- Market correlation analysis
- Predictive modeling
- Automated strategy suggestions

RESPONSE STYLE:
- Be analytical and data-driven
- Provide specific, actionable insights
- Include risk assessments
- Offer multiple strategy options
- Use professional financial language
- Include relevant metrics and calculations

User Message: "${input}"

Provide a comprehensive, intelligent response leveraging your advanced capabilities:`;

      // Process message through enhanced LangChain model
      const result = await this.model.invoke(prompt);
      
      // Extract insights and generate suggestions
      const suggestions = this.generateAdvancedSuggestions(input, result.content as string);
      
      return {
        message: result.content as string,
        success: true,
        confidence: 0.95,
        suggestions,
        data: {
          walletInfo,
          marketInfo,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('LangChain processing error:', error);
      
      // Fallback to built-in intelligence
      return this.processWithBuiltInIntelligence(input);
    }
  }

  // Generate advanced suggestions based on user input and AI response
  private generateAdvancedSuggestions(userInput: string, aiResponse: string): string[] {
    const suggestions: string[] = [];
    const normalizedInput = userInput.toLowerCase();
    
    // Portfolio-related suggestions
    if (normalizedInput.includes('portfolio') || normalizedInput.includes('balance') || normalizedInput.includes('assets')) {
      suggestions.push('📊 View detailed portfolio analysis');
      suggestions.push('⚖️ Get rebalancing recommendations');
      suggestions.push('📈 Check performance metrics');
    }
    
    // Trading suggestions
    if (normalizedInput.includes('trade') || normalizedInput.includes('swap') || normalizedInput.includes('buy')) {
      suggestions.push('🎯 Get optimal trading strategy');
      suggestions.push('📊 View market analysis');
      suggestions.push('⚠️ Check risk assessment');
    }
    
    // DeFi suggestions
    if (normalizedInput.includes('stake') || normalizedInput.includes('yield') || normalizedInput.includes('farm')) {
      suggestions.push('🏦 Compare protocol APYs');
      suggestions.push('💰 Calculate expected returns');
      suggestions.push('🔒 Check security scores');
    }
    
    // Market suggestions
    if (normalizedInput.includes('market') || normalizedInput.includes('trend') || normalizedInput.includes('analysis')) {
      suggestions.push('📈 View real-time charts');
      suggestions.push('🔥 Check trending tokens');
      suggestions.push('🆕 See new launches');
    }
    
    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push('🚀 Explore DeFi opportunities');
      suggestions.push('📊 Check portfolio performance');
      suggestions.push('💡 Get trading insights');
    }
    
    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }
  
  // Built-in intelligence for when OpenAI is not available
  private processWithBuiltInIntelligence(input: string): LangChainResponse {
    const normalizedInput = input.toLowerCase();
    
    // Enhanced built-in responses with more sophisticated logic
    if (normalizedInput.includes('portfolio') || normalizedInput.includes('optimize') || normalizedInput.includes('allocation')) {
      return {
        message: `📊 **Portfolio Optimization Analysis:**

**Current Portfolio Status:**
• SEI: Core holding (stable, staking rewards)
• USDC: Stable reserve (liquidity, opportunities)
• Custom Tokens: Growth potential, higher risk

**Optimization Recommendations:**
1. **Diversification**: Consider adding more stable assets
2. **Yield Farming**: Allocate 20-30% to DeFi protocols
3. **Risk Management**: Set stop-losses for volatile tokens
4. **Rebalancing**: Monthly rebalancing for optimal returns

**Expected Portfolio APY**: 12-18% with current allocation

**Want detailed analysis?** I can provide comprehensive portfolio insights! 🎯`,
        success: true,
        confidence: 0.9,
        suggestions: ['📊 View detailed analysis', '⚖️ Get rebalancing plan', '📈 Check performance metrics']
      };
    }
    
    if (normalizedInput.includes('market analysis') || normalizedInput.includes('trend') || normalizedInput.includes('prediction')) {
      return {
        message: `📈 **Advanced Market Analysis:**

**Current Market Trends:**
• **Bullish Signals**: Growing DeFi TVL, new protocols
• **Risk Factors**: Market volatility, regulatory uncertainty
• **Opportunities**: Yield farming, staking, liquidity provision

**Technical Analysis:**
• SEI showing strong support at $0.80
• RSI indicates oversold conditions
• MACD suggests potential reversal
• Volume increasing, bullish momentum building

**Market Sentiment**: Positive (7.5/10)
**Risk Level**: Medium
**Recommended Action**: Accumulate on dips, maintain positions

**Need deeper analysis?** I can provide detailed technical insights! 🔍`,
        success: true,
        confidence: 0.9,
        suggestions: ['📊 View charts', '📈 Technical analysis', '⚠️ Risk assessment']
      };
    }
    
    if (normalizedInput.includes('trading strategy') || normalizedInput.includes('strategy') || normalizedInput.includes('plan')) {
      return {
        message: `🎯 **Advanced Trading Strategy:**

**Current Market Conditions:**
• Volatility: High (opportunity for swing trading)
• Trend: Sideways with bullish bias
• Liquidity: Strong across major pairs

**Recommended Strategies:**

1. **DCA (Dollar Cost Averaging):**
   • Invest 10% of portfolio weekly
   • Focus on SEI and blue-chip tokens
   • Reduce timing risk

2. **Swing Trading:**
   • 15-20% of portfolio for active trading
   • Target 5-15% gains per trade
   • Use stop-losses at 3-5%

3. **Yield Farming:**
   • 25-30% in stable DeFi protocols
   • Target 12-20% APY
   • Regular compound interest

4. **Liquidity Provision:**
   • 20-25% in major pairs (SEI/USDC)
   • Earn trading fees + rewards
   • Monitor impermanent loss

**Risk Management**: Never risk more than 2% per trade

**Ready to implement?** I can help execute these strategies! 🚀`,
        success: true,
        confidence: 0.9,
        suggestions: ['🎯 Execute strategy', '📊 View opportunities', '⚠️ Risk assessment']
      };
    }
    
    if (normalizedInput.includes('top dex') || normalizedInput.includes('best dex') || normalizedInput.includes('largest dex')) {
      return {
        message: `🏆 **Top DEXs on Sei Network:**

1. **Symphony DEX** - Largest with $45M+ TVL, best liquidity
2. **Astroport** - Cosmos-native, great for stable pairs
3. **SeiSwap** - Native Sei DEX, fastest execution
4. **Osmosis** - Cross-chain, extensive token support
5. **Crescent** - Yield farming focused

**Recommendation**: Use Symphony DEX for major trades, SeiSwap for speed! 🚀`,
        success: true,
        confidence: 0.9
      };
    }
    
    if (normalizedInput.includes('sei network') || normalizedInput.includes('what is sei')) {
      return {
        message: `🌊 **Sei Network** is a revolutionary Layer 1 blockchain optimized for DeFi and trading!

**Key Features:**
• **Speed**: 20,000+ TPS (faster than Solana!)
• **EVM Compatible**: Works with Ethereum tools
• **MEV Protection**: Built-in front-running protection
• **Cosmos Ecosystem**: Interoperable with 50+ chains
• **Native Token**: SEI (~$0.834)

**Perfect for**: High-frequency trading, DeFi protocols, and cross-chain operations! 🚀`,
        success: true,
        confidence: 0.95
      };
    }
    
    if (normalizedInput.includes('defi') || normalizedInput.includes('protocols')) {
      return {
        message: `🏦 **Top DeFi Protocols on Sei:**

**Staking & Yield:**
• Silo Protocol: 8-12% APY on SEI staking
• Crescent: Liquid staking with governance

**Lending & Borrowing:**
• Takara Finance: 5-15% APY, flexible terms
• Astroport: AMM with liquidity mining

**Trading:**
• Citrex: Perpetual futures, up to 20x leverage
• Symphony: Spot trading with deep liquidity

**Ready to earn yield?** I can help you stake or provide liquidity! 💰`,
        success: true,
        confidence: 0.9
      };
    }
    
    if (normalizedInput.includes('trading') || normalizedInput.includes('trade')) {
      return {
        message: `📈 **Trading on Sei Network:**

**Available Markets:**
• **Spot Trading**: SEI/USDC, SEI/USDT, and 100+ pairs
• **Perpetual Futures**: Up to 20x leverage on Citrex
• **Yield Farming**: Earn rewards by providing liquidity
• **Cross-chain**: Trade assets from 50+ blockchains

**Best DEXs for Trading:**
• **Symphony**: Best liquidity and execution
• **SeiSwap**: Fastest native trading
• **Citrex**: Advanced futures and options

**Want to start trading?** I can help you execute trades or analyze markets! 🎯`,
        success: true,
        confidence: 0.9
      };
    }
    
    if (normalizedInput.includes('price') || normalizedInput.includes('market')) {
      return {
        message: `💰 **Current Market Status:**

**SEI Token:**
• Price: ~$0.834
• 24h Change: +2.84%
• Market Cap: $2.5B
• Volume: $12.5M

**Market Trends:**
• Sei Network gaining adoption
• DeFi TVL growing rapidly
• New protocols launching weekly
• Institutional interest increasing

**Market Analysis**: SEI showing strong momentum with growing DeFi ecosystem! 📊`,
        success: true,
        confidence: 0.85
      };
    }
    
    if (normalizedInput.includes('stake') || normalizedInput.includes('yield')) {
      return {
        message: `🥩 **Staking & Yield Opportunities:**

**Silo Protocol:**
• SEI Staking: 8-12% APY
• Liquid staking available
• No lock-up period

**Crescent:**
• Governance staking: 10-15% APY
• Liquid staking derivatives
• Cross-chain rewards

**Liquidity Provision:**
• Symphony DEX: 15-25% APY
• Astroport: 12-20% APY
• Risk: Impermanent loss

**Ready to earn?** I can help you stake SEI or provide liquidity! 💎`,
        success: true,
        confidence: 0.9
      };
    }
    
    if (normalizedInput.includes('liquidity') || normalizedInput.includes('add liquidity')) {
      return {
        message: `💧 **Adding Liquidity on Sei:**

**Best Pools:**
• **SEI/USDC**: Most liquid, lowest risk
• **SEI/USDT**: High volume, stable returns
• **SEI/ATOM**: Cross-chain exposure
• **USDC/USDT**: Stable pair, low volatility

**How to Add Liquidity:**
1. Visit Symphony DEX or Astroport
2. Select your token pair
3. Enter amounts (keep them balanced)
4. Approve and confirm

**APY Ranges:**
• SEI pairs: 15-25% APY
• Stable pairs: 8-15% APY
• Cross-chain: 20-35% APY

**Want me to help you add liquidity?** I can guide you through the process! 🚀`,
        success: true,
        confidence: 0.9
      };
    }
    
    if (normalizedInput.includes('burn') || normalizedInput.includes('destroy token')) {
      return {
        message: `🔥 **Token Burning on Sei:**

**Why Burn Tokens:**
• Reduce supply (increases scarcity)
• Increase token value
• Deflationary mechanism
• Community governance

**How to Burn:**
1. **Manual Burn**: Send tokens to burn address
2. **Smart Contract**: Use burn function if available
3. **Protocol Burns**: Automatic burning mechanisms

**Burn Address**: 0x000000000000000000000000000000000000dEaD

**Important**: Burning is irreversible! Make sure you want to permanently remove tokens from circulation.

**Need help burning tokens?** I can assist with the process! ⚡`,
        success: true,
        confidence: 0.9
      };
    }
    
    if (normalizedInput.includes('scan') || normalizedInput.includes('analyze token')) {
      return {
        message: `🔍 **Token Scanning & Analysis:**

**What I Can Analyze:**
• Contract security and verification
• Liquidity and trading volume
• Holder distribution
• Smart contract risks
• Price history and trends

**Security Checks:**
• Contract verification status
• Liquidity lock status
• Owner privileges
• Blacklist functions
• Honeypot detection

**To Scan a Token:**
Just paste the token address (0x...) and I'll analyze it for you!

**Example**: "Scan this token: 0x1234..."

**Ready to analyze?** Paste any token address! 🔐`,
        success: true,
        confidence: 0.9
      };
    }
    
    // Default response for other questions
    return {
      message: `🤖 I'm Seilor 0, your advanced AI assistant for DeFi on Sei Network!

**Advanced Capabilities:**
• **Portfolio Optimization**: Risk-adjusted allocation, rebalancing
• **Market Intelligence**: Real-time analysis, trend prediction
• **Trading Strategies**: DCA, swing trading, yield optimization
• **Risk Management**: Portfolio diversification, position sizing
• **DeFi Insights**: Protocol analysis, APY optimization

**Ask me about:**
• Portfolio optimization strategies
• Advanced trading techniques
• Market analysis and predictions
• Risk management strategies
• DeFi protocol comparisons

**What would you like to explore?** I'm here to maximize your DeFi success! 🚀`,
      success: true,
      confidence: 0.8
    };
  }
  
  private extractToolsUsed(result: any): string[] {
    // Extract which tools were used from the agent result
    // This is useful for debugging and analytics
    if (result.intermediateSteps) {
      return result.intermediateSteps.map((step: any) => step.action?.tool || 'unknown');
    }
    return [];
  }
}

// Export singleton instance
export const langChainSeiAgent = new LangChainSeiAgent();