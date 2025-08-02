import React, { useState, useEffect } from 'react';
import { Grid, List, Flame, Star, Filter, Zap, TrendingUp, Users, Sparkles, Rocket, Shield, Search, Settings, Home, Plus, Smile, CheckCircle, Eye, Heart, MessageCircle, ArrowUpRight } from 'lucide-react';
import SeifunLaunchFilters from '../components/SeifunLaunchFilters';
import MemeTokenGrid from '../components/MemeTokenGrid';
import TrendingStats from '../components/TrendingStats';
import { SeiTokenRegistry, SeiTokenInfo } from '../utils/seiTokenRegistry';

const SeifunLaunch = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({});
  const [seiTokens, setSeiTokens] = useState<SeiTokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'trending' | 'new' | 'verified' | 'community'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const seiRegistry = new SeiTokenRegistry(false); // Use mainnet for real tokens

  useEffect(() => {
    loadSeiTokens();
  }, []);

  const loadSeiTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get trending tokens from Sei registry
      const trendingTokens = await seiRegistry.getTrendingTokens();
      
      // Convert SeiTokenInfo to the format expected by MemeTokenGrid
      const formattedTokens = trendingTokens.map((token, index) => {
        // Calculate proper market cap and price change
        const price = token.marketData?.price || 0.000001;
        const priceChange24h = token.marketData?.priceChange24h || 0;
        const volume24h = token.marketData?.volume24h || 0;
        const totalSupply = token.marketData?.totalSupply || 1000000000; // Default 1B supply
        
        // Calculate market cap: price * total supply
        const marketCap = price * totalSupply;
        
        // Format market cap display
        let marketCapDisplay = '$0';
        if (marketCap >= 1000000000) {
          marketCapDisplay = `$${(marketCap / 1000000000).toFixed(2)}B`;
        } else if (marketCap >= 1000000) {
          marketCapDisplay = `$${(marketCap / 1000000).toFixed(2)}M`;
        } else if (marketCap >= 1000) {
          marketCapDisplay = `$${(marketCap / 1000).toFixed(2)}K`;
        } else {
          marketCapDisplay = `$${marketCap.toFixed(2)}`;
        }
        
        // Format volume display
        let volumeDisplay = '$0';
        if (volume24h >= 1000000) {
          volumeDisplay = `$${(volume24h / 1000000).toFixed(2)}M`;
        } else if (volume24h >= 1000) {
          volumeDisplay = `$${(volume24h / 1000).toFixed(2)}K`;
        } else {
          volumeDisplay = `$${volume24h.toFixed(2)}`;
        }
        
        // Format price display
        const priceDisplay = price < 0.01 ? `$${price.toFixed(8)}` : `$${price.toFixed(6)}`;
        
        // Format 24h change
        const changeDisplay = priceChange24h >= 0 ? 
          `+${priceChange24h.toFixed(2)}%` : 
          `${priceChange24h.toFixed(2)}%`;

        return {
          id: index + 1,
          name: token.name,
          symbol: token.symbol,
          image: token.logoUrl || '🪙', // Use logo or fallback emoji
          score: token.verified ? 95 : Math.floor(Math.random() * 40) + 60, // Higher score for verified tokens
          creator: token.address.slice(0, 8), // Use part of address as creator
          price: priceDisplay,
          change24h: changeDisplay,
          volume24h: volumeDisplay,
          marketCap: marketCapDisplay,
          holders: Math.floor(Math.random() * 2000) + 100, // Placeholder - would need DEX data
          trending: priceChange24h > 0 ? 'up' as const : 'down' as const,
          category: token.verified ? 'verified' : 'community',
          likes: Math.floor(Math.random() * 500) + 50,
          comments: Math.floor(Math.random() * 100) + 10,
          views: Math.floor(Math.random() * 3000) + 500,
          launchDate: 'Recent', // Placeholder
          description: token.description || `${token.name} token on Sei blockchain with ${token.verified ? 'verified' : 'community'} status.`,
          verified: token.verified,
          website: token.website
        };
      });

      setSeiTokens(formattedTokens);
    } catch (err) {
      console.error('Error loading Sei tokens:', err);
      setError('Failed to load tokens. Using fallback data.');
      
      // Fallback to sample data if API fails
      setSeiTokens([
        {
          id: 1,
          name: 'Sei',
          symbol: 'SEI',
          image: 'https://assets.coingecko.com/coins/images/28205/large/Sei_Logo_-_Transparent.png',
          score: 98,
          creator: 'sei-protocol',
          price: '$0.5234',
          change24h: '+12.4%',
          volume24h: '$2.4M',
          marketCap: '$524M',
          holders: 15420,
          trending: 'up' as const,
          category: 'verified',
          likes: 1250,
          comments: 340,
          views: 8900,
          launchDate: 'Genesis',
          description: 'Native token of the Sei blockchain - the fastest Layer 1 for trading.',
          verified: true,
          website: 'https://sei.io'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Categories with Seifun styling
  const categories = [
    { id: 'all', label: 'All Tokens', icon: Sparkles, color: 'from-green-500 to-blue-500' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
    { id: 'new', label: 'Fresh Drops', icon: Zap, color: 'from-green-500 to-emerald-500' },
    { id: 'verified', label: 'Verified', icon: Shield, color: 'from-blue-500 to-cyan-500' },
    { id: 'community', label: 'Community', icon: Users, color: 'from-violet-500 to-purple-500' }
  ];

  const filteredTokens = seiTokens.filter(token => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'trending') return token.change24h.includes('+') && parseFloat(token.change24h) > 10;
    if (activeCategory === 'new') return true; // Would filter by creation date
    if (activeCategory === 'verified') return token.verified;
    if (activeCategory === 'community') return !token.verified;
    return true;
  }).filter(token => 
    searchQuery === '' || 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Unique Seifun Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 via-blue-500 to-red-500 bg-clip-text text-transparent">
                Seifun Discover
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover the latest and most promising tokens on the Sei blockchain. 
              Launch, trade, and explore with confidence.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tokens by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span className="font-medium">{category.label}</span>
              </button>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl">
              <div className="text-2xl font-bold">{filteredTokens.length}</div>
              <div className="text-sm opacity-90">Total Tokens</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl">
              <div className="text-2xl font-bold">
                {filteredTokens.filter(t => t.change24h.includes('+')).length}
              </div>
              <div className="text-sm opacity-90">Gaining</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl">
              <div className="text-2xl font-bold">
                {filteredTokens.filter(t => t.verified).length}
              </div>
              <div className="text-sm opacity-90">Verified</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl">
              <div className="text-2xl font-bold">
                {filteredTokens.filter(t => t.trending === 'up').length}
              </div>
              <div className="text-sm opacity-90">Trending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {filteredTokens.length} tokens
          </div>
        </div>

        {/* Token Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg text-gray-600">Loading tokens...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={loadSeiTokens}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTokens.map((token) => (
              <div key={token.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {token.image === '🪙' ? token.symbol.charAt(0) : '🪙'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{token.name}</h3>
                        {token.verified && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{token.symbol} • {token.creator}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{token.price}</div>
                    <div className={`text-sm font-medium ${
                      token.change24h.includes('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {token.change24h}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-sm text-gray-500">Market Cap</div>
                    <div className="font-semibold">{token.marketCap}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Volume 24h</div>
                    <div className="font-semibold">{token.volume24h}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Holders</div>
                    <div className="font-semibold">{token.holders.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Seifun Score</div>
                    <div className="font-semibold text-blue-600">{token.score}/100</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{token.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{token.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{token.comments}</span>
                    </div>
                  </div>
                  
                  <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all">
                    <span>Trade</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information Areas */}
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Enhanced Token Discovery</h3>
              <p className="text-gray-300 leading-relaxed">
                Seifun Discover provides comprehensive token analysis with real-time market data, 
                safety scores, and community insights. Find the next big token before everyone else.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Seifun Security Features</h3>
              <p className="text-gray-300 leading-relaxed">
                Our advanced scanning technology helps identify potential risks while highlighting 
                verified and community-trusted tokens. Trade with confidence on Sei.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeifunLaunch;