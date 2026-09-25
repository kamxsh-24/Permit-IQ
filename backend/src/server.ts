import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import logger from './utils/logger.js';
import apiRouter from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';
import prisma from './services/db.js';
import { PermitService } from './services/permitService.js';

export const app = express();

// Global Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Routes
app.use('/api', apiRouter);

// Root Welcome Endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'PTW CMMS Backend API Gateway',
    documentation: '/api/health',
    status: 'ACTIVE',
  });
});

// 404 Catch-All
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Operational route not found in CMMS API Gateway',
    },
    message: 'Operational route not found in CMMS API Gateway',
    timestamp: new Date().toISOString(),
  });
});

// Error Handling Middleware
app.use(errorHandler);

let server: any;
let expiryInterval: NodeJS.Timeout | null = null;

if (config.nodeEnv !== 'test') {
  server = app.listen(config.port, () => {
    logger.info(`PTW CMMS Server running on port ${config.port} (${config.nodeEnv})`);
    logger.info(`Health check accessible at: http://localhost:${config.port}/api/health`);
  });

  // Background permit expiry check every 60 seconds
  expiryInterval = setInterval(async () => {
    try {
      await PermitService.checkAndExpirePermits();
    } catch (err: any) {
      logger.error('Background expiry task failed:', err.message);
    }
  }, 60_000);
}

// Graceful Shutdown
async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  if (expiryInterval) clearInterval(expiryInterval);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await prisma.$disconnect();
      logger.info('Database connections closed cleanly.');
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
