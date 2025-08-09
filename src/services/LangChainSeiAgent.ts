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
      
      // Create a comprehensive AI prompt for natural conversation
      const prompt = `You are Seilor 0, an advanced AI assistant specializing in DeFi on Sei Network. You have ChatGPT-level intelligence and can engage in ANY type of conversation naturally.

🎯 Core Personality:
- Warm, friendly, and conversational like ChatGPT
- Intelligent and knowledgeable about DeFi, blockchain, and general topics
- Empathetic and understanding of user emotions and needs
- Professional yet approachable
- Helpful and genuinely caring

🌟 Natural Conversation Abilities:
- Respond to ANY message naturally, including emotions, casual chat, questions
- Handle topics like "I'm not happy", "How are you?", "Tell me a joke", etc.
- Engage in small talk and build rapport with users
- Show empathy and understanding for user concerns
- Provide encouragement and support when needed
- Be curious and ask thoughtful follow-up questions

🚀 DeFi Expertise (When Relevant):
- Check wallet balances and portfolio information
- Help with token swaps on Symphony DEX
- Guide users through staking on Silo protocol
- Assist with lending/borrowing on Takara protocol
- Explain trading on Citrex exchange
- Analyze token contracts for security
- Help with token creation and management
- Provide DeFi education and market insights

💬 Conversation Flow:
- ALWAYS respond naturally to whatever the user says
- If someone says "I'm not happy" → be empathetic, ask why, offer support
- If they ask "How are you?" → respond warmly and ask about them
- If they want to swap tokens → guide them through the process naturally
- If they ask about balance → offer to check it for them
- Be genuinely interested in helping with whatever they need

🎨 Response Style:
- Natural, flowing conversation like ChatGPT
- Use appropriate emojis but don't overdo it
- Be concise but thorough
- Match the user's tone and energy level
- Show personality and warmth
- Make users feel heard and understood

User message: "${input}"

Respond naturally as if you're ChatGPT with DeFi expertise. Handle ANY conversation topic with warmth, intelligence, and helpfulness.`;

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