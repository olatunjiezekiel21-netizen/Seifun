import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createSeiTools } from './SeiLangChainTools';

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
    this.openAIApiKey = openAIApiKey || process.env.OPENAI_API_KEY;
  }
  
  private async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Create LangChain model
      this.model = new ChatOpenAI({
        modelName: "gpt-3.5-turbo", // Using 3.5-turbo for faster responses
        temperature: 0.1, // Low temperature for more consistent responses
        openAIApiKey: this.openAIApiKey,
        maxTokens: 1000
      });
      
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Failed to initialize LangChain agent:', error);
      throw new Error(`LangChain initialization failed: ${error.message}`);
    }
  }
  
  async processMessage(input: string): Promise<LangChainResponse> {
    try {
      // Initialize if not already done
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // If no OpenAI key, fall back to basic responses
      if (!this.openAIApiKey || !this.model) {
        return {
          message: "🔑 **OpenAI API key required for advanced AI features.**\n\nFor now, I can help you with basic commands:\n• 'What's my balance?' → Check SEI balance\n• 'Send X SEI to 0x...' → Transfer tokens\n• 'Swap X SEI for USDC' → Token swaps\n\nTo unlock full ChatGPT-level intelligence, please add an OpenAI API key to your environment variables.",
          success: false,
          confidence: 0.5
        };
      }
      
      // Create a more intelligent prompt
      const prompt = `You are Seilor 0, an advanced AI trading agent on Sei Network. You are intelligent, helpful, and prioritize user safety.

🚀 Your Capabilities:
- Check SEI balances and wallet information
- Transfer SEI tokens with safety validation
- Execute token swaps on Symphony DEX
- Stake tokens on Silo protocol for yield
- Lend tokens on Takara protocol
- Scan and analyze token contracts
- Provide DeFi insights and recommendations

User message: "${input}"

Respond as a helpful AI agent. If the user is asking about blockchain operations, provide clear guidance and mention that you can help execute these operations safely.`;

      // Process message through LangChain model
      const result = await this.model.invoke(prompt);
      
      return {
        message: result.content as string,
        success: true,
        confidence: 0.9
      };
      
    } catch (error) {
      console.error('LangChain processing error:', error);
      
      // Provide helpful error response
      return {
        message: `🤖 **I encountered an issue processing your request.**\n\n**Error**: ${error.message}\n\n**💡 Try**: Being more specific or rephrasing your request. I can help with balance checks, transfers, swaps, staking, and more!`,
        success: false,
        confidence: 0.1
      };
    }
  }
  
  private extractToolsUsed(result: any): string[] {
    // Extract which tools were used from the agent result
    // This is useful for debugging and analytics
    const toolsUsed: string[] = [];
    
    if (result.intermediateSteps) {
      result.intermediateSteps.forEach((step: any) => {
        if (step.action && step.action.tool) {
          toolsUsed.push(step.action.tool);
        }
      });
    }
    
    return toolsUsed;
  }
  
  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      return true;
    } catch {
      return false;
    }
  }
  
  // Get agent capabilities
  getCapabilities(): string[] {
    return [
      'Balance checking',
      'Token transfers', 
      'DEX trading',
      'Staking operations',
      'Lending protocols',
      'Token analysis',
      'Wallet management',
      'Natural conversation'
    ];
  }
}

// Create singleton instance
export const langChainSeiAgent = new LangChainSeiAgent();