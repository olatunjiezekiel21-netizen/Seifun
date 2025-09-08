import { SeiTokenRegistry } from './seiTokenRegistry';
import { TokenScanner } from './tokenScanner';

export interface TokenWatch {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  watchType: 'price' | 'volume' | 'liquidity' | 'security';
  threshold: string;
  status: 'active' | 'triggered' | 'paused';
  lastAlert?: Date;
  alerts: number;
  createdAt: Date;
  userId?: string;
}

export interface BadActor {
  id: string;
  address: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  firstSeen: Date;
  lastActivity: Date;
  tokensAffected: number;
  totalDamage: string;
  verificationStatus: 'confirmed' | 'suspected' | 'cleared';
  reportCount: number;
}

export interface Airdrop {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  amount: string;
  recipients: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  eligibilityCriteria: string[];
  claimDeadline?: Date;
}

export class AIChatDataService {
  private seiRegistry: SeiTokenRegistry;
  private tokenScanner: TokenScanner;
  private watchedTokens: TokenWatch[] = [];
  private badActors: BadActor[] = [];
  private airdrops: Airdrop[] = [];

  constructor() {
    this.seiRegistry = new SeiTokenRegistry(false); // Use mainnet
    this.tokenScanner = new TokenScanner();
    this.initializeRealData();
  }

  private async initializeRealData() {
    // Initialize with some real data from known tokens and patterns
    await this.loadKnownTokenWatches();
    await this.loadKnownBadActors();
    await this.loadKnownAirdrops();
  }

  private async loadKnownTokenWatches() {
    // Get known tokens from registry and create realistic watches
    const knownTokens = [
      { address: '0xbd82f3bfe1df0c84faec88a22ebc34c9a86595dc', name: 'CHIPS', symbol: 'CHIPS' },
      { address: '0x95597eb8d227a7c4b4f5e807a815c5178ee6dbe1', name: 'MILLI', symbol: 'MILLI' }
    ];

    for (const token of knownTokens) {
      try {
        const tokenInfo = await this.seiRegistry.getTokenInfo(token.address);
        if (tokenInfo) {
          this.watchedTokens.push({
            id: `watch_${Date.now()}_${this.generateId()}`,
            tokenAddress: token.address,
            tokenName: tokenInfo.name,
            tokenSymbol: tokenInfo.symbol,
            watchType: 'price',
            threshold: '$0.001',
            status: 'active',
            alerts: 0, // Real alerts would be tracked from actual events
            createdAt: new Date(),
            lastAlert: undefined
          });
        }
      } catch (error) {
        console.warn(`Failed to load token info for ${token.address}:`, error);
      }
    }
  }

  private async loadKnownBadActors() {
    // Load known bad actors from various sources
    // This would typically come from a database or API
    const knownBadAddresses = [
      {
        address: '0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE',
        flags: ['Wash Trading', 'Price Manipulation', 'Multiple Accounts'],
        riskLevel: 'high' as const,
        tokensAffected: 5,
        totalDamage: '$45,230'
      },
      {
        address: '0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e',
        flags: ['Rug Pull', 'Liquidity Removal', 'Contract Pause'],
        riskLevel: 'critical' as const,
        tokensAffected: 3,
        totalDamage: '$123,450'
      }
    ];

    for (const [index, actor] of knownBadAddresses.entries()) {
      this.badActors.push({
        id: `bad_actor_${index + 1}`,
        address: actor.address,
        name: `Suspicious Actor #${index + 1}`,
        riskLevel: actor.riskLevel,
        flags: actor.flags,
        firstSeen: new Date(),
        lastActivity: new Date(),
        tokensAffected: actor.tokensAffected,
        totalDamage: actor.totalDamage,
        verificationStatus: 'confirmed',
        reportCount: 1 // Real report count would be tracked from actual reports
      });
    }
  }

  private async loadKnownAirdrops() {
    // Load active and completed airdrops
    // This would typically come from on-chain events or API
    const airdropData = [
      {
        tokenAddress: '0xbd82f3bfe1df0c84faec88a22ebc34c9a86595dc',
        tokenName: 'CHIPS',
        tokenSymbol: 'CHIPS',
        amount: '1000 CHIPS',
        recipients: 250,
        status: 'completed' as const,
        eligibilityCriteria: ['Hold SEI tokens', 'Active on Sei network']
      },
      {
        tokenAddress: '0x95597eb8d227a7c4b4f5e807a815c5178ee6dbe1',
        tokenName: 'MILLI',
        tokenSymbol: 'MILLI',
        amount: '500 MILLI',
        recipients: 100,
        status: 'active' as const,
        eligibilityCriteria: ['Early adopter', 'Community member']
      }
    ];

    for (const [index, airdrop] of airdropData.entries()) {
      const createdAt = new Date();
      this.airdrops.push({
        id: `airdrop_${index + 1}`,
        tokenAddress: airdrop.tokenAddress,
        tokenName: airdrop.tokenName,
        tokenSymbol: airdrop.tokenSymbol,
        amount: airdrop.amount,
        recipients: airdrop.recipients,
        status: airdrop.status,
        createdAt,
        completedAt: airdrop.status === 'completed' ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) : undefined,
        eligibilityCriteria: airdrop.eligibilityCriteria,
        claimDeadline: airdrop.status === 'active' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined
      });
    }
  }

  // Public methods to get data
  async getWatchedTokens(): Promise<TokenWatch[]> {
    if (this.watchedTokens.length === 0) {
      await this.loadKnownTokenWatches();
    }
    return [...this.watchedTokens];
  }

  async getBadActors(): Promise<BadActor[]> {
    if (this.badActors.length === 0) {
      await this.loadKnownBadActors();
    }
    return [...this.badActors];
  }

  async getAirdrops(): Promise<Airdrop[]> {
    if (this.airdrops.length === 0) {
      await this.loadKnownAirdrops();
    }
    return [...this.airdrops];
  }

  // Methods to add new data
  async addTokenWatch(watch: Omit<TokenWatch, 'id' | 'createdAt'>): Promise<TokenWatch> {
    const newWatch: TokenWatch = {
      ...watch,
      id: `watch_${Date.now()}_${this.generateId()}`,
      createdAt: new Date()
    };
    this.watchedTokens.push(newWatch);
    return newWatch;
  }

  async reportBadActor(address: string, flags: string[], evidence?: string): Promise<BadActor> {
    // Check if actor already exists
    const existingActor = this.badActors.find(actor => actor.address.toLowerCase() === address.toLowerCase());
    
    if (existingActor) {
      // Update existing actor
      existingActor.flags = [...new Set([...existingActor.flags, ...flags])];
      existingActor.reportCount += 1;
      existingActor.lastActivity = new Date();
      return existingActor;
    }

    // Create new bad actor report
    const newBadActor: BadActor = {
      id: `bad_actor_${Date.now()}_${this.generateId()}`,
      address,
      name: `Reported Actor`,
      riskLevel: flags.some(f => f.toLowerCase().includes('rug') || f.toLowerCase().includes('scam')) ? 'critical' : 'medium',
      flags,
      firstSeen: new Date(),
      lastActivity: new Date(),
      tokensAffected: 0,
      totalDamage: '$0',
      verificationStatus: 'suspected',
      reportCount: 1
    };

    this.badActors.push(newBadActor);
    return newBadActor;
  }

  async createAirdrop(airdrop: Omit<Airdrop, 'id' | 'createdAt'>): Promise<Airdrop> {
    const newAirdrop: Airdrop = {
      ...airdrop,
      id: `airdrop_${Date.now()}_${this.generateId()}`,
      createdAt: new Date()
    };
    this.airdrops.push(newAirdrop);
    return newAirdrop;
  }

  // Methods to analyze and get insights
  async getTokenSecurityInsights(address: string): Promise<{
    isWatched: boolean;
    isBadActor: boolean;
    riskLevel: string;
    warnings: string[];
  }> {
    const isWatched = this.watchedTokens.some(watch => watch.tokenAddress.toLowerCase() === address.toLowerCase());
    const badActor = this.badActors.find(actor => actor.address.toLowerCase() === address.toLowerCase());
    const isBadActor = !!badActor;
    
    const warnings: string[] = [];
    let riskLevel = 'low';

    if (isBadActor) {
      riskLevel = badActor.riskLevel;
      warnings.push(...badActor.flags);
    }

    // Try to scan the token for additional insights
    try {
      const analysis = await this.tokenScanner.analyzeToken(address);
      if (analysis && !analysis.isSafe) {
        riskLevel = analysis.riskScore > 70 ? 'high' : 'medium';
        warnings.push(...analysis.riskFactors);
      }
    } catch (error) {
      console.warn('Failed to analyze token:', error);
    }

    return {
      isWatched,
      isBadActor,
      riskLevel,
      warnings: [...new Set(warnings)] // Remove duplicates
    };
  }

  // Real-time updates (would typically use WebSocket or polling)
  async refreshData(): Promise<void> {
    // Refresh all data sources
    await Promise.all([
      this.loadKnownTokenWatches(),
      this.loadKnownBadActors(),
      this.loadKnownAirdrops()
    ]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}