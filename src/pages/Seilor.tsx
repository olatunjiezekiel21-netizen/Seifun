import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  History, 
  CreditCard, 
  CheckSquare, 
  Plus
} from 'lucide-react';
import { useReownWallet } from '../utils/reownWalletConnection';
import { chatBrain } from '../services/ChatBrain';
import { actionBrain, IntentType } from '../services/ActionBrain';
import { privateKeyWallet } from '../services/PrivateKeyWallet';

const Seilor = () => {
  const [activePanel, setActivePanel] = useState<'chat' | 'history' | 'transactions' | 'todo' | 'ai-tools'>('chat');
  const [aiChat, setAiChat] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{
    id: number;
    type: 'user' | 'assistant';
    message: string;
    timestamp: Date;
  }>>([
    {
      id: 1,
      type: 'assistant',
      message: `👋 **Hey there! I'm Seilor 0, your AI DeFi companion!**\n\nI'm here to help you navigate the Sei Network with ChatGPT-level intelligence. Just talk to me naturally!\n\n**🎯 I can help you with:**\n• Checking your wallet balance and portfolio\n• Swapping tokens on Symphony DEX\n• Staking SEI for yield on Silo\n• Lending and borrowing on Takara\n• Trading on Citrex exchange\n• Analyzing token contracts for safety\n• Creating and managing tokens\n\n**💬 Just tell me what you want to do:**\n• "I want to swap some tokens"\n• "What's my current balance?"\n• "Help me stake my SEI"\n• "Is this token safe?" (paste address)\n• "How do I create a token?"\n\n**Let's chat! What's on your mind?** 🚀`,
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [todos, setTodos] = useState<Array<{
    id: string;
    task: string;
    completed: boolean;
    timestamp: Date;
  }>>([]);
  const [walletBalance, setWalletBalance] = useState<{ sei: string; usd: number } | null>(null);

  const { isConnected, address } = useReownWallet();

  // Load wallet balance on component mount
  useEffect(() => {
    loadWalletBalance();
    
    // Load saved todos
    const savedTodos = localStorage.getItem('seilor_todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('seilor_todos', JSON.stringify(todos));
  }, [todos]);

  const loadWalletBalance = async () => {
    try {
      const balance = await privateKeyWallet.getSeiBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  // Enhanced AI chat handler using Chat Brain system
  const handleAiChat = async () => {
    if (!aiChat.trim() || loading) return;
    
    setLoading(true);
    const userMessage = aiChat.trim();
    setAiChat('');
    
    // Add user message immediately
    const userChatMessage = {
      id: Date.now(),
      type: 'user' as const,
      message: userMessage,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userChatMessage]);
    
    try {
      // Process message through Chat Brain (which uses Action Brain)
      const response = await chatBrain.processMessage(userMessage);
      
      // Add AI response
      const aiResponse = {
        id: Date.now() + 1,
        type: 'assistant' as const,
        message: response.message,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
      
      // Add suggestions if available
      if (response.suggestions && response.suggestions.length > 0) {
        const suggestionsMessage = {
          id: Date.now() + 2,
          type: 'assistant' as const,
          message: `💡 **Quick Actions:**\n${response.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, suggestionsMessage]);
      }
      
    } catch (error) {
      console.error('Chat Brain Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant' as const,
        message: `❌ **I encountered an issue processing your message.**\n\n**Error**: ${error.message}\n\n**Please try**: Being more specific or rephrasing your request.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Removed quick action handlers - focusing on conversational AI

  // Todo management
  const addTodo = (task: string) => {
    if (!task.trim()) return;
    
    const todoItem = {
      id: Date.now().toString(),
      task: task.trim(),
      completed: false,
      timestamp: new Date()
    };
    setTodos(prev => [...prev, todoItem]);
  };

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo('');
    }
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const panels = [
    { id: 'chat', label: 'AI Chat', icon: Bot },
    { id: 'history', label: 'History', icon: History },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'todo', label: 'Todo List', icon: CheckSquare }
  ];

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
                  <p className="text-xs text-slate-400">Autonomous AI Trading Agent</p>
                </div>
              </div>
            </div>
            
            {/* Wallet Status */}
            <div className="flex items-center space-x-4">
              {walletBalance && (
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{walletBalance.sei} SEI</div>
                  <div className="text-xs text-slate-400">${walletBalance.usd.toFixed(2)}</div>
                </div>
              )}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur-sm border border-slate-700/50">
              <nav className="space-y-2">
                {panels.map((panel) => {
                  const IconComponent = panel.icon;
                  return (
                    <button
                      key={panel.id}
                      onClick={() => setActivePanel(panel.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        activePanel === panel.id
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{panel.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-700/50 overflow-hidden">
              {/* Chat Panel */}
              {activePanel === 'chat' && (
                <div className="h-[600px] flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-3xl p-4 rounded-2xl ${
                          msg.type === 'user'
                            ? 'bg-red-500/20 text-white border border-red-500/30'
                            : 'bg-slate-700/50 text-slate-100 border border-slate-600/50'
                        }`}>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.message}
                          </div>
                          <div className="text-xs text-slate-400 mt-2">
                            {msg.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-700/50 text-slate-100 border border-slate-600/50 p-4 rounded-2xl">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            <span className="text-sm">Seilor is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-slate-700/50 p-4">
                    {/* Balance Display */}
                    {walletBalance && (
                      <div className="mb-3 p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-slate-300">💰 Wallet Balance</div>
                          <div className="text-sm font-medium text-white">
                            {walletBalance.sei} SEI <span className="text-xs text-slate-400">(${walletBalance.usd.toFixed(2)})</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Chat Input */}
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={aiChat}
                        onChange={(e) => setAiChat(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                        placeholder="💬 Ask me anything... Try: 'I want to swap tokens' or 'What's my balance?'"
                        className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 focus:outline-none"
                        disabled={loading}
                      />
                      <button
                        onClick={handleAiChat}
                        disabled={loading || !aiChat.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Todo Panel */}
              {activePanel === 'todo' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Todo List</h2>
                    <div className="text-sm text-slate-400">
                      {todos.filter(t => !t.completed).length} pending
                    </div>
                  </div>

                  {/* Add Todo */}
                  <div className="flex space-x-3 mb-6">
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                      placeholder="Add a new task..."
                      className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 focus:outline-none"
                    />
                    <button
                      onClick={handleAddTodo}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Todo List */}
                  <div className="space-y-3">
                    {todos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          todo.completed
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-slate-700/30 border-slate-600/50 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleTodo(todo.id)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                todo.completed
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-slate-400 hover:border-red-500'
                              }`}
                            >
                              {todo.completed && <span className="text-white text-xs">✓</span>}
                            </button>
                            <span className={todo.completed ? 'line-through' : ''}>
                              {todo.task}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {todos.length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                        <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No todos yet. Add one above!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Other panels can be added here */}
              {activePanel === 'history' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Chat History</h2>
                  <div className="text-slate-400">
                    <p>Chat history feature coming soon...</p>
                    <p className="text-sm mt-2">Your conversations with Seilor 0 will be saved here.</p>
                  </div>
                </div>
              )}

              {activePanel === 'transactions' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Transactions</h2>
                  <div className="text-slate-400">
                    <p>Transaction history feature coming soon...</p>
                    <p className="text-sm mt-2">Your blockchain transactions will be displayed here.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seilor;