import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger.js';

export function setupWebSocket(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('subscribe:service', (serviceId: string) => {
      socket.join(`service:${serviceId}`);
      logger.info(`Client ${socket.id} subscribed to service:${serviceId}`);
    });

    socket.on('subscribe:incidents', () => {
      socket.join('incidents');
      logger.info(`Client ${socket.id} subscribed to incidents`);
    });

    socket.on('subscribe:deployments', () => {
      socket.join('deployments');
      logger.info(`Client ${socket.id} subscribed to deployments`);
    });

    socket.on('subscribe:alerts', () => {
      socket.join('alerts');
      logger.info(`Client ${socket.id} subscribed to alerts`);
    });

    socket.on('subscribe:metrics', (serviceId?: string) => {
      const room = serviceId ? `metrics:${serviceId}` : 'metrics:global';
      socket.join(room);
      logger.info(`Client ${socket.id} subscribed to ${room}`);
    });

    socket.on('unsubscribe:service', (serviceId: string) => {
      socket.leave(`service:${serviceId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  setInterval(() => {
    const metrics = {
      timestamp: new Date().toISOString(),
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      requests: Math.floor(Math.random() * 1000),
      latency: Math.floor(Math.random() * 200),
    };

    io.to('metrics:global').emit('metrics:update', metrics);
  }, 5000);

  setInterval(() => {
    const services = ['API Gateway', 'User Service', 'Payment Service', 'Search Service'];
    const randomService = services[Math.floor(Math.random() * services.length)];

    const healthUpdate = {
      service: randomService,
      status: Math.random() > 0.9 ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
    };

    io.to(`service:${randomService}`).emit('service:health', healthUpdate);
  }, 10000);

  logger.info('WebSocket server initialized');
}

export function emitIncidentUpdate(io: SocketIOServer, incident: any) {
  io.to('incidents').emit('incident:update', incident);
}

export function emitDeploymentUpdate(io: SocketIOServer, deployment: any) {
  io.to('deployments').emit('deployment:update', deployment);
}

export function emitNewAlert(io: SocketIOServer, alert: any) {
  io.to('alerts').emit('alert:new', alert);
}

export function emitAlertResolved(io: SocketIOServer, alertId: string) {
  io.to('alerts').emit('alert:resolved', { id: alertId });
}
