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
    this.openAIApiKey = openAIApiKey || import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    console.log('🔑 LangChain Agent initialized with API key:', this.openAIApiKey ? 'Present' : 'Missing');
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
        console.log('❌ No OpenAI API key found - falling back to ActionBrain');
        return {
          message: "🔑 **OpenAI API key required for advanced AI features.**\n\nFor now, I can help you with basic commands:\n• 'What's my balance?' → Check SEI balance\n• 'Send X SEI to 0x...' → Transfer tokens\n• 'Swap X SEI for USDC' → Token swaps\n\nTo unlock full ChatGPT-level intelligence, please add an OpenAI API key to your environment variables.",
          success: false,
          confidence: 0.3
        };
      }
      
      console.log('✅ OpenAI API key found - using ChatGPT-level intelligence');
      
      // Create a natural, concise AI prompt
      const prompt = `You are Seilor 0, a friendly AI assistant for DeFi on Sei Network. Be conversational, helpful, and concise like ChatGPT.

IMPORTANT RULES:
- Keep responses SHORT (1-3 sentences max unless explaining something complex)
- Be natural and conversational, not formal or robotic
- NO long introductions or feature lists
- NO bullet points or structured lists unless specifically asked
- Respond to emotions naturally (if someone says "I'm not happy", be empathetic)
- For DeFi requests, offer to help directly
- Match the user's energy and tone

User: "${input}"

Respond naturally and briefly:`;

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