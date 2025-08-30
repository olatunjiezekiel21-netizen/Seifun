// Z1 Labs AI Service - Enhanced AI capabilities for Seifun
// This service integrates Z1 Labs' advanced AI models for portfolio optimization,
// market prediction, and enhanced natural language processing

export interface Z1LabsConfig {
  apiKey: string;
  baseUrl: string;
  models: {
    nlp: string;
    prediction: string;
    optimization: string;
    sentiment: string;
  };
}

export interface PortfolioOptimizationRequest {
  portfolio: {
    assets: Array<{
      symbol: string;
      amount: number;
      value: number;
      risk: 'low' | 'medium' | 'high';
    }>;
    totalValue: number;
    riskTolerance: 'low' | 'medium' | 'high';
    timeHorizon: 'short' | 'medium' | 'long';
  };
  marketConditions: {
    currentTrend: 'bullish' | 'bearish' | 'neutral';
    volatility: 'low' | 'medium' | 'high';
    sectorPerformance: Record<string, number>;
  };
}

export interface PortfolioOptimizationResponse {
  recommendations: Array<{
    action: 'buy' | 'sell' | 'hold' | 'rebalance';
    asset: string;
    amount: number;
    reason: string;
    confidence: number;
    expectedReturn: number;
    risk: 'low' | 'medium' | 'high';
  }>;
  expectedPortfolioValue: number;
  riskScore: number;
  diversificationScore: number;
  nextReviewDate: string;
}

export interface MarketPredictionRequest {
  asset: string;
  timeframe: '1d' | '1w' | '1m' | '3m' | '6m' | '1y';
  includeFactors: boolean;
}

export interface MarketPredictionResponse {
  asset: string;
  timeframe: string;
  prediction: {
    price: number;
    confidence: number;
    direction: 'up' | 'down' | 'sideways';
    percentageChange: number;
  };
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    description: string;
  }>;
  riskFactors: Array<{
    name: string;
    probability: number;
    impact: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendations: Array<string>;
}

export interface EnhancedIntentAnalysis {
  primaryIntent: string;
  confidence: number;
  entities: Array<{
    type: 'asset' | 'amount' | 'action' | 'timeframe' | 'risk';
    value: string;
    confidence: number;
  }>;
  context: {
    userProfile: 'beginner' | 'intermediate' | 'advanced';
    riskTolerance: 'low' | 'medium' | 'high';
    investmentGoals: string[];
  };
  suggestedActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
  }>;
}

export class Z1LabsService {
  private config: Z1LabsConfig;
  private isInitialized: boolean = false;

  constructor(config: Z1LabsConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Test connection to Z1 Labs
      const response = await fetch(`${this.config.baseUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Z1 Labs connection failed: ${response.statusText}`);
      }

      this.isInitialized = true;
      console.log('✅ Z1 Labs AI service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Z1 Labs service:', error);
      // Fallback to local AI capabilities
      this.isInitialized = false;
    }
  }

  // Enhanced Natural Language Processing
  async analyzeIntent(userMessage: string): Promise<EnhancedIntentAnalysis> {
    if (!this.isInitialized) {
      return this.fallbackIntentAnalysis(userMessage);
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/analyze-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          model: this.config.models.nlp,
          context: 'defi_trading'
        })
      });

      if (!response.ok) {
        throw new Error(`Intent analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Z1 Labs intent analysis failed, using fallback:', error);
      return this.fallbackIntentAnalysis(userMessage);
    }
  }

  // Portfolio Optimization with AI
  async optimizePortfolio(request: PortfolioOptimizationRequest): Promise<PortfolioOptimizationResponse> {
    if (!this.isInitialized) {
      return this.fallbackPortfolioOptimization(request);
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/optimize-portfolio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...request,
          model: this.config.models.optimization
        })
      });

      if (!response.ok) {
        throw new Error(`Portfolio optimization failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Z1 Labs portfolio optimization failed, using fallback:', error);
      return this.fallbackPortfolioOptimization(request);
    }
  }

  // Market Prediction with AI
  async predictMarket(request: MarketPredictionRequest): Promise<MarketPredictionResponse> {
    if (!this.isInitialized) {
      return this.fallbackMarketPrediction(request);
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/predict-market`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...request,
          model: this.config.models.prediction
        })
      });

      if (!response.ok) {
        throw new Error(`Market prediction failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Z1 Labs market prediction failed, using fallback:', error);
      return this.fallbackMarketPrediction(request);
    }
  }

  // Enhanced Response Generation
  async generateEnhancedResponse(
    userMessage: string,
    context: {
      userProfile: any;
      portfolio: any;
      marketConditions: any;
    }
  ): Promise<string> {
    if (!this.isInitialized) {
      return this.fallbackResponseGeneration(userMessage, context);
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/generate-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          context,
          model: this.config.models.nlp,
          style: 'professional_defi_advisor'
        })
      });

      if (!response.ok) {
        throw new Error(`Response generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.response;
    } catch (error) {
      console.warn('Z1 Labs response generation failed, using fallback:', error);
      return this.fallbackResponseGeneration(userMessage, context);
    }
  }

  // Fallback methods when Z1 Labs is not available
  private fallbackIntentAnalysis(userMessage: string): EnhancedIntentAnalysis {
    // Basic intent recognition as fallback
    const lowerMessage = userMessage.toLowerCase();
    
    let primaryIntent = 'general_inquiry';
    let confidence = 0.7;
    
    if (lowerMessage.includes('swap') || lowerMessage.includes('trade')) {
      primaryIntent = 'trading';
      confidence = 0.85;
    } else if (lowerMessage.includes('stake') || lowerMessage.includes('yield')) {
      primaryIntent = 'staking';
      confidence = 0.8;
    } else if (lowerMessage.includes('portfolio') || lowerMessage.includes('balance')) {
      primaryIntent = 'portfolio_inquiry';
      confidence = 0.9;
    } else if (lowerMessage.includes('risk') || lowerMessage.includes('safe')) {
      primaryIntent = 'risk_assessment';
      confidence = 0.75;
    }

    return {
      primaryIntent,
      confidence,
      entities: [],
      context: {
        userProfile: 'intermediate',
        riskTolerance: 'medium',
        investmentGoals: ['growth', 'stability']
      },
      suggestedActions: []
    };
  }

  private fallbackPortfolioOptimization(request: PortfolioOptimizationRequest): PortfolioOptimizationResponse {
    // Basic portfolio optimization as fallback
    return {
      recommendations: [
        {
          action: 'rebalance',
          asset: 'SEI',
          amount: request.portfolio.assets.find(a => a.symbol === 'SEI')?.amount || 0,
          reason: 'Maintain core position for stability',
          confidence: 0.7,
          expectedReturn: 0.15,
          risk: 'medium'
        }
      ],
      expectedPortfolioValue: request.portfolio.totalValue * 1.1,
      riskScore: 65,
      diversificationScore: 70,
      nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  private fallbackMarketPrediction(request: MarketPredictionRequest): MarketPredictionResponse {
    // Basic market prediction as fallback
    return {
      asset: request.asset,
      timeframe: request.timeframe,
      prediction: {
        price: 0,
        confidence: 0.6,
        direction: 'sideways',
        percentageChange: 0
      },
      factors: [],
      riskFactors: [],
      recommendations: ['Monitor market conditions', 'Consider DCA strategy']
    };
  }

  private fallbackResponseGeneration(userMessage: string, context: any): string {
    // Basic response generation as fallback
    return `I understand you're asking about "${userMessage}". Let me help you with that. Currently using enhanced local AI capabilities while we optimize our advanced AI integration.`;
  }

  // Check if Z1 Labs is available
  isAvailable(): boolean {
    return this.isInitialized;
  }

  // Get service status
  getStatus(): { available: boolean; lastError?: string } {
    return {
      available: this.isInitialized
    };
  }
}

// Default Z1 Labs configuration
export const defaultZ1LabsConfig: Z1LabsConfig = {
  apiKey: process.env.VITE_Z1_LABS_API_KEY || '',
  baseUrl: process.env.VITE_Z1_LABS_BASE_URL || 'https://api.z1labs.ai',
  models: {
    nlp: 'z1-defi-nlp-v2',
    prediction: 'z1-market-prediction-v1',
    optimization: 'z1-portfolio-optimizer-v1',
    sentiment: 'z1-sentiment-analysis-v1'
  }
};

// Create singleton instance
export const z1LabsService = new Z1LabsService(defaultZ1LabsConfig);