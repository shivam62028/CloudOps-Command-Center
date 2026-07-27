#!/bin/bash

set -euo pipefail

SERVICE_NAME="${1:-}"
REPLICAS="${2:-}"
NAMESPACE="${3:-cloudops}"

if [ -z "$SERVICE_NAME" ] || [ -z "$REPLICAS" ]; then
    echo "Usage: $0 <service-name> <replicas> [namespace]"
    echo "Example: $0 api-gateway 5 cloudops"
    exit 1
fi

if ! [[ "$REPLICAS" =~ ^[0-9]+$ ]] || [ "$REPLICAS" -lt 1 ] || [ "$REPLICAS" -gt 20 ]; then
    echo "ERROR: Replicas must be a number between 1 and 20"
    exit 1
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting scale operation for service: $SERVICE_NAME to $REPLICAS replicas"

DEPLOYMENT=$(kubectl get deployment -n "$NAMESPACE" -l "app=$SERVICE_NAME" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$DEPLOYMENT" ]; then
    log "ERROR: Deployment not found for service: $SERVICE_NAME"
    exit 1
fi

CURRENT_REPLICAS=$(kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
log "Current replicas: $CURRENT_REPLICAS"
log "Target replicas: $REPLICAS"

if [ "$CURRENT_REPLICAS" -eq "$REPLICAS" ]; then
    log "Service is already at $REPLICAS replicas. No action needed."
    exit 0
fi

log "Scaling deployment..."
kubectl scale deployment "$DEPLOYMENT" -n "$NAMESPACE" --replicas="$REPLICAS"

log "Waiting for scale operation to complete..."
TIMEOUT=120
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
    READY=$(kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
    READY=${READY:-0}

    if [ "$READY" -eq "$REPLICAS" ]; then
        log "SUCCESS: Scale operation completed. $READY/$REPLICAS pods ready."
        kubectl get pods -n "$NAMESPACE" -l "app=$SERVICE_NAME"
        exit 0
    fi

    log "Waiting... $READY/$REPLICAS pods ready"
    sleep 5
    ELAPSED=$((ELAPSED + 5))
done

log "WARNING: Timeout waiting for scale operation"
kubectl get pods -n "$NAMESPACE" -l "app=$SERVICE_NAME"
exit 1
