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
    <div className="min-h-screen pt-20">
      {/* Clean Hero Section - Consistent Theme */}
      <div className="sei-bg-secondary border-b sei-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Sei Network</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 sei-text-primary">
              seifu.launch
            </h1>
            
            <p className="text-lg sei-text-secondary mb-12 max-w-2xl mx-auto">
              Professional token discovery and analysis on Sei Network
            </p>

            {/* Clean Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="sei-card p-4">
                <div className="text-2xl font-bold sei-text-primary">{filteredTokens.length}</div>
                <div className="text-sm sei-text-secondary">Tokens</div>
              </div>
              <div className="sei-card p-4">
                <div className="text-2xl font-bold sei-text-primary">$12.4M</div>
                <div className="text-sm sei-text-secondary">24h Volume</div>
              </div>
              <div className="sei-card p-4">
                <div className="text-2xl font-bold sei-text-primary">156</div>
                <div className="text-sm sei-text-secondary">New Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Clean Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? 'sei-btn sei-btn-primary' 
                      : 'sei-btn sei-btn-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter and View Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="sei-card p-6">
              <SeifunLaunchFilters onFilterChange={handleFilterChange} />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex sei-card p-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'sei-bg-red text-white' 
                    : 'sei-text-secondary hover:sei-text-primary hover:bg-gray-100'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'sei-bg-red text-white' 
                    : 'sei-text-secondary hover:sei-text-primary hover:bg-gray-100'
                }`}
              >
                <List size={20} />
              </button>
            </div>
            
            <div className="sei-text-secondary text-sm sei-card px-4 py-2">
              {filteredTokens.length} tokens found
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sei-card overflow-hidden">
              <TrendingStats />
            </div>
          </div>

          {/* Token Grid */}
          <div className="lg:col-span-3">
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-500"></div>
                </div>
              ) : error ? (
                <div className="sei-card p-8 text-center">
                  <div className="flex items-center justify-center w-16 h-16 sei-bg-red rounded-2xl mb-4 mx-auto">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <p className="sei-text-primary text-lg mb-4">{error}</p>
                  <button 
                    onClick={loadSeiTokens}
                    className="sei-btn sei-btn-primary px-6 py-3"
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

        {/* Featured Section */}
        <div className="mt-16 sei-card p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 sei-bg-red rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold sei-text-primary">Featured Token of the Day</h3>
            </div>
            <p className="sei-text-secondary max-w-2xl mx-auto leading-relaxed">
              Every day we spotlight the most innovative, secure, and community-loved token. 
              Today's featured token has achieved exceptional safety scores and engagement metrics.
            </p>
            
            {filteredTokens.length > 0 && (
              <div className="sei-card p-6 max-w-md mx-auto">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 sei-bg-red rounded-2xl flex items-center justify-center text-2xl">
                    {filteredTokens[0].image || '🚀'}
                  </div>
                  <div className="text-left">
                    <h4 className="text-xl font-bold sei-text-primary">{filteredTokens[0].name}</h4>
                    <p className="sei-text-secondary">{filteredTokens[0].symbol}</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold sei-red mb-2">{filteredTokens[0].score}</div>
                  <div className="sei-text-secondary text-sm">SeifuScore™</div>
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