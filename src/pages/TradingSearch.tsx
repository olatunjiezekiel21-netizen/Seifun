import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  TrendingUp,
  BarChart3,
  Activity,
  ExternalLink,
  Loader2,
  AlertCircle,
  ChevronRight,
  DollarSign,
  Volume2
} from 'lucide-react';
import { tradingDataService, TokenPair } from '../utils/tradingDataService';

interface TradingSearchProps {}

const TradingSearch: React.FC<TradingSearchProps> = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TokenPair[]>([]);
  const [trendingPairs, setTrendingPairs] = useState<TokenPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState('ethereum');

  // Auto-search if token parameter is provided
  const tokenParam = searchParams.get('token');

  useEffect(() => {
    if (tokenParam) {
      setSearchQuery(tokenParam);
      handleSearch(tokenParam);
    } else {
      loadTrendingPairs();
    }
  }, [tokenParam]);

  const supportedChains = [
    { id: 'ethereum', name: 'Ethereum', icon: '⟠' },
    { id: 'bsc', name: 'BSC', icon: '🟡' },
    { id: 'polygon', name: 'Polygon', icon: '🟣' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔵' },
    { id: 'optimism', name: 'Optimism', icon: '🔴' },
    { id: 'base', name: 'Base', icon: '🔷' },
    { id: 'avalanche', name: 'Avalanche', icon: '🔺' },
    { id: 'sei', name: 'Sei', icon: '⚡' }
  ];

  const loadTrendingPairs = async () => {
    try {
      setLoading(true);
      const trending = await tradingDataService.getTrendingPairs(selectedChain, 20);
      setTrendingPairs(trending);
    } catch (err) {
      console.error('Error loading trending pairs:', err);
      setError('Failed to load trending pairs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      // Search for token pairs by token address
      const pairs = await tradingDataService.getTokenPairsForToken(selectedChain, searchTerm.trim());
      
      if (pairs.length === 0) {
        setError('No trading pairs found for this token. It may not be listed on any DEX yet.');
      } else {
        setSearchResults(pairs);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please check the token address and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePairClick = (pair: TokenPair) => {
    navigate(`/app/trading/${pair.chainId}/${pair.pairAddress}`);
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Recently';
  };

  const getPriceChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="min-h-screen app-bg-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="app-heading-lg mb-4">Token Trading Search</h1>
          <p className="app-text-muted max-w-2xl mx-auto">
            Search for any token to view real-time trading data, price charts, and market analytics
          </p>
        </div>

        {/* Chain Selector */}
        <div className="app-card p-6 mb-6">
          <h3 className="app-heading-sm mb-4">Select Network</h3>
          <div className="flex flex-wrap gap-3">
            {supportedChains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => {
                  setSelectedChain(chain.id);
                  if (searchResults.length > 0) {
                    handleSearch();
                  } else {
                    loadTrendingPairs();
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  selectedChain === chain.id
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'app-bg-secondary border-gray-200 app-text-muted hover:app-bg-tertiary'
                }`}
              >
                <span className="text-lg">{chain.icon}</span>
                <span className="font-medium">{chain.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Section */}
        <div className="app-card p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter token contract address (0x...)"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg app-bg-secondary app-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !searchQuery.trim()}
              className="flex items-center space-x-2 px-6 py-3 app-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span>Search</span>
            </button>
          </div>
          
          {tokenParam && (
            <div className="mt-3 text-sm app-text-muted">
              Searching for token: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{tokenParam}</code>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="app-card p-6 mb-8">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="app-card p-6 mb-8">
            <h2 className="app-heading-md mb-6">Trading Pairs Found</h2>
            <div className="space-y-4">
              {searchResults.map((pair, index) => (
                <button
                  key={`${pair.pairAddress}-${index}`}
                  onClick={() => handlePairClick(pair)}
                  className="w-full p-4 app-bg-secondary rounded-lg border border-gray-200 hover:app-bg-tertiary hover:border-blue-200 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {pair.baseToken.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium app-text-primary text-lg">
                          {pair.baseToken.symbol}/{pair.quoteToken.symbol}
                        </div>
                        <div className="text-sm app-text-muted">
                          {pair.baseToken.name} • {pair.dexId.toUpperCase()}
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-xs app-text-muted">
                            <DollarSign className="w-3 h-3" />
                            <span>${tradingDataService.formatPrice(pair.priceUsd)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs app-text-muted">
                            <Volume2 className="w-3 h-3" />
                            <span>${tradingDataService.formatNumber(pair.volume24h)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getPriceChangeColor(pair.priceChange24h)}`}>
                        {tradingDataService.formatPercentage(pair.priceChange24h)}
                      </div>
                      <div className="text-xs app-text-muted">24h change</div>
                      <div className="flex items-center space-x-1 mt-2 text-blue-500">
                        <span className="text-xs">View Chart</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending Pairs */}
        {trendingPairs.length > 0 && searchResults.length === 0 && (
          <div className="app-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="app-heading-md">Trending on {selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)}</h2>
              <button
                onClick={loadTrendingPairs}
                className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
              >
                <Activity className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingPairs.map((pair, index) => (
                <button
                  key={`${pair.pairAddress}-${index}`}
                  onClick={() => handlePairClick(pair)}
                  className="p-4 app-bg-secondary rounded-lg border border-gray-200 hover:app-bg-tertiary hover:border-blue-200 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs app-text-muted">#{index + 1}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {pair.dexId.toUpperCase()}
                      </span>
                    </div>
                    <div className={`text-sm font-medium ${getPriceChangeColor(pair.priceChange24h)}`}>
                      {tradingDataService.formatPercentage(pair.priceChange24h)}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="font-medium app-text-primary">
                      {pair.baseToken.symbol}/{pair.quoteToken.symbol}
                    </div>
                    <div className="text-sm app-text-muted">
                      ${tradingDataService.formatPrice(pair.priceUsd)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs app-text-muted">
                    <div>Vol: ${tradingDataService.formatNumber(pair.volume24h)}</div>
                    <div>Liq: ${tradingDataService.formatNumber(pair.liquidity.usd)}</div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-center text-blue-500 text-xs">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    <span>View Trading Data</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && searchResults.length === 0 && trendingPairs.length === 0 && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="app-heading-sm mb-2">Searching Trading Data</h3>
            <p className="app-text-muted">Finding the best trading pairs...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && searchResults.length === 0 && trendingPairs.length === 0 && !error && searchQuery && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="app-heading-sm mb-2">No Trading Data Found</h3>
            <p className="app-text-muted mb-4">
              We couldn't find any trading pairs for this token on {selectedChain}.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                loadTrendingPairs();
              }}
              className="app-button-secondary"
            >
              Browse Trending Pairs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingSearch;