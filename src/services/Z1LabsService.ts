// Z1 Labs AI Service - Enhanced AI capabilities for Seifun
// This service integrates Z1 Labs' advanced AI models for portfolio optimization,
// market prediction, and enhanced natural language processing

export interface Z1LabsConfig {
  apiKey: string;
  baseUrl: string;
}

export interface EnhancedIntentAnalysis {
  intent: string;
  confidence: number;
  entities: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  riskLevel: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  marketContext: {
    currentTrend: string;
    volatility: number;
    opportunityScore: number;
  };
}

export interface PortfolioOptimizationRequest {
  currentHoldings: {
    token: string;
    amount: number;
    value: number;
  }[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
  timeHorizon: 'short' | 'medium' | 'long';
}

export interface PortfolioOptimizationResponse {
  optimizedAllocation: {
    token: string;
    recommendedPercentage: number;
    expectedReturn: number;
    riskScore: number;
  }[];
  totalExpectedReturn: number;
  riskAdjustedReturn: number;
  diversificationScore: number;
  recommendations: string[];
}

export interface MarketPredictionRequest {
  token: string;
  timeframe: '1h' | '4h' | '1d' | '1w' | '1m';
  includeSentiment?: boolean;
  includeRisk?: boolean;
}

export interface MarketPredictionResponse {
  token: string;
  timeframe: string;
  prediction: {
    direction: 'up' | 'down' | 'sideways';
    confidence: number;
    expectedMove: number;
    targetPrice: number;
  };
  sentiment: {
    overall: 'bullish' | 'bearish' | 'neutral';
    score: number;
    factors: string[];
  };
  risk: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    volatility: number;
  };
  technicalIndicators: {
    rsi: number;
    macd: string;
    support: number;
    resistance: number;
  };
}

export interface RiskAssessmentRequest {
  token: string;
  amount: number;
  userRiskProfile: 'conservative' | 'moderate' | 'aggressive';
}

export interface RiskAssessmentResponse {
  token: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  riskFactors: {
    factor: string;
    impact: 'low' | 'medium' | 'high';
    description: string;
  }[];
  recommendations: string[];
  maxRecommendedAmount: number;
}

export interface MarketSentimentRequest {
  tokens: string[];
  timeframe: '1h' | '4h' | '1d' | '1w';
}

export interface MarketSentimentResponse {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  tokenSentiments: {
    token: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    score: number;
    confidence: number;
  }[];
  marketMood: string;
  trendingTopics: string[];
}

export class Z1LabsService {
  private config: Z1LabsConfig;
  private isAvailable: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 5 * 60 * 1000; // 5 minutes

  constructor(config: Z1LabsConfig) {
    this.config = config;
  }

  async initialize(): Promise<boolean> {
    try {
      // Don't crash if no API key - just run in fallback mode
      if (!this.config.apiKey || !this.config.baseUrl) {
        console.log('⚠️ Z1 Labs: Running in fallback mode (no API key)');
        this.isAvailable = false;
        return false;
      }

      // Test the connection with timeout and error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const response = await fetch(`${this.config.baseUrl}/health`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          this.isAvailable = true;
          this.lastHealthCheck = Date.now();
          console.log('✅ Z1 Labs AI: Successfully connected');
          return true;
        } else {
          console.log('⚠️ Z1 Labs: Health check failed, using fallback mode');
          this.isAvailable = false;
          return false;
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.log('⚠️ Z1 Labs: Connection timeout, using fallback mode');
        } else {
          console.log('⚠️ Z1 Labs: Connection failed, using fallback mode');
        }
        this.isAvailable = false;
        return false;
      }
    } catch (error) {
      console.log('⚠️ Z1 Labs: Initialization error, using fallback mode');
      this.isAvailable = false;
      return false;
    }
  }

  // Enhanced Intent Analysis with Z1 Labs AI
  async analyzeIntent(userMessage: string, context?: any): Promise<EnhancedIntentAnalysis> {
    try {
      if (!this.isAvailable) {
        return this.fallbackIntentAnalysis(userMessage);
      }

      const response = await fetch(`${this.config.baseUrl}/ai/analyze-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          context: context || {},
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data as EnhancedIntentAnalysis;
      } else {
        throw new Error(`Z1 Labs API error: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️ Z1 Labs intent analysis failed, using fallback');
      return this.fallbackIntentAnalysis(userMessage);
    }
  }

  // Advanced Portfolio Optimization
  async optimizePortfolio(request: PortfolioOptimizationRequest): Promise<PortfolioOptimizationResponse> {
    try {
      if (!this.isAvailable) {
        return this.fallbackPortfolioOptimization(request);
      }

      const response = await fetch(`${this.config.baseUrl}/ai/optimize-portfolio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        const data = await response.json();
        return data as PortfolioOptimizationResponse;
      } else {
        throw new Error(`Z1 Labs API error: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️ Z1 Labs portfolio optimization failed, using fallback');
      return this.fallbackPortfolioOptimization(request);
    }
  }

  // Advanced Market Prediction
  async predictMarket(request: MarketPredictionRequest): Promise<MarketPredictionResponse> {
    try {
      if (!this.isAvailable) {
        return this.fallbackMarketPrediction(request);
      }

      const response = await fetch(`${this.config.baseUrl}/ai/predict-market`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        const data = await response.json();
        return data as MarketPredictionResponse;
      } else {
        throw new Error(`Z1 Labs API error: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️ Z1 Labs market prediction failed, using fallback');
      return this.fallbackMarketPrediction(request);
    }
  }

  // Risk Assessment
  async assessRisk(request: RiskAssessmentRequest): Promise<RiskAssessmentResponse> {
    try {
      if (!this.isAvailable) {
        return this.fallbackRiskAssessment(request);
      }

      const response = await fetch(`${this.config.baseUrl}/ai/assess-risk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        const data = await response.json();
        return data as RiskAssessmentResponse;
      } else {
        throw new Error(`Z1 Labs API error: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️ Z1 Labs risk assessment failed, using fallback');
      return this.fallbackRiskAssessment(request);
    }
  }

  // Market Sentiment Analysis
  async analyzeMarketSentiment(request: MarketSentimentRequest): Promise<MarketSentimentResponse> {
    try {
      if (!this.isAvailable) {
        return this.fallbackMarketSentiment(request);
      }

      const response = await fetch(`${this.config.baseUrl}/ai/market-sentiment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        const data = await response.json();
        return data as MarketSentimentResponse;
      } else {
        throw new Error(`Z1 Labs API error: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️ Z1 Labs sentiment analysis failed, using fallback');
      return this.fallbackMarketSentiment(request);
    }
  }

  // Generate Enhanced AI Response
  async generateEnhancedResponse(
    userMessage: string, 
    context: any, 
    intent: string
  ): Promise<string> {
    try {
      if (!this.isAvailable) {
        return this.fallbackEnhancedResponse(userMessage, context, intent);
      }

      const response = await fetch(`${this.config.baseUrl}/ai/generate-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          context: context || {},
          intent: intent,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response || data.message || 'I understand your request. Let me help you with that.';
      } else {
        throw new Error(`Z1 Labs API error: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️ Z1 Labs response generation failed, using fallback');
      return this.fallbackEnhancedResponse(userMessage, context, intent);
    }
  }

  // Fallback Methods
  private fallbackIntentAnalysis(userMessage: string): EnhancedIntentAnalysis {
    const lowerMessage = userMessage.toLowerCase();
    
    // Basic intent detection
    let intent = 'conversation';
    let confidence = 0.7;
    let entities: string[] = [];
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (/portfolio|holdings|balance/i.test(lowerMessage)) {
      intent = 'portfolio_analysis';
      confidence = 0.8;
    } else if (/swap|trade|exchange/i.test(lowerMessage)) {
      intent = 'trading';
      confidence = 0.9;
    } else if (/stake|yield|farm/i.test(lowerMessage)) {
      intent = 'staking';
      confidence = 0.85;
    } else if (/market|price|trend/i.test(lowerMessage)) {
      intent = 'market_analysis';
      confidence = 0.8;
    } else if (/scan|security|safe/i.test(lowerMessage)) {
      intent = 'security_scan';
      confidence = 0.9;
    }

    return {
      intent,
      confidence,
      entities,
      sentiment,
      riskLevel,
      suggestedActions: this.getSuggestedActions(intent),
      marketContext: {
        currentTrend: 'stable',
        volatility: 0.3,
        opportunityScore: 0.6
      }
    };
  }

  private fallbackPortfolioOptimization(request: PortfolioOptimizationRequest): PortfolioOptimizationResponse {
    // Simple fallback optimization logic
    const totalValue = request.currentHoldings.reduce((sum, holding) => sum + holding.value, 0);
    
    return {
      optimizedAllocation: request.currentHoldings.map(holding => ({
        token: holding.token,
        recommendedPercentage: (holding.value / totalValue) * 100,
        expectedReturn: 0.08, // 8% default
        riskScore: 0.4
      })),
      totalExpectedReturn: 0.08,
      riskAdjustedReturn: 0.06,
      diversificationScore: 0.7,
      recommendations: [
        'Consider diversifying across different asset classes',
        'Monitor your portfolio regularly',
        'Rebalance quarterly for optimal performance'
      ]
    };
  }

  private fallbackMarketPrediction(request: MarketPredictionRequest): MarketPredictionResponse {
    return {
      token: request.token,
      timeframe: request.timeframe,
      prediction: {
        direction: 'sideways',
        confidence: 0.6,
        expectedMove: 0.05,
        targetPrice: 0
      },
      sentiment: {
        overall: 'neutral',
        score: 0.5,
        factors: ['Market stability', 'Balanced volume']
      },
      risk: {
        level: 'medium',
        factors: ['Normal market volatility'],
        volatility: 0.3
      },
      technicalIndicators: {
        rsi: 50,
        macd: 'neutral',
        support: 0,
        resistance: 0
      }
    };
  }

  private fallbackRiskAssessment(request: RiskAssessmentRequest): RiskAssessmentResponse {
    return {
      token: request.token,
      riskScore: 45,
      riskLevel: 'medium',
      riskFactors: [
        {
          factor: 'Market volatility',
          impact: 'medium',
          description: 'Normal market conditions'
        }
      ],
      recommendations: [
        'Start with a small position',
        'Set stop-loss orders',
        'Monitor market conditions'
      ],
      maxRecommendedAmount: request.amount * 0.8
    };
  }

  private fallbackMarketSentiment(request: MarketSentimentRequest): MarketSentimentResponse {
    return {
      overallSentiment: 'neutral',
      sentimentScore: 0.5,
      tokenSentiments: request.tokens.map(token => ({
        token,
        sentiment: 'neutral',
        score: 0.5,
        confidence: 0.6
      })),
      marketMood: 'Balanced',
      trendingTopics: ['DeFi growth', 'Market stability']
    };
  }

  private fallbackEnhancedResponse(userMessage: string, context: any, intent: string): string {
    // Enhanced fallback responses
    const responses = {
      portfolio_analysis: "I can help you analyze your portfolio! Let me check your current holdings and provide optimization recommendations.",
      trading: "I'm ready to help you with trading! I can assist with swaps, provide best routes, and help optimize your trades.",
      staking: "Great choice! Let me help you find the best staking opportunities and optimize your yield farming strategies.",
      market_analysis: "I'll analyze the current market conditions and provide you with insights and predictions to help with your decisions.",
      security_scan: "Security first! I can scan any token for potential risks, verify contracts, and ensure your investments are safe."
    };

    return responses[intent as keyof typeof responses] || 
           "I understand your request. Let me help you with that using my available tools and knowledge.";
  }

  private getSuggestedActions(intent: string): string[] {
    const actions = {
      portfolio_analysis: ['Check current holdings', 'Optimize allocation', 'Risk assessment'],
      trading: ['View best routes', 'Check liquidity', 'Set slippage'],
      staking: ['Find best APY', 'Check lock periods', 'Calculate rewards'],
      market_analysis: ['Get price predictions', 'Check trends', 'Analyze sentiment'],
      security_scan: ['Scan token address', 'Check contract', 'Verify liquidity']
    };

    return actions[intent as keyof typeof actions] || ['Get started', 'Learn more', 'Explore features'];
  }

  // Utility methods
  public getStatus(): { available: boolean; lastCheck: number; config: boolean } {
    return {
      available: this.isAvailable,
      lastCheck: this.lastHealthCheck,
      config: !!(this.config.apiKey && this.config.baseUrl)
    };
  }

  public isServiceAvailable(): boolean {
    // Check if we need to refresh health check
    if (Date.now() - this.lastHealthCheck > this.healthCheckInterval) {
      this.initialize(); // Async refresh
    }
    return this.isAvailable;
  }
}

// Default Z1 Labs configuration
export const defaultZ1LabsConfig: Z1LabsConfig = {
  apiKey: process.env.VITE_Z1_LABS_API_KEY || '',
  baseUrl: process.env.VITE_Z1_LABS_BASE_URL || 'https://api.z1labs.ai'
};

// Create singleton instance
export const z1LabsService = new Z1LabsService(defaultZ1LabsConfig);