import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  TrendingUp, 
  Star, 
  Eye, 
  Users, 
  DollarSign,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Minus,
  MessageCircle,
  TrendingDown,
  Wallet,
  History,
  Activity,
  Settings,
  ExternalLink
} from 'lucide-react';
import { unifiedTokenService, TokenData } from '../services/UnifiedTokenService';
import { realPortfolioService, RealPortfolioData, RealTransaction } from '../services/RealPortfolioService';
import { realTimePriceService, TokenPrice, PriceUpdate } from '../services/RealTimePriceService';
import { useNavigate } from 'react-router-dom';

const SeifunLaunch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const navigate = useNavigate();

  // Real portfolio and price data
  const [portfolio, setPortfolio] = useState<RealPortfolioData | null>(null);
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [transactions, setTransactions] = useState<RealTransaction[]>([]);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'portfolio' | 'trading' | 'history'>('portfolio');
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const [isTrading, setIsTrading] = useState(false);

  const categories = [
    { id: 'all', name: 'All Tokens', icon: Star },
    { id: 'trending', name: 'Trending', icon: TrendingUp },
    { id: 'new', name: 'New Launches', icon: Eye },
    { id: 'top', name: 'Top Performers', icon: DollarSign },
    { id: 'community', name: 'Community', icon: Users },
  ];

  useEffect(() => {
    initializeServices();
    loadTokens();
    
    // Cleanup on unmount
    return () => {
      realTimePriceService.stop();
    };
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize portfolio service with user's private key
      const portfolioReady = await realPortfolioService.initialize();
      if (portfolioReady) {
        setIsConnected(true);
        setWalletAddress(realPortfolioService.getWalletAddress() || '');
        await loadPortfolio();
        await loadTransactionHistory();
      }

      // Initialize price service
      await realTimePriceService.initialize();
      
      // Subscribe to price updates
      const unsubscribe = realTimePriceService.subscribeToPriceUpdates((update) => {
        console.log('Price update:', update);
        // Refresh portfolio when prices change
        loadPortfolio();
      });

      // Load initial prices
      const initialPrices = await realTimePriceService.getAllPrices();
      setPrices(initialPrices);

    } catch (error) {
      console.error('Failed to initialize services:', error);
      setError('Failed to connect to Sei EVM testnet');
    }
  };

  const loadTokens = async () => {
    try {
      setIsLoading(true);
      await unifiedTokenService.initialize();
      const all = await unifiedTokenService.getAllTokens();
      setTokens(all);
    } catch (e: any) {
      setError(e?.message || 'Failed to load tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPortfolio = async () => {
    try {
      setIsPortfolioLoading(true);
      const portfolioData = await realPortfolioService.getRealPortfolio();
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setIsPortfolioLoading(false);
    }
  };

  const loadTransactionHistory = async () => {
    try {
      const txHistory = await realPortfolioService.getRealTransactionHistory();
      setTransactions(txHistory);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    }
  };

  const handleTrade = async () => {
    if (!selectedToken || !tradeAmount || isTrading) return;
    
    setIsTrading(true);
    try {
      // Execute real trade on Sei EVM testnet
      const result = await realPortfolioService.executeRealTrade(
        selectedToken.address,
        tradeAmount,
        tradeType === 'buy'
      );

      if (result.success) {
        alert(`✅ ${tradeType.toUpperCase()} order executed successfully!\nTransaction Hash: ${result.hash}`);
        
        // Refresh portfolio and transaction history
        await loadPortfolio();
        await loadTransactionHistory();
        
        // Reset form
        setTradeAmount('');
        setSelectedToken(null);
        setShowTradeModal(false);
      } else {
        alert(`❌ Trade failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Trade failed: ${error}`);
    } finally {
      setIsTrading(false);
    }
  };

  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                          (selectedCategory === 'trending' && (token.volume24h || 0) > 1000) ||
                          (selectedCategory === 'new' && (Date.now() - token.createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000) ||
                          (selectedCategory === 'top' && (token.marketCap || 0) > 1000000) ||
                          (selectedCategory === 'community' && token.holders > 1000);
    return matchesSearch && matchesCategory;
  });

  const getTokenPrice = (symbol: string): TokenPrice | null => {
    return prices.find(p => p.symbol === symbol) || null;
  };

  const getPriceChangeColor = (change: number): string => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getPriceChangeIcon = (change: number) => {
    return change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />;
  };

  return (
    <div className="app-bg-primary min-h-screen">
      {/* Header with Portfolio Overview */}
      <div className="app-bg-secondary border-b app-border">
        <div className="app-container py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="app-heading-xl app-text-primary mb-2">
                Seifun.launch
              </h1>
              <p className="app-text-lg max-w-3xl">
                Real-time DeFi trading on Sei EVM testnet with live portfolio tracking
              </p>
            </div>
            
            {/* Wallet Connection Status */}
            <div className="text-right">
              {isConnected ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm font-medium">Disconnected</span>
                </div>
              )}
              {walletAddress && (
                <div className="text-xs text-gray-500 mt-1">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
              )}
            </div>
          </div>

          {/* Portfolio Summary Cards */}
          {portfolio && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Portfolio Value</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${portfolio.totalValue.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">SEI Balance</p>
                    <p className="text-xl font-semibold">
                      {parseFloat(portfolio.seiBalance).toFixed(4)} SEI
                    </p>
                    <p className="text-sm text-gray-500">
                      ${(parseFloat(portfolio.seiBalance) * 0.25).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${getPriceChangeColor(-6.88)}`}>
                      -6.88%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">USDC Balance</p>
                    <p className="text-xl font-semibold">
                      {parseFloat(portfolio.usdcBalance).toFixed(2)} USDC
                    </p>
                    <p className="text-sm text-gray-500">
                      ${parseFloat(portfolio.usdcBalance).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-500">
                      +0.10%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="app-container py-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'portfolio' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>Portfolio</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('trading')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'trading' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Trading</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <History className="w-4 h-4" />
              <span>History</span>
            </div>
          </button>
        </div>

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Holdings</h2>
              <button
                onClick={loadPortfolio}
                disabled={isPortfolioLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isPortfolioLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {isPortfolioLoading ? (
              <div className="text-center py-12">
                <div className="app-text-secondary">Loading portfolio...</div>
              </div>
            ) : portfolio ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolio.tokens.map((token) => {
                  const priceData = getTokenPrice(token.symbol);
                  const suggestion = realTimePriceService.getTradingSuggestion(token.symbol, token.change24h || 0);
                  
                  return (
                    <div key={token.symbol} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {token.symbol.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{token.symbol}</h3>
                            <p className="text-sm text-gray-500">
                              Balance: {parseFloat(token.balance).toFixed(4)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ${token.value?.toFixed(2) || '0.00'}
                          </div>
                          <div className={`text-sm ${getPriceChangeColor(token.change24h || 0)}`}>
                            {token.change24h && token.change24h >= 0 ? '+' : ''}{token.change24h?.toFixed(2) || '0.00'}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">${priceData?.price.toFixed(6) || '0.000000'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">24h Change:</span>
                          <span className={`font-medium ${getPriceChangeColor(token.change24h || 0)}`}>
                            {token.change24h && token.change24h >= 0 ? '+' : ''}{token.change24h?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-sm text-gray-700">{suggestion}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="app-text-secondary">Failed to load portfolio</div>
              </div>
            )}
          </div>
        )}

        {/* Trading Tab */}
        {activeTab === 'trading' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Market Overview</h2>
              <div className="text-sm text-gray-500">
                Last updated: {prices[0]?.lastUpdated.toLocaleTimeString() || 'Never'}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="app-search-bar">
                <Search className="app-search-icon" />
                <input
                  type="text"
                  placeholder="Search tokens by name or symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="app-search-input"
                />
              </div>

              <div className="app-category-tabs">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`app-category-tab ${
                        selectedCategory === category.id ? 'active' : ''
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Token Grid */}
            {!isLoading && !error && (
              <div className="app-token-grid">
                {filteredTokens.map((token) => {
                  const priceData = getTokenPrice(token.symbol);
                  
                  return (
                    <div key={token.address} className="app-token-card">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={token.tokenImage || '/Seifu.png'}
                            alt={token.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold app-text-primary">{token.name}</h3>
                              {token.verified && (
                                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-sm app-text-muted">{token.symbol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold app-text-primary">
                            ${priceData?.price.toFixed(6) || '0.000000'}
                          </div>
                          <div className={`text-sm ${getPriceChangeColor(priceData?.change24h || 0)}`}>
                            {priceData?.change24h && priceData.change24h >= 0 ? '+' : ''}{priceData?.change24h?.toFixed(2) || '0.00'}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="app-text-muted">Market Cap</div>
                          <div className="app-text-primary">${((token.marketCap || 0) / 1000000).toFixed(2)}M</div>
                        </div>
                        <div>
                          <div className="app-text-muted">Volume 24h</div>
                          <div className="app-text-primary">${((token.volume24h || 0) / 1000).toFixed(0)}K</div>
                        </div>
                        <div>
                          <div className="app-text-muted">Holders</div>
                          <div className="app-text-primary">{token.holders.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="app-text-muted">Liquidity</div>
                          <div className="app-text-primary">${((token.liquidity || 0) / 1000).toFixed(0)}K</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t app-border">
                        <p className="text-sm app-text-secondary mb-3">Created {token.createdAt.toLocaleDateString()}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs app-text-muted">
                            Address: {token.address.slice(0, 6)}...{token.address.slice(-4)}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedToken(token);
                                setShowTradeModal(true);
                              }}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            >
                              Trade
                            </button>
                            <button
                              onClick={() => navigate(`/app/charts?token=${token.address}`)}
                              className="app-btn app-btn-primary text-sm"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <button
                onClick={loadTransactionHistory}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="app-text-secondary">No transactions found</div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hash</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((tx, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              tx.type === 'buy' ? 'bg-green-100 text-green-800' :
                              tx.type === 'sell' ? 'bg-red-100 text-red-800' :
                              tx.type === 'stake' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {tx.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {tx.token}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tx.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              tx.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {tx.timestamp.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <a 
                              href={`https://sei-testnet.evmscan.io/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                            >
                              <span>{tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trade Modal */}
      {showTradeModal && selectedToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Trade {selectedToken.symbol}</h3>
              <button
                onClick={() => setShowTradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                    tradeType === 'buy' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                    tradeType === 'sell' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Sell
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTradeModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTrade}
                  disabled={!tradeAmount || isTrading}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isTrading ? 'Executing...' : `${tradeType.toUpperCase()} ${selectedToken.symbol}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeifunLaunch;