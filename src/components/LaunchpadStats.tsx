import React from 'react';
import { TrendingUp, Shield, Rocket, Users } from 'lucide-react';

const LaunchpadStats = () => {
  const stats = [
    {
      icon: Rocket,
      value: '247',
      label: 'Tokens Launched',
      change: '+12 this week',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Shield,
      value: '98.7%',
      label: 'Safety Rate',
      change: 'All time high',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: TrendingUp,
      value: '$4.2M',
      label: 'Total Volume',
      change: '+23% this month',
      color: 'from-[#FF3C3C] to-[#FF6B6B]'
    },
    {
      icon: Users,
      value: '12.4K',
      label: 'Active Traders',
      change: '+8% this week',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="text-white" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              <div className="text-xs text-green-600 font-medium">{stat.change}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LaunchpadStats;