import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

const services = [
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
    name: 'Search Service',
    status: 'critical',
    uptime: 85.0,
    latency: 1500,
    errorRate: 15.0,
    lastCheck: new Date().toISOString(),
    environment: 'production',
    region: 'us-east-1',
  },
];

router.get('/', (req: Request, res: Response) => {
  const { status, environment } = req.query;

  let filtered = services;

  if (status && typeof status === 'string') {
    filtered = filtered.filter((s) => s.status === status);
  }

  if (environment && typeof environment === 'string') {
    filtered = filtered.filter((s) => s.environment === environment);
  }

  res.json({
    data: filtered,
    total: filtered.length,
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const service = services.find((s) => s.id === req.params.id);

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.json({ data: service });
});

router.get('/:id/metrics', (req: Request, res: Response) => {
  const { period = '24h' } = req.query;

  const generateMetrics = (hours: number) => {
    const data = [];
    const now = Date.now();
    for (let i = hours; i >= 0; i--) {
      data.push({
        timestamp: new Date(now - i * 3600000).toISOString(),
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        requests: Math.floor(Math.random() * 10000 + 5000),
        errors: Math.floor(Math.random() * 100),
        latency: Math.floor(Math.random() * 200 + 50),
      });
    }
    return data;
  };

  const hours = period === '1h' ? 1 : period === '6h' ? 6 : period === '24h' ? 24 : 24;

  res.json({
    serviceId: req.params.id,
    period,
    metrics: generateMetrics(hours),
  });
});

router.post('/:id/restart', (req: Request, res: Response) => {
  const service = services.find((s) => s.id === req.params.id);

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.json({
    message: `Restart initiated for ${service.name}`,
    jobId: `job-${Date.now()}`,
  });
});

router.post('/:id/scale', (req: Request, res: Response) => {
  const scaleSchema = z.object({
    replicas: z.number().min(1).max(20),
  });

  const result = scaleSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const service = services.find((s) => s.id === req.params.id);

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.json({
    message: `Scaling ${service.name} to ${result.data.replicas} replicas`,
    jobId: `job-${Date.now()}`,
  });
});

export { router as servicesRouter };
