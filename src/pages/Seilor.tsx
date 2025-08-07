import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Zap, Target, Globe, Sparkles, Bot, ChevronRight, ExternalLink, 
  Star, Users, DollarSign, Calendar, AlertCircle, AlertTriangle, Info, Activity, BarChart3, 
  Filter, Search, ArrowUpDown, Eye, MessageCircle, Send, Copy, Bookmark, Shield, X,
  RefreshCw, ArrowLeft, ArrowRight, Home, Lock, Maximize2, Wallet, Heart, Rocket
} from 'lucide-react';
import { getSeiDApps, getAlphaInsights, getSeiNetworkStats, getDAppCategories, type SeiDApp, type AlphaInsight } from '../utils/seiEcosystemData';
import { AIChatDataService } from '../utils/aiChatDataService';
import { TokenScanner } from '../utils/tokenScanner';
import { SeiTokenRegistry } from '../utils/seiTokenRegistry';
import { IntelligentAIChat } from '../utils/intelligentAIChat';
import { AdvancedAIAgent } from '../utils/advancedAIAgent';
import { useReownWallet } from '../utils/reownWalletConnection';

const Seilor = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const [aiChat, setAiChat] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenScanner] = useState(() => new TokenScanner());
  const [seiRegistry] = useState(() => new SeiTokenRegistry(false));
  const [advancedAI] = useState(() => new AdvancedAIAgent());
  
  // Wallet integration
  // ReOWN Kit wallet connection with comprehensive support
  const {
    isConnected,
    address,
    balance,
    isConnecting,
    error,
    walletType,
    connectWallet,
    disconnectWallet,
    getAvailableWallets
  } = useReownWallet();

  // Get available wallets for display
  const availableWallets = getAvailableWallets();
  const installedWallets = availableWallets.filter(w => w.installed);
  const hasInstalledWallets = installedWallets.length > 0;
  
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'ai',
      message: "👋 **Welcome to Seilor 0!** I'm your AI Trading Agent for the Sei ecosystem.\n\nI can help you:\n• **Analyze** tokens with real-time security data\n• **Execute** smart trading decisions\n• **Monitor** market trends and opportunities\n• **Scan** tokens for safety and risks\n• **Provide** personalized trading insights\n• **Remember** your preferences and trading history\n\nConnect your wallet and let's start trading smarter! What token would you like me to analyze?",
      timestamp: new Date()
    }
  ]);

  // Intelligent AI chat handler with memory and real analysis
  const handleAiChat = async () => {
    if (!aiChat.trim()) return;

    const userMessage = aiChat.trim();
    setAiChat('');

    // Add user message to UI
    const newUserMessage = {
      type: 'user',
      message: userMessage,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newUserMessage]);

    setLoading(true);

    try {
      // Use the advanced AI agent for intelligent responses
      let response;
      
      if (userMessage.toLowerCase().includes('scan') || userMessage.toLowerCase().includes('analyze')) {
        // Token analysis request
        const tokenAddress = userMessage.match(/0x[a-fA-F0-9]{40}/)?.[0];
        if (tokenAddress) {
          try {
            const analysis = await tokenScanner.analyzeToken(tokenAddress);
            response = await advancedAI.generateResponse(userMessage, {
              context: 'token_analysis',
              tokenData: analysis,
              userWallet: address,
              isConnected
            });
          } catch (error) {
            response = await advancedAI.generateResponse(userMessage + ' (Note: Token analysis failed - please verify the token address)', {
              context: 'token_analysis_error',
              userWallet: address,
              isConnected
            });
          }
        } else {
          response = await advancedAI.generateResponse(userMessage, {
            context: 'general_analysis',
            userWallet: address,
            isConnected
          });
        }
      } else {
        // General AI conversation with context
        response = await advancedAI.generateResponse(userMessage, {
          context: 'general',
          userWallet: address,
          isConnected,
          chatHistory: chatMessages.slice(-5) // Last 5 messages for context
        });
      }

      const aiResponse = {
        type: 'ai',
        message: response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorResponse = {
        type: 'ai',
        message: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment, or feel free to ask me something else!",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  // Only AI Assistant tab
  const tabs = [
    { id: 'ai', label: 'AI Trading Agent', icon: Bot }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Seilor 0</h1>
                  <p className="text-xs text-slate-400">AI Trading Agent</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Wallet Connection */}
              {isConnected ? (
                <div className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-medium">{address?.slice(0,6)}...{address?.slice(-4)}</span>
                </div>
              ) : (
                <button
                  onClick={() => connectWallet()}
                  disabled={isConnecting}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  <span>
                    {isConnecting 
                      ? 'Connecting...' 
                      : hasInstalledWallets 
                        ? 'Connect' 
                        : 'Get Wallet'}
                  </span>
                </button>
              )}

              {/* Wallet Installation Guide */}
              {!hasInstalledWallets && !isConnected && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl z-50">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Info className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-medium text-white">Setup Wallet</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="text-slate-400">
                        <strong className="text-slate-300">Option 1:</strong> Use any mobile wallet (Trust Wallet, MetaMask Mobile, Rainbow, etc.)
                      </div>
                      <div className="text-slate-400">
                        <strong className="text-slate-300">Option 2:</strong> Install a desktop wallet:
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <a 
                          href="https://finwallet.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs flex items-center space-x-1"
                        >
                          <span>🔗</span>
                          <span>Fin Wallet</span>
                        </a>
                        <a 
                          href="https://metamask.io" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs flex items-center space-x-1"
                        >
                          <span>🦊</span>
                          <span>MetaMask</span>
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => connectWallet()}
                      disabled={isConnecting}
                      className="mt-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {isConnecting ? 'Opening...' : 'Connect Mobile Wallet'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* AI Trading Agent Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Seilor AI Trading Agent</h3>
                  <p className="text-xs text-slate-400">Powered by advanced Sei blockchain intelligence</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((message, index) => (
                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl p-4 rounded-2xl ${
                    message.type === 'user' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-slate-700/50 text-slate-100'
                  }`}>
                    <div className="prose prose-sm max-w-none">
                      {message.message.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <div key={i} className="font-bold text-white mb-2">{line.slice(2, -2)}</div>;
                        } else if (line.startsWith('• ')) {
                          return <div key={i} className="ml-4 mb-1">{line}</div>;
                        } else if (line.trim() === '') {
                          return <div key={i} className="h-2"></div>;
                        } else {
                          return <div key={i} className="mb-1">{line}</div>;
                        }
                      })}
                    </div>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700/50 text-slate-100 p-4 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="bg-slate-700/30 px-6 py-4 border-t border-slate-700/50">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={aiChat}
                  onChange={(e) => setAiChat(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                  placeholder="Ask me to analyze a token, check market trends, or help with trading decisions..."
                  className="flex-1 bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                />
                <button
                  onClick={handleAiChat}
                  disabled={!aiChat.trim() || loading}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seilor;