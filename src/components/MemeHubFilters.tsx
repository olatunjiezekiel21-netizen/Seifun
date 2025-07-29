import React, { useState } from 'react';
import { Filter, Search, TrendingUp, Clock, Shield, Zap } from 'lucide-react';

interface FilterProps {
  onFilterChange: (filters: any) => void;
}

const MemeHubFilters: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [activeFilters, setActiveFilters] = useState({
    timeframe: '24h',
    category: 'all',
    safetyScore: 'all',
    sortBy: 'trending'
  });

  const [searchQuery, setSearchQuery] = useState('');

  const timeframes = [
    { value: '1h', label: '1H', icon: Clock },
    { value: '24h', label: '24H', icon: TrendingUp },
    { value: '7d', label: '7D', icon: TrendingUp },
    { value: '30d', label: '30D', icon: TrendingUp }
  ];

  const categories = [
    { value: 'all', label: 'All Memes', icon: Zap },
    { value: 'dogs', label: 'Dogs', emoji: '🐕' },
    { value: 'cats', label: 'Cats', emoji: '🐱' },
    { value: 'frogs', label: 'Frogs', emoji: '🐸' },
    { value: 'ai', label: 'AI', emoji: '🤖' },
    { value: 'defi', label: 'DeFi', emoji: '💰' }
  ];

  const safetyLevels = [
    { value: 'all', label: 'All Scores', color: 'text-gray-600' },
    { value: 'safe', label: 'Safe (80+)', color: 'text-green-600' },
    { value: 'moderate', label: 'Moderate (60-79)', color: 'text-yellow-600' },
    { value: 'risky', label: 'Risky (<60)', color: 'text-red-600' }
  ];

  const sortOptions = [
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'score', label: 'Safety Score', icon: Shield },
    { value: 'volume', label: 'Volume', icon: Zap }
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange({ ...newFilters, search: searchQuery });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onFilterChange({ ...activeFilters, search: query });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search meme tokens..."
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
          />
        </div>

        {/* Filter Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Timeframe */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Timeframe</label>
            <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.value}
                  onClick={() => handleFilterChange('timeframe', timeframe.value)}
                  className={`flex items-center justify-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeFilters.timeframe === timeframe.value
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <timeframe.icon size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span>{timeframe.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Category</label>
            <select
              value={activeFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full py-2 px-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value} className="bg-[#1A1B3A] text-white">
                  {category.emoji ? `${category.emoji} ` : ''}{category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Safety Score */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Safety Level</label>
            <select
              value={activeFilters.safetyScore}
              onChange={(e) => handleFilterChange('safetyScore', e.target.value)}
              className="w-full py-2 px-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            >
              {safetyLevels.map((level) => (
                <option key={level.value} value={level.value} className="bg-[#1A1B3A] text-white">
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Sort By</label>
            <select
              value={activeFilters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full py-2 px-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#1A1B3A] text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(activeFilters.timeframe !== '24h' || activeFilters.category !== 'all' || activeFilters.safetyScore !== 'all' || searchQuery) && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-white/20">
            <span className="text-xs sm:text-sm text-gray-300">Active filters:</span>
            {activeFilters.timeframe !== '24h' && (
              <span className="bg-[#FF6B35]/20 text-[#FF6B35] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {timeframes.find(t => t.value === activeFilters.timeframe)?.label}
              </span>
            )}
            {activeFilters.category !== 'all' && (
              <span className="bg-[#FF6B35]/20 text-[#FF6B35] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {categories.find(c => c.value === activeFilters.category)?.label}
              </span>
            )}
            {activeFilters.safetyScore !== 'all' && (
              <span className="bg-[#FF6B35]/20 text-[#FF6B35] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {safetyLevels.find(s => s.value === activeFilters.safetyScore)?.label}
              </span>
            )}
            {searchQuery && (
              <span className="bg-[#FF6B35]/20 text-[#FF6B35] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                "{searchQuery}"
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemeHubFilters;