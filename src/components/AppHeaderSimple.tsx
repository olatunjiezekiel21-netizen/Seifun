import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wallet } from 'lucide-react';

const AppHeaderSimple = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
              to="/app/seilist"
              className={`app-nav-link ${isActive('/app/seilist') ? 'active' : ''}`}
            >
              SeiList
            </Link>
            <Link 
              to="/app/docs" 
              className={`app-nav-link ${isActive('/app/docs') ? 'active' : ''}`}
            >
              Docs
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Simple Connect Button */}
            <button className="app-btn app-btn-primary">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </button>

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
                to="/app/seilist"
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive('/app/seilist') ? 'app-bg-secondary app-text-primary' : 'app-text-secondary hover:app-bg-secondary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                SeiList
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeaderSimple;