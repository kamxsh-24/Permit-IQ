import { UserRole, PermitStatus, PermitType, ApprovalStatus } from '@prisma/client';

export { UserRole, PermitStatus, PermitType, ApprovalStatus };

// Type-specific dynamic data structures stored inside typeSpecificData (JSONB)
export interface HotWorkData {
  fireWatchName: string;
  extinguisherType: string;
  gasTestLelPercent: number; // Must be 0.0%
  sparkShieldDeployed: boolean;
  continuousVentilation: boolean;
}

export interface ConfinedSpaceData {
  oxygenPercent: number; // 19.5% - 23.5%
  flammableLelPercent: number; // < 10%
  toxicPpmH2S: number;
  toxicPpmCO: number;
  standbyPersonName: string;
  rescueTripodInspected: boolean;
  forcedAirVentilation: boolean;
}

export interface WorkingAtHeightData {
  workingHeightMeters: number;
  scaffoldTagNumber?: string;
  scaffoldInspectionValid: boolean;
  fullBodyHarnessVerified: boolean;
  dropZoneBarricaded: boolean;
  toolTethersUsed: boolean;
}

export interface ElectricalLotoData {
  isolationPoint: string;
  circuitBreakerNumber: string;
  lotoLockboxNumber: string;
  zeroEnergyStateVerified: boolean;
  padlockAppliedBy: string;
  dangerTagNumber: string;
}

export interface ExcavationData {
  excavationDepthMeters: number;
  undergroundUtilitiesScanned: boolean;
  soilType: 'TYPE_A' | 'TYPE_B' | 'TYPE_C';
  trenchShoringInstalled: boolean;
  ladderWithin25Feet: boolean;
}

export type PermitTypeData =
  | HotWorkData
  | ConfinedSpaceData
  | WorkingAtHeightData
  | ElectricalLotoData
  | ExcavationData;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]> | string;
  timestamp: string;
}
