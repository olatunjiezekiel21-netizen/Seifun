import React from 'react';
import { Crown, Medal, Award, Trophy } from 'lucide-react';

const TrustedCreators = () => {
  const creators = [
    {
      id: 1,
      name: 'mememaster',
      badge: 'Bronze',
      icon: Medal,
      color: 'from-amber-400 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800'
    },
    {
      id: 2,
      name: 'whiskers',
      badge: 'Silver',
      icon: Award,
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-800'
    },
    {
      id: 3,
      name: 'memeology',
      badge: 'Gold',
      icon: Crown,
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800'
    },
    {
      id: 4,
      name: 'trollinator',
      badge: 'waifu',
      icon: Trophy,
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-800'
    },
    {
      id: 5,
      name: 'grok',
      badge: 'waifu',
      icon: Trophy,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#141414]">Trusted Creators Leaderboard</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Top-rated creators building safe and innovative meme tokens on Sei
          </p>
        </div>

        <div className="space-y-4">
          {creators.map((creator, index) => (
            <div key={creator.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-[#FF3C3C]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-700">#{index + 1}</span>
                  </div>

                  {/* Creator Avatar */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${creator.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <creator.icon className="text-white" size={24} />
                  </div>

                  {/* Creator Info */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-[#141414]">{creator.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 text-sm">Creator Rank</span>
                      <div className={`px-3 py-1 rounded-full ${creator.bgColor} ${creator.textColor} text-sm font-medium`}>
                        {creator.badge}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#141414]">
                      {index === 0 ? '23' : index === 1 ? '18' : index === 2 ? '31' : index === 3 ? '12' : '8'}
                    </div>
                    <div className="text-gray-600 text-sm">Tokens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {index === 0 ? '94.2%' : index === 1 ? '91.7%' : index === 2 ? '96.8%' : index === 3 ? '88.3%' : '85.1%'}
                    </div>
                    <div className="text-gray-600 text-sm">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FF6B35]">
                      {index === 0 ? '$1.2M' : index === 1 ? '$890K' : index === 2 ? '$2.1M' : index === 3 ? '$650K' : '$420K'}
                    </div>
                    <div className="text-gray-600 text-sm">Volume</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="border-2 border-[#FF6B35] text-[#FF6B35] px-8 py-3 rounded-xl font-semibold hover:bg-[#FF6B35] hover:text-white transition-all">
            View Full Leaderboard
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrustedCreators;