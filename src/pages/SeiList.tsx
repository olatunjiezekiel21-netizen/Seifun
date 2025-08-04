import React, { useState } from 'react';
import { 
  Plus, 
  List, 
  Rocket, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Upload,
  Zap,
  Target,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import CreateAndListForm from '../components/CreateAndListForm';
import ListOnlyForm from '../components/ListOnlyForm';

type SeiListOption = 'selection' | 'create-and-list' | 'list-only';

const SeiList = () => {
  const [selectedOption, setSelectedOption] = useState<SeiListOption>('selection');

  const handleOptionSelect = (option: SeiListOption) => {
    setSelectedOption(option);
  };

  const handleBackToSelection = () => {
    setSelectedOption('selection');
  };

  if (selectedOption === 'create-and-list') {
    return <CreateAndListForm onBack={handleBackToSelection} />;
  }

  if (selectedOption === 'list-only') {
    return <ListOnlyForm onBack={handleBackToSelection} />;
  }

  return (
    <div className="app-bg-primary min-h-screen">
      {/* Header */}
      <div className="app-bg-secondary border-b app-border">
        <div className="app-container py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="app-heading-xl app-text-primary mb-6">
              SeiList
            </h1>
            <p className="app-text-lg app-text-secondary mb-8">
              The premier token listing platform for the Sei ecosystem. Create new tokens or list existing ones with comprehensive verification and security features.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm app-text-muted">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Verified & Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>Fast Listing</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-500" />
                <span>Sei Native</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="app-container py-12">
        <div className="max-w-6xl mx-auto">
          {/* Option Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create & List Option */}
            <div className="app-card p-8 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                 onClick={() => handleOptionSelect('create-and-list')}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="app-heading-lg app-text-primary mb-4">
                  Create & List
                </h2>
                
                <p className="app-text-secondary mb-6">
                  Deploy a new token smart contract and list it on SeiList. Perfect for new projects launching on Sei.
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="app-text-muted text-sm">Smart contract deployment</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="app-text-muted text-sm">Automatic verification</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="app-text-muted text-sm">Instant listing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="app-text-muted text-sm">Built-in safety features</span>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2 app-text-primary group-hover:text-blue-500 transition-colors">
                  <span className="font-medium">Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* List Only Option */}
            <div className="app-card p-8 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                 onClick={() => handleOptionSelect('list-only')}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <List className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="app-heading-lg app-text-primary mb-4">
                  List Existing Token
                </h2>
                
                <p className="app-text-secondary mb-6">
                  List your already deployed token on SeiList. Requires ownership verification for security.
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="app-text-muted text-sm">Ownership verification</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="app-text-muted text-sm">Security scanning</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="app-text-muted text-sm">Metadata import</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="app-text-muted text-sm">Fast approval</span>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2 app-text-primary group-hover:text-green-500 transition-colors">
                  <span className="font-medium">List Token</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h3 className="app-heading-md app-text-primary mb-2">
                SeiList Platform Stats
              </h3>
              <p className="app-text-muted">
                Join the growing ecosystem of verified tokens on Sei
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="app-card p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-full mb-4">
                  <Rocket className="w-6 h-6 text-blue-500" />
                </div>
                <div className="app-text-primary text-2xl font-bold mb-1">2,847</div>
                <div className="app-text-muted text-sm">Tokens Listed</div>
              </div>

              <div className="app-card p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full mb-4">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <div className="app-text-primary text-2xl font-bold mb-1">100%</div>
                <div className="app-text-muted text-sm">Verified Safe</div>
              </div>

              <div className="app-card p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-full mb-4">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <div className="app-text-primary text-2xl font-bold mb-1">45.2K</div>
                <div className="app-text-muted text-sm">Active Users</div>
              </div>

              <div className="app-card p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500/10 rounded-full mb-4">
                  <TrendingUp className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="app-text-primary text-2xl font-bold mb-1">$12.8M</div>
                <div className="app-text-muted text-sm">Total Volume</div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h3 className="app-heading-md app-text-primary mb-4">
                How SeiList Works
              </h3>
              <p className="app-text-muted max-w-2xl mx-auto">
                Simple, secure, and efficient token listing process designed for the Sei ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full mb-4 font-bold">
                  1
                </div>
                <h4 className="app-text-primary font-semibold mb-2">Choose Option</h4>
                <p className="app-text-muted text-sm">
                  Select between creating a new token or listing an existing one
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full mb-4 font-bold">
                  2
                </div>
                <h4 className="app-text-primary font-semibold mb-2">Verify & Configure</h4>
                <p className="app-text-muted text-sm">
                  Complete verification process and configure your token details
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500 text-white rounded-full mb-4 font-bold">
                  3
                </div>
                <h4 className="app-text-primary font-semibold mb-2">Go Live</h4>
                <p className="app-text-muted text-sm">
                  Your token is listed and available to the Sei community
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeiList;