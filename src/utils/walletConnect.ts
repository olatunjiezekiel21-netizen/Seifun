import { useState, useEffect } from 'react';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { reownConfig, getSeiNetworkConfig } from '../config/reown';

// Wallet state interface
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
  chainId: number | null;
}

let appKit: any = null;

// Initialize AppKit
const initializeAppKit = () => {
  if (appKit || typeof window === 'undefined') return appKit;

  try {
    const networkConfig = getSeiNetworkConfig(false); // Use testnet for now
    
    // Define Sei network for Reown
    const seiNetwork = {
      chainId: networkConfig.chainId,
      name: networkConfig.networkName,
      currency: networkConfig.nativeCurrency.symbol,
      explorerUrl: networkConfig.blockExplorerUrl,
      rpcUrl: networkConfig.rpcUrl,
      chainNamespace: 'eip155'
    };

    // Create AppKit instance
    appKit = createAppKit({
      adapters: [new EthersAdapter()],
      projectId: reownConfig.projectId,
      networks: [seiNetwork],
      defaultNetwork: seiNetwork,
      metadata: reownConfig.metadata,
      features: {
        analytics: true,
        email: false,
        socials: [],
        emailShowWallets: false
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-color-mix': '#1e293b',
        '--w3m-color-mix-strength': 20,
        '--w3m-accent': '#3b82f6',
        '--w3m-border-radius-master': '8px'
      }
    });

    return appKit;
  } catch (error) {
    console.error('Failed to initialize AppKit:', error);
    return null;
  }
};

// React hook for wallet connection
export const useWalletConnect = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    isConnecting: false,
    error: null,
    chainId: null
  });

  // Initialize AppKit on component mount
  useEffect(() => {
    const kit = initializeAppKit();
    if (!kit) {
      setWalletState(prev => ({
        ...prev,
        error: 'Failed to initialize wallet connection'
      }));
      return;
    }

    // Subscribe to account changes
    const unsubscribeAccount = kit.subscribeAccount((account: any) => {
      if (account.isConnected && account.address) {
        setWalletState(prev => ({
          ...prev,
          isConnected: true,
          address: account.address,
          chainId: account.chainId,
          isConnecting: false,
          error: null
        }));
        
        // Get balance
        getBalance(account.address);
      } else {
        setWalletState(prev => ({
          ...prev,
          isConnected: false,
          address: null,
          balance: null,
          chainId: null,
          isConnecting: false
        }));
      }
    });

    // Subscribe to chain changes
    const unsubscribeChain = kit.subscribeChainId((chainId: number) => {
      setWalletState(prev => ({
        ...prev,
        chainId
      }));
    });

    return () => {
      unsubscribeAccount?.();
      unsubscribeChain?.();
    };
  }, []);

  // Function to get balance
  const getBalance = async (address: string) => {
    try {
      if (!appKit) return;
      
      const provider = appKit.getWalletProvider();
      if (provider) {
        const balance = await provider.getBalance(address);
        const balanceInEth = (Number(balance) / 1e18).toFixed(4);
        setWalletState(prev => ({
          ...prev,
          balance: balanceInEth
        }));
      }
    } catch (error) {
      console.warn('Failed to get balance:', error);
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    if (!appKit) {
      setWalletState(prev => ({
        ...prev,
        error: 'Wallet connection not initialized'
      }));
      return;
    }

    try {
      setWalletState(prev => ({
        ...prev,
        isConnecting: true,
        error: null
      }));

      await appKit.open();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet'
      }));
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    if (!appKit) return;

    try {
      await appKit.disconnect();
      setWalletState({
        isConnected: false,
        address: null,
        balance: null,
        isConnecting: false,
        error: null,
        chainId: null
      });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setWalletState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to disconnect wallet'
      }));
    }
  };

  // Open wallet modal
  const openWalletModal = () => {
    if (appKit) {
      appKit.open();
    }
  };

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    openWalletModal
  };
};