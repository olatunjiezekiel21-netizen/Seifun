import React, { useState } from 'react';
import { 
  BookOpen, 
  Shield, 
  Rocket, 
  Bot, 
  Users, 
  Code, 
  HelpCircle, 
  Search,
  ChevronRight,
  ExternalLink,
  Zap,
  Lock,
  TrendingUp,
  Star,
  MessageCircle,
  Github,
  Twitter
} from 'lucide-react';

const Docs = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: BookOpen,
      subsections: [
        { id: 'what-is-seifu', title: 'What is Seifu?' },
        { id: 'key-features', title: 'Key Features' },
        { id: 'getting-started', title: 'Getting Started' }
      ]
    },
    {
      id: 'seifuguard',
      title: 'SeifuGuard Scanner',
      icon: Shield,
      subsections: [
        { id: 'how-it-works', title: 'How It Works' },
        { id: 'safety-scores', title: 'Safety Scores' },
        { id: 'security-checks', title: 'Security Checks' }
      ]
    },
    {
      id: 'launchpad',
      title: 'Token Launchpad',
      icon: Rocket,
      subsections: [
        { id: 'creating-tokens', title: 'Creating Tokens' },
        { id: 'launch-types', title: 'Launch Types' },
        { id: 'safety-features', title: 'Safety Features' }
      ]
    },
            {
          id: 'memehub',
          title: 'seifu.fun',
      icon: TrendingUp,
      subsections: [
        { id: 'discovering-tokens', title: 'Discovering Tokens' },
        { id: 'filtering-sorting', title: 'Filtering & Sorting' },
        { id: 'trading-integration', title: 'Trading Integration' }
      ]
    },
    {
      id: 'seifu-ai',
      title: 'Seifu Master AI',
      icon: Bot,
      subsections: [
        { id: 'ai-overview', title: 'AI Overview' },
        { id: 'trading-assistant', title: 'Trading Assistant' },
        { id: 'early-access', title: 'Early Access' }
      ]
    },
    {
      id: 'community',
      title: 'Community & DAO',
      icon: Users,
      subsections: [
        { id: 'governance', title: 'Governance' },
        { id: 'creator-program', title: 'Creator Program' },
        { id: 'reputation-system', title: 'Reputation System' }
      ]
    },
    {
      id: 'developers',
      title: 'Developers',
      icon: Code,
      subsections: [
        { id: 'api-reference', title: 'API Reference' },
        { id: 'smart-contracts', title: 'Smart Contracts' },
        { id: 'integration-guide', title: 'Integration Guide' }
      ]
    },
    {
      id: 'support',
      title: 'Support & FAQ',
      icon: HelpCircle,
      subsections: [
        { id: 'faq', title: 'Frequently Asked Questions' },
        { id: 'troubleshooting', title: 'Troubleshooting' },
        { id: 'contact', title: 'Contact Support' }
      ]
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-6">Welcome to Seifu</h1>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                Seifu is the premier decentralized token verification and launchpad platform built specifically for the Sei blockchain ecosystem. 
                Our mission is to create a safe, transparent, and innovative environment for meme token creation, verification, and trading.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="text-[#FF6B35]" size={24} />
                  <h3 className="text-xl font-bold text-white">Safety First</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Our advanced SeifuGuard technology provides real-time security analysis, 
                  protecting users from rug pulls, honeypots, and malicious contracts.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Rocket className="text-[#FF6B35]" size={24} />
                  <h3 className="text-xl font-bold text-white">Easy Launching</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Create and launch your meme tokens with built-in safety features, 
                  liquidity locking, and automatic verification processes.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Bot className="text-[#FF6B35]" size={24} />
                  <h3 className="text-xl font-bold text-white">AI-Powered</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Seifu Master AI (coming soon) will provide intelligent trading recommendations, 
                  market analysis, and automated portfolio optimization.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="text-[#FF6B35]" size={24} />
                  <h3 className="text-xl font-bold text-white">Community Driven</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Built by the community, for the community. Participate in governance, 
                  earn reputation, and help shape the future of safe meme trading.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#FF6B35]/20 to-[#FF8E53]/20 rounded-2xl p-8 border border-[#FF6B35]/30">
              <h3 className="text-2xl font-bold text-white mb-4">Key Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FF6B35] mb-2">1,247</div>
                  <div className="text-gray-300 text-sm">Tokens Verified</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FF6B35] mb-2">$8.4M</div>
                  <div className="text-gray-300 text-sm">Total Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FF6B35] mb-2">98.7%</div>
                  <div className="text-gray-300 text-sm">Safety Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FF6B35] mb-2">15.2K</div>
                  <div className="text-gray-300 text-sm">Active Users</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'seifuguard':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-6">SeifuGuard Scanner</h1>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                SeifuGuard is our advanced token security analysis system that provides real-time safety scores 
                and comprehensive security checks for any token on the Sei blockchain.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">How SeifuGuard Works</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Contract Analysis</h4>
                    <p className="text-gray-300 text-sm">
                      Our system analyzes the smart contract code, checking for common vulnerabilities, 
                      malicious functions, and potential security risks.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Liquidity Verification</h4>
                    <p className="text-gray-300 text-sm">
                      We verify liquidity pool locks, check for sufficient liquidity, 
                      and analyze trading patterns to detect potential manipulation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Creator Assessment</h4>
                    <p className="text-gray-300 text-sm">
                      We evaluate the token creator's history, reputation, and previous projects 
                      to provide additional context for the safety assessment.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Score Calculation</h4>
                    <p className="text-gray-300 text-sm">
                      All factors are combined using our proprietary algorithm to generate 
                      a comprehensive safety score from 0-100.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-500/20 rounded-2xl p-6 border border-green-500/30">
                <h4 className="text-lg font-bold text-green-400 mb-3">Safe (80-100)</h4>
                <p className="text-gray-300 text-sm">
                  Tokens with excellent safety features, verified contracts, and strong liquidity locks.
                </p>
              </div>
              <div className="bg-yellow-500/20 rounded-2xl p-6 border border-yellow-500/30">
                <h4 className="text-lg font-bold text-yellow-400 mb-3">Moderate (60-79)</h4>
                <p className="text-gray-300 text-sm">
                  Tokens with some safety concerns but generally acceptable risk levels.
                </p>
              </div>
              <div className="bg-red-500/20 rounded-2xl p-6 border border-red-500/30">
                <h4 className="text-lg font-bold text-red-400 mb-3">Risky (0-59)</h4>
                <p className="text-gray-300 text-sm">
                  Tokens with significant safety concerns that require careful consideration.
                </p>
              </div>
            </div>
          </div>
        );

      case 'launchpad':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-6">Token Launchpad</h1>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                Create and launch your meme tokens with built-in safety features, automatic verification, 
                and comprehensive launch management tools.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">Launch Process</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Token Details</h4>
                  <p className="text-gray-300 text-sm">
                    Define your token's name, symbol, supply, and social links.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Rocket className="text-white" size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Launch Settings</h4>
                  <p className="text-gray-300 text-sm">
                    Configure launch type, allocations, and safety features.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="text-white" size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Verification</h4>
                  <p className="text-gray-300 text-sm">
                    Automatic SeifuGuard verification and safety scoring.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="text-white" size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Deploy</h4>
                  <p className="text-gray-300 text-sm">
                    Launch your token with automatic LP locking and verification.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h4 className="text-xl font-bold text-white mb-4">Launch Types</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-[#FF6B35] mb-2">Fair Launch</h5>
                    <p className="text-gray-300 text-sm">
                      Open to everyone with equal opportunity to participate from the start.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-[#FF6B35] mb-2">Presale</h5>
                    <p className="text-gray-300 text-sm">
                      Whitelist-only launch with early access for selected participants.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-[#FF6B35] mb-2">Stealth Launch</h5>
                    <p className="text-gray-300 text-sm">
                      No prior announcement, immediate launch with surprise element.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h4 className="text-xl font-bold text-white mb-4">Safety Features</h4>
                <div className="space-y-3">
                  {[
                    'Automatic LP locking',
                    'Rug pull protection',
                    'Contract verification',
                    'Creator reputation tracking',
                    'Community governance options',
                    'Built-in safety checks'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-[#FF6B35] rounded-full"></div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'seifu-ai':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-6">Seifu Master AI</h1>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                  Coming Soon
                </div>
              </div>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                Seifu Master AI represents the future of intelligent meme token trading and analysis. 
                Our AI-powered assistant will revolutionize how you discover, analyze, and trade tokens.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="text-[#FF6B35]" size={24} />
                  <h3 className="text-xl font-bold text-white">Smart Trading Assistant</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  AI-powered trading recommendations based on real-time market analysis, 
                  sentiment data, and safety scores.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Real-time market analysis</li>
                  <li>• Risk assessment and recommendations</li>
                  <li>• Optimal entry and exit points</li>
                  <li>• Portfolio optimization suggestions</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="text-[#FF6B35]" size={24} />
                  <h3 className="text-xl font-bold text-white">Advanced Token Scanner</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Deep learning models that detect rug pulls, honeypots, and malicious 
                  contracts with unprecedented accuracy.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Machine learning detection</li>
                  <li>• Pattern recognition analysis</li>
                  <li>• Behavioral anomaly detection</li>
                  <li>• Predictive risk modeling</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Bot className="text-[#FF6B35]" size={24} />
                  <h3 className="text-xl font-bold text-white">Market Prediction Engine</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Predict token performance using sentiment analysis, on-chain data, 
                  and social metrics with high accuracy.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Sentiment analysis</li>
                  <li>• Social media monitoring</li>
                  <li>• On-chain data analysis</li>
                  <li>• Price prediction models</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="text-[#FF6B35]" size={24} />
                  <h3 className="text-xl font-bold text-white">Portfolio Optimization</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Automatically rebalance your meme token portfolio for maximum 
                  returns while maintaining optimal risk levels.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Automated rebalancing</li>
                  <li>• Risk-adjusted returns</li>
                  <li>• Diversification strategies</li>
                  <li>• Performance tracking</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#FF6B35]/20 to-[#FF8E53]/20 rounded-2xl p-8 border border-[#FF6B35]/30">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-white">Join the AI Revolution</h3>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Be among the first to experience the future of AI-powered meme token trading. 
                  Join our waitlist for early access to Seifu Master AI.
                </p>
                <button className="bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-6">Support & FAQ</h1>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                Find answers to common questions and get help with using the Seifu platform.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-[#FF6B35] mb-2">What is Seifu?</h4>
                    <p className="text-gray-300 text-sm">
                      Seifu is a decentralized token verification and launchpad platform built for the Sei blockchain, 
                      focusing on safe meme token creation and trading.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#FF6B35] mb-2">How does SeifuGuard work?</h4>
                    <p className="text-gray-300 text-sm">
                      SeifuGuard analyzes smart contracts, liquidity pools, and creator history to provide 
                      comprehensive safety scores from 0-100 for any token.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#FF6B35] mb-2">Is it free to use Seifu?</h4>
                    <p className="text-gray-300 text-sm">
                      Basic features like token scanning and browsing are free. Token creation and advanced 
                      features may require fees to cover blockchain transaction costs.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#FF6B35] mb-2">When will Seifu Master AI be available?</h4>
                    <p className="text-gray-300 text-sm">
                      Seifu Master AI is currently in development. Join our waitlist to be notified 
                      when early access becomes available.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                  <MessageCircle className="text-[#FF6B35] mx-auto mb-4" size={32} />
                  <h4 className="text-lg font-bold text-white mb-2">Discord</h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Join our community for real-time support and discussions.
                  </p>
                  <button className="bg-[#5865F2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4752C4] transition-colors">
                    Join Discord
                  </button>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                  <Twitter className="text-[#FF6B35] mx-auto mb-4" size={32} />
                  <h4 className="text-lg font-bold text-white mb-2">Twitter</h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Follow us for updates, announcements, and community highlights.
                  </p>
                  <button className="bg-[#1DA1F2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0d8bd9] transition-colors">
                    Follow Us
                  </button>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                  <Github className="text-[#FF6B35] mx-auto mb-4" size={32} />
                  <h4 className="text-lg font-bold text-white mb-2">GitHub</h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Access our open-source code and contribute to development.
                  </p>
                  <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                    View Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-white">Content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1421] via-[#1A1B3A] to-[#2D1B69]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={20} />
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white">
              Seifu <span className="text-[#FF6B35]">Docs</span>
            </h1>
          </div>
          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Everything you need to know about using Seifu for safe meme token creation, 
            verification, and trading on the Sei blockchain.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 sticky top-8">
              <h3 className="text-lg font-bold text-white mb-4">Documentation</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all ${
                        activeSection === section.id
                          ? 'bg-[#FF6B35] text-white'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <section.icon size={18} />
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                    {activeSection === section.id && section.subsections && (
                      <div className="ml-6 mt-2 space-y-1">
                        {section.subsections.map((subsection) => (
                          <button
                            key={subsection.id}
                            className="block w-full text-left px-3 py-1 text-xs text-gray-400 hover:text-[#FF6B35] transition-colors"
                          >
                            {subsection.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
              {renderContent()}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 sm:mt-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Quick Access</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <a
              href="#"
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-[#FF6B35]/50 transition-all group text-center"
            >
              <Code className="text-[#FF6B35] mx-auto mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h4 className="text-lg font-bold text-white mb-2">API Reference</h4>
              <p className="text-gray-300 text-sm">
                Integrate Seifu into your applications
              </p>
              <ExternalLink className="text-gray-400 mx-auto mt-3" size={16} />
            </a>

            <a
              href="#"
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-[#FF6B35]/50 transition-all group text-center"
            >
              <Lock className="text-[#FF6B35] mx-auto mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h4 className="text-lg font-bold text-white mb-2">Smart Contracts</h4>
              <p className="text-gray-300 text-sm">
                View verified contract addresses
              </p>
              <ExternalLink className="text-gray-400 mx-auto mt-3" size={16} />
            </a>

            <a
              href="#"
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-[#FF6B35]/50 transition-all group text-center"
            >
              <Users className="text-[#FF6B35] mx-auto mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h4 className="text-lg font-bold text-white mb-2">Community</h4>
              <p className="text-gray-300 text-sm">
                Join our Discord and Telegram
              </p>
              <ExternalLink className="text-gray-400 mx-auto mt-3" size={16} />
            </a>

            <a
              href="#"
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-[#FF6B35]/50 transition-all group text-center"
            >
              <HelpCircle className="text-[#FF6B35] mx-auto mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h4 className="text-lg font-bold text-white mb-2">Support</h4>
              <p className="text-gray-300 text-sm">
                Get help from our team
              </p>
              <ExternalLink className="text-gray-400 mx-auto mt-3" size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;