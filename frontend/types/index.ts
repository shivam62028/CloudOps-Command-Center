export type ServiceStatus = 'healthy' | 'degraded' | 'critical' | 'unknown'
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'open' | 'acknowledged' | 'resolved'
export type DeploymentStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
export type RemediationStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface Service {
  id: string
  name: string
  status: ServiceStatus
  uptime: number
  latency: number
  errorRate: number
  lastCheck: string
  environment: string
  region: string
}

export interface Metric {
  timestamp: string
  value: number
}

export interface ServiceMetrics {
  serviceId: string
  cpu: Metric[]
  memory: Metric[]
  requests: Metric[]
  errors: Metric[]
  latency: Metric[]
}

export interface Incident {
  id: string
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  service: string
  assignee?: User
  createdAt: string
  updatedAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  timeline: IncidentEvent[]
}

export interface IncidentEvent {
  id: string
  type: 'created' | 'acknowledged' | 'updated' | 'resolved' | 'comment' | 'escalated'
  message: string
  user?: User
  timestamp: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'operator' | 'viewer'
}

export interface Deployment {
  id: string
  name: string
  service: string
  environment: string
  version: string
  status: DeploymentStatus
  startedAt: string
  completedAt?: string
  triggeredBy: User
  commit: {
    sha: string
    message: string
    author: string
  }
  stages: DeploymentStage[]
}

export interface DeploymentStage {
  id: string
  name: string
  status: DeploymentStatus
  startedAt?: string
  completedAt?: string
  logs?: string[]
}

export interface Remediation {
  id: string
  name: string
  description: string
  type: 'restart' | 'scale' | 'rollback' | 'clear-cache' | 'custom'
  service: string
  status: RemediationStatus
  triggeredBy: 'auto' | User
  startedAt: string
  completedAt?: string
  logs: string[]
  result?: {
    success: boolean
    message: string
  }
}

export interface Alert {
  id: string
  title: string
  message: string
  severity: IncidentSeverity
  service: string
  metric?: string
  threshold?: number
  currentValue?: number
  createdAt: string
  acknowledged: boolean
}

export interface Runbook {
  id: string
  name: string
  description: string
  service?: string
  steps: RunbookStep[]
  lastUsed?: string
  usageCount: number
}

export interface RunbookStep {
  id: string
  order: number
  title: string
  description: string
  command?: string
  isAutomated: boolean
}

export interface CostData {
  service: string
  daily: number
  weekly: number
  monthly: number
  trend: number
}

export interface ClusterNode {
  id: string
  name: string
  status: ServiceStatus
  cpu: number
  memory: number
  pods: number
  maxPods: number
  region: string
}

export interface Pod {
  id: string
  name: string
  namespace: string
  status: 'Running' | 'Pending' | 'Failed' | 'Succeeded' | 'Unknown'
  restarts: number
  age: string
  node: string
  cpu: number
  memory: number
}

export interface SLO {
  id: string
  name: string
  service: string
  target: number
  current: number
  budget: number
  budgetRemaining: number
  period: 'daily' | 'weekly' | 'monthly'
}
