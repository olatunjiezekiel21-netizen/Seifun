import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createSeiTools } from './SeiLangChainTools';
import { privateKeyWallet } from './PrivateKeyWallet';
import { RAGService } from './RAGService';
import { QdrantService } from './QdrantService';
import { LocalLLMService } from './LocalLLMService';

export interface LangChainResponse {
  message: string;
  success: boolean;
  toolsUsed?: string[];
  confidence: number;
}

export class LangChainSeiAgent {
  private isInitialized = false;
  
  constructor() {
    // No client-side secrets; all LLM calls go through serverless
  }
  
  private async initialize() {
    if (this.isInitialized) return;
    try {
      // Placeholder for any future client-side init (none needed now)
      this.isInitialized = true;
    } catch (error: any) {
      console.error('Failed to initialize LangChain agent:', error?.message || error);
      throw new Error(`LangChain initialization failed: ${error.message || error}`);
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
    } catch (error: any) {
      return `WALLET INFO: Unable to fetch (${error.message})`;
    }
  }
  
  async processMessage(input: string): Promise<LangChainResponse> {
    try {
      // Initialize if not already done
      if (!this.isInitialized) {
        await this.initialize();
      }
      
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
      } catch (e: any) {
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

      // Generate via serverless (Ollama preferred, OpenAI fallback). No client-side secrets.
      const text = await LocalLLMService.generate(prompt);
      
      return {
        message: text,
        success: true,
        confidence: 0.95
      };
      
    } catch (error: any) {
      console.error('LangChain processing error:', error);
      
      // Graceful fallback when no LLM backend is configured
      return {
        message: "I need an LLM backend (Ollama or OpenAI) to be fully intelligent. Basic commands are still available.",
        success: false,
        confidence: 0.3
      };
    }
  }
  
  private extractToolsUsed(result: any): string[] {
    // Placeholder for future tool extraction
    if ((result as any).intermediateSteps) {
      return (result as any).intermediateSteps.map((step: any) => step.action?.tool || 'unknown');
    }
    return [];
  }
}

// Export singleton instance
export const langChainSeiAgent = new LangChainSeiAgent();