import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { reownConfig, getSeiNetworkConfig } from '../config/reown';

// Reown AppKit imports
let createAppKit: any = null;
let AppKit: any = null;

// Lazy load Reown AppKit to prevent SSR issues
const loadReownAppKit = async () => {
  if (typeof window === 'undefined') return null;
  
  try {
    console.log('🔄 Loading ReOWN AppKit modules...');
    
    // Test basic module loading first
    const reownModule = await import('@reown/appkit');
    console.log('📦 Base ReOWN module loaded:', Object.keys(reownModule));
    
    const ethersModule = await import('@reown/appkit-adapter-ethers');
    console.log('📦 Ethers adapter module loaded:', Object.keys(ethersModule));
    
    createAppKit = reownModule.createAppKit;
    AppKit = reownModule.AppKit;
    
    console.log('✅ ReOWN modules loaded successfully:', {
      createAppKit: !!createAppKit,
      AppKit: !!AppKit,
      ethersAdapter: !!ethersModule.ethersAdapter,
      reownModuleKeys: Object.keys(reownModule),
      ethersModuleKeys: Object.keys(ethersModule)
    });
    
    return { createAppKit, AppKit, ethersAdapter: ethersModule.ethersAdapter };
  } catch (error) {
    console.error('❌ Failed to load Reown AppKit modules:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return null;
  }
};

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
  isMobile?: boolean;
}

export class ReownWalletConnection {
  private provider: ethers.JsonRpcProvider | null = null;
  private isMainnet: boolean;
  private appKit: any = null;
  private reownInitialized: boolean = false;

  constructor(isMainnet = false) {
    this.isMainnet = isMainnet;
    const networkConfig = getSeiNetworkConfig(isMainnet);
    this.provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
    
    // Initialize Reown AppKit
    this.initializeReownAppKit();
  }

  private async initializeReownAppKit() {
    if (typeof window === 'undefined' || this.reownInitialized) return;

    try {
      console.log('🔄 Initializing ReOWN AppKit...');
      const reownModules = await loadReownAppKit();
      if (!reownModules) {
        console.warn('⚠️ Reown AppKit modules not available');
        return;
      }

      const { createAppKit, ethersAdapter } = reownModules;
      const networkConfig = getSeiNetworkConfig(this.isMainnet);

      // Validate required components
      if (!createAppKit) {
        throw new Error('createAppKit function not available');
      }
      if (!ethersAdapter) {
        throw new Error('ethersAdapter not available');
      }
      if (!reownConfig.projectId) {
        throw new Error('ReOWN Project ID not configured');
      }

      // Define Sei network for Reown with proper configuration
      const seiNetwork = {
        chainId: networkConfig.chainId,
        name: networkConfig.networkName,
        currency: networkConfig.nativeCurrency.symbol,
        explorerUrl: networkConfig.blockExplorerUrl,
        rpcUrl: networkConfig.rpcUrl,
        chainNamespace: 'eip155'
      };

      console.log('🌐 Creating ReOWN AppKit with config:', {
        projectId: reownConfig.projectId,
        network: seiNetwork,
        isMainnet: this.isMainnet
      });

      // Create the ethers adapter instance
      const adapter = ethersAdapter({
        networks: [seiNetwork],
        defaultNetwork: seiNetwork
      });

      console.log('🔧 Creating AppKit instance...');

      // Create the AppKit instance with enhanced mobile support
      this.appKit = createAppKit({
        adapters: [adapter],
        projectId: reownConfig.projectId,
        networks: [seiNetwork],
        defaultNetwork: seiNetwork,
        metadata: reownConfig.metadata,
        features: {
          analytics: false, // Disable analytics for now
          email: false,
          socials: [],
          swaps: false,
          onramp: false
        },
        themeMode: 'light',
        themeVariables: {
          '--w3m-font-family': 'Inter, system-ui, sans-serif',
          '--w3m-accent': '#4F46E5'
        },
        enableWalletConnect: true,
        enableInjected: true,
        enableEIP6963: true,
        enableCoinbase: false
      });

      console.log('✅ AppKit created successfully:', !!this.appKit);

      this.reownInitialized = true;
      console.log('✅ Reown AppKit initialized successfully for mobile and desktop');
    } catch (error) {
      console.error('❌ Failed to initialize Reown AppKit:', error);
      // Set a flag to show that Reown is not available
      this.reownInitialized = false;
    }
  }

  async connect(preferredWallet?: string): Promise<WalletConnectionResult> {
    try {
      // Try to connect with preferred wallet first
      if (preferredWallet) {
        if (preferredWallet === 'reown') {
          return await this.connectReownWallet();
        }
        return await this.connectSpecificWallet(preferredWallet);
      }
      
      // Check if any desktop wallets are available first
      const availableWallets = this.getAvailableWallets();
      const installedDesktopWallets = availableWallets.filter(w => w.installed && !w.isMobile);
      
      if (installedDesktopWallets.length > 0) {
        // Try desktop wallets if available
        return await this.connectWithFallback();
      } else {
        // No desktop wallets installed, use ReOWN for mobile wallet connection
        console.log('No desktop wallets detected, opening ReOWN for mobile wallet connection...');
        return await this.connectReownWallet();
      }
    } catch (error) {
      throw new Error(`Connection failed: ${error}`);
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
      case 'reown':
        return await this.connectReownWallet();
      default:
        throw new Error(`Unsupported wallet: ${walletId}`);
    }
  }

  private async connectWithFallback(): Promise<WalletConnectionResult> {
    const availableWallets = this.getAvailableWallets();
    const installedWallets = availableWallets.filter(w => w.installed && !w.isMobile);
    
    // Try installed desktop wallets first
    for (const wallet of installedWallets) {
      try {
        console.log(`Attempting to connect with ${wallet.name}...`);
        return await this.connectSpecificWallet(wallet.id);
      } catch (error) {
        console.log(`Failed to connect with ${wallet.name}:`, error);
        continue;
      }
    }
    
    // If no desktop wallets work, fall back to ReOWN
    console.log('Desktop wallet connections failed, trying ReOWN for mobile wallets...');
    try {
      return await this.connectReownWallet();
    } catch (error) {
      throw new Error('No compatible wallet found. Please install a Sei-compatible wallet extension or use a mobile wallet that supports WalletConnect.');
    }
  }

  // Enhanced Reown mobile wallet connection
  private async connectReownWallet(): Promise<WalletConnectionResult> {
    try {
      console.log('🔗 Starting ReOWN wallet connection...');
      
      // Initialize if not already done
      if (!this.appKit) {
        console.log('🔄 AppKit not initialized, initializing now...');
        await this.initializeReownAppKit();
      }

      if (!this.appKit) {
        console.error('❌ AppKit initialization failed');
        throw new Error('WalletConnect initialization failed. This could be due to:\n• Network connectivity issues\n• Browser compatibility problems\n• Missing ReOWN configuration\n\nPlease refresh the page and try again.');
      }

      console.log('✅ AppKit ready, proceeding with connection...');

      // Check if already connected
      const currentState = this.appKit.getState?.();
      if (currentState?.address) {
        const balance = await this.getBalance(currentState.address);
        return {
          address: currentState.address,
          chainId: currentState.selectedNetworkId || (this.isMainnet ? 1329 : 1328),
          walletType: 'Mobile Wallet (WalletConnect)',
          balance
        };
      }

      // Open the Reown modal for wallet selection
      console.log('🔗 Opening Reown wallet selection...');
      await this.appKit.open();
      
      // Wait for connection with enhanced error handling
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout. Please try again or use a desktop wallet.'));
        }, 90000); // 90 second timeout for mobile

        let isResolved = false;

        const unsubscribe = this.appKit.subscribeState((state: any) => {
          console.log('🔄 Reown state update:', { 
            open: state.open, 
            address: state.address, 
            selectedNetworkId: state.selectedNetworkId 
          });

          // Connection successful
          if (state.address && !isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            unsubscribe();

            this.getBalance(state.address).then(balance => {
              resolve({
                address: state.address,
                chainId: state.selectedNetworkId || (this.isMainnet ? 1329 : 1328),
                walletType: `Mobile Wallet (${state.connectorType || 'WalletConnect'})`,
                balance: balance || '0'
              });
            }).catch(balanceError => {
              console.warn('⚠️ Balance fetch failed:', balanceError);
              resolve({
                address: state.address,
                chainId: state.selectedNetworkId || (this.isMainnet ? 1329 : 1328),
                walletType: `Mobile Wallet (${state.connectorType || 'WalletConnect'})`,
                balance: '0'
              });
            });
          }

          // Modal closed without connection
          if (state.open === false && !state.address && !isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            unsubscribe();
            reject(new Error('Connection cancelled by user'));
          }
        });

        // Fallback: Check connection after a short delay
        setTimeout(() => {
          if (!isResolved) {
            const currentState = this.appKit.getState?.();
            if (currentState?.address) {
              isResolved = true;
              clearTimeout(timeout);
              unsubscribe();
              
              this.getBalance(currentState.address).then(balance => {
                resolve({
                  address: currentState.address,
                  chainId: currentState.selectedNetworkId || (this.isMainnet ? 1329 : 1328),
                  walletType: 'Mobile Wallet (WalletConnect)',
                  balance: balance || '0'
                });
              });
            }
          }
        }, 5000); // Check after 5 seconds
      });
    } catch (error) {
      console.error('❌ Reown connection error:', error);
      throw new Error(`Mobile wallet connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure you have a compatible mobile wallet installed.`);
    }
  }

  private async connectFinWallet(): Promise<WalletConnectionResult> {
    // @ts-ignore - Fin wallet global
    if (typeof window === 'undefined' || typeof window.fin === 'undefined') {
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
    if (typeof window === 'undefined' || typeof window.compass === 'undefined') {
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
    if (typeof window === 'undefined' || typeof window.keplr === 'undefined') {
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
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined' || !window.ethereum.isMetaMask) {
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
    if (typeof window === 'undefined' || typeof window.sei === 'undefined') {
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

  private async switchToSeiNetwork(walletType: string): Promise<void> {
    const networkConfig = getSeiNetworkConfig(this.isMainnet);
    const chainIdHex = `0x${networkConfig.chainId.toString(16)}`;

    const addChainParams = {
      chainId: chainIdHex,
      chainName: networkConfig.networkName,
      nativeCurrency: networkConfig.nativeCurrency,
      rpcUrls: [networkConfig.rpcUrl],
      blockExplorerUrls: [networkConfig.blockExplorerUrl],
    };

    try {
      let provider: any;
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
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [addChainParams],
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.warn(`Failed to switch network for ${walletType}:`, error);
    }
  }

  getAvailableWallets(): SeiWallet[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const wallets: SeiWallet[] = [
      {
        name: 'Fin Wallet',
        id: 'fin',
        icon: 'https://finwallet.com/favicon.ico',
        // @ts-ignore
        installed: typeof window.fin !== 'undefined',
        provider: typeof window !== 'undefined' ? (window as any).fin : undefined
      },
      {
        name: 'Compass Wallet',
        id: 'compass',
        icon: 'https://compass.xyz/favicon.ico',
        // @ts-ignore
        installed: typeof window.compass !== 'undefined',
        provider: typeof window !== 'undefined' ? (window as any).compass : undefined
      },
      {
        name: 'Sei Wallet',
        id: 'sei',
        icon: 'https://www.seiwallet.xyz/favicon.ico',
        // @ts-ignore
        installed: typeof window.sei !== 'undefined',
        provider: typeof window !== 'undefined' ? (window as any).sei : undefined
      },
      {
        name: 'Keplr Wallet',
        id: 'keplr',
        icon: 'https://wallet.keplr.app/favicon.ico',
        // @ts-ignore
        installed: typeof window.keplr !== 'undefined',
        provider: typeof window !== 'undefined' ? (window as any).keplr : undefined
      },
      {
        name: 'MetaMask',
        id: 'metamask',
        icon: 'https://metamask.io/images/favicon.ico',
        // @ts-ignore
        installed: typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask,
        provider: typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask ? (window as any).ethereum : undefined
      },
      {
        name: 'Mobile Wallets',
        id: 'reown',
        icon: 'https://walletconnect.com/favicon.ico',
        installed: true, // Always available via Reown
        isMobile: true
      }
    ];

    return wallets;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider || !address) return '0';

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  async disconnect(): Promise<void> {
    try {
      // Disconnect Reown if connected
      if (this.appKit) {
        await this.appKit.disconnect();
      }

      // Clear localStorage
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem('reown_wallet_connection');
          localStorage.removeItem('walletconnect');
        } catch (error) {
          console.warn('Failed to clear localStorage:', error);
        }
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  async signTransaction(transaction: any): Promise<string> {
    // Implementation for transaction signing
    throw new Error('Transaction signing not implemented yet');
  }
}

// React Hook for Wallet Connection
export const useReownWallet = () => {
  const [walletConnection, setWalletConnection] = useState<ReownWalletConnection | null>(null);
  const [walletState, setWalletState] = useState<ReownWalletState>({
    isConnected: false,
    address: null,
    balance: null,
    isConnecting: false,
    error: null,
    walletType: null,
    chainId: null,
  });

  // Safe initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const connection = new ReownWalletConnection(false); // Use testnet for now
      setWalletConnection(connection);
    }
  }, []);

  // Restore connection on mount
  useEffect(() => {
    if (!walletConnection || typeof window === 'undefined' || typeof localStorage === 'undefined') return;

    const restoreConnection = async () => {
      try {
        const savedConnection = localStorage.getItem('reown_wallet_connection');
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
            chainId,
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
        chainId: result.chainId,
      });

      // Save connection
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('reown_wallet_connection', JSON.stringify({
            address: result.address,
            walletType: result.walletType,
            chainId: result.chainId,
          }));
        } catch (error) {
          console.warn('Failed to save wallet connection:', error);
        }
      }
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
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
        chainId: null,
      });

      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem('reown_wallet_connection');
        } catch (error) {
          console.warn('Failed to clear wallet connection:', error);
        }
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const getAvailableWallets = () => {
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

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    getAvailableWallets,
  };
};