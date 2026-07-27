import type {
  Service,
  Incident,
  Deployment,
  Alert,
  Remediation,
  SLO,
  ClusterNode,
  CostData,
  Runbook,
} from '@/types'

export const mockServices: Service[] = [
  {
    id: 'svc-1',
    name: 'API Gateway',
    status: 'healthy',
    uptime: 99.99,
    latency: 45,
    errorRate: 0.01,
    lastCheck: new Date().toISOString(),
    environment: 'production',
    region: 'us-east-1',
  },
  {
    id: 'svc-2',
    name: 'User Service',
    status: 'healthy',
    uptime: 99.95,
    latency: 120,
    errorRate: 0.05,
    lastCheck: new Date().toISOString(),
    environment: 'production',
    region: 'us-east-1',
  },
  {
    id: 'svc-3',
    name: 'Payment Service',
    status: 'degraded',
    uptime: 98.5,
    latency: 350,
    errorRate: 2.5,
    lastCheck: new Date().toISOString(),
    environment: 'production',
    region: 'us-west-2',
  },
  {
    id: 'svc-4',
    name: 'Notification Service',
    status: 'healthy',
    uptime: 99.9,
    latency: 80,
    errorRate: 0.1,
    lastCheck: new Date().toISOString(),
    environment: 'production',
    region: 'eu-west-1',
  },
  {
    id: 'svc-5',
    name: 'Search Service',
    status: 'critical',
    uptime: 85.0,
    latency: 1500,
    errorRate: 15.0,
    lastCheck: new Date().toISOString(),
    environment: 'production',
    region: 'us-east-1',
  },
  {
    id: 'svc-6',
    name: 'Analytics Service',
    status: 'healthy',
    uptime: 99.8,
    latency: 200,
    errorRate: 0.2,
    lastCheck: new Date().toISOString(),
    environment: 'production',
    region: 'us-east-1',
  },
]

export const mockIncidents: Incident[] = [
  {
    id: 'inc-1',
    title: 'High latency on Search Service',
    description: 'Search queries taking longer than 1s to respond',
    severity: 'critical',
    status: 'open',
    service: 'Search Service',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    timeline: [
      {
        id: 'evt-1',
        type: 'created',
        message: 'Incident created from alert: Search latency > 1000ms',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: 'evt-2',
        type: 'updated',
        message: 'Investigating Elasticsearch cluster health',
        user: { id: 'u-1', name: 'John Doe', email: 'john@example.com', role: 'operator' },
        timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      },
    ],
  },
  {
    id: 'inc-2',
    title: 'Payment processing delays',
    description: 'Payment confirmations delayed by 30+ seconds',
    severity: 'high',
    status: 'acknowledged',
    service: 'Payment Service',
    assignee: { id: 'u-2', name: 'Jane Smith', email: 'jane@example.com', role: 'operator' },
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    timeline: [
      {
        id: 'evt-3',
        type: 'created',
        message: 'Incident created manually by operator',
        user: { id: 'u-2', name: 'Jane Smith', email: 'jane@example.com', role: 'operator' },
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: 'evt-4',
        type: 'acknowledged',
        message: 'Incident acknowledged',
        user: { id: 'u-2', name: 'Jane Smith', email: 'jane@example.com', role: 'operator' },
        timestamp: new Date(Date.now() - 1.5 * 3600000).toISOString(),
      },
    ],
  },
  {
    id: 'inc-3',
    title: 'Database connection pool exhaustion',
    description: 'User Service unable to acquire database connections',
    severity: 'medium',
    status: 'resolved',
    service: 'User Service',
    assignee: { id: 'u-1', name: 'John Doe', email: 'john@example.com', role: 'operator' },
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    timeline: [],
  },
]

export const mockDeployments: Deployment[] = [
  {
    id: 'dep-1',
    name: 'API Gateway v2.5.0',
    service: 'API Gateway',
    environment: 'production',
    version: 'v2.5.0',
    status: 'success',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3000000).toISOString(),
    triggeredBy: { id: 'u-1', name: 'John Doe', email: 'john@example.com', role: 'operator' },
    commit: {
      sha: 'abc123f',
      message: 'feat: Add rate limiting middleware',
      author: 'John Doe',
    },
    stages: [
      { id: 's-1', name: 'Build', status: 'success', startedAt: new Date(Date.now() - 3600000).toISOString(), completedAt: new Date(Date.now() - 3400000).toISOString() },
      { id: 's-2', name: 'Test', status: 'success', startedAt: new Date(Date.now() - 3400000).toISOString(), completedAt: new Date(Date.now() - 3200000).toISOString() },
      { id: 's-3', name: 'Deploy', status: 'success', startedAt: new Date(Date.now() - 3200000).toISOString(), completedAt: new Date(Date.now() - 3000000).toISOString() },
    ],
  },
  {
    id: 'dep-2',
    name: 'User Service v1.12.0',
    service: 'User Service',
    environment: 'production',
    version: 'v1.12.0',
    status: 'running',
    startedAt: new Date(Date.now() - 300000).toISOString(),
    triggeredBy: { id: 'u-2', name: 'Jane Smith', email: 'jane@example.com', role: 'operator' },
    commit: {
      sha: 'def456a',
      message: 'fix: Resolve password reset token expiry',
      author: 'Jane Smith',
    },
    stages: [
      { id: 's-4', name: 'Build', status: 'success', startedAt: new Date(Date.now() - 300000).toISOString(), completedAt: new Date(Date.now() - 200000).toISOString() },
      { id: 's-5', name: 'Test', status: 'success', startedAt: new Date(Date.now() - 200000).toISOString(), completedAt: new Date(Date.now() - 100000).toISOString() },
      { id: 's-6', name: 'Deploy', status: 'running', startedAt: new Date(Date.now() - 100000).toISOString() },
    ],
  },
  {
    id: 'dep-3',
    name: 'Analytics Service v3.0.0',
    service: 'Analytics Service',
    environment: 'staging',
    version: 'v3.0.0',
    status: 'pending',
    startedAt: new Date().toISOString(),
    triggeredBy: { id: 'u-1', name: 'John Doe', email: 'john@example.com', role: 'operator' },
    commit: {
      sha: 'ghi789b',
      message: 'feat: Add real-time dashboard metrics',
      author: 'John Doe',
    },
    stages: [
      { id: 's-7', name: 'Build', status: 'pending' },
      { id: 's-8', name: 'Test', status: 'pending' },
      { id: 's-9', name: 'Deploy', status: 'pending' },
    ],
  },
]

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    title: 'High CPU Usage',
    message: 'Search Service CPU usage exceeds 90%',
    severity: 'critical',
    service: 'Search Service',
    metric: 'cpu_usage',
    threshold: 90,
    currentValue: 95.5,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    acknowledged: false,
  },
  {
    id: 'alert-2',
    title: 'High Error Rate',
    message: 'Payment Service error rate exceeds 2%',
    severity: 'high',
    service: 'Payment Service',
    metric: 'error_rate',
    threshold: 2,
    currentValue: 2.5,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    acknowledged: true,
  },
  {
    id: 'alert-3',
    title: 'Memory Warning',
    message: 'API Gateway memory usage at 75%',
    severity: 'medium',
    service: 'API Gateway',
    metric: 'memory_usage',
    threshold: 80,
    currentValue: 75,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    acknowledged: false,
  },
]

export const mockRemediations: Remediation[] = [
  {
    id: 'rem-1',
    name: 'Restart Search Service Pods',
    description: 'Rolling restart of all Search Service pods',
    type: 'restart',
    service: 'Search Service',
    status: 'running',
    triggeredBy: 'auto',
    startedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    logs: [
      '[INFO] Starting rolling restart...',
      '[INFO] Pod search-svc-1 restarted',
      '[INFO] Pod search-svc-2 restarting...',
    ],
  },
  {
    id: 'rem-2',
    name: 'Scale Payment Service',
    description: 'Scale Payment Service from 3 to 5 replicas',
    type: 'scale',
    service: 'Payment Service',
    status: 'completed',
    triggeredBy: { id: 'u-2', name: 'Jane Smith', email: 'jane@example.com', role: 'operator' },
    startedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    completedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    logs: [
      '[INFO] Scaling deployment from 3 to 5 replicas',
      '[INFO] New pods scheduled',
      '[INFO] All pods ready',
      '[SUCCESS] Scale operation completed',
    ],
    result: {
      success: true,
      message: 'Successfully scaled to 5 replicas',
    },
  },
]

export const mockSLOs: SLO[] = [
  {
    id: 'slo-1',
    name: 'API Availability',
    service: 'API Gateway',
    target: 99.9,
    current: 99.95,
    budget: 43.2,
    budgetRemaining: 38.5,
    period: 'monthly',
  },
  {
    id: 'slo-2',
    name: 'Search Latency P99',
    service: 'Search Service',
    target: 99.0,
    current: 85.0,
    budget: 43.2,
    budgetRemaining: -15.2,
    period: 'monthly',
  },
  {
    id: 'slo-3',
    name: 'Payment Success Rate',
    service: 'Payment Service',
    target: 99.5,
    current: 98.2,
    budget: 21.6,
    budgetRemaining: 8.4,
    period: 'weekly',
  },
]

export const mockClusterNodes: ClusterNode[] = [
  { id: 'node-1', name: 'worker-us-east-1a-001', status: 'healthy', cpu: 65, memory: 72, pods: 28, maxPods: 30, region: 'us-east-1' },
  { id: 'node-2', name: 'worker-us-east-1b-001', status: 'healthy', cpu: 45, memory: 58, pods: 22, maxPods: 30, region: 'us-east-1' },
  { id: 'node-3', name: 'worker-us-east-1c-001', status: 'degraded', cpu: 92, memory: 88, pods: 30, maxPods: 30, region: 'us-east-1' },
  { id: 'node-4', name: 'worker-us-west-2a-001', status: 'healthy', cpu: 35, memory: 42, pods: 15, maxPods: 30, region: 'us-west-2' },
]

export const mockCostData: CostData[] = [
  { service: 'API Gateway', daily: 45.2, weekly: 316.4, monthly: 1356.0, trend: -2.5 },
  { service: 'User Service', daily: 32.8, weekly: 229.6, monthly: 984.0, trend: 5.2 },
  { service: 'Payment Service', daily: 58.5, weekly: 409.5, monthly: 1755.0, trend: 12.3 },
  { service: 'Search Service', daily: 125.0, weekly: 875.0, monthly: 3750.0, trend: 8.7 },
  { service: 'Notification Service', daily: 18.3, weekly: 128.1, monthly: 549.0, trend: -1.2 },
  { service: 'Analytics Service', daily: 85.6, weekly: 599.2, monthly: 2568.0, trend: 15.8 },
]

export const mockRunbooks: Runbook[] = [
  {
    id: 'rb-1',
    name: 'Search Service Recovery',
    description: 'Steps to recover Search Service from degraded state',
    service: 'Search Service',
    steps: [
      { id: 'step-1', order: 1, title: 'Check Elasticsearch Health', description: 'Verify ES cluster status', command: 'curl -X GET "localhost:9200/_cluster/health?pretty"', isAutomated: true },
      { id: 'step-2', order: 2, title: 'Check Pod Status', description: 'Verify all pods are running', command: 'kubectl get pods -l app=search-service', isAutomated: true },
      { id: 'step-3', order: 3, title: 'Rolling Restart', description: 'Perform rolling restart if needed', command: 'kubectl rollout restart deployment/search-service', isAutomated: true },
      { id: 'step-4', order: 4, title: 'Verify Recovery', description: 'Confirm service is healthy', isAutomated: false },
    ],
    lastUsed: new Date(Date.now() - 24 * 3600000).toISOString(),
    usageCount: 15,
  },
  {
    id: 'rb-2',
    name: 'Database Connection Pool Reset',
    description: 'Reset connection pool when exhausted',
    service: 'User Service',
    steps: [
      { id: 'step-5', order: 1, title: 'Check Connection Count', description: 'Verify active connections', command: 'SELECT count(*) FROM pg_stat_activity;', isAutomated: true },
      { id: 'step-6', order: 2, title: 'Kill Idle Connections', description: 'Terminate idle connections', command: 'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = \'idle\';', isAutomated: true },
      { id: 'step-7', order: 3, title: 'Restart Service', description: 'Restart service pods', command: 'kubectl rollout restart deployment/user-service', isAutomated: true },
    ],
    lastUsed: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    usageCount: 8,
  },
]

export function generateMetricsData(hours: number = 24): { timestamp: string; value: number }[] {
  const data = []
  const now = Date.now()
  for (let i = hours; i >= 0; i--) {
    data.push({
      timestamp: new Date(now - i * 3600000).toISOString(),
      value: Math.random() * 100,
    })
  }
  return data
}

export function generateRequestsData(hours: number = 24): { timestamp: string; requests: number; errors: number }[] {
  const data = []
  const now = Date.now()
  for (let i = hours; i >= 0; i--) {
    const requests = Math.floor(Math.random() * 10000 + 5000)
    data.push({
      timestamp: new Date(now - i * 3600000).toISOString(),
      requests,
      errors: Math.floor(requests * (Math.random() * 0.02)),
    })
  }
  return data
}
