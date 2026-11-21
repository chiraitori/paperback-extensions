FROM golang:1.26-alpine AS builder

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/yurigarden-unscrambler .

FROM alpine:3.21

RUN apk add --no-cache ca-certificates tzdata \
    && adduser -D -H -u 10001 appuser

COPY --from=builder /out/yurigarden-unscrambler /usr/local/bin/yurigarden-unscrambler

USER appuser

ENV HOST=0.0.0.0 \
    PORT=8787 \
    JPEG_QUALITY=92 \
    CACHE_MAX_MB=256 \
    CACHE_TTL=30m \
    UPSTREAM_TIMEOUT=20s

EXPOSE 8787

ENTRYPOINT ["/usr/local/bin/yurigarden-unscrambler"]
