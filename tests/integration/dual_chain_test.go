package integration

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"

	"seifun/indexer/internal/types"
	"seifun/indexer/internal/indexer"
)

// DualChainIntegrationTestSuite tests integration between Sei EVM and Native chains
type DualChainIntegrationTestSuite struct {
	suite.Suite
	indexer *indexer.Indexer
	ctx     context.Context
}

func (suite *DualChainIntegrationTestSuite) SetupSuite() {
	// Initialize test configuration
	cfg := &config.Config{
		EVM: config.EVMConfig{
			RPCURL:    "https://evm-rpc.sei-apis.com",
			ChainID:   "1328",
			StartBlock: 1,
		},
		Native: config.NativeConfig{
			RPCURL:    "https://sei-rpc.polkachu.com",
			ChainID:   "sei-1",
			StartBlock: 1,
		},
		Database: config.DatabaseConfig{
			Host:     "localhost",
			Port:     5432,
			User:     "test",
			Password: "test",
			DBName:   "seifun_test",
		},
		Redis: config.RedisConfig{
			Host: "localhost",
			Port: 6379,
			DB:   0,
		},
	}

	// Initialize indexer
	var err error
	suite.indexer, err = indexer.NewIndexer(cfg, nil, nil)
	require.NoError(suite.T(), err)

	suite.ctx = context.Background()
}

func (suite *DualChainIntegrationTestSuite) TearDownSuite() {
	if suite.indexer != nil {
		suite.indexer.Stop(suite.ctx)
	}
}

func (suite *DualChainIntegrationTestSuite) TestDualChainPriceSync() {
	// Test that prices are synchronized between EVM and Native chains
	suite.Run("PriceSynchronization", func() {
		// Get prices from both chains
		evmPrices, err := suite.indexer.evmIndexer.GetLatestPrices()
		require.NoError(suite.T(), err)

		nativePrices, err := suite.indexer.nativeIndexer.GetLatestPrices()
		require.NoError(suite.T(), err)

		// Check that both chains have price data
		assert.NotEmpty(suite.T(), evmPrices, "EVM prices should not be empty")
		assert.NotEmpty(suite.T(), nativePrices, "Native prices should not be empty")

		// Check for common tokens
		commonTokens := make([]string, 0)
		for token := range evmPrices {
			if _, exists := nativePrices[token]; exists {
				commonTokens = append(commonTokens, token)
			}
		}

		assert.NotEmpty(suite.T(), commonTokens, "Should have common tokens between chains")
	})
}

func (suite *DualChainIntegrationTestSuite) TestArbitrageDetection() {
	// Test arbitrage opportunity detection
	suite.Run("ArbitrageDetection", func() {
		// Create mock price data with arbitrage opportunity
		evmPrices := map[string]float64{
			"SEI": 1.0,
			"USDC": 1.0,
		}

		nativePrices := map[string]float64{
			"SEI": 0.95, // 5% cheaper on native
			"USDC": 1.0,
		}

		// Detect arbitrage opportunities
		opportunities := suite.indexer.findArbitrageOpportunities(evmPrices, nativePrices)

		// Should detect SEI arbitrage opportunity
		assert.Len(suite.T(), opportunities, 1, "Should detect one arbitrage opportunity")
		
		if len(opportunities) > 0 {
			opp := opportunities[0]
			assert.Equal(suite.T(), "SEI", opp.Token)
			assert.Equal(suite.T(), "buy_native_sell_evm", opp.Direction)
			assert.Greater(suite.T(), opp.PriceDifference, 0.01, "Price difference should be > 1%")
		}
	})
}

func (suite *DualChainIntegrationTestSuite) TestCrossChainEventProcessing() {
	// Test cross-chain event processing
	suite.Run("CrossChainEvents", func() {
		// Create mock cross-chain events
		evmEvent := types.ChainEvent{
			ChainType:  "evm",
			EventType:  "trade",
			Data:       map[string]interface{}{"token": "SEI", "amount": 1000},
			Timestamp:  time.Now().Unix(),
		}

		nativeEvent := types.ChainEvent{
			ChainType:  "native",
			EventType:  "trade",
			Data:       map[string]interface{}{"token": "SEI", "amount": 1000},
			Timestamp:  time.Now().Unix(),
		}

		// Process events
		err := suite.indexer.processCrossChainEvent(evmEvent)
		require.NoError(suite.T(), err)

		err = suite.indexer.processCrossChainEvent(nativeEvent)
		require.NoError(suite.T(), err)

		// Verify events were processed
		// This would check database or cache for processed events
	})
}

func (suite *DualChainIntegrationTestSuite) TestPerformanceRequirements() {
	// Test that performance requirements are met
	suite.Run("PerformanceRequirements", func() {
		start := time.Now()

		// Test indexer response time
		_, err := suite.indexer.GetLatestPrices()
		require.NoError(suite.T(), err)

		elapsed := time.Since(start)
		assert.Less(suite.T(), elapsed, 100*time.Millisecond, "Price fetch should be < 100ms")

		// Test arbitrage detection time
		start = time.Now()
		_, err = suite.indexer.GetArbitrageOpportunities()
		require.NoError(suite.T(), err)

		elapsed = time.Since(start)
		assert.Less(suite.T(), elapsed, 50*time.Millisecond, "Arbitrage detection should be < 50ms")
	})
}

func (suite *DualChainIntegrationTestSuite) TestErrorHandling() {
	// Test error handling for chain failures
	suite.Run("ErrorHandling", func() {
		// Test EVM chain failure
		suite.indexer.evmIndexer.SetRPCURL("http://invalid-url")
		
		// Should still work with native chain
		nativePrices, err := suite.indexer.nativeIndexer.GetLatestPrices()
		require.NoError(suite.T(), err)
		assert.NotEmpty(suite.T(), nativePrices)

		// Test native chain failure
		suite.indexer.nativeIndexer.SetRPCURL("http://invalid-url")
		
		// Should still work with EVM chain
		evmPrices, err := suite.indexer.evmIndexer.GetLatestPrices()
		require.NoError(suite.T(), err)
		assert.NotEmpty(suite.T(), evmPrices)
	})
}

func (suite *DualChainIntegrationTestSuite) TestDataConsistency() {
	// Test data consistency between chains
	suite.Run("DataConsistency", func() {
		// Get data from both chains
		evmData, err := suite.indexer.evmIndexer.GetChainData()
		require.NoError(suite.T(), err)

		nativeData, err := suite.indexer.nativeIndexer.GetChainData()
		require.NoError(suite.T(), err)

		// Check that data structures are consistent
		assert.Equal(suite.T(), len(evmData.Tokens), len(nativeData.Tokens), "Token counts should be similar")

		// Check that timestamps are recent
		now := time.Now().Unix()
		assert.Less(suite.T(), now-evmData.LastUpdate, int64(60), "EVM data should be < 1 minute old")
		assert.Less(suite.T(), now-nativeData.LastUpdate, int64(60), "Native data should be < 1 minute old")
	})
}

// Run the test suite
func TestDualChainIntegration(t *testing.T) {
	suite.Run(t, new(DualChainIntegrationTestSuite))
}

// Benchmark tests
func BenchmarkDualChainPriceFetch(b *testing.B) {
	// Benchmark price fetching from both chains
	cfg := &config.Config{
		EVM: config.EVMConfig{
			RPCURL: "https://evm-rpc.sei-apis.com",
		},
		Native: config.NativeConfig{
			RPCURL: "https://sei-rpc.polkachu.com",
		},
	}

	indexer, err := indexer.NewIndexer(cfg, nil, nil)
	require.NoError(b, err)
	defer indexer.Stop(context.Background())

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, err := indexer.GetLatestPrices()
		require.NoError(b, err)
	}
}

func BenchmarkArbitrageDetection(b *testing.B) {
	// Benchmark arbitrage detection
	cfg := &config.Config{}
	indexer, err := indexer.NewIndexer(cfg, nil, nil)
	require.NoError(b, err)
	defer indexer.Stop(context.Background())

	// Mock price data
	evmPrices := map[string]float64{
		"SEI": 1.0,
		"USDC": 1.0,
		"USDT": 1.0,
	}

	nativePrices := map[string]float64{
		"SEI": 0.95,
		"USDC": 1.0,
		"USDT": 1.0,
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = indexer.findArbitrageOpportunities(evmPrices, nativePrices)
	}
}