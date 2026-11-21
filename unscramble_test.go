package main

import (
	"bytes"
	"encoding/json"
	"image"
	"image/color"
	"image/draw"
	"image/jpeg"
	"net/http"
	"net/http/httptest"
	"net/url"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func encodeTestKey(order [stripCount]int) string {
	pool := []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}
	n := 0
	for i := 0; i < stripCount; i++ {
		val := order[i]
		idx := -1
		for j, p := range pool {
			if p == val {
				idx = j
				break
			}
		}
		if idx < 0 {
			panic("invalid permutation")
		}
		pool = append(pool[:idx], pool[idx+1:]...)
		n += idx * factorials[stripCount-1-i]
	}
	checksum := base58Alphabet[n%58]
	var body []byte
	if n == 0 {
		body = []byte{base58Alphabet[0]}
	} else {
		rem := n
		for rem > 0 {
			body = append([]byte{base58Alphabet[rem%58]}, body...)
			rem /= 58
		}
	}
	return "testH" + string(body) + string(checksum)
}

func scrambleForTest(img image.Image, order [stripCount]int) []byte {
	b := img.Bounds()
	w, h := b.Dx(), b.Dy()
	stripH := SplitStripHeights(h)

	var origPrefix [stripCount + 1]int
	for i := 0; i < stripCount; i++ {
		origPrefix[i+1] = origPrefix[i] + stripH[i]
	}

	scrambledH := h + stripGap*(stripCount-1)
	out := image.NewRGBA(image.Rect(0, 0, w, scrambledH))
	dstY := 0
	for i := 0; i < stripCount; i++ {
		origIdx := order[i]
		sh := stripH[origIdx]
		srcPt := image.Pt(b.Min.X, b.Min.Y+origPrefix[origIdx])
		draw.Draw(out, image.Rect(0, dstY, w, dstY+sh), img, srcPt, draw.Src)
		dstY += sh
		if i < stripCount-1 {
			dstY += stripGap
		}
	}

	var buf bytes.Buffer
	if err := jpeg.Encode(&buf, out, &jpeg.Options{Quality: 98}); err != nil {
		panic(err)
	}
	return buf.Bytes()
}

func TestDecodeKey(t *testing.T) {
	order, err := DecodeKey("ijYoH2CjPP")
	if err != nil {
		t.Fatalf("DecodeKey(ijYoH2CjPP) failed: %v", err)
	}

	seen := make(map[int]bool)
	for _, v := range order {
		if v < 0 || v >= stripCount || seen[v] {
			t.Fatalf("invalid decoded permutation: %v", order)
		}
		seen[v] = true
	}

	// Bad checksum
	if _, err := DecodeKey("ijYoH2CjP1"); err == nil {
		t.Fatal("expected checksum error")
	}
	// Too short / bad format
	if _, err := DecodeKey("abc"); err == nil {
		t.Fatal("expected invalid key error")
	}
	if _, err := DecodeKey("ijYoX2CjPP"); err == nil {
		t.Fatal("expected missing H marker error")
	}
}

func TestUnscrambleRoundTrip(t *testing.T) {
	const width = 120
	const height = 507 // non-divisible by 10 to test remainder distribution

	orig := image.NewRGBA(image.Rect(0, 0, width, height))
	stripH := SplitStripHeights(height)
	palette := []color.RGBA{
		{240, 30, 30, 255},
		{30, 220, 30, 255},
		{30, 60, 240, 255},
		{240, 220, 30, 255},
		{220, 30, 220, 255},
		{30, 220, 220, 255},
		{240, 140, 30, 255},
		{150, 60, 220, 255},
		{240, 240, 240, 255},
		{40, 40, 40, 255},
	}

	y := 0
	for i := 0; i < stripCount; i++ {
		draw.Draw(orig, image.Rect(0, y, width, y+stripH[i]), &image.Uniform{palette[i]}, image.Point{}, draw.Src)
		y += stripH[i]
	}

	order := [stripCount]int{7, 2, 9, 0, 5, 1, 8, 3, 6, 4}
	rawKey := encodeTestKey(order)
	scrambledJPEG := scrambleForTest(orig, order)

	unscrambledBytes, err := UnscrambleImageBytes(scrambledJPEG, rawKey, 95)
	if err != nil {
		t.Fatalf("UnscrambleImageBytes failed: %v", err)
	}

	resImg, _, err := image.Decode(bytes.NewReader(unscrambledBytes))
	if err != nil {
		t.Fatalf("failed to decode unscrambled output: %v", err)
	}

	if resImg.Bounds().Dx() != width || resImg.Bounds().Dy() != height {
		t.Fatalf("unexpected dimensions: got %dx%d, want %dx%d", resImg.Bounds().Dx(), resImg.Bounds().Dy(), width, height)
	}

	// Verify center pixel of every strip matches the original band color within JPEG tolerance.
	y = 0
	for i := 0; i < stripCount; i++ {
		sampleY := y + stripH[i]/2
		r1, g1, b1, _ := resImg.At(width/2, sampleY).RGBA()
		want := palette[i]
		dr := absInt(int(r1>>8) - int(want.R))
		dg := absInt(int(g1>>8) - int(want.G))
		db := absInt(int(b1>>8) - int(want.B))
		if dr > 15 || dg > 15 || db > 15 {
			t.Fatalf("strip %d color mismatch at y=%d: got (%d,%d,%d), want (%d,%d,%d)",
				i, sampleY, r1>>8, g1>>8, b1>>8, want.R, want.G, want.B)
		}
		y += stripH[i]
	}
}

func absInt(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func TestProxyServerConcurrencyAndValidation(t *testing.T) {
	orig := image.NewRGBA(image.Rect(0, 0, 100, 300))
	draw.Draw(orig, orig.Bounds(), &image.Uniform{color.RGBA{10, 180, 90, 255}}, image.Point{}, draw.Src)
	order := [stripCount]int{9, 8, 7, 6, 5, 4, 3, 2, 1, 0}
	rawKey := encodeTestKey(order)
	scrambledJPEG := scrambleForTest(orig, order)

	var upstreamHits atomic.Int32
	cdn := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Referer") != defaultRefererURL {
			w.WriteHeader(http.StatusForbidden)
			return
		}
		if r.Header.Get("Origin") != defaultOriginURL {
			w.WriteHeader(http.StatusForbidden)
			return
		}
		upstreamHits.Add(1)
		time.Sleep(40 * time.Millisecond)
		w.Header().Set("Content-Type", "image/jpeg")
		_, _ = w.Write(scrambledJPEG)
	}))
	defer cdn.Close()

	cfg := DefaultServerConfig()
	cfg.AllowedURLPrefix = cdn.URL + "/"
	cfg.CacheMaxBytes = 16 << 20
	srv := NewProxyServer(cfg)

	// 1. Health check
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/health", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("/health status = %d, want 200", rec.Code)
	}
	var health map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &health); err != nil || health["status"] != "ok" {
		t.Fatalf("unexpected /health payload: %s", rec.Body.String())
	}

	// 2. Reject SSRF / disallowed URL
	rec = httptest.NewRecorder()
	srv.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/unscramble?url="+url.QueryEscape("https://evil.example/a.jpg"), nil))
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 on disallowed URL, got %d", rec.Code)
	}

	// 3. Reject invalid key before calling upstream
	rec = httptest.NewRecorder()
	srv.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/unscramble?url="+url.QueryEscape(cdn.URL+"/page1.jpg")+"&key=bad", nil))
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 on invalid key, got %d", rec.Code)
	}
	if upstreamHits.Load() != 0 {
		t.Fatalf("expected 0 upstream hits for invalid key, got %d", upstreamHits.Load())
	}

	// 4. Concurrent burst (30 goroutines requesting the same page) -> singleflight coalesces to 1 upstream fetch
	const burst = 30
	reqURL := "/unscramble?url=" + url.QueryEscape(cdn.URL+"/page1.jpg") + "&key=" + url.QueryEscape(rawKey)
	var wg sync.WaitGroup
	wg.Add(burst)
	for i := 0; i < burst; i++ {
		go func() {
			defer wg.Done()
			r := httptest.NewRecorder()
			srv.ServeHTTP(r, httptest.NewRequest(http.MethodGet, reqURL, nil))
			if r.Code != http.StatusOK {
				t.Errorf("concurrent request failed: status=%d body=%s", r.Code, r.Body.String())
				return
			}
			if r.Header().Get("Content-Type") != "image/jpeg" {
				t.Errorf("unexpected content-type: %s", r.Header().Get("Content-Type"))
			}
			img, _, err := image.Decode(bytes.NewReader(r.Body.Bytes()))
			if err != nil {
				t.Errorf("failed to decode response jpeg: %v", err)
				return
			}
			if img.Bounds().Dx() != 100 || img.Bounds().Dy() != 300 {
				t.Errorf("unexpected output size: %v", img.Bounds())
			}
		}()
	}
	wg.Wait()

	if hits := upstreamHits.Load(); hits != 1 {
		t.Fatalf("expected singleflight to coalesce burst to 1 upstream hit, got %d", hits)
	}

	// 5. Subsequent request hits in-memory cache
	rec = httptest.NewRecorder()
	srv.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, reqURL, nil))
	if rec.Code != http.StatusOK || rec.Header().Get("X-Cache") != "HIT" {
		t.Fatalf("expected cache HIT, got status=%d x-cache=%q", rec.Code, rec.Header().Get("X-Cache"))
	}
	if upstreamHits.Load() != 1 {
		t.Fatalf("expected upstream hits to remain 1 after cache HIT, got %d", upstreamHits.Load())
	}
}
