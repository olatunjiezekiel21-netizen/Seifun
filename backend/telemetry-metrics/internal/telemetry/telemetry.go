package telemetry

import (
	"context"
	"fmt"
	"math/big"
	"time"

	"seifun/backend/telemetry-metrics/internal/config"
	"seifun/backend/telemetry-metrics/internal/metrics"
	"seifun/backend/telemetry-metrics/internal/storage"
)

// MetricData represents a metric data point
type MetricData struct {
	Name      string                 `json:"name"`
	Value     float64                `json:"value"`
	Labels    map[string]string      `json:"labels"`
	Timestamp time.Time              `json:"timestamp"`
	Metadata  map[string]interface{} `json:"metadata"`
}

// SystemMetrics represents system-level metrics
type SystemMetrics struct {
	CPUUsage    float64 `json:"cpu_usage"`
	MemoryUsage float64 `json:"memory_usage"`
	DiskUsage   float64 `json:"disk_usage"`
	NetworkIO   float64 `json:"network_io"`
	Timestamp   time.Time `json:"timestamp"`
}

// TradingMetrics represents trading-related metrics
type TradingMetrics struct {
	TotalTrades     int64   `json:"total_trades"`
	TotalVolume     *big.Int `json:"total_volume"`
	AverageTradeSize *big.Int `json:"average_trade_size"`
	SuccessRate     float64 `json:"success_rate"`
	AverageLatency  float64 `json:"average_latency"`
	Timestamp       time.Time `json:"timestamp"`
}

// RiskMetrics represents risk-related metrics
type RiskMetrics struct {
	TotalTokens     int64   `json:"total_tokens"`
	HighRiskTokens  int64   `json:"high_risk_tokens"`
	ScamTokens      int64   `json:"scam_tokens"`
	AverageRiskScore float64 `json:"average_risk_score"`
	Timestamp       time.Time `json:"timestamp"`
}

// TelemetryService handles telemetry and metrics collection
type TelemetryService struct {
	config  *config.Config
	metrics *metrics.MetricsCollector
	storage *storage.Storage
}

// NewTelemetryService creates a new telemetry service instance
func NewTelemetryService(cfg *config.Config) (*TelemetryService, error) {
	// Initialize storage
	storage, err := storage.NewStorage(cfg.Database)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize storage: %w", err)
	}

	// Initialize metrics collector
	metricsCollector, err := metrics.NewMetricsCollector(cfg.Metrics)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize metrics collector: %w", err)
	}

	return &TelemetryService{
		config:  cfg,
		metrics: metricsCollector,
		storage: storage,
	}, nil
}

// RecordMetric records a metric data point
func (ts *TelemetryService) RecordMetric(ctx context.Context, metric *MetricData) error {
	// Validate metric
	if err := ts.validateMetric(metric); err != nil {
		return fmt.Errorf("invalid metric: %w", err)
	}

	// Record metric in metrics collector
	if err := ts.metrics.RecordMetric(metric); err != nil {
		return fmt.Errorf("failed to record metric: %w", err)
	}

	// Store metric in database
	if err := ts.storage.StoreMetric(ctx, metric); err != nil {
		// Log error but don't fail the metric recording
		fmt.Printf("Warning: failed to store metric: %v\n", err)
	}

	return nil
}

// GetSystemMetrics retrieves current system metrics
func (ts *TelemetryService) GetSystemMetrics(ctx context.Context) (*SystemMetrics, error) {
	return ts.metrics.GetSystemMetrics()
}

// GetTradingMetrics retrieves current trading metrics
func (ts *TelemetryService) GetTradingMetrics(ctx context.Context) (*TradingMetrics, error) {
	return ts.metrics.GetTradingMetrics()
}

// GetRiskMetrics retrieves current risk metrics
func (ts *TelemetryService) GetRiskMetrics(ctx context.Context) (*RiskMetrics, error) {
	return ts.metrics.GetRiskMetrics()
}

// GetMetricHistory retrieves metric history for a specific metric
func (ts *TelemetryService) GetMetricHistory(ctx context.Context, name string, startTime, endTime time.Time, limit int) ([]*MetricData, error) {
	return ts.storage.GetMetricHistory(ctx, name, startTime, endTime, limit)
}

// GetMetricSummary retrieves a summary of metrics for a time period
func (ts *TelemetryService) GetMetricSummary(ctx context.Context, startTime, endTime time.Time) (*MetricSummary, error) {
	return ts.storage.GetMetricSummary(ctx, startTime, endTime)
}

// MetricSummary represents a summary of metrics
type MetricSummary struct {
	TotalMetrics    int64             `json:"total_metrics"`
	UniqueMetrics   int64             `json:"unique_metrics"`
	AverageValue    float64           `json:"average_value"`
	MinValue        float64           `json:"min_value"`
	MaxValue        float64           `json:"max_value"`
	TopMetrics      []MetricData      `json:"top_metrics"`
	Timestamp       time.Time         `json:"timestamp"`
}

// ExportMetrics exports metrics to external systems
func (ts *TelemetryService) ExportMetrics(ctx context.Context, format string) ([]byte, error) {
	return ts.metrics.ExportMetrics(format)
}

// validateMetric validates a metric data point
func (ts *TelemetryService) validateMetric(metric *MetricData) error {
	if metric.Name == "" {
		return fmt.Errorf("metric name cannot be empty")
	}
	if metric.Timestamp.IsZero() {
		return fmt.Errorf("metric timestamp cannot be zero")
	}
	return nil
}

// Close gracefully shuts down the telemetry service
func (ts *TelemetryService) Close() error {
	var err error

	if ts.metrics != nil {
		if closeErr := ts.metrics.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close metrics collector: %w", closeErr)
		}
	}

	if ts.storage != nil {
		if closeErr := ts.storage.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close storage: %w", closeErr)
		}
	}

	return err
}