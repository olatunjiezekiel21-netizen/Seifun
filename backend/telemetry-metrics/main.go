package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"seifun/backend/telemetry-metrics/internal/telemetry"
	"seifun/backend/telemetry-metrics/internal/config"
	"seifun/backend/telemetry-metrics/internal/server"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize telemetry service
	telemetryService, err := telemetry.NewTelemetryService(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize telemetry service: %v", err)
	}

	// Initialize HTTP server
	srv := server.NewServer(cfg, telemetryService)

	// Start server in goroutine
	go func() {
		if err := srv.Start(); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down telemetry service...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Error during server shutdown: %v", err)
	}

	if err := telemetryService.Close(); err != nil {
		log.Printf("Error during telemetry service shutdown: %v", err)
	}

	log.Println("Telemetry service stopped")
}