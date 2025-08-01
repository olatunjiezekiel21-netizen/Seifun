import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Star, 
  Zap, 
  Eye, 
  Heart, 
  Clock, 
  Award,
  Flame,
  Target,
  BarChart3,
  Timer,
  Sparkles
} from 'lucide-react';
import TokenChart from '../components/TokenChart';
import AITraderChat from '../components/AITraderChat';

interface TokenActivity {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  creator: string;
  action: 'created' | 'traded' | 'verified';
  timestamp: Date;
  value?: string;
  safetyScore?: number;
}

interface CreatorSpotlight {
  address: string;
  name: string;
  tokensCreated: number;
  totalVolume: string;
  avgSafetyScore: number;
  badge: string;
  avatar?: string;
}

interface TrendingPattern {
  pattern: string;
  description: string;
  impact: 'positive' | 'neutral' | 'negative';
  frequency: number;
  examples: string[];
}

const TokenPulse = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'creators' | 'trends' | 'favorites'>('live');
  const [liveActivities, setLiveActivities] = useState<TokenActivity[]>([]);
  const [featuredCreators, setFeaturedCreators] = useState<CreatorSpotlight[]>([]);
  const [trendingPatterns, setTrendingPatterns] = useState<TrendingPattern[]>([]);

  // Simulate live data (in real app, this would be from WebSocket/API)
  useEffect(() => {
    const mockActivities: TokenActivity[] = [
      {
        id: '1',
        tokenName: 'SeiMoon',
        tokenSymbol: 'MOON',
        creator: '0x966C...894e',
        action: 'created',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        safetyScore: 85
      },
      {
        id: '2',
        tokenName: 'SafeRocket',
        tokenSymbol: 'ROCKET',
        creator: '0x742d...D3eE',
        action: 'verified',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        safetyScore: 92
      },
      {
        id: '3',
        tokenName: 'DegenCoin',
        tokenSymbol: 'DEGEN',
        creator: '0x123a...456b',
        action: 'traded',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        value: '1,250 SEI',
        safetyScore: 67
      }
    ];

    const mockCreators: CreatorSpotlight[] = [
      {
        address: '0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e',
        name: 'TokenMaster',
        tokensCreated: 12,
        totalVolume: '45,230 SEI',
        avgSafetyScore: 88,
        badge: 'Verified Creator'
      },
      {
        address: '0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE',
        name: 'SafeLauncher',
        tokensCreated: 8,
        totalVolume: '32,100 SEI',
        avgSafetyScore: 91,
        badge: 'Safety Champion'
      },
      {
        address: '0x123abc456def789ghi012jkl345mno678pqr901st',
        name: 'MemeKing',
        tokensCreated: 15,
        totalVolume: '28,750 SEI',
        avgSafetyScore: 75,
        badge: 'Community Favorite'
      }
    ];

    const mockTrends: TrendingPattern[] = [
      {
        pattern: 'Safety-First Tokens',
        description: 'Tokens with 80+ safety scores are getting 3x more trading volume',
        impact: 'positive',
        frequency: 85,
        examples: ['SafeRocket', 'SecureToken', 'TrustCoin']
      },
      {
        pattern: 'Community Engagement',
        description: 'Tokens with active Discord/Telegram see 2x better performance',
        impact: 'positive',
        frequency: 72,
        examples: ['CommunityMoon', 'ChatToken', 'SocialCoin']
      },
      {
        pattern: 'Quick Launch Pattern',
        description: 'Tokens launched within 1 hour of creation show higher initial volume',
        impact: 'neutral',
        frequency: 58,
        examples: ['QuickMoon', 'InstantToken', 'FastLaunch']
      }
    ];

    setLiveActivities(mockActivities);
    setFeaturedCreators(mockCreators);
    setTrendingPatterns(mockTrends);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newActivity: TokenActivity = {
        id: Date.now().toString(),
        tokenName: `Token${Math.floor(Math.random() * 1000)}`,
        tokenSymbol: `TK${Math.floor(Math.random() * 100)}`,
        creator: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        action: ['created', 'traded', 'verified'][Math.floor(Math.random() * 3)] as any,
        timestamp: new Date(),
        safetyScore: Math.floor(Math.random() * 40) + 60,
        value: Math.random() > 0.5 ? `${Math.floor(Math.random() * 5000)} SEI` : undefined
      };

      setLiveActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Sparkles className="text-blue-400" size={16} />;
      case 'traded': return <TrendingUp className="text-green-400" size={16} />;
      case 'verified': return <Award className="text-yellow-400" size={16} />;
      default: return <Activity className="text-gray-400" size={16} />;
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const renderLiveActivity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="text-[#FF6B35]" size={24} />
          Live Token Activity
        </h2>
        <div className="flex items-center gap-2 text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm">Live</span>
        </div>
      </div>

      <div className="grid gap-4">
        {liveActivities.map((activity) => (
          <div key={activity.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:border-[#FF6B35]/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getActionIcon(activity.action)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{activity.tokenName}</span>
                    <span className="text-gray-400 text-sm">({activity.tokenSymbol})</span>
                    {activity.safetyScore && (
                      <span className={`text-xs px-2 py-1 rounded-full bg-black/20 ${getSafetyColor(activity.safetyScore)}`}>
                        {activity.safetyScore}/100
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    {activity.action === 'created' && 'New token created by'}
                    {activity.action === 'traded' && 'Traded for'}
                    {activity.action === 'verified' && 'Verified by'}
                    {' '}
                    <span className="font-mono">{activity.creator}</span>
                    {activity.value && <span className="text-green-400 ml-2">{activity.value}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} />
                  {getTimeAgo(activity.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCreatorSpotlight = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Users className="text-[#FF6B35]" size={24} />
        Creator Spotlight
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredCreators.map((creator, index) => (
          <div key={creator.address} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-[#FF6B35]/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-full flex items-center justify-center text-white font-bold">
                {creator.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white">{creator.name}</h3>
                <p className="text-xs text-gray-400 font-mono">{creator.address.slice(0, 10)}...</p>
              </div>
              {index === 0 && <Award className="text-yellow-400 ml-auto" size={20} />}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm">Tokens Created</span>
                <span className="text-white font-semibold">{creator.tokensCreated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm">Total Volume</span>
                <span className="text-green-400 font-semibold">{creator.totalVolume}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm">Avg Safety Score</span>
                <span className={`font-semibold ${getSafetyColor(creator.avgSafetyScore)}`}>
                  {creator.avgSafetyScore}/100
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <span className="inline-block px-3 py-1 bg-[#FF6B35]/20 text-[#FF6B35] text-xs rounded-full">
                {creator.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrendingPatterns = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <BarChart3 className="text-[#FF6B35]" size={24} />
        Trending Patterns
      </h2>

      <div className="space-y-4">
        {trendingPatterns.map((trend, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  trend.impact === 'positive' ? 'bg-green-400' : 
                  trend.impact === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
                }`}></div>
                <h3 className="text-lg font-bold text-white">{trend.pattern}</h3>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Frequency</div>
                <div className="text-lg font-bold text-white">{trend.frequency}%</div>
              </div>
            </div>

            <p className="text-gray-300 mb-4">{trend.description}</p>

            <div>
              <div className="text-sm text-gray-400 mb-2">Examples:</div>
              <div className="flex flex-wrap gap-2">
                {trend.examples.map((example, i) => (
                  <span key={i} className="px-2 py-1 bg-black/20 text-gray-300 text-xs rounded-md">
                    {example}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Heart className="text-[#FF6B35]" size={24} />
        Community Favorites
      </h2>

      <div className="text-center py-12">
        <Heart className="text-gray-400 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold text-white mb-2">Coming Soon!</h3>
        <p className="text-gray-300">
          Community voting and favorites feature is under development.
          <br />
          Users will be able to save and vote on their favorite tokens.
        </p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'live', label: 'Live Activity', icon: Activity },
    { id: 'creators', label: 'Creators', icon: Users },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'favorites', label: 'Favorites', icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Token Pulse
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real-time token analysis, AI-powered insights, and professional trading tools
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Featured Token Chart */}
          <div className="lg:col-span-2">
            <TokenChart 
              tokenAddress="0xbd82f3bfe1df0c84faec88a22ebc34c9a86595dc" 
              tokenSymbol="CHIPS" 
              className="mb-6"
            />
            <TokenChart 
              tokenAddress="0x95597eb8d227a7c4b4f5e807a815c5178ee6dbe1" 
              tokenSymbol="SEIYAN" 
            />
          </div>
          
          {/* AI Trading Assistant */}
          <div className="lg:col-span-1">
            <AITraderChat />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {activeTab === 'live' && renderLiveActivity()}
          {activeTab === 'creators' && renderCreatorSpotlight()}
          {activeTab === 'trends' && renderTrendingPatterns()}
          {activeTab === 'favorites' && renderFavorites()}
        </div>
      </div>
    </div>
  );
};

export default TokenPulse;