import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createSeiTools } from './SeiLangChainTools';
import { privateKeyWallet } from './PrivateKeyWallet';
import { RAGService } from './RAGService';
import { QdrantService } from './QdrantService';

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
        temperature: 0.3, // Slightly higher for more natural responses
        openAIApiKey: this.openAIApiKey,
        maxTokens: 500 // Shorter responses
      });
      
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Failed to initialize LangChain agent:', error);
      throw new Error(`LangChain initialization failed: ${error.message}`);
    }
  }

  // Get real-time wallet information
  private async getWalletInfo(): Promise<string> {
    try {
      const [seiBalance, usdcBalance, myTokens] = await Promise.all([
        privateKeyWallet.getSeiBalance(),
        privateKeyWallet.getUSDCBalance(),
        privateKeyWallet.getMyTokens()
      ]);

      return `WALLET INFO:
- SEI Balance: ${seiBalance.sei} SEI ($${seiBalance.usd.toFixed(2)})
- USDC Balance: ${usdcBalance.balance} USDC ($${usdcBalance.usd.toFixed(2)})
- My Tokens: ${myTokens.length} tokens created
- Wallet Address: ${privateKeyWallet.getAddress()}`;
    } catch (error) {
      return `WALLET INFO: Unable to fetch (${error.message})`;
    }
  }
  
  async processMessage(input: string): Promise<LangChainResponse> {
    try {
      // Initialize if not already done
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // If no OpenAI key, give a simple response
      if (!this.openAIApiKey || !this.model) {
        console.log('❌ No OpenAI API key found');
        return {
          message: "I need an OpenAI API key to be fully intelligent. For now, I can help with basic commands like checking balances or transferring tokens.",
          success: false,
          confidence: 0.3
        };
      }
      
      console.log('✅ OpenAI API key found - using full intelligence');
      
      // Get real-time wallet information
      const walletInfo = await this.getWalletInfo();

      // Retrieve RAG context
      let ragContext = '';
      try {
        // Prefer Qdrant first
        const qdrant = await QdrantService.query(input, 5);
        if (qdrant && qdrant.length > 0) {
          ragContext = qdrant.map((p, i) => `Qdrant ${i+1} (score ${p.score?.toFixed(3) ?? ''}):\n${p.payload?.text || ''}`).join('\n\n');
        } else {
          const atlas = await RAGService.query(input, 5);
          if (atlas && atlas.length > 0) {
            ragContext = atlas.map((r, i) => `Atlas ${i+1} (score ${r.score.toFixed(3)}):\n${r.text}`).join('\n\n');
          }
        }
      } catch (e) {
        console.warn('RAG retrieval failed or not configured:', e?.message || e);
      }
      
      // Create an intelligent, context-aware prompt
      const prompt = `You are Seilor 0, an intelligent AI assistant for DeFi on Sei Network. You have access to real wallet data and can perform actual blockchain operations.

CURRENT WALLET STATUS:
${walletInfo}

RELEVANT CONTEXT (from knowledge base):
${ragContext || 'No additional context available.'}

PERSONALITY:
- Be natural and conversational like ChatGPT
- NEVER say "I don't quite understand" - always try to help
- Be confident and knowledgeable about DeFi and crypto
- Give specific, actionable responses
- Be friendly but professional

CAPABILITIES:
- Check real SEI and USDC balances (you have the data above)
- Help with token swaps, transfers, and DeFi operations
- Answer questions about Sei Network and DeFi
- Provide trading advice and market insights
- Handle any conversation naturally

RESPONSE RULES:
- Keep responses 1-3 sentences unless explaining something complex
- Always acknowledge what the user asked about
- If asking about balances, use the REAL data above
- If asking about transactions, offer to help execute them
- If confused, ask clarifying questions instead of saying "I don't understand"
- Prefer using the provided RELEVANT CONTEXT; cite it implicitly by referencing facts, not by saying "according to context".

User Message: "${input}"

Respond naturally and helpfully:`;

      // Process message through LangChain model
      const result = await this.model.invoke(prompt);
      
      return {
        message: result.content as string,
        success: true,
        confidence: 0.95
      };
      
    } catch (error) {
      console.error('LangChain processing error:', error);
      
      // Even for errors, be natural and helpful
      return {
        message: `I'm having a technical issue right now, but I'm still here to help! Could you try rephrasing your question? I can help with balance checks, transfers, swaps, and more.`,
        success: false,
        confidence: 0.5
      };
    }
  }
  
  private extractToolsUsed(result: any): string[] {
    // Extract which tools were used from the agent result
    // This is useful for debugging and analytics
    if (result.intermediateSteps) {
      return result.intermediateSteps.map((step: any) => step.action?.tool || 'unknown');
    }
    return [];
  }
}

// Export singleton instance
export const langChainSeiAgent = new LangChainSeiAgent();