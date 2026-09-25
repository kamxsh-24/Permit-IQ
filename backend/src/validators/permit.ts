import { z } from 'zod';
import { PermitType } from '@prisma/client';

export const hotWorkDataSchema = z.object({
  hotWorkType: z.enum(['welding', 'grinding', 'cutting', 'soldering']).default('welding'),
  fireWatchAssigned: z.union([z.boolean(), z.string()]).default(true),
  fireExtinguisherType: z.string().default('ABC Powder (9kg)'),
  combustibleClearanceRadius: z.coerce.number().default(11),
  gasTestLelPercent: z.coerce.number().min(0).max(10, 'LEL percent must be <= 10% for hot work').default(0),
  gasTestO2Percent: z.coerce.number().optional().default(20.9),
  gasTestTime: z.string().optional(),
  // Aliases for legacy seed compatibility
  fireWatchName: z.string().optional(),
  sparkShieldDeployed: z.boolean().optional(),
  continuousVentilation: z.boolean().optional(),
}).passthrough();

export const confinedSpaceDataSchema = z.object({
  spaceId: z.string().default('CS-01'),
  entryPoint: z.string().default('Main Manway #1'),
  atmosphericO2Percent: z.coerce.number().min(19.5).max(23.5, 'Oxygen level must be 19.5% - 23.5%').default(20.8),
  lelPercent: z.coerce.number().min(0).max(10, 'Flammable LEL must be < 10%').default(0),
  h2sPpm: z.coerce.number().min(0).max(10, 'H2S must be <= 10 ppm').default(0),
  coPpm: z.coerce.number().min(0).max(25, 'CO must be <= 25 ppm').default(2),
  standbyAttendant: z.string().default('Marcus Vance'),
  rescuePlan: z.string().default('Tripod with self-retracting lifeline and dedicated rescue team on standby'),
  ventilationMethod: z.string().default('Continuous forced air blower (min 2000 CFM)'),
  entryExitLog: z.union([z.boolean(), z.string()]).optional().default(true),
  // Aliases for legacy seed compatibility
  oxygenPercent: z.coerce.number().optional(),
  flammableLelPercent: z.coerce.number().optional(),
  toxicPpmH2S: z.coerce.number().optional(),
  toxicPpmCO: z.coerce.number().optional(),
  standbyPersonName: z.string().optional(),
  rescueTripodInspected: z.boolean().optional(),
  forcedAirVentilation: z.boolean().optional(),
}).passthrough();

export const workingAtHeightDataSchema = z.object({
  heightMetres: z.coerce.number().positive('Height must be greater than 0 meters').default(6.5),
  accessMethod: z.enum(['scaffold', 'ladder', 'MEWP', 'rope']).default('scaffold'),
  fallArrestEquipment: z.string().default('Full body harness with dual shock-absorbing lanyards'),
  anchorPointChecked: z.boolean().default(true),
  barricadingBelow: z.boolean().default(true),
  // Aliases for legacy seed compatibility
  workingHeightMeters: z.coerce.number().optional(),
  scaffoldTagNumber: z.string().optional(),
  scaffoldInspectionValid: z.boolean().optional(),
  fullBodyHarnessVerified: z.boolean().optional(),
  dropZoneBarricaded: z.boolean().optional(),
  toolTethersUsed: z.boolean().optional(),
}).passthrough();

export const electricalLotoDataSchema = z.object({
  equipmentTag: z.string().default('SWG-03'),
  voltageLevel: z.string().default('480V 3-Phase AC'),
  isolationPoints: z.string().default('Main Breaker CB-401 & Control Power Fuse Disconnect'),
  lockNumbers: z.string().default('LOTO-Lock-4401, LOTO-Lock-4402'),
  tagNumbers: z.string().default('DANGER-TAG-8821'),
  earthingApplied: z.boolean().default(true),
  testedDeadBy: z.string().default('Certified Master Electrician'),
  // Aliases for legacy seed compatibility
  isolationPoint: z.string().optional(),
  circuitBreakerNumber: z.string().optional(),
  lotoLockboxNumber: z.string().optional(),
  zeroEnergyStateVerified: z.boolean().optional(),
  padlockAppliedBy: z.string().optional(),
  dangerTagNumber: z.string().optional(),
}).passthrough();

export const excavationDataSchema = z.object({
  excavationDepthMeters: z.coerce.number().positive('Depth must be greater than 0 meters').default(2.5),
  undergroundUtilitiesScanned: z.boolean().default(true),
  soilType: z.enum(['TYPE_A', 'TYPE_B', 'TYPE_C']).default('TYPE_B'),
  trenchShoringInstalled: z.boolean().default(true),
  ladderWithin25Feet: z.boolean().default(true),
}).passthrough();

export const createPermitSchema = z.object({
  permitNumber: z.string().optional(),
  type: z.enum(['HOT_WORK', 'CONFINED_SPACE', 'WORKING_AT_HEIGHT', 'ELECTRICAL_LOTO', 'EXCAVATION']),
  contractorTeam: z.string().min(2, 'Contractor or maintenance team name required'),
  workDescription: z.string().min(10, 'Work description must be at least 10 characters'),
  plantId: z.string().uuid('Valid plant UUID required'),
  areaId: z.string().uuid('Valid area UUID required'),
  equipmentId: z.string().uuid().optional().nullable(),
  plannedStart: z.coerce.date(),
  plannedEnd: z.coerce.date(),
  hazards: z.array(z.string()).min(1, 'At least one hazard must be identified'),
  ppeRequired: z.array(z.string()).min(1, 'At least one PPE item must be specified'),
  precautions: z.array(z.string()).min(1, 'At least one precaution must be verified'),
  typeSpecificData: z.record(z.any()).optional().nullable(),
}).refine((data) => data.plannedEnd > data.plannedStart, {
  message: 'Planned end time must be after planned start time',
  path: ['plannedEnd'],
});

export const updatePermitSchema = z.object({
  contractorTeam: z.string().min(2).optional(),
  workDescription: z.string().min(10).optional(),
  plantId: z.string().uuid().optional(),
  areaId: z.string().uuid().optional(),
  equipmentId: z.string().uuid().optional().nullable(),
  plannedStart: z.coerce.date().optional(),
  plannedEnd: z.coerce.date().optional(),
  hazards: z.array(z.string()).min(1).optional(),
  ppeRequired: z.array(z.string()).min(1).optional(),
  precautions: z.array(z.string()).min(1).optional(),
  typeSpecificData: z.record(z.any()).optional().nullable(),
});

export function validateTypeSpecificData(type: PermitType, data: any): any {
  if (!data) return {};
  switch (type) {
    case 'HOT_WORK':
      return hotWorkDataSchema.parse(data);
    case 'CONFINED_SPACE':
      return confinedSpaceDataSchema.parse(data);
    case 'WORKING_AT_HEIGHT':
      return workingAtHeightDataSchema.parse(data);
    case 'ELECTRICAL_LOTO':
      return electricalLotoDataSchema.parse(data);
    case 'EXCAVATION':
      return excavationDataSchema.parse(data);
    default:
      return data;
  }
}
