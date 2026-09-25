/**
 * Domain types for Permit to Work (PTW) CMMS module.
 */

// Permit Status Workflow
export type PermitStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'CLOSED'
  | 'CLOSED_VERIFIED'
  | 'CANCELLED';

// High-Risk Permit Categories
export type PermitType =
  | 'HOT_WORK'
  | 'CONFINED_SPACE'
  | 'WORKING_AT_HEIGHT'
  | 'ELECTRICAL_LOTO'
  | 'EXCAVATION';

// User Roles & Authorization Levels
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type UserRole =
  | 'REQUESTER'
  | 'AREA_OWNER'
  | 'SAFETY_OFFICER'
  | 'ADMIN';

export interface Plant {
  id: string;
  name: string;
  code: string;
}

export interface Area {
  id: string;
  name: string;
  plantId: string;
  plant?: Plant;
}

export interface Equipment {
  id: string;
  name: string;
  equipmentTag: string;
  areaId: string;
  area?: Area;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  areaId?: string | null;
  area?: {
    id: string;
    name: string;
    plantId: string;
    plant?: Plant;
  } | null;
  createdAt?: string;
}

// Backward compatibility alias
export type User = AuthUser;

export interface PermitApproval {
  id: string;
  permitId: string;
  approverId: string;
  approver: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  role: UserRole;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  comment?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
}

export interface PermitAuditLog {
  id: string;
  permitId: string;
  whoId: string;
  who: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  action: string;
  timestamp: string;
  fromValue?: string | null;
  toValue?: string | null;
  comment?: string | null;
}

export interface Permit {
  id: string;
  permitNumber: string;
  type: PermitType;
  status: PermitStatus;
  requesterId: string;
  requester?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  contractorTeam: string;
  workDescription: string;
  plantId: string;
  plant?: Plant;
  areaId: string;
  area?: Area;
  equipmentId?: string | null;
  equipment?: Equipment | null;

  plannedStart: string;
  plannedEnd: string;

  hazards: string[];
  ppeRequired: string[];
  precautions: string[];
  typeSpecificData?: any;

  completionNotes?: string | null;
  verificationComment?: string | null;
  closedAt?: string | null;
  verifiedAt?: string | null;

  approvals?: PermitApproval[];
  auditLogs?: PermitAuditLog[];

  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface DashboardStats {
  total: number;
  active: number;
  pendingApproval: number;
  expiringSoon: number;
  suspended: number;
  closed: number;
  myPendingApprovalsCount: number;
}
