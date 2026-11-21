package main

import (
	"bytes"
	"errors"
	"fmt"
	"image"
	"image/draw"
	"image/jpeg"
	_ "image/png"
	"regexp"
	"strings"
	"sync"

	_ "golang.org/x/image/webp"
)

const (
	base58Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
	stripCount     = 10
	stripGap       = 4
)

var (
	factorials = [11]int{1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800}
	keyPattern = regexp.MustCompile(`^H[1-9A-HJ-NP-Za-km-z]+$`)

	bufPool = sync.Pool{
		New: func() any {
			return bytes.NewBuffer(make([]byte, 0, 256*1024))
		},
	}
)

// DecodeKey decodes a YuriGarden Base58 scramble key into a 10-strip permutation.
func DecodeKey(rawKey string) ([stripCount]int, error) {
	var order [stripCount]int
	if len(rawKey) < 6 {
		return order, fmt.Errorf("invalid scramble key: %q", rawKey)
	}

	sliced := rawKey[4:]
	if !keyPattern.MatchString(sliced) {
		return order, fmt.Errorf("invalid scramble key: %q", rawKey)
	}

	body := sliced[1 : len(sliced)-1]
	checksum := sliced[len(sliced)-1]

	n := 0
	for i := 0; i < len(body); i++ {
		idx := strings.IndexByte(base58Alphabet, body[i])
		if idx < 0 {
			return order, fmt.Errorf("invalid base58 character: %q", body[i])
		}
		n = n*58 + idx
		if n >= factorials[stripCount] {
			return order, errors.New("scramble key value out of bounds")
		}
	}

	if base58Alphabet[n%58] != checksum {
		return order, errors.New("scramble key checksum mismatch")
	}

	pool := make([]int, stripCount)
	for i := 0; i < stripCount; i++ {
		pool[i] = i
	}

	rem := n
	for a := stripCount - 1; a >= 0; a-- {
		fact := factorials[a]
		pickIdx := rem / fact
		rem %= fact
		if pickIdx < 0 || pickIdx >= len(pool) {
			return order, errors.New("scramble permutation index out of bounds")
		}
		order[stripCount-1-a] = pool[pickIdx]
		pool = append(pool[:pickIdx], pool[pickIdx+1:]...)
	}

	return order, nil
}

// InvertPermutation computes the inverse mapping matching YuriGarden's js(t) helper.
func InvertPermutation(order [stripCount]int) [stripCount]int {
	var inv [stripCount]int
	for i, val := range order {
		inv[val] = i
	}
	return inv
}

// SplitStripHeights computes exact strip heights matching YuriGarden's ys(t, e) helper.
func SplitStripHeights(totalHeight int) [stripCount]int {
	var heights [stripCount]int
	base := totalHeight / stripCount
	rem := totalHeight % stripCount
	for i := 0; i < stripCount; i++ {
		h := base
		if i < rem {
			h++
		}
		heights[i] = h
	}
	return heights
}

// UnscrambleImageBytes unscrambles a 10-strip YuriGarden chapter image and returns JPEG bytes.
func UnscrambleImageBytes(imageBytes []byte, rawKey string, jpegQuality int) ([]byte, error) {
	order, err := DecodeKey(rawKey)
	if err != nil {
		return nil, err
	}
	inv := InvertPermutation(order)

	src, _, err := image.Decode(bytes.NewReader(imageBytes))
	if err != nil {
		return nil, fmt.Errorf("decode image: %w", err)
	}

	bounds := src.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()
	unpaddedHeight := height - stripGap*(stripCount-1)
	if width <= 0 || unpaddedHeight <= 0 {
		return nil, fmt.Errorf("image dimensions too small to unscramble: %dx%d", width, height)
	}

	stripHeights := SplitStripHeights(unpaddedHeight)
	var scrambledHeights [stripCount]int
	for i := 0; i < stripCount; i++ {
		scrambledHeights[i] = stripHeights[order[i]]
	}

	var prefixY [stripCount + 1]int
	for i := 0; i < stripCount; i++ {
		prefixY[i+1] = prefixY[i] + scrambledHeights[i]
	}

	canvas := image.NewRGBA(image.Rect(0, 0, width, unpaddedHeight))
	destY := 0
	for t := 0; t < stripCount; t++ {
		srcIdx := inv[t]
		srcY := prefixY[srcIdx] + stripGap*srcIdx
		stripH := scrambledHeights[srcIdx]
		if stripH <= 0 {
			continue
		}
		dstRect := image.Rect(0, destY, width, destY+stripH)
		srcPt := image.Pt(bounds.Min.X, bounds.Min.Y+srcY)
		draw.Draw(canvas, dstRect, src, srcPt, draw.Src)
		destY += stripH
	}

	if jpegQuality <= 0 || jpegQuality > 100 {
		jpegQuality = 92
	}

	buf := bufPool.Get().(*bytes.Buffer)
	buf.Reset()
	defer bufPool.Put(buf)

	if err := jpeg.Encode(buf, canvas, &jpeg.Options{Quality: jpegQuality}); err != nil {
		return nil, fmt.Errorf("encode jpeg: %w", err)
	}

	out := make([]byte, buf.Len())
	copy(out, buf.Bytes())
	return out, nil
}
