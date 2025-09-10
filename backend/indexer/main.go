package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"seifun/indexer/internal/config"
	"seifun/indexer/internal/indexer"
	"seifun/indexer/internal/server"
	"seifun/indexer/internal/storage"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize storage
	db, err := storage.NewPostgresDB(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Initialize Redis
	redis, err := storage.NewRedis(cfg.Redis)
	if err != nil {
		log.Fatalf("Failed to initialize Redis: %v", err)
	}
	defer redis.Close()

	// Initialize indexer
	idx, err := indexer.NewIndexer(cfg, db, redis)
	if err != nil {
		log.Fatalf("Failed to initialize indexer: %v", err)
	}

	// Initialize HTTP server
	srv := server.NewServer(cfg, db, redis, idx)

	// Start services
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Start indexer
	go func() {
		if err := idx.Start(ctx); err != nil {
			log.Printf("Indexer error: %v", err)
		}
	}()

	// Start HTTP server
	go func() {
		if err := srv.Start(); err != nil {
			log.Printf("Server error: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down services...")

	// Graceful shutdown
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	// Stop indexer
	if err := idx.Stop(shutdownCtx); err != nil {
		log.Printf("Error stopping indexer: %v", err)
	}

	// Stop server
	if err := srv.Stop(shutdownCtx); err != nil {
		log.Printf("Error stopping server: %v", err)
	}

	log.Println("Services stopped")
}