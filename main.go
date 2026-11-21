package main

import (
	"context"
	"errors"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"
)

func envString(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func envInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return n
}

func envDuration(key string, fallback time.Duration) time.Duration {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	d, err := time.ParseDuration(v)
	if err != nil {
		return fallback
	}
	return d
}

func main() {
	cfg := DefaultServerConfig()
	host := envString("HOST", "0.0.0.0")
	port := envString("PORT", "8787")

	cfg.JPEGQuality = envInt("JPEG_QUALITY", cfg.JPEGQuality)
	cfg.MaxConcurrentJobs = envInt("MAX_CONCURRENT_JOBS", cfg.MaxConcurrentJobs)
	cfg.UpstreamTimeout = envDuration("UPSTREAM_TIMEOUT", cfg.UpstreamTimeout)
	cfg.CacheTTL = envDuration("CACHE_TTL", cfg.CacheTTL)
	if mb := envInt("CACHE_MAX_MB", int(cfg.CacheMaxBytes/(1024*1024))); mb >= 0 {
		cfg.CacheMaxBytes = int64(mb) << 20
	}
	if maxMB := envInt("MAX_IMAGE_MB", int(cfg.MaxImageBytes/(1024*1024))); maxMB > 0 {
		cfg.MaxImageBytes = int64(maxMB) << 20
	}

	proxy := NewProxyServer(cfg)
	addr := net.JoinHostPort(host, port)

	srv := &http.Server{
		Addr:              addr,
		Handler:           proxy,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Printf(
			"YuriGarden unscrambler listening on http://%s (workers=%d cache=%dMB ttl=%s)",
			addr,
			cfg.MaxConcurrentJobs,
			cfg.CacheMaxBytes>>20,
			cfg.CacheTTL,
		)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server failed: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("shutting down...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("graceful shutdown error: %v", err)
	}
}
