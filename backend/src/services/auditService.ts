import prisma from './db.js';
import logger from '../utils/logger.js';

export interface CreateAuditLogParams {
  permitId: string;
  whoId: string;
  action: string;
  fromValue?: string | null;
  toValue?: string | null;
  comment?: string | null;
}

/**
 * Service for managing immutable permit audit trails.
 * Notice: Only create and read operations are exposed.
 * Updates and deletions are strictly excluded to preserve regulatory compliance (OSHA / ISO 45001).
 */
export const auditService = {
  async log(params: CreateAuditLogParams) {
    try {
      const record = await prisma.permitAuditLog.create({
        data: {
          permitId: params.permitId,
          whoId: params.whoId,
          action: params.action,
          fromValue: params.fromValue ?? undefined,
          toValue: params.toValue ?? undefined,
          comment: params.comment ?? undefined,
        },
      });
      logger.info(`Audit log recorded for Permit ${params.permitId}: ${params.action}`, {
        auditId: record.id,
        who: params.whoId,
      });
      return record;
    } catch (error: any) {
      logger.error('Failed to create audit log entry:', error.message);
      // In production EHS systems, audit failures trigger high-priority alerts
      throw error;
    }
  },

  async getAuditTrailByPermit(permitId: string) {
    return prisma.permitAuditLog.findMany({
      where: { permitId },
      include: {
        who: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  },
};

export default auditService;
