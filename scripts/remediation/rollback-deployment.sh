#!/bin/bash

set -euo pipefail

SERVICE_NAME="${1:-}"
REVISION="${2:-}"
NAMESPACE="${3:-cloudops}"

if [ -z "$SERVICE_NAME" ]; then
    echo "Usage: $0 <service-name> [revision] [namespace]"
    echo "If revision is not specified, rolls back to previous version"
    echo "Example: $0 api-gateway 5 cloudops"
    exit 1
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting rollback operation for service: $SERVICE_NAME"

DEPLOYMENT=$(kubectl get deployment -n "$NAMESPACE" -l "app=$SERVICE_NAME" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$DEPLOYMENT" ]; then
    log "ERROR: Deployment not found for service: $SERVICE_NAME"
    exit 1
fi

log "Found deployment: $DEPLOYMENT"

CURRENT_IMAGE=$(kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}')
log "Current image: $CURRENT_IMAGE"

log "Rollout history:"
kubectl rollout history deployment/"$DEPLOYMENT" -n "$NAMESPACE"

if [ -n "$REVISION" ]; then
    log "Rolling back to revision: $REVISION"
    kubectl rollout undo deployment/"$DEPLOYMENT" -n "$NAMESPACE" --to-revision="$REVISION"
else
    log "Rolling back to previous revision"
    kubectl rollout undo deployment/"$DEPLOYMENT" -n "$NAMESPACE"
fi

log "Waiting for rollback to complete..."
kubectl rollout status deployment/"$DEPLOYMENT" -n "$NAMESPACE" --timeout=300s

NEW_IMAGE=$(kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}')
log "New image: $NEW_IMAGE"

READY_PODS=$(kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}')
TOTAL_PODS=$(kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')

log "Pods ready: ${READY_PODS:-0}/$TOTAL_PODS"

if [ "${READY_PODS:-0}" -eq "$TOTAL_PODS" ]; then
    log "SUCCESS: Rollback completed successfully"
    log "Rolled back from $CURRENT_IMAGE to $NEW_IMAGE"
    exit 0
else
    log "WARNING: Rollback completed but not all pods are ready"
    kubectl get pods -n "$NAMESPACE" -l "app=$SERVICE_NAME"
    exit 1
fi
