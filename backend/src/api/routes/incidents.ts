import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

let incidents = [
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
    ],
  },
  {
    id: 'inc-2',
    title: 'Payment processing delays',
    description: 'Payment confirmations delayed by 30+ seconds',
    severity: 'high',
    status: 'acknowledged',
    service: 'Payment Service',
    assignee: { id: 'u-1', name: 'Jane Smith', email: 'jane@example.com' },
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    timeline: [],
  },
];

router.get('/', (req: Request, res: Response) => {
  const { status, severity } = req.query;

  let filtered = incidents;

  if (status && typeof status === 'string') {
    filtered = filtered.filter((i) => i.status === status);
  }

  if (severity && typeof severity === 'string') {
    filtered = filtered.filter((i) => i.severity === severity);
  }

  res.json({
    data: filtered,
    total: filtered.length,
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const incident = incidents.find((i) => i.id === req.params.id);

  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  res.json({ data: incident });
});

const createIncidentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  service: z.string(),
});

router.post('/', (req: Request, res: Response) => {
  const result = createIncidentSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const newIncident = {
    id: `inc-${Date.now()}`,
    ...result.data,
    status: 'open' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      {
        id: `evt-${Date.now()}`,
        type: 'created' as const,
        message: 'Incident created manually',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  incidents.unshift(newIncident);

  res.status(201).json({ data: newIncident });
});

router.patch('/:id/acknowledge', (req: Request, res: Response) => {
  const incident = incidents.find((i) => i.id === req.params.id);

  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  incident.status = 'acknowledged';
  incident.updatedAt = new Date().toISOString();
  (incident as any).acknowledgedAt = new Date().toISOString();
  incident.timeline.push({
    id: `evt-${Date.now()}`,
    type: 'acknowledged',
    message: 'Incident acknowledged',
    timestamp: new Date().toISOString(),
  });

  res.json({ data: incident });
});

router.patch('/:id/resolve', (req: Request, res: Response) => {
  const incident = incidents.find((i) => i.id === req.params.id);

  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  incident.status = 'resolved';
  incident.updatedAt = new Date().toISOString();
  (incident as any).resolvedAt = new Date().toISOString();
  incident.timeline.push({
    id: `evt-${Date.now()}`,
    type: 'resolved',
    message: 'Incident resolved',
    timestamp: new Date().toISOString(),
  });

  res.json({ data: incident });
});

router.post('/:id/comment', (req: Request, res: Response) => {
  const commentSchema = z.object({
    message: z.string().min(1).max(2000),
  });

  const result = commentSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const incident = incidents.find((i) => i.id === req.params.id);

  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  incident.timeline.push({
    id: `evt-${Date.now()}`,
    type: 'comment',
    message: result.data.message,
    timestamp: new Date().toISOString(),
  });

  incident.updatedAt = new Date().toISOString();

  res.json({ data: incident });
});

export { router as incidentsRouter };
