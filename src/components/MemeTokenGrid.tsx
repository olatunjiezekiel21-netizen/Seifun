import React from 'react';
import { TrendingUp, TrendingDown, Shield, ExternalLink, Heart, MessageCircle, Share2, Eye } from 'lucide-react';

interface MemeToken {
  id: number;
  name: string;
  symbol: string;
  image: string;
  score: number;
  creator: string;
  price: string;
  change24h: string;
  volume24h: string;
  marketCap: string;
  holders: number;
  trending: 'up' | 'down';
  category: string;
  likes: number;
  comments: number;
  views: number;
  launchDate: string;
  description: string;
}

interface MemeTokenGridProps {
  tokens: MemeToken[];
  viewMode: 'grid' | 'list';
}

const MemeTokenGrid: React.FC<MemeTokenGridProps> = ({ tokens, viewMode }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-400/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-green-500';
    if (score >= 60) return 'from-yellow-400 to-yellow-500';
    return 'from-red-400 to-red-500';
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: { [key: string]: string } = {
      dogs: '🐕',
      cats: '🐱',
      frogs: '🐸',
      ai: '🤖',
      defi: '💰',
      other: '🎭'
    };
    return emojis[category] || '🎭';
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-3 sm:space-y-4">
        {tokens.map((token) => (
          <div key={token.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-[#FF6B35]/50 transition-all duration-300 group">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-6 w-full sm:w-auto">
                {/* Token Info */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#FF6B35]/20 to-[#FF8E53]/20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl border border-white/20">
                      {token.image}
                    </div>
                    <div className="absolute -top-1 -right-1 text-sm sm:text-lg">
                      {getCategoryEmoji(token.category)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#FF6B35] transition-colors">
                      {token.name}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400">{token.symbol}</p>
                    <p className="text-sm text-gray-500">by {token.creator}</p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-center ml-auto sm:ml-0">
                  <div className={`text-lg sm:text-2xl font-bold px-3 sm:px-4 py-1 sm:py-2 rounded-full ${getScoreColor(token.score)}`}>
                    {token.score}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">SeifunScore</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-8 w-full sm:w-auto">
                <div className="text-center">
                  <div className="text-sm sm:text-lg font-bold text-white">{token.price}</div>
                  <div className="text-xs text-gray-400">Price</div>
                </div>
                <div className="text-center">
                  <div className={`text-sm sm:text-lg font-bold flex items-center space-x-1 ${
                    token.trending === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {token.trending === 'up' ? <TrendingUp size={14} className="sm:w-4 sm:h-4" /> : <TrendingDown size={14} className="sm:w-4 sm:h-4" />}
                    <span>{token.change24h}</span>
                  </div>
                  <div className="text-xs text-gray-400">24h Change</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-sm sm:text-lg font-bold text-white">{token.volume24h}</div>
                  <div className="text-xs text-gray-400">Volume</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-sm sm:text-lg font-bold text-white">{token.holders.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Holders</div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button className="p-2 bg-white/5 hover:bg-[#FF6B35]/20 rounded-lg transition-colors">
                    <Heart size={14} className="sm:w-4 sm:h-4 text-gray-400 hover:text-[#FF6B35]" />
                  </button>
                  <button className="p-2 bg-white/5 hover:bg-[#FF6B35]/20 rounded-lg transition-colors">
                    <ExternalLink size={14} className="sm:w-4 sm:h-4 text-gray-400 hover:text-[#FF6B35]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {tokens.map((token) => (
        <div key={token.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-[#FF6B35]/50 transition-all duration-300 group hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#FF6B35]/10">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#FF6B35]/20 to-[#FF8E53]/20 rounded-xl flex items-center justify-center text-xl sm:text-2xl border border-white/20">
                    {token.image}
                  </div>
                  <div className="absolute -top-1 -right-1 text-xs sm:text-sm">
                    {getCategoryEmoji(token.category)}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-[#FF6B35] transition-colors">
                    {token.name}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm">{token.symbol}</p>
                </div>
              </div>
              <div className={`text-base sm:text-lg font-bold px-2 sm:px-3 py-1 rounded-full ${getScoreColor(token.score)}`}>
                {token.score}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-xs sm:text-sm line-clamp-2">{token.description}</p>

            {/* Score Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Safety Score</span>
                <span className="text-white font-medium">{token.score}/100</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getScoreBarColor(token.score)} rounded-full transition-all duration-1000`}
                  style={{ width: `${token.score}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <div className="text-white font-bold">{token.price}</div>
                <div className="text-gray-400">Price</div>
              </div>
              <div>
                <div className={`font-bold flex items-center space-x-1 ${
                  token.trending === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {token.trending === 'up' ? <TrendingUp size={10} className="sm:w-3 sm:h-3" /> : <TrendingDown size={10} className="sm:w-3 sm:h-3" />}
                  <span>{token.change24h}</span>
                </div>
                <div className="text-gray-400">24h</div>
              </div>
              <div>
                <div className="text-white font-bold">{token.volume24h}</div>
                <div className="text-gray-400">Volume</div>
              </div>
              <div>
                <div className="text-white font-bold">{token.holders.toLocaleString()}</div>
                <div className="text-gray-400">Holders</div>
              </div>
            </div>

            {/* Social Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Heart size={10} className="sm:w-3 sm:h-3" />
                  <span>{token.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle size={10} className="sm:w-3 sm:h-3" />
                  <span>{token.comments}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye size={10} className="sm:w-3 sm:h-3" />
                  <span>{token.views}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 hidden sm:block">
                {token.launchDate}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-1 sm:space-x-2 pt-2">
              <button className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white py-2 px-3 sm:px-4 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-[#FF6B35]/25 transition-all">
                Trade
              </button>
              <button className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <Heart size={14} className="sm:w-4 sm:h-4 text-gray-400 hover:text-[#FF6B35]" />
              </button>
              <button className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <Share2 size={14} className="sm:w-4 sm:h-4 text-gray-400 hover:text-[#FF6B35]" />
              </button>
              <button className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <ExternalLink size={14} className="sm:w-4 sm:h-4 text-gray-400 hover:text-[#FF6B35]" />
              </button>
            </div>

            {/* Creator */}
            <div className="text-center pt-2 border-t border-white/10">
              <span className="text-xs text-gray-400">by </span>
              <span className="text-xs text-[#FF6B35] font-medium hover:underline cursor-pointer">
                {token.creator}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemeTokenGrid;