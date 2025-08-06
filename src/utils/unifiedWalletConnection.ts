import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Unified wallet interfaces
export interface UnifiedWalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
  walletType: string | null;
  chainId: number | null;
}

export interface WalletProvider {
  name: string;
  id: string;
  icon: string;
  installed: boolean;
  provider?: any;
  isMobile?: boolean;
}

// Declare global wallet interfaces
declare global {
  interface Window {
    sei?: any;
    compass?: any;
    keplr?: any;
    ethereum?: any;
    fin?: any;
  }
}

export class UnifiedWalletConnection {
  private provider: ethers.JsonRpcProvider | null = null;
  private isMainnet: boolean;

  constructor(isMainnet = true) {
    this.isMainnet = isMainnet;
    const rpcUrl = isMainnet 
      ? 'https://evm-rpc.sei-apis.com'
      : 'https://evm-rpc-testnet.sei-apis.com';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  // Get all available wallets
  getAvailableWallets(): WalletProvider[] {
    if (typeof window === 'undefined') return [];

    const wallets: WalletProvider[] = [
      {
        name: 'Sei Wallet',
        id: 'sei',
        icon: 'https://www.seiwallet.xyz/favicon.ico',
        installed: typeof window.sei !== 'undefined',
        provider: window.sei
      },
      {
        name: 'Compass Wallet',
        id: 'compass',
        icon: 'https://compass.xyz/favicon.ico',
        installed: typeof window.compass !== 'undefined',
        provider: window.compass
      },
      {
        name: 'Keplr Wallet',
        id: 'keplr',
        icon: 'https://wallet.keplr.app/favicon.ico',
        installed: typeof window.keplr !== 'undefined',
        provider: window.keplr
      },
      {
        name: 'MetaMask',
        id: 'metamask',
        icon: 'https://metamask.io/images/favicon.ico',
        installed: typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask,
        provider: window.ethereum?.isMetaMask ? window.ethereum : undefined
      },
      {
        name: 'Fin Wallet',
        id: 'fin',
        icon: 'https://finwallet.com/favicon.ico',
        installed: typeof window.fin !== 'undefined',
        provider: window.fin
      }
    ];

    return wallets.filter(wallet => wallet.installed);
  }

  // Connect to a specific wallet
  async connect(walletId?: string): Promise<{
    address: string;
    chainId: number;
    walletType: string;
    balance?: string;
  }> {
    const availableWallets = this.getAvailableWallets();
    
    if (availableWallets.length === 0) {
      throw new Error('No compatible wallets found. Please install Sei Wallet, Compass, Keplr, MetaMask, or Fin Wallet.');
    }

    // Use specified wallet or first available
    const targetWallet = walletId 
      ? availableWallets.find(w => w.id === walletId)
      : availableWallets[0];

    if (!targetWallet) {
      throw new Error(`Wallet ${walletId} not found or not installed.`);
    }

    switch (targetWallet.id) {
      case 'sei':
        return await this.connectSeiWallet();
      case 'compass':
        return await this.connectCompassWallet();
      case 'keplr':
        return await this.connectKeplrWallet();
      case 'metamask':
        return await this.connectMetaMaskWallet();
      case 'fin':
        return await this.connectFinWallet();
      default:
        throw new Error(`Unsupported wallet: ${targetWallet.id}`);
    }
  }

  private async connectSeiWallet() {
    if (!window.sei) throw new Error('Sei Wallet not found');

    try {
      const accounts = await window.sei.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in Sei Wallet');
      }

      const chainId = await window.sei.request({ method: 'eth_chainId' });
      const targetChainId = this.isMainnet ? 1329 : 1328;

      if (parseInt(chainId, 16) !== targetChainId) {
        await this.switchToSeiNetwork('sei');
      }

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

  private async connectCompassWallet() {
    if (!window.compass) throw new Error('Compass Wallet not found');

    try {
      await window.compass.enable(['sei']);
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

  private async connectKeplrWallet() {
    if (!window.keplr) throw new Error('Keplr Wallet not found');

    try {
      const chainId = this.isMainnet ? 'sei-network' : 'atlantic-2';
      
      await window.keplr.enable(chainId);
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

  private async connectMetaMaskWallet() {
    if (!window.ethereum?.isMetaMask) throw new Error('MetaMask not found');

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in MetaMask');
      }

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

  private async connectFinWallet() {
    if (!window.fin) throw new Error('Fin Wallet not found');

    try {
      const accounts = await window.fin.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in Fin Wallet');
      }

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

  private async switchToSeiNetwork(walletType: string): Promise<void> {
    const chainId = this.isMainnet ? 1329 : 1328;
    const chainIdHex = `0x${chainId.toString(16)}`;

    const addChainParams = {
      chainId: chainIdHex,
      chainName: this.isMainnet ? 'Sei Network' : 'Sei Testnet',
      nativeCurrency: {
        name: 'SEI',
        symbol: 'SEI',
        decimals: 18
      },
      rpcUrls: [this.isMainnet 
        ? 'https://evm-rpc.sei-apis.com'
        : 'https://evm-rpc-testnet.sei-apis.com'
      ],
      blockExplorerUrls: [this.isMainnet 
        ? 'https://seitrace.com'
        : 'https://seitrace.com/?chain=sei-testnet'
      ]
    };

    try {
      let provider: any;
      switch (walletType) {
        case 'sei':
          provider = window.sei;
          break;
        case 'metamask':
          provider = window.ethereum;
          break;
        case 'fin':
          provider = window.fin;
          break;
        default:
          throw new Error(`Network switching not supported for ${walletType}`);
      }

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }]
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [addChainParams]
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.warn(`Failed to switch network for ${walletType}:`, error);
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider || !address) return '0';

    try {
      const balance = await this.provider.getBalance(address);
      return parseFloat(ethers.formatEther(balance)).toFixed(4);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  async disconnect(): Promise<void> {
    // Clear any stored connection data
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('unified_wallet_connection');
        localStorage.removeItem('seifu_wallet_type');
        localStorage.removeItem('seifu_wallet_address');
      } catch (error) {
        console.warn('Failed to clear wallet storage:', error);
      }
    }
  }
}

// React Hook for Unified Wallet Connection
export const useUnifiedWallet = () => {
  const [walletConnection, setWalletConnection] = useState<UnifiedWalletConnection | null>(null);
  const [walletState, setWalletState] = useState<UnifiedWalletState>({
    isConnected: false,
    address: null,
    balance: null,
    isConnecting: false,
    error: null,
    walletType: null,
    chainId: null
  });

  // Initialize wallet connection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const connection = new UnifiedWalletConnection(true); // Use mainnet
      setWalletConnection(connection);
    }
  }, []);

  // Restore connection on mount
  useEffect(() => {
    if (!walletConnection) return;

    const restoreConnection = async () => {
      try {
        const savedConnection = localStorage.getItem('unified_wallet_connection');
        if (savedConnection) {
          const { address, walletType, chainId } = JSON.parse(savedConnection);
          const balance = await walletConnection.getBalance(address);
          
          setWalletState({
            isConnected: true,
            address,
            balance,
            isConnecting: false,
            error: null,
            walletType,
            chainId
          });
        }
      } catch (error) {
        console.warn('Failed to restore wallet connection:', error);
      }
    };

    restoreConnection();
  }, [walletConnection]);

  const connectWallet = async (preferredWallet?: string) => {
    if (!walletConnection) return;

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const result = await walletConnection.connect(preferredWallet);
      
      setWalletState({
        isConnected: true,
        address: result.address,
        balance: result.balance || '0',
        isConnecting: false,
        error: null,
        walletType: result.walletType,
        chainId: result.chainId
      });

      // Save connection
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('unified_wallet_connection', JSON.stringify({
            address: result.address,
            walletType: result.walletType,
            chainId: result.chainId
          }));
        } catch (error) {
          console.warn('Failed to save wallet connection:', error);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      
      // Provide helpful error messages
      let helpfulMessage = errorMessage;
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        helpfulMessage = 'Connection was cancelled. Please try again and approve the connection in your wallet.';
      } else if (errorMessage.includes('not found') || errorMessage.includes('not installed')) {
        helpfulMessage = `${errorMessage}\n\nPlease install the wallet extension and refresh the page.`;
      } else if (errorMessage.includes('No compatible wallets')) {
        helpfulMessage = `No Sei-compatible wallets detected. Please install one of the following:

• Sei Wallet: https://sei.io/wallet
• Compass Wallet: https://compass.keplr.app/
• Keplr: https://keplr.app/
• MetaMask: https://metamask.io/
• Fin Wallet: https://finwallet.com/

Then refresh this page.`;
      }

      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: helpfulMessage
      }));
    }
  };

  const disconnectWallet = async () => {
    if (!walletConnection) return;

    try {
      await walletConnection.disconnect();
      setWalletState({
        isConnected: false,
        address: null,
        balance: null,
        isConnecting: false,
        error: null,
        walletType: null,
        chainId: null
      });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const getAvailableWallets = (): WalletProvider[] => {
    if (!walletConnection) return [];
    
    try {
      return walletConnection.getAvailableWallets();
    } catch (error) {
      console.warn('Failed to get available wallets:', error);
      return [];
    }
  };

  const refreshBalance = async () => {
    if (!walletConnection || !walletState.address) return;

    try {
      const balance = await walletConnection.getBalance(walletState.address);
      setWalletState(prev => ({ ...prev, balance }));
    } catch (error) {
      console.warn('Failed to refresh balance:', error);
    }
  };

  const clearError = () => {
    setWalletState(prev => ({ ...prev, error: null }));
  };

  const switchWallet = async (newWalletId: string) => {
    await disconnectWallet();
    await connectWallet(newWalletId);
  };

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    clearError,
    switchWallet,
    getAvailableWallets,
    availableWallets: getAvailableWallets()
  };
};