import { useState, useEffect } from 'react';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { reownConfig, getSeiNetworkConfig } from '../config/reown';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
  chainId: number | null;
}

// Global AppKit instance
let appKit: any = null;
let isInitializing = false;

// Initialize AppKit with proper error handling
const initializeAppKit = async () => {
  if (appKit || isInitializing) return appKit;
  
  try {
    isInitializing = true;
    console.log('🔄 Initializing Reown AppKit...');

    // Get Sei network configuration
    const seiNetwork = getSeiNetworkConfig(true); // Use mainnet

    // Create Ethers adapter
    const ethersAdapter = new EthersAdapter();

    // Configure networks for AppKit
    const networks = [
      {
        id: seiNetwork.chainId,
        name: seiNetwork.networkName,
        nativeCurrency: seiNetwork.nativeCurrency,
        rpcUrls: {
          default: { http: [seiNetwork.rpcUrl] },
          public: { http: [seiNetwork.rpcUrl] }
        },
        blockExplorers: {
          default: { 
            name: 'SeiTrace', 
            url: seiNetwork.blockExplorerUrl 
          }
        }
      }
    ];

    // Create AppKit instance
    appKit = createAppKit({
      adapters: [ethersAdapter],
      networks,
      projectId: reownConfig.projectId,
      metadata: reownConfig.metadata,
      features: {
        analytics: true,
        email: false,
        socials: []
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#ef4444', // Sei red
        '--w3m-color-mix': '#1e293b',
        '--w3m-color-mix-strength': 20
      }
    });

    console.log('✅ Reown AppKit initialized successfully');
    isInitializing = false;
    return appKit;

  } catch (error) {
    console.error('❌ Failed to initialize Reown AppKit:', error);
    isInitializing = false;
    throw error;
  }
};

export const useWalletConnect = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    isConnecting: false,
    error: null,
    chainId: null
  });

  // Initialize AppKit and set up listeners
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let mounted = true;

    const setupWallet = async () => {
      try {
        const kit = await initializeAppKit();
        
        if (!mounted) return;

        // Subscribe to account changes with better state management
        unsubscribe = kit.subscribeAccount((account: any) => {
          console.log('👛 Account changed:', account);
          
          if (!mounted) return;

          // Handle connection state
          if (account.isConnected && account.address) {
            setWalletState(prev => ({
              ...prev,
              isConnected: true,
              address: account.address,
              chainId: account.chainId || prev.chainId,
              isConnecting: false,
              error: null
            }));
            
            // Fetch balance with retry logic
            fetchBalance(account.address).catch(err => {
              console.warn('Balance fetch failed, retrying...', err);
              setTimeout(() => fetchBalance(account.address), 2000);
            });
          } else {
            // Only clear state if we're actually disconnected
            if (account.isConnected === false) {
              setWalletState(prev => ({
                ...prev,
                isConnected: false,
                address: null,
                balance: null,
                chainId: null,
                isConnecting: false,
                error: null
              }));
            }
          }
        });

        // Check initial connection state with retry
        const checkInitialState = async (retries = 3) => {
          try {
            const account = kit.getAccount();
            console.log('🔍 Checking initial account state:', account);
            
            if (account && account.isConnected && account.address) {
              if (mounted) {
                setWalletState(prev => ({
                  ...prev,
                  isConnected: true,
                  address: account.address,
                  chainId: account.chainId || prev.chainId,
                  isConnecting: false,
                  error: null
                }));
                fetchBalance(account.address);
              }
            } else if (retries > 0) {
              // Retry after a short delay for redirect scenarios
              setTimeout(() => checkInitialState(retries - 1), 1000);
            }
          } catch (error) {
            console.warn('Initial state check failed:', error);
            if (retries > 0) {
              setTimeout(() => checkInitialState(retries - 1), 1000);
            }
          }
        };

        checkInitialState();

      } catch (error) {
        console.error('Failed to setup wallet:', error);
        if (mounted) {
          setWalletState(prev => ({
            ...prev,
            error: 'Failed to initialize wallet connection',
            isConnecting: false
          }));
        }
      }
    };

    setupWallet();

    // Cleanup
    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Fetch wallet balance
  const fetchBalance = async (address: string) => {
    try {
      if (!appKit) return;
      
      const provider = appKit.getWalletProvider();
      if (provider) {
        const balance = await provider.getBalance(address);
        const balanceInSei = (parseFloat(balance) / 1e18).toFixed(4);
        
        setWalletState(prev => ({
          ...prev,
          balance: `${balanceInSei} SEI`
        }));
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));
      
      const kit = await initializeAppKit();
      await kit.open();
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet'
      }));
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      if (!appKit) return;
      
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
    }
  };

  // Open wallet modal
  const openWalletModal = () => {
    connectWallet();
  };

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    openWalletModal
  };
};