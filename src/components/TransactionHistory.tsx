import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink, AlertCircle, CheckCircle, Loader, Filter, Search } from 'lucide-react';
import { seiTestnetService, TestnetTransaction } from '../services/SeiTestnetService';

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ isOpen, onClose }) => {
  const [transactions, setTransactions] = useState<TestnetTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTransactionHistory();
    }
  }, [isOpen]);

  const loadTransactionHistory = async () => {
    setLoading(true);
    try {
      console.log('📜 Loading transaction history...');
      const history = await seiTestnetService.getTransactionHistory();
      setTransactions(history);
      console.log('✅ Transaction history loaded:', history.length, 'transactions');
    } catch (error) {
      console.error('❌ Error loading transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.status === filter;
    const matchesSearch = searchTerm === '' || 
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(tx.details).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Loader className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTransactionType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatGas = (gas: { used: number; wanted: number; fee: string }) => {
    return `${gas.used.toLocaleString()} / ${gas.wanted.toLocaleString()} (${gas.fee})`;
  };

  const openInExplorer = (hash: string) => {
    const explorerUrl = seiTestnetService.getTestnetExplorerUrl(hash);
    window.open(explorerUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Transaction History</h2>
              <p className="text-blue-100 mt-1">Sei Testnet Transactions</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={loadTransactionHistory}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading transactions...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <Clock className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No transactions found</h3>
              <p className="text-center">
                {transactions.length === 0 
                  ? "Start using Seifun AI features to see your transaction history"
                  : "No transactions match your current filters"
                }
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.hash}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(tx.status)}
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {formatTransactionType(tx.type)}
                        </h4>
                        <p className="text-sm text-gray-500">{formatTimestamp(tx.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(tx.status)}`}>
                        {tx.status.toUpperCase()}
                      </span>
                      <button
                        onClick={() => openInExplorer(tx.hash)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View in explorer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Transaction Hash:</span>
                      <p className="font-mono text-xs break-all text-gray-900">{tx.hash}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Gas:</span>
                      <p className="text-gray-900">{formatGas(tx.gas)}</p>
                    </div>
                  </div>

                  {tx.details && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <span className="text-gray-500 text-sm">Details:</span>
                      <div className="mt-1 text-sm text-gray-700">
                        {tx.status === 'failed' ? (
                          <p className="text-red-600">{tx.details.error || 'Transaction failed'}</p>
                        ) : (
                          <div>
                            {tx.details.action && <p><strong>Action:</strong> {tx.details.action}</p>}
                            {tx.details.result && <p><strong>Result:</strong> {tx.details.result}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </span>
            <span>
              Sei Testnet • {import.meta.env.VITE_SEI_TESTNET_CHAIN_ID || 'sei-testnet-1'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};