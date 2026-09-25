import {
  PermitStatus,
  PermitType,
  UserRole,
  RiskLevel,
} from '../types';

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
    description: 'Work permit initiated and awaiting submission',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-600',
    dotClass: 'bg-slate-400',
    borderClass: 'border-l-slate-500',
  },
  PENDING_APPROVAL: {
    label: 'Pending Authorization',
    description: 'Permit submitted, awaiting mandatory approver signatures',
    badgeClass: 'bg-amber-950 text-amber-300 border-amber-700',
    dotClass: 'bg-amber-400 animate-pulse',
    borderClass: 'border-l-amber-500',
  },
  APPROVED: {
    label: 'Authorized / Approved',
    description: 'All sign-offs completed; eligible for jobsite activation',
    badgeClass: 'bg-blue-950 text-blue-300 border-blue-700',
    dotClass: 'bg-blue-400',
    borderClass: 'border-l-blue-500',
  },
  ACTIVE: {
    label: 'Active (Live Work)',
    description: 'Physical work authorized and ongoing on site',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow-sm',
    dotClass: 'bg-emerald-400 animate-ping',
    borderClass: 'border-l-emerald-500',
  },
  SUSPENDED: {
    label: 'Suspended (Hold)',
    description: 'Temporarily halted due to hazardous condition or alarms',
    badgeClass: 'bg-orange-950 text-orange-300 border-orange-700',
    dotClass: 'bg-orange-400',
    borderClass: 'border-l-orange-500',
  },
  EXPIRED: {
    label: 'Expired Validity',
    description: 'Permit work window elapsed before closure completion',
    badgeClass: 'bg-rose-950 text-rose-300 border-rose-800',
    dotClass: 'bg-rose-500',
    borderClass: 'border-l-rose-500',
  },
  REJECTED: {
    label: 'Rejected',
    description: 'Permit rejected by Area Owner or Safety Officer',
    badgeClass: 'bg-red-950 text-red-300 border-red-800',
    dotClass: 'bg-red-500',
    borderClass: 'border-l-red-500',
  },
  CLOSED: {
    label: 'Closed (Handover)',
    description: 'Field work concluded; awaiting final safety sign-off',
    badgeClass: 'bg-sky-950 text-sky-300 border-sky-700',
    dotClass: 'bg-sky-400',
    borderClass: 'border-l-sky-500',
  },
  CLOSED_VERIFIED: {
    label: 'Closed & Verified',
    description: 'Housekeeping verified, isolations removed, fully archived',
    badgeClass: 'bg-teal-950 text-teal-300 border-teal-700',
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
  iconName: 'flame' | 'box' | 'arrow-up' | 'zap' | 'shovel';
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
  EXCAVATION: {
    label: 'Excavation & Trenching',
    code: 'EX',
    badgeClass: 'bg-emerald-900/30 text-emerald-300 border-emerald-500/50',
    iconName: 'shovel',
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
    badgeClass: 'bg-purple-950 text-purple-300 border-purple-700/60',
  },
  ADMIN: {
    label: 'System / Plant Administrator',
    description: 'Full supervisory authority and master configuration privilege',
    badgeClass: 'bg-rose-950 text-rose-300 border-rose-700/60',
  },
};
