import { Router, Request, Response } from 'express';

const router = Router();

const generateTimeSeriesData = (
  hours: number,
  baseValue: number,
  variance: number
) => {
  const data = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    data.push({
      timestamp: new Date(now - i * 3600000).toISOString(),
      value: baseValue + (Math.random() - 0.5) * variance,
    });
  }
  return data;
};

router.get('/overview', (req: Request, res: Response) => {
  res.json({
    data: {
      totalServices: 6,
      healthyServices: 4,
      degradedServices: 1,
      criticalServices: 1,
      totalIncidents: 3,
      activeIncidents: 2,
      deploymentsToday: 5,
      successfulDeployments: 4,
      totalAlerts: 8,
      unacknowledgedAlerts: 3,
      avgResponseTime: 125,
      errorRate: 0.5,
      uptime: 99.95,
    },
  });
});

router.get('/cpu', (req: Request, res: Response) => {
  const { period = '24h', service } = req.query;
  const hours = period === '1h' ? 1 : period === '6h' ? 6 : 24;

  res.json({
    data: generateTimeSeriesData(hours, 55, 30),
    service,
    period,
  });
});

router.get('/memory', (req: Request, res: Response) => {
  const { period = '24h', service } = req.query;
  const hours = period === '1h' ? 1 : period === '6h' ? 6 : 24;

  res.json({
    data: generateTimeSeriesData(hours, 65, 20),
    service,
    period,
  });
});

router.get('/requests', (req: Request, res: Response) => {
  const { period = '24h', service } = req.query;
  const hours = period === '1h' ? 1 : period === '6h' ? 6 : 24;

  const data = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    const requests = Math.floor(Math.random() * 10000 + 5000);
    data.push({
      timestamp: new Date(now - i * 3600000).toISOString(),
      requests,
      errors: Math.floor(requests * Math.random() * 0.02),
      latencyP50: Math.floor(Math.random() * 50 + 20),
      latencyP95: Math.floor(Math.random() * 150 + 50),
      latencyP99: Math.floor(Math.random() * 300 + 100),
    });
  }

  res.json({
    data,
    service,
    period,
  });
});

router.get('/errors', (req: Request, res: Response) => {
  const { period = '24h', service } = req.query;
  const hours = period === '1h' ? 1 : period === '6h' ? 6 : 24;

  const data = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    data.push({
      timestamp: new Date(now - i * 3600000).toISOString(),
      count: Math.floor(Math.random() * 50),
      types: {
        '4xx': Math.floor(Math.random() * 30),
        '5xx': Math.floor(Math.random() * 20),
        timeout: Math.floor(Math.random() * 10),
      },
    });
  }

  res.json({
    data,
    service,
    period,
  });
});

router.get('/slos', (req: Request, res: Response) => {
  res.json({
    data: [
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
    ],
  });
});

router.get('/costs', (req: Request, res: Response) => {
  res.json({
    data: {
      total: {
        daily: 365.4,
        weekly: 2557.8,
        monthly: 10962.0,
        trend: 5.2,
      },
      byService: [
        { service: 'API Gateway', daily: 45.2, weekly: 316.4, monthly: 1356.0, trend: -2.5 },
        { service: 'User Service', daily: 32.8, weekly: 229.6, monthly: 984.0, trend: 5.2 },
        { service: 'Payment Service', daily: 58.5, weekly: 409.5, monthly: 1755.0, trend: 12.3 },
        { service: 'Search Service', daily: 125.0, weekly: 875.0, monthly: 3750.0, trend: 8.7 },
        { service: 'Notification Service', daily: 18.3, weekly: 128.1, monthly: 549.0, trend: -1.2 },
        { service: 'Analytics Service', daily: 85.6, weekly: 599.2, monthly: 2568.0, trend: 15.8 },
      ],
      byResource: [
        { resource: 'Compute', monthly: 5500.0, percentage: 50.2 },
        { resource: 'Storage', monthly: 2200.0, percentage: 20.1 },
        { resource: 'Network', monthly: 1800.0, percentage: 16.4 },
        { resource: 'Database', monthly: 1462.0, percentage: 13.3 },
      ],
    },
  });
});

router.get('/cluster', (req: Request, res: Response) => {
  res.json({
    data: {
      nodes: [
        { id: 'node-1', name: 'worker-us-east-1a-001', status: 'healthy', cpu: 65, memory: 72, pods: 28, maxPods: 30, region: 'us-east-1' },
        { id: 'node-2', name: 'worker-us-east-1b-001', status: 'healthy', cpu: 45, memory: 58, pods: 22, maxPods: 30, region: 'us-east-1' },
        { id: 'node-3', name: 'worker-us-east-1c-001', status: 'degraded', cpu: 92, memory: 88, pods: 30, maxPods: 30, region: 'us-east-1' },
        { id: 'node-4', name: 'worker-us-west-2a-001', status: 'healthy', cpu: 35, memory: 42, pods: 15, maxPods: 30, region: 'us-west-2' },
      ],
      totalPods: 95,
      runningPods: 92,
      pendingPods: 3,
      failedPods: 0,
    },
  });
});

export { router as metricsRouter };
