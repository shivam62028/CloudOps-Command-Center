import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

const deployments = [
  {
    id: 'dep-1',
    name: 'API Gateway v2.5.0',
    service: 'API Gateway',
    environment: 'production',
    version: 'v2.5.0',
    status: 'success',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3000000).toISOString(),
    triggeredBy: { id: 'u-1', name: 'John Doe', email: 'john@example.com' },
    commit: {
      sha: 'abc123f',
      message: 'feat: Add rate limiting middleware',
      author: 'John Doe',
    },
    stages: [
      { id: 's-1', name: 'Build', status: 'success' },
      { id: 's-2', name: 'Test', status: 'success' },
      { id: 's-3', name: 'Deploy', status: 'success' },
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
    triggeredBy: { id: 'u-2', name: 'Jane Smith', email: 'jane@example.com' },
    commit: {
      sha: 'def456a',
      message: 'fix: Resolve password reset token expiry',
      author: 'Jane Smith',
    },
    stages: [
      { id: 's-4', name: 'Build', status: 'success' },
      { id: 's-5', name: 'Test', status: 'success' },
      { id: 's-6', name: 'Deploy', status: 'running' },
    ],
  },
];

router.get('/', (req: Request, res: Response) => {
  const { status, service, environment } = req.query;

  let filtered = deployments;

  if (status && typeof status === 'string') {
    filtered = filtered.filter((d) => d.status === status);
  }

  if (service && typeof service === 'string') {
    filtered = filtered.filter((d) => d.service === service);
  }

  if (environment && typeof environment === 'string') {
    filtered = filtered.filter((d) => d.environment === environment);
  }

  res.json({
    data: filtered,
    total: filtered.length,
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const deployment = deployments.find((d) => d.id === req.params.id);

  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }

  res.json({ data: deployment });
});

router.get('/:id/logs', (req: Request, res: Response) => {
  const deployment = deployments.find((d) => d.id === req.params.id);

  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }

  const logs = [
    { timestamp: new Date().toISOString(), level: 'info', message: 'Starting deployment...' },
    { timestamp: new Date().toISOString(), level: 'info', message: 'Building Docker image...' },
    { timestamp: new Date().toISOString(), level: 'info', message: 'Image built successfully' },
    { timestamp: new Date().toISOString(), level: 'info', message: 'Running tests...' },
    { timestamp: new Date().toISOString(), level: 'info', message: 'All tests passed (42/42)' },
    { timestamp: new Date().toISOString(), level: 'info', message: 'Deploying to Kubernetes...' },
    { timestamp: new Date().toISOString(), level: 'info', message: 'Rolling update in progress...' },
  ];

  res.json({ data: logs });
});

const createDeploymentSchema = z.object({
  service: z.string(),
  environment: z.enum(['development', 'staging', 'production']),
  version: z.string(),
  commit: z.object({
    sha: z.string(),
    message: z.string(),
    author: z.string(),
  }),
});

router.post('/', (req: Request, res: Response) => {
  const result = createDeploymentSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const newDeployment = {
    id: `dep-${Date.now()}`,
    name: `${result.data.service} ${result.data.version}`,
    ...result.data,
    status: 'pending' as const,
    startedAt: new Date().toISOString(),
    triggeredBy: { id: 'u-1', name: 'API User', email: 'api@example.com' },
    stages: [
      { id: `s-${Date.now()}-1`, name: 'Build', status: 'pending' as const },
      { id: `s-${Date.now()}-2`, name: 'Test', status: 'pending' as const },
      { id: `s-${Date.now()}-3`, name: 'Deploy', status: 'pending' as const },
    ],
  };

  res.status(201).json({ data: newDeployment });
});

router.post('/:id/rollback', (req: Request, res: Response) => {
  const deployment = deployments.find((d) => d.id === req.params.id);

  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }

  res.json({
    message: `Rollback initiated for ${deployment.name}`,
    rollbackDeploymentId: `dep-rollback-${Date.now()}`,
  });
});

router.post('/:id/cancel', (req: Request, res: Response) => {
  const deployment = deployments.find((d) => d.id === req.params.id);

  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }

  if (deployment.status !== 'running' && deployment.status !== 'pending') {
    return res.status(400).json({ error: 'Can only cancel running or pending deployments' });
  }

  res.json({ message: `Deployment ${deployment.id} cancelled` });
});

export { router as deploymentsRouter };
