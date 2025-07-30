import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Menu, X, LogOut } from 'lucide-react';
import { useWallet } from '../utils/walletConnection';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const { isConnected, address, balance, isConnecting, error, connectWallet, disconnectWallet } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
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
              <span className="text-2xl font-bold text-[#141414]">seifu</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/launchpad" 
              className={`hover:text-[#FF3C3C] transition-colors font-medium ${
                location.pathname === '/launchpad' ? 'text-[#FF3C3C]' : 'text-gray-700'
              }`}
            >
              Launchpad
            </Link>
            <Link 
              to="/memehub" 
              className={`hover:text-[#FF3C3C] transition-colors font-medium ${
                location.pathname === '/memehub' ? 'text-[#FF3C3C]' : 'text-gray-700'
              }`}
            >
              MemeHub
            </Link>
            <a href="#leaderboard" className="text-gray-700 hover:text-[#FF3C3C] transition-colors font-medium">
              Leaderboard
            </a>
            <Link 
              to="/docs" 
              className={`hover:text-[#FF3C3C] transition-colors font-medium ${
                location.pathname === '/docs' ? 'text-[#FF3C3C]' : 'text-gray-700'
              }`}
            >
              Docs
            </Link>
          </nav>

          {/* Connect Wallet Button */}
          <div className="hidden md:flex items-center space-x-2">
            {error && (
              <div className="text-red-500 text-sm mr-2">
                {error}
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
                <button 
                  onClick={disconnectWallet}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                  title="Disconnect Wallet"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center space-x-2 bg-[#141414] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                to="/memehub" 
                className={`hover:text-[#FF3C3C] transition-colors font-medium ${
                  location.pathname === '/memehub' ? 'text-[#FF3C3C]' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                MemeHub
              </Link>
              <a href="#leaderboard" className="text-gray-700 hover:text-[#FF3C3C] transition-colors font-medium">
                Leaderboard
              </a>
              <Link 
                to="/docs" 
                className={`hover:text-[#FF3C3C] transition-colors font-medium ${
                  location.pathname === '/docs' ? 'text-[#FF3C3C]' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Docs
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
                  className="flex items-center space-x-2 bg-[#141414] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
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