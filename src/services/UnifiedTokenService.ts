// Unified Token Service - Manages all tokens across the Seifun ecosystem
// This service ensures tokens created in SeiList automatically appear in Seifun Launch, Dev++, and Charts

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  description: string;
  totalSupply: string;
  decimals: number;
  creator: string;
  createdAt: Date;
  verified: boolean;
  securityScore: number;
  holders: number;
  liquidity: number;
  marketCap: number;
  volume24h: number;
  price: number;
  priceChange24h: number;
  website?: string;
  github?: string;
  telegram?: string;
  twitter?: string;
  discord?: string;
  tokenImage: string;
  logoFile?: File;
  launchType: 'fair' | 'presale';
  maxWallet: string;
  lpPercentage: string;
  burnPercentage: string;
  teamPercentage: string;
  lockLp: boolean;
  lockDuration: string;
  daoEnabled: boolean;
  teamWallets: string;
  initialLiquidityETH: string;
  addLiquidity: boolean;
  // Chart and trading data
  chartData?: ChartDataPoint[];
  tradingEnabled: boolean;
  lastUpdated: Date;
}

export interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TokenMetrics {
  price: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  holders: number;
  priceChange24h: number;
}

export class UnifiedTokenService {
  private static instance: UnifiedTokenService;
  private tokens: Map<string, TokenData> = new Map();
  private readonly STORAGE_KEY = 'seifun_unified_tokens';
  private readonly CHART_DATA_KEY = 'seifun_chart_data';

  public static getInstance(): UnifiedTokenService {
    if (!UnifiedTokenService.instance) {
      UnifiedTokenService.instance = new UnifiedTokenService();
    }
    return UnifiedTokenService.instance;
  }

  constructor() {
    this.loadTokensFromStorage();
    this.migrateLegacyTokens();
  }

  // Initialize the service
  async initialize(): Promise<void> {
    try {
      // Load existing tokens
      this.loadTokensFromStorage();
      
      // Migrate legacy tokens from other services
      await this.migrateLegacyTokens();
      
      // Generate initial chart data for existing tokens
      await this.generateChartDataForAllTokens();
      
      console.log('✅ UnifiedTokenService initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize UnifiedTokenService:', error);
    }
  }

  // Create a new token (called from SeiList)
  async createToken(tokenData: Partial<TokenData>): Promise<TokenData> {
    try {
      const token: TokenData = {
        address: tokenData.address || this.generateAddress(),
        name: tokenData.name || '',
        symbol: tokenData.symbol || '',
        description: tokenData.description || '',
        totalSupply: tokenData.totalSupply || '1000000000',
        decimals: tokenData.decimals || 18,
        creator: tokenData.creator || '',
        createdAt: new Date(),
        verified: false,
        securityScore: this.calculateSecurityScore(tokenData),
        holders: 1, // Creator is the first holder
        liquidity: 0,
        marketCap: 0,
        volume24h: 0,
        price: 0,
        priceChange24h: 0,
        website: tokenData.website || '',
        github: tokenData.github || '',
        telegram: tokenData.telegram || '',
        twitter: tokenData.twitter || '',
        discord: tokenData.discord || '',
        tokenImage: tokenData.tokenImage || this.generateTokenImage(tokenData.symbol || '', tokenData.name || ''),
        logoFile: tokenData.logoFile || undefined,
        launchType: tokenData.launchType || 'fair',
        maxWallet: tokenData.maxWallet || '2',
        lpPercentage: tokenData.lpPercentage || '80',
        burnPercentage: tokenData.burnPercentage || '0',
        teamPercentage: tokenData.teamPercentage || '0',
        lockLp: tokenData.lockLp || false,
        lockDuration: tokenData.lockDuration || '0',
        daoEnabled: tokenData.daoEnabled || false,
        teamWallets: tokenData.teamWallets || '',
        initialLiquidityETH: tokenData.initialLiquidityETH || '0',
        addLiquidity: tokenData.addLiquidity || false,
        tradingEnabled: false,
        lastUpdated: new Date()
      };

      // Add to local storage
      this.tokens.set(token.address, token);
      this.saveTokensToStorage();

      // Generate initial chart data
      await this.generateChartDataForToken(token.address);

      // Emit event for other components to update
      this.emitTokenCreated(token);

      console.log('✅ Token created successfully:', token);
      return token;

    } catch (error) {
      console.error('❌ Failed to create token:', error);
      throw error;
    }
  }

  // Get all tokens (for Seifun Launch, Dev++, Charts)
  async getAllTokens(): Promise<TokenData[]> {
    return Array.from(this.tokens.values());
  }

  // Get tokens by category (for Seifun Launch)
  async getTokensByCategory(category: string): Promise<TokenData[]> {
    const tokens = Array.from(this.tokens.values());
    
    switch (category) {
      case 'trending':
        return tokens
          .filter(t => t.volume24h > 1000)
          .sort((a, b) => b.volume24h - a.volume24h)
          .slice(0, 10);
      
      case 'new':
        return tokens
          .filter(t => {
            const daysSinceLaunch = (Date.now() - t.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceLaunch <= 7;
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      case 'top':
        return tokens
          .filter(t => t.marketCap > 10000)
          .sort((a, b) => b.marketCap - a.marketCap)
          .slice(0, 10);
      
      case 'community':
        return tokens
          .filter(t => t.holders > 100)
          .sort((a, b) => b.holders - a.holders)
          .slice(0, 10);
      
      default:
        return tokens;
    }
  }

  // Get tokens by creator (for Dev++)
  async getTokensByCreator(creatorAddress: string): Promise<TokenData[]> {
    return Array.from(this.tokens.values())
      .filter(token => token.creator.toLowerCase() === creatorAddress.toLowerCase());
  }

  // Get token by address (for Charts, detailed views)
  async getTokenByAddress(address: string): Promise<TokenData | null> {
    return this.tokens.get(address) || null;
  }

  // Update token metrics (called periodically or after trades)
  async updateTokenMetrics(address: string, metrics: Partial<TokenMetrics>): Promise<void> {
    const token = this.tokens.get(address);
    if (!token) return;

    // Update metrics
    Object.assign(token, metrics);
    token.lastUpdated = new Date();

    // Update chart data with new price point
    await this.addChartDataPoint(address, {
      timestamp: Date.now(),
      open: token.price,
      high: token.price,
      low: token.price,
      close: token.price,
      volume: metrics.volume24h || token.volume24h
    });

    // Save to storage
    this.saveTokensToStorage();

    // Emit update event
    this.emitTokenUpdated(token);
  }

  // Generate chart data for a token
  async generateChartDataForToken(address: string): Promise<ChartDataPoint[]> {
    const token = this.tokens.get(address);
    if (!token) return [];

    // Generate mock chart data for now (replace with real API calls)
    const chartData = this.generateMockChartData(token);
    
    // Store chart data
    this.storeChartData(address, chartData);
    
    return chartData;
  }

  // Generate chart data for all tokens
  async generateChartDataForAllTokens(): Promise<void> {
    for (const [address] of this.tokens) {
      await this.generateChartDataForToken(address);
    }
  }

  // Add new chart data point
  async addChartDataPoint(address: string, dataPoint: ChartDataPoint): Promise<void> {
    const chartData = this.getChartData(address);
    chartData.push(dataPoint);
    
    // Keep only last 1000 data points
    if (chartData.length > 1000) {
      chartData.splice(0, chartData.length - 1000);
    }
    
    this.storeChartData(address, chartData);
  }

  // Get chart data for a token
  getChartData(address: string): ChartDataPoint[] {
    const stored = localStorage.getItem(`${this.CHART_DATA_KEY}_${address}`);
    return stored ? JSON.parse(stored) : [];
  }

  // Store chart data
  private storeChartData(address: string, data: ChartDataPoint[]): void {
    localStorage.setItem(`${this.CHART_DATA_KEY}_${address}`, JSON.stringify(data));
  }

  // Search tokens (for Seifun Launch search)
  async searchTokens(query: string): Promise<TokenData[]> {
    const tokens = Array.from(this.tokens.values());
    const normalizedQuery = query.toLowerCase();
    
    return tokens.filter(token => 
      token.name.toLowerCase().includes(normalizedQuery) ||
      token.symbol.toLowerCase().includes(normalizedQuery) ||
      token.description.toLowerCase().includes(normalizedQuery)
    );
  }

  // Get trending tokens (for homepage)
  async getTrendingTokens(): Promise<TokenData[]> {
    const tokens = Array.from(this.tokens.values());
    
    return tokens
      .filter(t => t.volume24h > 1000)
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 5);
  }

  // Get new launches (for homepage)
  async getNewLaunches(): Promise<TokenData[]> {
    const tokens = Array.from(this.tokens.values());
    
    return tokens
      .filter(t => {
        const daysSinceLaunch = (Date.now() - t.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLaunch <= 3;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
  }

  // Verify token (called from admin or after security checks)
  async verifyToken(address: string): Promise<void> {
    const token = this.tokens.get(address);
    if (!token) return;

    token.verified = true;
    token.securityScore = Math.min(100, token.securityScore + 20);
    this.saveTokensToStorage();
    
    this.emitTokenVerified(token);
  }

  // Update security score
  async updateSecurityScore(address: string, score: number): Promise<void> {
    const token = this.tokens.get(address);
    if (!token) return;

    token.securityScore = Math.max(0, Math.min(100, score));
    this.saveTokensToStorage();
    
    this.emitTokenUpdated(token);
  }

  // Enable trading for a token
  async enableTrading(address: string): Promise<void> {
    const token = this.tokens.get(address);
    if (!token) return;

    token.tradingEnabled = true;
    this.saveTokensToStorage();
    
    this.emitTradingEnabled(token);
  }

  // Private helper methods

  private generateAddress(): string {
    // Generate a mock address for testing
    return '0x' + Math.random().toString(16).substr(2, 40);
  }

  private calculateSecurityScore(tokenData: Partial<TokenData>): number {
    let score = 50; // Base score
    
    // Add points for good practices
    if (tokenData.lockLp) score += 10;
    if (tokenData.burnPercentage === '0') score += 5;
    if (tokenData.teamPercentage === '0') score += 10;
    if (tokenData.daoEnabled) score += 5;
    if (tokenData.addLiquidity) score += 10;
    
    // Deduct points for risky practices
    if (parseFloat(tokenData.teamPercentage || '0') > 10) score -= 15;
    if (parseFloat(tokenData.maxWallet || '0') < 1) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private generateTokenImage(symbol: string, name: string): string {
    if (!symbol && !name) return '/Seifu.png';
    
    // Create a unique color based on the token symbol
    let hash = 0;
    const text = symbol + name;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    
    // Generate SVG with token symbol
    const svg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="hsl(${hue}, 70%, 60%)" rx="20"/>
        <text x="50" y="60" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
              text-anchor="middle" fill="white">${symbol.slice(0, 4)}</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private generateMockChartData(token: TokenData): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    const now = Date.now();
    const basePrice = token.price || 0.0001;
    
    // Generate 100 data points over the last 7 days
    for (let i = 0; i < 100; i++) {
      const timestamp = now - (100 - i) * (7 * 24 * 60 * 60 * 1000 / 100);
      const randomChange = (Math.random() - 0.5) * 0.02; // ±1% random change
      const currentPrice = Math.max(0.000001, basePrice * (1 + randomChange));
      
      const high = currentPrice * (1 + Math.random() * 0.01);
      const low = currentPrice * (1 - Math.random() * 0.01);
      const open = currentPrice * (1 + (Math.random() - 0.5) * 0.005);
      
      data.push({
        timestamp,
        open,
        high,
        low,
        close: currentPrice,
        volume: Math.random() * 1000000 + 100000
      });
    }
    
    return data;
  }

  private loadTokensFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const tokenArray = JSON.parse(stored);
        this.tokens = new Map(tokenArray.map((t: any) => [t.address, { ...t, createdAt: new Date(t.createdAt) }]));
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
    }
  }

  private saveTokensToStorage(): void {
    try {
      const tokenArray = Array.from(this.tokens.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokenArray));
    } catch (error) {
      console.error('Failed to save tokens to storage:', error);
    }
  }

  private async migrateLegacyTokens(): Promise<void> {
    try {
      // Migrate from dev++_tokens
      const legacyTokens = localStorage.getItem('dev++_tokens');
      if (legacyTokens) {
        const tokens = JSON.parse(legacyTokens);
        for (const token of tokens) {
          if (!this.tokens.has(token.address)) {
            await this.createToken(token);
          }
        }
        // Clear legacy storage
        localStorage.removeItem('dev++_tokens');
      }
    } catch (error) {
      console.error('Failed to migrate legacy tokens:', error);
    }
  }

  // Event system for real-time updates
  private eventListeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  private emitTokenCreated(token: TokenData): void {
    this.emit('tokenCreated', token);
  }

  private emitTokenUpdated(token: TokenData): void {
    this.emit('tokenUpdated', token);
  }

  private emitTokenVerified(token: TokenData): void {
    this.emit('tokenVerified', token);
  }

  private emitTradingEnabled(token: TokenData): void {
    this.emit('tradingEnabled', token);
  }

  // Public methods for external access
  public getTokenCount(): number {
    return this.tokens.size;
  }

  public getVerifiedTokenCount(): number {
    return Array.from(this.tokens.values()).filter(t => t.verified).length;
  }

  public getTotalMarketCap(): number {
    return Array.from(this.tokens.values()).reduce((sum, t) => sum + t.marketCap, 0);
  }

  public getTotalVolume24h(): number {
    return Array.from(this.tokens.values()).reduce((sum, t) => sum + t.volume24h, 0);
  }
}

// Export singleton instance
export const unifiedTokenService = UnifiedTokenService.getInstance();