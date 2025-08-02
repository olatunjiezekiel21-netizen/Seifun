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

  // Categories with professional styling
  const categories = [
    { id: 'all', label: 'All Tokens', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { id: 'new', label: 'Fresh Drops', icon: Zap, color: 'from-purple-500 to-pink-500' },
    { id: 'verified', label: 'Verified', icon: Shield, color: 'from-blue-500 to-indigo-500' },
    { id: 'community', label: 'Community', icon: Users, color: 'from-orange-500 to-red-500' }
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
    <div className="min-h-screen sei-bg-primary">
      {/* Professional Header */}
      <div className="sei-bg-secondary border-b sei-border">
        <div className="sei-container py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <h1 className="sei-heading-xl sei-text-primary">
                Seifun.launch
              </h1>
            </div>
            <p className="sei-text-lg max-w-2xl mx-auto">
              Discover the latest and most promising tokens on the Sei blockchain. 
              Launch, trade, and explore with confidence.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="sei-search-bar">
              <Search className="sei-search-icon" />
              <input
                type="text"
                placeholder="Search tokens by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sei-search-input"
              />
            </div>
          </div>

          {/* Category Navigation */}
          <div className="sei-category-tabs">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as any)}
                className={`sei-category-tab ${
                  activeCategory === category.id ? 'active' : ''
                }`}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="sei-container py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 sei-text-secondary">Loading tokens...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="sei-text-secondary mb-4">{error}</div>
            <button 
              onClick={loadSeiTokens}
              className="sei-btn sei-btn-primary"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="mb-8">
              <TrendingStats tokens={filteredTokens} />
            </div>

            {/* Token Grid */}
            <div className="sei-token-grid">
              {filteredTokens.map((token) => (
                <div key={token.id} className="sei-token-card">
                  <div className="sei-token-info">
                    <div className="sei-token-icon">
                      {token.symbol.charAt(0)}
                    </div>
                    <div className="sei-token-details">
                      <div className="sei-token-name">{token.name}</div>
                      <div className="sei-token-symbol">{token.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="sei-token-change positive">+{token.score}</div>
                      <div className="sei-text-muted text-xs">Score</div>
                    </div>
                  </div>
                  
                  <div className="sei-token-stats">
                    <div className="sei-token-stat">
                      <span className="sei-token-stat-label">Price</span>
                      <span className="sei-token-stat-value">{token.price}</span>
                    </div>
                    <div className="sei-token-stat">
                      <span className="sei-token-stat-label">24h</span>
                      <span className={`sei-token-change ${token.trending === 'up' ? 'positive' : 'negative'}`}>
                        {token.change24h}
                      </span>
                    </div>
                    <div className="sei-token-stat">
                      <span className="sei-token-stat-label">Market Cap</span>
                      <span className="sei-token-stat-value">{token.marketCap}</span>
                    </div>
                    <div className="sei-token-stat">
                      <span className="sei-token-stat-label">Volume</span>
                      <span className="sei-token-stat-value">{token.volume24h}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTokens.length === 0 && (
              <div className="text-center py-12">
                <div className="sei-text-secondary">No tokens found matching your criteria.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SeifunLaunch;