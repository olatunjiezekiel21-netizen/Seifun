package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"seifun/backend/order-router/internal/router"
	"seifun/backend/order-router/internal/config"
	"seifun/backend/order-router/internal/server"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize order router
	orderRouter, err := router.NewOrderRouter(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize order router: %v", err)
	}

	// Initialize HTTP server
	srv := server.NewServer(cfg, orderRouter)

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

	log.Println("Shutting down order router...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Error during server shutdown: %v", err)
	}

	if err := orderRouter.Close(); err != nil {
		log.Printf("Error during order router shutdown: %v", err)
	}

	log.Println("Order router stopped")
}