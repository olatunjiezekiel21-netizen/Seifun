import React, { useState, useEffect } from 'react';
import { 
  Bot, Send, Wallet, Info, History, List, Activity, 
  Clock, TrendingUp, AlertCircle, CheckCircle, X, Menu
} from 'lucide-react';
import { ProfessionalAIAgent } from '../utils/professionalAI';
import { SeiTradingService, type TransactionHistory, type ProtocolInteraction } from '../utils/seiTradingService';
import { useReownWallet } from '../utils/reownWalletConnection';

const Seilor = () => {
  const [activePanel, setActivePanel] = useState<'chat' | 'history' | 'transactions' | 'todo'>('chat');
  const [aiChat, setAiChat] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [professionalAI] = useState(() => new ProfessionalAIAgent());
  const [tradingService] = useState(() => new SeiTradingService());
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Wallet integration
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
      message: "👋 **Welcome to Seilor 0!** I'm your professional AI Trading Agent.\n\nI can help you with:\n• **Real-time information** - Ask me about time, date, market data\n• **Token analysis** - Provide any token address for security scanning\n• **Trading assistance** - Portfolio analysis and strategy recommendations\n• **Blockchain insights** - Sei network information and DeFi protocols\n• **General questions** - I can chat about various topics like ChatGPT\n\n🔗 Connect your wallet for personalized trading insights!\n\nTry asking: \"What time is it?\" or \"Analyze token 0x...\" or \"What's the SEI price?\"",
      timestamp: new Date()
    }
  ]);

  // Todo/Task system
  const [todos, setTodos] = useState<Array<{
    id: string;
    task: string;
    completed: boolean;
    timestamp: Date;
  }>>([]);

  // Initialize trading service with wallet
  useEffect(() => {
    if (isConnected && window.ethereum) {
      tradingService.initializeProvider(window.ethereum);
    }
  }, [isConnected, tradingService]);

  // Load saved data safely
  useEffect(() => {
    const initializeComponent = async () => {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        setIsInitialized(true);
        return;
      }
      
      try {
        // Small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Load chat history
        const savedChat = localStorage.getItem('seilor_chat_history');
        if (savedChat) {
          const parsed = JSON.parse(savedChat);
          if (Array.isArray(parsed) && parsed.length > 1) { // Only load if we have more than the default message
            setChatMessages(parsed.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })));
          }
        }

        // Load todos
        const savedTodos = localStorage.getItem('seilor_todos');
        if (savedTodos) {
          const parsed = JSON.parse(savedTodos);
          if (Array.isArray(parsed)) {
            setTodos(parsed.map((todo: any) => ({
              ...todo,
              timestamp: new Date(todo.timestamp)
            })));
          }
        }
      } catch (error) {
        console.warn('Failed to load saved data:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeComponent();
  }, []);

  // Save chat history safely
  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    if (chatMessages.length <= 1) return; // Don't save just the initial message
    
    try {
      localStorage.setItem('seilor_chat_history', JSON.stringify(chatMessages));
    } catch (error) {
      console.warn('Failed to save chat history:', error);
    }
  }, [chatMessages]);

  // Save todos safely
  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    if (todos.length === 0) return; // Don't save empty array
    
    try {
      localStorage.setItem('seilor_todos', JSON.stringify(todos));
    } catch (error) {
      console.warn('Failed to save todos:', error);
    }
  }, [todos]);

  // Professional AI chat handler with real-time capabilities
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
      // Use professional AI with full context
      const response = await professionalAI.generateResponse(userMessage, {
        userWallet: address,
        isConnected,
        currentTime: new Date(),
        chatHistory: chatMessages.slice(-10) // More context for better responses
      });

      const aiResponse = {
        type: 'ai',
        message: response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Professional AI error:', error);
      const errorResponse = {
        type: 'ai',
        message: "I apologize, but I encountered an error processing your request. Please try again or ask a different question. I'm here to help with trading, market analysis, and general questions!",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  // Add todo
  const addTodo = (task: string) => {
    const newTodo = {
      id: Date.now().toString(),
      task,
      completed: false,
      timestamp: new Date()
    };
    setTodos(prev => [...prev, newTodo]);
  };

  // Toggle todo completion
  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Clear chat history
  const clearChatHistory = () => {
    setChatMessages([{
      type: 'ai',
      message: "Chat history cleared! How can I help you today?",
      timestamp: new Date()
    }]);
    professionalAI.clearHistory();
  };

  // Get transaction history
  const transactionHistory = tradingService.getTransactionHistory();
  const protocolInteractions = tradingService.getProtocolInteractions();
  const lastProtocolInteraction = tradingService.getLastProtocolInteraction();

  const panels = [
    { id: 'chat', label: 'AI Chat', icon: Bot },
    { id: 'history', label: 'History', icon: History },
    { id: 'transactions', label: 'Transactions', icon: Activity },
    { id: 'todo', label: 'Todo', icon: List }
  ];

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Initializing Seilor AI</h2>
          <p className="text-slate-400">Setting up your trading agent...</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Seilor 0</h1>
                  <p className="text-xs text-slate-400">Professional AI Trading Agent</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Wallet Connection */}
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-300">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    <span className="text-xs text-slate-400">{balance?.slice(0, 6)} SEI</span>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{isConnecting ? 'Connecting...' : hasInstalledWallets ? 'Connect' : 'Get Wallet'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Navigation */}
          <div className={`lg:col-span-1 ${showMobileMenu ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Navigation</h3>
              <nav className="space-y-2">
                {panels.map((panel) => {
                  const Icon = panel.icon;
                  return (
                    <button
                      key={panel.id}
                      onClick={() => {
                        setActivePanel(panel.id as any);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activePanel === panel.id
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{panel.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Status Section */}
              <div className="mt-6 pt-4 border-t border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Wallet</span>
                    <span className={isConnected ? 'text-green-400' : 'text-slate-500'}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">AI Status</span>
                    <span className="text-green-400">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Protocol</span>
                    <span className="text-slate-400">
                      {lastProtocolInteraction ? lastProtocolInteraction.protocol : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
              
              {/* AI Chat Panel */}
              {activePanel === 'chat' && (
                <>
                  <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">AI Trading Agent</h3>
                          <p className="text-xs text-slate-400">Real-time intelligent assistance</p>
                        </div>
                      </div>
                      <button
                        onClick={clearChatHistory}
                        className="text-slate-400 hover:text-white text-sm"
                      >
                        Clear History
                      </button>
                    </div>
                  </div>

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
                          <div className="text-xs opacity-70 mt-2 flex items-center space-x-2">
                            <Clock className="w-3 h-3" />
                            <span>{message.timestamp.toLocaleTimeString()}</span>
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

                  <div className="bg-slate-700/30 px-6 py-4 border-t border-slate-700/50">
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={aiChat}
                        onChange={(e) => setAiChat(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                        placeholder="Ask me anything - time, market data, token analysis, trading help..."
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
                </>
              )}

              {/* Chat History Panel */}
              {activePanel === 'history' && (
                <>
                  <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <History className="w-6 h-6 text-red-400" />
                      <div>
                        <h3 className="font-bold text-white">Chat History</h3>
                        <p className="text-xs text-slate-400">View all previous conversations</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-96 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {professionalAI.getConversationHistory().slice(-20).map((msg, index) => (
                        <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${msg.type === 'user' ? 'text-blue-400' : 'text-green-400'}`}>
                              {msg.type === 'user' ? 'You' : 'AI'}
                            </span>
                            <span className="text-xs text-slate-400">
                              {msg.timestamp.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-200 text-sm">{msg.message}</p>
                        </div>
                      ))}
                      {professionalAI.getConversationHistory().length === 0 && (
                        <div className="text-center text-slate-400 py-8">
                          <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No conversation history yet</p>
                          <p className="text-sm">Start chatting to build your history</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Transaction History Panel */}
              {activePanel === 'transactions' && (
                <>
                  <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-6 h-6 text-red-400" />
                      <div>
                        <h3 className="font-bold text-white">Transaction History</h3>
                        <p className="text-xs text-slate-400">Track all your trading activities</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-96 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {transactionHistory.map((tx) => (
                        <div key={tx.hash} className="bg-slate-700/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                tx.status === 'confirmed' ? 'bg-green-400' :
                                tx.status === 'pending' ? 'bg-yellow-400' :
                                'bg-red-400'
                              }`}></div>
                              <span className="text-sm font-medium text-white capitalize">{tx.type.replace('_', ' ')}</span>
                            </div>
                            <span className="text-xs text-slate-400">
                              {tx.timestamp.toLocaleString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">Amount:</span>
                              <span className="text-white ml-2">{tx.amount} {tx.tokenSymbol}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Status:</span>
                              <span className={`ml-2 capitalize ${
                                tx.status === 'confirmed' ? 'text-green-400' :
                                tx.status === 'pending' ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>{tx.status}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-slate-400 font-mono">
                            {tx.hash.slice(0, 20)}...{tx.hash.slice(-20)}
                          </div>
                        </div>
                      ))}
                      {transactionHistory.length === 0 && (
                        <div className="text-center text-slate-400 py-8">
                          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No transactions yet</p>
                          <p className="text-sm">Connect your wallet and start trading</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Todo Panel */}
              {activePanel === 'todo' && (
                <>
                  <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <List className="w-6 h-6 text-red-400" />
                      <div>
                        <h3 className="font-bold text-white">AI Todo Assistant</h3>
                        <p className="text-xs text-slate-400">Track tasks and trading goals</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-96 overflow-y-auto p-6">
                    <div className="space-y-3">
                      {todos.map((todo) => (
                        <div key={todo.id} className="flex items-center space-x-3 bg-slate-700/30 rounded-lg p-3">
                          <button
                            onClick={() => toggleTodo(todo.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              todo.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {todo.completed && <CheckCircle className="w-3 h-3" />}
                          </button>
                          <div className="flex-1">
                            <p className={`text-sm ${todo.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                              {todo.task}
                            </p>
                            <p className="text-xs text-slate-400">
                              {todo.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {todos.length === 0 && (
                        <div className="text-center text-slate-400 py-8">
                          <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No tasks yet</p>
                          <p className="text-sm">Ask the AI to add tasks for you</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-700/30 px-6 py-4 border-t border-slate-700/50">
                    <button
                      onClick={() => addTodo('New trading task')}
                      className="w-full py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Add Sample Task
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seilor;