import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Wallet, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useSeiWallet } from '../utils/seiWalletConnection';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const walletDropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    isConnected,
    address,
    balance,
    isConnecting,
    error,
    walletType,
    availableWallets,
    connectWallet,
    disconnectWallet,
    switchWallet,
    clearError
  } = useSeiWallet();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(event.target as Node)) {
        setShowWalletDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="/Seifu.png" 
                alt="Seifun Logo" 
                className="w-10 h-10 rounded-full hover:scale-105 transition-transform duration-300 animate-pulse"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 via-blue-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-green-500 via-blue-500 to-red-500 bg-clip-text text-transparent">
                Seifun
              </span>
              <span className="text-xs text-gray-500 -mt-1">Launch Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-[#FF3C3C] transition-colors font-medium">
              Home
            </Link>
            <Link to="/launchpad" className="text-gray-700 hover:text-[#FF3C3C] transition-colors font-medium">
              Launchpad
            </Link>
            <Link to="/seifun-launch" className="text-gray-700 hover:text-[#FF3C3C] transition-colors font-medium">
              Discover
            </Link>
            <Link to="/token-pulse" className="text-gray-700 hover:text-[#FF3C3C] transition-colors font-medium">
              Analytics
            </Link>
            <Link to="/dev-plus" className="text-gray-700 hover:text-[#FF3C3C] transition-colors font-medium">
              Dev Plus
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4 relative">
            {error && (
              <div className="absolute right-0 top-12 w-80 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-[100]">
                <div className="text-red-800 text-sm whitespace-pre-line">
                  {error}
                </div>
                <button 
                  onClick={clearError}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm">
                  {balance} SEI
                </div>
                <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-sm font-mono">
                  {address ? truncateAddress(address) : ''}
                </div>
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
                  {walletType}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                    className="p-2 text-gray-600 hover:text-[#FF3C3C] transition-colors"
                    title="Wallet Options"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showWalletDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[100]" ref={walletDropdownRef}>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            disconnectWallet();
                            setShowWalletDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2 text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Disconnect</span>
                        </button>
                        {availableWallets.length > 1 && (
                          <>
                            <hr className="my-2" />
                            <div className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wide">
                              Switch Wallet
                            </div>
                            {availableWallets.filter(w => w !== walletType).map((wallet) => (
                              <button
                                key={wallet}
                                onClick={() => {
                                  switchWallet(wallet);
                                  setShowWalletDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors capitalize"
                              >
                                {wallet} Wallet
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => {
                    if (availableWallets.length === 0) {
                      // Show helpful message when no wallets are available
                      alert(`No Sei-compatible wallets detected. Please install one of these wallets:

• Sei Wallet: https://sei.io/wallet
• Compass Wallet: https://compass.keplr.app/
• Keplr: https://keplr.app/
• MetaMask: https://metamask.io/

After installing, refresh the page and try again.`);
                    } else if (availableWallets.length === 1) {
                      connectWallet();
                    } else {
                      setShowWalletDropdown(!showWalletDropdown);
                    }
                  }}
                  disabled={isConnecting}
                  className="flex items-center space-x-2 sei-btn sei-btn-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Wallet size={18} />
                      <span>Connect Wallet</span>
                      {availableWallets.length > 1 && <ChevronDown className="w-4 h-4" />}
                    </>
                  )}
                </button>
                
                {showWalletDropdown && !isConnecting && availableWallets.length > 1 && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-[100]" ref={walletDropdownRef}>
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm text-gray-600">Choose a wallet to connect</p>
                    </div>
                    <div className="p-2">
                      {availableWallets.map((wallet) => (
                        <button
                          key={wallet}
                          onClick={() => {
                            connectWallet(wallet);
                            setShowWalletDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{wallet.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="capitalize">{wallet} Wallet</span>
                        </button>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-500">
                        Don't have a wallet? 
                        <a 
                          href="https://sei.io/wallet" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 ml-1"
                        >
                          Get Sei Wallet
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                
                {availableWallets.length === 0 && (
                  <div className="absolute right-0 mt-2 w-80 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-xl z-[100]">
                    <div className="text-yellow-800 text-sm">
                      <p className="font-medium mb-2">No wallet detected</p>
                      <p className="mb-2">Please install a Sei-compatible wallet:</p>
                      <ul className="text-xs space-y-1">
                        <li>• <a href="https://sei.io/wallet" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Sei Wallet</a></li>
                        <li>• <a href="https://compass.keplr.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Compass Wallet</a></li>
                        <li>• <a href="https://keplr.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Keplr</a></li>
                        <li>• <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">MetaMask</a></li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-[#FF3C3C] transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-[#FF3C3C] transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/launchpad" 
                className="text-gray-700 hover:text-[#FF3C3C] transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Launchpad
              </Link>
              <Link 
                to="/seifun-launch" 
                className="text-gray-700 hover:text-[#FF3C3C] transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Discover
              </Link>
              <Link 
                to="/token-pulse" 
                className="text-gray-700 hover:text-[#FF3C3C] transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Analytics
              </Link>
              <Link 
                to="/dev-plus" 
                className="text-gray-700 hover:text-[#FF3C3C] transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dev Plus
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;