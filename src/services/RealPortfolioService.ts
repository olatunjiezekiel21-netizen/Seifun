import { ethers } from 'ethers';
import { hybridSeiService } from './HybridSeiService';

export interface RealTokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  contractAddress?: string;
  price?: number;
  value?: number;
  change24h?: number;
}

export interface RealPortfolioData {
  seiBalance: string;
  usdcBalance: string;
  totalValue: number;
  tokens: RealTokenBalance[];
  lastUpdated: Date;
}

export interface RealTransaction {
  hash: string;
  type: 'buy' | 'sell' | 'stake' | 'unstake' | 'lend' | 'borrow' | 'transfer';
  token: string;
  amount: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
}

class RealPortfolioService {
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private isInitialized = false;

  // ERC20 Token ABIs
  private erc20Abi = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)'
  ];

  // Common token addresses on Sei EVM testnet
  private tokenAddresses = {
    USDC: '0x1234567890123456789012345678901234567890', // Replace with actual USDC address
    WSEI: '0x1234567890123456789012345678901234567890', // Replace with actual WSEI address
  };

  async initialize(): Promise<boolean> {
    try {
      const privateKey = import.meta.env.VITE_TESTNET_PRIVATE_KEY;
      const rpcUrl = import.meta.env.VITE_SEI_TESTNET_RPC_URL;

      if (!privateKey || !rpcUrl) {
        console.error('Missing environment variables for portfolio service');
        return false;
      }

      // Connect to Sei EVM testnet
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);

      // Test connection
      const balance = await this.provider.getBalance(this.wallet.address);
      console.log('Connected to wallet:', this.wallet.address);
      console.log('Native SEI balance:', ethers.formatEther(balance));

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize portfolio service:', error);
      return false;
    }
  }

  async getRealPortfolio(): Promise<RealPortfolioData> {
    if (!this.isInitialized || !this.provider || !this.wallet) {
      throw new Error('Portfolio service not initialized');
    }

    try {
      // Get native SEI balance
      const seiBalance = await this.provider.getBalance(this.wallet.address);
      const seiBalanceFormatted = ethers.formatEther(seiBalance);

      // Get USDC balance
      const usdcBalance = await this.getTokenBalance(this.tokenAddresses.USDC, 'USDC', 6);
      
      // Calculate total value (assuming SEI = $0.25, USDC = $1.00)
      const seiValue = parseFloat(seiBalanceFormatted) * 0.25;
      const usdcValue = parseFloat(usdcBalance.balance);
      const totalValue = seiValue + usdcValue;

      // Get all token balances
      const tokens: RealTokenBalance[] = [
        {
          symbol: 'SEI',
          balance: seiBalanceFormatted,
          decimals: 18,
          price: 0.25,
          value: seiValue,
          change24h: -6.88 // This would come from price feed API
        },
        {
          symbol: 'USDC',
          balance: usdcBalance.balance,
          decimals: 6,
          contractAddress: this.tokenAddresses.USDC,
          price: 1.00,
          value: usdcValue,
          change24h: 0.10
        }
      ];

      return {
        seiBalance: seiBalanceFormatted,
        usdcBalance: usdcBalance.balance,
        totalValue,
        tokens,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Failed to get real portfolio:', error);
      throw error;
    }
  }

  private async getTokenBalance(contractAddress: string, symbol: string, decimals: number): Promise<RealTokenBalance> {
    try {
      const contract = new ethers.Contract(contractAddress, this.erc20Abi, this.provider);
      const balance = await contract.balanceOf(this.wallet!.address);
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      return {
        symbol,
        balance: formattedBalance,
        decimals,
        contractAddress
      };
    } catch (error) {
      console.error(`Failed to get ${symbol} balance:`, error);
      return {
        symbol,
        balance: '0',
        decimals,
        contractAddress
      };
    }
  }

  async getRealTransactionHistory(): Promise<RealTransaction[]> {
    if (!this.isInitialized || !this.provider || !this.wallet) {
      throw new Error('Portfolio service not initialized');
    }

    try {
      // Get transaction history from the blockchain
      const currentBlock = await this.provider.getBlockNumber();
      const transactions: RealTransaction[] = [];

      // Fetch last 50 blocks for transactions
      for (let i = 0; i < 50; i++) {
        try {
          const block = await this.provider.getBlock(currentBlock - i, true);
          if (block && block.transactions) {
            for (const tx of block.transactions) {
              if (tx.from === this.wallet!.address || tx.to === this.wallet!.address) {
                const transaction: RealTransaction = {
                  hash: tx.hash,
                  type: this.determineTransactionType(tx),
                  token: tx.to ? 'SEI' : 'Unknown',
                  amount: ethers.formatEther(tx.value || 0),
                  timestamp: new Date(Number(block.timestamp) * 1000),
                  status: 'confirmed',
                  blockNumber: block.number,
                  gasUsed: tx.gasLimit?.toString(),
                  gasPrice: tx.gasPrice?.toString()
                };
                transactions.push(transaction);
              }
            }
          }
        } catch (error) {
          console.error(`Failed to fetch block ${currentBlock - i}:`, error);
          continue;
        }
      }

      return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      throw error;
    }
  }

  private determineTransactionType(tx: any): 'buy' | 'sell' | 'stake' | 'unstake' | 'lend' | 'borrow' | 'transfer' {
    // This is a simplified logic - in real implementation you'd analyze contract interactions
    if (tx.to && tx.value && tx.value > 0) {
      return 'transfer';
    }
    return 'transfer';
  }

  async executeRealTrade(
    tokenAddress: string,
    amount: string,
    isBuy: boolean
  ): Promise<{ success: boolean; hash?: string; error?: string }> {
    if (!this.isInitialized || !this.provider || !this.wallet) {
      throw new Error('Portfolio service not initialized');
    }

    try {
      // This would integrate with actual DEX contracts
      // For now, we'll simulate the transaction
      const tx = {
        to: tokenAddress,
        value: isBuy ? ethers.parseEther(amount) : 0,
        gasLimit: 21000
      };

      const transaction = await this.wallet.sendTransaction(tx);
      await transaction.wait();

      return {
        success: true,
        hash: transaction.hash
      };
    } catch (error) {
      console.error('Trade execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getWalletAddress(): string | null {
    return this.wallet?.address || null;
  }

  isServiceReady(): boolean {
    return this.isInitialized;
  }
}

export const realPortfolioService = new RealPortfolioService();