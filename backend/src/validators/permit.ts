import { z } from 'zod';

export const hotWorkDataSchema = z.object({
  fireWatchName: z.string().min(2, 'Fire watch personnel name required'),
  extinguisherType: z.string().min(2, 'Extinguisher classification required'),
  gasTestLelPercent: z.number().min(0).max(10, 'LEL percent must be <= 10% for hot work'),
  sparkShieldDeployed: z.boolean(),
  continuousVentilation: z.boolean(),
});

export const confinedSpaceDataSchema = z.object({
  oxygenPercent: z.number().min(19.5).max(23.5, 'Oxygen level must be 19.5% - 23.5%'),
  flammableLelPercent: z.number().min(0).max(10, 'Flammable LEL must be < 10%'),
  toxicPpmH2S: z.number().min(0).max(10, 'H2S must be <= 10 ppm'),
  toxicPpmCO: z.number().min(0).max(25, 'CO must be <= 25 ppm'),
  standbyPersonName: z.string().min(2, 'Standby person name is mandatory'),
  rescueTripodInspected: z.boolean(),
  forcedAirVentilation: z.boolean(),
});

export const workingAtHeightDataSchema = z.object({
  workingHeightMeters: z.number().positive('Height must be greater than 0 meters'),
  scaffoldTagNumber: z.string().optional(),
  scaffoldInspectionValid: z.boolean(),
  fullBodyHarnessVerified: z.boolean(),
  dropZoneBarricaded: z.boolean(),
  toolTethersUsed: z.boolean(),
});

export const electricalLotoDataSchema = z.object({
  isolationPoint: z.string().min(2, 'Isolation point identification required'),
  circuitBreakerNumber: z.string().min(1, 'Circuit breaker reference required'),
  lotoLockboxNumber: z.string().min(1, 'LOTO lockbox number required'),
  zeroEnergyStateVerified: z.boolean(),
  padlockAppliedBy: z.string().min(2, 'Technician applying lock is required'),
  dangerTagNumber: z.string().min(1, 'Danger tag number required'),
});

export const excavationDataSchema = z.object({
  excavationDepthMeters: z.number().positive('Depth must be greater than 0 meters'),
  undergroundUtilitiesScanned: z.boolean(),
  soilType: z.enum(['TYPE_A', 'TYPE_B', 'TYPE_C']),
  trenchShoringInstalled: z.boolean(),
  ladderWithin25Feet: z.boolean(),
});

export const createPermitSchema = z.object({
  permitNumber: z.string().min(3, 'Permit number required'),
  type: z.enum(['HOT_WORK', 'CONFINED_SPACE', 'WORKING_AT_HEIGHT', 'ELECTRICAL_LOTO', 'EXCAVATION']),
  requesterId: z.string().uuid('Valid requester UUID required'),
  contractorTeam: z.string().min(2, 'Contractor team name required'),
  workDescription: z.string().min(10, 'Work description must be at least 10 characters'),
  plantId: z.string().uuid('Valid plant UUID required'),
  areaId: z.string().uuid('Valid area UUID required'),
  equipmentId: z.string().uuid().optional(),
  plannedStart: z.coerce.date(),
  plannedEnd: z.coerce.date(),
  hazards: z.array(z.string()).min(1, 'At least one hazard must be identified'),
  ppeRequired: z.array(z.string()).min(1, 'At least one PPE item must be specified'),
  precautions: z.array(z.string()).min(1, 'At least one precaution must be verified'),
  typeSpecificData: z.record(z.any()).optional(),
});
