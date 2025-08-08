/**
 * 🔄 Wallet State Manager
 * 
 * Fixes wallet connection state update issues by providing centralized state management
 * and automatic UI updates when wallet state changes.
 */

import { useState, useEffect, useCallback } from 'react';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  walletType: string | null;
}

export interface WalletStateManager {
  state: WalletState;
  updateState: (updates: Partial<WalletState>) => void;
  reset: () => void;
  forceRefresh: () => Promise<void>;
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  balance: null,
  chainId: null,
  isConnecting: false,
  error: null,
  walletType: null,
};

// Global state store for wallet
let globalWalletState: WalletState = { ...initialState };
const stateListeners: Set<(state: WalletState) => void> = new Set();

// Notify all listeners when state changes
const notifyListeners = () => {
  stateListeners.forEach(listener => listener(globalWalletState));
};

// Update global state
const updateGlobalState = (updates: Partial<WalletState>) => {
  globalWalletState = { ...globalWalletState, ...updates };
  console.log('🔄 Wallet state updated:', globalWalletState);
  notifyListeners();
};

// Reset global state
const resetGlobalState = () => {
  globalWalletState = { ...initialState };
  console.log('🔄 Wallet state reset');
  notifyListeners();
};

/**
 * Hook to use wallet state manager
 */
export const useWalletStateManager = (): WalletStateManager => {
  const [state, setState] = useState<WalletState>(globalWalletState);

  useEffect(() => {
    // Add this component as a listener
    const listener = (newState: WalletState) => {
      setState(newState);
    };
    
    stateListeners.add(listener);
    
    // Cleanup listener on unmount
    return () => {
      stateListeners.delete(listener);
    };
  }, []);

  const updateState = useCallback((updates: Partial<WalletState>) => {
    updateGlobalState(updates);
  }, []);

  const reset = useCallback(() => {
    resetGlobalState();
  }, []);

  const forceRefresh = useCallback(async () => {
    console.log('🔄 Force refreshing wallet state...');
    
    try {
      // Check if we have window.ethereum
      if (typeof window !== 'undefined' && window.ethereum) {
        // Get current accounts
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          
          // Get balance if we have ethers
          let balance = null;
          try {
            const { ethers } = await import('ethers');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balanceWei = await provider.getBalance(address);
            balance = ethers.formatEther(balanceWei);
          } catch (balanceError) {
            console.warn('Could not fetch balance:', balanceError);
          }
          
          updateGlobalState({
            isConnected: true,
            address,
            balance,
            chainId: parseInt(chainId, 16),
            isConnecting: false,
            error: null,
            walletType: 'metamask'
          });
        } else {
          updateGlobalState({
            isConnected: false,
            address: null,
            balance: null,
            chainId: null,
            isConnecting: false,
            error: null,
            walletType: null
          });
        }
      }
    } catch (error) {
      console.error('❌ Force refresh failed:', error);
      updateGlobalState({
        isConnecting: false,
        error: `Refresh failed: ${error.message}`
      });
    }
  }, []);

  return {
    state,
    updateState,
    reset,
    forceRefresh
  };
};

/**
 * Enhanced wallet connection with automatic state updates
 */
export class WalletConnectionManager {
  private static instance: WalletConnectionManager;
  private refreshInterval: NodeJS.Timeout | null = null;

  static getInstance(): WalletConnectionManager {
    if (!WalletConnectionManager.instance) {
      WalletConnectionManager.instance = new WalletConnectionManager();
    }
    return WalletConnectionManager.instance;
  }

  /**
   * Start automatic state monitoring
   */
  startMonitoring() {
    if (this.refreshInterval) return;
    
    console.log('🔄 Starting wallet state monitoring...');
    
    // Monitor every 5 seconds
    this.refreshInterval = setInterval(async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum && globalWalletState.isConnected) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          // Check if account changed or disconnected
          if (!accounts || accounts.length === 0) {
            if (globalWalletState.isConnected) {
              console.log('🔌 Wallet disconnected');
              resetGlobalState();
            }
          } else if (accounts[0] !== globalWalletState.address) {
            console.log('🔄 Wallet account changed');
            // Force refresh to get new account data
            await this.forceRefresh();
          }
        }
      } catch (error) {
        console.warn('⚠️ Wallet monitoring error:', error);
      }
    }, 5000);
  }

  /**
   * Stop automatic state monitoring
   */
  stopMonitoring() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('⏹️ Stopped wallet state monitoring');
    }
  }

  /**
   * Force refresh wallet state
   */
  async forceRefresh(): Promise<void> {
    console.log('🔄 Force refreshing wallet state...');
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          
          // Get balance
          let balance = null;
          try {
            const { ethers } = await import('ethers');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balanceWei = await provider.getBalance(address);
            balance = ethers.formatEther(balanceWei);
          } catch (balanceError) {
            console.warn('Could not fetch balance:', balanceError);
          }
          
          updateGlobalState({
            isConnected: true,
            address,
            balance,
            chainId: parseInt(chainId, 16),
            isConnecting: false,
            error: null,
            walletType: 'metamask'
          });
        } else {
          resetGlobalState();
        }
      }
    } catch (error) {
      console.error('❌ Force refresh failed:', error);
      updateGlobalState({
        isConnecting: false,
        error: `Refresh failed: ${error.message}`
      });
    }
  }

  /**
   * Connect wallet with state management
   */
  async connect(): Promise<boolean> {
    updateGlobalState({ isConnecting: true, error: null });
    
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not detected');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Start monitoring after successful connection
      this.startMonitoring();
      
      // Force refresh to get all data
      await this.forceRefresh();
      
      return true;
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      updateGlobalState({
        isConnecting: false,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.stopMonitoring();
    resetGlobalState();
  }
}

// Initialize global instance
export const walletManager = WalletConnectionManager.getInstance();

// Auto-start monitoring if wallet is already connected
if (typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          console.log('🔄 Detected existing wallet connection, starting monitoring...');
          walletManager.startMonitoring();
          await walletManager.forceRefresh();
        }
      } catch (error) {
        console.warn('Could not check existing wallet connection:', error);
      }
    }
  });

  // Listen for account changes
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      console.log('🔄 Accounts changed:', accounts);
      if (accounts.length === 0) {
        walletManager.disconnect();
      } else {
        walletManager.forceRefresh();
      }
    });

    window.ethereum.on('chainChanged', (chainId: string) => {
      console.log('🔄 Chain changed:', chainId);
      walletManager.forceRefresh();
    });
  }
}