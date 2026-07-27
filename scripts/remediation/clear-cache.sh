#!/bin/bash

set -euo pipefail

SERVICE_NAME="${1:-}"
CACHE_TYPE="${2:-all}"

if [ -z "$SERVICE_NAME" ]; then
    echo "Usage: $0 <service-name> [cache-type]"
    echo "Cache types: redis, cdn, all (default)"
    echo "Example: $0 api-gateway redis"
    exit 1
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"

clear_redis_cache() {
    log "Clearing Redis cache for service: $SERVICE_NAME"

    PATTERN="${SERVICE_NAME}:*"

    KEYS=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" KEYS "$PATTERN" 2>/dev/null || echo "")

    if [ -z "$KEYS" ]; then
        log "No Redis keys found matching pattern: $PATTERN"
        return 0
    fi

    KEY_COUNT=$(echo "$KEYS" | wc -l)
    log "Found $KEY_COUNT keys to delete"

    echo "$KEYS" | xargs -r redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" DEL

    log "SUCCESS: Cleared Redis cache"
}

clear_cdn_cache() {
    log "Clearing CDN cache for service: $SERVICE_NAME"

    if [ -n "${CLOUDFLARE_API_TOKEN:-}" ] && [ -n "${CLOUDFLARE_ZONE_ID:-}" ]; then
        log "Purging Cloudflare cache..."

        RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
            -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything":true}')

        SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

        if [ "$SUCCESS" = "true" ]; then
            log "SUCCESS: Cloudflare cache purged"
        else
            log "ERROR: Failed to purge Cloudflare cache"
            echo "$RESPONSE" | jq .
            return 1
        fi
    else
        log "WARNING: Cloudflare credentials not configured, skipping CDN cache clear"
    fi
}

warm_cache() {
    log "Warming cache for critical endpoints..."

    API_BASE="${API_BASE:-http://localhost:4000}"

    ENDPOINTS=(
        "/health"
        "/api/services"
        "/api/metrics/overview"
    )

    for endpoint in "${ENDPOINTS[@]}"; do
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE$endpoint" 2>/dev/null || echo "000")
        if [ "$STATUS" = "200" ]; then
            log "  $endpoint - OK"
        else
            log "  $endpoint - Status: $STATUS"
        fi
    done

    log "Cache warming completed"
}

log "Starting cache clear operation for: $SERVICE_NAME"
log "Cache type: $CACHE_TYPE"

case "$CACHE_TYPE" in
    redis)
        clear_redis_cache
        ;;
    cdn)
        clear_cdn_cache
        ;;
    all)
        clear_redis_cache
        clear_cdn_cache
        warm_cache
        ;;
    *)
        log "ERROR: Unknown cache type: $CACHE_TYPE"
        exit 1
        ;;
esac

log "SUCCESS: Cache clear operation completed"
