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
  | 'ELECTRICAL_LOTO';

// User Roles & Authorization Levels
export type UserRole =
  | 'REQUESTER'
  | 'AREA_OWNER'
  | 'SAFETY_OFFICER'
  | 'ADMIN';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  badgeNumber: string;
  department: string;
  plantUnit?: string;
  avatarUrl?: string;
}

export interface HazardControl {
  id: string;
  hazardDescription: string;
  controlMeasure: string;
  isMandatory: boolean;
  isVerified: boolean;
}

export interface GasTestRecord {
  id: string;
  testedAt: string;
  testedBy: string;
  oxygenPercent: number;
  flammableLelPercent: number;
  toxicPpmH2S?: number;
  toxicPpmCO?: number;
  isSafeToEnter: boolean;
  remarks?: string;
}

export interface IsolationLock {
  tagId: string;
  equipmentId: string;
  isolationPoint: string;
  isolationType: 'ELECTRICAL' | 'MECHANICAL' | 'PNEUMATIC' | 'HYDRAULIC';
  appliedBy: string;
  appliedAt: string;
  verifiedBy?: string;
}

export interface PermitApprovalLog {
  id: string;
  role: UserRole;
  approverName: string;
  approverId: string;
  decision: 'APPROVED' | 'REJECTED' | 'REQUEST_CHANGES';
  comments?: string;
  timestamp: string;
  signatureReference?: string;
}

export interface PermitClosure {
  housekeepingCompleted: boolean;
  equipmentRestored: boolean;
  isolationsRemoved: boolean;
  workCompletedStatus: 'COMPLETED' | 'INCOMPLETE_HANDOVER' | 'STOPPED_UNSAFE';
  contractorSignedOffBy?: string;
  contractorSignedOffAt?: string;
  areaOwnerVerifiedBy?: string;
  areaOwnerVerifiedAt?: string;
  safetyOfficerClosedBy?: string;
  safetyOfficerClosedAt?: string;
  closureNotes?: string;
}

export interface Permit {
  id: string;
  permitNumber: string;
  title: string;
  description: string;
  permitType: PermitType;
  status: PermitStatus;
  riskLevel: RiskLevel;
  plantArea: string;
  workOrderNumber?: string;
  contractorCompany?: string;
  numberOfWorkers: number;

  requesterId: string;
  requesterName: string;
  areaOwnerId?: string;
  areaOwnerName?: string;
  safetyOfficerId?: string;
  safetyOfficerName?: string;

  validFrom: string;
  validTo: string;
  createdAt: string;
  updatedAt: string;

  hazards?: HazardControl[];
  gasTests?: GasTestRecord[];
  isolations?: IsolationLock[];
  approvals?: PermitApprovalLog[];
  closure?: PermitClosure;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
