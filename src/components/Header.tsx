import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useSeiWallet } from '../utils/seiWalletConnection';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const { isConnected, address, balance, isConnecting, error, walletType, connectWallet, disconnectWallet, switchWallet, availableWallets, clearError } = useSeiWallet();
  const [showWalletDropdown, setShowWalletDropdown] = React.useState(false);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sei-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/Seifu.png" 
                alt="Seifu Logo" 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-2xl font-bold sei-red">seifun</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/launchpad" 
              className={`sei-nav-link font-medium ${
                location.pathname === '/launchpad' ? 'active' : ''
              }`}
            >
              Launchpad
            </Link>
            <Link 
              to="/seifun-launch" 
              className={`sei-nav-link font-medium ${
                location.pathname === '/seifun-launch' ? 'active' : ''
              }`}
            >
              seifun.launch
            </Link>
            <Link 
              to="/token-pulse" 
              className={`sei-nav-link font-medium ${
                location.pathname === '/token-pulse' ? 'active' : ''
              }`}
            >
              Token Pulse
            </Link>
                                  <Link 
                        to="/docs" 
                        className={`sei-nav-link font-medium ${
                          location.pathname === '/docs' ? 'active' : ''
                        }`}
                      >
                        Docs
                      </Link>
                      <Link 
                        to="/dev-plus" 
                        className={`sei-nav-link font-medium ${
                          location.pathname === '/dev-plus' ? 'active' : ''
                        }`}
                      >
                        Dev Plus
                      </Link>
          </nav>

          {/* Connect Wallet Button */}
          <div className="hidden md:flex items-center space-x-2">
            {error && (
              <div className="relative">
                <div className="absolute right-0 top-12 w-80 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
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
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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
                  onClick={() => availableWallets.length === 1 ? connectWallet() : setShowWalletDropdown(!showWalletDropdown)}
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
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-3"
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-[#FF3C3C] to-[#FF6B6B] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {wallet.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 capitalize">{wallet} Wallet</div>
                            <div className="text-xs text-gray-500">
                              {wallet === 'sei' && 'Official Sei Wallet'}
                              {wallet === 'compass' && 'Cosmos ecosystem wallet'}
                              {wallet === 'keplr' && 'Multi-chain Cosmos wallet'}
                              {wallet === 'metamask' && 'Ethereum & EVM chains'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/launchpad" 
                className={`hover:text-[#FF3C3C] transition-colors font-medium ${
                  location.pathname === '/launchpad' ? 'text-[#FF3C3C]' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Launchpad
              </Link>
              <Link 
                to="/seifun-launch" 
                className={`hover:text-[#FF3C3C] transition-colors font-medium ${
                  location.pathname === '/seifun-launch' ? 'text-[#FF3C3C]' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                seifun.launch
              </Link>
                              <Link 
                  to="/token-pulse" 
                  className={`hover:text-[#FF3C3C] transition-colors font-medium ${
                    location.pathname === '/token-pulse' ? 'text-[#FF3C3C]' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Token Pulse
                </Link>
              <Link 
                to="/docs" 
                className={`hover:text-[#FF3C3C] transition-colors font-medium ${
                  location.pathname === '/docs' ? 'text-[#FF3C3C]' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Docs
              </Link>
              <Link 
                to="/ai-chat" 
                className={`hover:text-[#FF3C3C] transition-colors font-medium ${
                  location.pathname === '/ai-chat' ? 'text-[#FF3C3C]' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                AI Chat
              </Link>
              
              {/* Mobile Wallet Connection */}
              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}
              {isConnected ? (
                <div className="flex flex-col space-y-2">
                  <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm text-center">
                    Balance: {balance} SEI
                  </div>
                  <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm font-mono text-center">
                    {address ? truncateAddress(address) : ''}
                  </div>
                  <button 
                    onClick={disconnectWallet}
                    className="flex items-center justify-center space-x-2 bg-red-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-colors w-fit"
                  >
                    <LogOut size={18} />
                    <span>Disconnect</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="flex items-center space-x-2 sei-btn sei-btn-primary px-6 py-2.5 w-fit disabled:opacity-50 disabled:cursor-not-allowed"
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
                    </>
                  )}
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;