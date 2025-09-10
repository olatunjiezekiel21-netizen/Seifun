package scanner

import (
	"context"
	"encoding/json"
	"fmt"
	"math/big"
	"time"

	"seifun/backend/token-scanner/internal/config"
	"seifun/backend/token-scanner/internal/evm"
	"seifun/backend/token-scanner/internal/native"
	"seifun/backend/token-scanner/internal/risk"
	"seifun/backend/token-scanner/internal/storage"
)

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

// TokenAnalysis represents comprehensive token analysis
type TokenAnalysis struct {
	TokenInfo     TokenInfo     `json:"token_info"`
	RiskScore     int           `json:"risk_score"`
	IsScam        bool          `json:"is_scam"`
	RiskFactors   []string      `json:"risk_factors"`
	Liquidity     LiquidityData `json:"liquidity"`
	MarketData    MarketData    `json:"market_data"`
	TechnicalData TechnicalData `json:"technical_data"`
	Timestamp     time.Time     `json:"timestamp"`
}

// LiquidityData represents liquidity information
type LiquidityData struct {
	TotalLiquidity *big.Int `json:"total_liquidity"`
	PoolCount      int      `json:"pool_count"`
	Volume24h      *big.Int `json:"volume_24h"`
	LiquidityScore int      `json:"liquidity_score"`
}

// MarketData represents market information
type MarketData struct {
	Price      float64   `json:"price"`
	Change24h  float64   `json:"change_24h"`
	Volume24h  *big.Int  `json:"volume_24h"`
	MarketCap  *big.Int  `json:"market_cap"`
	Timestamp  time.Time `json:"timestamp"`
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

// TokenScanner handles token analysis for both EVM and Native tokens
type TokenScanner struct {
	config     *config.Config
	evmScanner *evm.EVMScanner
	nativeScanner *native.NativeScanner
	riskEngine *risk.RiskEngine
	storage    *storage.Storage
}

// NewTokenScanner creates a new token scanner instance
func NewTokenScanner(cfg *config.Config) (*TokenScanner, error) {
	// Initialize storage
	storage, err := storage.NewStorage(cfg.Database)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize storage: %w", err)
	}

	// Initialize EVM scanner
	evmScanner, err := evm.NewEVMScanner(cfg.EVM)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize EVM scanner: %w", err)
	}

	// Initialize Native scanner
	nativeScanner, err := native.NewNativeScanner(cfg.Native)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Native scanner: %w", err)
	}

	// Initialize risk engine
	riskEngine, err := risk.NewRiskEngine(cfg.Risk)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize risk engine: %w", err)
	}

	return &TokenScanner{
		config:        cfg,
		evmScanner:    evmScanner,
		nativeScanner: nativeScanner,
		riskEngine:    riskEngine,
		storage:       storage,
	}, nil
}

// AnalyzeToken performs comprehensive token analysis
func (ts *TokenScanner) AnalyzeToken(ctx context.Context, address string) (*TokenAnalysis, error) {
	// Check if token is EVM or Native
	isEVM := ts.isEVMToken(address)
	
	var tokenInfo *TokenInfo
	var err error

	if isEVM {
		// Analyze EVM token
		tokenInfo, err = ts.evmScanner.GetTokenInfo(ctx, address)
		if err != nil {
			return nil, fmt.Errorf("failed to get EVM token info: %w", err)
		}
	} else {
		// Analyze Native token
		tokenInfo, err = ts.nativeScanner.GetTokenInfo(ctx, address)
		if err != nil {
			return nil, fmt.Errorf("failed to get Native token info: %w", err)
		}
	}

	// Get market data
	marketData, err := ts.getMarketData(ctx, tokenInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to get market data: %w", err)
	}

	// Get liquidity data
	liquidityData, err := ts.getLiquidityData(ctx, tokenInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to get liquidity data: %w", err)
	}

	// Get technical data
	technicalData, err := ts.getTechnicalData(ctx, tokenInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to get technical data: %w", err)
	}

	// Perform risk assessment
	riskAssessment, err := ts.riskEngine.AssessToken(ctx, tokenInfo, marketData, liquidityData, technicalData)
	if err != nil {
		return nil, fmt.Errorf("failed to assess token risk: %w", err)
	}

	// Create comprehensive analysis
	analysis := &TokenAnalysis{
		TokenInfo:     *tokenInfo,
		RiskScore:     riskAssessment.Score,
		IsScam:        riskAssessment.IsScam,
		RiskFactors:   riskAssessment.Factors,
		Liquidity:     *liquidityData,
		MarketData:    *marketData,
		TechnicalData: *technicalData,
		Timestamp:     time.Now(),
	}

	// Store analysis in database
	if err := ts.storage.StoreAnalysis(ctx, analysis); err != nil {
		// Log error but don't fail the analysis
		fmt.Printf("Warning: failed to store analysis: %v\n", err)
	}

	return analysis, nil
}

// isEVMToken determines if an address is an EVM token
func (ts *TokenScanner) isEVMToken(address string) bool {
	// EVM addresses start with 0x and are 42 characters long
	if len(address) == 42 && address[:2] == "0x" {
		return true
	}
	return false
}

// getMarketData retrieves market data for a token
func (ts *TokenScanner) getMarketData(ctx context.Context, tokenInfo *TokenInfo) (*MarketData, error) {
	// This would integrate with market data providers like CoinGecko, DexScreener, etc.
	// For now, return mock data
	return &MarketData{
		Price:     1.5,
		Change24h: 5.2,
		Volume24h: big.NewInt(1000000000000000000000), // 1000 tokens
		MarketCap: big.NewInt(1500000000000000000000), // 1500 tokens
		Timestamp: time.Now(),
	}, nil
}

// getLiquidityData retrieves liquidity data for a token
func (ts *TokenScanner) getLiquidityData(ctx context.Context, tokenInfo *TokenInfo) (*LiquidityData, error) {
	// This would query DEX pools and calculate liquidity metrics
	// For now, return mock data
	return &LiquidityData{
		TotalLiquidity: big.NewInt(500000000000000000000), // 500 tokens
		PoolCount:      5,
		Volume24h:      big.NewInt(100000000000000000000), // 100 tokens
		LiquidityScore: 75,
	}, nil
}

// getTechnicalData retrieves technical analysis data for a token
func (ts *TokenScanner) getTechnicalData(ctx context.Context, tokenInfo *TokenInfo) (*TechnicalData, error) {
	// This would perform technical analysis on price data
	// For now, return mock data
	return &TechnicalData{
		RSI:        65.5,
		MACD:       0.02,
		Bollinger:  1.2,
		Support:    1.4,
		Resistance: 1.6,
		Trend:      "bullish",
	}, nil
}

// GetAnalysisHistory retrieves analysis history for a token
func (ts *TokenScanner) GetAnalysisHistory(ctx context.Context, address string, limit int) ([]*TokenAnalysis, error) {
	return ts.storage.GetAnalysisHistory(ctx, address, limit)
}

// GetTopTokens retrieves top tokens by various metrics
func (ts *TokenScanner) GetTopTokens(ctx context.Context, metric string, limit int) ([]*TokenAnalysis, error) {
	return ts.storage.GetTopTokens(ctx, metric, limit)
}

// Close gracefully shuts down the token scanner
func (ts *TokenScanner) Close() error {
	var err error

	if ts.evmScanner != nil {
		if closeErr := ts.evmScanner.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close EVM scanner: %w", closeErr)
		}
	}

	if ts.nativeScanner != nil {
		if closeErr := ts.nativeScanner.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close Native scanner: %w", closeErr)
		}
	}

	if ts.storage != nil {
		if closeErr := ts.storage.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close storage: %w", closeErr)
		}
	}

	return err
}