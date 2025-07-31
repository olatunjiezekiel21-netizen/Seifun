import React from 'react';
import { ArrowRight, Shield, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-[#F7F7F9] via-white to-[#FFF5F5] py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-[#FF6B35]/10 to-[#FF8E53]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-[#FF6B35]/5 to-[#FF8E53]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-[#141414] leading-tight">
                Launch Safe
                <br />
                <span className="text-[#FF6B35]">Meme Tokens</span>
                <br />
                on Sei
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                The decentralized token verifier and launchpad built for the Sei ecosystem. 
                Verify, launch, and trade with confidence.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/launchpad')}
                className="bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-[#FF6B35]/25 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 transition-all"
              >
                <Rocket size={20} />
                <span>Create Token</span>
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => navigate('/seifun-launch')}
                className="border-2 border-[#FF6B35] text-[#FF6B35] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#FF6B35] hover:text-white transition-all flex items-center justify-center space-x-2"
              >
                <Shield size={20} />
                <span>Explore Tokens</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#141414]">1,247</div>
                <div className="text-gray-600 text-sm">Tokens Verified</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#141414]">$2.4M</div>
                <div className="text-gray-600 text-sm">Total Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#141414]">98.7%</div>
                <div className="text-gray-600 text-sm">Safety Rate</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#141414]">SeifuGuard</h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Live Audit
                  </span>
                </div>
                
                {/* Mock Audit Display */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Safety Score</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-20 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                      </div>
                      <span className="text-2xl font-bold text-green-600">82</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { label: 'Liquidity', status: 'safe' },
                      { label: 'Supply', status: 'safe' },
                      { label: 'Creator', status: 'warning' },
                      { label: 'Other', status: 'safe' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">{item.label}</span>
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'safe' ? 'bg-green-500' : 
                          item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Shield className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;