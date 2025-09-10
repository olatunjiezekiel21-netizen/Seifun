// ContextStore Contract Interface for Sei Network
// This is a TypeScript interface representing the on-chain ContextStore contract
// Based on Z1 Labs MCP ContextStore implementation

export interface ContextStoreContract {
  // Core contract functions
  storeContext(
    userId: string,
    contextHash: string,
    metadata: ContextMetadata,
    signature: string
  ): Promise<boolean>;

  retrieveContext(
    userId: string,
    contextId: string
  ): Promise<StoredContext | null>;

  updateContext(
    contextId: string,
    newContextHash: string,
    newMetadata: ContextMetadata,
    signature: string
  ): Promise<boolean>;

  deleteContext(
    contextId: string,
    signature: string
  ): Promise<boolean>;

  // Query functions
  getUserContexts(userId: string): Promise<StoredContext[]>;
  getContextHistory(contextId: string): Promise<ContextVersion[]>;
  getContextMetadata(contextId: string): Promise<ContextMetadata | null>;

  // Admin functions
  setContextValidator(validator: string): Promise<boolean>;
  setStorageFee(fee: number): Promise<boolean>;
  withdrawFees(): Promise<boolean>;
}

// Data structures
export interface ContextMetadata {
  type: string;           // Type of context (portfolio, market, risk, etc.)
  version: string;        // Version of the context
  timestamp: number;      // Unix timestamp
  expiresAt?: number;     // Optional expiration timestamp
  tags: string[];         // Searchable tags
  description: string;    // Human-readable description
  modelHash: string;      // Hash of the AI model used
  confidence: number;     // AI confidence score (0-1)
  riskScore?: number;     // Risk assessment score
  metadata: Record<string, any>; // Additional metadata
}

export interface StoredContext {
  id: string;             // Unique context identifier
  userId: string;         // User who owns this context
  contextHash: string;    // IPFS hash of the actual context data
  metadata: ContextMetadata;
  createdAt: number;      // Creation timestamp
  updatedAt: number;      // Last update timestamp
  version: number;        // Current version number
  isActive: boolean;      // Whether context is still active
  accessCount: number;    // Number of times accessed
  lastAccessed: number;   // Last access timestamp
}

export interface ContextVersion {
  version: number;
  contextHash: string;
  metadata: ContextMetadata;
  timestamp: number;
  signature: string;
}

// Events emitted by the contract
export interface ContextStoreEvents {
  ContextStored: {
    userId: string;
    contextId: string;
    contextHash: string;
    timestamp: number;
  };

  ContextUpdated: {
    contextId: string;
    newContextHash: string;
    version: number;
    timestamp: number;
  };

  ContextDeleted: {
    contextId: string;
    timestamp: number;
  };

  ContextAccessed: {
    contextId: string;
    userId: string;
    timestamp: number;
  };
}

// Contract configuration
export interface ContextStoreConfig {
  maxContextSize: number;     // Maximum context data size in bytes
  maxContextsPerUser: number; // Maximum contexts per user
  contextExpiryDays: number;  // Default context expiry in days
  storageFee: number;         // Fee for storing context (in SEI)
  validatorAddress: string;   // Address that can validate contexts
  ipfsGateway: string;        // IPFS gateway for context retrieval
}

// Context types for Seifun
export enum SeifunContextType {
  PORTFOLIO_OPTIMIZATION = 'portfolio_optimization',
  MARKET_PREDICTION = 'market_prediction',
  RISK_ASSESSMENT = 'risk_assessment',
  TRADING_STRATEGY = 'trading_strategy',
  USER_PREFERENCES = 'user_preferences',
  LEARNING_HISTORY = 'learning_history',
  AI_DECISIONS = 'ai_decisions',
  PORTFOLIO_PERFORMANCE = 'portfolio_performance'
}

// Seifun-specific context data structures
export interface PortfolioOptimizationContext {
  type: SeifunContextType.PORTFOLIO_OPTIMIZATION;
  assets: PortfolioAsset[];
  riskTolerance: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
  recommendedAllocation: Record<string, number>;
  expectedReturn: number;
  riskScore: number;
  confidence: number;
  factors: string[];
  timestamp: number;
}

export interface MarketPredictionContext {
  type: SeifunContextType.MARKET_PREDICTION;
  asset: string;
  timeframe: string;
  prediction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  factors: string[];
  technicalIndicators: Record<string, number>;
  sentiment: number;
  timestamp: number;
}

export interface RiskAssessmentContext {
  type: SeifunContextType.RISK_ASSESSMENT;
  token: string;
  amount: number;
  portfolio: string[];
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: Record<string, number>;
  recommendation: string;
  confidence: number;
  timestamp: number;
}

export interface TradingStrategyContext {
  type: SeifunContextType.TRADING_STRATEGY;
  strategy: string;
  entryPoints: number[];
  exitPoints: number[];
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
  confidence: number;
  timestamp: number;
}

export interface UserPreferencesContext {
  type: SeifunContextType.USER_PREFERENCES;
  riskTolerance: 'low' | 'medium' | 'high';
  investmentGoals: string[];
  preferredAssets: string[];
  tradingStyle: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: 'short' | 'medium' | 'long';
  notificationPreferences: Record<string, boolean>;
  timestamp: number;
}

export interface LearningHistoryContext {
  type: SeifunContextType.LEARNING_HISTORY;
  decisions: AIDecision[];
  outcomes: DecisionOutcome[];
  accuracy: number;
  improvements: string[];
  timestamp: number;
}

export interface AIDecisionContext {
  type: SeifunContextType.AI_DECISIONS;
  decision: string;
  reasoning: string;
  confidence: number;
  alternatives: string[];
  timestamp: number;
}

export interface PortfolioPerformanceContext {
  type: SeifunContextType.PORTFOLIO_PERFORMANCE;
  totalValue: number;
  change24h: number;
  change7d: number;
  change30d: number;
  bestPerformer: string;
  worstPerformer: string;
  rebalanceNeeded: boolean;
  timestamp: number;
}

// Portfolio asset structure
export interface PortfolioAsset {
  symbol: string;
  amount: number;
  value: number;
  risk: 'low' | 'medium' | 'high';
  allocation: number;
  performance: number;
}

// AI decision structure
export interface AIDecision {
  id: string;
  type: string;
  input: any;
  output: any;
  confidence: number;
  timestamp: number;
}

// Decision outcome structure
export interface DecisionOutcome {
  decisionId: string;
  actualOutcome: any;
  expectedOutcome: any;
  accuracy: number;
  feedback: string;
  timestamp: number;
}

// Context validation interface
export interface ContextValidator {
  validateContext(
    context: any,
    metadata: ContextMetadata
  ): Promise<ValidationResult>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidence: number;
}

// Export all types
export type SeifunContext = 
  | PortfolioOptimizationContext
  | MarketPredictionContext
  | RiskAssessmentContext
  | TradingStrategyContext
  | UserPreferencesContext
  | LearningHistoryContext
  | AIDecisionContext
  | PortfolioPerformanceContext;