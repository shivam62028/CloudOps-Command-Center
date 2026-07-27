import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { servicesRouter } from './api/routes/services.js';
import { incidentsRouter } from './api/routes/incidents.js';
import { deploymentsRouter } from './api/routes/deployments.js';
import { remediationsRouter } from './api/routes/remediations.js';
import { metricsRouter } from './api/routes/metrics.js';
import { alertsRouter } from './api/routes/alerts.js';
import { authRouter } from './api/routes/auth.js';
import { errorHandler } from './api/middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { setupWebSocket } from './services/websocket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/services', servicesRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/deployments', deploymentsRouter);
app.use('/api/remediations', remediationsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/alerts', alertsRouter);

app.use(errorHandler);

setupWebSocket(io);

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`WebSocket server ready`);
});

export { io };
