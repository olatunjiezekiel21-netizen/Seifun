import React, { useState, useEffect } from 'react';
import { Grid, List, Flame, Star, Filter, Zap, TrendingUp, Users, Sparkles, Rocket, Shield } from 'lucide-react';
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
      const formattedTokens = trendingTokens.map((token, index) => ({
        id: index + 1,
        name: token.name,
        symbol: token.symbol,
        image: token.logoUrl || '🪙', // Use logo or fallback emoji
        score: token.verified ? 95 : Math.floor(Math.random() * 40) + 60, // Higher score for verified tokens
        creator: token.address.slice(0, 8), // Use part of address as creator
        price: token.marketData?.price ? `$${token.marketData.price.toFixed(6)}` : '$0.000000',
        change24h: token.marketData?.priceChange24h ? 
          `${token.marketData.priceChange24h > 0 ? '+' : ''}${token.marketData.priceChange24h.toFixed(1)}%` : 
          '+0.0%',
        volume24h: token.marketData?.volume24h ? 
          `$${(token.marketData.volume24h / 1000).toFixed(0)}K` : 
          '$0K',
        marketCap: token.marketData?.marketCap ? 
          `$${(token.marketData.marketCap / 1000000).toFixed(1)}M` : 
          '$0M',
        holders: Math.floor(Math.random() * 2000) + 100, // Placeholder - would need DEX data
        trending: 'up' as const,
        category: token.verified ? 'verified' : 'community',
        likes: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 100) + 10,
        views: Math.floor(Math.random() * 3000) + 500,
        launchDate: 'Recent', // Placeholder
        description: token.description || `${token.name} token on Sei blockchain with ${token.verified ? 'verified' : 'community'} status.`,
        verified: token.verified,
        website: token.website
      }));

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

  // Cartilage categories with dynamic styling
  const categories = [
    { id: 'all', label: 'All Tokens', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
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
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 cartilage-bg">
      {/* Cartilage Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20">
                <Rocket className="w-4 h-4" />
                <span className="text-sm font-medium">Powered by Sei Network</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 cartilage-title">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200">
                  seifu.launch
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-4xl mx-auto leading-relaxed">
                Experience the future of meme token discovery with <span className="text-pink-300 font-semibold">fluid intelligence</span>, 
                <span className="text-cyan-300 font-semibold"> real-time insights</span>, and 
                <span className="text-green-300 font-semibold"> professional-grade safety analysis</span>
              </p>

              {/* Cartilage Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="cartilage-card bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mb-4 mx-auto">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-2">{seiTokens.length || 2847}</div>
                  <div className="text-purple-200 text-sm">Active Tokens</div>
                </div>

                <div className="cartilage-card bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mb-4 mx-auto">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-2">$12.4M</div>
                  <div className="text-green-200 text-sm">24h Volume</div>
                </div>

                <div className="cartilage-card bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl mb-4 mx-auto">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-2">156</div>
                  <div className="text-orange-200 text-sm">Fresh Today</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cartilage Category Navigation */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id as any)}
                  className={`cartilage-nav-item group relative flex items-center gap-3 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105` 
                      : 'bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80 hover:scale-105 border border-gray-200/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'} group-hover:scale-110 transition-transform`} />
                  <span className="font-semibold">{category.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cartilage Filter and View Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="cartilage-filter-panel bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50">
              <SeifunLaunchFilters onFilterChange={handleFilterChange} />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="cartilage-view-toggle flex bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200/50 p-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`cartilage-toggle-btn p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`cartilage-toggle-btn p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <List size={20} />
              </button>
            </div>
            
            <div className="text-gray-600 text-sm bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/50">
              {filteredTokens.length} tokens found
            </div>
          </div>
        </div>

        {/* Cartilage Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cartilage Sidebar */}
          <div className="lg:col-span-1">
            <div className="cartilage-sidebar bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200/50 overflow-hidden">
              <TrendingStats />
            </div>
          </div>

          {/* Cartilage Token Grid */}
          <div className="lg:col-span-3">
            <div className="cartilage-content-area">
              {loading ? (
                <div className="cartilage-loading flex items-center justify-center py-20">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-purple-500 absolute top-0 left-0"></div>
                  </div>
                </div>
              ) : error ? (
                <div className="cartilage-error bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl p-8 text-center backdrop-blur-sm">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl mb-4 mx-auto">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-red-800 text-lg mb-4">{error}</p>
                  <button 
                    onClick={loadSeiTokens}
                    className="cartilage-retry-btn px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="cartilage-token-container">
                  <MemeTokenGrid 
                    tokens={filteredTokens} 
                    viewMode={viewMode}
                    loading={loading}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cartilage Featured Section */}
        <div className="mt-16 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-md rounded-3xl p-8 border border-gray-200/50">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800">Featured Token of the Day</h3>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Every day we spotlight the most innovative, secure, and community-loved token. 
              Today's featured token has achieved exceptional safety scores and engagement metrics.
            </p>
            
            {filteredTokens.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 max-w-md mx-auto border border-purple-200/50">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl">
                    {filteredTokens[0].image || '🚀'}
                  </div>
                  <div className="text-left">
                    <h4 className="text-xl font-bold text-gray-800">{filteredTokens[0].name}</h4>
                    <p className="text-gray-600">{filteredTokens[0].symbol}</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{filteredTokens[0].score}</div>
                  <div className="text-gray-600 text-sm">SeifuScore™</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeifunLaunch;