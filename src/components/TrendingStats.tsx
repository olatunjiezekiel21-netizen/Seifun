import React from 'react';
import { TrendingUp, Zap, Users, DollarSign, Activity, Clock } from 'lucide-react';

const TrendingStats = () => {
  const stats = [
    {
      icon: TrendingUp,
      label: 'Trending Now',
      value: '247',
      change: '+12%',
      color: 'from-[#FF6B35] to-[#FF8E53]',
      description: 'Hot meme tokens'
    },
    {
      icon: Zap,
      label: 'Total Volume',
      value: '$8.4M',
      change: '+23%',
      color: 'from-blue-500 to-blue-600',
      description: '24h trading volume'
    },
    {
      icon: Users,
      label: 'Active Traders',
      value: '15.2K',
      change: '+8%',
      color: 'from-green-500 to-green-600',
      description: 'Unique wallets'
    },
    {
      icon: DollarSign,
      label: 'Market Cap',
      value: '$42.1M',
      change: '+15%',
      color: 'from-purple-500 to-purple-600',
      description: 'Total market value'
    },
    {
      icon: Activity,
      label: 'New Launches',
      value: '18',
      change: '+6',
      color: 'from-yellow-500 to-yellow-600',
      description: 'Today'
    },
    {
      icon: Clock,
      label: 'Avg Score',
      value: '78.5',
      change: '+2.1',
      color: 'from-indigo-500 to-indigo-600',
      description: 'Safety rating'
    }
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-[#FF6B35]/50 transition-all duration-300 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="text-white" size={20} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-green-400 text-sm font-medium">{stat.change}</div>
              </div>
            </div>
            <div>
              <div className="text-white font-medium text-sm">{stat.label}</div>
              <div className="text-gray-400 text-xs">{stat.description}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrendingStats;