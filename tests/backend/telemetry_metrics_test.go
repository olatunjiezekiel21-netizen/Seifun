package backend_test

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"seifun/backend/telemetry-metrics"
	"seifun/backend/telemetry-metrics/mocks"
)

// Mock dependencies
type mockMetricsCollector struct {
	mocks.MockMetricsCollector
}

type mockStorage struct {
	mocks.MockStorage
}

func TestTelemetryService(t *testing.T) {
	ctx := context.Background()

	// Initialize mocks
	metricsCollector := &mockMetricsCollector{}
	storage := &mockStorage{}

	// Create telemetry service instance
	telemetryService := telemetry.NewTelemetryService(metricsCollector, storage)

	t.Run("Test Record Metric", func(t *testing.T) {
		// Mock metrics collector
		metricsCollector.On("RecordMetric", mock.AnythingOfType("*telemetry.MetricData")).
			Return(nil)

		// Mock storage
		storage.On("StoreMetric", mock.AnythingOfType("*context.emptyCtx"), mock.AnythingOfType("*telemetry.MetricData")).
			Return(nil)

		// Test record metric
		metric := &telemetry.MetricData{
			Name:      "trading_volume",
			Value:     1000000.0,
			Labels:    map[string]string{"token": "SEI", "chain": "native"},
			Timestamp: time.Now(),
			Metadata:  map[string]interface{}{"source": "dex"},
		}

		err := telemetryService.RecordMetric(ctx, metric)
		require.NoError(t, err)

		// Verify all mocks were called
		metricsCollector.AssertExpectations(t)
		storage.AssertExpectations(t)
	})

	t.Run("Test Get System Metrics", func(t *testing.T) {
		// Mock metrics collector
		metricsCollector.On("GetSystemMetrics").
			Return(&telemetry.SystemMetrics{
				CPUUsage:    45.5,
				MemoryUsage: 67.2,
				DiskUsage:   23.8,
				NetworkIO:   150.0,
				Timestamp:   time.Now(),
			}, nil)

		// Test get system metrics
		systemMetrics, err := telemetryService.GetSystemMetrics(ctx)
		require.NoError(t, err)

		// Verify results
		assert.Equal(t, 45.5, systemMetrics.CPUUsage)
		assert.Equal(t, 67.2, systemMetrics.MemoryUsage)
		assert.Equal(t, 23.8, systemMetrics.DiskUsage)
		assert.Equal(t, 150.0, systemMetrics.NetworkIO)

		// Verify mock was called
		metricsCollector.AssertExpectations(t)
	})

	t.Run("Test Get Trading Metrics", func(t *testing.T) {
		// Mock metrics collector
		metricsCollector.On("GetTradingMetrics").
			Return(&telemetry.TradingMetrics{
				TotalTrades:     1000,
				TotalVolume:     big.NewInt(1000000000000000000000), // 1000 tokens
				AverageTradeSize: big.NewInt(1000000000000000000), // 1 token
				SuccessRate:     95.5,
				AverageLatency:  150.0, // 150ms
				Timestamp:       time.Now(),
			}, nil)

		// Test get trading metrics
		tradingMetrics, err := telemetryService.GetTradingMetrics(ctx)
		require.NoError(t, err)

		// Verify results
		assert.Equal(t, int64(1000), tradingMetrics.TotalTrades)
		assert.Equal(t, big.NewInt(1000000000000000000000), tradingMetrics.TotalVolume)
		assert.Equal(t, big.NewInt(1000000000000000000), tradingMetrics.AverageTradeSize)
		assert.Equal(t, 95.5, tradingMetrics.SuccessRate)
		assert.Equal(t, 150.0, tradingMetrics.AverageLatency)

		// Verify mock was called
		metricsCollector.AssertExpectations(t)
	})

	t.Run("Test Get Risk Metrics", func(t *testing.T) {
		// Mock metrics collector
		metricsCollector.On("GetRiskMetrics").
			Return(&telemetry.RiskMetrics{
				TotalTokens:      500,
				HighRiskTokens:   25,
				ScamTokens:       5,
				AverageRiskScore: 75.5,
				Timestamp:        time.Now(),
			}, nil)

		// Test get risk metrics
		riskMetrics, err := telemetryService.GetRiskMetrics(ctx)
		require.NoError(t, err)

		// Verify results
		assert.Equal(t, int64(500), riskMetrics.TotalTokens)
		assert.Equal(t, int64(25), riskMetrics.HighRiskTokens)
		assert.Equal(t, int64(5), riskMetrics.ScamTokens)
		assert.Equal(t, 75.5, riskMetrics.AverageRiskScore)

		// Verify mock was called
		metricsCollector.AssertExpectations(t)
	})

	t.Run("Test Get Metric History", func(t *testing.T) {
		// Mock storage
		storage.On("GetMetricHistory", mock.AnythingOfType("*context.emptyCtx"), "trading_volume", mock.AnythingOfType("time.Time"), mock.AnythingOfType("time.Time"), 10).
			Return([]*telemetry.MetricData{
				{
					Name:      "trading_volume",
					Value:     1000000.0,
					Labels:    map[string]string{"token": "SEI", "chain": "native"},
					Timestamp: time.Now().Add(-1 * time.Hour),
					Metadata:  map[string]interface{}{"source": "dex"},
				},
				{
					Name:      "trading_volume",
					Value:     1200000.0,
					Labels:    map[string]string{"token": "SEI", "chain": "native"},
					Timestamp: time.Now().Add(-2 * time.Hour),
					Metadata:  map[string]interface{}{"source": "dex"},
				},
			}, nil)

		// Test get metric history
		startTime := time.Now().Add(-24 * time.Hour)
		endTime := time.Now()
		metricHistory, err := telemetryService.GetMetricHistory(ctx, "trading_volume", startTime, endTime, 10)
		require.NoError(t, err)

		// Verify results
		assert.Len(t, metricHistory, 2)
		assert.Equal(t, "trading_volume", metricHistory[0].Name)
		assert.Equal(t, "trading_volume", metricHistory[1].Name)
		assert.Equal(t, 1000000.0, metricHistory[0].Value)
		assert.Equal(t, 1200000.0, metricHistory[1].Value)

		// Verify mock was called
		storage.AssertExpectations(t)
	})

	t.Run("Test Get Metric Summary", func(t *testing.T) {
		// Mock storage
		storage.On("GetMetricSummary", mock.AnythingOfType("*context.emptyCtx"), mock.AnythingOfType("time.Time"), mock.AnythingOfType("time.Time")).
			Return(&telemetry.MetricSummary{
				TotalMetrics:  1000,
				UniqueMetrics: 50,
				AverageValue:  500.0,
				MinValue:      10.0,
				MaxValue:      10000.0,
				TopMetrics: []telemetry.MetricData{
					{
						Name:      "trading_volume",
						Value:     1000000.0,
						Labels:    map[string]string{"token": "SEI"},
						Timestamp: time.Now(),
						Metadata:  map[string]interface{}{"source": "dex"},
					},
					{
						Name:      "risk_score",
						Value:     75.5,
						Labels:    map[string]string{"token": "USDC"},
						Timestamp: time.Now(),
						Metadata:  map[string]interface{}{"source": "scanner"},
					},
				},
				Timestamp: time.Now(),
			}, nil)

		// Test get metric summary
		startTime := time.Now().Add(-24 * time.Hour)
		endTime := time.Now()
		metricSummary, err := telemetryService.GetMetricSummary(ctx, startTime, endTime)
		require.NoError(t, err)

		// Verify results
		assert.Equal(t, int64(1000), metricSummary.TotalMetrics)
		assert.Equal(t, int64(50), metricSummary.UniqueMetrics)
		assert.Equal(t, 500.0, metricSummary.AverageValue)
		assert.Equal(t, 10.0, metricSummary.MinValue)
		assert.Equal(t, 10000.0, metricSummary.MaxValue)
		assert.Len(t, metricSummary.TopMetrics, 2)
		assert.Equal(t, "trading_volume", metricSummary.TopMetrics[0].Name)
		assert.Equal(t, "risk_score", metricSummary.TopMetrics[1].Name)

		// Verify mock was called
		storage.AssertExpectations(t)
	})

	t.Run("Test Export Metrics", func(t *testing.T) {
		// Mock metrics collector
		metricsCollector.On("ExportMetrics", "json").
			Return([]byte(`{"metrics": [{"name": "trading_volume", "value": 1000000.0}]}`), nil)

		// Test export metrics
		exportedData, err := telemetryService.ExportMetrics(ctx, "json")
		require.NoError(t, err)

		// Verify results
		assert.NotEmpty(t, exportedData)
		assert.Contains(t, string(exportedData), "trading_volume")
		assert.Contains(t, string(exportedData), "1000000.0")

		// Verify mock was called
		metricsCollector.AssertExpectations(t)
	})

	t.Run("Test Invalid Metric", func(t *testing.T) {
		// Test invalid metric (empty name)
		metric := &telemetry.MetricData{
			Name:      "", // Invalid: empty name
			Value:     1000000.0,
			Labels:    map[string]string{"token": "SEI", "chain": "native"},
			Timestamp: time.Now(),
			Metadata:  map[string]interface{}{"source": "dex"},
		}

		err := telemetryService.RecordMetric(ctx, metric)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "metric name cannot be empty")
	})

	t.Run("Test Invalid Metric Timestamp", func(t *testing.T) {
		// Test invalid metric (zero timestamp)
		metric := &telemetry.MetricData{
			Name:      "trading_volume",
			Value:     1000000.0,
			Labels:    map[string]string{"token": "SEI", "chain": "native"},
			Timestamp: time.Time{}, // Invalid: zero timestamp
			Metadata:  map[string]interface{}{"source": "dex"},
		}

		err := telemetryService.RecordMetric(ctx, metric)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "metric timestamp cannot be zero")
	})

	t.Run("Test Metrics Collector Error", func(t *testing.T) {
		// Mock metrics collector error
		metricsCollector.On("RecordMetric", mock.AnythingOfType("*telemetry.MetricData")).
			Return(assert.AnError)

		// Test record metric with error
		metric := &telemetry.MetricData{
			Name:      "trading_volume",
			Value:     1000000.0,
			Labels:    map[string]string{"token": "SEI", "chain": "native"},
			Timestamp: time.Now(),
			Metadata:  map[string]interface{}{"source": "dex"},
		}

		err := telemetryService.RecordMetric(ctx, metric)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "failed to record metric")

		// Verify mock was called
		metricsCollector.AssertExpectations(t)
	})

	t.Run("Test Storage Error", func(t *testing.T) {
		// Mock metrics collector success
		metricsCollector.On("RecordMetric", mock.AnythingOfType("*telemetry.MetricData")).
			Return(nil)

		// Mock storage error
		storage.On("StoreMetric", mock.AnythingOfType("*context.emptyCtx"), mock.AnythingOfType("*telemetry.MetricData")).
			Return(assert.AnError)

		// Test record metric with storage error (should not fail)
		metric := &telemetry.MetricData{
			Name:      "trading_volume",
			Value:     1000000.0,
			Labels:    map[string]string{"token": "SEI", "chain": "native"},
			Timestamp: time.Now(),
			Metadata:  map[string]interface{}{"source": "dex"},
		}

		err := telemetryService.RecordMetric(ctx, metric)
		require.NoError(t, err) // Should not fail due to storage error

		// Verify all mocks were called
		metricsCollector.AssertExpectations(t)
		storage.AssertExpectations(t)
	})

	t.Run("Test Get System Metrics Error", func(t *testing.T) {
		// Mock metrics collector error
		metricsCollector.On("GetSystemMetrics").
			Return(nil, assert.AnError)

		// Test get system metrics with error
		systemMetrics, err := telemetryService.GetSystemMetrics(ctx)
		require.Error(t, err)
		assert.Nil(t, systemMetrics)
		assert.Contains(t, err.Error(), "failed to get system metrics")

		// Verify mock was called
		metricsCollector.AssertExpectations(t)
	})

	t.Run("Test Get Trading Metrics Error", func(t *testing.T) {
		// Mock metrics collector error
		metricsCollector.On("GetTradingMetrics").
			Return(nil, assert.AnError)

		// Test get trading metrics with error
		tradingMetrics, err := telemetryService.GetTradingMetrics(ctx)
		require.Error(t, err)
		assert.Nil(t, tradingMetrics)
		assert.Contains(t, err.Error(), "failed to get trading metrics")

		// Verify mock was called
		metricsCollector.AssertExpectations(t)
	})

	t.Run("Test Get Risk Metrics Error", func(t *testing.T) {
		// Mock metrics collector error
		metricsCollector.On("GetRiskMetrics").
			Return(nil, assert.AnError)

		// Test get risk metrics with error
		riskMetrics, err := telemetryService.GetRiskMetrics(ctx)
		require.Error(t, err)
		assert.Nil(t, riskMetrics)
		assert.Contains(t, err.Error(), "failed to get risk metrics")

		// Verify mock was called
		metricsCollector.AssertExpectations(t)
	})

	t.Run("Test Get Metric History Error", func(t *testing.T) {
		// Mock storage error
		storage.On("GetMetricHistory", mock.AnythingOfType("*context.emptyCtx"), "trading_volume", mock.AnythingOfType("time.Time"), mock.AnythingOfType("time.Time"), 10).
			Return(nil, assert.AnError)

		// Test get metric history with error
		startTime := time.Now().Add(-24 * time.Hour)
		endTime := time.Now()
		metricHistory, err := telemetryService.GetMetricHistory(ctx, "trading_volume", startTime, endTime, 10)
		require.Error(t, err)
		assert.Nil(t, metricHistory)
		assert.Contains(t, err.Error(), "failed to get metric history")

		// Verify mock was called
		storage.AssertExpectations(t)
	})

	t.Run("Test Get Metric Summary Error", func(t *testing.T) {
		// Mock storage error
		storage.On("GetMetricSummary", mock.AnythingOfType("*context.emptyCtx"), mock.AnythingOfType("time.Time"), mock.AnythingOfType("time.Time")).
			Return(nil, assert.AnError)

		// Test get metric summary with error
		startTime := time.Now().Add(-24 * time.Hour)
		endTime := time.Now()
		metricSummary, err := telemetryService.GetMetricSummary(ctx, startTime, endTime)
		require.Error(t, err)
		assert.Nil(t, metricSummary)
		assert.Contains(t, err.Error(), "failed to get metric summary")

		// Verify mock was called
		storage.AssertExpectations(t)
	})

	t.Run("Test Export Metrics Error", func(t *testing.T) {
		// Mock metrics collector error
		metricsCollector.On("ExportMetrics", "json").
			Return(nil, assert.AnError)

		// Test export metrics with error
		exportedData, err := telemetryService.ExportMetrics(ctx, "json")
		require.Error(t, err)
		assert.Nil(t, exportedData)
		assert.Contains(t, err.Error(), "failed to export metrics")

		// Verify mock was called
		metricsCollector.AssertExpectations(t)
	})
}