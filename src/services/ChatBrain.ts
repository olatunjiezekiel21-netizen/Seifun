import { actionBrain, IntentType } from './ActionBrain';

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
      
      // Step 1: Intent Recognition through Action Brain
      const intentResult = await actionBrain.recognizeIntent(userMessage);
      
      // Step 2: Context Enhancement
      const enhancedIntent = this.enhanceWithContext(intentResult);
      
      // Step 3: Action Execution
      const actionResponse = await actionBrain.executeAction(enhancedIntent);
      
      // Step 4: Update Context
      this.updateContext(enhancedIntent, actionResponse);
      
      // Step 5: Generate Conversational Response
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
        message: `🤖 **I encountered an issue processing your message.**\n\n**Error**: ${error.message}\n\n**Please try**: Being more specific or rephrasing your request.`,
        success: false,
        intent: IntentType.UNKNOWN,
        confidence: 0,
        suggestions: ['Try a different approach', 'Ask for help', 'Check your message format']
      };
    }
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
    };
    
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
    };
    
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