# YuriGarden Unscrambler Proxy (Go)

High-concurrency HTTP unscrambler proxy for the Paperback **YuriGarden** extension (`src/YuriGarden/YuriGarden.ts` on `main`).

## Features

- **Connection-pooled upstream client** (`http.Transport` with HTTP/2 & keep-alive) sending required `Referer` and `Origin` headers to `cdn.yurigarden.moe`.
- **Request coalescing (`singleflight`)**: simultaneous requests for the same `{url, key}` share one upstream download and one unscramble job.
- **Bounded CPU worker semaphore** (`MAX_CONCURRENT_JOBS`) for image decode/unscramble/JPEG encode.
- **Bounded LRU + TTL in-memory cache** (`CACHE_MAX_MB`, `CACHE_TTL`) for instant repeat chapter page reads.
- **SSRF protection**: validates `url` starts with `https://cdn.yurigarden.moe/` and rejects malformed scramble keys before hitting upstream.

## Endpoints

- `GET /health` — returns `{"status":"ok","cache":{...}}`
- `GET /unscramble?url={encodedCdnUrl}&key={encodedRawKey}` — returns unscrambled JPEG (`quality=92`)

## Run with Docker Compose

```bash
docker compose up -d --build
```

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `HOST` | `0.0.0.0` | Listen address |
| `PORT` | `8787` | Listen port |
| `JPEG_QUALITY` | `92` | Output JPEG quality (`1-100`) |
| `MAX_CONCURRENT_JOBS` | `max(8, NumCPU*4)` | Max concurrent image decode/encode jobs |
| `CACHE_MAX_MB` | `256` | In-memory LRU cache limit in MiB (`0` disables) |
| `CACHE_TTL` | `30m` | Cache entry TTL |
| `UPSTREAM_TIMEOUT` | `20s` | Upstream CDN fetch timeout |
| `MAX_IMAGE_MB` | `32` | Max upstream image size in MiB |
