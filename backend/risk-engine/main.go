package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"seifun/backend/risk-engine/internal/engine"
	"seifun/backend/risk-engine/internal/config"
	"seifun/backend/risk-engine/internal/server"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize risk engine
	riskEngine, err := engine.NewRiskEngine(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize risk engine: %v", err)
	}

	// Initialize HTTP server
	srv := server.NewServer(cfg, riskEngine)

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

	log.Println("Shutting down risk engine...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Error during server shutdown: %v", err)
	}

	if err := riskEngine.Close(); err != nil {
		log.Printf("Error during risk engine shutdown: %v", err)
	}

	log.Println("Risk engine stopped")
}