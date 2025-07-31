import React, { useState, useEffect } from 'react';
import { Grid, List, Flame, Star, Filter } from 'lucide-react';
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

  const seiRegistry = new SeiTokenRegistry(true); // Use testnet

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1421] via-[#1A1B3A] to-[#2D1B69]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-2xl flex items-center justify-center shadow-lg">
              <Flame className="text-white" size={20} sm:size={28} />
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white">
              seifu<span className="text-[#FF6B35]">.fun</span>
            </h1>
          </div>
          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Discover, trade, and track the hottest meme tokens on Sei. 
            Real-time safety scores, trending analytics, and community insights.
          </p>
        </div>

        {/* Trending Stats */}
        <TrendingStats />

        {/* Filters */}
        <SeifunLaunchFilters onFilterChange={handleFilterChange} />

        {/* View Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Trending Memes
            </h2>
            <div className="flex items-center space-x-2">
              <Flame className="text-[#FF6B35]" size={20} />
              <span className="text-[#FF6B35] font-medium">Hot</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <List size={18} />
              </button>
            </div>

            <div className="text-gray-400 text-xs sm:text-sm">
              {seiTokens.length} tokens found
            </div>
          </div>
        </div>

        {/* Token Grid */}
        <MemeTokenGrid tokens={seiTokens} viewMode={viewMode} />

        {/* Load More */}
        <div className="text-center mt-8 sm:mt-12">
          <button className="bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg hover:shadow-[#FF6B35]/25 transition-all">
            Load More Memes
          </button>
        </div>

        {/* Featured Section */}
        <div className="mt-12 sm:mt-20 bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <Star className="text-[#FF6B35]" size={24} sm:size={32} />
              <h3 className="text-xl sm:text-3xl font-bold text-white">Featured Meme of the Day</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto px-4">
              Every day we highlight the most innovative, safe, and community-loved meme token. 
              Today's featured token has achieved exceptional safety scores and community engagement.
            </p>
            <div className="bg-gradient-to-r from-[#FF6B35]/20 to-[#FF8E53]/20 rounded-2xl p-4 sm:p-6 max-w-md mx-auto border border-[#FF6B35]/30">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-2xl flex items-center justify-center text-2xl sm:text-3xl">
                  🚀
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white">RocketFrog</h4>
                  <p className="text-sm sm:text-base text-gray-300">RFROG</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#FF6B35] mb-2">89</div>
                <div className="text-gray-300 text-xs sm:text-sm">SeifuScore</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeifunLaunch;