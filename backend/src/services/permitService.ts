import { prisma } from './db.js';
import {
  PermitStatus,
  PermitType,
  UserRole,
  ApprovalStatus,
  JWTPayload,
} from '../types/index.js';
import { PermitStateMachine } from './permitStateMachine.js';
import { auditService } from './auditService.js';
import { AppError } from '../utils/apiResponse.js';
import { validateTypeSpecificData } from '../validators/permit.js';
import logger from '../utils/logger.js';

export interface PermitFilterParams {
  status?: PermitStatus;
  type?: PermitType;
  plantId?: string;
  areaId?: string;
  search?: string;
  myApprovalsPending?: boolean;
  myPermits?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export class PermitService {
  /**
   * Automatically expires any ACTIVE, APPROVED, or SUSPENDED permits whose plannedEnd has passed.
   * Runs lazily on permit access and via periodic server timers.
   */
  public static async checkAndExpirePermits(): Promise<number> {
    try {
      const now = new Date();
      const expiredPermits = await prisma.permit.findMany({
        where: {
          status: { in: [PermitStatus.ACTIVE, PermitStatus.APPROVED, PermitStatus.SUSPENDED] },
          plannedEnd: { lt: now },
        },
        select: { id: true, status: true, permitNumber: true, requesterId: true },
      });

      if (expiredPermits.length === 0) return 0;

      for (const permit of expiredPermits) {
        await prisma.permit.update({
          where: { id: permit.id },
          data: { status: PermitStatus.EXPIRED },
        });

        await auditService.log({
          permitId: permit.id,
          whoId: permit.requesterId, // Attribution to requester context
          action: 'PERMIT_EXPIRED',
          fromValue: permit.status,
          toValue: PermitStatus.EXPIRED,
          comment: `System automatically expired permit ${permit.permitNumber} because validity period ended (${now.toISOString()})`,
        });
      }

      logger.info(`Auto-expired ${expiredPermits.length} permit(s) exceeding validity window`);
      return expiredPermits.length;
    } catch (err: any) {
      logger.error('Error during auto-expire permits check:', err.message);
      return 0;
    }
  }

  /**
   * Retrieves all permits matching filters with live auto-expiry evaluation.
   */
  public static async listPermits(filters: PermitFilterParams, user?: JWTPayload) {
    // Lazily evaluate validity windows to ensure 100% accurate status reporting
    await this.checkAndExpirePermits();

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.plantId) {
      where.plantId = filters.plantId;
    }

    if (filters.areaId) {
      where.areaId = filters.areaId;
    }

    if (filters.myPermits && user) {
      where.requesterId = user.userId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.plannedStart = {};
      if (filters.dateFrom) where.plannedStart.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.plannedStart.lte = new Date(filters.dateTo);
    }

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { permitNumber: { contains: q, mode: 'insensitive' } },
        { workDescription: { contains: q, mode: 'insensitive' } },
        { contractorTeam: { contains: q, mode: 'insensitive' } },
        { requester: { name: { contains: q, mode: 'insensitive' } } },
        { equipment: { name: { contains: q, mode: 'insensitive' } } },
        { equipment: { equipmentTag: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // Role-specific "My Approvals Pending" filter
    if (filters.myApprovalsPending && user) {
      where.status = PermitStatus.PENDING_APPROVAL;
      // Cannot approve own permit
      where.requesterId = { not: user.userId };

      if (user.role === UserRole.AREA_OWNER) {
        if (user.areaId) {
          where.areaId = user.areaId;
        }
      }

      // Filter out permits where this user has already submitted an approval decision
      where.approvals = {
        none: {
          approverId: user.userId,
        },
      };
    }

    return prisma.permit.findMany({
      where,
      include: {
        plant: { select: { id: true, name: true, code: true } },
        area: { select: { id: true, name: true } },
        equipment: { select: { id: true, name: true, equipmentTag: true } },
        requester: { select: { id: true, name: true, email: true, role: true } },
        approvals: {
          include: {
            approver: { select: { id: true, name: true, role: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetches single permit by ID with full details, approvals, and timeline.
   */
  public static async getPermitById(id: string) {
    await this.checkAndExpirePermits();

    const permit = await prisma.permit.findUnique({
      where: { id },
      include: {
        plant: true,
        area: true,
        equipment: true,
        requester: {
          select: { id: true, name: true, email: true, role: true, areaId: true },
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        auditLogs: {
          include: {
            who: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!permit) {
      throw new AppError(`Permit with ID '${id}' not found`, 404, 'NOT_FOUND');
    }

    return permit;
  }

  /**
   * Generates sequential or timestamped industrial permit number (e.g. PTW-2026-0042)
   */
  private static async generatePermitNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.permit.count();
    const sequence = String(count + 1).padStart(4, '0');
    return `PTW-${year}-${sequence}`;
  }

  /**
   * Detects spatial-temporal safety conflicts between hazardous permits (e.g. HOT_WORK + CONFINED_SPACE in same area).
   */
  public static async checkConflicts(params: {
    areaId: string;
    plannedStart: Date;
    plannedEnd: Date;
    type: PermitType;
    excludePermitId?: string;
  }) {
    const conflicts: any[] = [];
    const highRiskPairs: [PermitType, PermitType][] = [
      [PermitType.HOT_WORK, PermitType.CONFINED_SPACE],
      [PermitType.CONFINED_SPACE, PermitType.HOT_WORK],
    ];

    const opposingTypes = highRiskPairs
      .filter(([t1]) => t1 === params.type)
      .map(([, t2]) => t2);

    if (opposingTypes.length > 0) {
      const overlappingPermits = await prisma.permit.findMany({
        where: {
          id: params.excludePermitId ? { not: params.excludePermitId } : undefined,
          areaId: params.areaId,
          type: { in: opposingTypes },
          status: { in: [PermitStatus.ACTIVE, PermitStatus.APPROVED, PermitStatus.PENDING_APPROVAL] },
          AND: [
            { plannedStart: { lte: params.plannedEnd } },
            { plannedEnd: { gte: params.plannedStart } },
          ],
        },
        include: {
          area: true,
          requester: { select: { name: true, email: true } },
        },
      });

      for (const p of overlappingPermits) {
        conflicts.push({
          permitId: p.id,
          permitNumber: p.permitNumber,
          type: p.type,
          status: p.status,
          severity: 'CRITICAL',
          message: `High-risk conflict: Concurrent ${params.type} requested in Area '${p.area.name}' while ${p.type} (${p.permitNumber}) is ${p.status}. Simultaneous hot work and confined space entry introduces severe explosion/toxic hazards.`,
        });
      }
    }

    return conflicts;
  }

  /**
   * Creates a new permit in DRAFT status.
   */
  public static async createPermit(data: any, user: JWTPayload) {
    const permitNumber = data.permitNumber || (await this.generatePermitNumber());

    // Validate type-specific data
    const validatedTypeData = validateTypeSpecificData(data.type, data.typeSpecificData);

    const permit = await prisma.permit.create({
      data: {
        permitNumber,
        type: data.type,
        status: PermitStatus.DRAFT,
        requesterId: user.userId,
        contractorTeam: data.contractorTeam,
        workDescription: data.workDescription,
        plantId: data.plantId,
        areaId: data.areaId,
        equipmentId: data.equipmentId || null,
        plannedStart: new Date(data.plannedStart),
        plannedEnd: new Date(data.plannedEnd),
        hazards: data.hazards,
        ppeRequired: data.ppeRequired,
        precautions: data.precautions,
        typeSpecificData: validatedTypeData,
      },
      include: {
        plant: true,
        area: true,
        equipment: true,
        requester: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    // Record immutable audit entry
    await auditService.log({
      permitId: permit.id,
      whoId: user.userId,
      action: 'PERMIT_CREATED',
      fromValue: null,
      toValue: PermitStatus.DRAFT,
      comment: `${user.name} (${user.role}) initiated draft permit ${permit.permitNumber} for ${permit.type}`,
    });

    return permit;
  }

  /**
   * Updates an existing permit. Only permits in DRAFT can be modified normally.
   */
  public static async updatePermit(id: string, data: any, user: JWTPayload) {
    const permit = await prisma.permit.findUnique({ where: { id } });
    if (!permit) {
      throw new AppError(`Permit '${id}' not found`, 404, 'NOT_FOUND');
    }

    // Direct status modification via PATCH is strictly forbidden
    if (data.status !== undefined && data.status !== permit.status) {
      throw new AppError(
        'Status modification via PATCH is prohibited. State transitions must utilize dedicated workflow endpoints (/submit, /activate, /close, etc.)',
        400,
        'STATUS_MODIFICATION_PROHIBITED'
      );
    }

    // Only DRAFT permits can be edited
    if (permit.status !== PermitStatus.DRAFT) {
      throw new AppError(
        `Permit is in status '${permit.status}'. Only permits in 'DRAFT' status can be modified directly.`,
        400,
        'ILLEGAL_EDIT'
      );
    }

    // Requester ownership or Admin required
    if (permit.requesterId !== user.userId && user.role !== UserRole.ADMIN) {
      throw new AppError('Only the permit creator or an administrator can modify this draft permit', 403, 'FORBIDDEN');
    }

    let updatedTypeData = permit.typeSpecificData;
    if (data.typeSpecificData) {
      updatedTypeData = validateTypeSpecificData(permit.type, data.typeSpecificData);
    }

    const updated = await prisma.permit.update({
      where: { id },
      data: {
        contractorTeam: data.contractorTeam ?? permit.contractorTeam,
        workDescription: data.workDescription ?? permit.workDescription,
        plantId: data.plantId ?? permit.plantId,
        areaId: data.areaId ?? permit.areaId,
        equipmentId: data.equipmentId !== undefined ? data.equipmentId : permit.equipmentId,
        plannedStart: data.plannedStart ? new Date(data.plannedStart) : permit.plannedStart,
        plannedEnd: data.plannedEnd ? new Date(data.plannedEnd) : permit.plannedEnd,
        hazards: data.hazards ?? permit.hazards,
        ppeRequired: data.ppeRequired ?? permit.ppeRequired,
        precautions: data.precautions ?? permit.precautions,
        typeSpecificData: updatedTypeData as any,
      },
      include: {
        plant: true,
        area: true,
        equipment: true,
        requester: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await auditService.log({
      permitId: id,
      whoId: user.userId,
      action: 'PERMIT_EDITED',
      fromValue: PermitStatus.DRAFT,
      toValue: PermitStatus.DRAFT,
      comment: `${user.name} updated draft parameters`,
    });

    return updated;
  }

  /**
   * Submits a DRAFT permit for authorization: DRAFT -> PENDING_APPROVAL.
   */
  public static async submitPermit(id: string, user: JWTPayload) {
    const permit = await prisma.permit.findUnique({ where: { id } });
    if (!permit) throw new AppError(`Permit '${id}' not found`, 404, 'NOT_FOUND');

    PermitStateMachine.validateTransition(permit.status, PermitStatus.PENDING_APPROVAL);

    if (permit.requesterId !== user.userId && user.role !== UserRole.ADMIN) {
      throw new AppError('Only the permit requester or an admin can submit this permit', 403, 'FORBIDDEN');
    }

    const updated = await prisma.permit.update({
      where: { id },
      data: { status: PermitStatus.PENDING_APPROVAL },
      include: {
        plant: true,
        area: true,
        equipment: true,
        requester: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await auditService.log({
      permitId: id,
      whoId: user.userId,
      action: 'PERMIT_SUBMITTED',
      fromValue: PermitStatus.DRAFT,
      toValue: PermitStatus.PENDING_APPROVAL,
      comment: `${user.name} (${user.role}) submitted permit ${permit.permitNumber} for authorization. Sign-off required by Area Owner and Safety Officer.`,
    });

    return updated;
  }

  /**
   * Approves a permit in PENDING_APPROVAL status.
   * Multi-stage authorization: Area Owner AND Safety Officer (or Admin) required.
   */
  public static async approvePermit(id: string, user: JWTPayload, comment?: string) {
    const permit = await prisma.permit.findUnique({
      where: { id },
      include: {
        area: true,
        approvals: true,
      },
    });

    if (!permit) throw new AppError(`Permit '${id}' not found`, 404, 'NOT_FOUND');

    if (permit.status !== PermitStatus.PENDING_APPROVAL) {
      throw new AppError(
        `Permit cannot be approved because it is in status '${permit.status}'. Only PENDING_APPROVAL permits can be approved.`,
        400,
        'INVALID_STATE_TRANSITION'
      );
    }

    // CRITICAL: Prevent self-approval
    if (permit.requesterId === user.userId) {
      throw new AppError(
        'Self-Approval Violation: Requesters are strictly prohibited from approving their own permit applications under OSHA/ISO safety compliance.',
        403,
        'SELF_APPROVAL_FORBIDDEN'
      );
    }

    // Role-based authorization
    if (user.role === UserRole.REQUESTER) {
      throw new AppError('Requesters do not hold authorization sign-off privileges', 403, 'FORBIDDEN');
    }

    if (user.role === UserRole.AREA_OWNER) {
      if (!user.areaId || user.areaId !== permit.areaId) {
        throw new AppError(
          `Area Owner authority mismatch: You are assigned to area '${user.areaId}', but permit belongs to area '${permit.areaId}' (${permit.area.name}).`,
          403,
          'FORBIDDEN'
        );
      }
    }

    // Check duplicate approval by this user
    const existingUserApproval = permit.approvals.find((a) => a.approverId === user.userId);
    if (existingUserApproval && existingUserApproval.status === ApprovalStatus.APPROVED) {
      throw new AppError('You have already recorded an approval for this permit', 400, 'DUPLICATE_APPROVAL');
    }

    // Record or update approval entry
    const approval = await prisma.permitApproval.create({
      data: {
        permitId: id,
        approverId: user.userId,
        role: user.role,
        status: ApprovalStatus.APPROVED,
        comment: comment ?? 'Approved in accordance with site safety procedures',
        approvedAt: new Date(),
      },
    });

    // Check if both required roles (AREA_OWNER and SAFETY_OFFICER) or an ADMIN have approved
    const allApprovals = [...permit.approvals, approval];
    const hasAreaApproval = allApprovals.some((a) => (a.role === UserRole.AREA_OWNER || a.role === UserRole.ADMIN) && a.status === ApprovalStatus.APPROVED);
    const hasSafetyApproval = allApprovals.some((a) => (a.role === UserRole.SAFETY_OFFICER || a.role === UserRole.ADMIN) && a.status === ApprovalStatus.APPROVED);

    let newStatus: PermitStatus = permit.status;
    if (hasAreaApproval && hasSafetyApproval) {
      newStatus = PermitStatus.APPROVED;
      await prisma.permit.update({
        where: { id },
        data: { status: PermitStatus.APPROVED },
      });

      await auditService.log({
        permitId: id,
        whoId: user.userId,
        action: 'PERMIT_APPROVED',
        fromValue: PermitStatus.PENDING_APPROVAL,
        toValue: PermitStatus.APPROVED,
        comment: `All required authorizations met. Permit ${permit.permitNumber} is fully APPROVED for work activation.`,
      });
    } else {
      await auditService.log({
        permitId: id,
        whoId: user.userId,
        action: 'STAGE_APPROVED',
        fromValue: PermitStatus.PENDING_APPROVAL,
        toValue: PermitStatus.PENDING_APPROVAL,
        comment: `${user.name} (${user.role}) recorded stage sign-off. Waiting for remaining required authorization.`,
      });
    }

    return this.getPermitById(id);
  }

  /**
   * Rejects a permit in PENDING_APPROVAL. Rejection reason is mandatory.
   */
  public static async rejectPermit(id: string, user: JWTPayload, rejectionReason: string) {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      throw new AppError('A valid rejection reason with at least 5 characters is mandatory', 400, 'VALIDATION_ERROR');
    }

    const permit = await prisma.permit.findUnique({
      where: { id },
      include: { area: true },
    });

    if (!permit) throw new AppError(`Permit '${id}' not found`, 404, 'NOT_FOUND');

    if (permit.status !== PermitStatus.PENDING_APPROVAL) {
      throw new AppError(
        `Cannot reject permit in status '${permit.status}'. Only PENDING_APPROVAL permits can be rejected.`,
        400,
        'INVALID_STATE_TRANSITION'
      );
    }

    if (user.role === UserRole.REQUESTER) {
      throw new AppError('Requesters cannot reject permits. Requesters can CANCEL their permits instead.', 403, 'FORBIDDEN');
    }

    if (user.role === UserRole.AREA_OWNER && user.areaId !== permit.areaId) {
      throw new AppError('Area Owners can only reject permits in their designated plant area', 403, 'FORBIDDEN');
    }

    await prisma.permitApproval.create({
      data: {
        permitId: id,
        approverId: user.userId,
        role: user.role,
        status: ApprovalStatus.REJECTED,
        rejectionReason: rejectionReason.trim(),
      },
    });

    const updated = await prisma.permit.update({
      where: { id },
      data: { status: PermitStatus.REJECTED },
    });

    await auditService.log({
      permitId: id,
      whoId: user.userId,
      action: 'PERMIT_REJECTED',
      fromValue: PermitStatus.PENDING_APPROVAL,
      toValue: PermitStatus.REJECTED,
      comment: `Permit rejected by ${user.name} (${user.role}). Reason: ${rejectionReason.trim()}`,
    });

    return updated;
  }

  /**
   * Activates an APPROVED permit on site: APPROVED -> ACTIVE.
   */
  public static async activatePermit(id: string, user: JWTPayload) {
    const permit = await prisma.permit.findUnique({ where: { id } });
    if (!permit) throw new AppError(`Permit '${id}' not found`, 404, 'NOT_FOUND');

    PermitStateMachine.validateTransition(permit.status, PermitStatus.ACTIVE);
    PermitStateMachine.validateActivationWindow(permit.plannedStart, permit.plannedEnd);

    if (permit.requesterId !== user.userId && user.role !== UserRole.ADMIN && user.role !== UserRole.SAFETY_OFFICER) {
      throw new AppError('Only the permit requester, safety officer, or admin can activate this permit', 403, 'FORBIDDEN');
    }

    const updated = await prisma.permit.update({
      where: { id },
      data: { status: PermitStatus.ACTIVE },
    });

    await auditService.log({
      permitId: id,
      whoId: user.userId,
      action: 'PERMIT_ACTIVATED',
      fromValue: PermitStatus.APPROVED,
      toValue: PermitStatus.ACTIVE,
      comment: `Field execution activated by ${user.name} (${user.role}). Work may now proceed in accordance with permit controls.`,
    });

    return updated;
  }

  /**
   * Suspends an ACTIVE permit: ACTIVE -> SUSPENDED.
   */
  public static async suspendPermit(id: string, user: JWTPayload, reason: string) {
    if (!reason || reason.trim().length < 5) {
      throw new AppError('A clear explanation for suspension is required (minimum 5 characters)', 400, 'VALIDATION_ERROR');
    }

    const permit = await prisma.permit.findUnique({ where: { id } });
    if (!permit) throw new AppError(`Permit '${id}' not found`, 404, 'NOT_FOUND');

    PermitStateMachine.validateTransition(permit.status, PermitStatus.SUSPENDED);

    if (user.role !== UserRole.SAFETY_OFFICER && user.role !== UserRole.ADMIN && user.role !== UserRole.AREA_OWNER) {
      throw new AppError('Only Safety Officers, Area Owners, or Admins have authority to suspend active permits', 403, 'FORBIDDEN');
    }

    const updated = await prisma.permit.update({
      where: { id },
      data: { status: PermitStatus.SUSPENDED },
    });

    await auditService.log({
      permitId: id,
      whoId: user.userId,
      action: 'PERMIT_SUSPENDED',
      fromValue: PermitStatus.ACTIVE,
      toValue: PermitStatus.SUSPENDED,
      comment: `Site operations suspended by ${user.name} (${user.role}). Reason: ${reason.trim()}`,
    });

    return updated;
  }

  /**
   * Resumes a SUSPENDED permit: SUSPENDED -> ACTIVE.
   */
  public static async resumePermit(id: string, user: JWTPayload, comment?: string) {
    const permit = await prisma.permit.findUnique({ where: { id } });
    if (!permit) throw new AppError(`Permit '${id}' not found`, 404, 'NOT_FOUND');

    PermitStateMachine.validateTransition(permit.status, PermitStatus.ACTIVE);

    const now = new Date();
    if (now > permit.plannedEnd) {
      throw new AppError('Cannot resume permit: validity window has expired. A new permit must be raised.', 400, 'EXPIRED_PERMIT');
    }

    if (user.role !== UserRole.SAFETY_OFFICER && user.role !== UserRole.ADMIN) {
      throw new AppError('Only Safety Officers or Admins can authorize resumption of a suspended permit', 403, 'FORBIDDEN');
    }

    const updated = await prisma.permit.update({
      where: { id },
      data: { status: PermitStatus.ACTIVE },
    });

    await auditService.log({
      permitId: id,
      whoId: user.userId,
      action: 'PERMIT_RESUMED',
      fromValue: PermitStatus.SUSPENDED,
      toValue: PermitStatus.ACTIVE,
      comment: `Work resumption authorized by ${user.name} (${user.role}). ${comment ?? 'Safety conditions reinstated.'}`,
    });

    return updated;
  }

  /**
   * Closes an ACTIVE permit: ACTIVE -> CLOSED. Requester must provide completion notes.
   */
  public static async closePermit(id: string, user: JWTPayload, completionNotes: string) {
    if (!completionNotes || completionNotes.trim().length < 5) {
      throw new AppError('Completion notes describing work execution and housekeeping status are mandatory', 400, 'VALIDATION_ERROR');
    }

    const permit = await prisma.permit.findUnique({ where: { id } });
    if (!permit) throw new AppError(`Permit '${id}' not found`, 404, 'NOT_FOUND');

    PermitStateMachine.validateTransition(permit.status, PermitStatus.CLOSED);

    if (permit.requesterId !== user.userId && user.role !== UserRole.ADMIN) {
      throw new AppError('Only the permit requester or an admin can submit permit completion', 403, 'FORBIDDEN');
    }

    const updated = await prisma.permit.update({
      where: { id },
      data: {
        status: PermitStatus.CLOSED,
        completionNotes: completionNotes.trim(),
        closedAt: new Date(),
      },
    });

    await auditService.log({
      permitId: id,
      whoId: user.userId,
      action: 'PERMIT_CLOSED',
      fromValue: PermitStatus.ACTIVE,
      toValue: PermitStatus.CLOSED,
      comment: `Requester ${user.name} reported work complete: ${completionNotes.trim()}. Pending Safety Officer closure verification.`,
    });

    return updated;
  }

  /**
   * Verifies closure of a CLOSED permit: CLOSED -> CLOSED_VERIFIED.
   */
  public static async verifyClosure(id: string, user: JWTPayload, verificationComment?: string) {
    const permit = await prisma.permit.findUnique({ where: { id } });
    if (!permit) throw new AppError(`Permit '${id}' not found`, 404, 'NOT_FOUND');

    PermitStateMachine.validateTransition(permit.status, PermitStatus.CLOSED_VERIFIED);

    if (user.role !== UserRole.SAFETY_OFFICER && user.role !== UserRole.ADMIN) {
      throw new AppError('Only Safety Officers or Admins can verify permit closure', 403, 'FORBIDDEN');
    }

    const updated = await prisma.permit.update({
      where: { id },
      data: {
        status: PermitStatus.CLOSED_VERIFIED,
        verificationComment: verificationComment ?? 'Site verified clean, safe, and de-isolated.',
        verifiedAt: new Date(),
      },
    });

    await auditService.log({
      permitId: id,
      whoId: user.userId,
      action: 'CLOSURE_VERIFIED',
      fromValue: PermitStatus.CLOSED,
      toValue: PermitStatus.CLOSED_VERIFIED,
      comment: `Closure verified by ${user.name} (${user.role}). Final isolation locks removed and plant returned to operations: ${verificationComment ?? 'Inspection passed'}`,
    });

    return updated;
  }

  /**
   * Cancels a permit from allowed states: DRAFT, PENDING_APPROVAL, APPROVED, SUSPENDED -> CANCELLED.
   */
  public static async cancelPermit(id: string, user: JWTPayload, reason?: string) {
    const permit = await prisma.permit.findUnique({ where: { id } });
    if (!permit) throw new AppError(`Permit '${id}' not found`, 404, 'NOT_FOUND');

    PermitStateMachine.validateTransition(permit.status, PermitStatus.CANCELLED);

    if (permit.requesterId !== user.userId && user.role === UserRole.REQUESTER) {
      throw new AppError('Requesters can only cancel their own permits', 403, 'FORBIDDEN');
    }

    const updated = await prisma.permit.update({
      where: { id },
      data: { status: PermitStatus.CANCELLED },
    });

    await auditService.log({
      permitId: id,
      whoId: user.userId,
      action: 'PERMIT_CANCELLED',
      fromValue: permit.status,
      toValue: PermitStatus.CANCELLED,
      comment: `Permit cancelled by ${user.name} (${user.role}). ${reason ? `Reason: ${reason}` : ''}`,
    });

    return updated;
  }

  /**
   * Retrieves dashboard metrics: ACTIVE, EXPIRING IN 2 HOURS, PENDING APPROVAL, TOTAL PERMITS.
   */
  public static async getDashboardStats(user?: JWTPayload) {
    await this.checkAndExpirePermits();

    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const [total, active, pendingApproval, expiringSoon, suspended, closed] = await Promise.all([
      prisma.permit.count(),
      prisma.permit.count({ where: { status: PermitStatus.ACTIVE } }),
      prisma.permit.count({ where: { status: PermitStatus.PENDING_APPROVAL } }),
      prisma.permit.count({
        where: {
          status: PermitStatus.ACTIVE,
          plannedEnd: { gte: now, lte: twoHoursFromNow },
        },
      }),
      prisma.permit.count({ where: { status: PermitStatus.SUSPENDED } }),
      prisma.permit.count({
        where: { status: { in: [PermitStatus.CLOSED, PermitStatus.CLOSED_VERIFIED] } },
      }),
    ]);

    let myPendingApprovalsCount = 0;
    if (user) {
      const pendingWhere: any = {
        status: PermitStatus.PENDING_APPROVAL,
        requesterId: { not: user.userId },
        approvals: { none: { approverId: user.userId } },
      };
      if (user.role === UserRole.AREA_OWNER && user.areaId) {
        pendingWhere.areaId = user.areaId;
      }
      if (user.role !== UserRole.REQUESTER) {
        myPendingApprovalsCount = await prisma.permit.count({ where: pendingWhere });
      }
    }

    return {
      total,
      active,
      pendingApproval,
      expiringSoon,
      suspended,
      closed,
      myPendingApprovalsCount,
    };
  }
}

export default PermitService;
