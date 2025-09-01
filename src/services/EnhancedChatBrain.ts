import { hybridSeiService } from './HybridSeiService';

// 🚀 ENHANCED CHAT BRAIN - REAL ACTION EXECUTION WITH CONFIRMATION FLOW

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

  public async processMessage(userMessage: string): Promise<{ message: string; action?: string }> {
    const message = userMessage.toLowerCase().trim();
    
    // Check for confirmation responses
    if (this.context.pendingAction) {
      return this.handleConfirmation(message);
    }

    // Handle new requests
    return this.handleNewRequest(message);
  }

  private async handleConfirmation(message: string): Promise<{ message: string; action?: string }> {
    const action = this.context.pendingAction!;
    
    if (message.includes('yes') || message.includes('confirm') || message.includes('ok')) {
      try {
        // Execute the pending action
        const result = await this.executeAction(action);
        
        // Clear pending action
        this.context.pendingAction = null;
        
        // Update balance
        await this.loadUserBalance();
        
        return {
          message: `✅ **${action.type.toUpperCase()} EXECUTED SUCCESSFULLY!**\n\n${this.formatSuccessMessage(action, result)}`,
          action: 'success'
        };
      } catch (error: any) {
        this.context.pendingAction = null;
        return {
          message: `❌ **${action.type.toUpperCase()} FAILED!**\n\nError: ${error.message}\n\nPlease try again or contact support.`,
          action: 'error'
        };
      }
    } else if (message.includes('no') || message.includes('cancel') || message.includes('abort')) {
      this.context.pendingAction = null;
      return {
        message: `🚫 **${action.type.toUpperCase()} CANCELLED**\n\nNo action was taken. Your funds are safe.\n\nWhat would you like to do instead?`,
        action: 'cancelled'
      };
    } else {
      // Ask for clear confirmation
      return {
        message: `🤔 **Please confirm clearly:**\n\nDo you want to proceed with ${action.type}?\n\nReply **"Yes"** to confirm or **"Cancel"** to abort.`,
        action: 'confirmation_required'
      };
    }
  }

  private async handleNewRequest(message: string): Promise<{ message: string; action?: string }> {
    // Staking requests
    if (/stake\s+(\d+(?:\.\d+)?)\s*(sei|usdc)/i.test(message)) {
      const match = message.match(/stake\s+(\d+(?:\.\d+)?)\s*(sei|usdc)/i);
      const amount = match![1];
      const token = match![2].toUpperCase();
      
      return this.handleStakingRequest(amount, token);
    }
    
    // General staking requests without amount
    if (/^stake$/i.test(message) || /^staking$/i.test(message)) {
      return {
        message: `🥩 **Staking Information**\n\nI can help you stake your tokens to earn passive income!\n\n**Current Staking Options:**\n• **SEI Staking**: 12% APY\n• **USDC Staking**: 8% APY\n\n**To stake, please specify:**\n• **Amount** (e.g., "Stake 50 SEI")\n• **Token type** (SEI or USDC)\n\n**Example commands:**\n• "Stake 100 SEI"\n• "Stake 50 USDC"\n\nWhat amount would you like to stake?`
      };
    }
    
    // Lending requests
    if (/lend\s+(\d+(?:\.\d+)?)\s*(sei|usdc)/i.test(message)) {
      const match = message.match(/lend\s+(\d+(?:\.\d+)?)\s*(sei|usdc)/i);
      const amount = match![1];
      const token = match![2].toUpperCase();
      
      return this.handleLendingRequest(amount, token);
    }
    
    // General lending requests without amount
    if (/^lend$/i.test(message) || /^lending$/i.test(message)) {
      return {
        message: `🏦 **Lending Information**\n\nI can help you lend your tokens to earn interest!\n\n**Current Lending Options:**\n• **SEI Lending**: 8% APY\n• **USDC Lending**: 6% APY\n\n**To lend, please specify:**\n• **Amount** (e.g., "Lend 100 USDC")\n• **Token type** (SEI or USDC)\n\n**Example commands:**\n• "Lend 200 SEI"\n• "Lend 100 USDC"\n\nWhat amount would you like to lend?`
      };
    }
    
    // General greetings
    if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))/i.test(message)) {
      return {
        message: `👋 **Hello! I'm Seilor 0, your AI DeFi assistant!**\n\nI can help you with:\n\n🥩 **Staking** - Earn 12% APY\n🏦 **Lending** - Earn 8% APY\n💱 **Swapping** - SEI ↔ USDC\n📊 **Portfolio** - Track your assets\n\nWhat would you like to do today?`
      };
    }
    
    // Help requests
    if (/^(help|what\s+can\s+you\s+do|how\s+does\s+this\s+work)/i.test(message)) {
      return {
        message: `🤖 **I'm your DeFi AI assistant! Here's what I can do:**\n\n**💰 EARN YIELD:**\n• Stake SEI/USDC for 12% APY\n• Lend tokens for 8% APY\n\n**💱 TRADE:**\n• Swap between SEI and USDC\n• Create custom tokens\n\n**📊 MANAGE:**\n• Track your portfolio\n• Monitor transactions\n• Get market insights\n\n**Try:** "Stake 50 SEI" or "Lend 100 USDC"`
      };
    }
    
    // Feeling good responses
    if (/^(feeling|feel)\s+(good|great|awesome|amazing|wonderful)/i.test(message)) {
      return {
        message: `😊 **That's fantastic! I'm glad you're feeling great!**\n\nSince you're in such a good mood, why not make your money work harder? 💪\n\n**Quick wins you can try:**\n• Stake some SEI for 12% APY\n• Lend USDC for 8% APY\n• Check your portfolio performance\n\nWhat sounds good to you?`
      };
    }
    
    // Default response
    return {
      message: `🤔 **I understand you're asking about "${userMessage}"**\n\nI'm here to help with DeFi operations on Sei Network. You can:\n\n• **Stake tokens**: "Stake 50 SEI"\n• **Lend tokens**: "Lend 100 USDC"\n• **Get help**: "Help"\n• **Check portfolio**: "Show my portfolio"\n\nWhat would you like to do?`
    };
  }

  private async handleStakingRequest(amount: string, token: string): Promise<{ message: string; action?: string }> {
    const numAmount = parseFloat(amount);
    const balance = token === 'SEI' ? this.context.userBalance?.sei : this.context.userBalance?.usdc;
    const numBalance = parseFloat(balance || '0');
    
    if (numAmount > numBalance) {
      return {
        message: `❌ **Insufficient Balance!**\n\nYou have: **${balance} ${token}**\nTrying to stake: **${amount} ${token}**\n\nPlease reduce the amount or add more ${token} to your wallet.`
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
      message: `🥩 **STAKING CONFIRMATION REQUIRED**\n\n**Details:**\n• **Amount:** ${amount} ${token}\n• **Current Balance:** ${balance} ${token}\n• **After Staking:** ${(numBalance - numAmount).toFixed(4)} ${token}\n• **Expected APY:** 12%\n• **Lock Period:** 21 days\n\n**Benefits:**\n• Earn passive income\n• Support network security\n• Flexible unstaking\n\n**Reply "Yes" to confirm staking or "Cancel" to abort.**`
    };
  }

  private async handleLendingRequest(amount: string, token: string): Promise<{ message: string; action?: string }> {
    const numAmount = parseFloat(amount);
    const balance = token === 'SEI' ? this.context.userBalance?.sei : this.context.userBalance?.usdc;
    const numBalance = parseFloat(balance || '0');
    
    if (numAmount > numBalance) {
      return {
        message: `❌ **Insufficient Balance!**\n\nYou have: **${balance} ${token}**\nTrying to lend: **${amount} ${token}**\n\nPlease reduce the amount or add more ${token} to your wallet.`
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
      message: `🏦 **LENDING CONFIRMATION REQUIRED**\n\n**Details:**\n• **Amount:** ${amount} ${token}\n• **Current Balance:** ${balance} ${token}\n• **After Lending:** ${(numBalance - numAmount).toFixed(4)} ${token}\n• **Expected APY:** 8%\n• **Lock Period:** 30 days\n\n**Benefits:**\n• Earn interest on deposits\n• Flexible withdrawal\n• Compound interest\n\n**Reply "Yes" to confirm lending or "Cancel" to abort.**`
    };
  }

  private async executeAction(action: any): Promise<any> {
    switch (action.type) {
      case 'stake':
        return await hybridSeiService.stakeSEI(action.amount);
      
      case 'lend':
        return await hybridSeiService.borrowSEI(action.amount);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private formatSuccessMessage(action: any, result: any): string {
    switch (action.type) {
      case 'stake':
        return `**Staking Successful!** 🎉\n\n• **Amount Staked:** ${action.amount} ${action.token}\n• **Transaction Hash:** ${result.hash.substring(0, 20)}...\n• **Expected APY:** 12%\n• **Lock Period:** 21 days\n\nYour tokens are now earning passive income! 🚀`;
      
      case 'lend':
        return `**Lending Successful!** 🎉\n\n• **Amount Lent:** ${action.amount} ${action.token}\n• **Transaction Hash:** ${result.hash.substring(0, 20)}...\n• **Expected APY:** 8%\n• **Lock Period:** 30 days\n\nYour tokens are now earning interest! 💰`;
      
      default:
        return `**Action completed successfully!** ✅\n\nTransaction Hash: ${result.hash.substring(0, 20)}...`;
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