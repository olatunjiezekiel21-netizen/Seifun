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
      // Don't close if clicking on the dropdown itself or its children
      if (walletDropdownRef.current && walletDropdownRef.current.contains(event.target as Node)) {
        return;
      }
      
      // Don't close if clicking on the wallet button that opens the dropdown
      const walletButton = (event.target as Element)?.closest('button');
      if (walletButton && walletButton.getAttribute('title') === 'Wallet Options') {
        return;
      }
      
      // Close the dropdown
      setShowWalletDropdown(false);
    };

    // Only add listener if dropdown is open
    if (showWalletDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showWalletDropdown]);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sei-nav sticky top-0 z-50">
      <div className="sei-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="/Seifu.png" 
                alt="Seifun Logo" 
                className="w-10 h-10 rounded-full hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 via-teal-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold sei-text-primary">
                Seifun
              </span>
              <span className="text-xs sei-text-muted -mt-1">Launch Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="sei-nav-link">
              Home
            </Link>
            <Link to="/launchpad" className="sei-nav-link">
              Launchpad
            </Link>
            <Link to="/seifun-launch" className="sei-nav-link">
              Seifun.launch
            </Link>
            <Link to="/token-pulse" className="sei-nav-link">
              Token Pulse
            </Link>
            <Link to="/dev-plus" className="sei-nav-link">
              Dev Plus
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4 relative">
            {error && (
              <div className="absolute right-0 top-12 w-80 sei-morphistic-card rounded-xl shadow-xl border border-red-200/50 backdrop-blur-sm z-[100]">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-800">Connection Error</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearError();
                      }}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-red-700 text-sm whitespace-pre-line">
                    {error}
                  </div>
                </div>
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
                    className="p-2 text-gray-600 hover:text-[#526FFF] transition-colors"
                    title="Wallet Options"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showWalletDropdown && (
                    <div className="absolute right-0 mt-2 w-48 sei-morphistic-card rounded-xl shadow-xl border border-gray-200/50 backdrop-blur-sm z-[100]" ref={walletDropdownRef}>
                      <div className="p-3 border-b border-gray-200/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Wallet Options</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowWalletDropdown(false);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            disconnectWallet();
                            setShowWalletDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 flex items-center space-x-2 text-red-600 hover:text-red-700"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Disconnect</span>
                        </button>
                        {availableWallets.length > 1 && (
                          <>
                            <hr className="my-2 border-gray-200/30" />
                            <div className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wide font-medium">
                              Switch Wallet
                            </div>
                            {availableWallets.filter(w => w !== walletType).map((wallet) => (
                              <button
                                key={wallet}
                                onClick={() => {
                                  switchWallet(wallet);
                                  setShowWalletDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 capitalize text-gray-700 hover:text-gray-900"
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
                      // Show dropdown with wallet installation guide
                      setShowWalletDropdown(!showWalletDropdown);
                    } else if (availableWallets.length === 1) {
                      // Connect directly if only one wallet is available
                      connectWallet(availableWallets[0]);
                    } else {
                      // Show dropdown only if multiple wallets are available
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
                  <div className="absolute right-0 mt-2 w-56 sei-morphistic-card rounded-xl shadow-xl border border-gray-200/50 backdrop-blur-sm z-[100]" ref={walletDropdownRef}>
                    <div className="p-3 border-b border-gray-200/30">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Choose a wallet to connect</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowWalletDropdown(false);
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-2">
                      {availableWallets.map((wallet) => (
                        <button
                          key={wallet}
                          onClick={() => {
                            connectWallet(wallet);
                            setShowWalletDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white text-xs font-bold">{wallet.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="capitalize font-medium">{wallet} Wallet</span>
                        </button>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200/30 bg-gradient-to-r from-gray-50/50 to-gray-100/50">
                      <p className="text-xs text-gray-500">
                        Don't have a wallet? 
                        <a 
                          href="https://sei.io/wallet" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
                        >
                          Get Sei Wallet
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                
                {availableWallets.length === 0 && showWalletDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sei-morphistic-card rounded-xl shadow-xl border border-yellow-200/50 backdrop-blur-sm z-[100]">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-yellow-800">No Wallet Detected</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowWalletDropdown(false);
                          }}
                          className="text-yellow-400 hover:text-yellow-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-yellow-700 text-sm">
                        <p className="mb-2">Please install a Sei-compatible wallet:</p>
                        <ul className="space-y-1">
                          <li>• <a href="https://sei.io/wallet" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">Sei Wallet</a></li>
                          <li>• <a href="https://compass.keplr.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">Compass Wallet</a></li>
                          <li>• <a href="https://keplr.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">Keplr</a></li>
                          <li>• <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">MetaMask</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;