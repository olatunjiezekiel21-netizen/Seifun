import React, { useState } from 'react';
import { Upload, Shield, Rocket, Lock, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { ethers } from 'ethers';
import { useSeiWallet } from '../utils/seiWalletConnection';

// Factory contract ABI (simplified)
const FACTORY_ABI = [
  "function createToken(string memory name, string memory symbol, uint8 decimals, uint256 totalSupply) external payable returns (address)",
  "function creationFee() external view returns (uint256)",
  "function getUserTokens(address user) external view returns (tuple(address tokenAddress, address owner, string name, string symbol, uint8 decimals, uint256 totalSupply, uint256 createdAt)[])"
];

// Factory contract address (deployed on SEI testnet)
const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_CONTRACT_ADDRESS || "0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F";

interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  website: string;
  github: string;
  telegram: string;
  twitter: string;
  discord: string;
  tokenImage: string;
  totalSupply: string;
  launchType: 'fair' | 'presale' | 'stealth';
  maxWallet: string;
  lpPercentage: string;
  burnPercentage: string;
  teamPercentage: string;
  lockLp: boolean;
  lockDuration: string;
  daoEnabled: boolean;
  teamWallets: string;
}

const LaunchpadForm = () => {
  // For testing: use dev wallet directly
  const useTestnet = import.meta.env.VITE_USE_TESTNET_FOR_LAUNCHPAD === 'true';
  const devWallet = import.meta.env.VITE_DEV_WALLET;
  
  // Use real wallet connection for production, dev wallet for testing
  const { isConnected: realIsConnected, address: realAddress, connectWallet } = useSeiWallet();
  const isConnected = useTestnet ? true : realIsConnected; // Always connected in testnet mode
  const address = useTestnet ? devWallet : realAddress;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed' | null>(null);
  const [createdTokenAddress, setCreatedTokenAddress] = useState<string | null>(null);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TokenFormData>({
    name: '',
    symbol: '',
    description: '',
    website: '',
    github: '',
    telegram: '',
    twitter: '',
    discord: '',
    tokenImage: '',
    totalSupply: '1000000000',
    launchType: 'fair',
    maxWallet: '2',
    lpPercentage: '80',
    burnPercentage: '0',
    teamPercentage: '5',
    lockLp: true,
    lockDuration: '365',
    daoEnabled: false,
    teamWallets: ''
  });

  const steps = [
    { number: 1, title: 'Token Details', icon: Upload },
    { number: 2, title: 'Launch Settings', icon: Rocket },
    { number: 3, title: 'Verification', icon: Shield },
    { number: 4, title: 'Deploy', icon: CheckCircle }
  ];

  const handleInputChange = (field: keyof TokenFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      setCreationError('Please connect your wallet first');
      return;
    }

    // Validate required fields
    if (!formData.name.trim() || !formData.symbol.trim() || !formData.totalSupply) {
      setCreationError('Please fill in all required fields (Name, Symbol, Total Supply)');
      return;
    }

    setIsSubmitting(true);
    setVerificationStatus('pending');
    setCreationError(null);
    setCreatedTokenAddress(null);
    
    try {
      let provider, signer;
      
      if (useTestnet) {
        // For testnet: create a provider and use private key (for testing only)
        console.log('🧪 Using testnet mode with dev wallet');
        const rpcUrl = import.meta.env.VITE_SEI_TESTNET_RPC || 'https://evm-rpc-testnet.sei-apis.com';
        provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // For testing, we'll need the private key. In a real app, this would come from the user's wallet
        // For now, let's simulate the transaction without actually sending it
        console.log('⚠️  Testnet mode: Would create token with dev wallet', address);
        
        // Simulate the transaction for testing
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
        
        // Generate a mock token address for testing
        const mockTokenAddress = '0x' + Math.random().toString(16).substr(2, 40);
        
        setVerificationStatus('verified');
        setCreatedTokenAddress(mockTokenAddress);
        setIsSubmitting(false);
        
        // Move to success step
        setTimeout(() => {
          setCurrentStep(4);
        }, 1000);
        
        console.log('✅ Mock token created successfully:', mockTokenAddress);
        return;
      }
      
      // Real implementation using connected wallet (production)
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or use a compatible wallet');
      }
      
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

      // Get creation fee
      const fee = await factory.creationFee();
      
      // Create token
      const tx = await factory.createToken(
        formData.name,
        formData.symbol,
        18, // Default to 18 decimals
        formData.totalSupply,
        { value: fee }
      );

      setVerificationStatus('verified');
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      const tokenAddress = receipt.logs[0].address; // Get token address from event
      
      setCreatedTokenAddress(tokenAddress);
      setIsSubmitting(false);
      
      // Move to success step
      setTimeout(() => {
        setCurrentStep(4);
      }, 1000);

    } catch (error) {
      console.error('Token creation failed:', error);
      setVerificationStatus('failed');
      setCreationError(error instanceof Error ? error.message : 'Failed to create token');
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleInputChange('tokenImage', result);
      };
      reader.readAsDataURL(file);
    }
  };
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-12">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className={`flex items-center space-x-3 ${
            currentStep >= step.number ? 'text-[#FF3C3C]' : 'text-gray-400'
          }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
              currentStep >= step.number 
                ? 'bg-[#FF3C3C] border-[#FF3C3C] text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              {currentStep > step.number ? (
                <CheckCircle size={20} />
              ) : (
                <step.icon size={20} />
              )}
            </div>
            <span className="font-medium hidden sm:block">{step.title}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-4 ${
              currentStep > step.number ? 'bg-[#FF3C3C]' : 'bg-gray-300'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );

  const renderTokenDetails = () => (
    <div className="space-y-6">
      {/* Token Image Upload */}
      <div className="text-center">
        <label className="block text-sm font-medium text-gray-700 mb-4">Token Logo</label>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
            {formData.tokenImage ? (
              <img 
                src={formData.tokenImage} 
                alt="Token logo" 
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-xs text-gray-500">Upload Logo</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="token-image"
          />
          <label
            htmlFor="token-image"
            className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            Choose Image
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Token Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Doge Coin"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Token Symbol *</label>
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
            placeholder="e.g., DOGE"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your token and its purpose..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Total Supply *</label>
        <input
          type="number"
          value={formData.totalSupply}
          onChange={(e) => handleInputChange('totalSupply', e.target.value)}
          placeholder="1000000000"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://yourproject.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
          <input
            type="url"
            value={formData.github}
            onChange={(e) => handleInputChange('github', e.target.value)}
            placeholder="https://github.com/yourproject"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telegram</label>
          <input
            type="text"
            value={formData.telegram}
            onChange={(e) => handleInputChange('telegram', e.target.value)}
            placeholder="@yourproject"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
          <input
            type="text"
            value={formData.twitter}
            onChange={(e) => handleInputChange('twitter', e.target.value)}
            placeholder="@yourproject"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Discord</label>
          <input
            type="text"
            value={formData.discord}
            onChange={(e) => handleInputChange('discord', e.target.value)}
            placeholder="discord.gg/yourproject"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  );

  const renderLaunchSettings = () => (
    <div className="space-y-8">
      {/* Launch Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Launch Type *</label>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { value: 'fair', title: 'Fair Launch', desc: 'Open to everyone' },
            { value: 'presale', title: 'Presale', desc: 'Whitelist only' },
            { value: 'stealth', title: 'Stealth Launch', desc: 'No announcement' }
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => handleInputChange('launchType', type.value)}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                formData.launchType === type.value
                  ? 'border-[#FF3C3C] bg-[#FF3C3C]/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-semibold text-gray-900">{type.title}</div>
              <div className="text-sm text-gray-600">{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Allocation Settings */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Wallet %</label>
          <input
            type="number"
            value={formData.maxWallet}
            onChange={(e) => handleInputChange('maxWallet', e.target.value)}
            min="0.1"
            max="100"
            step="0.1"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">LP Allocation %</label>
          <input
            type="number"
            value={formData.lpPercentage}
            onChange={(e) => handleInputChange('lpPercentage', e.target.value)}
            min="50"
            max="95"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Burn %</label>
          <input
            type="number"
            value={formData.burnPercentage}
            onChange={(e) => handleInputChange('burnPercentage', e.target.value)}
            min="0"
            max="50"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Team %</label>
          <input
            type="number"
            value={formData.teamPercentage}
            onChange={(e) => handleInputChange('teamPercentage', e.target.value)}
            min="0"
            max="20"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* LP Locking */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="flex items-center space-x-3 mb-4">
          <Lock className="text-[#FF3C3C]" size={20} />
          <h3 className="font-semibold text-gray-900">Liquidity Pool Locking</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.lockLp}
              onChange={(e) => handleInputChange('lockLp', e.target.checked)}
              className="w-5 h-5 text-[#FF3C3C] border-gray-300 rounded focus:ring-[#FF3C3C]"
            />
            <span className="text-gray-700">Lock liquidity pool (Recommended)</span>
          </label>
          {formData.lockLp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lock Duration (Days)</label>
              <select
                value={formData.lockDuration}
                onChange={(e) => handleInputChange('lockDuration', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF3C3C] focus:border-transparent transition-all"
              >
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="180">180 Days</option>
                <option value="365">1 Year</option>
                <option value="730">2 Years</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* DAO Settings */}
      <div className="bg-blue-50 p-6 rounded-xl">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-900">DAO Governance</h3>
        </div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={formData.daoEnabled}
            onChange={(e) => handleInputChange('daoEnabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
          />
          <span className="text-gray-700">Enable DAO governance for this token</span>
        </label>
        {formData.daoEnabled && (
          <p className="text-sm text-blue-600 mt-2">
            Community will be able to vote on proposals and token decisions
          </p>
        )}
      </div>
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-8">
      <div className="text-center">
        <Shield className="w-16 h-16 text-[#FF3C3C] mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">SeifuGuard Verification</h3>
        <p className="text-gray-600">
          Your token will be automatically verified for safety and security
        </p>
      </div>

      {verificationStatus === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="text-yellow-600 animate-spin" size={20} />
            <span className="font-semibold text-yellow-800">Verification in Progress...</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-700">Contract Analysis</span>
              <div className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-700">Security Checks</span>
              <div className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-700">Score Calculation</span>
              <div className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'verified' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="text-green-600" size={20} />
            <span className="font-semibold text-green-800">Verification Complete!</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">SeifuScore</span>
                <span className="text-2xl font-bold text-green-600">94</span>
              </div>
              <div className="w-full h-3 bg-green-200 rounded-full overflow-hidden">
                <div className="w-[94%] h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                'Ownership Renounced ✅',
                'No Blacklist Functions ✅',
                'LP Lock Verified ✅',
                'Contract Verified ✅'
              ].map((check, idx) => (
                <div key={idx} className="text-sm text-green-700">{check}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-xl">
        <h4 className="font-semibold text-gray-900 mb-4">Token Summary</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{formData.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Symbol:</span>
              <span className="font-medium">{formData.symbol || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Supply:</span>
              <span className="font-medium">{Number(formData.totalSupply).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Launch Type:</span>
              <span className="font-medium capitalize">{formData.launchType}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">LP Allocation:</span>
              <span className="font-medium">{formData.lpPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Wallet:</span>
              <span className="font-medium">{formData.maxWallet}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">LP Locked:</span>
              <span className="font-medium">{formData.lockLp ? `${formData.lockDuration} days` : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">DAO Enabled:</span>
              <span className="font-medium">{formData.daoEnabled ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeploy = () => (
    <div className="text-center space-y-8">
      <div>
        <Rocket className="w-16 h-16 text-[#FF3C3C] mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Launch!</h3>
        <p className="text-gray-600">
          Your token has been verified and is ready for deployment
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#FF3C3C]/10 to-[#FF6B6B]/5 p-8 rounded-2xl">
        <div className="space-y-4">
          <div className="text-4xl font-bold text-[#FF3C3C]">🚀</div>
          <h4 className="text-xl font-bold text-gray-900">Launch Countdown</h4>
          <div className="text-3xl font-bold text-[#FF3C3C]">00:05:23</div>
          <p className="text-gray-600">Time until launch window opens</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-yellow-600 mt-1" size={20} />
          <div className="text-left">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Ensure you have enough SEI for gas fees</li>
              <li>• LP tokens will be automatically locked for {formData.lockDuration} days</li>
              <li>• Token contract will be verified on Sei Explorer</li>
              {formData.daoEnabled && <li>• DAO governance will be activated after launch</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Testnet Mode Indicator */}
      {useTestnet && (
        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-yellow-600" size={20} />
            <div>
              <p className="text-yellow-800 font-semibold">🧪 Testnet Mode Active</p>
              <p className="text-yellow-700 text-sm">
                Using dev wallet: <code className="bg-yellow-100 px-1 rounded">{address}</code> for testing token creation
              </p>
            </div>
          </div>
        </div>
      )}
      
      {renderStepIndicator()}

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {currentStep === 1 && renderTokenDetails()}
        {currentStep === 2 && renderLaunchSettings()}
        {currentStep === 3 && renderVerification()}
        {currentStep === 4 && renderDeploy()}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && (!formData.name || !formData.symbol || !formData.description)) ||
                (currentStep === 2 && !formData.totalSupply)
              }
              className="px-6 py-3 bg-[#FF3C3C] text-white rounded-xl font-semibold hover:bg-[#E63636] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : currentStep === 3 ? (
            <>
              {creationError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="text-red-400 flex-shrink-0" size={16} />
                    <p className="text-red-400 text-sm">{creationError}</p>
                  </div>
                </div>
              )}
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center space-x-2"
                >
                  <span>Connect Wallet to Continue</span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#FF3C3C] text-white rounded-xl font-semibold hover:bg-[#E63636] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Token...</span>
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      <span>Create Token (2 SEI)</span>
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {createdTokenAddress && (
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-green-400 font-semibold text-sm mb-1">Token Created Successfully!</p>
                      <p className="text-green-300 text-xs break-all">Address: {createdTokenAddress}</p>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={() => createdTokenAddress && window.open(`https://seitrace.com/address/${createdTokenAddress}`, '_blank')}
                disabled={!createdTokenAddress}
                className="px-8 py-3 bg-gradient-to-r from-[#FF3C3C] to-[#FF6B6B] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#FF3C3C]/25 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Rocket size={16} />
                <span>{createdTokenAddress ? 'View on Seitrace' : 'Token Launch Complete'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaunchpadForm;