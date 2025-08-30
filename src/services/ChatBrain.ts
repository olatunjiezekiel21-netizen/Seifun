import { actionBrain, IntentType } from './ActionBrain';
import { cambrianSeiAgent } from './CambrianSeiAgent';
import { langChainSeiAgent, LangChainResponse } from './LangChainSeiAgent';
import { z1LabsService, EnhancedIntentAnalysis, PortfolioOptimizationRequest, MarketPredictionRequest } from './Z1LabsService';

// Conversation Context
interface ConversationContext {
  lastTokenAddress?: string;
  lastAction?: string;
  userPreferences?: {
    preferredTokens?: string[];
    riskTolerance: 'low' | 'medium' | 'high';
    tradingStyle: 'conservative' | 'moderate' | 'aggressive';
  };
  sessionData?: {
    startTime: Date;
    messageCount: number;
    successfulActions: number;
    failedActions: number;
  };
  // Transfer confirmation context
  pendingTransfer?: {
    amount: number;
    recipient: string;
    currentBalance: string;
    remainingBalance: string;
    timestamp: Date;
    token?: string; // Added for USDC transfers
  };
  // Swap confirmation context
  pendingSwap?: {
    amount: string;
    tokenIn: string;
    tokenOut: string;
    minOut: string;
  };
  // Enhanced AI context
  aiContext?: {
    userProfile: 'beginner' | 'intermediate' | 'advanced';
    riskTolerance: 'low' | 'medium' | 'high';
    investmentGoals: string[];
    portfolioHistory: any[];
    marketInsights: any[];
  };
}

// Chat Message
interface ChatMessage {
  id: number;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  intent?: IntentType;
  confidence?: number;
  actionSuccess?: boolean;
}

// Chat Response
interface ChatResponse {
  message: string;
  success: boolean;
  intent: IntentType;
  confidence: number;
  suggestions?: string[];
  data?: any;
}

export class ChatBrain {
  private context: ConversationContext = {
    sessionData: {
      startTime: new Date(),
      messageCount: 0,
      successfulActions: 0,
      failedActions: 0
    }
  };
  
  private conversationHistory: ChatMessage[] = [];
  
  // Main chat processing pipeline
  public async processMessage(userMessage: string): Promise<ChatResponse> {
    try {
      // Update session stats
      this.context.sessionData!.messageCount++;
      
      // Add user message to history
      const userChatMessage: ChatMessage = {
        id: Date.now(),
        type: 'user',
        message: userMessage,
        timestamp: new Date()
      };
      this.conversationHistory.push(userChatMessage);
      
      // Step 1: Check for confirmation responses first
      const confirmationResult = this.checkForConfirmation(userMessage);
      if (confirmationResult) {
        // If a confirm triggered execution, run it now
        if (confirmationResult.data?.doExecuteNow && confirmationResult.data.swapParams) {
          const exec = await this.executePendingSwap(confirmationResult.data.swapParams)
          return exec
        }
        return confirmationResult;
      }
      
      // Step 2: Try LangChain AI Agent First (Enhanced Intelligence)
      // But if the message seems actionable (swap/stake/create), skip straight to ActionBrain
      const lcShouldRun = !/\b(swap|exchange|trade|stake|unstake|redelegate|delegate|claim|create\s+token|add\s+liquidity|burn|send|transfer)\b/i.test(userMessage)
      if (lcShouldRun) {
        try {
          console.log('🚀 Trying LangChain AI Agent...');
          const langChainResult = await langChainSeiAgent.processMessage(userMessage);
          
          if (langChainResult.success) {
            console.log('✅ LangChain agent handled the request successfully');
            
            const assistantMessage: ChatMessage = {
              id: Date.now() + 1,
              type: 'assistant',
              message: langChainResult.message,
              timestamp: new Date(),
              intent: IntentType.CONVERSATION,
              confidence: langChainResult.confidence,
              actionSuccess: true
            };
            this.conversationHistory.push(assistantMessage);
            this.context.sessionData!.successfulActions++;
            
            return {
              message: langChainResult.message,
              success: langChainResult.success,
              intent: IntentType.CONVERSATION,
              confidence: langChainResult.confidence,
              suggestions: this.generateSuggestions(userMessage)
            };
          }
        } catch (langChainError: any) {
          console.log('⚠️ LangChain agent failed, falling back to ActionBrain:', langChainError?.message || langChainError);
        }
      }
      
      // Step 3: Enhanced Fallback with Smart Response Generation
      console.log('🔄 Using enhanced fallback system...');
      
      // Try smart response generation first
      const smartResponse = this.generateSmartResponse(userMessage, null);
      if (smartResponse) {
        console.log('✅ Smart response generated successfully');
        return smartResponse;
      }
      
      // Intent Recognition through Action Brain
      const intentResult = await actionBrain.recognizeIntent(userMessage);

      // Prompt for network on wallet watch
      if ((/last\s+(ten|10)\s+trades|usdc\s+balance|holdings|portfolio/i.test(userMessage)) && !/mainnet|testnet/i.test(userMessage)) {
        return { message: '🔎 Which network? Say "mainnet" or "testnet" with your request.', success: true, intent: IntentType.WALLET_INFO, confidence: 0.8 }
      }
      
      // Context Enhancement
      const enhancedIntent = this.enhanceWithContext(intentResult);
      
      // Action Execution
      const actionResponse = await actionBrain.executeAction(enhancedIntent);
      
      // Update Context (including pending transfers)
      this.updateContext(enhancedIntent, actionResponse);
      
      // Step 6: Generate Conversational Response
      const chatResponse = this.generateConversationalResponse(
        enhancedIntent, 
        actionResponse
      );
      
      // Add assistant response to history
      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        message: chatResponse.message,
        timestamp: new Date(),
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        actionSuccess: actionResponse.success
      };
      this.conversationHistory.push(assistantMessage);
      
      // Update success/failure stats
      if (actionResponse.success) {
        this.context.sessionData!.successfulActions++;
      } else {
        this.context.sessionData!.failedActions++;
      }
      
      return chatResponse;
      
    } catch (error) {
      console.error('Chat Brain Error:', error);
      return {
        message: `🤖 I encountered an issue processing your message. Please try being more specific or rephrasing your request.`,
        success: false,
        intent: IntentType.UNKNOWN,
        confidence: 0,
        suggestions: ['Try a different approach', 'Ask for help', 'Check your message format']
      };
    }
  }
  
  // Execute pending swap (quote-approved)
  private async executePendingSwap(ps: { amount: string; tokenIn: string; tokenOut: string; minOut: string }): Promise<ChatResponse> {
    try {
      const txMsg = await cambrianSeiAgent.swapTokens({ tokenIn: ps.tokenIn as any, tokenOut: ps.tokenOut as any, amount: ps.amount, minOut: ps.minOut })
      const txHashMatch = /0x[a-fA-F0-9]{64}/.exec(txMsg || '')
      const txHash = txHashMatch ? txHashMatch[0] : undefined
      return {
        message: `✅ Swap executed. ${txHash ? `TX: ${txHash}` : txMsg}`,
        success: true,
        intent: IntentType.SYMPHONY_SWAP,
        confidence: 0.95
      }
    } catch (error: any) {
      return {
        message: `❌ Swap failed: ${error.message || String(error)}`,
        success: false,
        intent: IntentType.SYMPHONY_SWAP,
        confidence: 0.6
      }
    }
  }

  // Check for confirmation responses to pending transfers or swaps
  private checkForConfirmation(message: string): ChatResponse | null {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Pending swap
    if (this.context.pendingSwap) {
      const yes = /^(yes|y|confirm|proceed|go ahead|do it|ok|okay)\b/.test(normalizedMessage);
      const no = /^(no|n|cancel|stop|abort|not now)\b/.test(normalizedMessage);
      if (yes) {
        const ps = this.context.pendingSwap;
        this.context.pendingSwap = undefined;
        // Inform user we are processing and then execute
        return {
          message: `⏳ Processing your swap...`,
          success: true,
          intent: IntentType.SYMPHONY_SWAP,
          confidence: 0.9,
          data: { doExecuteNow: true, swapParams: ps }
        };
      }
      if (no) {
        this.context.pendingSwap = undefined;
        return {
          message: `✅ Cancelled. No swap executed.`,
          success: true,
          intent: IntentType.SYMPHONY_SWAP,
          confidence: 0.9
        };
      }
      return {
        message: `⏳ Pending swap: ${this.context.pendingSwap.amount} → Min Out: ${this.context.pendingSwap.minOut}. Say "Yes" to proceed or "Cancel" to abort.`,
        success: false,
        intent: IntentType.SYMPHONY_SWAP,
        confidence: 0.7
      };
    }

    // Check if there's a pending transfer
    if (!this.context.pendingTransfer) {
      return null;
    }
    
    // Check for confirmation patterns
    const confirmationPatterns = [
      /^yes$/,
      /^y$/,
      /^confirm$/,
      /^yes.*confirm/,
      /^confirm.*yes/,
      /^go.*ahead/,
      /^proceed/,
      /^send.*it/
    ];
    
    const cancelPatterns = [
      /^no$/,
      /^n$/,
      /^cancel$/,
      /^abort/,
      /^stop/,
      /^never.*mind/,
      /^don.*t.*send/
    ];
    
    // Check for confirmation
    if (confirmationPatterns.some(pattern => pattern.test(normalizedMessage))) {
      // Execute the pending transfer
      return this.executePendingTransfer();
    }
    
    // Check for cancellation
    if (cancelPatterns.some(pattern => pattern.test(normalizedMessage))) {
      // Clear pending transfer
      this.context.pendingTransfer = undefined;
      
      return {
        message: `❌ Transfer cancelled. No tokens were sent.`,
        success: true,
        intent: IntentType.TRANSFER_CONFIRMATION,
        confidence: 0.9
      };
    }
    
    return null;
  }
  
  // Execute pending transfer
  private async executePendingTransfer(): Promise<ChatResponse> {
    try {
      const transfer = this.context.pendingTransfer!;
      
      // Execute the transfer using CambrianSeiAgent
      const result = await cambrianSeiAgent.transferToken(
        transfer.amount.toString(),
        transfer.recipient as any,
        (transfer as any).token
      );
      
      // Clear pending transfer
      this.context.pendingTransfer = undefined;
      
      return {
        message: `✅ Transfer successful!\n\n💰 Amount: ${transfer.amount} ${ (transfer as any).token ? 'USDC' : 'SEI' }\n📤 To: ${transfer.recipient}\n🔗 Transaction: ${result}\n\nYour remaining balance: ${transfer.remainingBalance} ${ (transfer as any).token ? 'USDC' : 'SEI' }`,
        success: true,
        intent: IntentType.TRANSFER_CONFIRMATION,
        confidence: 0.95
      };
      
    } catch (error: any) {
      console.error('Transfer execution failed:', error);
      
      // Clear pending transfer on failure
      this.context.pendingTransfer = undefined;
      
      return {
        message: `❌ Transfer failed: ${error.message}\n\nPlease try again or check your balance.`,
        success: false,
        intent: IntentType.TRANSFER_CONFIRMATION,
        confidence: 0.8
      };
    }
  }
  
  // Enhance intent with conversation context
  private enhanceWithContext(intentResult: any): any {
    const enhanced = { ...intentResult };
    
    // Add context from previous messages
    if (this.context.lastTokenAddress) {
      enhanced.entities.tokenAddress = enhanced.entities.tokenAddress || this.context.lastTokenAddress;
    }
    
    // Add user preferences
    if (this.context.userPreferences) {
      enhanced.userPreferences = this.context.userPreferences;
    }
    
    return enhanced;
  }
  
  // Update conversation context
  private updateContext(intentResult: any, actionResponse: any): void {
    // Update last token address if present
    if (intentResult.entities.tokenAddress) {
      this.context.lastTokenAddress = intentResult.entities.tokenAddress;
    }
    
    // Update last action
    this.context.lastAction = intentResult.intent;
    
    // Update pending transfer context if applicable (enable confirmation flow)
    if (intentResult.intent === IntentType.SEND_TOKENS && actionResponse.success) {
      if (actionResponse.data && actionResponse.data.pendingTransfer) {
        this.context.pendingTransfer = actionResponse.data.pendingTransfer
      }
    }
    // Update pending swap context if ActionBrain returned quote & ask for confirm
    if (intentResult.intent === IntentType.SYMPHONY_SWAP && actionResponse?.data?.pendingSwap) {
      this.context.pendingSwap = actionResponse.data.pendingSwap;
    }
  }
  
  // Generate conversational response
  private generateConversationalResponse(intentResult: any, actionResponse: any): ChatResponse {
    if (!actionResponse.success) {
      return {
        message: `❌ I couldn't complete that action: ${actionResponse.response}\n\nPlease try again or ask for help.`,
        success: false,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        suggestions: ['Try again', 'Ask for help', 'Check your input']
      };
    }
    
    // Generate contextual response based on intent
    let message = actionResponse.response;
    
    // Add contextual information (avoid claiming execution unless actually executed)
    switch (intentResult.intent) {
      case IntentType.TOKEN_SCAN:
        message += `\n\n🔍 This token has been analyzed for security and risk factors.`;
        break;
      case IntentType.BALANCE_CHECK:
        message += `\n\n💰 Your wallet balance is current and up-to-date.`;
        break;
      case IntentType.STAKE_TOKENS:
        message += `\n\n🥩 Staking initiated on Silo Protocol.`;
        break;
      case IntentType.LEND_TOKENS:
        message += `\n\n🏦 Lending initiated on Takara Finance.`;
        break;
      case IntentType.OPEN_POSITION:
        message += `\n\n📈 Position opened on Citrex Protocol.`;
        break;
    }
    
    return {
      message,
      success: true,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      suggestions: this.generateSuggestions(intentResult.intent)
    };
  }
  
  // Generate contextual suggestions
  private generateSuggestions(intent: IntentType): string[] {
    const suggestions: string[] = [];
    
    switch (intent) {
      case IntentType.TOKEN_SCAN:
        suggestions.push('Scan another token', 'Check your portfolio', 'View market data');
        break;
      case IntentType.BALANCE_CHECK:
        suggestions.push('Transfer tokens', 'Swap tokens', 'Stake for yield');
        break;
      case IntentType.SYMPHONY_SWAP:
        suggestions.push('Check swap history', 'View liquidity pools', 'Monitor prices');
        break;
      case IntentType.STAKE_TOKENS:
        suggestions.push('Check staking rewards', 'Unstake tokens', 'View APY rates');
        break;
      case IntentType.LEND_TOKENS:
        suggestions.push('Check lending rates', 'Borrow tokens', 'View loan terms');
        break;
      case IntentType.OPEN_POSITION:
        suggestions.push('Check position P&L', 'Close position', 'Adjust leverage');
        break;
      default:
        suggestions.push('Ask for help', 'Check your portfolio', 'Explore DeFi protocols');
    }
    
    return suggestions;
  }
  
  // Get conversation history
  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
  
  // Clear conversation history
  public clearHistory(): void {
    this.conversationHistory = [];
    this.context = {
      sessionData: {
        startTime: new Date(),
        messageCount: 0,
        successfulActions: 0,
        failedActions: 0
      }
    };
  }
  
  // Get session statistics
  public getSessionStats(): any {
    return this.context.sessionData;
  }

  // Enhanced AI Methods with Z1 Labs Integration
  
  // Enhanced Intent Analysis with Z1 Labs AI
  async enhancedIntentAnalysis(userMessage: string): Promise<EnhancedIntentAnalysis> {
    try {
      const analysis = await z1LabsService.analyzeIntent(userMessage, {
        userProfile: this.context.userPreferences,
        portfolio: await this.getCurrentPortfolioContext(),
        marketContext: await this.getMarketContext()
      });
      
      console.log('🧠 Z1 Labs AI: Enhanced intent analysis completed');
      return analysis;
    } catch (error) {
      console.log('⚠️ Enhanced intent analysis failed, using basic fallback');
      return {
        intent: 'conversation',
        confidence: 0.7,
        entities: [],
        sentiment: 'neutral',
        riskLevel: 'low',
        suggestedActions: ['Get started', 'Learn more'],
        marketContext: {
          currentTrend: 'stable',
          volatility: 0.3,
          opportunityScore: 0.6
        }
      };
    }
  }

  // Portfolio Optimization with Z1 Labs AI
  async optimizeUserPortfolio(): Promise<PortfolioOptimizationResponse> {
    try {
      const portfolio = await this.getCurrentPortfolioContext();
      
      const request: PortfolioOptimizationRequest = {
        currentHoldings: portfolio.holdings || [],
        riskTolerance: this.context.userPreferences.riskTolerance || 'moderate',
        investmentGoals: this.context.userPreferences.investmentGoals || ['growth'],
        timeHorizon: this.context.userPreferences.timeHorizon || 'medium'
      };
      
      const optimization = await z1LabsService.optimizePortfolio(request);
      console.log('🎯 Z1 Labs AI: Portfolio optimization completed');
      return optimization;
    } catch (error) {
      console.log('⚠️ Portfolio optimization failed, using fallback');
      return {
        optimizedAllocation: [],
        totalExpectedReturn: 0.08,
        riskAdjustedReturn: 0.06,
        diversificationScore: 0.7,
        recommendations: ['Consider diversifying your portfolio', 'Monitor regularly', 'Rebalance quarterly']
      };
    }
  }

  // Market Prediction with Z1 Labs AI
  async predictMarketMovement(token: string, timeframe: '1h' | '4h' | '1d' | '1w' | '1m' = '1d'): Promise<MarketPredictionResponse> {
    try {
      const request: MarketPredictionRequest = {
        token,
        timeframe,
        includeSentiment: true,
        includeRisk: true
      };
      
      const prediction = await z1LabsService.predictMarket(request);
      console.log('🔮 Z1 Labs AI: Market prediction completed');
      return prediction;
    } catch (error) {
      console.log('⚠️ Market prediction failed, using fallback');
      return {
        token,
        timeframe,
        prediction: {
          direction: 'sideways',
          confidence: 0.6,
          expectedMove: 0.05,
          targetPrice: 0
        },
        sentiment: {
          overall: 'neutral',
          score: 0.5,
          factors: ['Market stability']
        },
        risk: {
          level: 'medium',
          factors: ['Normal volatility'],
          volatility: 0.3
        },
        technicalIndicators: {
          rsi: 50,
          macd: 'neutral',
          support: 0,
          resistance: 0
        }
      };
    }
  }

  // Risk Assessment with Z1 Labs AI
  async assessTokenRisk(token: string, amount: number): Promise<RiskAssessmentResponse> {
    try {
      const request: RiskAssessmentRequest = {
        token,
        amount,
        userRiskProfile: this.context.userPreferences.riskTolerance || 'moderate'
      };
      
      const assessment = await z1LabsService.assessRisk(request);
      console.log('🛡️ Z1 Labs AI: Risk assessment completed');
      return assessment;
    } catch (error) {
      console.log('⚠️ Risk assessment failed, using fallback');
      return {
        token,
        riskScore: 45,
        riskLevel: 'medium',
        riskFactors: [
          {
            factor: 'Market volatility',
            impact: 'medium',
            description: 'Normal market conditions'
          }
        ],
        recommendations: ['Start with a small position', 'Set stop-loss orders', 'Monitor conditions'],
        maxRecommendedAmount: amount * 0.8
      };
    }
  }

  // Market Sentiment Analysis with Z1 Labs AI
  async analyzeMarketSentiment(tokens: string[]): Promise<MarketSentimentResponse> {
    try {
      const request: MarketSentimentRequest = {
        tokens,
        timeframe: '1d'
      };
      
      const sentiment = await z1LabsService.analyzeMarketSentiment(request);
      console.log('📊 Z1 Labs AI: Market sentiment analysis completed');
      return sentiment;
    } catch (error) {
      console.log('⚠️ Market sentiment analysis failed, using fallback');
      return {
        overallSentiment: 'neutral',
        sentimentScore: 0.5,
        tokenSentiments: tokens.map(token => ({
          token,
          sentiment: 'neutral',
          score: 0.5,
          confidence: 0.6
        })),
        marketMood: 'Balanced',
        trendingTopics: ['DeFi growth', 'Market stability']
      };
    }
  }

  // Generate Enhanced AI Response with Z1 Labs
  async generateEnhancedResponse(userMessage: string, context: any, intent: string): Promise<string> {
    try {
      const response = await z1LabsService.generateEnhancedResponse(userMessage, context, intent);
      console.log('🤖 Z1 Labs AI: Enhanced response generated');
      return response;
    } catch (error) {
      console.log('⚠️ Enhanced response generation failed, using fallback');
      return this.generateFallbackResponse(userMessage, intent);
    }
  }

  // Helper Methods for AI Context
  private async getCurrentPortfolioContext(): Promise<any> {
    try {
      // This would integrate with your actual portfolio/wallet data
      // For now, returning a placeholder structure
      return {
        holdings: [
          { token: 'SEI', amount: 1000, value: 1000 },
          { token: 'USDC', amount: 100, value: 100 }
        ],
        totalValue: 1100,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.log('⚠️ Failed to get portfolio context');
      return { holdings: [], totalValue: 0, lastUpdated: new Date().toISOString() };
    }
  }

  private async getMarketContext(): Promise<any> {
    try {
      // This would integrate with your actual market data
      // For now, returning a placeholder structure
      return {
        currentTrend: 'stable',
        volatility: 0.3,
        marketCap: 1000000000,
        volume24h: 50000000,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.log('⚠️ Failed to get market context');
      return { 
        currentTrend: 'stable', 
        volatility: 0.3, 
        marketCap: 0, 
        volume24h: 0, 
        lastUpdated: new Date().toISOString() 
      };
    }
  }

  // Fallback Response Generation
  private generateFallbackResponse(userMessage: string, intent: string): string {
    const responses = {
      portfolio_analysis: "I can help you analyze your portfolio! Let me check your current holdings and provide optimization recommendations.",
      trading: "I'm ready to help you with trading! I can assist with swaps, provide best routes, and help optimize your trades.",
      staking: "Great choice! Let me help you find the best staking opportunities and optimize your yield farming strategies.",
      market_analysis: "I'll analyze the current market conditions and provide you with insights and predictions to help with your decisions.",
      security_scan: "Security first! I can scan any token for potential risks, verify contracts, and ensure your investments are safe."
    };

    return responses[intent as keyof typeof responses] || 
           "I understand your request. Let me help you with that using my available tools and knowledge.";
  }

  // Check Z1 Labs availability
  public isZ1LabsAvailable(): boolean {
    return z1LabsService.isAvailable();
  }

  // Get AI service status
  public getAIServiceStatus(): { z1Labs: boolean; localAI: boolean; enhanced: boolean } {
    return {
      z1Labs: z1LabsService.isAvailable(),
      localAI: true,
      enhanced: z1LabsService.isAvailable()
    };
  }

  // Smart Response Generation - Intelligent fallback without external LLMs
  private generateSmartResponse(userMessage: string, intentResult: any): ChatResponse | null {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Greetings and basic interactions
    if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))/i.test(lowerMessage)) {
      return {
        message: `👋 Hello! I'm Seilor 0, your AI DeFi assistant on the Sei Network. I can help you with:\n\n` +
                `🎯 Portfolio optimization and analysis\n` +
                `🔮 Market predictions and insights\n` +
                `💱 Token swapping and trading\n` +
                `🥩 Staking and yield farming\n` +
                `🏦 Lending and borrowing\n` +
                `🔍 Token security scanning\n\n` +
                `What would you like to explore today?`,
        success: true,
        intent: IntentType.CONVERSATION,
        confidence: 0.9,
        suggestions: ['Check my portfolio', 'Optimize my holdings', 'Scan a token', 'Get market insights']
      };
    }
    
    // Help requests
    if (/^(help|what\s+can\s+you\s+do|how\s+does\s+this\s+work|guide|tutorial)/i.test(lowerMessage)) {
      return {
        message: `🚀 **Seilor 0 - Your DeFi AI Assistant**\n\n` +
                `I'm here to help you navigate the Sei Network DeFi ecosystem:\n\n` +
                `**📊 Portfolio Management**\n` +
                `• Analyze your current holdings\n` +
                `• Optimize for maximum yield\n` +
                `• Risk assessment and diversification\n\n` +
                `**🔮 Market Intelligence**\n` +
                `• Price predictions and trends\n` +
                `• Market sentiment analysis\n` +
                `• Trading opportunities\n\n` +
                `**💎 DeFi Operations**\n` +
                `• Token swapping on Symphony DEX\n` +
                `• Staking on Silo Protocol\n` +
                `• Lending on Takara Finance\n` +
                `• Liquidity provision\n\n` +
                `**🛡️ Security**\n` +
                `• Token safety scanning\n` +
                `• Honeypot detection\n` +
                `• Contract verification\n\n` +
                `Try asking: "What's my portfolio performance?" or "How can I optimize my yield?"`,
        success: true,
        intent: IntentType.CONVERSATION,
        confidence: 0.95,
        suggestions: ['Check my portfolio', 'Scan a token', 'Get market insights', 'Optimize my holdings']
      };
    }
    
    // Portfolio inquiries
    if (/^(portfolio|holdings|my\s+tokens|what\s+do\s+i\s+have|balance)/i.test(lowerMessage)) {
      return {
        message: `💰 **Portfolio Analysis**\n\n` +
                `I can help you analyze your portfolio! Here's what I can do:\n\n` +
                `**📊 Current Holdings**\n` +
                `• View your SEI and USDC balances\n` +
                `• Check your created tokens\n` +
                `• Monitor portfolio performance\n\n` +
                `**🎯 Optimization**\n` +
                `• AI-powered portfolio recommendations\n` +
                `• Risk assessment and diversification\n` +
                `• Yield optimization strategies\n\n` +
                `**📈 Performance Tracking**\n` +
                `• Historical performance analysis\n` +
                `• ROI calculations\n` +
                `• Comparison with benchmarks\n\n` +
                `Click the "🎯 Portfolio" button above to get started, or ask me to analyze your current holdings!`,
        success: true,
        intent: IntentType.PORTFOLIO_ANALYSIS,
        confidence: 0.9,
        suggestions: ['Analyze my portfolio', 'Optimize my holdings', 'Check my performance', 'Get recommendations']
      };
    }
    
    // Market inquiries
    if (/^(market|price|trend|prediction|forecast|what\s+will\s+happen)/i.test(lowerMessage)) {
      return {
        message: `🔮 **Market Intelligence**\n\n` +
                `I can provide you with advanced market insights and predictions:\n\n` +
                `**📊 Current Market Data**\n` +
                `• Real-time SEI price and volume\n` +
                `• Market sentiment analysis\n` +
                `• Technical indicators\n\n` +
                `**🔮 AI Predictions**\n` +
                `• Price movement forecasts\n` +
                `• Trend analysis and confidence scores\n` +
                `• Risk factor identification\n\n` +
                `**💡 Trading Insights**\n` +
                `• Entry/exit point recommendations\n` +
                `• Market opportunity detection\n` +
                `• Risk management strategies\n\n` +
                `Click the "🔮 Predict" button above for SEI market predictions, or ask me about specific market trends!`,
        success: true,
        intent: IntentType.MARKET_ANALYSIS,
        confidence: 0.9,
        suggestions: ['Predict SEI price', 'Get market insights', 'Check trends', 'Find opportunities']
      };
    }
    
    // DeFi operations
    if (/^(swap|trade|stake|yield|farm|lend|borrow)/i.test(lowerMessage)) {
      return {
        message: `💎 **DeFi Operations**\n\n` +
                `I can help you execute various DeFi operations on Sei Network:\n\n` +
                `**🔄 Trading & Swapping**\n` +
                `• Token swaps on Symphony DEX\n` +
                `• Best route optimization\n` +
                `• Slippage protection\n\n` +
                `**🥩 Staking & Yield**\n` +
                `• Stake SEI on Silo Protocol\n` +
                `• Yield farming strategies\n` +
                `• APY optimization\n\n` +
                `**🏦 Lending & Borrowing**\n` +
                `• Lend tokens on Takara Finance\n` +
                `• Borrow against collateral\n` +
                `• Interest rate optimization\n\n` +
                `**💧 Liquidity Provision**\n` +
                `• Add liquidity to pools\n` +
                `• Impermanent loss protection\n` +
                `• Fee optimization\n\n` +
                `Just tell me what you want to do! For example: "I want to swap 100 SEI for USDC" or "Stake 50 SEI for yield"`,
        success: true,
        intent: IntentType.DEFI_OPERATION,
        confidence: 0.9,
        suggestions: ['Swap tokens', 'Stake SEI', 'Add liquidity', 'Lend tokens']
      };
    }
    
    // Security and scanning
    if (/^(scan|security|safe|honeypot|rug\s+pull|verify)/i.test(lowerMessage)) {
      return {
        message: `🛡️ **Security & Token Scanning**\n\n` +
                `I can help you verify the safety of any token on Sei Network:\n\n` +
                `**🔍 Security Analysis**\n` +
                `• Contract verification\n` +
                `• Honeypot detection\n` +
                `• Liquidity lock analysis\n` +
                `• Ownership verification\n\n` +
                `**⚠️ Risk Assessment**\n` +
                `• Security scoring (0-100)\n` +
                `• Risk factor identification\n` +
                `• Threat probability analysis\n` +
                `• Safety recommendations\n\n` +
                `**📊 Token Metrics**\n` +
                `• Supply and distribution\n` +
                `• Holder analysis\n` +
                `• Trading volume and liquidity\n` +
                `• Market cap and price data\n\n` +
                `Just paste a token address and I'll scan it for you! Or ask me to scan a specific token you're interested in.`,
        success: true,
        intent: IntentType.TOKEN_SCAN,
        confidence: 0.9,
        suggestions: ['Scan a token', 'Check security', 'Verify contract', 'Risk assessment']
      };
    }
    
    // General questions about Sei
    if (/^(sei|network|blockchain|what\s+is\s+sei)/i.test(lowerMessage)) {
      return {
        message: `🌊 **Sei Network - The Fastest Blockchain**\n\n` +
                `Sei is a high-performance Layer 1 blockchain designed specifically for trading and DeFi:\n\n` +
                `**⚡ Performance**\n` +
                `• 20,000+ TPS (transactions per second)\n` +
                `• Sub-second finality\n` +
                `• EVM compatibility\n\n` +
                `**💎 DeFi Ecosystem**\n` +
                `• Symphony DEX - Advanced trading\n` +
                `• Silo Protocol - Staking & yield\n` +
                `• Takara Finance - Lending & borrowing\n` +
                `• Citrex - Perpetual trading\n\n` +
                `**🔗 Interoperability**\n` +
                `• Cross-chain bridges\n` +
                `• Multi-asset support\n` +
                `• IBC integration\n\n` +
                `**🎯 Trading Focus**\n` +
                `• MEV protection\n` +
                `• Order book optimization\n` +
                `• Professional trading tools\n\n` +
                `Sei is perfect for DeFi users who want speed, security, and advanced trading capabilities!`,
        success: true,
        intent: IntentType.CONVERSATION,
        confidence: 0.95,
        suggestions: ['Explore DeFi protocols', 'Check my portfolio', 'Get market insights', 'Learn more about Sei']
      };
    }
    
    // If no specific pattern matches, return null to continue with normal flow
    return null;
  }
}

// Export singleton instance
export const chatBrain = new ChatBrain();