import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { reownConfig, getSeiNetworkConfig } from '../config/reown';

// For now, we'll use a simplified approach until Reown packages are installed
// This provides the interface and fallback to existing wallet connections

export interface ReownWalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
  walletType: string | null;
  chainId: number | null;
}

export interface WalletConnectionResult {
  address: string;
  chainId: number;
  walletType: string;
  balance?: string;
}

export class ReownWalletConnection {
  private provider: ethers.JsonRpcProvider | null = null;
  private isMainnet: boolean;

  constructor(isMainnet = false) {
    this.isMainnet = isMainnet;
    const networkConfig = getSeiNetworkConfig(isMainnet);
    this.provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
  }

  async connect(): Promise<WalletConnectionResult> {
    try {
      // For now, fallback to existing wallet detection until Reown is fully integrated
      return await this.connectWithFallback();
    } catch (error) {
      console.error('Reown connection failed, trying fallback:', error);
      return await this.connectWithFallback();
    }
  }

  private async connectWithFallback(): Promise<WalletConnectionResult> {
    // Try different wallet types in order of preference
    const wallets = this.getAvailableWallets();
    
    if (wallets.length === 0) {
      throw new Error('No compatible wallets found. Please install a Sei-compatible wallet or use Reown.');
    }

    // Try to connect to the first available wallet
    for (const walletType of wallets) {
      try {
        const result = await this.connectToWallet(walletType);
        if (result) {
          return result;
        }
      } catch (error) {
        console.warn(`Failed to connect to ${walletType}:`, error);
        continue;
      }
    }

    throw new Error('Failed to connect to any available wallet');
  }

  private getAvailableWallets(): string[] {
    const wallets: string[] = [];
    
    if (typeof window !== 'undefined') {
      // Check for Sei wallets
      if ((window as any).sei) wallets.push('sei');
      if ((window as any).compass) wallets.push('compass');
      if ((window as any).keplr) wallets.push('keplr');
      if ((window as any).ethereum) wallets.push('metamask');
      
      // Always add Reown as an option (will show connection modal)
      wallets.push('reown');
    }
    
    return wallets;
  }

  private async connectToWallet(walletType: string): Promise<WalletConnectionResult | null> {
    switch (walletType) {
      case 'sei':
        return await this.connectSeiWallet();
      case 'compass':
        return await this.connectCompassWallet();
      case 'keplr':
        return await this.connectKeplrWallet();
      case 'metamask':
        return await this.connectMetaMaskWallet();
      case 'reown':
        return await this.connectReownWallet();
      default:
        return null;
    }
  }

  private async connectSeiWallet(): Promise<WalletConnectionResult> {
    const seiWallet = (window as any).sei;
    if (!seiWallet) throw new Error('Sei wallet not found');

    const accounts = await seiWallet.request({
      method: 'sei_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const address = accounts[0];
    const balance = await this.getBalance(address);

    return {
      address,
      chainId: this.isMainnet ? 1329 : 1328,
      walletType: 'sei',
      balance
    };
  }

  private async connectCompassWallet(): Promise<WalletConnectionResult> {
    const compassWallet = (window as any).compass;
    if (!compassWallet) throw new Error('Compass wallet not found');

    const accounts = await compassWallet.request({
      method: 'sei_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const address = accounts[0];
    const balance = await this.getBalance(address);

    return {
      address,
      chainId: this.isMainnet ? 1329 : 1328,
      walletType: 'compass',
      balance
    };
  }

  private async connectKeplrWallet(): Promise<WalletConnectionResult> {
    const keplr = (window as any).keplr;
    if (!keplr) throw new Error('Keplr wallet not found');

    const chainId = this.isMainnet ? 'sei-network' : 'sei-devnet-3';
    await keplr.enable(chainId);
    
    const key = await keplr.getKey(chainId);
    const address = key.bech32Address;
    const balance = await this.getBalance(address);

    return {
      address,
      chainId: this.isMainnet ? 1329 : 1328,
      walletType: 'keplr',
      balance
    };
  }

  private async connectMetaMaskWallet(): Promise<WalletConnectionResult> {
    const ethereum = (window as any).ethereum;
    if (!ethereum) throw new Error('MetaMask not found');

    const accounts = await ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const address = accounts[0];
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    const balance = await this.getBalance(address);

    return {
      address,
      chainId: parseInt(chainId, 16),
      walletType: 'metamask',
      balance
    };
  }

  private async connectReownWallet(): Promise<WalletConnectionResult> {
    // This will be implemented once Reown packages are installed
    // For now, show a helpful message
    throw new Error('Reown wallet connection is being set up. Please use an existing wallet for now or check back soon!');
  }

  private async getBalance(address: string): Promise<string> {
    try {
      if (!this.provider) return '0.0000';
      
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.warn('Failed to get balance:', error);
      return '0.0000';
    }
  }

  async disconnect(): Promise<void> {
    // Clear any stored connection state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('seifu_wallet_type');
      localStorage.removeItem('seifu_wallet_address');
    }
  }

  async signTransaction(transaction: any): Promise<any> {
    // This would be implemented based on the connected wallet type
    throw new Error('Transaction signing not implemented yet');
  }
}

export const useReownWallet = () => {
  const [walletState, setWalletState] = useState<ReownWalletState>({
    isConnected: false,
    address: null,
    balance: null,
    isConnecting: false,
    error: null,
    walletType: null,
    chainId: null
  });

  const reownConnection = new ReownWalletConnection();

  const connectWallet = async (preferredWalletType?: string) => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const result = await reownConnection.connect();
      
      setWalletState({
        isConnected: true,
        address: result.address,
        balance: result.balance || '0.0000',
        isConnecting: false,
        error: null,
        walletType: result.walletType,
        chainId: result.chainId
      });

      // Store connection info
      if (typeof window !== 'undefined') {
        localStorage.setItem('seifu_wallet_type', result.walletType);
        localStorage.setItem('seifu_wallet_address', result.address);
      }

      console.log('✅ Wallet connected:', result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage
      }));
      console.error('❌ Wallet connection failed:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await reownConnection.disconnect();
      setWalletState({
        isConnected: false,
        address: null,
        balance: null,
        isConnecting: false,
        error: null,
        walletType: null,
        chainId: null
      });
      console.log('👋 Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const getAvailableWallets = (): string[] => {
    const wallets: string[] = [];
    
    if (typeof window !== 'undefined') {
      if ((window as any).sei) wallets.push('sei');
      if ((window as any).compass) wallets.push('compass');
      if ((window as any).keplr) wallets.push('keplr');
      if ((window as any).ethereum) wallets.push('metamask');
      wallets.push('reown'); // Always available
    }
    
    return wallets;
  };

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window !== 'undefined') {
        const savedWalletType = localStorage.getItem('seifu_wallet_type');
        const savedAddress = localStorage.getItem('seifu_wallet_address');
        
        if (savedWalletType && savedAddress) {
          // Try to reconnect
          try {
            await connectWallet(savedWalletType);
          } catch (error) {
            console.log('Failed to reconnect to saved wallet:', error);
            // Clear saved data if reconnection fails
            localStorage.removeItem('seifu_wallet_type');
            localStorage.removeItem('seifu_wallet_address');
          }
        }
      }
    };

    const timer = setTimeout(checkExistingConnection, 1000);
    return () => clearTimeout(timer);
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    getAvailableWallets
  };
};