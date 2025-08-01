import React, { useState, useEffect } from 'react';
import { Grid, List, Flame, Star, Filter, Zap, TrendingUp, Users, Sparkles, Rocket, Shield, Search, Settings, Home, Plus, Smile, CheckCircle } from 'lucide-react';
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

  // Categories with morphistic styling
  const categories = [
    { id: 'all', label: 'All Tokens', icon: Sparkles, color: 'from-sei-logo-primary to-sei-logo-secondary' },
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
    <div className="min-h-screen sei-dark-bg">
      {/* Jupiter Pro-inspired Header */}
      <div className="sei-dark-surface border-b sei-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Status Bar */}
          <div className="flex justify-between items-center text-sm sei-dark-text-muted mb-4">
            <span>7:01</span>
            <div className="flex items-center space-x-2">
              <span>4G</span>
              <span>WiFi</span>
              <span>Battery</span>
            </div>
          </div>
          
          {/* Browser Bar */}
          <div className="flex items-center space-x-2 bg-sei-dark-card rounded-lg p-2 mb-4">
            <Home className="w-4 h-4 sei-dark-text-muted" />
            <span className="flex-1 text-sm sei-dark-text">seifun.launch/pro?tab=cooking</span>
            <Plus className="w-4 h-4 sei-dark-text-muted" />
            <Smile className="w-4 h-4 sei-dark-text-muted" />
          </div>
          
          {/* Main Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 sei-morphistic-gradient rounded-full flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sei-dark-text-muted">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                  </svg>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sei-dark-text-muted" />
                  <input
                    type="text"
                    placeholder="Search tokens..."
                    className="pl-10 pr-4 py-2 bg-sei-dark-card border sei-dark-border rounded-lg text-sm sei-dark-text focus:outline-none focus:border-sei-logo-primary"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Settings className="w-5 h-5 sei-dark-text-muted" />
              <button className="sei-btn-morphistic">
                Connect
              </button>
            </div>
          </div>
          
          {/* Market Data Bar */}
          <div className="flex items-center space-x-6 mt-4 text-sm">
            <div className="sei-dark-text">
              <span className="sei-dark-text-muted">SOL</span> $166.77
            </div>
            <div className="sei-dark-text">
              <span className="sei-dark-text-muted">JUP</span> $0.46392
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sei-dark-surface border-b sei-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8">
            <button className="px-4 py-3 text-sm font-medium sei-dark-text bg-green-500 text-black rounded-lg">
              Cooking
            </button>
            <button className="px-4 py-3 text-sm font-medium sei-dark-text-muted hover:sei-dark-text">
              Launchpads
              <span className="ml-1 text-xs bg-sei-dark-card px-1 rounded">v2</span>
            </button>
            <button className="px-4 py-3 text-sm font-medium sei-dark-text-muted hover:sei-dark-text">
              AlphaScan
            </button>
            <button className="px-4 py-3 text-sm font-medium sei-dark-text-muted hover:sei-dark-text">
              Stocks
            </button>
            <div className="flex-1"></div>
            <div className="w-4 h-4 sei-dark-text-muted">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="sei-dark-surface border-b sei-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select className="bg-sei-dark-card border sei-dark-border rounded px-3 py-1 text-sm sei-dark-text">
                <option>24h</option>
              </select>
              <button className="flex items-center space-x-2 bg-sei-dark-card border sei-dark-border rounded px-3 py-1 text-sm sei-dark-text">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="sei-btn-morphistic flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>BUY</span>
              </button>
              <div className="flex items-center space-x-2 bg-sei-dark-card border sei-dark-border rounded px-3 py-1">
                <span className="text-sm sei-dark-text">0.01</span>
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="sei-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Token List Header */}
          <div className="sei-info-area mb-6">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Token</span>
              </div>
              <div>Price/%Δ</div>
              <div>MC/FD</div>
              <div>Buy</div>
            </div>
          </div>

          {/* Token List */}
          <div className="space-y-2">
            {filteredTokens.slice(0, 7).map((token, index) => (
              <div key={token.id} className="sei-dark-card p-4 rounded-lg border sei-dark-border">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="flex items-center space-x-3">
                    <Star className="w-4 h-4 sei-dark-text-muted" />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {token.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="sei-dark-text font-medium">{token.symbol}</div>
                      <div className="text-xs sei-dark-text-muted">{index === 0 ? '33m' : index === 1 ? '247d' : index === 2 ? '19h' : index === 3 ? '80d' : index === 4 ? '18h' : index === 5 ? '73d' : '15h'}</div>
                    </div>
                    <div className="flex space-x-1">
                      <Search className="w-3 h-3 sei-dark-text-muted" />
                      {index === 1 && <CheckCircle className="w-3 h-3 text-green-500" />}
                      {index === 5 && <CheckCircle className="w-3 h-3 text-green-500" />}
                      <svg className="w-3 h-3 sei-dark-text-muted" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      {(index === 0 || index === 2 || index === 3 || index === 5 || index === 6) && (
                        <svg className="w-3 h-3 sei-dark-text-muted" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                      )}
                      {(index === 1 || index === 5) && (
                        <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="sei-dark-text font-medium">{token.price}</div>
                    <div className="text-sm text-green-500">
                      {index === 0 ? '+468x' : index === 1 ? '+1.45%' : index === 2 ? '+158.01%' : index === 3 ? '+18.17%' : index === 4 ? '+450.88%' : index === 5 ? '+205.44%' : '+77x'}
                    </div>
                  </div>
                  
                  <div className="sei-dark-text-muted text-sm">
                    {index === 0 ? '$1.68M' : index === 1 ? '$162M' : index === 2 ? '$481' : index === 3 ? '$21.7M' : index === 4 ? '$2.86M' : index === 5 ? '$5.22M' : '$335'}
                  </div>
                  
                  <div className="flex justify-end">
                    <Zap className="w-4 h-4 sei-dark-text-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Information Areas with Black Background */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="sei-info-area">
              <h3 className="text-lg font-semibold mb-3">Enhanced Honeypot Detection</h3>
              <p className="text-sm">
                Our improved algorithm now uses multiple layers of analysis including transfer simulation, 
                ownership patterns, and advanced bytecode analysis to reduce false positives and provide 
                more accurate security assessments.
              </p>
            </div>
            
            <div className="sei-info-area">
              <h3 className="text-lg font-semibold mb-3">Seifun Launch Platform</h3>
              <p className="text-sm">
                Professional token discovery and analysis on Sei Network with morphistic design elements 
                and enhanced security features. Built for the future of decentralized trading.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeifunLaunch;