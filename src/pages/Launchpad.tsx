import React from 'react';
import { Rocket, Shield, TrendingUp, Users } from 'lucide-react';
import LaunchpadForm from '../components/LaunchpadForm';
import LaunchpadStats from '../components/LaunchpadStats';
import RecentLaunches from '../components/RecentLaunches';

const Launchpad = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F7F9] via-white to-[#FFF5F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-16">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#FF3C3C] to-[#FF6B6B] rounded-2xl flex items-center justify-center shadow-lg">
              <Rocket className="text-white" size={20} sm:size={28} />
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#141414]">
              Token <span className="text-[#FF3C3C]">Launchpad</span>
            </h1>
          </div>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Create and launch your meme token with built-in safety verification, 
            liquidity locking, and community governance features on the Sei blockchain.
          </p>
        </div>

        {/* Stats */}
        <LaunchpadStats />

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <LaunchpadForm />
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Safety Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="text-[#FF3C3C]" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Safety Features</h3>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'SeifuGuard Verification', desc: 'Automatic security audit' },
                  { title: 'LP Auto-Lock', desc: 'Liquidity protection built-in' },
                  { title: 'Rug Pull Protection', desc: 'Advanced safety mechanisms' },
                  { title: 'Community Scoring', desc: 'Transparent reputation system' }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#FF3C3C] rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{feature.title}</div>
                      <div className="text-gray-600 text-xs">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Benefits */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Launch Benefits</h3>
              </div>
              <div className="space-y-3">
                {[
                  'Instant verification badge',
                  'Featured on homepage',
                  'Community trust boost',
                  'Trading fee discounts',
                  'DAO governance tools'
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    <span className="text-blue-800 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="text-gray-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Need Help?</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Join our community for support and guidance during your token launch.
              </p>
              <div className="space-y-2">
                <button className="w-full bg-[#5865F2] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#4752C4] transition-colors">
                  Join Discord
                </button>
                <button className="w-full bg-[#229ED9] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#1DA1F2] transition-colors">
                  Join Telegram
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Launches */}
        <div className="mt-8 lg:mt-16">
          <RecentLaunches />
        </div>
      </div>
    </div>
  );
};

export default Launchpad;