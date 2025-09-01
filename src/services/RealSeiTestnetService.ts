import { ethers } from 'ethers';

// 🚀 REAL SEI EVM TESTNET SERVICE - ACTUAL ON-CHAIN OPERATIONS

// Contract ABIs (simplified for key functions)
const CONTEXT_STORE_ABI = [
  "function storeContext(string userQuery, string aiResponse, string transactionHash, bool success) external returns (uint256)",
  "function getUserContexts(address user) external view returns (uint256[])",
  "function getContext(uint256 contextId) external view returns (tuple(string userQuery, string aiResponse, string transactionHash, uint256 timestamp, bool success, address user))",
  "event ContextStored(uint256 indexed contextId, address indexed user, string transactionHash)"
];

const STAKING_CONTRACT_ABI = [
  "function stake() external payable",
  "function unstake(uint256 stakeId) external",
  "function calculateRewards(uint256 stakeId) external view returns (uint256)",
  "function getUserStakes(address user) external view returns (uint256[])",
  "function getStake(uint256 stakeId) external view returns (tuple(uint256 id, address user, uint256 amount, uint256 startTime, uint256 endTime, bool active, uint256 rewards))",
  "event Staked(uint256 indexed stakeId, address indexed user, uint256 amount)",
  "event Unstaked(uint256 indexed stakeId, address indexed user, uint256 amount, uint256 rewards)"
];

const LENDING_POOL_ABI = [
  "function borrow() external payable",
  "function repay(uint256 loanId) external payable",
  "function calculateInterest(uint256 loanId) external view returns (uint256)",
  "function getUserLoans(address user) external view returns (uint256[])",
  "function getLoan(uint256 loanId) external view returns (tuple(uint256 id, address borrower, uint256 amount, uint256 interestRate, uint256 startTime, uint256 dueTime, bool active, bool repaid))",
  "event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount)",
  "event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 interest)"
];

const PORTFOLIO_MANAGER_ABI = [
  "function updatePortfolio(address user, uint256 totalValue) external",
  "function updateBalance(address user, address token, uint256 balance) external",
  "function getPortfolio(address user) external view returns (tuple(address user, uint256 totalValue, uint256 lastUpdate, bool active))",
  "function getUserBalance(address user, address token) external view returns (uint256)",
  "event PortfolioUpdated(address indexed user, uint256 totalValue)",
  "event BalanceUpdated(address indexed user, address indexed token, uint256 balance)"
];

export interface RealTransaction {
  hash: string;
  type: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  gas: {
    used: number;
    limit: number;
    price: string;
  };
  details: any;
}

export interface RealStake {
  id: number;
  amount: string;
  startTime: number;
  endTime: number;
  active: boolean;
  rewards: string;
}

export interface RealLoan {
  id: number;
  amount: string;
  interestRate: number;
  startTime: number;
  dueTime: number;
  active: boolean;
  repaid: boolean;
}

export interface RealPortfolio {
  totalValue: string;
  lastUpdate: number;
  active: boolean;
}

export class RealSeiTestnetService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contextStore: ethers.Contract;
  private stakingContract: ethers.Contract;
  private lendingPool: ethers.Contract;
  private portfolioManager: ethers.Contract;
  private isInitialized = false;

  constructor() {
    const rpcUrl = import.meta.env.VITE_SEI_TESTNET_RPC_URL || 'https://testnet-rpc.sei.io';
    const privateKey = import.meta.env.VITE_TESTNET_PRIVATE_KEY || '0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684';
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    
    // Initialize contracts
    const contextStoreAddress = import.meta.env.VITE_TESTNET_CONTEXT_STORE;
    const stakingAddress = import.meta.env.VITE_TESTNET_STAKING_CONTRACT;
    const lendingAddress = import.meta.env.VITE_TESTNET_LENDING_POOL;
    const portfolioAddress = import.meta.env.VITE_TESTNET_PORTFOLIO_MANAGER;
    
    if (contextStoreAddress) {
      this.contextStore = new ethers.Contract(contextStoreAddress, CONTEXT_STORE_ABI, this.signer);
    }
    if (stakingAddress) {
      this.stakingContract = new ethers.Contract(stakingAddress, STAKING_CONTRACT_ABI, this.signer);
    }
    if (lendingAddress) {
      this.lendingPool = new ethers.Contract(lendingAddress, LENDING_POOL_ABI, this.signer);
    }
    if (portfolioAddress) {
      this.portfolioManager = new ethers.Contract(portfolioAddress, PORTFOLIO_MANAGER_ABI, this.signer);
    }
  }

  public async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing Real Sei Testnet Service...');
      
      // Check connection
      const network = await this.provider.getNetwork();
      console.log('✅ Connected to network:', network.name, 'Chain ID:', network.chainId);
      
      // Check wallet balance
      const balance = await this.provider.getBalance(this.signer.address);
      console.log('💰 Wallet balance:', ethers.formatEther(balance), 'SEI');
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Real Sei Testnet Service:', error);
      return false;
    }
  }

  // REAL STAKING OPERATIONS
  public async stakeSEI(amount: string): Promise<RealTransaction> {
    try {
      if (!this.stakingContract) {
        throw new Error('Staking contract not deployed');
      }

      const amountWei = ethers.parseEther(amount);
      console.log('🥩 Staking', amount, 'SEI...');

      const tx = await this.stakingContract.stake({ value: amountWei });
      const receipt = await tx.wait();

      return {
        hash: receipt.hash,
        type: 'stake',
        status: 'success',
        timestamp: Date.now(),
        gas: {
          used: Number(receipt.gasUsed),
          limit: Number(receipt.gasLimit),
          price: receipt.gasPrice?.toString() || '0'
        },
        details: {
          amount: amount,
          stakeId: receipt.logs[0]?.topics[1] // Extract stake ID from event
        }
      };
    } catch (error: any) {
      console.error('❌ Staking failed:', error);
      return {
        hash: 'failed-' + Date.now(),
        type: 'stake',
        status: 'failed',
        timestamp: Date.now(),
        gas: { used: 0, limit: 0, price: '0' },
        details: { error: error.message }
      };
    }
  }

  public async unstakeSEI(stakeId: number): Promise<RealTransaction> {
    try {
      if (!this.stakingContract) {
        throw new Error('Staking contract not deployed');
      }

      console.log('🥩 Unstaking stake ID:', stakeId);

      const tx = await this.stakingContract.unstake(stakeId);
      const receipt = await tx.wait();

      return {
        hash: receipt.hash,
        type: 'unstake',
        status: 'success',
        timestamp: Date.now(),
        gas: {
          used: Number(receipt.gasUsed),
          limit: Number(receipt.gasLimit),
          price: receipt.gasPrice?.toString() || '0'
        },
        details: {
          stakeId: stakeId,
          rewards: receipt.logs[0]?.topics[2] // Extract rewards from event
        }
      };
    } catch (error: any) {
      console.error('❌ Unstaking failed:', error);
      return {
        hash: 'failed-' + Date.now(),
        type: 'unstake',
        status: 'failed',
        timestamp: Date.now(),
        gas: { used: 0, limit: 0, price: '0' },
        details: { error: error.message }
      };
    }
  }

  public async getUserStakes(): Promise<RealStake[]> {
    try {
      if (!this.stakingContract) {
        return [];
      }

      const stakeIds = await this.stakingContract.getUserStakes(this.signer.address);
      const stakes: RealStake[] = [];

      for (const stakeId of stakeIds) {
        const stake = await this.stakingContract.getStake(stakeId);
        stakes.push({
          id: Number(stake.id),
          amount: ethers.formatEther(stake.amount),
          startTime: Number(stake.startTime),
          endTime: Number(stake.endTime),
          active: stake.active,
          rewards: ethers.formatEther(stake.rewards)
        });
      }

      return stakes;
    } catch (error) {
      console.error('❌ Failed to get user stakes:', error);
      return [];
    }
  }

  // REAL LENDING OPERATIONS
  public async borrowSEI(amount: string): Promise<RealTransaction> {
    try {
      if (!this.lendingPool) {
        throw new Error('Lending pool not deployed');
      }

      const amountWei = ethers.parseEther(amount);
      console.log('🏦 Borrowing', amount, 'SEI...');

      const tx = await this.lendingPool.borrow({ value: amountWei });
      const receipt = await tx.wait();

      return {
        hash: receipt.hash,
        type: 'borrow',
        status: 'success',
        timestamp: Date.now(),
        gas: {
          used: Number(receipt.gasUsed),
          limit: Number(receipt.gasLimit),
          price: receipt.gasPrice?.toString() || '0'
        },
        details: {
          amount: amount,
          loanId: receipt.logs[0]?.topics[1] // Extract loan ID from event
        }
      };
    } catch (error: any) {
      console.error('❌ Borrowing failed:', error);
      return {
        hash: 'failed-' + Date.now(),
        type: 'borrow',
        status: 'failed',
        timestamp: Date.now(),
        gas: { used: 0, limit: 0, price: '0' },
        details: { error: error.message }
      };
    }
  }

  public async getUserLoans(): Promise<RealLoan[]> {
    try {
      if (!this.lendingPool) {
        return [];
      }

      const loanIds = await this.lendingPool.getUserLoans(this.signer.address);
      const loans: RealLoan[] = [];

      for (const loanId of loanIds) {
        const loan = await this.lendingPool.getLoan(loanId);
        loans.push({
          id: Number(loan.id),
          amount: ethers.formatEther(loan.amount),
          interestRate: Number(loan.interestRate),
          startTime: Number(loan.startTime),
          dueTime: Number(loan.dueTime),
          active: loan.active,
          repaid: loan.repaid
        });
      }

      return loans;
    } catch (error) {
      console.error('❌ Failed to get user loans:', error);
      return [];
    }
  }

  // REAL AI CONTEXT STORAGE
  public async storeAIContext(
    userQuery: string,
    aiResponse: string,
    transactionHash: string,
    success: boolean
  ): Promise<RealTransaction> {
    try {
      if (!this.contextStore) {
        throw new Error('Context store not deployed');
      }

      console.log('🧠 Storing AI context...');

      const tx = await this.contextStore.storeContext(userQuery, aiResponse, transactionHash, success);
      const receipt = await tx.wait();

      return {
        hash: receipt.hash,
        type: 'store_context',
        status: 'success',
        timestamp: Date.now(),
        gas: {
          used: Number(receipt.gasUsed),
          limit: Number(receipt.gasLimit),
          price: receipt.gasPrice?.toString() || '0'
        },
        details: {
          contextId: receipt.logs[0]?.topics[1] // Extract context ID from event
        }
      };
    } catch (error: any) {
      console.error('❌ Failed to store AI context:', error);
      return {
        hash: 'failed-' + Date.now(),
        type: 'store_context',
        status: 'failed',
        timestamp: Date.now(),
        gas: { used: 0, limit: 0, price: '0' },
        details: { error: error.message }
      };
    }
  }

  // REAL PORTFOLIO MANAGEMENT
  public async updatePortfolio(totalValue: string): Promise<RealTransaction> {
    try {
      if (!this.portfolioManager) {
        throw new Error('Portfolio manager not deployed');
      }

      const valueWei = ethers.parseEther(totalValue);
      console.log('📊 Updating portfolio value:', totalValue, 'SEI');

      const tx = await this.portfolioManager.updatePortfolio(this.signer.address, valueWei);
      const receipt = await tx.wait();

      return {
        hash: receipt.hash,
        type: 'update_portfolio',
        status: 'success',
        timestamp: Date.now(),
        gas: {
          used: Number(receipt.gasUsed),
          limit: Number(receipt.gasLimit),
          price: receipt.gasPrice?.toString() || '0'
        },
        details: {
          totalValue: totalValue
        }
      };
    } catch (error: any) {
      console.error('❌ Failed to update portfolio:', error);
      return {
        hash: 'failed-' + Date.now(),
        type: 'update_portfolio',
        status: 'failed',
        timestamp: Date.now(),
        gas: { used: 0, limit: 0, price: '0' },
        details: { error: error.message }
      };
    }
  }

  public async getPortfolio(): Promise<RealPortfolio | null> {
    try {
      if (!this.portfolioManager) {
        return null;
      }

      const portfolio = await this.portfolioManager.getPortfolio(this.signer.address);
      
      return {
        totalValue: ethers.formatEther(portfolio.totalValue),
        lastUpdate: Number(portfolio.lastUpdate),
        active: portfolio.active
      };
    } catch (error) {
      console.error('❌ Failed to get portfolio:', error);
      return null;
    }
  }

  // UTILITY METHODS
  public getWalletAddress(): string {
    return this.signer.address;
  }

  public async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.signer.address);
    return ethers.formatEther(balance);
  }

  public getExplorerUrl(hash: string): string {
    return `https://testnet.seitrace.com/tx/${hash}`;
  }
}

export const realSeiTestnetService = new RealSeiTestnetService();