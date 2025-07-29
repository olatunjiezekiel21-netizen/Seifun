import React, { useState } from 'react';
import { Grid, List, Flame, Star, Filter } from 'lucide-react';
import MemeHubFilters from '../components/MemeHubFilters';
import MemeTokenGrid from '../components/MemeTokenGrid';
import TrendingStats from '../components/TrendingStats';

const MemeHub = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({});

  // Mock data for meme tokens
  const memeTokens = [
    {
      id: 1,
      name: 'SeiDoge',
      symbol: 'SDOGE',
      image: '🐕',
      score: 94,
      creator: 'dogemaster',
      price: '$0.0012',
      change24h: '+45.2%',
      volume24h: '$124K',
      marketCap: '$2.4M',
      holders: 1247,
      trending: 'up' as const,
      category: 'dogs',
      likes: 342,
      comments: 89,
      views: 1520,
      launchDate: '2 days ago',
      description: 'The ultimate doge token on Sei blockchain with community governance and automatic LP locking.'
    },
    {
      id: 2,
      name: 'MoonCat',
      symbol: 'MCAT',
      image: '🐱',
      score: 87,
      creator: 'catwhiskers',
      price: '$0.0089',
      change24h: '+23.1%',
      volume24h: '$89K',
      marketCap: '$1.8M',
      holders: 892,
      trending: 'up' as const,
      category: 'cats',
      likes: 256,
      comments: 67,
      views: 1120,
      launchDate: '5 days ago',
      description: 'Feline-powered DeFi with purr-fect tokenomics and whisker-sharp security features.'
    },
    {
      id: 3,
      name: 'PepeSei',
      symbol: 'PEPES',
      image: '🐸',
      score: 91,
      creator: 'frogforce',
      price: '$0.0156',
      change24h: '+67.8%',
      volume24h: '$156K',
      marketCap: '$3.1M',
      holders: 1689,
      trending: 'up' as const,
      category: 'frogs',
      likes: 489,
      comments: 123,
      views: 2340,
      launchDate: '1 day ago',
      description: 'The rarest Pepe on Sei with community-driven memes and deflationary mechanics.'
    },
    {
      id: 4,
      name: 'AIBot',
      symbol: 'AIBOT',
      image: '🤖',
      score: 78,
      creator: 'techguru',
      price: '$0.0234',
      change24h: '+12.8%',
      volume24h: '$67K',
      marketCap: '$1.2M',
      holders: 567,
      trending: 'up' as const,
      category: 'ai',
      likes: 178,
      comments: 45,
      views: 890,
      launchDate: '1 week ago',
      description: 'AI-powered meme generation with smart contract automation and neural network governance.'
    },
    {
      id: 5,
      name: 'DiamondHands',
      symbol: 'DIAMOND',
      image: '💎',
      score: 82,
      creator: 'hodlking',
      price: '$0.0067',
      change24h: '-5.2%',
      volume24h: '$45K',
      marketCap: '$890K',
      holders: 423,
      trending: 'down' as const,
      category: 'defi',
      likes: 134,
      comments: 28,
      views: 670,
      launchDate: '3 days ago',
      description: 'For true diamond hands only. Rewards long-term holders with increasing yields over time.'
    },
    {
      id: 6,
      name: 'RocketFrog',
      symbol: 'RFROG',
      image: '🚀',
      score: 89,
      creator: 'spacefrog',
      price: '$0.0198',
      change24h: '+89.4%',
      volume24h: '$234K',
      marketCap: '$4.2M',
      holders: 2134,
      trending: 'up' as const,
      category: 'frogs',
      likes: 567,
      comments: 156,
      views: 3450,
      launchDate: '6 hours ago',
      description: 'To the moon and beyond! Rocket-powered frog with interstellar ambitions and cosmic rewards.'
    },
    {
      id: 7,
      name: 'CyberShiba',
      symbol: 'CSHIB',
      image: '🐕‍🦺',
      score: 76,
      creator: 'cyberpunk',
      price: '$0.0045',
      change24h: '+34.7%',
      volume24h: '$78K',
      marketCap: '$1.5M',
      holders: 789,
      trending: 'up' as const,
      category: 'dogs',
      likes: 298,
      comments: 72,
      views: 1340,
      launchDate: '4 days ago',
      description: 'Cyberpunk-themed Shiba with neon aesthetics and futuristic tokenomics for the digital age.'
    },
    {
      id: 8,
      name: 'MemeLord',
      symbol: 'MLORD',
      image: '👑',
      score: 85,
      creator: 'memelord',
      price: '$0.0123',
      change24h: '+56.3%',
      volume24h: '$167K',
      marketCap: '$2.8M',
      holders: 1456,
      trending: 'up' as const,
      category: 'other',
      likes: 423,
      comments: 98,
      views: 2180,
      launchDate: '12 hours ago',
      description: 'The ultimate meme royalty token with crown-worthy features and kingdom-building mechanics.'
    }
  ];

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // Here you would typically filter the tokens based on the filters
    console.log('Filters changed:', newFilters);
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
              Meme<span className="text-[#FF6B35]">Hub</span>
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
        <MemeHubFilters onFilterChange={handleFilterChange} />

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
              {memeTokens.length} tokens found
            </div>
          </div>
        </div>

        {/* Token Grid */}
        <MemeTokenGrid tokens={memeTokens} viewMode={viewMode} />

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

export default MemeHub;