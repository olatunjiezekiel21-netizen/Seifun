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
      
      // Step 3: Fallback to ActionBrain System
      console.log('🔄 Using ActionBrain fallback system...');
      
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
  
  // Enhanced Intent Analysis with Z1 Labs
  private async enhancedIntentAnalysis(userMessage: string): Promise<EnhancedIntentAnalysis> {
    try {
      const analysis = await z1LabsService.analyzeIntent(userMessage);
      
      // Update AI context with new insights
      if (!this.context.aiContext) {
        this.context.aiContext = {
          userProfile: 'intermediate',
          riskTolerance: 'medium',
          investmentGoals: ['growth', 'stability'],
          portfolioHistory: [],
          marketInsights: []
        };
      }
      
      // Update context based on analysis
      if (analysis.context) {
        this.context.aiContext.userProfile = analysis.context.userProfile;
        this.context.aiContext.riskTolerance = analysis.context.riskTolerance;
        this.context.aiContext.investmentGoals = analysis.context.investmentGoals;
      }
      
      return analysis;
    } catch (error) {
      console.warn('Enhanced intent analysis failed, using fallback:', error);
      return z1LabsService.fallbackIntentAnalysis(userMessage);
    }
  }

  // Portfolio Optimization with Z1 Labs
  public async optimizeUserPortfolio(portfolioData: any): Promise<string> {
    try {
      const request: PortfolioOptimizationRequest = {
        portfolio: {
          assets: portfolioData.assets || [],
          totalValue: portfolioData.totalValue || 0,
          riskTolerance: this.context.aiContext?.riskTolerance || 'medium',
          timeHorizon: 'medium'
        },
        marketConditions: {
          currentTrend: 'neutral',
          volatility: 'medium',
          sectorPerformance: {}
        }
      };

      const optimization = await z1LabsService.optimizePortfolio(request);
      
      // Format response
      let message = `🎯 **Portfolio Optimization Results**\n\n`;
      message += `📊 **Current Portfolio Value**: $${portfolioData.totalValue?.toFixed(2) || '0.00'}\n`;
      message += `🔄 **Expected Value**: $${optimization.expectedPortfolioValue.toFixed(2)}\n`;
      message += `⚠️ **Risk Score**: ${optimization.riskScore}/100\n`;
      message += `🌐 **Diversification**: ${optimization.diversificationScore}/100\n\n`;
      
      message += `💡 **Recommendations**:\n`;
      optimization.recommendations.forEach((rec, index) => {
        message += `${index + 1}. **${rec.action.toUpperCase()}** ${rec.asset}: ${rec.amount} tokens\n`;
        message += `   📝 ${rec.reason}\n`;
        message += `   🎯 Confidence: ${(rec.confidence * 100).toFixed(0)}%\n`;
        message += `   📈 Expected Return: ${(rec.expectedReturn * 100).toFixed(1)}%\n\n`;
      });
      
      message += `📅 **Next Review**: ${new Date(optimization.nextReviewDate).toLocaleDateString()}\n`;
      message += `⚡ **Powered by Z1 Labs AI**`;
      
      return message;
    } catch (error) {
      console.error('Portfolio optimization failed:', error);
      return `❌ Portfolio optimization failed. Please try again later.`;
    }
  }

  // Market Prediction with Z1 Labs
  public async predictMarketMovement(asset: string, timeframe: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' = '1w'): Promise<string> {
    try {
      const request: MarketPredictionRequest = {
        asset,
        timeframe,
        includeFactors: true
      };

      const prediction = await z1LabsService.predictMarket(request);
      
      // Format response
      let message = `🔮 **Market Prediction for ${asset.toUpperCase()}**\n\n`;
      message += `⏰ **Timeframe**: ${timeframe}\n`;
      message += `📈 **Direction**: ${prediction.prediction.direction.toUpperCase()}\n`;
      message += `🎯 **Confidence**: ${(prediction.prediction.confidence * 100).toFixed(0)}%\n`;
      message += `📊 **Expected Change**: ${prediction.prediction.percentageChange > 0 ? '+' : ''}${prediction.prediction.percentageChange.toFixed(2)}%\n\n`;
      
      if (prediction.factors.length > 0) {
        message += `🔍 **Key Factors**:\n`;
        prediction.factors.forEach((factor, index) => {
          const emoji = factor.impact === 'positive' ? '✅' : factor.impact === 'negative' ? '❌' : '➖';
          message += `${emoji} ${factor.name} (${(factor.weight * 100).toFixed(0)}%): ${factor.description}\n`;
        });
        message += `\n`;
      }
      
      if (prediction.riskFactors.length > 0) {
        message += `⚠️ **Risk Factors**:\n`;
        prediction.riskFactors.forEach((risk, index) => {
          message += `${index + 1}. ${risk.name} (${(risk.probability * 100).toFixed(0)}% probability)\n`;
          message += `   Impact: ${risk.impact.toUpperCase()}\n`;
          message += `   ${risk.description}\n\n`;
        });
      }
      
      if (prediction.recommendations.length > 0) {
        message += `💡 **Recommendations**:\n`;
        prediction.recommendations.forEach((rec, index) => {
          message += `${index + 1}. ${rec}\n`;
        });
      }
      
      message += `\n⚡ **Powered by Z1 Labs AI**`;
      
      return message;
    } catch (error) {
      console.error('Market prediction failed:', error);
      return `❌ Market prediction failed. Please try again later.`;
    }
  }

  // Enhanced Response Generation with Z1 Labs
  private async generateEnhancedResponse(userMessage: string, intentAnalysis: EnhancedIntentAnalysis): Promise<string> {
    try {
      const context = {
        userProfile: this.context.aiContext,
        portfolio: this.getCurrentPortfolioContext(),
        marketConditions: this.getMarketContext()
      };

      const enhancedResponse = await z1LabsService.generateEnhancedResponse(userMessage, context);
      return enhancedResponse;
    } catch (error) {
      console.warn('Enhanced response generation failed, using fallback:', error);
      return this.generateFallbackResponse(userMessage, intentAnalysis);
    }
  }

  // Get current portfolio context for AI
  private getCurrentPortfolioContext(): any {
    // This would integrate with actual portfolio data
    return {
      totalValue: 0,
      assets: [],
      lastUpdated: new Date()
    };
  }

  // Get market context for AI
  private getMarketContext(): any {
    // This would integrate with real-time market data
    return {
      currentTrend: 'neutral',
      volatility: 'medium',
      timestamp: new Date()
    };
  }

  // Generate fallback response when Z1 Labs is not available
  private generateFallbackResponse(userMessage: string, intentAnalysis: EnhancedIntentAnalysis): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('optimize')) {
      return `I can help you optimize your portfolio! Currently using enhanced local AI capabilities. To get the full AI-powered portfolio optimization, we're integrating with advanced AI models. For now, I can help you with basic portfolio analysis and DeFi strategies.`;
    }
    
    if (lowerMessage.includes('predict') || lowerMessage.includes('forecast')) {
      return `I can provide market insights and analysis! Currently using enhanced local AI capabilities. For advanced market predictions with AI models, we're integrating cutting-edge prediction systems. I can still help you with current market data and technical analysis.`;
    }
    
    return `I understand you're asking about "${userMessage}". Let me help you with that using our enhanced local AI capabilities. We're also integrating advanced AI models for even better assistance.`;
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
}

// Export singleton instance
export const chatBrain = new ChatBrain();