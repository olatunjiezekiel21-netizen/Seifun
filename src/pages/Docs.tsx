import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Shield, 
  Rocket, 
  Bot, 
  Users, 
  Code, 
  Search,
  ChevronRight,
  ExternalLink,
  Zap,
  Lock,
  TrendingUp,
  Star,
  MessageCircle,
  Github,
  Twitter,
  Moon,
  Sun,
  Menu,
  X,
  Copy,
  Check,
  Terminal,
  FileText,
  Settings,
  Layers,
  Database,
  Globe,
  Smartphone,
  Cpu,
  Activity,
  Home,
  ArrowRight
} from 'lucide-react';

const Docs = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Documentation structure based on our GitBook SUMMARY.md
  const documentationSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Rocket,
      items: [
        { id: 'introduction', title: 'Introduction', icon: Home },
        { id: 'quick-start', title: 'Quick Start', icon: Zap },
        { id: 'wallet-connection', title: 'Wallet Connection', icon: Lock },
        { id: 'first-steps', title: 'First Steps', icon: ArrowRight }
      ]
    },
    {
      id: 'features',
      title: 'Features Overview',
      icon: Star,
      items: [
        { id: 'platform-overview', title: 'Platform Overview', icon: Globe },
        { id: 'ai-integration', title: 'AI Integration', icon: Bot },
        { id: 'blockchain-features', title: 'Blockchain Features', icon: Database },
        { id: 'security-features', title: 'Security Features', icon: Shield }
      ]
    },
    {
      id: 'seilist',
      title: 'SeiList - Token Creation',
      icon: Layers,
      items: [
        { id: 'seilist-intro', title: 'Introduction to SeiList', icon: BookOpen },
        { id: 'token-creation', title: 'Token Creation Guide', icon: Code },
        { id: 'liquidity-management', title: 'Liquidity Management', icon: TrendingUp },
        { id: 'custom-branding', title: 'Custom Branding', icon: Star },
        { id: 'token-verification', title: 'Token Verification', icon: Check }
      ]
    },
    {
      id: 'seilor',
      title: 'Seilor 0 - AI Agent',
      icon: Bot,
      items: [
        { id: 'seilor-intro', title: 'Meet Seilor 0', icon: Bot },
        { id: 'ai-trading', title: 'AI Trading Features', icon: TrendingUp },
        { id: 'real-time-data', title: 'Real-time Data', icon: Activity },
        { id: 'portfolio-management', title: 'Portfolio Management', icon: Settings },
        { id: 'trading-strategies', title: 'Trading Strategies', icon: Terminal }
      ]
    },
    {
      id: 'safechecker',
      title: 'SafeChecker - Security',
      icon: Shield,
      items: [
        { id: 'security-overview', title: 'Security Overview', icon: Shield },
        { id: 'token-scanning', title: 'Token Scanning', icon: Search },
        { id: 'risk-assessment', title: 'Risk Assessment', icon: Activity },
        { id: 'security-scores', title: 'Security Scores', icon: Star },
        { id: 'honeypot-detection', title: 'Honeypot Detection', icon: Lock }
      ]
    },
    {
      id: 'dev++',
      title: 'Dev++ - Developer Tools',
      icon: Code,
      items: [
        { id: 'dev++-overview', title: 'Dev++ Overview', icon: Code },
        { id: 'token-tracking', title: 'Token Tracking', icon: Activity },
        { id: 'analytics', title: 'Analytics Dashboard', icon: TrendingUp },
        { id: 'data-export', title: 'Data Export', icon: Database }
      ]
    }
  ];

  // Content for each documentation section
  const documentationContent = {
    'introduction': {
      title: '🚀 Welcome to Seifun',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">🌟 What is Seifun?</h2>
            <p className="text-gray-300 mb-4">
              Seifun is a comprehensive DeFi ecosystem built on Sei Network that combines AI-powered trading, 
              advanced token creation tools, security analysis, and seamless user experience.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white/5 rounded-lg p-4">
                <Bot className="w-8 h-8 text-blue-400 mb-2" />
                <h3 className="font-semibold text-white mb-2">AI Trading Agent</h3>
                <p className="text-sm text-gray-400">Seilor 0 - Intelligent blockchain assistant with real-time data</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <Layers className="w-8 h-8 text-green-400 mb-2" />
                <h3 className="font-semibold text-white mb-2">SeiList</h3>
                <p className="text-sm text-gray-400">Professional token creation and listing platform</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <Shield className="w-8 h-8 text-red-400 mb-2" />
                <h3 className="font-semibold text-white mb-2">SafeChecker</h3>
                <p className="text-sm text-gray-400">Advanced token security scanner</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <Code className="w-8 h-8 text-purple-400 mb-2" />
                <h3 className="font-semibold text-white mb-2">Dev++</h3>
                <p className="text-sm text-gray-400">Professional developer tools and analytics</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">🎯 Key Features</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">AI-Powered Intelligence</h4>
                <ul className="text-gray-300 space-y-1 ml-4">
                  <li>• Real blockchain data integration</li>
                  <li>• Smart contract analysis</li>
                  <li>• Portfolio management</li>
                  <li>• Trading recommendations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">Token Creation & Management</h4>
                <ul className="text-gray-300 space-y-1 ml-4">
                  <li>• Professional token deployment</li>
                  <li>• Custom branding and naming</li>
                  <li>• Liquidity provision guidance</li>
                  <li>• Automatic verification</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-400 mb-2">Security & Safety</h4>
                <ul className="text-gray-300 space-y-1 ml-4">
                  <li>• Comprehensive token scanning</li>
                  <li>• Risk score analysis</li>
                  <li>• Honeypot detection</li>
                  <li>• Real-time security monitoring</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/20">
            <h3 className="text-xl font-bold text-white mb-4">🚀 Quick Start</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <span className="text-gray-300">Connect your wallet (MetaMask, WalletConnect, etc.)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <span className="text-gray-300">Explore Seilor 0 for AI-powered trading insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <span className="text-gray-300">Create tokens with SeiList or scan with SafeChecker</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                <span className="text-gray-300">Monitor your projects with Dev++ dashboard</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    'quick-start': {
      title: '⚡ Quick Start Guide',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6 border border-green-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Get Started in Minutes</h2>
            <p className="text-gray-300">
              Follow this guide to get up and running with Seifun quickly and efficiently.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-blue-400" />
                Step 1: Connect Your Wallet
              </h3>
              <p className="text-gray-300 mb-4">
                Seifun supports multiple wallet types for seamless Web3 integration:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">MetaMask</h4>
                  <p className="text-sm text-gray-400">Most popular browser wallet</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">WalletConnect</h4>
                  <p className="text-sm text-gray-400">Mobile wallet integration</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Coinbase Wallet</h4>
                  <p className="text-sm text-gray-400">Coinbase's self-custody wallet</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-blue-300">
                  <strong>💡 Tip:</strong> Make sure you're connected to the Sei Network for full functionality.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Bot className="w-6 h-6 mr-2 text-green-400" />
                Step 2: Meet Seilor 0
              </h3>
              <p className="text-gray-300 mb-4">
                Start with our AI trading agent for intelligent blockchain insights:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Get real-time wallet balance and transaction history</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Analyze tokens for security and investment potential</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Get AI-powered trading recommendations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Access your todo list and project management</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Layers className="w-6 h-6 mr-2 text-purple-400" />
                Step 3: Explore Core Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-blue-400" />
                    SeiList
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">Create and launch professional tokens</p>
                  <button 
                    onClick={() => window.location.href = '/app/seilist'}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Launch SeiList
                  </button>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-red-400" />
                    SafeChecker
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">Scan tokens for security risks</p>
                  <button 
                    onClick={() => window.location.href = '/app/safechecker'}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Open SafeChecker
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    'token-creation': {
      title: '🪙 Token Creation with SeiList',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-6 border border-purple-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Professional Token Creation</h2>
            <p className="text-gray-300">
              SeiList provides a comprehensive 4-step process for creating and launching professional tokens on Sei Network.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">🎯 4-Step Creation Process</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Token Details</h4>
                    <p className="text-gray-400 text-sm">Define your token's name, symbol, description, and upload a custom logo</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Launch Settings</h4>
                    <p className="text-gray-400 text-sm">Configure supply, percentages, and choose between Fair Launch or Presale</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Review & Create</h4>
                    <p className="text-gray-400 text-sm">Preview your token with stunning graphics and custom naming</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Success & Liquidity</h4>
                    <p className="text-gray-400 text-sm">Token created! Get guidance for adding liquidity on DEXes</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">✨ Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-400">Branding & Design</h4>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Custom logo upload & auto-generation</li>
                    <li>• Stunning token preview with spotlight effects</li>
                    <li>• Custom URL naming (seifu.fun/yourtoken)</li>
                    <li>• Professional metadata structure</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-400">Technical Features</h4>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Real smart contract deployment</li>
                    <li>• Automatic Dev++ integration</li>
                    <li>• Enhanced SafeChecker recognition</li>
                    <li>• IPFS metadata storage</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/20">
              <h3 className="text-xl font-bold text-white mb-4">💡 Best Practices</h3>
              <div className="space-y-3 text-gray-300">
                <p><strong>Token Design:</strong> Use clear, memorable names and symbols. Upload high-quality logos for better recognition.</p>
                <p><strong>Economics:</strong> Plan your tokenomics carefully. Consider reasonable supply and fair distribution.</p>
                <p><strong>Liquidity:</strong> Prepare to add liquidity on DEXes like Astroport or Dragonswap after creation.</p>
                <p><strong>Security:</strong> Test with small amounts first and always verify your token address.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    'ai-trading': {
      title: '🤖 AI Trading with Seilor 0',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6 border border-green-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Meet Seilor 0 - Your AI Trading Assistant</h2>
            <p className="text-gray-300">
              Seilor 0 is an intelligent blockchain assistant that provides real-time data, analysis, and trading insights powered by live Sei Network data.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">🌟 Real Features (No Mockups)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-400 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Live Blockchain Data
                  </h4>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Real-time wallet balance checking</li>
                    <li>• Actual transaction history from Sei RPC</li>
                    <li>• Live token analysis and contract verification</li>
                    <li>• Real security scoring and risk assessment</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-400 flex items-center">
                    <Bot className="w-5 h-5 mr-2" />
                    AI Intelligence
                  </h4>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• ChatGPT-like conversational interface</li>
                    <li>• Context-aware responses</li>
                    <li>• Todo list management and tracking</li>
                    <li>• Portfolio analysis and insights</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">💬 Example Conversations</h3>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-blue-300 font-medium mb-2">You: "What's my SEI balance?"</p>
                  <p className="text-gray-300 text-sm">Seilor 0: Fetches your actual balance from the Sei blockchain and displays it with recent transaction activity.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-blue-300 font-medium mb-2">You: "Analyze token 0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1"</p>
                  <p className="text-gray-300 text-sm">Seilor 0: Performs real contract verification, security analysis, and provides detailed token information.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-blue-300 font-medium mb-2">You: "Add 'Research new DeFi protocols' to my todo"</p>
                  <p className="text-gray-300 text-sm">Seilor 0: Adds the task to your actual todo list and provides task management suggestions.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-4">🚀 Getting Started</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <span className="text-gray-300">Connect your wallet to enable real data access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <span className="text-gray-300">Start chatting - ask about balances, tokens, or trading</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  <span className="text-gray-300">Use todo management for project tracking</span>
                </div>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => window.location.href = '/app/seilor'}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Chat with Seilor 0
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    'security-overview': {
      title: '🛡️ SafeChecker Security Overview',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg p-6 border border-red-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Advanced Token Security Analysis</h2>
            <p className="text-gray-300">
              SafeChecker provides comprehensive security analysis for tokens on Sei Network, helping you identify risks and make informed decisions.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">🔍 Security Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-red-400 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Risk Assessment
                  </h4>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Contract verification status</li>
                    <li>• Ownership analysis</li>
                    <li>• Function accessibility review</li>
                    <li>• Security score calculation (0-100)</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-orange-400 flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Detection Systems
                  </h4>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Honeypot detection</li>
                    <li>• Rug pull indicators</li>
                    <li>• Suspicious pattern analysis</li>
                    <li>• High-risk behavior flagging</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">📊 Risk Score System</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">70+</div>
                  <div>
                    <h4 className="font-semibold text-green-400">Low Risk</h4>
                    <p className="text-gray-300 text-sm">Well-structured contract with standard functions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">40-69</div>
                  <div>
                    <h4 className="font-semibold text-yellow-400">Medium Risk</h4>
                    <p className="text-gray-300 text-sm">Some concerning patterns but potentially legitimate</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">&lt;40</div>
                  <div>
                    <h4 className="font-semibold text-red-400">High Risk</h4>
                    <p className="text-gray-300 text-sm">Multiple red flags detected - exercise extreme caution</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/20">
              <h3 className="text-xl font-bold text-white mb-4">🎯 How to Use SafeChecker</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <span className="text-gray-300">Enter the token contract address you want to analyze</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <span className="text-gray-300">Review the comprehensive security report</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  <span className="text-gray-300">Make informed decisions based on risk score and analysis</span>
                </div>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => window.location.href = '/app/safechecker'}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Open SafeChecker
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    'dev++-overview': {
      title: '💻 Dev++ Developer Dashboard',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Professional Developer Tools</h2>
            <p className="text-gray-300">
              Dev++ provides comprehensive token management, security monitoring, and analytics for developers and project creators.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">📊 Dashboard Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-400 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Real-time Monitoring
                  </h4>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Live token tracking and analytics</li>
                    <li>• Security score monitoring</li>
                    <li>• Activity feed and alerts</li>
                    <li>• Performance metrics</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-400 flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Data Management
                  </h4>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Token portfolio overview</li>
                    <li>• Export functionality</li>
                    <li>• Historical data tracking</li>
                    <li>• Integration status monitoring</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Key Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <Code className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">Active Tokens</div>
                  <div className="text-sm text-gray-400">Created & Tracked</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">Avg Security</div>
                  <div className="text-sm text-gray-400">Score Rating</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <Check className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">Verified</div>
                  <div className="text-sm text-gray-400">Tokens</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <Activity className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">Alerts</div>
                  <div className="text-sm text-gray-400">Active Monitoring</div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-4">🚀 Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => window.location.href = '/app/seilist'}
                  className="bg-white/5 hover:bg-white/10 rounded-lg p-4 text-left transition-colors border border-white/10"
                >
                  <Zap className="w-8 h-8 text-blue-400 mb-2" />
                  <div className="font-semibold text-white">Launch Token</div>
                  <div className="text-sm text-gray-400">Create new token</div>
                </button>
                <button 
                  onClick={() => window.location.href = '/app/safechecker'}
                  className="bg-white/5 hover:bg-white/10 rounded-lg p-4 text-left transition-colors border border-white/10"
                >
                  <Shield className="w-8 h-8 text-red-400 mb-2" />
                  <div className="font-semibold text-white">Security Scan</div>
                  <div className="text-sm text-gray-400">Analyze tokens</div>
                </button>
                <button 
                  className="bg-white/5 hover:bg-white/10 rounded-lg p-4 text-left transition-colors border border-white/10"
                >
                  <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
                  <div className="font-semibold text-white">Analytics</div>
                  <div className="text-sm text-gray-400">View metrics</div>
                </button>
                <button 
                  className="bg-white/5 hover:bg-white/10 rounded-lg p-4 text-left transition-colors border border-white/10"
                >
                  <Database className="w-8 h-8 text-purple-400 mb-2" />
                  <div className="font-semibold text-white">Export Data</div>
                  <div className="text-sm text-gray-400">Download reports</div>
                </button>
              </div>
              <div className="mt-6">
                <button 
                  onClick={() => window.location.href = '/app/dev-plus'}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Open Dev++ Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  // Enhanced search functionality with content search
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results: any[] = [];
    const searchTerm = query.toLowerCase();

    // Search through all sections and items
    documentationSections.forEach(section => {
      // Check section title match
      if (section.title.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'section',
          id: section.id,
          title: section.title,
          description: `${section.items.length} topics available`,
          icon: section.icon,
          relevance: section.title.toLowerCase().indexOf(searchTerm)
        });
      }

      // Check individual items
      section.items.forEach(item => {
        if (item.title.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'item',
            id: item.id,
            title: item.title,
            description: `In ${section.title}`,
            icon: item.icon,
            sectionId: section.id,
            relevance: item.title.toLowerCase().indexOf(searchTerm)
          });
        }
      });

      // Search actual content by extracting text from JSX
      const content = documentationContent[section.id as keyof typeof documentationContent];
      if (content) {
        const extractedText = extractTextFromContent(content);
        if (extractedText.toLowerCase().includes(searchTerm)) {
          // Find the specific context around the match
          const contextMatch = findContextAroundMatch(extractedText, searchTerm);
          results.push({
            type: 'content',
            id: section.id,
            title: `${section.title} (Content Match)`,
            description: contextMatch,
            icon: section.icon,
            relevance: extractedText.toLowerCase().indexOf(searchTerm)
          });
        }
      }
    });

    // Search specific keywords and topics
    const keywordMatches = searchKeywords(searchTerm);
    results.push(...keywordMatches);

    // Sort by relevance (exact matches first, then by type priority)
    results.sort((a, b) => {
      // Prioritize exact matches
      if (a.relevance !== b.relevance) {
        return a.relevance - b.relevance;
      }
      // Then prioritize by type: keyword > item > section
      const typePriority = { keyword: 0, item: 1, section: 2, content: 3 };
      return typePriority[a.type] - typePriority[b.type];
    });
    
    setSearchResults(results.slice(0, 8)); // Limit to top 8 results for better UX
    setTimeout(() => setIsSearching(false), 100); // Small delay to prevent flickering
  };

  // Keyword-based search for common topics
  const searchKeywords = (query: string): any[] => {
    const keywords = {
      // Core Features
      'token': [
        { id: 'seilist-intro', title: 'Token Creation with SeiList', section: 'Token Creation', icon: Layers },
        { id: 'token-creation', title: 'Token Creation Guide', section: 'SeiList', icon: Code }
      ],
      'ai': [
        { id: 'seilor-intro', title: 'Seilor 0 AI Agent', section: 'AI Agent', icon: Bot },
        { id: 'ai-features', title: 'AI Features Overview', section: 'AI Agent', icon: TrendingUp }
      ],
      'security': [
        { id: 'security-overview', title: 'Security with SafeChecker', section: 'SafeChecker', icon: Shield },
        { id: 'token-scanning', title: 'Token Security Scanning', section: 'SafeChecker', icon: Search }
      ],
      'defi': [
        { id: 'seilor-intro', title: 'DeFi Operations with Seilor', section: 'AI Agent', icon: Bot },
        { id: 'defi-features', title: 'DeFi Features', section: 'AI Agent', icon: TrendingUp }
      ],
      
      // Specific Products
      'seilor': [
        { id: 'seilor-intro', title: 'Meet Seilor 0', section: 'AI Agent', icon: Bot }
      ],
      'seilist': [
        { id: 'seilist-intro', title: 'SeiList Token Creation', section: 'Token Creation', icon: Layers }
      ],
      'safechecker': [
        { id: 'security-overview', title: 'SafeChecker Security', section: 'SafeChecker', icon: Shield }
      ],
      'dev++': [
        { id: 'developer-tools', title: 'Dev++ Developer Tools', section: 'Developer Tools', icon: Code }
      ],
      
      // DeFi Operations
      'swap': [
        { id: 'seilor-intro', title: 'Token Swapping with Seilor', section: 'AI Agent', icon: Bot }
      ],
      'staking': [
        { id: 'seilor-intro', title: 'Staking with Seilor', section: 'AI Agent', icon: Bot }
      ],
      'lending': [
        { id: 'seilor-intro', title: 'Lending with Seilor', section: 'AI Agent', icon: Bot }
      ],
      'trading': [
        { id: 'seilor-intro', title: 'AI Trading with Seilor', section: 'AI Agent', icon: TrendingUp }
      ],
      
      // User Actions
      'wallet': [
        { id: 'wallet-connection', title: 'Wallet Connection', section: 'Getting Started', icon: Lock }
      ],
      'connect': [
        { id: 'wallet-connection', title: 'Connect Wallet', section: 'Getting Started', icon: Lock }
      ],
      'create': [
        { id: 'seilist-intro', title: 'Create Tokens', section: 'Token Creation', icon: Layers }
      ],
      'scan': [
        { id: 'security-overview', title: 'Scan Tokens', section: 'SafeChecker', icon: Shield }
      ],
      
      // Getting Started
      'quick': [
        { id: 'quick-start', title: 'Quick Start Guide', section: 'Getting Started', icon: Zap }
      ],
      'start': [
        { id: 'introduction', title: 'Getting Started', section: 'Getting Started', icon: Home },
        { id: 'quick-start', title: 'Quick Start', section: 'Getting Started', icon: Zap }
      ],
      'guide': [
        { id: 'introduction', title: 'User Guide', section: 'Getting Started', icon: Home }
      ],
      
      // Technical Terms
      'blockchain': [
        { id: 'seilor-intro', title: 'Blockchain Operations', section: 'AI Agent', icon: Bot }
      ],
      'sei': [
        { id: 'introduction', title: 'Sei Network Features', section: 'Getting Started', icon: Home }
      ],
      'smart contract': [
        { id: 'seilist-intro', title: 'Smart Contract Deployment', section: 'Token Creation', icon: Code }
      ],
      'portfolio': [
        { id: 'seilor-intro', title: 'Portfolio Management', section: 'AI Agent', icon: Bot }
      ]
    };

    const results: any[] = [];
    Object.entries(keywords).forEach(([keyword, items]) => {
      if (query.toLowerCase().includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(query.toLowerCase())) {
        items.forEach(item => {
          // Check if we already have this item to avoid duplicates
          const exists = results.some(r => r.id === item.id);
          if (!exists) {
            results.push({
              type: 'keyword',
              id: item.id,
              title: item.title,
              description: `Keyword match: ${keyword}`,
              icon: item.icon,
              relevance: 0 // High relevance for keyword matches
            });
          }
        });
      }
    });

    return results;
  };

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function to extract text content from JSX elements
  const extractTextFromContent = (contentObj: any): string => {
    if (!contentObj || !contentObj.content) return '';
    
    // Convert JSX to string by extracting text content
    const extractTextFromJSX = (element: any): string => {
      if (typeof element === 'string') return element;
      if (typeof element === 'number') return element.toString();
      if (!element) return '';
      
      if (React.isValidElement(element)) {
        const props = element.props;
        let text = '';
        
        // Extract text from children
        if (props.children) {
          if (Array.isArray(props.children)) {
            text += props.children.map(extractTextFromJSX).join(' ');
          } else {
            text += extractTextFromJSX(props.children);
          }
        }
        
        return text;
      }
      
      if (Array.isArray(element)) {
        return element.map(extractTextFromJSX).join(' ');
      }
      
      return '';
    };
    
    return extractTextFromJSX(contentObj.content);
  };

  // Helper function to find context around a search match
  const findContextAroundMatch = (text: string, searchTerm: string, contextLength: number = 100): string => {
    const lowerText = text.toLowerCase();
    const lowerTerm = searchTerm.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerTerm);
    
    if (matchIndex === -1) return text.substring(0, contextLength) + '...';
    
    const start = Math.max(0, matchIndex - contextLength / 2);
    const end = Math.min(text.length, matchIndex + searchTerm.length + contextLength / 2);
    
    let context = text.substring(start, end);
    
    // Add ellipsis if we're not at the beginning/end
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    
    return context;
  };

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.items.some(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentContent = documentationContent[activeSection as keyof typeof documentationContent] || documentationContent.introduction;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
                data-menu-button
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold">Seifun Documentation</h1>
                  <p className="text-sm text-gray-400">Complete guide to the Seifun ecosystem</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative search-container">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {/* Search Results Dropdown */}
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        Searching...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-700">
                          Search Results ({searchResults.length})
                        </div>
                        {searchResults.map((result, index) => {
                          const IconComponent = result.icon;
                          return (
                            <button
                              key={`${result.id}-${index}`}
                              onClick={() => {
                                setActiveSection(result.id);
                                setSearchQuery('');
                                setSearchResults([]);
                              }}
                              className="w-full text-left px-3 py-3 hover:bg-gray-700 border-b border-gray-700/50 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  <IconComponent className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-white truncate">
                                    {result.title}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {result.description}
                                  </div>
                                  <div className="flex items-center mt-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      result.type === 'section' ? 'bg-blue-100 text-blue-800' :
                                      result.type === 'item' ? 'bg-green-100 text-green-800' :
                                      result.type === 'keyword' ? 'bg-purple-100 text-purple-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {result.type === 'section' ? 'Section' :
                                       result.type === 'item' ? 'Topic' :
                                       result.type === 'keyword' ? 'Keyword' :
                                       'Content'}
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-400">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <div className="text-sm">No results found for "{searchQuery}"</div>
                        <div className="text-xs mt-1">Try searching for: token, ai, security, wallet, trading</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <a
                href="https://github.com/Seifun1/Seifun"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-white"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`} data-sidebar>
            <div className="bg-gray-800 rounded-lg p-4 sticky top-24">
              <nav className="space-y-2">
                {filteredSections.map((section) => {
                  const SectionIcon = section.icon;
                  return (
                    <div key={section.id}>
                      <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 border-b border-gray-700 mb-2">
                        <SectionIcon className="w-4 h-4" />
                        <span>{section.title}</span>
                      </div>
                      <div className="space-y-1 ml-6">
                        {section.items.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveSection(item.id);
                                setIsSidebarOpen(false);
                              }}
                              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                activeSection === item.id
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              <ItemIcon className="w-4 h-4" />
                              <span>{item.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-800 rounded-lg p-8">
              <h1 className="text-3xl font-bold text-white mb-6">{currentContent.title}</h1>
              {currentContent.content}
            </div>
            
            {/* Footer */}
            <div className="mt-8 p-6 bg-gray-800 rounded-lg border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-4">
                  <a href="https://github.com/Seifun1/Seifun" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="https://twitter.com/SeifunDeFi" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;