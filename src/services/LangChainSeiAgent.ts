import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createSeiTools } from './SeiLangChainTools';
import { privateKeyWallet } from './PrivateKeyWallet';
import { RAGService } from './RAGService';

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
      if (!this.isInitialized) await this.initialize();
      const walletInfo = await this.getWalletInfo();

      // Retrieve RAG context
      let ragContext = '';
      try {
        const results = await RAGService.query(input, 5);
        if (results && results.length > 0) {
          ragContext = results.map((r, i) => `Snippet ${i+1} (score ${r.score.toFixed(3)}):\n${r.text}`).join('\n\n');
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