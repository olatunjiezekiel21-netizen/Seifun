import React, { useState } from 'react';
import { Coins, Loader2, CheckCircle, AlertTriangle, ExternalLink, Info } from 'lucide-react';
import { ethers } from 'ethers';
import { useWallet } from '../utils/walletConnection';

// Factory contract ABI (simplified)
const FACTORY_ABI = [
  "function createToken(string memory name, string memory symbol, uint8 decimals, uint256 totalSupply) external payable returns (address)",
  "function creationFee() external view returns (uint256)",
  "function getUserTokens(address user) external view returns (tuple(address tokenAddress, address owner, string name, string symbol, uint8 decimals, uint256 totalSupply, uint256 createdAt)[])"
];

// Factory contract address (will be deployed to SEI testnet)
const FACTORY_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder - will be updated after deployment

interface TokenForm {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

interface CreatedToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  txHash: string;
}

const CreateToken = () => {
  const { isConnected, address, connectWallet } = useWallet();
  const [form, setForm] = useState<TokenForm>({
    name: '',
    symbol: '',
    decimals: 18,
    totalSupply: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState<CreatedToken | null>(null);
  const [error, setError] = useState('');
  const [creationFee, setCreationFee] = useState('0.01');

  const handleInputChange = (field: keyof TokenForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      setError('Token name is required');
      return false;
    }
    if (!form.symbol.trim()) {
      setError('Token symbol is required');
      return false;
    }
    if (form.symbol.length > 10) {
      setError('Token symbol must be 10 characters or less');
      return false;
    }
    if (form.decimals < 0 || form.decimals > 18) {
      setError('Decimals must be between 0 and 18');
      return false;
    }
    if (!form.totalSupply || parseFloat(form.totalSupply) <= 0) {
      setError('Total supply must be greater than 0');
      return false;
    }
    return true;
  };

  const createToken = async () => {
    if (!validateForm()) return;
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Note: This is a placeholder implementation
      // In reality, you would deploy the factory contract first
      if (FACTORY_ADDRESS === "0x0000000000000000000000000000000000000000") {
        // Simulate token creation for demo purposes
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const mockToken: CreatedToken = {
          address: `0x${Math.random().toString(16).substr(2, 40)}`,
          name: form.name,
          symbol: form.symbol,
          decimals: form.decimals,
          totalSupply: form.totalSupply,
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`
        };
        
        setCreatedToken(mockToken);
        setForm({ name: '', symbol: '', decimals: 18, totalSupply: '' });
        return;
      }

      // Real implementation (when factory is deployed)
      const provider = new ethers.JsonRpcProvider('https://evm-rpc-testnet.sei-apis.com');
      const signer = provider.getSigner(address);
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

      const fee = await factory.creationFee();
      const tx = await factory.createToken(
        form.name,
        form.symbol,
        form.decimals,
        form.totalSupply,
        { value: fee }
      );

      const receipt = await tx.wait();
      const tokenAddress = receipt.logs[0].address; // Get token address from event

      const newToken: CreatedToken = {
        address: tokenAddress,
        name: form.name,
        symbol: form.symbol,
        decimals: form.decimals,
        totalSupply: form.totalSupply,
        txHash: tx.hash
      };

      setCreatedToken(newToken);
      setForm({ name: '', symbol: '', decimals: 18, totalSupply: '' });

    } catch (err) {
      console.error('Token creation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create token');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-gradient-to-br from-[#0D1421] via-[#1A1B3A] to-[#2D1B69] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <div className="flex items-center justify-center space-x-3">
            <Coins className="text-[#FF6B35]" size={28} />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Create <span className="text-[#FF6B35]">Token</span>
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Launch your own ERC20 token on SEI testnet in minutes
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Token Creation Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-white/20">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Token Details</h2>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Token Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Token Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., My Awesome Token"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                    maxLength={50}
                  />
                </div>

                {/* Token Symbol */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Token Symbol *
                  </label>
                  <input
                    type="text"
                    value={form.symbol}
                    onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                    placeholder="e.g., MAT"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                    maxLength={10}
                  />
                </div>

                {/* Decimals and Total Supply */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Decimals
                    </label>
                    <select
                      value={form.decimals}
                      onChange={(e) => handleInputChange('decimals', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                    >
                      {[6, 8, 9, 12, 18].map(d => (
                        <option key={d} value={d} className="bg-gray-800">{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total Supply *
                    </label>
                    <input
                      type="number"
                      value={form.totalSupply}
                      onChange={(e) => handleInputChange('totalSupply', e.target.value)}
                      placeholder="1000000"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                      min="1"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="text-red-400 flex-shrink-0" size={16} />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Create Button */}
                <div className="pt-4">
                  {!isConnected ? (
                    <button
                      onClick={connectWallet}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Connect Wallet to Create Token</span>
                    </button>
                  ) : (
                    <button
                      onClick={createToken}
                      disabled={isCreating}
                      className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#FF6B35]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Creating Token...</span>
                        </>
                      ) : (
                        <>
                          <Coins size={20} />
                          <span>Create Token ({creationFee} SEI)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Creation Fee */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">Creation Fee</h3>
              <div className="text-2xl font-bold text-[#FF6B35] mb-2">{creationFee} SEI</div>
              <p className="text-gray-400 text-sm">One-time fee to create your token</p>
            </div>

            {/* Features */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-400" size={16} />
                  <span className="text-gray-300 text-sm">ERC20 Compatible</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-400" size={16} />
                  <span className="text-gray-300 text-sm">Mintable by Owner</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-400" size={16} />
                  <span className="text-gray-300 text-sm">Burnable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-400" size={16} />
                  <span className="text-gray-300 text-sm">Ownership Transfer</span>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-blue-500/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-blue-500/20">
              <div className="flex items-start space-x-2">
                <Info className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <h3 className="text-blue-300 font-semibold text-sm mb-2">Important</h3>
                  <p className="text-blue-200 text-xs leading-relaxed">
                    This creates tokens on SEI testnet. Always test thoroughly before mainnet deployment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {createdToken && (
          <div className="mt-8 bg-green-500/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-green-500/20">
            <div className="flex items-start space-x-3">
              <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-green-300 font-semibold text-lg mb-2">Token Created Successfully! 🎉</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    <strong>Name:</strong> {createdToken.name} ({createdToken.symbol})
                  </p>
                  <p className="text-gray-300 break-all">
                    <strong>Address:</strong> {createdToken.address}
                  </p>
                  <p className="text-gray-300">
                    <strong>Total Supply:</strong> {createdToken.totalSupply} {createdToken.symbol}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={() => window.open(`https://seitrace.com/address/${createdToken.address}`, '_blank')}
                    className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all"
                  >
                    <ExternalLink size={16} />
                    <span>View on Seitrace</span>
                  </button>
                  <button
                    onClick={() => setCreatedToken(null)}
                    className="flex items-center justify-center space-x-2 border border-green-500 text-green-400 hover:bg-green-500/10 py-2 px-4 rounded-lg transition-all"
                  >
                    <span>Create Another Token</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CreateToken;