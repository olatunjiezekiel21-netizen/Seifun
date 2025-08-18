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
  data?: any;
  suggestions?: string[];
}

export class LangChainSeiAgent {
  private isInitialized = false;
  private tools = createSeiTools();
  
  constructor() {}
  
  private async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
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
<<<<<<< HEAD
      if (!this.isInitialized) await this.initialize();
=======
      // Initialize if not already done
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // If no OpenAI key, try local LLM (Ollama)
      if (!this.openAIApiKey || !this.model) {
        try {
          const walletInfo = await this.getWalletInfo();
          const prompt = `You are Seilor 0, an intelligent AI assistant for DeFi on Sei.\n\nWALLET:\n${walletInfo}\n\nCONTEXT:\n${input}\n\nReply briefly and helpfully.`;
          const text = await LocalLLMService.generate(prompt);
          return { message: text, success: true, confidence: 0.7 };
        } catch (e) {
          console.log('Local LLM unavailable:', e?.message || e);
          return {
            message: "I need an LLM backend (Ollama or OpenAI) to be fully intelligent. Basic commands are still available.",
            success: false,
            confidence: 0.3
          };
        }
      }
      
      console.log('✅ OpenAI API key found - using full intelligence');
      
      // Get real-time wallet information
>>>>>>> 75392e0 (Add image upload and local LLM fallback for Seilor assistant)
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
      
      const message = `Got it. ${input}`;
      return { message, success: true, confidence: 0.8 };
      
    } catch (error: any) {
      console.error('LangChain processing error:', error);
      return {
        message: "I need an LLM backend (Ollama or OpenAI) to be fully intelligent. Basic commands are still available.",
        success: false,
        confidence: 0.3
      };
    }
  }

  private extractToolsUsed(result: any): string[] {
    if ((result as any).intermediateSteps) {
      return (result as any).intermediateSteps.map((step: any) => step.action?.tool || 'unknown');
    }
    return [];
  }
}

export const langChainSeiAgent = new LangChainSeiAgent();