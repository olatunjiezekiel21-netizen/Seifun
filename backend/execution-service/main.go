package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"seifun/backend/execution-service/internal/executor"
	"seifun/backend/execution-service/internal/config"
	"seifun/backend/execution-service/internal/server"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize execution service
	executionService, err := executor.NewExecutionService(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize execution service: %v", err)
	}

	// Initialize HTTP server
	srv := server.NewServer(cfg, executionService)

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

	log.Println("Shutting down execution service...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Error during server shutdown: %v", err)
	}

	if err := executionService.Close(); err != nil {
		log.Printf("Error during execution service shutdown: %v", err)
	}

	log.Println("Execution service stopped")
}