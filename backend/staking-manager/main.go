package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"seifun/backend/staking-manager/internal/manager"
	"seifun/backend/staking-manager/internal/config"
	"seifun/backend/staking-manager/internal/server"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize staking manager
	stakingManager, err := manager.NewStakingManager(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize staking manager: %v", err)
	}

	// Initialize HTTP server
	srv := server.NewServer(cfg, stakingManager)

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

	log.Println("Shutting down staking manager...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Error during server shutdown: %v", err)
	}

	if err := stakingManager.Close(); err != nil {
		log.Printf("Error during staking manager shutdown: %v", err)
	}

	log.Println("Staking manager stopped")
}