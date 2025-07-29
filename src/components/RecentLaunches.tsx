import React from 'react';
import { ExternalLink, Shield, TrendingUp, Clock } from 'lucide-react';

const RecentLaunches = () => {
  const launches = [
    {
      id: 1,
      name: 'SeiDoge',
      symbol: 'SDOGE',
      score: 94,
      status: 'Live',
      timeAgo: '2 hours ago',
      volume: '$124K',
      change: '+45.2%',
      creator: 'dogemaster',
      image: '🐕'
    },
    {
      id: 2,
      name: 'MoonCat',
      symbol: 'MCAT',
      score: 87,
      status: 'Live',
      timeAgo: '6 hours ago',
      volume: '$89K',
      change: '+23.1%',
      creator: 'catwhiskers',
      image: '🐱'
    },
    {
      id: 3,
      name: 'RocketFrog',
      symbol: 'RFROG',
      score: 91,
      status: 'Launching',
      timeAgo: 'In 2 hours',
      volume: '-',
      change: '-',
      creator: 'frogforce',
      image: '🐸'
    },
    {
      id: 4,
      name: 'DiamondHands',
      symbol: 'DIAMOND',
      score: 78,
      status: 'Live',
      timeAgo: '1 day ago',
      volume: '$67K',
      change: '+12.8%',
      creator: 'hodlking',
      image: '💎'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live': return 'bg-green-100 text-green-800';
      case 'Launching': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Recent Launches</h3>
          <button className="text-[#FF3C3C] hover:text-[#E63636] font-medium text-sm flex items-center space-x-1">
            <span>View All</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {launches.map((launch) => (
          <div key={launch.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                  {launch.image}
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h4 className="font-bold text-gray-900">{launch.name}</h4>
                    <span className="text-gray-500 text-sm">{launch.symbol}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(launch.status)}`}>
                      {launch.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">by {launch.creator}</span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock size={12} />
                      <span>{launch.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className={`text-lg font-bold px-3 py-1 rounded-full ${getScoreColor(launch.score)}`}>
                    {launch.score}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{launch.volume}</div>
                  <div className="text-xs text-gray-500">Volume</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${launch.change.startsWith('+') ? 'text-green-600' : 'text-gray-400'}`}>
                    {launch.change}
                  </div>
                  <div className="text-xs text-gray-500">24h</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentLaunches;