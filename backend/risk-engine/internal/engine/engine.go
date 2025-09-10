package engine

import (
	"context"
	"fmt"
	"math/big"
	"time"

	"seifun/backend/risk-engine/internal/config"
	"seifun/backend/risk-engine/internal/rules"
	"seifun/backend/risk-engine/internal/storage"
)

// RiskAssessment represents a comprehensive risk assessment
type RiskAssessment struct {
	Score        int      `json:"score"`
	IsScam       bool     `json:"is_scam"`
	Factors      []string `json:"factors"`
	Liquidity    int      `json:"liquidity"`
	Volatility   int      `json:"volatility"`
	MarketCap    int      `json:"market_cap"`
	Timestamp    time.Time `json:"timestamp"`
}

// TokenInfo represents basic token information
type TokenInfo struct {
	Address     string   `json:"address"`
	Symbol      string   `json:"symbol"`
	Name        string   `json:"name"`
	Decimals    int      `json:"decimals"`
	TotalSupply *big.Int `json:"total_supply"`
	IsEVM       bool     `json:"is_evm"`
	ChainID     string   `json:"chain_id"`
}

// MarketData represents market information
type MarketData struct {
	Price      float64   `json:"price"`
	Change24h  float64   `json:"change_24h"`
	Volume24h  *big.Int  `json:"volume_24h"`
	MarketCap  *big.Int  `json:"market_cap"`
	Timestamp  time.Time `json:"timestamp"`
}

// LiquidityData represents liquidity information
type LiquidityData struct {
	TotalLiquidity *big.Int `json:"total_liquidity"`
	PoolCount      int      `json:"pool_count"`
	Volume24h      *big.Int `json:"volume_24h"`
	LiquidityScore int      `json:"liquidity_score"`
}

// TechnicalData represents technical analysis data
type TechnicalData struct {
	RSI         float64 `json:"rsi"`
	MACD        float64 `json:"macd"`
	Bollinger   float64 `json:"bollinger"`
	Support     float64 `json:"support"`
	Resistance  float64 `json:"resistance"`
	Trend       string  `json:"trend"`
}

// RiskEngine handles comprehensive risk assessment
type RiskEngine struct {
	config     *config.Config
	rules      *rules.RuleEngine
	storage    *storage.Storage
}

// NewRiskEngine creates a new risk engine instance
func NewRiskEngine(cfg *config.Config) (*RiskEngine, error) {
	// Initialize storage
	storage, err := storage.NewStorage(cfg.Database)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize storage: %w", err)
	}

	// Initialize rule engine
	ruleEngine, err := rules.NewRuleEngine(cfg.Rules)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize rule engine: %w", err)
	}

	return &RiskEngine{
		config:  cfg,
		rules:   ruleEngine,
		storage: storage,
	}, nil
}

// AssessToken performs comprehensive risk assessment
func (re *RiskEngine) AssessToken(ctx context.Context, tokenInfo *TokenInfo, marketData *MarketData, liquidityData *LiquidityData, technicalData *TechnicalData) (*RiskAssessment, error) {
	// Initialize assessment
	assessment := &RiskAssessment{
		Score:     100, // Start with perfect score
		IsScam:    false,
		Factors:   []string{},
		Liquidity: 100,
		Volatility: 0,
		MarketCap: 0,
		Timestamp: time.Now(),
	}

	// Apply liquidity rules
	liquidityScore, liquidityFactors := re.rules.AssessLiquidity(liquidityData)
	assessment.Liquidity = liquidityScore
	assessment.Factors = append(assessment.Factors, liquidityFactors...)
	assessment.Score = min(assessment.Score, liquidityScore)

	// Apply volatility rules
	volatilityScore, volatilityFactors := re.rules.AssessVolatility(marketData, technicalData)
	assessment.Volatility = volatilityScore
	assessment.Factors = append(assessment.Factors, volatilityFactors...)
	assessment.Score = min(assessment.Score, volatilityScore)

	// Apply market cap rules
	marketCapScore, marketCapFactors := re.rules.AssessMarketCap(marketData)
	assessment.MarketCap = marketCapScore
	assessment.Factors = append(assessment.Factors, marketCapFactors...)
	assessment.Score = min(assessment.Score, marketCapScore)

	// Apply scam detection rules
	isScam, scamFactors := re.rules.DetectScam(tokenInfo, marketData, liquidityData)
	assessment.IsScam = isScam
	assessment.Factors = append(assessment.Factors, scamFactors...)
	if isScam {
		assessment.Score = 0
	}

	// Apply contract analysis rules (for EVM tokens)
	if tokenInfo.IsEVM {
		contractScore, contractFactors := re.rules.AnalyzeContract(tokenInfo)
		assessment.Factors = append(assessment.Factors, contractFactors...)
		assessment.Score = min(assessment.Score, contractScore)
	}

	// Apply technical analysis rules
	technicalScore, technicalFactors := re.rules.AnalyzeTechnical(technicalData)
	assessment.Factors = append(assessment.Factors, technicalFactors...)
	assessment.Score = min(assessment.Score, technicalScore)

	// Store assessment in database
	if err := re.storage.StoreAssessment(ctx, assessment); err != nil {
		// Log error but don't fail the assessment
		fmt.Printf("Warning: failed to store assessment: %v\n", err)
	}

	return assessment, nil
}

// GetRiskHistory retrieves risk assessment history for a token
func (re *RiskEngine) GetRiskHistory(ctx context.Context, address string, limit int) ([]*RiskAssessment, error) {
	return re.storage.GetRiskHistory(ctx, address, limit)
}

// GetHighRiskTokens retrieves tokens with high risk scores
func (re *RiskEngine) GetHighRiskTokens(ctx context.Context, threshold int, limit int) ([]*RiskAssessment, error) {
	return re.storage.GetHighRiskTokens(ctx, threshold, limit)
}

// UpdateRiskRules updates the risk assessment rules
func (re *RiskEngine) UpdateRiskRules(ctx context.Context, rulesConfig *config.RulesConfig) error {
	return re.rules.UpdateRules(rulesConfig)
}

// GetRiskMetrics retrieves overall risk metrics
func (re *RiskEngine) GetRiskMetrics(ctx context.Context) (*RiskMetrics, error) {
	return re.storage.GetRiskMetrics(ctx)
}

// RiskMetrics represents overall risk metrics
type RiskMetrics struct {
	TotalTokens     int     `json:"total_tokens"`
	HighRiskTokens  int     `json:"high_risk_tokens"`
	ScamTokens      int     `json:"scam_tokens"`
	AverageScore    float64 `json:"average_score"`
	LastUpdated     time.Time `json:"last_updated"`
}

// Close gracefully shuts down the risk engine
func (re *RiskEngine) Close() error {
	var err error

	if re.storage != nil {
		if closeErr := re.storage.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close storage: %w", closeErr)
		}
	}

	return err
}

// min returns the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}