#!/bin/bash

set -euo pipefail

SERVICE_NAME="${1:-}"
NAMESPACE="${2:-cloudops}"

if [ -z "$SERVICE_NAME" ]; then
    echo "Usage: $0 <service-name> [namespace]"
    echo "Example: $0 api-gateway cloudops"
    exit 1
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting rolling restart for service: $SERVICE_NAME in namespace: $NAMESPACE"

DEPLOYMENT=$(kubectl get deployment -n "$NAMESPACE" -l "app=$SERVICE_NAME" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$DEPLOYMENT" ]; then
    log "ERROR: Deployment not found for service: $SERVICE_NAME"
    exit 1
fi

log "Found deployment: $DEPLOYMENT"

INITIAL_PODS=$(kubectl get pods -n "$NAMESPACE" -l "app=$SERVICE_NAME" -o jsonpath='{.items[*].metadata.name}')
log "Current pods: $INITIAL_PODS"

log "Initiating rolling restart..."
kubectl rollout restart deployment/"$DEPLOYMENT" -n "$NAMESPACE"

log "Waiting for rollout to complete..."
kubectl rollout status deployment/"$DEPLOYMENT" -n "$NAMESPACE" --timeout=300s

NEW_PODS=$(kubectl get pods -n "$NAMESPACE" -l "app=$SERVICE_NAME" -o jsonpath='{.items[*].metadata.name}')
log "New pods: $NEW_PODS"

READY_PODS=$(kubectl get pods -n "$NAMESPACE" -l "app=$SERVICE_NAME" --field-selector=status.phase=Running -o jsonpath='{.items[*].metadata.name}' | wc -w)
TOTAL_PODS=$(kubectl get pods -n "$NAMESPACE" -l "app=$SERVICE_NAME" -o jsonpath='{.items[*].metadata.name}' | wc -w)

log "Pods ready: $READY_PODS/$TOTAL_PODS"

if [ "$READY_PODS" -eq "$TOTAL_PODS" ]; then
    log "SUCCESS: Rolling restart completed successfully"
    exit 0
else
    log "WARNING: Not all pods are ready"
    kubectl get pods -n "$NAMESPACE" -l "app=$SERVICE_NAME"
    exit 1
fi
