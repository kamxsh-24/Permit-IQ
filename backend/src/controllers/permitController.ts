import { Request, Response, NextFunction } from 'express';
import { PermitService } from '../services/permitService.js';
import { createPermitSchema, updatePermitSchema } from '../validators/permit.js';
import { sendSuccess, AppError } from '../utils/apiResponse.js';
import { PermitStatus, PermitType } from '../types/index.js';

export class PermitController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        status: req.query.status as PermitStatus | undefined,
        type: req.query.type as PermitType | undefined,
        plantId: req.query.plantId as string | undefined,
        areaId: req.query.areaId as string | undefined,
        search: req.query.search as string | undefined,
        myApprovalsPending: req.query.myApprovalsPending === 'true',
        myPermits: req.query.myPermits === 'true',
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
      };

      const permits = await PermitService.listPermits(filters, req.user);
      sendSuccess(res, permits, 'Permits retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permit = await PermitService.getPermitById(req.params.id);
      sendSuccess(res, permit, 'Permit details retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');

      const validatedData = createPermitSchema.parse(req.body);
      const permit = await PermitService.createPermit(validatedData, req.user);
      sendSuccess(res, permit, 'Permit created as DRAFT', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');

      if ((req.body as any).status !== undefined) {
        throw new AppError(
          'Status modification via PATCH is prohibited. State transitions must utilize dedicated workflow endpoints (/submit, /activate, /close, etc.)',
          400,
          'STATUS_MODIFICATION_PROHIBITED'
        );
      }

      const validatedData = updatePermitSchema.parse(req.body);
      const permit = await PermitService.updatePermit(req.params.id, validatedData, req.user);
      sendSuccess(res, permit, 'Permit updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const permit = await PermitService.submitPermit(req.params.id, req.user);
      sendSuccess(res, permit, 'Permit submitted for authorization');
    } catch (error) {
      next(error);
    }
  }

  public static async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const { comment } = req.body;
      const permit = await PermitService.approvePermit(req.params.id, req.user, comment);
      sendSuccess(res, permit, 'Permit approval decision recorded');
    } catch (error) {
      next(error);
    }
  }

  public static async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const { reason } = req.body;
      const permit = await PermitService.rejectPermit(req.params.id, req.user, reason);
      sendSuccess(res, permit, 'Permit rejected');
    } catch (error) {
      next(error);
    }
  }

  public static async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const permit = await PermitService.activatePermit(req.params.id, req.user);
      sendSuccess(res, permit, 'Permit activated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async suspend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const { reason } = req.body;
      const permit = await PermitService.suspendPermit(req.params.id, req.user, reason);
      sendSuccess(res, permit, 'Permit suspended');
    } catch (error) {
      next(error);
    }
  }

  public static async resume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const { comment } = req.body;
      const permit = await PermitService.resumePermit(req.params.id, req.user, comment);
      sendSuccess(res, permit, 'Permit resumed');
    } catch (error) {
      next(error);
    }
  }

  public static async close(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const { completionNotes } = req.body;
      const permit = await PermitService.closePermit(req.params.id, req.user, completionNotes);
      sendSuccess(res, permit, 'Permit marked completed and closed. Pending safety verification.');
    } catch (error) {
      next(error);
    }
  }

  public static async verifyClosure(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const { verificationComment } = req.body;
      const permit = await PermitService.verifyClosure(req.params.id, req.user, verificationComment);
      sendSuccess(res, permit, 'Permit closure verified and finalized');
    } catch (error) {
      next(error);
    }
  }

  public static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const { reason } = req.body;
      const permit = await PermitService.cancelPermit(req.params.id, req.user, reason);
      sendSuccess(res, permit, 'Permit cancelled');
    } catch (error) {
      next(error);
    }
  }

  public static async getPendingApprovals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permits = await PermitService.listPermits({ myApprovalsPending: true }, req.user);
      sendSuccess(res, permits, 'Pending approvals retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await PermitService.getDashboardStats(req.user);
      sendSuccess(res, stats, 'Dashboard statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async checkConflicts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { areaId, plannedStart, plannedEnd, type, excludePermitId } = req.query;
      if (!areaId || !plannedStart || !plannedEnd || !type) {
        throw new AppError('areaId, plannedStart, plannedEnd, and type query params are required', 400, 'VALIDATION_ERROR');
      }

      const conflicts = await PermitService.checkConflicts({
        areaId: areaId as string,
        plannedStart: new Date(plannedStart as string),
        plannedEnd: new Date(plannedEnd as string),
        type: type as PermitType,
        excludePermitId: excludePermitId as string | undefined,
      });

      sendSuccess(res, conflicts, 'Conflict analysis completed');
    } catch (error) {
      next(error);
    }
  }
}
