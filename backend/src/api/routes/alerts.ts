import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

let alerts = [
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
];

router.get('/', (req: Request, res: Response) => {
  const { severity, service, acknowledged } = req.query;

  let filtered = alerts;

  if (severity && typeof severity === 'string') {
    filtered = filtered.filter((a) => a.severity === severity);
  }

  if (service && typeof service === 'string') {
    filtered = filtered.filter((a) => a.service === service);
  }

  if (acknowledged !== undefined) {
    const ack = acknowledged === 'true';
    filtered = filtered.filter((a) => a.acknowledged === ack);
  }

  res.json({
    data: filtered,
    total: filtered.length,
    unacknowledged: alerts.filter((a) => !a.acknowledged).length,
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const alert = alerts.find((a) => a.id === req.params.id);

  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  res.json({ data: alert });
});

router.patch('/:id/acknowledge', (req: Request, res: Response) => {
  const alert = alerts.find((a) => a.id === req.params.id);

  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  alert.acknowledged = true;

  res.json({ data: alert });
});

router.delete('/:id', (req: Request, res: Response) => {
  const index = alerts.findIndex((a) => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  alerts.splice(index, 1);

  res.json({ message: 'Alert deleted' });
});

router.post('/acknowledge-all', (req: Request, res: Response) => {
  alerts = alerts.map((a) => ({ ...a, acknowledged: true }));

  res.json({ message: 'All alerts acknowledged', count: alerts.length });
});

const alertRules = [
  {
    id: 'rule-1',
    name: 'High CPU Alert',
    metric: 'cpu_usage',
    condition: 'gt',
    threshold: 90,
    duration: '5m',
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'rule-2',
    name: 'High Memory Alert',
    metric: 'memory_usage',
    condition: 'gt',
    threshold: 85,
    duration: '5m',
    severity: 'high',
    enabled: true,
  },
  {
    id: 'rule-3',
    name: 'Error Rate Alert',
    metric: 'error_rate',
    condition: 'gt',
    threshold: 2,
    duration: '2m',
    severity: 'high',
    enabled: true,
  },
  {
    id: 'rule-4',
    name: 'Latency Alert',
    metric: 'latency_p99',
    condition: 'gt',
    threshold: 1000,
    duration: '5m',
    severity: 'medium',
    enabled: true,
  },
];

router.get('/rules', (req: Request, res: Response) => {
  res.json({ data: alertRules });
});

const createRuleSchema = z.object({
  name: z.string().min(1).max(100),
  metric: z.string(),
  condition: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
  threshold: z.number(),
  duration: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

router.post('/rules', (req: Request, res: Response) => {
  const result = createRuleSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const newRule = {
    id: `rule-${Date.now()}`,
    ...result.data,
    enabled: true,
  };

  res.status(201).json({ data: newRule });
});

export { router as alertsRouter };
