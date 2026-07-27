import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

let remediations = [
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
    triggeredBy: { id: 'u-1', name: 'Jane Smith', email: 'jane@example.com' },
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
];

router.get('/', (req: Request, res: Response) => {
  const { status, type, service } = req.query;

  let filtered = remediations;

  if (status && typeof status === 'string') {
    filtered = filtered.filter((r) => r.status === status);
  }

  if (type && typeof type === 'string') {
    filtered = filtered.filter((r) => r.type === type);
  }

  if (service && typeof service === 'string') {
    filtered = filtered.filter((r) => r.service === service);
  }

  res.json({
    data: filtered,
    total: filtered.length,
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const remediation = remediations.find((r) => r.id === req.params.id);

  if (!remediation) {
    return res.status(404).json({ error: 'Remediation not found' });
  }

  res.json({ data: remediation });
});

const triggerRemediationSchema = z.object({
  type: z.enum(['restart', 'scale', 'rollback', 'clear-cache', 'custom']),
  service: z.string(),
  description: z.string().optional(),
  params: z.record(z.any()).optional(),
});

router.post('/trigger', (req: Request, res: Response) => {
  const result = triggerRemediationSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const typeNames = {
    restart: 'Restart Pods',
    scale: 'Scale Service',
    rollback: 'Rollback Deployment',
    'clear-cache': 'Clear Cache',
    custom: 'Custom Script',
  };

  const newRemediation = {
    id: `rem-${Date.now()}`,
    name: `${typeNames[result.data.type]} - ${result.data.service}`,
    description: result.data.description || `${typeNames[result.data.type]} for ${result.data.service}`,
    type: result.data.type,
    service: result.data.service,
    status: 'running' as const,
    triggeredBy: { id: 'u-1', name: 'API User', email: 'api@example.com' },
    startedAt: new Date().toISOString(),
    logs: [`[INFO] Starting ${result.data.type} operation...`],
  };

  remediations.unshift(newRemediation);

  res.status(201).json({ data: newRemediation });
});

router.get('/:id/logs', (req: Request, res: Response) => {
  const remediation = remediations.find((r) => r.id === req.params.id);

  if (!remediation) {
    return res.status(404).json({ error: 'Remediation not found' });
  }

  res.json({ data: remediation.logs });
});

router.post('/:id/cancel', (req: Request, res: Response) => {
  const remediation = remediations.find((r) => r.id === req.params.id);

  if (!remediation) {
    return res.status(404).json({ error: 'Remediation not found' });
  }

  if (remediation.status !== 'running' && remediation.status !== 'pending') {
    return res.status(400).json({ error: 'Can only cancel running or pending remediations' });
  }

  remediation.status = 'failed' as any;
  remediation.logs.push('[WARN] Remediation cancelled by user');

  res.json({ message: 'Remediation cancelled', data: remediation });
});

const runbookTemplates = [
  {
    id: 'rb-1',
    name: 'Service Recovery',
    description: 'Standard service recovery procedure',
    steps: [
      'Check service health endpoints',
      'Review recent logs for errors',
      'Check resource utilization',
      'Restart pods if necessary',
      'Verify recovery',
    ],
  },
  {
    id: 'rb-2',
    name: 'Database Connection Recovery',
    description: 'Reset database connection pool',
    steps: [
      'Check active connections',
      'Kill idle connections',
      'Restart service pods',
      'Monitor connection pool',
    ],
  },
  {
    id: 'rb-3',
    name: 'Cache Clear',
    description: 'Clear application and CDN caches',
    steps: [
      'Flush Redis cache',
      'Clear CDN cache',
      'Warm critical endpoints',
      'Verify response times',
    ],
  },
];

router.get('/runbooks/templates', (req: Request, res: Response) => {
  res.json({ data: runbookTemplates });
});

export { router as remediationsRouter };
