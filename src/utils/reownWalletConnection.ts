import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { reownConfig, getSeiNetworkConfig } from '../config/reown';

// Enhanced Sei wallet support with proper detection
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

export interface SeiWallet {
  name: string;
  id: string;
  icon: string;
  installed: boolean;
  provider?: any;
}

export class ReownWalletConnection {
  private provider: ethers.JsonRpcProvider | null = null;
  private isMainnet: boolean;

  constructor(isMainnet = false) {
    this.isMainnet = isMainnet;
    const networkConfig = getSeiNetworkConfig(isMainnet);
    this.provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
  }

  async connect(preferredWallet?: string): Promise<WalletConnectionResult> {
    try {
      // Try to connect with preferred wallet first
      if (preferredWallet) {
        return await this.connectSpecificWallet(preferredWallet);
      }
      
      // Otherwise, try available wallets in order of preference
      return await this.connectWithFallback();
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  private async connectSpecificWallet(walletId: string): Promise<WalletConnectionResult> {
    switch (walletId) {
      case 'fin':
        return await this.connectFinWallet();
      case 'compass':
        return await this.connectCompassWallet();
      case 'keplr':
        return await this.connectKeplrWallet();
      case 'metamask':
        return await this.connectMetaMaskWallet();
      case 'sei':
        return await this.connectSeiWallet();
      default:
        throw new Error(`Unsupported wallet: ${walletId}`);
    }
  }

  private async connectWithFallback(): Promise<WalletConnectionResult> {
    // Try different wallet types in order of preference for Sei
    const walletPreference = ['fin', 'compass', 'sei', 'keplr', 'metamask'];
    
    for (const walletType of walletPreference) {
      try {
        const result = await this.connectSpecificWallet(walletType);
        console.log(`✅ Connected with ${walletType}:`, result);
        return result;
      } catch (error) {
        console.log(`❌ ${walletType} connection failed:`, error);
        continue;
      }
    }

    throw new Error('No compatible wallets found. Please install Fin, Compass, Keplr, or MetaMask.');
  }

  private async connectFinWallet(): Promise<WalletConnectionResult> {
    // @ts-ignore - Fin wallet global
    if (typeof window.fin === 'undefined') {
      throw new Error('Fin Wallet not installed');
    }

    try {
      // @ts-ignore
      const accounts = await window.fin.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in Fin Wallet');
      }

      // @ts-ignore
      const chainId = await window.fin.request({ method: 'eth_chainId' });
      const targetChainId = this.isMainnet ? 1329 : 1328;

      if (parseInt(chainId, 16) !== targetChainId) {
        await this.switchToSeiNetwork('fin');
      }

      const balance = await this.getBalance(accounts[0]);

      return {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        walletType: 'Fin Wallet',
        balance
      };
    } catch (error) {
      throw new Error(`Fin Wallet connection failed: ${error}`);
    }
  }

  private async connectCompassWallet(): Promise<WalletConnectionResult> {
    // @ts-ignore - Compass wallet global
    if (typeof window.compass === 'undefined') {
      throw new Error('Compass Wallet not installed');
    }

    try {
      // @ts-ignore
      await window.compass.enable(['sei']);
      // @ts-ignore
      const accounts = await window.compass.getAccounts('sei');

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in Compass Wallet');
      }

      const account = accounts[0];
      const balance = await this.getBalance(account.address);

      return {
        address: account.address,
        chainId: this.isMainnet ? 1329 : 1328,
        walletType: 'Compass Wallet',
        balance
      };
    } catch (error) {
      throw new Error(`Compass Wallet connection failed: ${error}`);
    }
  }

  private async connectKeplrWallet(): Promise<WalletConnectionResult> {
    // @ts-ignore - Keplr wallet global
    if (typeof window.keplr === 'undefined') {
      throw new Error('Keplr Wallet not installed');
    }

    try {
      const chainId = this.isMainnet ? 'sei-network' : 'atlantic-2';
      
      // @ts-ignore
      await window.keplr.enable(chainId);
      // @ts-ignore
      const offlineSigner = window.keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in Keplr Wallet');
      }

      const account = accounts[0];
      const balance = await this.getBalance(account.address);

      return {
        address: account.address,
        chainId: this.isMainnet ? 1329 : 1328,
        walletType: 'Keplr Wallet',
        balance
      };
    } catch (error) {
      throw new Error(`Keplr Wallet connection failed: ${error}`);
    }
  }

  private async connectMetaMaskWallet(): Promise<WalletConnectionResult> {
    // @ts-ignore - MetaMask global
    if (typeof window.ethereum === 'undefined' || !window.ethereum.isMetaMask) {
      throw new Error('MetaMask not installed');
    }

    try {
      // @ts-ignore
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in MetaMask');
      }

      // @ts-ignore
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const targetChainId = this.isMainnet ? 1329 : 1328;

      if (parseInt(chainId, 16) !== targetChainId) {
        await this.switchToSeiNetwork('metamask');
      }

      const balance = await this.getBalance(accounts[0]);

      return {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        walletType: 'MetaMask',
        balance
      };
    } catch (error) {
      throw new Error(`MetaMask connection failed: ${error}`);
    }
  }

  private async connectSeiWallet(): Promise<WalletConnectionResult> {
    // @ts-ignore - Sei wallet global
    if (typeof window.sei === 'undefined') {
      throw new Error('Sei Wallet Extension not installed');
    }

    try {
      // @ts-ignore
      const accounts = await window.sei.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in Sei Wallet');
      }

      // @ts-ignore
      const chainId = await window.sei.request({ method: 'eth_chainId' });
      const balance = await this.getBalance(accounts[0]);

      return {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        walletType: 'Sei Wallet',
        balance
      };
    } catch (error) {
      throw new Error(`Sei Wallet connection failed: ${error}`);
    }
  }

  private async switchToSeiNetwork(walletType: string): Promise<void> {
    const networkConfig = getSeiNetworkConfig(this.isMainnet);
    const chainIdHex = `0x${networkConfig.chainId.toString(16)}`;

    const networkParams = {
      chainId: chainIdHex,
      chainName: networkConfig.networkName,
      nativeCurrency: networkConfig.nativeCurrency,
      rpcUrls: [networkConfig.rpcUrl],
      blockExplorerUrls: [networkConfig.blockExplorerUrl],
    };

    try {
      let provider;
      switch (walletType) {
        case 'fin':
          // @ts-ignore
          provider = window.fin;
          break;
        case 'metamask':
          // @ts-ignore
          provider = window.ethereum;
          break;
        case 'sei':
          // @ts-ignore
          provider = window.sei;
          break;
        default:
          throw new Error(`Network switching not supported for ${walletType}`);
      }

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        // If chain doesn't exist, add it
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [networkParams],
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      throw new Error(`Failed to switch to Sei network: ${error}`);
    }
  }

  getAvailableWallets(): SeiWallet[] {
    const wallets: SeiWallet[] = [
      {
        name: 'Fin Wallet',
        id: 'fin',
        icon: '🦈',
        // @ts-ignore
        installed: typeof window.fin !== 'undefined'
      },
      {
        name: 'Compass Wallet',
        id: 'compass',
        icon: '🧭',
        // @ts-ignore
        installed: typeof window.compass !== 'undefined'
      },
      {
        name: 'Sei Wallet',
        id: 'sei',
        icon: '⚡',
        // @ts-ignore
        installed: typeof window.sei !== 'undefined'
      },
      {
        name: 'Keplr Wallet',
        id: 'keplr',
        icon: '🔮',
        // @ts-ignore
        installed: typeof window.keplr !== 'undefined'
      },
      {
        name: 'MetaMask',
        id: 'metamask',
        icon: '🦊',
        // @ts-ignore
        installed: typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
      }
    ];

    return wallets;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) return '0';
    
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }

  async disconnect(): Promise<void> {
    // Clear any stored connection data
    localStorage.removeItem('reown_wallet_connection');
    this.provider = null;
  }

  async signTransaction(transaction: any): Promise<string> {
    // Implementation for transaction signing
    throw new Error('Transaction signing not implemented yet');
  }
}

// Enhanced React hook with better wallet management
export const useReownWallet = () => {
  const [walletState, setWalletState] = useState<ReownWalletState>({
    isConnected: false,
    address: null,
    balance: null,
    isConnecting: false,
    error: null,
    walletType: null,
    chainId: null,
  });

  const [walletConnection] = useState(() => new ReownWalletConnection(false));

  useEffect(() => {
    // Check for existing connection on mount
    const savedConnection = localStorage.getItem('reown_wallet_connection');
    if (savedConnection) {
      try {
        const connectionData = JSON.parse(savedConnection);
        setWalletState(prev => ({
          ...prev,
          isConnected: true,
          address: connectionData.address,
          walletType: connectionData.walletType,
          chainId: connectionData.chainId,
        }));
        
        // Refresh balance
        walletConnection.getBalance(connectionData.address).then(balance => {
          setWalletState(prev => ({ ...prev, balance }));
        });
      } catch (error) {
        console.error('Error restoring wallet connection:', error);
        localStorage.removeItem('reown_wallet_connection');
      }
    }
  }, [walletConnection]);

  const connectWallet = async (preferredWallet?: string) => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const result = await walletConnection.connect(preferredWallet);
      
      const newState = {
        isConnected: true,
        address: result.address,
        balance: result.balance || '0',
        isConnecting: false,
        error: null,
        walletType: result.walletType,
        chainId: result.chainId,
      };

      setWalletState(newState);

      // Save connection for persistence
      localStorage.setItem('reown_wallet_connection', JSON.stringify({
        address: result.address,
        walletType: result.walletType,
        chainId: result.chainId,
      }));

      return result;
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await walletConnection.disconnect();
      setWalletState({
        isConnected: false,
        address: null,
        balance: null,
        isConnecting: false,
        error: null,
        walletType: null,
        chainId: null,
      });
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        error: error.message || 'Failed to disconnect wallet',
      }));
    }
  };

  const getAvailableWallets = () => {
    return walletConnection.getAvailableWallets();
  };

  const refreshBalance = async () => {
    if (walletState.address) {
      try {
        const balance = await walletConnection.getBalance(walletState.address);
        setWalletState(prev => ({ ...prev, balance }));
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  };

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    getAvailableWallets,
    refreshBalance,
  };
};