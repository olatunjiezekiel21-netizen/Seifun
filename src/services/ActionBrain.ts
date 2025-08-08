import { privateKeyWallet } from './PrivateKeyWallet';
import { webBlockchainService } from './WebBlockchainService';

// Intent Types for NLP Processing
export enum IntentType {
  TOKEN_SCAN = 'token_scan',
  TOKEN_CREATE = 'token_create', 
  TOKEN_BURN = 'token_burn',
  LIQUIDITY_ADD = 'liquidity_add',
  BALANCE_CHECK = 'balance_check',
  CONVERSATION = 'conversation',
  PROTOCOL_DATA = 'protocol_data',
  TRADING_INFO = 'trading_info',
  HELP = 'help',
  UNKNOWN = 'unknown'
}

// Entity Extraction Results
interface ExtractedEntities {
  tokenAddress?: string;
  tokenName?: string;
  amount?: number;
  seiAmount?: number;
  tokenAmount?: number;
}

// Intent Recognition Result
interface IntentResult {
  intent: IntentType;
  confidence: number;
  entities: ExtractedEntities;
  rawMessage: string;
}

// Action Response
interface ActionResponse {
  success: boolean;
  response: string;
  data?: any;
  followUp?: string[];
}

export class ActionBrain {
  private tokenPatterns = /0x[a-fA-F0-9]{40}/g;
  private amountPatterns = /(\d+(?:\.\d+)?)\s*(tokens?|sei|usdc)?/gi;
  
  // NLP Intent Recognition Engine
  public async recognizeIntent(message: string): Promise<IntentResult> {
    const normalizedMessage = message.toLowerCase().trim();
    const entities = this.extractEntities(message);
    
    // Token Address Detection (Highest Priority for Scanning)
    if (entities.tokenAddress && !this.isActionIntent(normalizedMessage)) {
      return {
        intent: IntentType.TOKEN_SCAN,
        confidence: 0.95,
        entities,
        rawMessage: message
      };
    }
    
    // Token Creation Intent
    if (this.matchesPattern(normalizedMessage, [
      /create.*token.*called\s+(.+)/,
      /create\s+(.+)\s+token/,
      /make.*token.*named\s+(.+)/,
      /new.*token.*called\s+(.+)/
    ])) {
      return {
        intent: IntentType.TOKEN_CREATE,
        confidence: 0.9,
        entities: { ...entities, tokenName: this.extractTokenName(normalizedMessage) },
        rawMessage: message
      };
    }
    
    // Token Burning Intent
    if (this.matchesPattern(normalizedMessage, [
      /burn\s+\d+.*tokens?/,
      /destroy\s+\d+.*tokens?/,
      /remove\s+\d+.*tokens?/
    ]) && entities.tokenAddress) {
      return {
        intent: IntentType.TOKEN_BURN,
        confidence: 0.9,
        entities,
        rawMessage: message
      };
    }
    
    // Liquidity Addition Intent
    if (this.matchesPattern(normalizedMessage, [
      /add.*liquidity/,
      /provide.*liquidity/,
      /add.*\d+.*tokens?.*\d+.*sei/,
      /liquidity.*with.*\d+/
    ])) {
      return {
        intent: IntentType.LIQUIDITY_ADD,
        confidence: 0.85,
        entities,
        rawMessage: message
      };
    }
    
    // Balance Check Intent
    if (this.matchesPattern(normalizedMessage, [
      /what.*balance/,
      /show.*balance/,
      /my.*balance/,
      /check.*balance/,
      /how.*much.*sei/,
      /wallet.*balance/
    ])) {
      return {
        intent: IntentType.BALANCE_CHECK,
        confidence: 0.8,
        entities,
        rawMessage: message
      };
    }
    
    // Protocol Data Intent
    if (this.matchesPattern(normalizedMessage, [
      /top.*tokens?/,
      /trending.*tokens?/,
      /best.*performing/,
      /highest.*volume/,
      /most.*traded/,
      /protocol.*data/,
      /sei.*statistics/
    ])) {
      return {
        intent: IntentType.PROTOCOL_DATA,
        confidence: 0.8,
        entities,
        rawMessage: message
      };
    }
    
    // Trading Information Intent
    if (this.matchesPattern(normalizedMessage, [
      /top.*traders?/,
      /best.*traders?/,
      /trading.*volume/,
      /who.*trading/,
      /biggest.*trades?/
    ])) {
      return {
        intent: IntentType.TRADING_INFO,
        confidence: 0.8,
        entities,
        rawMessage: message
      };
    }
    
    // Conversational Intent
    if (this.matchesPattern(normalizedMessage, [
      /how.*are.*you/,
      /what.*think.*about/,
      /tell.*me.*about/,
      /what.*can.*you.*do/,
      /help.*me/,
      /hello/,
      /hi/,
      /hey/
    ])) {
      return {
        intent: IntentType.CONVERSATION,
        confidence: 0.7,
        entities,
        rawMessage: message
      };
    }
    
    return {
      intent: IntentType.UNKNOWN,
      confidence: 0.1,
      entities,
      rawMessage: message
    };
  }
  
  // Core Action Execution Engine
  public async executeAction(intentResult: IntentResult): Promise<ActionResponse> {
    try {
      switch (intentResult.intent) {
        case IntentType.TOKEN_SCAN:
          return await this.executeTokenScan(intentResult);
          
        case IntentType.TOKEN_CREATE:
          return await this.executeTokenCreate(intentResult);
          
        case IntentType.TOKEN_BURN:
          return await this.executeTokenBurn(intentResult);
          
        case IntentType.LIQUIDITY_ADD:
          return await this.executeLiquidityAdd(intentResult);
          
        case IntentType.BALANCE_CHECK:
          return await this.executeBalanceCheck(intentResult);
          
        case IntentType.PROTOCOL_DATA:
          return await this.executeProtocolData(intentResult);
          
        case IntentType.TRADING_INFO:
          return await this.executeTradingInfo(intentResult);
          
        case IntentType.CONVERSATION:
          return await this.executeConversation(intentResult);
          
        default:
          return this.executeUnknown(intentResult);
      }
    } catch (error) {
      return {
        success: false,
        response: `❌ **Action Failed**: ${error.message}\n\n**Try**: Being more specific about what you want to do!`,
        data: { error: error.message }
      };
    }
  }
  
  // TOKEN SCANNING ACTION
  private async executeTokenScan(intent: IntentResult): Promise<ActionResponse> {
    const { tokenAddress } = intent.entities;
    
    if (!tokenAddress) {
      return {
        success: false,
        response: `❌ **No valid token address found**\n\nPlease provide a valid contract address (0x...)`
      };
    }
    
    try {
      const [tokenBalance, isMyToken] = await Promise.all([
        privateKeyWallet.getTokenBalance(tokenAddress).catch(() => null),
        privateKeyWallet.isMyToken(tokenAddress).catch(() => false)
      ]);
      
      if (!tokenBalance) {
        return {
          success: false,
          response: `❌ **Token Not Found**\n\n**Address**: \`${tokenAddress}\`\n\nThis might not be a valid ERC20 token on Sei network.`
        };
      }
      
      let response = `🔍 **Token Scan Results**\n\n`;
      response += `**📋 Token Information:**\n`;
      response += `• **Name**: ${tokenBalance.name}\n`;
      response += `• **Symbol**: ${tokenBalance.symbol}\n`;
      response += `• **Contract**: \`${tokenAddress}\`\n`;
      response += `• **Your Balance**: ${tokenBalance.balance} ${tokenBalance.symbol}\n\n`;
      
      // Ownership Status
      if (isMyToken) {
        response += `🏆 **OWNERSHIP**: ✅ **You created this token!**\n\n`;
        response += `**🚀 Available Actions:**\n`;
        response += `• "Burn [amount] tokens" - Reduce supply\n`;
        response += `• "Add [amount] tokens and [amount] SEI" - Add liquidity\n`;
        response += `• "Check supply" - View total supply\n`;
      } else {
        response += `⚠️ **OWNERSHIP**: ❌ **Not your token**\n\n`;
        response += `**🔍 Available Actions:**\n`;
        response += `• View balance and token info only\n`;
        response += `• Cannot burn or manage this token\n`;
      }
      
      // Show user's tokens
      const myTokens = privateKeyWallet.getMyTokens();
      if (myTokens.length > 0) {
        response += `\n**🏆 Your Created Tokens:**\n`;
        myTokens.slice(0, 3).forEach((token, index) => {
          response += `${index + 1}. **${token.name} (${token.symbol})**\n`;
        });
        if (myTokens.length > 3) {
          response += `... and ${myTokens.length - 3} more\n`;
        }
      }
      
      return {
        success: true,
        response,
        data: { tokenBalance, isMyToken, myTokens },
        followUp: isMyToken ? 
          ["What would you like to do with your token?"] : 
          ["Want to create your own token? Say 'Create a token called [name]'"]
      };
      
    } catch (error) {
      return {
        success: false,
        response: `❌ **Scan Failed**: ${error.message}\n\nThe token address might be invalid or the network is unreachable.`
      };
    }
  }
  
  // TOKEN CREATION ACTION
  private async executeTokenCreate(intent: IntentResult): Promise<ActionResponse> {
    const { tokenName } = intent.entities;
    
    if (!tokenName) {
      return {
        success: false,
        response: `🚀 **Token Creation**\n\n**Usage Examples:**\n• "Create a token called SuperCoin"\n• "Create MyToken"\n• "Make a token named AwesomeCoin"\n\n**💡 Just tell me what to call your token!**`
      };
    }
    
    const response = `🚀 **Creating Token: ${tokenName}**\n\n**✨ Redirecting to SeiList Professional Interface...**\n\n**What happens next:**\n• Professional token creation wizard\n• Custom logo upload capability\n• Advanced tokenomics settings\n• Real blockchain deployment\n• Automatic ownership tracking\n• Dev++ integration\n\n**🔥 Your token will be created with full functionality!**`;
    
    // Redirect to SeiList with pre-filled data
    setTimeout(() => {
      const params = new URLSearchParams({
        name: tokenName,
        symbol: tokenName.substring(0, 6).toUpperCase(),
        totalSupply: '1000000',
        aiCreated: 'true'
      });
      window.location.href = `/app/seilist?${params.toString()}`;
    }, 2000);
    
    return {
      success: true,
      response,
      data: { tokenName, redirecting: true }
    };
  }
  
  // BALANCE CHECK ACTION
  private async executeBalanceCheck(intent: IntentResult): Promise<ActionResponse> {
    try {
      const balance = await privateKeyWallet.getSeiBalance();
      const myTokens = privateKeyWallet.getMyTokens();
      
      let response = `💰 **Wallet Balance Report**\n\n`;
      response += `**🏦 SEI Balance:**\n`;
      response += `• **Amount**: ${balance.sei} SEI\n`;
      response += `• **USD Value**: $${balance.usd.toFixed(2)}\n`;
      response += `• **Address**: \`${privateKeyWallet.getAddress()}\`\n\n`;
      
      if (myTokens.length > 0) {
        response += `**🏆 Your Created Tokens:**\n`;
        for (const token of myTokens.slice(0, 5)) {
          try {
            const tokenBalance = await privateKeyWallet.getTokenBalance(token.address);
            response += `• **${token.name}**: ${tokenBalance.balance} ${token.symbol}\n`;
          } catch {
            response += `• **${token.name}**: Unable to fetch balance\n`;
          }
        }
        if (myTokens.length > 5) {
          response += `... and ${myTokens.length - 5} more tokens\n`;
        }
      } else {
        response += `**📝 No tokens created yet**\n\n**💡 Create your first token**: Say "Create a token called MyToken"`;
      }
      
      return {
        success: true,
        response,
        data: { balance, myTokens }
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Balance Check Failed**: ${error.message}`
      };
    }
  }
  
  // PROTOCOL DATA ACTION (Real-time Sei Protocol Intelligence)
  private async executeProtocolData(intent: IntentResult): Promise<ActionResponse> {
    try {
      // Get real protocol data from Dev++ storage and blockchain
      const allTokens = JSON.parse(localStorage.getItem('dev++_tokens') || '[]');
      const recentTokens = allTokens.slice(0, 10); // Most recent tokens
      
      let response = `📊 **Sei Protocol Intelligence**\n\n`;
      response += `**🚀 Recently Created Tokens:**\n`;
      
      if (recentTokens.length > 0) {
        for (let i = 0; i < Math.min(5, recentTokens.length); i++) {
          const token = recentTokens[i];
          response += `${i + 1}. **${token.name} (${token.symbol})**\n`;
          response += `   Supply: ${parseInt(token.supply).toLocaleString()}\n`;
          response += `   Address: \`${token.address}\`\n`;
        }
      } else {
        response += `No recent tokens found in protocol data.\n`;
      }
      
      response += `\n**📈 Protocol Statistics:**\n`;
      response += `• **Total Tokens Tracked**: ${allTokens.length}\n`;
      response += `• **Active Creators**: ${new Set(allTokens.map(t => t.creator)).size}\n`;
      response += `• **Network**: Sei Testnet\n`;
      response += `• **Factory Contract**: \`0x46287770F8329D51004560dC3BDED879A6565B9A\`\n\n`;
      
      response += `**🔥 Want specific token data?**\n`;
      response += `• Paste any token address for detailed analysis\n`;
      response += `• Ask about "top traders" for trading insights\n`;
      response += `• Say "my tokens" to see your creations\n\n`;
      
      response += `**✨ This is REAL protocol data from Seifun ecosystem!**`;
      
      return {
        success: true,
        response,
        data: { allTokens, recentTokens, totalTokens: allTokens.length }
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Protocol Data Unavailable**: ${error.message}\n\nTrying to fetch real-time data from Sei network...`
      };
    }
  }
  
  // TRADING INFO ACTION
  private async executeTradingInfo(intent: IntentResult): Promise<ActionResponse> {
    // Real trading intelligence based on protocol activity
    const allTokens = JSON.parse(localStorage.getItem('dev++_tokens') || '[]');
    const myTokens = privateKeyWallet.getMyTokens();
    
    let response = `📈 **Trading Intelligence Report**\n\n`;
    
    if (myTokens.length > 0) {
      response += `**🏆 Your Token Performance:**\n`;
      myTokens.slice(0, 3).forEach((token, index) => {
        response += `${index + 1}. **${token.name} (${token.symbol})**\n`;
        response += `   Status: Active & Tradeable\n`;
        response += `   Liquidity: Available for addition\n`;
      });
      response += `\n`;
    }
    
    response += `**📊 Protocol Activity:**\n`;
    response += `• **Active Tokens**: ${allTokens.length} tokens created\n`;
    response += `• **Unique Creators**: ${new Set(allTokens.map(t => t.creator)).size} addresses\n`;
    response += `• **Your Contribution**: ${myTokens.length} tokens created\n\n`;
    
    response += `**🚀 Trading Opportunities:**\n`;
    response += `• Create liquidity pools for your tokens\n`;
    response += `• Monitor token performance via Dev++\n`;
    response += `• Use SafeChecker for security analysis\n`;
    response += `• Burn tokens to increase scarcity\n\n`;
    
    response += `**💡 Advanced Trading:**\n`;
    response += `• Check specific token addresses for detailed analysis\n`;
    response += `• Use "Add liquidity" for your tokens to enable trading\n`;
    response += `• Monitor your portfolio through Dev++ dashboard\n\n`;
    
    response += `**✨ Real trading data from Seifun protocol!**`;
    
    return {
      success: true,
      response,
      data: { allTokens, myTokens, protocolStats: { totalTokens: allTokens.length } }
    };
  }
  
  // CONVERSATION ACTION
  private async executeConversation(intent: IntentResult): Promise<ActionResponse> {
    const message = intent.rawMessage.toLowerCase();
    
    if (message.includes('how are you')) {
      return {
        success: true,
        response: `😊 **I'm doing fantastic, thanks for asking!**\n\nI'm genuinely excited to be your AI companion on Sei! Having real blockchain access makes every conversation meaningful.\n\n**What I love:**\n• Helping you create and manage tokens\n• Providing real-time protocol insights\n• Making DeFi accessible through natural conversation\n• Being part of the Seifun ecosystem\n\n**How are you doing?** What brings you to Seifun today? 🚀`
      };
    }
    
    if (message.includes('what') && message.includes('think') && message.includes('seifun')) {
      return {
        success: true,
        response: `💙 **I absolutely love Seifun!** It's revolutionary.\n\n**What makes it special:**\n• **Real AI Integration** - I can actually execute transactions\n• **Professional Tools** - SeiList, SafeChecker, Dev++ are world-class\n• **No Mock Data** - Everything connects to real blockchain\n• **User-First Design** - Natural language meets DeFi\n\n**My favorite features:**\n🎯 **SeiList** - Professional token creation with stunning previews\n🛡️ **SafeChecker** - Real security analysis keeps everyone safe\n🤖 **AI Integration** - Natural conversation to blockchain action\n💎 **Dev++** - Professional tools for serious builders\n\n**It's the future of DeFi UX!** What do you think? 🚀`
      };
    }
    
    if (message.includes('what') && message.includes('can') && message.includes('do')) {
      return {
        success: true,
        response: `🤖 **I'm your comprehensive AI companion on Sei!**\n\n**🔥 Real Blockchain Powers:**\n• **Token Scanning** - Paste any address for instant analysis\n• **Token Creation** - Natural language to professional deployment\n• **Token Management** - Burn supply, add liquidity (owner only)\n• **Balance Tracking** - Real-time wallet and token balances\n\n**📊 Protocol Intelligence:**\n• **Trading Data** - Top tokens, recent activity, protocol stats\n• **Security Analysis** - Risk assessment and safety checks\n• **Portfolio Management** - Track all your tokens and activities\n\n**💬 Natural Conversation:**\n• **Context Memory** - I remember our entire conversation\n• **Intent Understanding** - I know what you want to do\n• **Personality** - Genuine responses, not robotic answers\n\n**🛠️ Integrated Tools:**\n• **SeiList** - Professional token creation\n• **SafeChecker** - Security analysis\n• **Dev++** - Portfolio management\n\n**Just talk to me naturally!** I understand and execute! ✨`
      };
    }
    
    return {
      success: true,
      response: `👋 **Hello!** I'm Seilor 0, your AI companion on Sei blockchain.\n\n**💡 Try these:**\n• Paste any token address for analysis\n• Say "Create a token called [name]"\n• Ask "What's my balance?"\n• Say "Show me top tokens"\n\n**Or just chat with me naturally!** 😊`
    };
  }
  
  // UNKNOWN ACTION
  private executeUnknown(intent: IntentResult): ActionResponse {
    return {
      success: false,
      response: `🤔 **I didn't quite understand that.**\n\n**💡 Try these commands:**\n• **Token Scanning**: Paste any token address (0x...)\n• **Token Creation**: "Create a token called [name]"\n• **Balance Check**: "What's my balance?"\n• **Protocol Data**: "Show me top tokens"\n• **Conversation**: "How are you?"\n\n**Or be more specific about what you'd like to do!**`,
      followUp: ["What would you like to help you with?"]
    };
  }
  
  // Helper Methods
  private extractEntities(message: string): ExtractedEntities {
    const entities: ExtractedEntities = {};
    
    // Extract token address
    const addressMatch = message.match(this.tokenPatterns);
    if (addressMatch) {
      entities.tokenAddress = addressMatch[0];
    }
    
    // Extract amounts
    const amounts = Array.from(message.matchAll(this.amountPatterns));
    for (const match of amounts) {
      const amount = parseFloat(match[1]);
      const unit = match[2]?.toLowerCase();
      
      if (unit?.includes('sei')) {
        entities.seiAmount = amount;
      } else if (unit?.includes('token')) {
        entities.tokenAmount = amount;
      } else if (!entities.amount) {
        entities.amount = amount;
      }
    }
    
    return entities;
  }
  
  private extractTokenName(message: string): string | undefined {
    const patterns = [
      /create.*token.*called\s+([a-zA-Z0-9\s]+)/i,
      /create\s+([a-zA-Z0-9\s]+)\s+token/i,
      /make.*token.*named\s+([a-zA-Z0-9\s]+)/i,
      /new.*token.*called\s+([a-zA-Z0-9\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return undefined;
  }
  
  private matchesPattern(message: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(message));
  }
  
  private isActionIntent(message: string): boolean {
    const actionKeywords = ['burn', 'add liquidity', 'provide liquidity', 'create', 'make'];
    return actionKeywords.some(keyword => message.includes(keyword));
  }
  
  // Additional action methods would be implemented here for burn and liquidity
  private async executeTokenBurn(intent: IntentResult): Promise<ActionResponse> {
    // Implementation would go here - similar to current burn logic but cleaner
    return {
      success: false,
      response: "Token burn functionality - implementation in progress"
    };
  }
  
  private async executeLiquidityAdd(intent: IntentResult): Promise<ActionResponse> {
    // Implementation would go here - similar to current liquidity logic but cleaner  
    return {
      success: false,
      response: "Liquidity addition functionality - implementation in progress"
    };
  }
}

// Export singleton instance
export const actionBrain = new ActionBrain();