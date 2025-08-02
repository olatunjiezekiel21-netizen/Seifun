import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Shield, 
  TrendingUp, 
  Users, 
  Clock,
  DollarSign,
  Lock,
  Unlock,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Timer,
  Zap,
  RefreshCw,
  Play,
  Pause,
  Plus,
  Minus,
  Target,
  Activity,
  XCircle
} from 'lucide-react';
import LaunchpadForm from '../components/LaunchpadForm';
import LaunchpadStats from '../components/LaunchpadStats';
import RecentLaunches from '../components/RecentLaunches';

interface LiquidityPool {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  liquidityAmount: string;
  lockDuration: number; // in days
  lockEndTime: Date;
  status: 'locked' | 'unlocked' | 'expiring';
  autoRenew: boolean;
}

const Launchpad = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'liquidity' | 'manage'>('create');
  const [liquidityPools, setLiquidityPools] = useState<LiquidityPool[]>([]);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Simulate liquidity pools data
    const mockPools: LiquidityPool[] = [
      {
        id: '1',
        tokenAddress: '0x1234567890abcdef',
        tokenName: 'SafeMoon',
        tokenSymbol: 'SAFE',
        liquidityAmount: '50,000 SEI',
        lockDuration: 365,
        lockEndTime: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), // 300 days from now
        status: 'locked',
        autoRenew: true
      },
      {
        id: '2',
        tokenAddress: '0xabcdef1234567890',
        tokenName: 'RocketToken',
        tokenSymbol: 'ROCKET',
        liquidityAmount: '25,000 SEI',
        lockDuration: 180,
        lockEndTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'expiring',
        autoRenew: false
      }
    ];
    setLiquidityPools(mockPools);

    // Countdown timer
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(Date.now() + 24 * 60 * 60 * 1000).getTime(); // 24 hours from now
      const distance = target - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'locked': return 'text-green-500 bg-green-50';
      case 'unlocked': return 'text-red-500 bg-red-50';
      case 'expiring': return 'text-orange-500 bg-orange-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const renderCreateToken = () => (
    <div className="space-y-6">
      <div className="sei-card p-6">
        <h2 className="text-2xl font-bold sei-text-primary mb-6">Create New Token</h2>
        <LaunchpadForm />
      </div>
    </div>
  );

  const renderLiquidityManagement = () => (
    <div className="space-y-6">
      {/* Add Liquidity */}
      <div className="sei-card p-6">
        <h3 className="text-lg font-semibold sei-text-primary mb-4">Add Liquidity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Token Address"
            className="sei-input"
          />
          <input
            type="text"
            placeholder="Liquidity Amount (SEI)"
            className="sei-input"
          />
          <input
            type="number"
            placeholder="Lock Duration (days)"
            className="sei-input"
          />
          <button className="sei-btn sei-btn-primary">
            <Plus className="w-4 h-4" />
            Add Liquidity
          </button>
        </div>
      </div>

      {/* Liquidity Pools */}
      <div className="sei-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Token</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Liquidity</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Lock Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Auto Renew</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {liquidityPools.map((pool) => (
                <tr key={pool.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {pool.tokenSymbol.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium sei-text-primary">{pool.tokenSymbol}</div>
                        <div className="text-sm sei-text-secondary">{pool.tokenName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="sei-text-primary">{pool.liquidityAmount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="sei-text-primary">{pool.lockDuration} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(pool.status)}`}>
                      {pool.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {pool.autoRenew ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="sei-btn sei-btn-ghost">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="sei-btn sei-btn-ghost">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="sei-btn sei-btn-ghost text-red-500">
                        <Unlock className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTokenManagement = () => (
    <div className="space-y-6">
      {/* Token Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Total Tokens</p>
              <p className="text-2xl font-bold sei-text-primary">24</p>
            </div>
            <Rocket className="w-8 h-8 sei-text-muted" />
          </div>
        </div>
        
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Active Tokens</p>
              <p className="text-2xl font-bold sei-text-primary">18</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Total Liquidity</p>
              <p className="text-2xl font-bold sei-text-primary">$2.4M</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Avg Safety Score</p>
              <p className="text-2xl font-bold sei-text-primary">87</p>
            </div>
            <Shield className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Launch Timer */}
      <div className="sei-card p-6">
        <h3 className="text-lg font-semibold sei-text-primary mb-4">Next Launch Countdown</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-500">{countdown.days}</div>
            <div className="text-sm sei-text-secondary">Days</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-500">{countdown.hours}</div>
            <div className="text-sm sei-text-secondary">Hours</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-500">{countdown.minutes}</div>
            <div className="text-sm sei-text-secondary">Minutes</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-500">{countdown.seconds}</div>
            <div className="text-sm sei-text-secondary">Seconds</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="sei-card p-6">
        <h3 className="text-lg font-semibold sei-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="sei-btn sei-btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Token</span>
          </button>
          
          <button className="sei-btn sei-btn-secondary flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Add Liquidity</span>
          </button>
          
          <button className="sei-btn sei-btn-secondary flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>View Analytics</span>
          </button>
          
          <button className="sei-btn sei-btn-secondary flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 sei-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold sei-text-primary">Token Launchpad</h1>
              <p className="sei-text-secondary">Create, launch, and manage tokens with advanced liquidity features</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="sei-btn sei-btn-secondary">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="sei-btn sei-btn-primary">
                <Rocket className="w-4 h-4" />
                Launch Token
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8">
          {[
            { id: 'create', label: 'Create Token', icon: Rocket },
            { id: 'liquidity', label: 'Liquidity', icon: DollarSign },
            { id: 'manage', label: 'Manage', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'sei-bg-red text-white'
                    : 'sei-text-secondary hover:sei-text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'create' && renderCreateToken()}
        {activeTab === 'liquidity' && renderLiquidityManagement()}
        {activeTab === 'manage' && renderTokenManagement()}

        {/* Stats */}
        <div className="mt-8">
          <LaunchpadStats />
        </div>

        {/* Recent Launches */}
        <div className="mt-8">
          <RecentLaunches />
        </div>
      </div>
    </div>
  );
};

export default Launchpad;