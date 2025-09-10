package scanner_test

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"seifun/backend/scanner"
	"seifun/backend/scanner/mocks"
)

// Mock dependencies
type mockTokenRegistry struct {
	mocks.MockTokenRegistry
}

type mockRiskEngine struct {
	mocks.MockRiskEngine
}

type mockMarketDataProvider struct {
	mocks.MockMarketDataProvider
}

func TestScannerRuleEngine(t *testing.T) {
	ctx := context.Background()

	// Initialize mocks
	registry := &mockTokenRegistry{}
	riskEngine := &mockRiskEngine{}
	marketData := &mockMarketDataProvider{}

	// Create scanner instance
	scanner := scanner.NewTokenScanner(registry, riskEngine, marketData)

	t.Run("Test EVM Token Analysis", func(t *testing.T) {
		// Mock EVM token data
		registry.On("GetTokenInfo", "0x1234567890123456789012345678901234567890").
			Return(&scanner.TokenInfo{
				Address:    "0x1234567890123456789012345678901234567890",
				Symbol:     "TEST",
				Name:       "Test Token",
				Decimals:   18,
				TotalSupply: "1000000000000000000000000",
				IsEVM:      true,
			}, nil)

		// Mock market data
		marketData.On("GetPrice", "TEST").
			Return(&scanner.PriceData{
				Price:     1.5,
				Change24h: 5.2,
				Volume24h: 1000000,
			}, nil)

		// Mock risk assessment
		riskEngine.On("AssessTokenRisk", mock.AnythingOfType("*scanner.TokenInfo")).
			Return(&scanner.RiskAssessment{
				Score:       75,
				Liquidity:   80,
				Volatility:  60,
				MarketCap:   10000000,
				IsScam:      false,
				RiskFactors: []string{"Low liquidity"},
			}, nil)

		// Test analysis
		result, err := scanner.AnalyzeToken(ctx, "0x1234567890123456789012345678901234567890")
		require.NoError(t, err)

		// Verify results
		assert.Equal(t, "TEST", result.Symbol)
		assert.Equal(t, 75, result.RiskScore)
		assert.False(t, result.IsScam)
		assert.Contains(t, result.RiskFactors, "Low liquidity")

		// Verify all mocks were called
		registry.AssertExpectations(t)
		marketData.AssertExpectations(t)
		riskEngine.AssertExpectations(t)
	})

	t.Run("Test Native SEI Token Analysis", func(t *testing.T) {
		// Mock native SEI token data
		registry.On("GetTokenInfo", "factory/sei1abc.../test").
			Return(&scanner.TokenInfo{
				Address:     "factory/sei1abc.../test",
				Symbol:      "NATIVE",
				Name:        "Native Test Token",
				Decimals:    6,
				TotalSupply: "1000000000",
				IsEVM:       false,
			}, nil)

		// Mock market data
		marketData.On("GetPrice", "NATIVE").
			Return(&scanner.PriceData{
				Price:     0.5,
				Change24h: -2.1,
				Volume24h: 500000,
			}, nil)

		// Mock risk assessment
		riskEngine.On("AssessTokenRisk", mock.AnythingOfType("*scanner.TokenInfo")).
			Return(&scanner.RiskAssessment{
				Score:       85,
				Liquidity:   90,
				Volatility:  40,
				MarketCap:   5000000,
				IsScam:      false,
				RiskFactors: []string{},
			}, nil)

		// Test analysis
		result, err := scanner.AnalyzeToken(ctx, "factory/sei1abc.../test")
		require.NoError(t, err)

		// Verify results
		assert.Equal(t, "NATIVE", result.Symbol)
		assert.Equal(t, 85, result.RiskScore)
		assert.False(t, result.IsScam)
		assert.Empty(t, result.RiskFactors)

		// Verify all mocks were called
		registry.AssertExpectations(t)
		marketData.AssertExpectations(t)
		riskEngine.AssertExpectations(t)
	})

	t.Run("Test Scam Token Detection", func(t *testing.T) {
		// Mock suspicious token data
		registry.On("GetTokenInfo", "0x9999999999999999999999999999999999999999").
			Return(&scanner.TokenInfo{
				Address:    "0x9999999999999999999999999999999999999999",
				Symbol:     "SCAM",
				Name:       "Scam Token",
				Decimals:   18,
				TotalSupply: "1000000000000000000000000000",
				IsEVM:      true,
			}, nil)

		// Mock market data
		marketData.On("GetPrice", "SCAM").
			Return(&scanner.PriceData{
				Price:     0.001,
				Change24h: -99.9,
				Volume24h: 100,
			}, nil)

		// Mock risk assessment indicating scam
		riskEngine.On("AssessTokenRisk", mock.AnythingOfType("*scanner.TokenInfo")).
			Return(&scanner.RiskAssessment{
				Score:       10,
				Liquidity:   5,
				Volatility:  100,
				MarketCap:   1000,
				IsScam:      true,
				RiskFactors: []string{"Suspicious contract", "No liquidity", "Extreme volatility"},
			}, nil)

		// Test analysis
		result, err := scanner.AnalyzeToken(ctx, "0x9999999999999999999999999999999999999999")
		require.NoError(t, err)

		// Verify scam detection
		assert.Equal(t, "SCAM", result.Symbol)
		assert.Equal(t, 10, result.RiskScore)
		assert.True(t, result.IsScam)
		assert.Contains(t, result.RiskFactors, "Suspicious contract")
		assert.Contains(t, result.RiskFactors, "No liquidity")
		assert.Contains(t, result.RiskFactors, "Extreme volatility")

		// Verify all mocks were called
		registry.AssertExpectations(t)
		marketData.AssertExpectations(t)
		riskEngine.AssertExpectations(t)
	})

	t.Run("Test Token Registry Error", func(t *testing.T) {
		// Mock registry error
		registry.On("GetTokenInfo", "0xinvalid").
			Return(nil, assert.AnError)

		// Test analysis with invalid address
		result, err := scanner.AnalyzeToken(ctx, "0xinvalid")
		require.Error(t, err)
		assert.Nil(t, result)

		// Verify mock was called
		registry.AssertExpectations(t)
	})

	t.Run("Test Market Data Error", func(t *testing.T) {
		// Mock token data
		registry.On("GetTokenInfo", "0x1234567890123456789012345678901234567890").
			Return(&scanner.TokenInfo{
				Address:    "0x1234567890123456789012345678901234567890",
				Symbol:     "TEST",
				Name:       "Test Token",
				Decimals:   18,
				TotalSupply: "1000000000000000000000000",
				IsEVM:      true,
			}, nil)

		// Mock market data error
		marketData.On("GetPrice", "TEST").
			Return(nil, assert.AnError)

		// Test analysis
		result, err := scanner.AnalyzeToken(ctx, "0x1234567890123456789012345678901234567890")
		require.Error(t, err)
		assert.Nil(t, result)

		// Verify mocks were called
		registry.AssertExpectations(t)
		marketData.AssertExpectations(t)
	})

	t.Run("Test Risk Engine Error", func(t *testing.T) {
		// Mock token data
		registry.On("GetTokenInfo", "0x1234567890123456789012345678901234567890").
			Return(&scanner.TokenInfo{
				Address:    "0x1234567890123456789012345678901234567890",
				Symbol:     "TEST",
				Name:       "Test Token",
				Decimals:   18,
				TotalSupply: "1000000000000000000000000",
				IsEVM:      true,
			}, nil)

		// Mock market data
		marketData.On("GetPrice", "TEST").
			Return(&scanner.PriceData{
				Price:     1.5,
				Change24h: 5.2,
				Volume24h: 1000000,
			}, nil)

		// Mock risk engine error
		riskEngine.On("AssessTokenRisk", mock.AnythingOfType("*scanner.TokenInfo")).
			Return(nil, assert.AnError)

		// Test analysis
		result, err := scanner.AnalyzeToken(ctx, "0x1234567890123456789012345678901234567890")
		require.Error(t, err)
		assert.Nil(t, result)

		// Verify mocks were called
		registry.AssertExpectations(t)
		marketData.AssertExpectations(t)
		riskEngine.AssertExpectations(t)
	})
}

func TestScannerRuleEngineConcurrency(t *testing.T) {
	ctx := context.Background()

	// Initialize mocks
	registry := &mockTokenRegistry{}
	riskEngine := &mockRiskEngine{}
	marketData := &mockMarketDataProvider{}

	// Create scanner instance
	scanner := scanner.NewTokenScanner(registry, riskEngine, marketData)

	// Mock token data for concurrent testing
	registry.On("GetTokenInfo", mock.AnythingOfType("string")).
		Return(&scanner.TokenInfo{
			Address:    "0x1234567890123456789012345678901234567890",
			Symbol:     "TEST",
			Name:       "Test Token",
			Decimals:   18,
			TotalSupply: "1000000000000000000000000",
			IsEVM:      true,
		}, nil)

	marketData.On("GetPrice", "TEST").
		Return(&scanner.PriceData{
			Price:     1.5,
			Change24h: 5.2,
			Volume24h: 1000000,
		}, nil)

	riskEngine.On("AssessTokenRisk", mock.AnythingOfType("*scanner.TokenInfo")).
		Return(&scanner.RiskAssessment{
			Score:       75,
			Liquidity:   80,
			Volatility:  60,
			MarketCap:   10000000,
			IsScam:      false,
			RiskFactors: []string{"Low liquidity"},
		}, nil)

	// Test concurrent analysis
	numGoroutines := 10
	results := make(chan *scanner.TokenAnalysis, numGoroutines)
	errors := make(chan error, numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		go func() {
			result, err := scanner.AnalyzeToken(ctx, "0x1234567890123456789012345678901234567890")
			if err != nil {
				errors <- err
				return
			}
			results <- result
		}()
	}

	// Collect results
	var successCount int
	var errorCount int

	for i := 0; i < numGoroutines; i++ {
		select {
		case result := <-results:
			require.NotNil(t, result)
			assert.Equal(t, "TEST", result.Symbol)
			successCount++
		case err := <-errors:
			require.NoError(t, err)
			errorCount++
		case <-time.After(5 * time.Second):
			t.Fatal("Timeout waiting for results")
		}
	}

	assert.Equal(t, numGoroutines, successCount)
	assert.Equal(t, 0, errorCount)

	// Verify all mocks were called
	registry.AssertExpectations(t)
	marketData.AssertExpectations(t)
	riskEngine.AssertExpectations(t)
}

func TestScannerRuleEnginePerformance(t *testing.T) {
	ctx := context.Background()

	// Initialize mocks
	registry := &mockTokenRegistry{}
	riskEngine := &mockRiskEngine{}
	marketData := &mockMarketDataProvider{}

	// Create scanner instance
	scanner := scanner.NewTokenScanner(registry, riskEngine, marketData)

	// Mock token data
	registry.On("GetTokenInfo", mock.AnythingOfType("string")).
		Return(&scanner.TokenInfo{
			Address:    "0x1234567890123456789012345678901234567890",
			Symbol:     "TEST",
			Name:       "Test Token",
			Decimals:   18,
			TotalSupply: "1000000000000000000000000",
			IsEVM:      true,
		}, nil)

	marketData.On("GetPrice", "TEST").
		Return(&scanner.PriceData{
			Price:     1.5,
			Change24h: 5.2,
			Volume24h: 1000000,
		}, nil)

	riskEngine.On("AssessTokenRisk", mock.AnythingOfType("*scanner.TokenInfo")).
		Return(&scanner.RiskAssessment{
			Score:       75,
			Liquidity:   80,
			Volatility:  60,
			MarketCap:   10000000,
			IsScam:      false,
			RiskFactors: []string{"Low liquidity"},
		}, nil)

	// Test performance
	start := time.Now()
	numTests := 100

	for i := 0; i < numTests; i++ {
		result, err := scanner.AnalyzeToken(ctx, "0x1234567890123456789012345678901234567890")
		require.NoError(t, err)
		require.NotNil(t, result)
	}

	duration := time.Since(start)
	avgDuration := duration / time.Duration(numTests)

	// Verify performance requirements (should be under 100ms per analysis)
	assert.Less(t, avgDuration, 100*time.Millisecond, "Average analysis time should be under 100ms")

	// Verify all mocks were called
	registry.AssertExpectations(t)
	marketData.AssertExpectations(t)
	riskEngine.AssertExpectations(t)
}