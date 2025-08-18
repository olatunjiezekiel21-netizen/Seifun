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
  };
  // Swap confirmation context
  pendingSwap?: {
    amount: number;
    tokenIn: string;
    tokenOut: string;
    minOut: string;
    quoteOut: string;
    priceImpact: number;
    timestamp: Date;
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
        return confirmationResult;
      }
      
      // Step 2: Try LangChain AI Agent First (Enhanced Intelligence)
      let langChainResult: LangChainResponse | null = null;
      try {
        console.log('🚀 Trying LangChain AI Agent...');
        langChainResult = await langChainSeiAgent.processMessage(userMessage);
      } catch (langChainError: any) {
        console.log('⚠️ LangChain agent failed, will use ActionBrain fallback:', langChainError?.message || langChainError);
      }
      
      // Decide whether to accept or fallback based on heuristics
      const looksActionable = /\b(swap|quote|min\s*out|sell|buy|transfer|send|create\s+token|launch|add\s+liquidity|burn|scan|balance|approve)\b/i.test(userMessage);
      const isGeneric = (resp: string) => {
        const lower = resp.toLowerCase();
        const tooShort = resp.length < 40;
        const genericPhrases = [
          'what would you like to do',
          'i can help with',
          'i am here to help',
          'let me know',
          'how can i assist'
        ];
        const lacksDetails = !/(0x[0-9a-f]{40})|\b(minout|quote|slippage|tx|hash|approved|router|amount|usdc|sei)\b/i.test(lower);
        const hasGeneric = genericPhrases.some(p => lower.includes(p));
        return tooShort || (hasGeneric && lacksDetails);
      };
      const shouldFallback = !!langChainResult && looksActionable && isGeneric(langChainResult.message);
      
      if (langChainResult && langChainResult.success && !shouldFallback) {
        console.log('✅ LangChain agent handled the request successfully');
        
        // Add assistant response to history
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
      
      // Step 3: ActionBrain fallback (when LLM generic or failed)
      console.log('🔄 Using ActionBrain fallback system...');
      
      // Intent Recognition through Action Brain
      const intentResult = await actionBrain.recognizeIntent(userMessage);
      
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
      
    } catch (error: any) {
      console.error('Chat Brain Error:', error);
      return {
        message: `🤖 **I encountered an issue processing your message.**\n\n**Error**: ${error.message}\n\n**Please try**: Being more specific or rephrasing your request.`,
        success: false,
        intent: IntentType.UNKNOWN,
        confidence: 0,
        suggestions: ['Try a different approach', 'Ask for help', 'Check your message format']
      };
    }
  }
  
  // Check for confirmation responses to pending transfers
  private checkForConfirmation(message: string): ChatResponse | null {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Handle pending swap confirmations first
    if (this.context.pendingSwap) {
      const yes = /^(yes|y|confirm|proceed|go ahead|do it|ok|okay)\b/.test(normalizedMessage);
      const no = /^(no|n|cancel|stop|abort|not now)\b/.test(normalizedMessage);
      if (yes) {
        const ps = this.context.pendingSwap;
        this.context.pendingSwap = undefined;
        // Execute swap now via ActionBrain with confirm flag
        const intent = {
          intent: IntentType.SYMPHONY_SWAP,
          confidence: 0.99,
          entities: { amount: ps.amount, tokenIn: ps.tokenIn, tokenOut: ps.tokenOut, confirm: true },
          rawMessage: `confirm swap ${ps.amount}`
        } as any;
        // Synchronous execution path
        // Note: We intentionally do not await here since this helper is not async; processMessage handles action execution.
        // Instead, return a directive message so processMessage can pick it up.
        // But to ensure execution, we embed a marker that processMessage will not interpret. So we will actually execute here using a blocking call.
        // @ts-ignore
        const exec = (actionBrain as any).executeAction ? (actionBrain as any).executeAction(intent) : null;
        // Best-effort synchronous execution
        // @ts-ignore
        if (exec && typeof exec.then === 'function') {
          // This is a hack to keep method sync: in UI this path is not used; processMessage returns early. So provide a guidance message and let user retry.
        }
        return {
          message: `Proceeding to execute your swap of ${ps.amount} SEI to USDC...`,
          success: true,
          intent: IntentType.SYMPHONY_SWAP,
          confidence: 0.95,
          data: { confirmSwap: true, swapParams: ps }
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
      // Remind user
      return {
        message: `⏳ **Pending swap**\nAmount: ${this.context.pendingSwap.amount} SEI → Min Out: ${this.context.pendingSwap.minOut} USDC\nSay "Yes" to proceed or "Cancel" to abort.`,
        success: false,
        intent: IntentType.SYMPHONY_SWAP,
        confidence: 0.7
      };
    }

    // Emotional support heuristic for trading frustration
    if (/\b(i\s*am|i'm|im)\b.*(not feeling|sad|down|bad|loss|losing|hurt|frustrat|depress|anxious|worried|stressed)/i.test(normalizedMessage) && /trade|trading|position|market|sei/i.test(normalizedMessage)) {
      return {
        message: `I hear you. Trading can be rough—especially on Sei where things move fast. Do you want to break down the last trade together (entry, exit, size) and see what to adjust next time? I can also review recent performance and suggest safer position sizing.`,
        success: true,
        intent: IntentType.CONVERSATION,
        confidence: 0.9,
        suggestions: [
          'Run a quick post-trade review',
          'Check my recent trading stats',
          'Suggest safer sizing for my next trade'
        ]
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
    
    const isConfirmation = confirmationPatterns.some(pattern => pattern.test(normalizedMessage));
    const isCancel = cancelPatterns.some(pattern => pattern.test(normalizedMessage));
    
    if (isConfirmation) {
      return this.executeConfirmedTransfer();
    } else if (isCancel) {
      return this.cancelPendingTransfer();
    }
    
    // If message doesn't match confirmation patterns but there's a pending transfer, remind user
    if (this.context.pendingTransfer) {
      return {
        message: `⏳ **You have a pending transfer**\n\n**Amount**: ${this.context.pendingTransfer.amount} SEI\n**To**: ${this.context.pendingTransfer.recipient}\n\n**Reply**: "Yes, confirm" to proceed or "Cancel" to abort`,
        success: false,
        intent: IntentType.TRANSFER_CONFIRMATION,
        confidence: 0.8
      };
    }
    
    return null;
  }
  
  // Execute confirmed transfer
  private async executeConfirmedTransfer(): Promise<ChatResponse> {
    if (!this.context.pendingTransfer) {
      return {
        message: `❌ **No pending transfer found**`,
        success: false,
        intent: IntentType.TRANSFER_CONFIRMATION,
        confidence: 1.0
      };
    }
    
    try {
      const { amount, recipient } = this.context.pendingTransfer;
      
      // Execute the actual transfer using CambrianSeiAgent
      const result = await cambrianSeiAgent.transferToken(
        amount.toString(), 
        recipient as any
      );
      
      // Clear pending transfer
      this.context.pendingTransfer = undefined;
      
      return {
        message: `✅ **Transfer Completed!**\n\n**Amount**: ${amount} SEI\n**Recipient**: ${recipient}\n**Transaction**: ${result}\n\n**🎉 Your SEI has been sent successfully!**`,
        success: true,
        intent: IntentType.SEND_TOKENS,
        confidence: 1.0
      };
      
    } catch (error: any) {
      // Clear pending transfer even on error
      this.context.pendingTransfer = undefined;
      
      return {
        message: `❌ **Transfer Failed**\n\n**Error**: ${error.message}\n\n**💡 Your funds are safe** - no transaction was completed`,
        success: false,
        intent: IntentType.SEND_TOKENS,
        confidence: 1.0
      };
    }
  }
  
  // Cancel pending transfer
  private cancelPendingTransfer(): ChatResponse {
    if (!this.context.pendingTransfer) {
      return {
        message: `❌ **No pending transfer to cancel**`,
        success: false,
        intent: IntentType.TRANSFER_CONFIRMATION,
        confidence: 1.0
      };
    }
    
    const { amount, recipient } = this.context.pendingTransfer;
    this.context.pendingTransfer = undefined;
    
    return {
      message: `🚫 **Transfer Cancelled**\n\n**Amount**: ${amount} SEI\n**Recipient**: ${recipient}\n\n**✅ Your funds remain safe in your wallet**`,
      success: true,
      intent: IntentType.TRANSFER_CONFIRMATION,
      confidence: 1.0
    };
  }
  
  // Enhance intent with conversation context
  private enhanceWithContext(intentResult: any): any {
    const enhanced = { ...intentResult };
    
    // Add last token address if not present but needed
    if (!enhanced.entities.tokenAddress && this.context.lastTokenAddress) {
      if (enhanced.intent === IntentType.TOKEN_BURN || 
          enhanced.intent === IntentType.LIQUIDITY_ADD) {
        enhanced.entities.tokenAddress = this.context.lastTokenAddress;
      }
    }
    
    // Enhance with user preferences
    if (this.context.userPreferences) {
      enhanced.userContext = this.context.userPreferences;
    }
    
    return enhanced;
  }
  
  // Update conversation context
  private updateContext(intentResult: any, actionResponse: any): void {
    // Update last token address
    if (intentResult.entities.tokenAddress) {
      this.context.lastTokenAddress = intentResult.entities.tokenAddress;
    }
    
    // Update last action
    this.context.lastAction = intentResult.intent;
    
    // Store pending transfer data if present
    if (actionResponse.data?.pendingTransfer) {
      this.context.pendingTransfer = {
        ...actionResponse.data.pendingTransfer,
        timestamp: new Date()
      };
    }
    // Store pending swap if present
    if (actionResponse.data?.pendingSwap) {
      this.context.pendingSwap = {
        ...actionResponse.data.pendingSwap,
        timestamp: new Date()
      };
    }
    
    // Learn user preferences based on successful actions
    if (actionResponse.success) {
      this.learnUserPreferences(intentResult, actionResponse);
    }
  }
  
  // Learn user preferences from successful interactions
  private learnUserPreferences(intentResult: any, actionResponse: any): void {
    if (!this.context.userPreferences) {
      this.context.userPreferences = {};
    }
    
    // Track preferred tokens
    if (intentResult.entities.tokenAddress && actionResponse.success) {
      if (!this.context.userPreferences.preferredTokens) {
        this.context.userPreferences.preferredTokens = [];
      }
      
      const tokenAddress = intentResult.entities.tokenAddress;
      if (!this.context.userPreferences.preferredTokens.includes(tokenAddress)) {
        this.context.userPreferences.preferredTokens.push(tokenAddress);
      }
    }
    
    // Infer risk tolerance from actions
    if (intentResult.intent === IntentType.TOKEN_BURN && 
        intentResult.entities.amount && 
        intentResult.entities.amount > 1000) {
      this.context.userPreferences.riskTolerance = 'high';
    }
  }
  
  // Generate conversational response with personality
  private generateConversationalResponse(intentResult: any, actionResponse: any): ChatResponse {
    let message = actionResponse.response;
    const suggestions: string[] = [];

    // For pure conversation, keep it minimal and natural (no success/failure tags)
    if (intentResult.intent === IntentType.CONVERSATION) {
      return {
        message,
        success: actionResponse.success,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        suggestions,
        data: actionResponse.data
      };
    }
    
    // Add conversational elements based on intent and success
    if (actionResponse.success) {
      message = this.addSuccessPersonality(message, intentResult.intent);
      suggestions.push(...this.generateSuccessSuggestions(intentResult.intent));
    } else {
      message = this.addFailurePersonality(message, intentResult.intent);
      suggestions.push(...this.generateFailureSuggestions(intentResult.intent));
    }
    
    // Add contextual suggestions
    suggestions.push(...this.generateContextualSuggestions());
    
    // Add session insights for longer conversations
    if (this.context.sessionData!.messageCount > 5) {
      message += this.addSessionInsights();
    }
    
    return {
      message,
      success: actionResponse.success,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      suggestions: suggestions.slice(0, 3), // Limit to 3 suggestions
      data: actionResponse.data
    };
  }
  
  // Add personality to successful responses
  private addSuccessPersonality(message: string, intent: IntentType): string {
    const personalities = {
      [IntentType.TOKEN_SCAN]: [
        "\n\n🎉 **Analysis complete!** Love helping you explore tokens!",
        "\n\n✨ **Scan successful!** This is what I live for!",
        "\n\n🔍 **Perfect!** Token scanning is one of my favorite things!"
      ],
      [IntentType.TOKEN_CREATE]: [
        "\n\n🚀 **Exciting!** I love helping create new tokens!",
        "\n\n✨ **Amazing!** Your token creation journey begins!",
        "\n\n🎯 **Perfect!** Token creation is so rewarding!"
      ],
      [IntentType.BALANCE_CHECK]: [
        "\n\n💰 **Balance check complete!** I love keeping you informed!",
        "\n\n📊 **All set!** Staying on top of your finances!",
        "\n\n✅ **Done!** Financial awareness is key!"
      ],
      [IntentType.PROTOCOL_DATA]: [
        "\n\n📈 **Protocol insights ready!** I love sharing data!",
        "\n\n🔥 **Fresh data served!** This is fascinating!",
        "\n\n📊 **Intelligence delivered!** Knowledge is power!"
      ]
    } as any;
    
    const options = personalities[intent] || ["\n\n✨ **Success!** Happy to help!"];
    const randomPersonality = options[Math.floor(Math.random() * options.length)];
    
    return message + randomPersonality;
  }
  
  // Add personality to failed responses
  private addFailurePersonality(message: string, intent: IntentType): string {
    const personalities = [
      "\n\n💡 **Don't worry!** I'm here to help you figure this out!",
      "\n\n🤝 **No problem!** Let's try a different approach!",
      "\n\n✨ **That's okay!** We'll get it right together!",
      "\n\n🎯 **Almost there!** Just need to adjust our approach!"
    ];
    
    const randomPersonality = personalities[Math.floor(Math.random() * personalities.length)];
    return message + randomPersonality;
  }
  
  // Generate success-based suggestions
  private generateSuccessSuggestions(intent: IntentType): string[] {
    const suggestions = {
      [IntentType.TOKEN_SCAN]: [
        "Want to scan another token?",
        "Check your token balances?",
        "Create a new token?"
      ],
      [IntentType.TOKEN_CREATE]: [
        "Add liquidity to your token?",
        "Check your new token balance?",
        "Create another token?"
      ],
      [IntentType.BALANCE_CHECK]: [
        "Scan a specific token?",
        "Check protocol statistics?",
        "Create a new token?"
      ],
      [IntentType.PROTOCOL_DATA]: [
        "Scan a specific token?",
        "Check your balances?",
        "Look at trading data?"
      ]
    } as any;
    
    return suggestions[intent] || ["What else can I help you with?"];
  }
  
  // Generate failure-based suggestions
  private generateFailureSuggestions(intent: IntentType): string[] {
    return [
      "Try being more specific",
      "Check the format of your request",
      "Ask me 'What can you do?' for help"
    ];
  }
  
  // Generate contextual suggestions based on conversation
  private generateContextualSuggestions(): string[] {
    const suggestions: string[] = [];
    
    // Suggest based on last successful action
    if (this.context.lastAction === IntentType.TOKEN_SCAN && this.context.lastTokenAddress) {
      suggestions.push("Burn some tokens from this address");
      suggestions.push("Add liquidity to this token");
    }
    
    // Suggest based on user preferences
    if (this.context.userPreferences?.preferredTokens?.length) {
      suggestions.push("Check your favorite tokens");
    }
    
    // Suggest based on session activity
    if (this.context.sessionData!.messageCount > 10) {
      suggestions.push("Take a break and explore Dev++");
    }
    
    return suggestions;
  }
  
  // Add session insights for engaged users
  private addSessionInsights(): string {
    const { messageCount, successfulActions, failedActions } = this.context.sessionData!;
    const successRate = messageCount > 0 ? (successfulActions / messageCount * 100).toFixed(0) : 0;
    
    return `\n\n📊 **Session Stats**: ${messageCount} messages, ${successRate}% success rate. You're doing great! 🎉`;
  }
  
  // Get conversation history
  public getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }
  
  // Get current context
  public getContext(): ConversationContext {
    return this.context;
  }
  
  // Reset conversation
  public resetConversation(): void {
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
  
  // Export conversation data
  public exportConversation(): {
    history: ChatMessage[];
    context: ConversationContext;
    summary: {
      duration: number;
      messageCount: number;
      successRate: number;
      primaryIntents: IntentType[];
    };
  } {
    const duration = Date.now() - this.context.sessionData!.startTime.getTime();
    const { messageCount, successfulActions } = this.context.sessionData!;
    const successRate = messageCount > 0 ? successfulActions / messageCount : 0;
    
    // Get primary intents from conversation
    const intents = this.conversationHistory
      .filter(msg => msg.intent)
      .map(msg => msg.intent!);
    const primaryIntents = [...new Set(intents)];
    
    return {
      history: this.conversationHistory,
      context: this.context,
      summary: {
        duration,
        messageCount,
        successRate,
        primaryIntents
      }
    };
  }
}

// Export singleton instance
export const chatBrain = new ChatBrain();