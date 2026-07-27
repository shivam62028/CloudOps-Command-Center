#!/bin/bash

set -euo pipefail

SERVICE_NAME="${1:-}"
NAMESPACE="${2:-cloudops}"

if [ -z "$SERVICE_NAME" ]; then
    echo "Usage: $0 <service-name> [namespace]"
    echo "Example: $0 user-service cloudops"
    exit 1
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-cloudops}"
DB_USER="${DB_USER:-postgres}"

log "Starting database connection pool reset for service: $SERVICE_NAME"

log "Checking current connection count..."

CONN_COUNT=$(PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT count(*) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND application_name LIKE '%$SERVICE_NAME%';" 2>/dev/null | tr -d ' ' || echo "0")

log "Current connections from $SERVICE_NAME: $CONN_COUNT"

log "Identifying idle connections..."

IDLE_CONNS=$(PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT count(*) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND state = 'idle' AND application_name LIKE '%$SERVICE_NAME%';" 2>/dev/null | tr -d ' ' || echo "0")

log "Idle connections: $IDLE_CONNS"

if [ "$IDLE_CONNS" -gt 0 ]; then
    log "Terminating idle connections..."

    PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND state = 'idle' AND application_name LIKE '%$SERVICE_NAME%' AND pid <> pg_backend_pid();" 2>/dev/null || true

    log "Idle connections terminated"
fi

log "Checking for long-running queries..."

LONG_QUERIES=$(PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT count(*) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND state = 'active' AND query_start < NOW() - INTERVAL '5 minutes' AND application_name LIKE '%$SERVICE_NAME%';" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$LONG_QUERIES" -gt 0 ]; then
    log "WARNING: Found $LONG_QUERIES long-running queries"

    PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT pid, query_start, state, LEFT(query, 100) as query FROM pg_stat_activity WHERE datname = '$DB_NAME' AND state = 'active' AND query_start < NOW() - INTERVAL '5 minutes' AND application_name LIKE '%$SERVICE_NAME%';" 2>/dev/null || true
fi

log "Performing rolling restart of $SERVICE_NAME to reset connection pools..."

DEPLOYMENT=$(kubectl get deployment -n "$NAMESPACE" -l "app=$SERVICE_NAME" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$DEPLOYMENT" ]; then
    kubectl rollout restart deployment/"$DEPLOYMENT" -n "$NAMESPACE"
    kubectl rollout status deployment/"$DEPLOYMENT" -n "$NAMESPACE" --timeout=180s
    log "Service restarted successfully"
else
    log "WARNING: Kubernetes deployment not found, skipping restart"
fi

sleep 10

NEW_CONN_COUNT=$(PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT count(*) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND application_name LIKE '%$SERVICE_NAME%';" 2>/dev/null | tr -d ' ' || echo "0")

log "New connection count: $NEW_CONN_COUNT (was: $CONN_COUNT)"

log "SUCCESS: Database connection pool reset completed"
