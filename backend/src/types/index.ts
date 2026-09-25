import { UserRole, PermitStatus, PermitType, ApprovalStatus } from '@prisma/client';

export { UserRole, PermitStatus, PermitType, ApprovalStatus };

// Type-specific dynamic data structures stored inside typeSpecificData (JSONB)
export interface HotWorkData {
  hotWorkType: 'welding' | 'grinding' | 'cutting' | 'soldering';
  fireWatchAssigned: boolean | string;
  fireExtinguisherType: string;
  combustibleClearanceRadius: number;
  gasTestLelPercent: number;
  gasTestO2Percent?: number;
  gasTestTime?: string;
  // Backward compatibility aliases
  fireWatchName?: string;
  sparkShieldDeployed?: boolean;
  continuousVentilation?: boolean;
}

export interface ConfinedSpaceData {
  spaceId: string;
  entryPoint: string;
  atmosphericO2Percent: number;
  lelPercent: number;
  h2sPpm: number;
  coPpm: number;
  standbyAttendant: string;
  rescuePlan: string;
  ventilationMethod: string;
  entryExitLog?: boolean | string;
  // Backward compatibility aliases
  oxygenPercent?: number;
  flammableLelPercent?: number;
  toxicPpmH2S?: number;
  toxicPpmCO?: number;
  standbyPersonName?: string;
  rescueTripodInspected?: boolean;
  forcedAirVentilation?: boolean;
}

export interface WorkingAtHeightData {
  heightMetres: number;
  accessMethod: 'scaffold' | 'ladder' | 'MEWP' | 'rope';
  fallArrestEquipment: string;
  anchorPointChecked: boolean;
  barricadingBelow: boolean;
  // Backward compatibility aliases
  workingHeightMeters?: number;
  scaffoldTagNumber?: string;
  scaffoldInspectionValid?: boolean;
  fullBodyHarnessVerified?: boolean;
  dropZoneBarricaded?: boolean;
  toolTethersUsed?: boolean;
}

export interface ElectricalLotoData {
  equipmentTag: string;
  voltageLevel: string;
  isolationPoints: string;
  lockNumbers: string;
  tagNumbers: string;
  earthingApplied: boolean;
  testedDeadBy: string;
  // Backward compatibility aliases
  isolationPoint?: string;
  circuitBreakerNumber?: string;
  lotoLockboxNumber?: string;
  zeroEnergyStateVerified?: boolean;
  padlockAppliedBy?: string;
  dangerTagNumber?: string;
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

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  areaId: string | null;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  errors?: Record<string, string[]> | string;
  timestamp: string;
}
