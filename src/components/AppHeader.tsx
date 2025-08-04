import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wallet, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useReownWallet } from '../utils/reownWalletConnection';

const AppHeader = () => {
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Use real wallet connection instead of mock
  const {
    isConnected,
    address,
    balance,
    isConnecting,
    error,
    walletType,
    connectWallet,
    disconnectWallet,
    getAvailableWallets
  } = useReownWallet();

  // Format address for display
  const walletAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setIsWalletDropdownOpen(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      setIsWalletDropdownOpen(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.wallet-dropdown') && !target.closest('.wallet-button')) {
        setIsWalletDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="app-nav sticky top-0 z-50">
      <div className="app-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/app" className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src="/Seifu.png" 
                alt="Seifun Logo" 
                className="w-10 h-10 rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold app-text-primary">
                Seifun
              </span>
              <span className="text-xs app-text-muted -mt-1">Launch Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/app" 
              className={`app-nav-link ${isActive('/app') ? 'active' : ''}`}
            >
              SafeChecker
            </Link>
            <Link 
              to="/app/launchpad" 
              className={`app-nav-link ${isActive('/app/launchpad') ? 'active' : ''}`}
            >
              Launchpad
            </Link>
            <Link 
              to="/app/seifun-launch" 
              className={`app-nav-link ${isActive('/app/seifun-launch') ? 'active' : ''}`}
            >
              Seifun.launch
            </Link>
            <Link 
              to="/app/token-pulse" 
              className={`app-nav-link ${isActive('/app/token-pulse') ? 'active' : ''}`}
            >
              Token Pulse
            </Link>
            <Link 
              to="/app/dev-plus" 
              className={`app-nav-link ${isActive('/app/dev-plus') ? 'active' : ''}`}
            >
              Dev Plus
            </Link>
            <Link 
              to="/app/docs" 
              className={`app-nav-link ${isActive('/app/docs') ? 'active' : ''}`}
            >
              Docs
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="relative wallet-dropdown">
                <button
                  onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                  className="wallet-button flex items-center space-x-2 app-btn app-btn-secondary"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">{walletAddress}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isWalletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 app-card p-4 z-50">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 rounded-lg app-bg-secondary">
                        <User className="w-4 h-4 app-text-muted" />
                        <span className="text-sm app-text-primary">{walletAddress}</span>
                      </div>
                      
                      <button className="w-full flex items-center space-x-2 p-2 rounded-lg hover:app-bg-secondary transition-colors">
                        <Settings className="w-4 h-4 app-text-muted" />
                        <span className="text-sm app-text-primary">Settings</span>
                      </button>
                      
                      <div className="border-t app-border pt-2">
                        <button 
                          onClick={handleDisconnectWallet}
                          className="w-full flex items-center space-x-2 p-2 rounded-lg hover:app-bg-secondary transition-colors"
                        >
                          <LogOut className="w-4 h-4 app-text-muted" />
                          <span className="text-sm app-text-primary">Disconnect</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="app-btn app-btn-primary"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg app-bg-tertiary hover:app-bg-secondary transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 app-text-primary" />
              ) : (
                <Menu className="w-5 h-5 app-text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t app-border">
            <nav className="py-4 space-y-2">
              <Link 
                to="/app" 
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive('/app') ? 'app-bg-secondary app-text-primary' : 'app-text-secondary hover:app-bg-secondary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                SafeChecker
              </Link>
              <Link 
                to="/app/launchpad" 
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive('/app/launchpad') ? 'app-bg-secondary app-text-primary' : 'app-text-secondary hover:app-bg-secondary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Launchpad
              </Link>
              <Link 
                to="/app/seifun-launch" 
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive('/app/seifun-launch') ? 'app-bg-secondary app-text-primary' : 'app-text-secondary hover:app-bg-secondary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Seifun.launch
              </Link>
              <Link 
                to="/app/token-pulse" 
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive('/app/token-pulse') ? 'app-bg-secondary app-text-primary' : 'app-text-secondary hover:app-bg-secondary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Token Pulse
              </Link>
              <Link 
                to="/app/dev-plus" 
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive('/app/dev-plus') ? 'app-bg-secondary app-text-primary' : 'app-text-secondary hover:app-bg-secondary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dev Plus
              </Link>
              <Link 
                to="/app/docs" 
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive('/app/docs') ? 'app-bg-secondary app-text-primary' : 'app-text-secondary hover:app-bg-secondary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Docs
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;