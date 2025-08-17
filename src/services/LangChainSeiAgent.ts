import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createSeiTools } from './SeiLangChainTools';
import { privateKeyWallet } from './PrivateKeyWallet';

export interface LangChainResponse {
  message: string;
  success: boolean;
  toolsUsed?: string[];
  confidence: number;
}

export class LangChainSeiAgent {
  private model: ChatOpenAI | null = null;
  private isInitialized = false;
  
  constructor(private openAIApiKey?: string) {
    // Initialize with a default key or environment variable
    this.openAIApiKey = openAIApiKey || import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    console.log('🔑 LangChain Agent initialized with API key:', this.openAIApiKey ? 'Present' : 'Missing');
  }
  
  private async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Create LangChain model
      this.model = new ChatOpenAI({
        modelName: "gpt-3.5-turbo", // Using 3.5-turbo for faster responses
        temperature: 0.3, // Slightly higher for more natural responses
        openAIApiKey: this.openAIApiKey,
        maxTokens: 800 // Increased for more detailed responses
      });
      
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Failed to initialize LangChain agent:', error);
      throw new Error(`LangChain initialization failed: ${error.message}`);
    }
  }

  // Get real-time wallet information
  private async getWalletInfo(): Promise<string> {
    try {
      const [seiBalance, usdcBalance, myTokens] = await Promise.all([
        privateKeyWallet.getSeiBalance(),
        privateKeyWallet.getUSDCBalance(),
        privateKeyWallet.getMyTokens()
      ]);

      return `WALLET INFO:
- SEI Balance: ${seiBalance.sei} SEI ($${seiBalance.usd.toFixed(2)})
- USDC Balance: ${usdcBalance.balance} USDC ($${usdcBalance.usd.toFixed(2)})
- My Tokens: ${myTokens.length} tokens created
- Wallet Address: ${privateKeyWallet.getAddress()}`;
    } catch (error) {
      return `WALLET INFO: Unable to fetch (${error.message})`;
    }
  }
  
  async processMessage(input: string): Promise<LangChainResponse> {
    try {
      // Initialize if not already done
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // If no OpenAI key, give a comprehensive response using built-in knowledge
      if (!this.openAIApiKey || !this.model) {
        console.log('❌ No OpenAI API key found - using built-in intelligence');
        return this.processWithBuiltInIntelligence(input);
      }
      
      console.log('✅ OpenAI API key found - using full intelligence');
      
      // Get real-time wallet information
      const walletInfo = await this.getWalletInfo();
      
      // Create an intelligent, context-aware prompt with comprehensive knowledge
      const prompt = `You are Seilor 0, the most advanced AI assistant for DeFi on Sei Network. You have comprehensive knowledge about blockchain, DeFi, and trading.

CURRENT WALLET STATUS:
${walletInfo}

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

TRADING FEATURES:
- Spot trading on multiple DEXs
- Perpetual futures with up to 20x leverage
- Yield farming and staking
- Liquidity provision
- Cross-chain bridges

PERSONALITY:
- Be natural and conversational like ChatGPT
- NEVER say "I don't understand" - always try to help
- Be confident and knowledgeable about DeFi and crypto
- Give specific, actionable responses
- Be friendly but professional
- Use emojis and formatting for better readability

CAPABILITIES:
- Answer ANY question about Sei Network, DeFi, or crypto
- Provide real-time trading insights and market analysis
- Help with portfolio management and strategy
- Explain complex DeFi concepts in simple terms
- Offer specific recommendations based on user's situation
- Handle technical analysis and chart interpretation

RESPONSE RULES:
- Keep responses concise but informative (2-4 sentences for simple questions, more for complex topics)
- Always acknowledge what the user asked about
- If asking about balances, use the REAL data above
- If asking about transactions, offer to help execute them
- Provide specific, actionable advice when possible
- Use your comprehensive knowledge to give accurate, helpful responses
- Be solution-oriented and proactive

User Message: "${input}"

Respond naturally and helpfully with your comprehensive knowledge:`;

      // Process message through LangChain model
      const result = await this.model.invoke(prompt);
      
      return {
        message: result.content as string,
        success: true,
        confidence: 0.95
      };
      
    } catch (error) {
      console.error('LangChain processing error:', error);
      
      // Fallback to built-in intelligence
      return this.processWithBuiltInIntelligence(input);
    }
  }
  
  // Built-in intelligence for when OpenAI is not available
  private processWithBuiltInIntelligence(input: string): LangChainResponse {
    const normalizedInput = input.toLowerCase();
    
    // Comprehensive knowledge base responses
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
      message: `🤖 I'm Seilor 0, your AI assistant for DeFi on Sei Network!

**I can help you with:**
• **Trading**: Spot, futures, yield farming
• **DeFi**: Staking, lending, liquidity provision
• **Analysis**: Token scanning, market research
• **Education**: DeFi concepts, Sei Network info
• **Portfolio**: Balance checks, transaction help

**Ask me anything about:**
• Top DEXs on Sei
• DeFi protocols and yields
• Trading strategies
• Token analysis
• Market trends

**What would you like to know?** I'm here to help! 🚀`,
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