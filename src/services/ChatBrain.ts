import { actionBrain, IntentType } from './ActionBrain';
import { cambrianSeiAgent } from './CambrianSeiAgent';
import { langChainSeiAgent, LangChainResponse } from './LangChainSeiAgent';

// Conversation Context
interface ConversationContext {
  lastTokenAddress?: string;
  lastAction?: string;
  userPreferences?: {
    preferredTokens?: string[];
    riskTolerance?: 'low' | 'medium' | 'high';
    tradingStyle?: 'conservative' | 'moderate' | 'aggressive';
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
      // Enhanced error responses with natural language
      const errorMessage = this.generateNaturalErrorResponse(actionResponse.response, intentResult.intent);
      return {
        message: errorMessage,
        success: false,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        suggestions: this.generateSuggestions(intentResult.intent)
      };
    }
    
    // Generate natural language response based on intent
    const message = this.generateNaturalResponse(intentResult.intent, actionResponse.response, intentResult.confidence);
    
    return {
      message,
      success: true,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      suggestions: this.generateSuggestions(intentResult.intent)
    };
  }

  // Generate natural language responses
  private generateNaturalResponse(intent: IntentType, actionResponse: string, confidence: number): string {
    const responses = {
      [IntentType.CONVERSATION]: [
        "I'm here to help you with DeFi on Sei! What would you like to explore today?",
        "Great question! Let me assist you with that.",
        "I understand what you're asking. Here's what I can help you with:",
        "Thanks for reaching out! I'm ready to help with your DeFi needs.",
        "I'm Seilor 0, your AI assistant for DeFi on Sei! I can help you with staking, swapping, creating tokens, and more.",
        "I'm here to help you navigate the world of DeFi on Sei! What would you like to learn about?"
      ],
      [IntentType.TOKEN_SCAN]: [
        "🔍 I've analyzed that token for you. Here's what I found:",
        "🔍 Let me scan that token and provide you with a security assessment:",
        "🔍 Running a comprehensive security scan on that token..."
      ],
      [IntentType.BALANCE_CHECK]: [
        "💰 Let me check your wallet balance for you:",
        "💰 Here's your current wallet status:",
        "💰 Checking your portfolio balance..."
      ],
      [IntentType.SYMPHONY_SWAP]: [
        "🔄 I'll help you with that swap. Here are the details:",
        "🔄 Processing your swap request:",
        "🔄 Let me set up that token exchange for you:"
      ],
      [IntentType.STAKE_TOKENS]: [
        "🥩 I'll help you stake your tokens for yield:",
        "🥩 Setting up staking for you:",
        "🥩 Let me configure your staking position:",
        "🥩 Great! Staking is a great way to earn passive income on Sei. I can help you stake your tokens with validators."
      ],
      [IntentType.LEND_TOKENS]: [
        "🏦 I'll help you lend your tokens:",
        "🏦 Setting up lending for you:",
        "🏦 Let me configure your lending position:"
      ],
      [IntentType.OPEN_POSITION]: [
        "📈 I'll help you open a trading position:",
        "📈 Setting up your position:",
        "📈 Let me configure your trading position:"
      ],
      [IntentType.WALLET_INFO]: [
        "👛 Here's your wallet information:",
        "👛 Let me check your wallet details:",
        "👛 Here's what I found about your wallet:"
      ]
    };

    const intentResponses = responses[intent] || responses[IntentType.CONVERSATION];
    const baseResponse = intentResponses[Math.floor(Math.random() * intentResponses.length)];
    
    return `${baseResponse}\n\n${actionResponse}`;
  }

  // Generate natural error responses
  private generateNaturalErrorResponse(errorMessage: string, intent: IntentType): string {
    const errorResponses = {
      [IntentType.SYMPHONY_SWAP]: [
        "I'd be happy to help you swap tokens! However, I need a bit more information to make sure I get it right for you.",
        "I want to make sure I execute your swap correctly. Could you provide more details?",
        "Let me help you with that swap, but I need some additional information first."
      ],
      [IntentType.STAKE_TOKENS]: [
        "I'd love to help you stake your tokens! To get started, I need to know which tokens you'd like to stake.",
        "Staking is a great way to earn yield! Let me know which tokens you want to stake and I'll help you set it up.",
        "I'm ready to help you stake, but I need a bit more information to proceed."
      ],
      [IntentType.LEND_TOKENS]: [
        "Lending can be a great way to earn passive income! I just need a few more details to help you get started.",
        "I'd be happy to help you lend your tokens! Could you provide more specific information?",
        "Let me help you set up lending, but I need some additional details first."
      ],
      [IntentType.OPEN_POSITION]: [
        "I'd love to help you open a trading position! To get started, I need to know which asset you want to trade.",
        "Trading can be exciting! Let me know what you'd like to trade and I'll help you set up your position.",
        "I'm ready to help you trade, but I need a bit more information to proceed safely."
      ]
    };

    const intentErrorResponses = errorResponses[intent] || [
      "I'd be happy to help you with that! However, I need a bit more information to assist you properly.",
      "I want to make sure I help you correctly. Could you provide more specific details?",
      "Let me help you with that, but I need some additional information first."
    ];

    const baseErrorResponse = intentErrorResponses[Math.floor(Math.random() * intentErrorResponses.length)];
    
    return `${baseErrorResponse}\n\n${errorMessage}`;
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
}

// Export singleton instance
export const chatBrain = new ChatBrain();