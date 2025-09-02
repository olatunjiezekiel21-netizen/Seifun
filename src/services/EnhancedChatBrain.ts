import { hybridSeiService } from './HybridSeiService';

// 🚀 NATURAL AI CHAT BRAIN - NO PLACEHOLDERS, JUST NATURAL CONVERSATION

export interface ChatContext {
  pendingAction: {
    type: 'stake' | 'lend' | 'swap' | 'transfer' | 'create_token';
    amount?: string;
    token?: string;
    recipient?: string;
    tokenName?: string;
    tokenSymbol?: string;
    details: any;
  } | null;
  userBalance: {
    sei: string;
    usdc: string;
  } | null;
}

export class EnhancedChatBrain {
  private context: ChatContext = {
    pendingAction: null,
    userBalance: null
  };

  constructor() {
    this.loadUserBalance();
  }

  private async loadUserBalance() {
    try {
      const seiBalance = await hybridSeiService.getBalance();
      const portfolio = await hybridSeiService.getPortfolio();
      
      this.context.userBalance = {
        sei: seiBalance,
        usdc: portfolio?.totalValue || '0'
      };
    } catch (error) {
      console.error('Failed to load user balance:', error);
    }
  }

  public async processMessage(message: string): Promise<{ message: string; action?: string }> {
    try {
      const userInput = message.toLowerCase().trim();
      
      // Check for confirmation responses first
      if (this.context.pendingAction) {
        return this.handleConfirmation(userInput);
      }

      // Handle new requests with natural responses
      return this.handleNewRequest(userInput, message);
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        message: "I'm having a bit of trouble understanding that right now. Could you try rephrasing your question? I'm here to help with staking, lending, and other DeFi activities!",
        action: 'error'
      };
    }
  }

  private async handleConfirmation(userInput: string): Promise<{ message: string; action?: string }> {
    const action = this.context.pendingAction!;
    
    if (userInput.includes('yes') || userInput.includes('confirm') || userInput.includes('ok') || userInput.includes('sure')) {
      try {
        // Execute the pending action
        const result = await this.executeAction(action);
        
        // Clear pending action
        this.context.pendingAction = null;
        
        // Update balance
        await this.loadUserBalance();
        
        return {
          message: this.formatSuccessMessage(action, result),
          action: 'success'
        };
      } catch (error: any) {
        this.context.pendingAction = null;
        return {
          message: `Something went wrong with your ${action.type} request. ${error.message || 'Please try again in a moment.'} I'm here if you need help with anything else!`,
          action: 'error'
        };
      }
    } else if (userInput.includes('no') || userInput.includes('cancel') || userInput.includes('abort') || userInput.includes('never mind')) {
      this.context.pendingAction = null;
      return {
        message: `No problem! I've cancelled that ${action.type} request. What else can I help you with today?`,
        action: 'cancelled'
      };
    } else {
      // Ask for clear confirmation
      return {
        message: `Just to be clear - do you want to proceed with ${action.type.replace('_', ' ')}? Say "yes" to confirm or "no" to cancel.`,
        action: 'confirmation_required'
      };
    }
  }

  private async handleNewRequest(userInput: string, originalMessage: string): Promise<{ message: string; action?: string }> {
    // Excited/Positive responses
    if (/^(excited|happy|great|awesome|amazing|wonderful|fantastic|love|perfect|am\s+so\s+excited)/i.test(userInput)) {
      return {
        message: `That's wonderful to hear! I love working with enthusiastic users. Since you're feeling great, maybe this is a perfect time to explore some DeFi opportunities? I can help you stake SEI to earn passive income, or we could look at lending options. What interests you most?`
      };
    }

    // Specific staking requests with amounts
    if (/stake\s+(\d+(?:\.\d+)?)\s*(sei|usdc)/i.test(userInput)) {
      const match = userInput.match(/stake\s+(\d+(?:\.\d+)?)\s*(sei|usdc)/i);
      const amount = match![1];
      const token = match![2].toUpperCase();
      
      return this.handleStakingRequest(amount, token);
    }

    // General staking interest (natural responses)
    if (/want.*stake|i.*stake|stake.*sei/i.test(userInput) && !/^\s*(stake|staking)\s*$/i.test(userInput)) {
      return {
        message: `Great choice! Staking is one of my favorite ways to earn passive income. With our current rates, you can earn around 12% APY on SEI. How much were you thinking of staking? For example, "stake 50 SEI" would be a good start!`
      };
    }

    // General staking query
    if (/^(stake|staking)$/i.test(userInput)) {
      return {
        message: `Staking is a fantastic way to earn passive income! Right now you can earn 12% APY on SEI and 8% APY on USDC. It's pretty straightforward - you lock up your tokens for a period and earn rewards. How much would you like to stake?`
      };
    }

    // Specific lending requests with amounts
    if (/lend\s+(\d+(?:\.\d+)?)\s*(sei|usdc)/i.test(userInput)) {
      const match = userInput.match(/lend\s+(\d+(?:\.\d+)?)\s*(sei|usdc)/i);
      const amount = match![1];
      const token = match![2].toUpperCase();
      
      return this.handleLendingRequest(amount, token);
    }

    // General lending interest
    if (/lend|lending|loan/i.test(userInput)) {
      return {
        message: `Lending is another great way to earn yield! You can lend out your SEI or USDC and earn around 8% APY. The best part is it's usually more flexible than staking. What amount were you considering lending?`
      };
    }
    
    // Greetings with specific responses
    if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)).*seilor/i.test(userInput)) {
      return {
        message: `Hello there! Great to meet you. I'm Seilor 0, and I'm here to help you navigate DeFi on Sei Network. Whether you want to stake tokens, earn yield through lending, or explore other opportunities, I've got you covered. What brings you here today?`
      };
    }

    // General greetings
    if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))/i.test(userInput)) {
      return {
        message: `Hello! I'm excited to help you with DeFi on Sei Network. I specialize in helping users stake tokens, earn yield, and manage their crypto portfolios. What would you like to explore today?`
      };
    }

    // Help requests
    if (/^(help|what\s+can\s+you\s+do|how\s+does\s+this\s+work)/i.test(userInput)) {
      return {
        message: `I'd love to help! I specialize in DeFi operations on Sei Network. Here's what I can do for you:\n\n• **Staking**: Help you stake SEI or USDC for up to 12% APY\n• **Lending**: Set up lending positions for steady yield\n• **Swapping**: Exchange between different tokens\n• **Portfolio Management**: Track and optimize your holdings\n\nJust tell me what you're interested in, and I'll walk you through it step by step!`
      };
    }

    // How are you responses
    if (/how\s+are\s+you/i.test(userInput)) {
      return {
        message: `I'm doing great, thank you for asking! I'm always excited to help people discover new DeFi opportunities. The markets have been interesting lately, and there are some good yield opportunities available. How are you doing? Are you looking to explore any particular DeFi strategies today?`
      };
    }

    // Default contextual response
    return {
      message: `I understand you're asking about "${originalMessage}". While I'd love to chat about anything, I'm really specialized in helping with DeFi operations like staking, lending, and managing your crypto portfolio. Is there something specific you'd like to do with your tokens today?`
    };
  }

  private async handleStakingRequest(amount: string, token: string): Promise<{ message: string; action?: string }> {
    const numAmount = parseFloat(amount);
    const balance = token === 'SEI' ? this.context.userBalance?.sei : this.context.userBalance?.usdc;
    const numBalance = parseFloat(balance || '0');
    
    if (numAmount > numBalance) {
      return {
        message: `I see you want to stake ${amount} ${token}, but you currently have ${balance} ${token} available. You might want to reduce the amount or add more ${token} to your wallet first. What would you prefer to do?`
      };
    }
    
    // Set pending action
    this.context.pendingAction = {
      type: 'stake',
      amount,
      token,
      details: { token, amount: numAmount }
    };
    
    return {
      message: `Perfect! You want to stake ${amount} ${token}. Here's what this means:\n\n• You'll earn 12% APY on your staked tokens\n• Your tokens will be locked for 21 days\n• After staking, you'll have ${(numBalance - numAmount).toFixed(4)} ${token} remaining\n\nThis looks like a solid move for passive income. Should I go ahead and set this up for you?`,
      action: 'confirmation_required'
    };
  }

  private async handleLendingRequest(amount: string, token: string): Promise<{ message: string; action?: string }> {
    const numAmount = parseFloat(amount);
    const balance = token === 'SEI' ? this.context.userBalance?.sei : this.context.userBalance?.usdc;
    const numBalance = parseFloat(balance || '0');
    
    if (numAmount > numBalance) {
      return {
        message: `You want to lend ${amount} ${token}, but I see you have ${balance} ${token} available. Would you like to lend a smaller amount, or would you prefer to add more ${token} first?`
      };
    }
    
    // Set pending action
    this.context.pendingAction = {
      type: 'lend',
      amount,
      token,
      details: { token, amount: numAmount }
    };
    
    return {
      message: `Excellent choice! Lending ${amount} ${token} will earn you around 8% APY. Here's the breakdown:\n\n• Flexible lending terms (30 days)\n• Earn interest on your deposit\n• After lending, you'll have ${(numBalance - numAmount).toFixed(4)} ${token} left\n\nThis is a great way to put your ${token} to work. Ready to proceed?`,
      action: 'confirmation_required'
    };
  }

  private async executeAction(action: any): Promise<any> {
    switch (action.type) {
      case 'stake':
        return await hybridSeiService.stakeSEI(action.amount);
      
      case 'lend':
        return await hybridSeiService.borrowSEI(action.amount);
      
      default:
        throw new Error(`I don't know how to handle ${action.type} yet`);
    }
  }

  private formatSuccessMessage(action: any, result: any): string {
    switch (action.type) {
      case 'stake':
        return `🎉 Your staking is all set up! I've successfully staked ${action.amount} ${action.token} for you. You're now earning 12% APY, and your transaction hash is ${result.hash.substring(0, 20)}... You can track this on the blockchain explorer. Your tokens will start earning rewards immediately!`;
      
      case 'lend':
        return `🎉 Perfect! Your lending position is active. I've set up the lending of ${action.amount} ${action.token} earning 8% APY. Transaction hash: ${result.hash.substring(0, 20)}... You'll start earning interest right away, and you can withdraw flexibly when needed.`;
      
      default:
        return `✅ Great! Your ${action.type} has been completed successfully. Transaction hash: ${result.hash.substring(0, 20)}...`;
    }
  }

  public getContext(): ChatContext {
    return this.context;
  }

  public clearPendingAction(): void {
    this.context.pendingAction = null;
  }
}

export const enhancedChatBrain = new EnhancedChatBrain();