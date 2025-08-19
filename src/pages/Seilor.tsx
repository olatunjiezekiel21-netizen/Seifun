import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  History, 
  CreditCard, 
  CheckSquare, 
  Plus,
  MessageCircle,
  Trash2,
  RefreshCw,
  Menu,
  X,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { useReownWallet } from '../utils/reownWalletConnection';
import { chatBrain } from '../services/ChatBrain';
import { actionBrain, IntentType } from '../services/ActionBrain';
import { privateKeyWallet } from '../services/PrivateKeyWallet';
import { AIInterface } from '../components/AIInterface';
import { ChatMemoryService } from '../services/ChatMemoryService';
import { LocalLLMService } from '../services/LocalLLMService';
import { IPFSUploader } from '../utils/ipfsUpload';

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
      message: `👋 Hey! I'm Seilor 0, your AI assistant for DeFi on Sei. What can I help you with today?`,
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [todos, setTodos] = useState<Array<{
    id: string;
    task: string;
    completed: boolean;
    timestamp: Date;
  }>>([]);
  const [walletBalance, setWalletBalance] = useState<{ sei: string; usd: number; usdc: string; usdcUsd: number } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isConnected, address } = useReownWallet();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [chatMessages, isTyping]);

  useEffect(() => {
    loadWalletBalance();
    const savedTodos = localStorage.getItem('seilor_todos');
    if (savedTodos) setTodos(JSON.parse(savedTodos));
  }, []);

  useEffect(() => { localStorage.setItem('seilor_todos', JSON.stringify(todos)); }, [todos]);

  const loadWalletBalance = async () => {
    try {
      const [seiBalance, usdcBalance] = await Promise.all([
        privateKeyWallet.getSeiBalance(),
        privateKeyWallet.getUSDCBalance()
      ]);
      setWalletBalance({ sei: seiBalance.sei, usd: seiBalance.usd, usdc: usdcBalance.balance, usdcUsd: usdcBalance.usd });
    } catch (error) { console.error('Failed to load wallet balance:', error); }
  };

  const handleAiChat = async () => {
    if (!aiChat.trim() || loading) return;
    setLoading(true);
    const userMessage = aiChat.trim();
    setAiChat('');
    const userChatMessage = { id: Date.now(), type: 'user' as const, message: userMessage, timestamp: new Date() };
    setChatMessages(prev => [...prev, userChatMessage]);
    ChatMemoryService.append({ type: 'user', message: userMessage }).catch(() => {});
    setIsTyping(true);
    if (/(^yes\b|\bswap\b|\bstake\b|create\s+token|add\s+liquidity|burn)/i.test(userMessage)) setIsProcessingAction(true)
    await new Promise(r => setTimeout(r, 200));
    try {
      const response = await chatBrain.processMessage(userMessage);
      if (/create\s+(a\s+)?token/i.test(userMessage) && attachedImage) {
        try { const url = await IPFSUploader.uploadLogo(attachedImage); localStorage.setItem('seilor_last_token_logo', url); } catch {}
      }
      setIsTyping(false);
      setIsProcessingAction(false);
      const aiResponse = { id: Date.now() + 1, type: 'assistant' as const, message: response.message, timestamp: new Date() };
      setChatMessages(prev => [...prev, aiResponse]);
      ChatMemoryService.append({ type: 'assistant', message: response.message }).catch(() => {});
      // After swap or transfer success, refresh balances
      if (/^(✅\sSwap executed|✅\sNative SEI transfer|✅\sERC-20 transfer)/.test(response.message)) {
        loadWalletBalance();
      }
    } catch (error: any) {
      setIsTyping(false);
      setIsProcessingAction(false);
      const errorMessage = { id: Date.now() + 1, type: 'assistant' as const, message: `❌ ${error.message || 'Please try again.'}`, timestamp: new Date() };
      setChatMessages(prev => [...prev, errorMessage]);
      ChatMemoryService.append({ type: 'assistant', message: errorMessage.message }).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setChatMessages([{ id: Date.now(), type: 'assistant', message: `👋 Hey! I'm Seilor 0, your AI assistant for DeFi on Sei. What can I help you with today?`, timestamp: new Date() }]);
  };
  const clearChat = () => {
    if (chatMessages.length > 1) {
      const confirmClear = window.confirm('Are you sure you want to clear the chat history?');
      if (!confirmClear) return;
    }
    setChatMessages([]);
  };

  const addTodo = (task: string) => { if (!task.trim()) return; setTodos(prev => [...prev, { id: Date.now().toString(), task: task.trim(), completed: false, timestamp: new Date() }]); };
  const handleAddTodo = () => { if (newTodo.trim()) { addTodo(newTodo); setNewTodo(''); } };
  const deleteTodo = (id: string) => setTodos(prev => prev.filter(t => t.id !== id));
  const toggleTodo = (id: string) => setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const panels = [
    { id: 'chat', label: 'AI Chat', icon: Bot },
    { id: 'history', label: 'History', icon: History },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'todo', label: 'Todo List', icon: CheckSquare },
    { id: 'ai-tools', label: 'AI Tools', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors" title={sidebarCollapsed ? 'Show Menu' : 'Hide Menu'}>
                {sidebarCollapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Seilor 0</h1>
                  <p className="text-xs text-slate-400">Autonomous AI Trading Agent</p>
                  <p className="text-xs text-blue-400">✅ v2.0</p>
                </div>
              </div>
              {activePanel === 'chat' && (
                <div className="flex items-center space-x-2">
                  <button onClick={startNewChat} className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors border border-blue-500/30" title="Start New Chat">
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">New Chat</span>
                  </button>
                  <button onClick={clearChat} className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors border border-blue-500/30" title="Clear Chat">
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {walletBalance && (
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{walletBalance.sei} SEI | {walletBalance.usdc} USDC</div>
                  <div className="text-xs text-slate-400">${(walletBalance.usd + walletBalance.usdcUsd).toFixed(2)} total</div>
                </div>
              )}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700/50 text-slate-300'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`grid gap-6 ${sidebarCollapsed ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
          {/* Sidebar */}
          <div className={`${sidebarCollapsed ? 'hidden' : 'block'} lg:col-span-1`}>
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur-sm border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Navigation</h3>
                <button onClick={() => setSidebarCollapsed(true)} className="hidden lg:block p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors" title="Collapse Sidebar">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="space-y-2">
                {panels.map(panel => {
                  const Icon = panel.icon as any
                  return (
                    <button key={panel.id} onClick={() => setActivePanel(panel.id as any)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${activePanel === panel.id ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}>
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{panel.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Panel */}
          <div className={`${sidebarCollapsed ? 'col-span-1' : 'lg:col-span-3'}`}>
            <div className="bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-700/50 overflow-hidden">
              {activePanel === 'chat' && (
                <div className={`${sidebarCollapsed ? 'h-[80vh]' : 'h-[600px]'} flex flex-col`}>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatMessages.length > 0 && chatMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-3xl p-4 rounded-2xl ${msg.type === 'user' ? 'bg-red-500/20 text-white border border-red-500/30' : 'bg-slate-700/50 text-slate-100 border border-slate-600/50'}`}>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</div>
                          <div className="text-xs text-slate-400 mt-2">{msg.timestamp.toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-slate-700/50 text-slate-100 border border-slate-600/50 p-4 rounded-2xl">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span className="text-sm text-slate-300">Seilor is typing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {isProcessingAction && (
                      <div className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> Processing on-chain...
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-slate-700/50 p-4">
                    {walletBalance && (
                      <div className="mb-3 p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-medium text-slate-300">💰 SEI Balance</div>
                            <div className="text-sm font-medium text-white">{walletBalance.sei} SEI <span className="text-xs text-slate-400">(${walletBalance.usd.toFixed(2)})</span></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-medium text-slate-300">💵 USDC Balance</div>
                            <div className="text-sm font-medium text-white">{walletBalance.usdc} USDC <span className="text-xs text-slate-400">(${walletBalance.usdcUsd.toFixed(2)})</span></div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-600/30">
                            <div className="text-xs font-medium text-green-300">💎 Total Value</div>
                            <div className="text-sm font-bold text-green-400">${(walletBalance.usd + walletBalance.usdcUsd).toFixed(2)}</div>
                          </div>
                          <div className="pt-2 flex justify-end">
                            <button onClick={loadWalletBalance} className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs bg-slate-700/50 border border-slate-600/60 text-slate-200 hover:bg-slate-700/70" title="Refresh balances">
                              <RefreshCw className="w-3 h-3" /> Refresh
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="flex space-x-3 items-center">
                        <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/70" title="Attach image">
                          <ImageIcon className="w-5 h-5" />
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0] || null; setAttachedImage(f || null); }} />
                        <input type="text" value={aiChat} onChange={(e) => setAiChat(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAiChat()} placeholder="💬 Ask me anything... Try: 'I want to swap tokens' or 'What's my balance?'" className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 focus:outline-none" disabled={loading} />
                        <button onClick={handleAiChat} disabled={loading || !aiChat.trim()} className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-red-500/25">
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                      {attachedImage && (<div className="text-xs text-slate-300">Attached: {attachedImage.name}</div>)}
                    </div>
                  </div>
                </div>
              )}

              {activePanel === 'todo' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Todo List</h2>
                    <div className="text-sm text-slate-400">{todos.filter(t => !t.completed).length} pending</div>
                  </div>
                  <div className="flex space-x-3 mb-6">
                    <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()} placeholder="Add a new task..." className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 focus:outline-none" />
                    <button onClick={handleAddTodo} className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {todos.map(todo => (
                      <div key={todo.id} className={`p-4 rounded-xl border transition-all duration-200 ${todo.completed ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-700/30 border-slate-600/50 text-white'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button onClick={() => toggleTodo(todo.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center ${todo.completed ? 'bg-green-500 border-green-500' : 'border-slate-400 hover:border-red-500'}`}>
                              {todo.completed && <span className="text-white text-xs">✓</span>}
                            </button>
                            <span className={todo.completed ? 'line-through' : ''}>{todo.task}</span>
                          </div>
                          <button onClick={() => deleteTodo(todo.id)} className="text-slate-400 hover:text-red-400 transition-colors">×</button>
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

              {activePanel === 'ai-tools' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">AI Tools</h2>
                  <p className="text-slate-400 mb-6">Scan tokens, create new tokens, and manage swaps directly from the AI interface.</p>
                  <AIInterface />
                </div>
              )}

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

