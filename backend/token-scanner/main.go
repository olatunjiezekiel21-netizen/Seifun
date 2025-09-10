package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"seifun/backend/token-scanner/internal/scanner"
	"seifun/backend/token-scanner/internal/config"
	"seifun/backend/token-scanner/internal/server"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize scanner service
	scannerService, err := scanner.NewTokenScanner(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize token scanner: %v", err)
	}

	// Initialize HTTP server
	srv := server.NewServer(cfg, scannerService)

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

	log.Println("Shutting down token scanner...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Error during server shutdown: %v", err)
	}

	if err := scannerService.Close(); err != nil {
		log.Printf("Error during scanner shutdown: %v", err)
	}

	log.Println("Token scanner stopped")
}