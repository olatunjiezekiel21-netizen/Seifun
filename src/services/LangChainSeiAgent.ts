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
  data?: any;
  suggestions?: string[];
}

export class LangChainSeiAgent {
  private isInitialized = false;
  private tools = createSeiTools();
  
<<<<<<< HEAD
  constructor() {}
  
  private async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  private isActionableIntent(input: string): boolean {
    const s = input.toLowerCase();
    if (/\b(0x[a-f0-9]{40})\b/i.test(s)) return true; // token address => scan
    const patterns = [
      /\b(swap|exchange|trade)\b/,
      /\b(create|deploy)\b.*\btoken\b/,
      /\b(burn)\b.*\btoken\b/,
      /\b(add|provide)\b.*\bliquidity\b/,
      /\b(stake|unstake|redelegate|delegate|claim)\b/,
      /\b(lend|borrow|repay)\b/,
      /\b(open|close)\b.*\bposition\b/,
      /\b(send|transfer)\b.*\bsei|0x/,
    ];
    return patterns.some((p) => p.test(s));
=======
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
>>>>>>> 257647c (Checkpoint before follow-up message)
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
      
      // Get real-time wallet information
>>>>>>> 257647c (Checkpoint before follow-up message)
      const walletInfo = await this.getWalletInfo();

      // Retrieve RAG context (Qdrant preferred, Atlas fallback)
      let ragContext = '';
      try {
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
      // If the user intent looks actionable, prefer deterministic tools (fallback)
      if (this.isActionableIntent(input)) {
        return {
          message: 'Using tools for precise execution…',
          success: false,
          confidence: 0.2
        };
      }

      // Otherwise, use the LLM backend via serverless function
      const prompt = [
        'You are Seilor, a helpful AI for the Sei blockchain.',
        'Be concise, natural, and practical. Avoid placeholders.',
        '',
        'WALLET:',
        walletInfo,
        '',
        ragContext ? 'CONTEXT:\n' + ragContext : '',
        '',
        'USER:\n' + input
      ].filter(Boolean).join('\n');

<<<<<<< HEAD
      try {
        const res = await fetch('/.netlify/functions/llm-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        if (!res.ok) {
          return { message: 'LLM is unavailable right now. I can still run tools for you.', success: false, confidence: 0.2 };
        }
        const data = await res.json();
        const text = (data && (data.text as string)) || 'Okay.';
        return { message: text, success: true, confidence: 0.8 };
      } catch (e: any) {
        return { message: 'LLM backend error. Switching to tools.', success: false, confidence: 0.2 };
      }
      
    } catch (error: any) {
      console.error('LangChain processing error:', error);
=======
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
>>>>>>> 257647c (Checkpoint before follow-up message)
      return {
        message: "I need an LLM backend (Ollama or OpenAI) to be fully intelligent. Basic commands are still available.",
        success: false,
        confidence: 0.3
      };
    }
  }

  private extractToolsUsed(result: any): string[] {
<<<<<<< HEAD
=======
    // Placeholder for future tool extraction
>>>>>>> 257647c (Checkpoint before follow-up message)
    if ((result as any).intermediateSteps) {
      return (result as any).intermediateSteps.map((step: any) => step.action?.tool || 'unknown');
    }
    return [];
  }
}

export const langChainSeiAgent = new LangChainSeiAgent();