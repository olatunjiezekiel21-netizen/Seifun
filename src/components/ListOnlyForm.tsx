import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Upload,
  User,
  FileText,
  Zap
} from 'lucide-react';
import { ethers } from 'ethers';
import { useReownWallet } from '../utils/reownWalletConnection';
import { TokenScanner } from '../utils/tokenScanner';
import { SeiTokenRegistry } from '../utils/seiTokenRegistry';

interface TokenDetails {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: string;
  isVerified: boolean;
}

interface ListingFormData {
  description: string;
  website: string;
  github: string;
  telegram: string;
  twitter: string;
  discord: string;
  tokenImage: string;
  category: string;
  tags: string[];
  listingReason: string;
}

interface ListOnlyFormProps {
  onBack: () => void;
}

const ListOnlyForm: React.FC<ListOnlyFormProps> = ({ onBack }) => {
  const { isConnected, address, connectWallet } = useReownWallet();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [ownershipVerified, setOwnershipVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listingSuccess, setListingSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState<ListingFormData>({
    description: '',
    website: '',
    github: '',
    telegram: '',
    twitter: '',
    discord: '',
    tokenImage: '',
    category: 'utility',
    tags: [],
    listingReason: ''
  });

  const tokenScanner = new TokenScanner();
  const seiRegistry = new SeiTokenRegistry(false);

  const steps = [
    { number: 1, title: 'Token Import', icon: Search },
    { number: 2, title: 'Ownership Verification', icon: Shield },
    { number: 3, title: 'Listing Details', icon: FileText },
    { number: 4, title: 'Review & Submit', icon: CheckCircle }
  ];

  const categories = [
    'DeFi',
    'Gaming',
    'NFT',
    'Utility',
    'Meme',
    'Social',
    'Infrastructure',
    'Other'
  ];

  const handleInputChange = (field: keyof ListingFormData, value: string | string[]) => {
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

  const importTokenDetails = async () => {
    if (!tokenAddress.trim()) {
      setVerificationError('Please enter a token address');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress.trim())) {
      setVerificationError('Please enter a valid EVM address (42 characters starting with 0x)');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    setTokenDetails(null);

    try {
      console.log('🔍 Importing token details for:', tokenAddress);
      
      // Get token details using the token scanner
      const analysis = await tokenScanner.analyzeToken(tokenAddress);
      
      if (!analysis) {
        throw new Error('Failed to analyze token - invalid address or network error');
      }

      // Get additional registry info if available
      let registryInfo = null;
      try {
        registryInfo = await seiRegistry.getTokenInfo(tokenAddress);
      } catch (e) {
        console.log('Token not found in registry, using scan data only');
      }

      const tokenDetails: TokenDetails = {
        address: tokenAddress,
        name: registryInfo?.name || analysis.basicInfo.name || 'Unknown Token',
        symbol: registryInfo?.symbol || analysis.basicInfo.symbol || 'UNKNOWN',
        decimals: analysis.basicInfo.decimals,
        totalSupply: analysis.basicInfo.totalSupply,
        owner: analysis.safetyChecks.ownership.owner || 'Unknown',
        isVerified: registryInfo?.verified || analysis.safetyChecks.verified.isVerified || false
      };

      setTokenDetails(tokenDetails);
      console.log('✅ Token details imported successfully:', tokenDetails);

      // Auto-advance to next step
      setTimeout(() => {
        setCurrentStep(2);
      }, 1000);

    } catch (error: any) {
      console.error('❌ Token import failed:', error);
      setVerificationError(error.message || 'Failed to import token details');
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyOwnership = async () => {
    if (!isConnected || !address || !tokenDetails) {
      setVerificationError('Please connect your wallet and import token details first');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      console.log('🔐 Verifying ownership for:', tokenDetails.address);
      console.log('Connected wallet:', address);
      console.log('Token owner:', tokenDetails.owner);

      // Check if connected wallet matches token owner
      const isOwner = address.toLowerCase() === tokenDetails.owner.toLowerCase();
      
      if (!isOwner) {
        // Additional checks for ownership verification
        try {
          // Try to call owner functions to verify
          const provider = new ethers.JsonRpcProvider(
            import.meta.env.VITE_SEI_MAINNET_RPC || 'https://evm-rpc.sei-apis.com'
          );
          
          const tokenContract = new ethers.Contract(
            tokenDetails.address,
            [
              'function owner() view returns (address)',
              'function getOwner() view returns (address)',
              'function _owner() view returns (address)'
            ],
            provider
          );

          // Try different owner function names
          let contractOwner = null;
          try {
            contractOwner = await tokenContract.owner();
          } catch {
            try {
              contractOwner = await tokenContract.getOwner();
            } catch {
              try {
                contractOwner = await tokenContract._owner();
              } catch {
                console.log('Could not determine contract owner');
              }
            }
          }

          if (contractOwner && contractOwner.toLowerCase() === address.toLowerCase()) {
            setOwnershipVerified(true);
            console.log('✅ Ownership verified through contract call');
          } else {
            throw new Error(`You are not the owner of this token. Owner: ${tokenDetails.owner}, Your address: ${address}`);
          }
        } catch (contractError) {
          throw new Error(`Ownership verification failed: ${contractError}`);
        }
      } else {
        setOwnershipVerified(true);
        console.log('✅ Ownership verified through address match');
      }

      // Auto-advance to next step
      setTimeout(() => {
        setCurrentStep(3);
      }, 1000);

    } catch (error: any) {
      console.error('❌ Ownership verification failed:', error);
      setVerificationError(error.message || 'Failed to verify ownership');
    } finally {
      setIsVerifying(false);
    }
  };

  const submitListing = async () => {
    if (!tokenDetails || !ownershipVerified) {
      setVerificationError('Please complete all verification steps first');
      return;
    }

    setIsSubmitting(true);
    setVerificationError(null);

    try {
      console.log('📝 Submitting token listing:', {
        tokenDetails,
        formData,
        submittedBy: address
      });

      // Simulate API call to submit listing
      await new Promise(resolve => setTimeout(resolve, 2000));

      setListingSuccess(true);
      console.log('🎉 Token listing submitted successfully!');

      // Auto-advance to success step
      setTimeout(() => {
        setCurrentStep(4);
      }, 1000);

    } catch (error: any) {
      console.error('❌ Listing submission failed:', error);
      setVerificationError(error.message || 'Failed to submit listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      handleInputChange('tags', [...formData.tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="app-heading-md app-text-primary mb-6">Import Token Details</h3>
            
            <div>
              <label className="block app-text-primary text-sm font-medium mb-2">
                Token Contract Address *
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="app-input flex-1"
                  placeholder="0x..."
                  disabled={isVerifying}
                />
                <button
                  onClick={importTokenDetails}
                  disabled={isVerifying || !tokenAddress.trim()}
                  className="app-btn app-btn-primary"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Import
                    </>
                  )}
                </button>
              </div>
            </div>

            {tokenDetails && (
              <div className="app-bg-tertiary rounded-lg p-6">
                <h4 className="app-text-primary font-medium mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Token Details Imported
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="app-text-muted">Name:</span>
                    <span className="app-text-primary font-medium">{tokenDetails.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="app-text-muted">Symbol:</span>
                    <span className="app-text-primary font-medium">{tokenDetails.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="app-text-muted">Total Supply:</span>
                    <span className="app-text-primary font-medium">
                      {parseFloat(tokenDetails.totalSupply).toLocaleString()} {tokenDetails.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="app-text-muted">Owner:</span>
                    <span className="app-text-primary font-mono text-sm">
                      {tokenDetails.owner.slice(0, 8)}...{tokenDetails.owner.slice(-6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="app-text-muted">Verified:</span>
                    <span className={tokenDetails.isVerified ? 'text-green-500' : 'text-yellow-500'}>
                      {tokenDetails.isVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {verificationError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-red-500 font-medium">Import Failed</div>
                    <div className="text-red-400 text-sm mt-1">{verificationError}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="app-heading-md app-text-primary mb-6">Ownership Verification</h3>
            
            {tokenDetails && (
              <div className="app-bg-tertiary rounded-lg p-6">
                <h4 className="app-text-primary font-medium mb-4">Token Ownership Check</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="app-text-muted">Token Owner:</span>
                    <span className="app-text-primary font-mono text-sm">
                      {tokenDetails.owner.slice(0, 8)}...{tokenDetails.owner.slice(-6)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="app-text-muted">Your Wallet:</span>
                    <span className="app-text-primary font-mono text-sm">
                      {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Not connected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="app-text-muted">Ownership Match:</span>
                    <span className={ownershipVerified ? 'text-green-500' : 'text-yellow-500'}>
                      {ownershipVerified ? 'Verified ✓' : 'Pending verification'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={verifyOwnership}
                disabled={isVerifying || !isConnected || !tokenDetails || ownershipVerified}
                className="app-btn app-btn-primary"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </>
                ) : ownershipVerified ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Ownership Verified
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Ownership
                  </>
                )}
              </button>
            </div>

            {verificationError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-red-500 font-medium">Verification Failed</div>
                    <div className="text-red-400 text-sm mt-1">{verificationError}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="app-heading-md app-text-primary mb-6">Listing Details</h3>
            
            <div>
              <label className="block app-text-primary text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="app-input"
                rows={4}
                placeholder="Describe your token and its purpose..."
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

            <div>
              <label className="block app-text-primary text-sm font-medium mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="app-input"
                required
              >
                {categories.map(category => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block app-text-primary text-sm font-medium mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-500/10 text-blue-500"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-400 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                className="app-input"
                placeholder="Add tags (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>

            <div>
              <label className="block app-text-primary text-sm font-medium mb-2">
                Reason for Listing *
              </label>
              <textarea
                value={formData.listingReason}
                onChange={(e) => handleInputChange('listingReason', e.target.value)}
                className="app-input"
                rows={3}
                placeholder="Why should this token be listed on SeiList?"
                required
              />
            </div>
          </div>
        );

      case 4:
        if (listingSuccess) {
          return (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              
              <h3 className="app-heading-lg app-text-primary">Listing Submitted Successfully!</h3>
              <p className="app-text-secondary">
                Your token listing has been submitted for review. You'll be notified once it's approved.
              </p>

              {tokenDetails && (
                <div className="app-bg-tertiary rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block app-text-muted text-sm mb-2">Token Address</label>
                      <div className="flex items-center space-x-2">
                        <code className="app-text-primary font-mono text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded flex-1">
                          {tokenDetails.address}
                        </code>
                        <button
                          onClick={() => copyToClipboard(tokenDetails.address)}
                          className="app-btn app-btn-secondary p-2"
                          title="Copy address"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => window.open(`https://seitrace.com/address/${tokenDetails.address}`, '_blank')}
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
                  List Another Token
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
        }

        return (
          <div className="space-y-6">
            <h3 className="app-heading-md app-text-primary mb-6">Review & Submit</h3>
            
            {tokenDetails && (
              <div className="app-bg-tertiary rounded-lg p-6">
                <h4 className="app-text-primary font-medium mb-4">Listing Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="app-text-muted">Token:</span>
                    <span className="app-text-primary font-medium">{tokenDetails.name} ({tokenDetails.symbol})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="app-text-muted">Address:</span>
                    <span className="app-text-primary font-mono text-sm">
                      {tokenDetails.address.slice(0, 8)}...{tokenDetails.address.slice(-6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="app-text-muted">Category:</span>
                    <span className="app-text-primary font-medium capitalize">{formData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="app-text-muted">Ownership:</span>
                    <span className="text-green-500">Verified ✓</span>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={submitListing}
                disabled={isSubmitting || !ownershipVerified}
                className="app-btn app-btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Submit for Listing
                  </>
                )}
              </button>
            </div>

            {verificationError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-red-500 font-medium">Submission Failed</div>
                    <div className="text-red-400 text-sm mt-1">{verificationError}</div>
                  </div>
                </div>
              </div>
            )}
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
              <h1 className="app-heading-lg app-text-primary">List Existing Token</h1>
              <p className="app-text-muted">List your deployed token on SeiList with ownership verification</p>
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
                    ? 'bg-green-500 text-white' 
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
                    currentStep > step.number ? 'bg-green-500' : 'app-bg-tertiary'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="app-card p-8">
            {!isConnected ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 app-text-muted mx-auto mb-4" />
                <h3 className="app-heading-md app-text-primary mb-4">Connect Your Wallet</h3>
                <p className="app-text-muted mb-6">
                  Connect your wallet to verify token ownership and list on SeiList
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
                {currentStep < 4 && !listingSuccess && (
                  <div className="flex justify-between mt-8 pt-6 border-t app-border">
                    <button
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                      disabled={currentStep === 1}
                      className="app-btn app-btn-secondary"
                    >
                      Previous
                    </button>
                    
                    <button
                      onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                      disabled={
                        (currentStep === 1 && !tokenDetails) ||
                        (currentStep === 2 && !ownershipVerified) ||
                        (currentStep === 3 && (!formData.description || !formData.listingReason))
                      }
                      className="app-btn app-btn-primary"
                    >
                      Next
                    </button>
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

export default ListOnlyForm;