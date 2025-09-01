import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  CreditCard, 
  RefreshCw,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { useReownWallet } from '../utils/reownWalletConnection';
import { chatBrain } from '../services/ChatBrain';
import { actionBrain, IntentType } from '../services/ActionBrain';
import { privateKeyWallet } from '../services/PrivateKeyWallet';
import { ChatMemoryService } from '../services/ChatMemoryService';
import { IPFSUploader } from '../utils/ipfsUpload';
import { seiTestnetService, TestnetTransaction, TestnetPortfolio } from '../services/SeiTestnetService';
import { TransactionHistory } from '../components/TransactionHistory';
// Full Seilor 0 UI defined below. Backup remains at `SeilorOld.tsx.backup` if needed.
const Seilor = () => {
  const [activePanel, setActivePanel] = useState<'chat' | 'transactions'>('chat');
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [walletBalance, setWalletBalance] = useState<{ sei: string; usd: number; usdc: string; usdcUsd: number } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [watchAddress, setWatchAddress] = useState('');
  const [txs, setTxs] = useState<any[]>([]);

  // Testnet state
  const [testnetPortfolio, setTestnetPortfolio] = useState<TestnetPortfolio | null>(null);
  const [testnetTransactions, setTestnetTransactions] = useState<TestnetTransaction[]>([]);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [testnetConnected, setTestnetConnected] = useState(false);

  const { isConnected, address } = useReownWallet();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [chatMessages, isTyping]);

  useEffect(() => {
    loadWalletBalance();
    
    // Initialize testnet service
    initializeTestnet();
  }, []);

  // Initialize Sei Testnet Service
  const initializeTestnet = async () => {
    try {
      console.log('🚀 Initializing Sei Testnet Service...');
      const connected = await seiTestnetService.initialize();
      setTestnetConnected(connected);
      
      if (connected) {
        console.log('✅ Testnet service connected');
        // Load testnet portfolio and transactions
        await loadTestnetData();
      } else {
        console.log('⚠️ Testnet service not connected');
      }
    } catch (error) {
      console.error('❌ Failed to initialize testnet service:', error);
    }
  };

  const loadTestnetData = async () => {
    try {
      const [portfolio, transactions] = await Promise.all([
        seiTestnetService.getTestnetPortfolio(),
        seiTestnetService.getTransactionHistory()
      ]);
      
      setTestnetPortfolio(portfolio);
      setTestnetTransactions(transactions);
      
      console.log('📊 Testnet data loaded:', { portfolio, transactions: transactions.length });
    } catch (error) {
      console.error('❌ Failed to load testnet data:', error);
    }
  };

  // Handle AI-triggered testnet actions
  const handleAITestnetActions = async (userMessage: string, aiResponse: string) => {
    if (!testnetConnected) return;

    try {
      let transaction: TestnetTransaction | null = null;

      // Portfolio optimization
      if (/optimize.*portfolio|portfolio.*optimization/i.test(userMessage)) {
        console.log('🎯 Executing portfolio optimization on testnet...');
        transaction = await seiTestnetService.optimizePortfolioOnChain([
          { symbol: 'SEI', amount: '1000' },
          { symbol: 'USDC', amount: '500' }
        ]);
      }
      
      // Risk assessment
      else if (/risk.*assess|assess.*risk|safety.*check/i.test(userMessage)) {
        console.log('🛡️ Executing risk assessment on testnet...');
        transaction = await seiTestnetService.assessRiskOnChain('SEI', 1000);
      }
      
      // Yield optimization
      else if (/yield.*optimiz|best.*yield|yield.*strategy/i.test(userMessage)) {
        console.log('📈 Executing yield optimization on testnet...');
        transaction = await seiTestnetService.optimizeYieldOnChain('balanced');
      }
      
      // Arbitrage detection
      else if (/arbitrage|price.*difference|profit.*opportunity/i.test(userMessage)) {
        console.log('⚡ Executing arbitrage detection on testnet...');
        transaction = await seiTestnetService.detectArbitrageOnChain(['SEI/USDC', 'SEI/USDT']);
      }

      // Store AI context
      if (transaction && aiResponse.includes('✅')) {
        await seiTestnetService.storeAIContextOnChain({
          userQuery: userMessage,
          aiResponse: aiResponse,
          transactionHash: transaction.hash,
          timestamp: Date.now(),
          success: true
        });
      }

      if (transaction) {
        console.log('🚀 Testnet transaction executed:', transaction);
        
        // Add transaction notification to chat
        const txMessage = {
          id: Date.now() + 10,
          type: 'assistant' as const,
          message: `🔗 Testnet transaction executed: ${transaction.hash.substring(0, 20)}... | Status: ${transaction.status} | Explorer: ${seiTestnetService.getTestnetExplorerUrl(transaction.hash)}`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, txMessage]);
      }
    } catch (error) {
      console.error('❌ Failed to execute testnet action:', error);
    }
  };

  const loadWalletBalance = async () => {
    try {
      if (privateKeyWallet.isConnected) {
        const [seiBalance, usdcBalance] = await Promise.all([
          privateKeyWallet.getSeiBalance(),
          privateKeyWallet.getUSDCBalance()
        ]);
        setWalletBalance({ sei: seiBalance.sei, usd: seiBalance.usd, usdc: usdcBalance.balance, usdcUsd: usdcBalance.usd });
        return
      }
      // Serverless fallback using connected address if available
      const addr = address || ''
      if (!addr) { setWalletBalance(null); return }
      const res = await fetch('/.netlify/functions/wallet-portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: addr, network: 'testnet', includeSymbols: ['SEI','USDC'] }) })
      if (res.ok) {
        const data = await res.json() as any
        const sei = Number(data?.native?.balance || 0)
        const usdc = Number((data?.tokens || []).find((t: any) => (t.symbol || '').toUpperCase() === 'USDC')?.balance || 0)
        setWalletBalance({ sei: sei.toFixed(4), usd: sei * 0.834, usdc: usdc.toFixed(2), usdcUsd: usdc })
      }
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
      // Manage processing overlay
      if (/^⏳\s/i.test(response.message)) {
        setIsProcessingAction(true);
      } else if (/^✅\s|^❌\s/i.test(response.message)) {
        setIsProcessingAction(false);
      } else {
        setIsProcessingAction(false);
      }
      // After swap or transfer success, refresh balances
      if (/^(✅\sSwap executed|✅\sNative SEI transfer|✅\sERC-20 transfer|✅\sFixed-rate swap executed)/.test(response.message)) {
        loadWalletBalance();
      }
      // If token created, suggest monitoring in Dev++
      if (/^✅\sToken Created/.test(response.message)) {
        setChatMessages(prev => [...prev, { id: Date.now()+2, type: 'assistant' as const, message: '📈 Token created! Open Dev++ to monitor, add liquidity, and burn when needed: /app/devplus', timestamp: new Date() }])
      }

      // Handle AI-triggered testnet transactions
      await handleAITestnetActions(userMessage, response.message);
      
      // Refresh testnet data after successful operations
      if (/^✅/.test(response.message)) {
        await loadTestnetData();
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

  const panels = [
    { id: 'chat', label: 'AI Chat', icon: Bot },
    { id: 'transactions', label: 'Transactions', icon: CreditCard }
  ];

  const fetchTransactions = async () => {
    if (!watchAddress || !/^0x[a-fA-F0-9]{40}$/.test(watchAddress)) return;
    try {
      const res = await fetch('/.netlify/functions/wallet-interactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: watchAddress, network: 'testnet', limit: 10, includeNative: true, nativeBlocks: 20000, lookbackBlocks: 100000 }) })
      if (!res.ok) return;
      const data = await res.json();
      const erc = (data.transfers || []).map((t:any)=>({ type:'erc20', ...t }));
      const nat = (data.native || []).map((t:any)=>({ type:'native', ...t }));
      const combined = [...erc, ...nat].sort((a:any,b:any)=> (b.blockNumber||0)-(a.blockNumber||0));
      setTxs(combined);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Processing overlay */}
      {isProcessingAction && (
        <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
          <div className="px-6 py-5 rounded-2xl bg-slate-800/80 border border-slate-700/70 shadow-2xl text-slate-200 w-[90%] max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
              <div className="text-sm font-medium">Processing your on-chain action…</div>
            </div>
            <div className="mt-3 text-xs text-slate-400">Please approve in your wallet if prompted. This may take up to 30s.</div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">Seilor 0</h1>
                  <p className="text-[10px] sm:text-xs text-slate-400">Autonomous AI Trading Agent</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              {walletBalance && (
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-white">{walletBalance.sei} SEI | {walletBalance.usdc} USDC</div>
                  <div className="text-xs text-slate-400">${(walletBalance.usd + walletBalance.usdcUsd).toFixed(2)} total</div>
                </div>
              )}
              <div className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${isConnected ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700/50 text-slate-300'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-4">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur-sm border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Navigation</h3>
                <button onClick={() => setSidebarCollapsed(true)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors" title="Collapse Sidebar">
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
          <div className="flex-1">
            <div className="bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-700/50 overflow-hidden">
              {activePanel === 'chat' && (
                <div className="h-[75vh] flex flex-col">
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
                      <div className="mb-3 p-2 bg-slate-700/30 rounded-lg border border-slate-600/30">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-white">{walletBalance.sei} SEI</span>
                            <span className="text-white">{walletBalance.usdc} USDC</span>
                            <span className="text-green-400 font-medium">${(walletBalance.usd + walletBalance.usdcUsd).toFixed(2)}</span>
                          </div>
                          <button onClick={loadWalletBalance} className="p-1 text-slate-400 hover:text-white" title="Refresh balances">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-3 items-center">
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/70" title="Attach image">
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0] || null; setAttachedImage(f || null); }} />
                      <input type="text" value={aiChat} onChange={(e) => setAiChat(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAiChat()} placeholder="💬 Ask me anything..." className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 focus:outline-none" disabled={loading} />
                      <button onClick={handleAiChat} disabled={loading || !aiChat.trim()} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    {attachedImage && (<div className="text-xs text-slate-300 mt-2">Attached: {attachedImage.name}</div>)}
                  </div>
                </div>
              )}





              {activePanel === 'transactions' && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Transaction Explorer</h2>
                    <button onClick={() => setShowTransactionHistory(true)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                      Full History
                    </button>
                  </div>

                  {/* Simple Transaction Lookup */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input 
                        value={watchAddress} 
                        onChange={(e)=>setWatchAddress(e.target.value)} 
                        placeholder="Enter address (0x...)" 
                        className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded px-3 py-2 text-white text-sm" 
                      />
                      <button 
                        onClick={fetchTransactions} 
                        className="px-3 py-2 bg-slate-700/60 border border-slate-600/60 rounded text-slate-200 hover:bg-slate-600/60 text-sm"
                      >
                        Search
                      </button>
                    </div>
                    
                    {txs.length > 0 ? (
                      <div className="space-y-2">
                        {txs.slice(0, 10).map((t:any,i:number)=> (
                          <div key={i} className="p-3 bg-slate-700/30 rounded border border-slate-600/30">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded text-xs ${t.type === 'native' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                                  {t.type}
                                </span>
                                <span className="text-slate-300">
                                  {t.type==='native'? `${Number(t.value).toFixed(4)} SEI` : t.amount}
                                </span>
                              </div>
                              <a 
                                className="text-blue-400 hover:text-blue-300 text-xs" 
                                href={`https://seitrace.com/tx/${t.txHash}?chain=sei-testnet`} 
                                target="_blank" 
                                rel="noreferrer"
                              >
                                {t.txHash?.slice(0,8)}...
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-400 p-4 text-center text-sm">No transactions found. Enter an address to search.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Modal */}
      <TransactionHistory 
        isOpen={showTransactionHistory}
        onClose={() => setShowTransactionHistory(false)}
      />
    </div>
  );
};

export default Seilor;

