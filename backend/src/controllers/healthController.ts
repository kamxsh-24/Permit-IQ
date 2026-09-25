import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../services/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export async function getHealth(_req: Request, res: Response): Promise<Response> {
  const dbHealth = await checkDatabaseConnection();

  const healthData = {
    service: 'Permit-to-Work CMMS Backend',
    version: '1.0.0',
    status: dbHealth.connected ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      type: 'PostgreSQL',
      connected: dbHealth.connected,
      latencyMs: dbHealth.latencyMs,
      error: dbHealth.error,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    },
  };

  if (!dbHealth.connected) {
    return sendError(res, 'Database connection is degraded', 503, 'SERVICE_UNAVAILABLE', healthData);
  }

  return sendSuccess(res, healthData, 'PTW CMMS Backend is operating normally');
}
