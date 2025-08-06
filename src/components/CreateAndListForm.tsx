import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Rocket, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { ethers } from 'ethers';
import { useReownWallet } from '../utils/reownWalletConnection';
import { usePrivateKeyWallet } from '../utils/privateKeyWallet';

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
  launchType: 'fair' | 'presale';
  maxWallet: string;
  lpPercentage: string;
  burnPercentage: string;
  teamPercentage: string;
  lockLp: boolean;
  lockDuration: string;
  daoEnabled: boolean;
  teamWallets: string;
}

interface CreateAndListFormProps {
  onBack: () => void;
}

const CreateAndListForm: React.FC<CreateAndListFormProps> = ({ onBack }) => {
  const useTestnet = import.meta.env.VITE_USE_TESTNET_FOR_SEILIST === 'true';
  const devWallet = import.meta.env.VITE_DEV_WALLET;
  
  // Use private key wallet for testing
  const privateKeyWallet = usePrivateKeyWallet();
  
  // Use ReOWN wallet for production
  const reownWallet = useReownWallet();
  
  // For now, use private key wallet for easy testing
  const { isConnected, address, connectWallet } = privateKeyWallet;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed' | null>(null);
  const [createdTokenAddress, setCreatedTokenAddress] = useState<string | null>(null);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
    { number: 4, title: 'Deploy & List', icon: CheckCircle }
  ];

  const handleInputChange = (field: keyof TokenFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const createAndListToken = async () => {
    if (!isConnected) {
      setCreationError('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setCreationError(null);
    setCreatedTokenAddress(null);
    
    try {
      let provider, signer;
      
      if (useTestnet) {
        // For testnet: create real tokens using private key (if available)
        console.log('🧪 Using testnet mode with dev wallet');
        const rpcUrl = import.meta.env.VITE_SEI_TESTNET_RPC || 'https://evm-rpc-testnet.sei-apis.com';
        provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // Check if we have private key for real transactions
        const privateKey = import.meta.env.VITE_DEV_WALLET_PRIVATE_KEY;
        
        if (privateKey) {
          console.log('🔑 Private key found - creating REAL token on testnet');
          
          try {
            // Create wallet from private key
            const wallet = new ethers.Wallet(privateKey, provider);
            
            // Verify wallet address matches
            if (wallet.address.toLowerCase() !== address?.toLowerCase()) {
              throw new Error('Private key does not match dev wallet address');
            }
            
            // Create factory contract instance
            const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS_TESTNET;
            const FACTORY_ABI = [
              'function createToken(string name, string symbol, uint8 decimals, uint256 totalSupply) external payable returns (address)',
              'function creationFee() external view returns (uint256)',
              'event TokenCreated(address indexed tokenAddress, address indexed creator, string name, string symbol)'
            ];
            
            const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, wallet);
            
            // Get creation fee
            const fee = await factory.creationFee();
            console.log(`💰 Creation fee: ${ethers.formatEther(fee)} SEI`);
            
            // Create the token with real transaction
            setVerificationStatus('pending');
            console.log('📝 Sending transaction to blockchain...');
            
            const tx = await factory.createToken(
              formData.name,
              formData.symbol,
              18, // Default to 18 decimals
              formData.totalSupply,
              { value: fee }
            );
            
            console.log(`⏳ Transaction sent: ${tx.hash}`);
            console.log('⏳ Waiting for confirmation...');
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('✅ Transaction confirmed!');
            
            // Extract token address from event logs
            const tokenCreatedEvent = receipt.logs.find(log => {
              try {
                const decoded = factory.interface.parseLog(log);
                return decoded.name === 'TokenCreated';
              } catch {
                return false;
              }
            });
            
            let tokenAddress;
            if (tokenCreatedEvent) {
              const decoded = factory.interface.parseLog(tokenCreatedEvent);
              tokenAddress = decoded.args[0]; // First argument is token address
            } else {
              // Fallback: use the contract address from the first log
              tokenAddress = receipt.logs[0]?.address || receipt.contractAddress;
            }
            
            if (!tokenAddress) {
              throw new Error('Could not determine token address from transaction');
            }
            
            setVerificationStatus('verified');
            setCreatedTokenAddress(tokenAddress);
            
            console.log('🎉 REAL TOKEN CREATED AND LISTED SUCCESSFULLY!');
            console.log(`📍 Token Address: ${tokenAddress}`);
            console.log(`🔗 Transaction: ${tx.hash}`);
            console.log(`🌐 View on SeiTrace: https://seitrace.com/address/${tokenAddress}?chain=sei-testnet`);
            
          } catch (error) {
            console.error('❌ Real token creation failed:', error);
            throw error; // Re-throw to be caught by outer try-catch
          }
          
        } else {
          throw new Error('Development private key not configured. Please connect a wallet to create tokens.');
        }
        
        // Token creation completed successfully
        setIsSubmitting(false);
        
        // Move to success step
        setTimeout(() => {
          setCurrentStep(4);
        }, 1000);
        
        return;
      }
      
      // Real implementation using connected wallet (production)
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or use a compatible wallet');
      }
      
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      
      const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS_MAINNET;
      const FACTORY_ABI = [
        'function createToken(string name, string symbol, uint8 decimals, uint256 totalSupply) external payable returns (address)',
        'function creationFee() external view returns (uint256)',
        'event TokenCreated(address indexed tokenAddress, address indexed creator, string name, string symbol)'
      ];
      
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
      console.log('Token created and listed successfully:', tokenAddress);
      
    } catch (error: any) {
      console.error('Token creation failed:', error);
      setCreationError(error.message || 'Failed to create and list token');
      setVerificationStatus('failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="app-heading-md app-text-primary mb-6">Token Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block app-text-primary text-sm font-medium mb-2">
                  Token Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="app-input"
                  placeholder="e.g., My Token"
                  required
                />
              </div>
              
              <div>
                <label className="block app-text-primary text-sm font-medium mb-2">
                  Token Symbol *
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                  className="app-input"
                  placeholder="e.g., MTK"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block app-text-primary text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="app-input"
                rows={4}
                placeholder="Describe your token and its purpose..."
              />
            </div>

            <div>
              <label className="block app-text-primary text-sm font-medium mb-2">
                Total Supply *
              </label>
              <input
                type="number"
                value={formData.totalSupply}
                onChange={(e) => handleInputChange('totalSupply', e.target.value)}
                className="app-input"
                placeholder="1000000000"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block app-text-primary text-sm font-medium mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="app-input"
                  placeholder="https://yourproject.com"
                />
              </div>
              
              <div>
                <label className="block app-text-primary text-sm font-medium mb-2">
                  Twitter
                </label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  className="app-input"
                  placeholder="@yourproject"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="app-heading-md app-text-primary mb-6">Launch Settings</h3>
            
            <div>
              <label className="block app-text-primary text-sm font-medium mb-2">
                Launch Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('launchType', 'fair')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.launchType === 'fair'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'app-border hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="app-text-primary font-medium">Fair Launch</div>
                    <div className="app-text-muted text-sm mt-1">Equal opportunity for all</div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('launchType', 'presale')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.launchType === 'presale'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'app-border hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="app-text-primary font-medium">Presale</div>
                    <div className="app-text-muted text-sm mt-1">Early access for investors</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block app-text-primary text-sm font-medium mb-2">
                  LP Percentage (%)
                </label>
                <input
                  type="number"
                  value={formData.lpPercentage}
                  onChange={(e) => handleInputChange('lpPercentage', e.target.value)}
                  className="app-input"
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block app-text-primary text-sm font-medium mb-2">
                  Team Percentage (%)
                </label>
                <input
                  type="number"
                  value={formData.teamPercentage}
                  onChange={(e) => handleInputChange('teamPercentage', e.target.value)}
                  className="app-input"
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block app-text-primary text-sm font-medium mb-2">
                  Burn Percentage (%)
                </label>
                <input
                  type="number"
                  value={formData.burnPercentage}
                  onChange={(e) => handleInputChange('burnPercentage', e.target.value)}
                  className="app-input"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="lockLp"
                checked={formData.lockLp}
                onChange={(e) => handleInputChange('lockLp', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="lockLp" className="app-text-primary text-sm font-medium">
                Lock Liquidity Pool
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="app-heading-md app-text-primary mb-6">Verification & Review</h3>
            
            <div className="app-bg-tertiary rounded-lg p-6">
              <h4 className="app-text-primary font-medium mb-4">Token Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="app-text-muted">Name:</span>
                  <span className="app-text-primary font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="app-text-muted">Symbol:</span>
                  <span className="app-text-primary font-medium">{formData.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="app-text-muted">Total Supply:</span>
                  <span className="app-text-primary font-medium">{parseInt(formData.totalSupply).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="app-text-muted">Launch Type:</span>
                  <span className="app-text-primary font-medium capitalize">{formData.launchType}</span>
                </div>
              </div>
            </div>

            {verificationStatus === 'pending' && (
              <div className="flex items-center space-x-3 text-yellow-500">
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Creating and listing token...</span>
              </div>
            )}

            {verificationStatus === 'failed' && creationError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-red-500 font-medium">Creation Failed</div>
                    <div className="text-red-400 text-sm mt-1">{creationError}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            
            <h3 className="app-heading-lg app-text-primary">Token Created & Listed Successfully!</h3>
            <p className="app-text-secondary">
              Your token has been deployed and is now listed on SeiList
            </p>

            {createdTokenAddress && (
              <div className="app-bg-tertiary rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block app-text-muted text-sm mb-2">Token Address</label>
                    <div className="flex items-center space-x-2">
                      <code className="app-text-primary font-mono text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded flex-1">
                        {createdTokenAddress}
                      </code>
                      <button
                        onClick={() => copyToClipboard(createdTokenAddress)}
                        className="app-btn app-btn-secondary p-2"
                        title="Copy address"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => window.open(`https://seitrace.com/address/${createdTokenAddress}`, '_blank')}
                        className="app-btn app-btn-secondary p-2"
                        title="View on Explorer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="app-btn app-btn-secondary"
              >
                Create Another Token
              </button>
              <button
                onClick={onBack}
                className="app-btn app-btn-primary"
              >
                Back to SeiList
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-bg-primary min-h-screen">
      {/* Header */}
      <div className="app-bg-secondary border-b app-border">
        <div className="app-container py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="app-btn app-btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to SeiList
            </button>
            <div>
              <h1 className="app-heading-lg app-text-primary">Create & List Token</h1>
              <p className="app-text-muted">Deploy a new token and list it on SeiList</p>
            </div>
          </div>
        </div>
      </div>

      <div className="app-container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-12">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.number 
                    ? 'bg-blue-500 text-white' 
                    : 'app-bg-tertiary app-text-muted'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.number ? 'app-text-primary' : 'app-text-muted'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ml-6 ${
                    currentStep > step.number ? 'bg-blue-500' : 'app-bg-tertiary'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="app-card p-8">
            {!isConnected ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 app-text-muted mx-auto mb-4" />
                <h3 className="app-heading-md app-text-primary mb-4">Connect Your Wallet</h3>
                <p className="app-text-muted mb-6">
                  Connect your wallet to create and list tokens on SeiList
                </p>
                <button
                  onClick={connectWallet}
                  className="app-btn app-btn-primary"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <>
                {renderStepContent()}
                
                {/* Navigation Buttons */}
                {currentStep < 4 && (
                  <div className="flex justify-between mt-8 pt-6 border-t app-border">
                    <button
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                      disabled={currentStep === 1}
                      className="app-btn app-btn-secondary"
                    >
                      Previous
                    </button>
                    
                    {currentStep === 3 ? (
                      <button
                        onClick={createAndListToken}
                        disabled={isSubmitting || !formData.name || !formData.symbol}
                        className="app-btn app-btn-primary"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Creating & Listing...
                          </>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4 mr-2" />
                            Create & List Token
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                        disabled={currentStep === 1 && (!formData.name || !formData.symbol)}
                        className="app-btn app-btn-primary"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAndListForm;