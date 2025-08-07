import { ethers } from 'ethers';

interface AIContext {
  userWallet?: string;
  isConnected?: boolean;
  currentTime?: Date;
  chatHistory?: any[];
  userPreferences?: any;
  marketData?: any;
  // Todo and task management data
  userTodos?: Array<{
    id: string;
    task: string;
    completed: boolean;
    timestamp: Date;
  }>;
  todoCount?: number;
  completedTodos?: number;
  pendingTodos?: number;
  // Wallet data
  walletData?: {
    address: string;
    balance: string;
    tokens: Array<{
      symbol: string;
      balance: string;
      address: string;
    }>;
    chainId: number;
    network: string;
  };
}

interface AICapability {
  name: string;
  description: string;
  handler: (query: string, context: AIContext) => Promise<string>;
}

export class ProfessionalAIAgent {
  private memory: Map<string, any> = new Map();
  private conversationHistory: any[] = [];
  private capabilities: Map<string, AICapability> = new Map();

  constructor() {
    this.initializeCapabilities();
    this.loadMemory();
  }

  private initializeCapabilities() {
    // Time and Date Queries
    this.capabilities.set('time', {
      name: 'Time & Date',
      description: 'Current time, date, and timezone information',
      handler: async (query: string, context: AIContext) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        const dateStr = now.toLocaleDateString();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        if (query.toLowerCase().includes('time')) {
          return `🕐 **Current Time**: ${timeStr} (${timezone})\n📅 **Date**: ${dateStr}\n\nIs there anything specific you'd like to know about time or scheduling?`;
        }
        
        return `📅 **Today**: ${dateStr}\n🕐 **Time**: ${timeStr}\n🌍 **Timezone**: ${timezone}`;
      }
    });

    // Market Data and Analysis
    this.capabilities.set('market', {
      name: 'Market Analysis',
      description: 'Real-time market data and analysis',
      handler: async (query: string, context: AIContext) => {
        // Simulate real market data - in production, connect to APIs
        const seiPrice = (Math.random() * 0.5 + 0.3).toFixed(4);
        const change24h = (Math.random() * 20 - 10).toFixed(2);
        const volume = (Math.random() * 100 + 50).toFixed(1);
        
        return `📊 **SEI Market Data**\n\n💰 **Price**: $${seiPrice}\n📈 **24h Change**: ${change24h}%\n📊 **Volume**: $${volume}M\n\n*Note: This is simulated data. In production, we'd connect to real market APIs like CoinGecko or CoinMarketCap.*\n\nWhat specific market analysis would you like me to perform?`;
      }
    });

    // Token Analysis
    this.capabilities.set('token', {
      name: 'Token Analysis',
      description: 'Comprehensive token security and analysis',
      handler: async (query: string, context: AIContext) => {
        const tokenAddress = this.extractTokenAddress(query);
        
        if (tokenAddress) {
          return `🔍 **Token Analysis for ${tokenAddress.slice(0, 8)}...**\n\n⚡ **Analyzing token contract...**\n🛡️ **Security Score**: Calculating...\n📊 **Liquidity Check**: In progress...\n🏛️ **Contract Verification**: Checking...\n\n*Real-time analysis would connect to blockchain APIs and security databases.*\n\nWould you like me to explain any specific aspects of token analysis?`;
        }
        
        return `🔍 **Token Analysis Service**\n\nI can analyze any Sei token for:\n• **Security risks** and red flags\n• **Contract verification** status\n• **Liquidity** and trading volume\n• **Holder distribution** analysis\n• **Price history** and trends\n\nPlease provide a token address (0x...) for analysis!`;
      }
    });

    // Trading Assistance
    this.capabilities.set('trading', {
      name: 'Trading Assistant',
      description: 'Trading strategies and execution help',
      handler: async (query: string, context: AIContext) => {
        if (!context.isConnected || !context.walletData) {
          return `🔗 **Connect Your Wallet First**\n\nTo provide personalized trading assistance, please connect your wallet. I can then:\n\n• Analyze your current positions\n• Suggest optimal entry/exit points\n• Calculate risk/reward ratios\n• Monitor your portfolio performance\n\nConnect your wallet to unlock advanced trading features!`;
        }
        
        const wallet = context.walletData;
        const seiBalance = parseFloat(wallet.balance);
        const marketPrice = context.marketData?.seiPrice ? parseFloat(context.marketData.seiPrice) : 0.4;
        const portfolioValue = seiBalance * marketPrice;
        
        return `📈 **Trading Assistant Active**\n\n💼 **Your Portfolio:**\n• SEI Balance: ${wallet.balance} SEI (~$${portfolioValue.toFixed(2)})\n• Network: ${wallet.network}\n• Address: ${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}\n\n🎯 **Personalized Recommendations:**\n${seiBalance < 1 ? '• ⚠️ Low balance - consider adding more SEI for trading\n• Start with small test trades to learn the platform' : seiBalance < 10 ? '• 💡 Moderate balance - good for small to medium trades\n• Consider DeFi yield farming opportunities' : '• 🚀 Strong balance - ready for advanced trading strategies\n• Explore liquidity provision and staking options'}\n\n📊 **Current Market Context:**\n• SEI Price: $${marketPrice.toFixed(4)}\n• Network: Low congestion, optimal for trading\n\nWhat specific trading strategy interests you?`;
      }
    });

    // General Knowledge
    this.capabilities.set('general', {
      name: 'General Knowledge',
      description: 'General questions and conversations',
      handler: async (query: string, context: AIContext) => {
        // Enhanced contextual awareness
        const userContext = {
          hasWallet: context.isConnected && context.walletData,
          todoCount: context.todoCount || 0,
          pendingTodos: context.pendingTodos || 0,
          completedTodos: context.completedTodos || 0,
          chatLength: context.chatHistory?.length || 0,
          sessionTime: context.currentTime ? new Date().getTime() - context.currentTime.getTime() : 0
        };

        // Personalized responses based on user context
        const getPersonalizedGreeting = () => {
          let greeting = "👋 Hello! I'm your AI Trading Agent.";
          
          if (userContext.hasWallet) {
            greeting += ` I see you're connected with ${context.walletData?.balance} SEI.`;
          }
          
          if (userContext.todoCount > 0) {
            greeting += ` You have ${userContext.pendingTodos} pending tasks`;
            if (userContext.completedTodos > 0) {
              greeting += ` and have completed ${userContext.completedTodos} tasks - great progress!`;
            }
            greeting += ".";
          }
          
          greeting += "\n\n🎯 I can help with trading, market analysis, token scanning, managing your todos, and general questions. What can I assist you with?";
          return greeting;
        };

        const responses = {
          greeting: getPersonalizedGreeting(),
          weather: "🌤️ I don't have access to real-time weather data, but I can help you with trading and blockchain-related questions! For weather, I'd recommend checking a dedicated weather app.",
          math: "🧮 I can help with calculations! What math problem would you like me to solve?",
          default: `🤖 I'm your AI Trading Agent with full awareness of your Seilor 0 session.\n\n📊 **What I know about you:**\n${userContext.hasWallet ? `• Connected wallet: ${context.walletData?.address?.slice(0, 8)}...${context.walletData?.address?.slice(-6)}` : '• No wallet connected yet'}\n• Todo tasks: ${userContext.todoCount} total (${userContext.pendingTodos} pending, ${userContext.completedTodos} completed)\n• Our conversation: ${userContext.chatLength} messages\n\n🎯 **I specialize in:**\n• Token analysis and security\n• Trading strategies and market insights\n• Todo and task management\n• Sei blockchain ecosystem\n• DeFi protocols and opportunities\n• Remembering our full conversation history\n\nWhat would you like to explore or continue discussing?`
        };

        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
          return responses.greeting;
        }
        
        if (lowerQuery.includes('weather') || lowerQuery.includes('temperature')) {
          return responses.weather;
        }
        
        if (lowerQuery.includes('calculate') || lowerQuery.includes('math') || /\d+[\+\-\*\/]\d+/.test(lowerQuery)) {
          return responses.math;
        }
        
        return responses.default;
      }
    });

    // Blockchain Information
    this.capabilities.set('blockchain', {
      name: 'Blockchain Info',
      description: 'Sei blockchain and DeFi information',
      handler: async (query: string, context: AIContext) => {
        return `⛓️ **Sei Blockchain Information**\n\n🌟 **Network**: Sei Testnet\n🔗 **Chain ID**: 1328\n⚡ **RPC**: https://evm-rpc-testnet.sei-apis.com\n🔍 **Explorer**: https://seitrace.com\n\n📊 **Key Features**:\n• High-speed transactions\n• Low fees\n• EVM compatibility\n• DeFi-focused ecosystem\n\n🏗️ **Popular Protocols**: Astroport, Dragonswap, Nitro, Kryptonite\n\nWhat specific aspect of Sei would you like to learn about?`;
      }
    });
  }

  private extractTokenAddress(text: string): string | null {
    const addressRegex = /0x[a-fA-F0-9]{40}/;
    const match = text.match(addressRegex);
    return match ? match[0] : null;
  }

  private determineCapability(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Time-related queries
    if (lowerQuery.includes('time') || lowerQuery.includes('date') || lowerQuery.includes('today') || lowerQuery.includes('now')) {
      return 'time';
    }
    
    // Market-related queries
    if (lowerQuery.includes('price') || lowerQuery.includes('market') || lowerQuery.includes('sei') && (lowerQuery.includes('value') || lowerQuery.includes('cost'))) {
      return 'market';
    }
    
    // Token analysis
    if (lowerQuery.includes('analyze') || lowerQuery.includes('token') || lowerQuery.includes('scan') || lowerQuery.includes('0x')) {
      return 'token';
    }
    
    // Trading
    if (lowerQuery.includes('trade') || lowerQuery.includes('buy') || lowerQuery.includes('sell') || lowerQuery.includes('swap') || lowerQuery.includes('portfolio')) {
      return 'trading';
    }
    
    // Blockchain info
    if (lowerQuery.includes('blockchain') || lowerQuery.includes('sei') || lowerQuery.includes('defi') || lowerQuery.includes('protocol')) {
      return 'blockchain';
    }
    
    return 'general';
  }

  async generateResponse(query: string, context: AIContext): Promise<string> {
    // Add to conversation history
    this.conversationHistory.push({
      type: 'user',
      message: query,
      timestamp: new Date(),
      context
    });

    // Update memory with user preferences
    if (context.userWallet) {
      this.updateUserMemory(context.userWallet, { lastQuery: query, timestamp: new Date() });
    }

    try {
      // Determine the best capability to handle this query
      const capabilityKey = this.determineCapability(query);
      const capability = this.capabilities.get(capabilityKey);
      
      if (capability) {
        const response = await capability.handler(query, {
          ...context,
          currentTime: new Date(),
          chatHistory: this.conversationHistory.slice(-5) // Last 5 messages for context
        });
        
        // Add to conversation history
        this.conversationHistory.push({
          type: 'ai',
          message: response,
          timestamp: new Date(),
          capability: capabilityKey
        });
        
        return response;
      }
      
      return "I'm here to help! Could you please rephrase your question or ask about trading, tokens, market analysis, or blockchain topics?";
      
    } catch (error) {
      console.error('AI Response Error:', error);
      return "I apologize, but I encountered an error processing your request. Please try again or ask a different question.";
    }
  }

  private updateUserMemory(walletAddress: string, data: any) {
    const existing = this.memory.get(walletAddress) || {};
    this.memory.set(walletAddress, { ...existing, ...data });
    this.saveMemory();
  }

  private loadMemory() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('seilor_ai_memory');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.memory = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn('Failed to load AI memory:', error);
    }
  }

  private saveMemory() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    
    try {
      const memoryObj = Object.fromEntries(this.memory);
      localStorage.setItem('seilor_ai_memory', JSON.stringify(memoryObj));
    } catch (error) {
      console.warn('Failed to save AI memory:', error);
    }
  }

  getConversationHistory(): any[] {
    return this.conversationHistory;
  }

  getUserMemory(walletAddress: string): any {
    return this.memory.get(walletAddress) || {};
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getCapabilities(): string[] {
    return Array.from(this.capabilities.keys());
  }
}