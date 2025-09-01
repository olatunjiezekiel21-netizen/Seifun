import { SigningCosmWasmClient, CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { GasPrice } from '@cosmjs/stargate';

// 🚀 SEI TESTNET SERVICE - Real On-Chain Operations
export interface SeiTestnetConfig {
  rpcUrl: string;
  restUrl: string;
  chainId: string;
  gasPrice: string;
  contracts: {
    contextStore: string;
    aiRegistry: string;
    portfolioManager: string;
    riskEngine: string;
    yieldOptimizer: string;
    arbitrageDetector: string;
  };
}

export interface TestnetTransaction {
  hash: string;
  type: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  gas: {
    used: number;
    wanted: number;
    fee: string;
  };
  details: any;
}

export interface TestnetBalance {
  denom: string;
  amount: string;
  usdValue?: number;
}

export interface TestnetPortfolio {
  totalValue: number;
  assets: TestnetBalance[];
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export class SeiTestnetService {
  private client?: CosmWasmClient;
  private signingClient?: SigningCosmWasmClient;
  private wallet?: DirectSecp256k1HdWallet;
  private config: SeiTestnetConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      rpcUrl: import.meta.env.VITE_SEI_TESTNET_RPC_URL || 'https://testnet-rpc.sei.io',
      restUrl: import.meta.env.VITE_SEI_TESTNET_REST_URL || 'https://testnet-rest.sei.io',
      chainId: import.meta.env.VITE_SEI_TESTNET_CHAIN_ID || 'sei-testnet-1',
      gasPrice: '0.025usei',
      contracts: {
        contextStore: import.meta.env.VITE_TESTNET_CONTEXT_STORE || 'sei1testnetcontextstore123456789abcdef',
        aiRegistry: import.meta.env.VITE_TESTNET_AI_REGISTRY || 'sei1testnetairegistry123456789abcdef',
        portfolioManager: import.meta.env.VITE_TESTNET_PORTFOLIO_MANAGER || 'sei1testnetportfoliomanager123456789abcdef',
        riskEngine: import.meta.env.VITE_TESTNET_RISK_ENGINE || 'sei1testnetriskengine123456789abcdef',
        yieldOptimizer: import.meta.env.VITE_TESTNET_YIELD_OPTIMIZER || 'sei1testnetyieldoptimizer123456789abcdef',
        arbitrageDetector: import.meta.env.VITE_TESTNET_ARBITRAGE_DETECTOR || 'sei1testnetarbitragedetector123456789abcdef'
      }
    };
  }

  public async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing Sei Testnet Service...');
      
      // Initialize CosmWasm client
      this.client = await CosmWasmClient.connect(this.config.rpcUrl);
      
      // Initialize wallet if private key is available
      const privateKey = import.meta.env.VITE_TESTNET_PRIVATE_KEY;
      if (privateKey) {
        console.log('🔑 Setting up testnet wallet...');
        this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(
          this.convertPrivateKeyToMnemonic(privateKey),
          { prefix: 'sei' }
        );

        // Initialize signing client
        this.signingClient = await SigningCosmWasmClient.connectWithSigner(
          this.config.rpcUrl,
          this.wallet,
          {
            gasPrice: GasPrice.fromString(this.config.gasPrice)
          }
        );
      }

      this.isInitialized = true;
      console.log('✅ Sei Testnet Service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Sei Testnet Service:', error);
      return false;
    }
  }

  // Convert private key to mnemonic (simplified for demo)
  private convertPrivateKeyToMnemonic(privateKey: string): string {
    // In a real implementation, you'd use proper key derivation
    // For demo purposes, using a test mnemonic
    return 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
  }

  public async getTestnetBalance(address?: string): Promise<TestnetBalance[]> {
    try {
      if (!this.client) await this.initialize();
      
      const accounts = await this.wallet?.getAccounts();
      const userAddress = address || accounts?.[0]?.address;
      
      if (!userAddress) {
        return [{ denom: 'usei', amount: '0' }];
      }

      const balance = await this.client!.getAllBalances(userAddress);
      
      return balance.map(coin => ({
        denom: coin.denom,
        amount: coin.amount,
        usdValue: this.calculateUsdValue(coin.denom, coin.amount)
      }));
    } catch (error) {
      console.error('❌ Error fetching testnet balance:', error);
      return [{ denom: 'usei', amount: '0' }];
    }
  }

  public async getTestnetPortfolio(): Promise<TestnetPortfolio> {
    try {
      const balances = await this.getTestnetBalance();
      const totalValue = balances.reduce((sum, balance) => sum + (balance.usdValue || 0), 0);

      return {
        totalValue,
        assets: balances,
        performance: {
          daily: Math.random() * 10 - 5, // Mock performance data
          weekly: Math.random() * 20 - 10,
          monthly: Math.random() * 50 - 25
        }
      };
    } catch (error) {
      console.error('❌ Error fetching testnet portfolio:', error);
      return {
        totalValue: 0,
        assets: [],
        performance: { daily: 0, weekly: 0, monthly: 0 }
      };
    }
  }

  public async executeTestnetTransaction(
    contractAddress: string,
    message: any,
    funds: any[] = []
  ): Promise<TestnetTransaction> {
    try {
      if (!this.signingClient || !this.wallet) {
        throw new Error('Signing client not initialized');
      }

      const accounts = await this.wallet.getAccounts();
      const senderAddress = accounts[0].address;

      console.log('🚀 Executing testnet transaction...', {
        contract: contractAddress,
        message,
        funds
      });

      const result = await this.signingClient.execute(
        senderAddress,
        contractAddress,
        message,
        'auto',
        undefined,
        funds
      );

      const transaction: TestnetTransaction = {
        hash: result.transactionHash,
        type: 'execute',
        status: 'success',
        timestamp: Date.now(),
        gas: {
          used: result.gasUsed,
          wanted: result.gasWanted,
          fee: '0.025usei'
        },
        details: {
          contract: contractAddress,
          message,
          result
        }
      };

      console.log('✅ Testnet transaction successful:', transaction);
      return transaction;
    } catch (error) {
      console.error('❌ Testnet transaction failed:', error);
      
      return {
        hash: 'failed-' + Date.now(),
        type: 'execute',
        status: 'failed',
        timestamp: Date.now(),
        gas: { used: 0, wanted: 0, fee: '0' },
        details: { error: error.message }
      };
    }
  }

  public async getTransactionHistory(address?: string): Promise<TestnetTransaction[]> {
    try {
      const accounts = await this.wallet?.getAccounts();
      const userAddress = address || accounts?.[0]?.address;
      
      if (!userAddress) return [];

      // Mock transaction history for demo
      // In real implementation, you'd query the blockchain
      const mockTransactions: TestnetTransaction[] = [
        {
          hash: 'sei1tx123...abc',
          type: 'portfolio_optimization',
          status: 'success',
          timestamp: Date.now() - 3600000,
          gas: { used: 150000, wanted: 200000, fee: '0.025usei' },
          details: { action: 'Portfolio optimized', result: 'Improved 15% efficiency' }
        },
        {
          hash: 'sei1tx456...def',
          type: 'risk_assessment',
          status: 'success',
          timestamp: Date.now() - 7200000,
          gas: { used: 120000, wanted: 150000, fee: '0.025usei' },
          details: { action: 'Risk assessment', result: 'Low risk confirmed' }
        },
        {
          hash: 'sei1tx789...ghi',
          type: 'yield_optimization',
          status: 'success',
          timestamp: Date.now() - 10800000,
          gas: { used: 180000, wanted: 220000, fee: '0.025usei' },
          details: { action: 'Yield strategy', result: '12% APY strategy deployed' }
        }
      ];

      return mockTransactions;
    } catch (error) {
      console.error('❌ Error fetching transaction history:', error);
      return [];
    }
  }

  // AI Contract Interactions
  public async optimizePortfolioOnChain(assets: any[]): Promise<TestnetTransaction> {
    return this.executeTestnetTransaction(
      this.config.contracts.portfolioManager,
      {
        optimize_portfolio: {
          assets,
          strategy: 'balanced',
          risk_tolerance: 'medium'
        }
      }
    );
  }

  public async assessRiskOnChain(token: string, amount: number): Promise<TestnetTransaction> {
    return this.executeTestnetTransaction(
      this.config.contracts.riskEngine,
      {
        assess_risk: {
          token,
          amount: amount.toString(),
          portfolio_context: 'user_portfolio'
        }
      }
    );
  }

  public async optimizeYieldOnChain(strategy: string): Promise<TestnetTransaction> {
    return this.executeTestnetTransaction(
      this.config.contracts.yieldOptimizer,
      {
        optimize_yield: {
          strategy,
          duration: '30d',
          risk_level: 'medium'
        }
      }
    );
  }

  public async detectArbitrageOnChain(pairs: string[]): Promise<TestnetTransaction> {
    return this.executeTestnetTransaction(
      this.config.contracts.arbitrageDetector,
      {
        detect_arbitrage: {
          pairs,
          threshold: '0.5',
          max_slippage: '1.0'
        }
      }
    );
  }

  public async storeAIContextOnChain(context: any): Promise<TestnetTransaction> {
    return this.executeTestnetTransaction(
      this.config.contracts.contextStore,
      {
        store_context: {
          context_type: 'ai_decision',
          data: JSON.stringify(context),
          expiry: Date.now() + 86400000 // 24 hours
        }
      }
    );
  }

  private calculateUsdValue(denom: string, amount: string): number {
    // Mock USD conversion rates
    const rates: Record<string, number> = {
      usei: 0.0001, // Mock rate
      usdc: 1.0,
      usdt: 1.0
    };
    
    const rate = rates[denom] || 0;
    return parseFloat(amount) * rate;
  }

  public isAvailable(): boolean {
    return this.isInitialized;
  }

  public getConfig(): SeiTestnetConfig {
    return this.config;
  }

  public getTestnetExplorerUrl(txHash: string): string {
    return `${import.meta.env.VITE_SEI_TESTNET_EXPLORER}/tx/${txHash}`;
  }
}

// Export singleton instance
export const seiTestnetService = new SeiTestnetService();