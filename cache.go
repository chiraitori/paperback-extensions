package main

import (
	"container/list"
	"sync"
	"time"
)

type cacheItem struct {
	key         string
	data        []byte
	contentType string
	expiresAt   time.Time
}

type cacheStats struct {
	Items    int    `json:"items"`
	Bytes    int64  `json:"bytes"`
	MaxBytes int64  `json:"maxBytes"`
	Hits     uint64 `json:"hits"`
	Misses   uint64 `json:"misses"`
}

// MemoryCache is a bounded-size, TTL-aware in-memory LRU cache for image payloads.
type MemoryCache struct {
	mu       sync.Mutex
	maxBytes int64
	ttl      time.Duration
	curBytes int64
	hits     uint64
	misses   uint64
	ll       *list.List
	entries  map[string]*list.Element
}

// NewMemoryCache constructs a MemoryCache; maxBytes <= 0 disables caching.
func NewMemoryCache(maxBytes int64, ttl time.Duration) *MemoryCache {
	return &MemoryCache{
		maxBytes: maxBytes,
		ttl:      ttl,
		ll:       list.New(),
		entries:  make(map[string]*list.Element),
	}
}

func (c *MemoryCache) Get(key string) (data []byte, contentType string, ok bool) {
	if c == nil || c.maxBytes <= 0 {
		return nil, "", false
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	elem, found := c.entries[key]
	if !found {
		c.misses++
		return nil, "", false
	}

	item := elem.Value.(*cacheItem)
	if c.ttl > 0 && time.Now().After(item.expiresAt) {
		c.removeElement(elem)
		c.misses++
		return nil, "", false
	}

	c.ll.MoveToFront(elem)
	c.hits++
	return item.data, item.contentType, true
}

func (c *MemoryCache) Set(key string, data []byte, contentType string) {
	if c == nil || c.maxBytes <= 0 || len(data) == 0 {
		return
	}
	itemSize := int64(len(data))
	// Avoid evicting the whole cache for one huge image.
	if itemSize > c.maxBytes/4 && itemSize > 4*1024*1024 {
		return
	}
	if itemSize > c.maxBytes {
		return
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	var expiresAt time.Time
	if c.ttl > 0 {
		expiresAt = time.Now().Add(c.ttl)
	}

	if elem, found := c.entries[key]; found {
		old := elem.Value.(*cacheItem)
		c.curBytes -= int64(len(old.data))
		old.data = data
		old.contentType = contentType
		old.expiresAt = expiresAt
		c.curBytes += itemSize
		c.ll.MoveToFront(elem)
	} else {
		item := &cacheItem{
			key:         key,
			data:        data,
			contentType: contentType,
			expiresAt:   expiresAt,
		}
		elem := c.ll.PushFront(item)
		c.entries[key] = elem
		c.curBytes += itemSize
	}

	for c.curBytes > c.maxBytes && c.ll.Len() > 0 {
		c.removeElement(c.ll.Back())
	}
}

func (c *MemoryCache) removeElement(elem *list.Element) {
	c.ll.Remove(elem)
	item := elem.Value.(*cacheItem)
	delete(c.entries, item.key)
	c.curBytes -= int64(len(item.data))
}

func (c *MemoryCache) Stats() cacheStats {
	if c == nil {
		return cacheStats{}
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	return cacheStats{
		Items:    c.ll.Len(),
		Bytes:    c.curBytes,
		MaxBytes: c.maxBytes,
		Hits:     c.hits,
		Misses:   c.misses,
	}
}
