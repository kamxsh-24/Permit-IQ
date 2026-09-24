import { PermitStatus, PermitType, UserRole, RiskLevel } from '../types';

export const APP_NAME = 'SafePermit CMMS';
export const APP_TAGLINE = 'Permit to Work & Isolation Management';

export interface StatusConfig {
  label: string;
  description: string;
  badgeClass: string;
  dotClass: string;
  borderClass: string;
}

export const PERMIT_STATUS_CONFIG: Record<PermitStatus, StatusConfig> = {
  DRAFT: {
    label: 'Draft',
    description: 'Permit is being prepared by the requester',
    badgeClass: 'bg-slate-800 text-slate-200 border-slate-700',
    dotClass: 'bg-slate-400',
    borderClass: 'border-l-slate-500',
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    description: 'Awaiting sign-off from Area Owner or Safety Officer',
    badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-600/50',
    dotClass: 'bg-amber-400 animate-pulse',
    borderClass: 'border-l-amber-500',
  },
  APPROVED: {
    label: 'Approved',
    description: 'Permit approved, waiting for site handover to activate',
    badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-600/50',
    dotClass: 'bg-emerald-400',
    borderClass: 'border-l-emerald-500',
  },
  ACTIVE: {
    label: 'Active (Live Work)',
    description: 'Work is currently ongoing under live permit',
    badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-500/60 ring-1 ring-sky-500/30',
    dotClass: 'bg-sky-400 animate-ping',
    borderClass: 'border-l-sky-500',
  },
  SUSPENDED: {
    label: 'Suspended',
    description: 'Work halted due to safety breach, alarm, or shift change',
    badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-600/50',
    dotClass: 'bg-orange-400',
    borderClass: 'border-l-orange-500',
  },
  EXPIRED: {
    label: 'Expired',
    description: 'Work duration exceeded validity timeframe without revalidation',
    badgeClass: 'bg-rose-950/70 text-rose-300 border-rose-600/50',
    dotClass: 'bg-rose-400',
    borderClass: 'border-l-rose-500',
  },
  REJECTED: {
    label: 'Rejected',
    description: 'Permit rejected due to inadequate safety controls',
    badgeClass: 'bg-red-950/80 text-red-300 border-red-600/60',
    dotClass: 'bg-red-500',
    borderClass: 'border-l-red-500',
  },
  CLOSED: {
    label: 'Closed (Awaiting Verification)',
    description: 'Contractor finished, awaiting safety sign-off',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-600',
    dotClass: 'bg-zinc-400',
    borderClass: 'border-l-zinc-500',
  },
  CLOSED_VERIFIED: {
    label: 'Closed & Verified',
    description: 'Site inspected, isolations removed, fully archived',
    badgeClass: 'bg-teal-950/70 text-teal-300 border-teal-600/50',
    dotClass: 'bg-teal-400',
    borderClass: 'border-l-teal-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    description: 'Work cancelled prior to execution',
    badgeClass: 'bg-neutral-900 text-neutral-400 border-neutral-700',
    dotClass: 'bg-neutral-500',
    borderClass: 'border-l-neutral-600',
  },
};

export interface PermitTypeConfig {
  label: string;
  code: string;
  badgeClass: string;
  iconName: 'flame' | 'box' | 'arrow-up' | 'zap';
}

export const PERMIT_TYPE_CONFIG: Record<PermitType, PermitTypeConfig> = {
  HOT_WORK: {
    label: 'Hot Work',
    code: 'HW',
    badgeClass: 'bg-amber-900/30 text-amber-300 border-amber-500/50',
    iconName: 'flame',
  },
  CONFINED_SPACE: {
    label: 'Confined Space Entry',
    code: 'CS',
    badgeClass: 'bg-purple-900/30 text-purple-300 border-purple-500/50',
    iconName: 'box',
  },
  WORKING_AT_HEIGHT: {
    label: 'Working at Height (>1.8m)',
    code: 'WAH',
    badgeClass: 'bg-blue-900/30 text-blue-300 border-blue-500/50',
    iconName: 'arrow-up',
  },
  ELECTRICAL_LOTO: {
    label: 'Electrical LOTO',
    code: 'EL',
    badgeClass: 'bg-yellow-900/30 text-yellow-300 border-yellow-500/50',
    iconName: 'zap',
  },
};

export interface RoleConfig {
  label: string;
  description: string;
  badgeClass: string;
}

export const USER_ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  REQUESTER: {
    label: 'Permit Requester',
    description: 'Maintenance supervisors, lead technicians, and approved contractors',
    badgeClass: 'bg-blue-950 text-blue-300 border-blue-700/60',
  },
  AREA_OWNER: {
    label: 'Area / Operations Owner',
    description: 'Production managers and unit operators responsible for process boundary',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
  },
  SAFETY_OFFICER: {
    label: 'Safety / EHS Officer',
    description: 'Environmental Health and Safety specialists verifying risk mitigations',
    badgeClass: 'bg-amber-950 text-amber-300 border-amber-700/60',
  },
  ADMIN: {
    label: 'System Administrator',
    description: 'CMMS plant administrator with full configuration privileges',
    badgeClass: 'bg-purple-950 text-purple-300 border-purple-700/60',
  },
};

export const RISK_LEVEL_CONFIG: Record<RiskLevel, { label: string; badgeClass: string }> = {
  LOW: {
    label: 'Low Risk',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-600',
  },
  MEDIUM: {
    label: 'Medium Risk',
    badgeClass: 'bg-amber-950 text-amber-300 border-amber-600',
  },
  HIGH: {
    label: 'High Risk',
    badgeClass: 'bg-orange-950 text-orange-300 border-orange-600',
  },
  CRITICAL: {
    label: 'Critical Hazard',
    badgeClass: 'bg-red-950 text-red-300 border-red-600 ring-1 ring-red-500/50',
  },
};
