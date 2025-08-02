import React, { useState, useEffect } from 'react';
import { Bot, Zap, TrendingUp, Shield, Brain, Sparkles, ArrowRight, Clock } from 'lucide-react';

const SeifuMasterAI = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const features = [
    {
      icon: TrendingUp,
      title: 'Smart Trading Assistant',
      description: 'AI-powered trading recommendations based on real-time market analysis and safety scores',
      preview: 'Analyzing 247 tokens... Found 12 high-potential opportunities',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Shield,
      title: 'Advanced Token Scanner',
      description: 'Deep learning models that detect rug pulls, honeypots, and malicious contracts instantly',
      preview: 'Scanning contract 0x1a2b... Risk level: LOW (Score: 94/100)',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Brain,
      title: 'Market Prediction Engine',
      description: 'Predict token performance using sentiment analysis, on-chain data, and social metrics',
      preview: 'DOGE trend prediction: +23% in next 24h (Confidence: 87%)',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Sparkles,
      title: 'Portfolio Optimization',
      description: 'Automatically rebalance your meme token portfolio for maximum returns and safety',
      preview: 'Suggested rebalance: Reduce PEPE 15%, Increase DOGE 10%',
      color: 'from-[#FF6B35] to-[#FF8E53]'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-[#0D1421] via-[#1A1B3A] to-[#2D1B69] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-[#FF6B35]/10 to-[#FF8E53]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center space-y-6 mb-16">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
              <Bot className="text-white" size={28} />
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-white">
              Seifun<span className="text-[#FF6B35]">Master</span> AI
            </h2>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Clock className="text-[#FF6B35]" size={20} />
            <span className="text-[#FF6B35] font-semibold text-lg">Coming Soon</span>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The future of meme token trading is here. Our AI-powered assistant will revolutionize 
            how you discover, analyze, and trade tokens on the Sei blockchain.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* AI Preview Interface */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="space-y-6">
                {/* AI Chat Header */}
                <div className="flex items-center space-x-4 pb-4 border-b border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-full flex items-center justify-center">
                    <Bot className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">SeifunMaster AI</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Online & Learning</span>
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot size={14} className="text-white" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-white text-sm">
                          {features[currentFeature].preview}
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-[#FF6B35] rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-[#FF6B35] rounded-full animate-pulse delay-100"></div>
                          <div className="w-1 h-1 bg-[#FF6B35] rounded-full animate-pulse delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Field */}
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Ask SeifunMaster anything about tokens..."
                      className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                      disabled
                    />
                    <button className="bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50" disabled>
                      <ArrowRight size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating AI Indicators */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full p-3 shadow-lg animate-bounce">
              <Zap className="text-white" size={16} />
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-white mb-8">AI-Powered Features</h3>
            
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border transition-all duration-500 ${
                  currentFeature === index
                    ? 'border-[#FF6B35]/50 bg-white/15 scale-105'
                    : 'border-white/20 hover:border-white/30'
                } ${isAnimating && currentFeature === index ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className="text-white" size={20} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white font-bold text-lg">{feature.title}</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Early Access CTA */}
            <div className="bg-gradient-to-r from-[#FF6B35]/20 to-[#FF8E53]/20 rounded-2xl p-6 border border-[#FF6B35]/30 mt-8">
              <div className="text-center space-y-4">
                <h4 className="text-white font-bold text-xl">Get Early Access</h4>
                <p className="text-gray-300 text-sm">
                  Be among the first to experience the future of AI-powered meme token trading
                </p>
                <button className="bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#FF6B35]/25 transition-all flex items-center space-x-2 mx-auto">
                  <span>Join Waitlist</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          {[
            { label: 'AI Models Training', value: '24/7', icon: Brain },
            { label: 'Tokens Analyzed', value: '50K+', icon: Shield },
            { label: 'Accuracy Rate', value: '94.7%', icon: TrendingUp },
            { label: 'Beta Users', value: '1.2K', icon: Sparkles }
          ].map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="text-white" size={20} />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SeifuMasterAI;