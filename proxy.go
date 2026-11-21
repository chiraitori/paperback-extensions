package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"runtime"
	"strings"
	"time"

	"golang.org/x/sync/singleflight"
)

const (
	defaultAllowedURLPrefix = "https://cdn.yurigarden.moe/"
	defaultRefererURL       = "https://yurigarden.moe/"
	defaultOriginURL        = "https://yurigarden.moe"
	defaultUserAgent        = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)

type ServerConfig struct {
	AllowedURLPrefix  string
	RefererURL        string
	OriginURL         string
	UserAgent         string
	JPEGQuality       int
	MaxConcurrentJobs int
	MaxImageBytes     int64
	UpstreamTimeout   time.Duration
	CacheMaxBytes     int64
	CacheTTL          time.Duration
}

func DefaultServerConfig() ServerConfig {
	jobs := runtime.NumCPU() * 4
	if jobs < 8 {
		jobs = 8
	}
	return ServerConfig{
		AllowedURLPrefix:  defaultAllowedURLPrefix,
		RefererURL:        defaultRefererURL,
		OriginURL:         defaultOriginURL,
		UserAgent:         defaultUserAgent,
		JPEGQuality:       92,
		MaxConcurrentJobs: jobs,
		MaxImageBytes:     32 << 20, // 32 MiB
		UpstreamTimeout:   20 * time.Second,
		CacheMaxBytes:     256 << 20, // 256 MiB
		CacheTTL:          30 * time.Minute,
	}
}

type upstreamHTTPError struct {
	StatusCode int
}

func (e *upstreamHTTPError) Error() string {
	return fmt.Sprintf("Upstream HTTP error: %d", e.StatusCode)
}

type badRequestError struct {
	Msg string
}

func (e *badRequestError) Error() string {
	return e.Msg
}

type imageResult struct {
	data        []byte
	contentType string
}

// ProxyServer serves /health and /unscramble with connection pooling,
// singleflight deduplication, bounded CPU concurrency, and LRU caching.
type ProxyServer struct {
	cfg    ServerConfig
	client *http.Client
	cache  *MemoryCache
	sem    chan struct{}
	sf     singleflight.Group
	mux    *http.ServeMux
}

func NewProxyServer(cfg ServerConfig) *ProxyServer {
	if cfg.AllowedURLPrefix == "" {
		cfg.AllowedURLPrefix = defaultAllowedURLPrefix
	}
	if cfg.RefererURL == "" {
		cfg.RefererURL = defaultRefererURL
	}
	if cfg.OriginURL == "" {
		cfg.OriginURL = defaultOriginURL
	}
	if cfg.UserAgent == "" {
		cfg.UserAgent = defaultUserAgent
	}
	if cfg.JPEGQuality <= 0 || cfg.JPEGQuality > 100 {
		cfg.JPEGQuality = 92
	}
	if cfg.MaxConcurrentJobs <= 0 {
		cfg.MaxConcurrentJobs = 8
	}
	if cfg.MaxImageBytes <= 0 {
		cfg.MaxImageBytes = 32 << 20
	}
	if cfg.UpstreamTimeout <= 0 {
		cfg.UpstreamTimeout = 20 * time.Second
	}

	transport := &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		DialContext: (&net.Dialer{
			Timeout:   10 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          256,
		MaxIdleConnsPerHost:   128,
		MaxConnsPerHost:       128,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}

	s := &ProxyServer{
		cfg: cfg,
		client: &http.Client{
			Transport: transport,
			Timeout:   cfg.UpstreamTimeout,
		},
		cache: NewMemoryCache(cfg.CacheMaxBytes, cfg.CacheTTL),
		sem:   make(chan struct{}, cfg.MaxConcurrentJobs),
		mux:   http.NewServeMux(),
	}

	s.mux.HandleFunc("/health", s.handleHealth)
	s.mux.HandleFunc("/unscramble", s.handleUnscramble)
	return s
}

func (s *ProxyServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/health" && r.URL.Path != "/unscramble" {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "Not found"})
		return
	}
	s.mux.ServeHTTP(w, r)
}

func (s *ProxyServer) handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed"})
		return
	}
	writeJSONHeadAware(w, r, http.StatusOK, map[string]any{
		"status": "ok",
		"cache":  s.cache.Stats(),
	})
}

func (s *ProxyServer) isAllowedTargetURL(raw string) bool {
	if !strings.HasPrefix(raw, s.cfg.AllowedURLPrefix) {
		return false
	}
	parsed, err := url.Parse(raw)
	if err != nil || parsed.Host == "" {
		return false
	}
	allowed, err := url.Parse(s.cfg.AllowedURLPrefix)
	if err != nil {
		return false
	}
	return strings.EqualFold(parsed.Scheme, allowed.Scheme) &&
		strings.EqualFold(parsed.Host, allowed.Host)
}

func (s *ProxyServer) handleUnscramble(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed"})
		return
	}

	q := r.URL.Query()
	targetURL := q.Get("url")
	rawKey := q.Get("key")

	if !s.isAllowedTargetURL(targetURL) {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "Invalid or disallowed url parameter"})
		return
	}

	if rawKey != "" {
		if _, err := DecodeKey(rawKey); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
	}

	cacheKey := rawKey + "\x00" + targetURL
	if data, ct, ok := s.cache.Get(cacheKey); ok {
		s.writeImageResponse(w, r, data, ct, "HIT")
		return
	}

	ch := s.sf.DoChan(cacheKey, func() (any, error) {
		if data, ct, ok := s.cache.Get(cacheKey); ok {
			return imageResult{data: data, contentType: ct}, nil
		}
		ctx, cancel := context.WithTimeout(context.Background(), s.cfg.UpstreamTimeout+15*time.Second)
		defer cancel()

		res, err := s.fetchAndProcess(ctx, targetURL, rawKey)
		if err != nil {
			return nil, err
		}
		s.cache.Set(cacheKey, res.data, res.contentType)
		return res, nil
	})

	select {
	case <-r.Context().Done():
		writeJSON(w, http.StatusRequestTimeout, map[string]any{"error": "Request cancelled"})
		return
	case sfRes := <-ch:
		if sfRes.Err != nil {
			var upstreamErr *upstreamHTTPError
			var badReqErr *badRequestError
			switch {
			case errors.As(sfRes.Err, &upstreamErr):
				writeJSON(w, upstreamErr.StatusCode, map[string]any{"error": upstreamErr.Error()})
			case errors.As(sfRes.Err, &badReqErr):
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": badReqErr.Error()})
			default:
				writeJSON(w, http.StatusInternalServerError, map[string]any{"error": sfRes.Err.Error()})
			}
			return
		}
		img := sfRes.Val.(imageResult)
		s.writeImageResponse(w, r, img.data, img.contentType, "MISS")
	}
}

func (s *ProxyServer) fetchAndProcess(ctx context.Context, targetURL, rawKey string) (imageResult, error) {
	rawBytes, upstreamCT, err := s.fetchCDNImage(ctx, targetURL)
	if err != nil {
		return imageResult{}, err
	}

	if rawKey == "" {
		if upstreamCT == "" {
			upstreamCT = http.DetectContentType(rawBytes)
		}
		return imageResult{data: rawBytes, contentType: upstreamCT}, nil
	}

	select {
	case s.sem <- struct{}{}:
		defer func() { <-s.sem }()
	case <-ctx.Done():
		return imageResult{}, ctx.Err()
	}

	outBytes, err := UnscrambleImageBytes(rawBytes, rawKey, s.cfg.JPEGQuality)
	if err != nil {
		return imageResult{}, err
	}
	return imageResult{data: outBytes, contentType: "image/jpeg"}, nil
}

func (s *ProxyServer) fetchCDNImage(ctx context.Context, targetURL string) ([]byte, string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, targetURL, nil)
	if err != nil {
		return nil, "", &badRequestError{Msg: fmt.Sprintf("invalid upstream request: %v", err)}
	}
	req.Header.Set("User-Agent", s.cfg.UserAgent)
	req.Header.Set("Referer", s.cfg.RefererURL)
	req.Header.Set("Origin", s.cfg.OriginURL)

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, "", &upstreamHTTPError{StatusCode: resp.StatusCode}
	}

	limited := io.LimitReader(resp.Body, s.cfg.MaxImageBytes+1)
	data, err := io.ReadAll(limited)
	if err != nil {
		return nil, "", err
	}
	if int64(len(data)) > s.cfg.MaxImageBytes {
		return nil, "", fmt.Errorf("upstream image exceeds max size (%d bytes)", s.cfg.MaxImageBytes)
	}

	return data, resp.Header.Get("Content-Type"), nil
}

func (s *ProxyServer) writeImageResponse(w http.ResponseWriter, r *http.Request, data []byte, contentType, cacheStatus string) {
	if contentType == "" {
		contentType = "image/jpeg"
	}
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(data)))
	w.Header().Set("Cache-Control", "public, max-age=86400")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("X-Cache", cacheStatus)
	w.WriteHeader(http.StatusOK)
	if r.Method != http.MethodHead {
		_, _ = w.Write(data)
	}
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	body, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(body)))
	w.WriteHeader(status)
	_, _ = w.Write(body)
}

func writeJSONHeadAware(w http.ResponseWriter, r *http.Request, status int, payload any) {
	body, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(body)))
	w.WriteHeader(status)
	if r.Method != http.MethodHead {
		_, _ = w.Write(body)
	}
}
