import { PrismaClient, UserRole, PermitStatus, PermitType, ApprovalStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Permit-to-Work CMMS Database...');

  // Clean existing records in correct foreign key order
  await prisma.permitAuditLog.deleteMany({});
  await prisma.permitApproval.deleteMany({});
  await prisma.permit.deleteMany({});
  await prisma.equipment.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.area.deleteMany({});
  await prisma.plant.deleteMany({});

  // 1. PLANTS
  console.log('Creating Plants...');
  const plantAlpha = await prisma.plant.create({
    data: {
      name: 'Alpha Refining Complex',
      code: 'ARC-01',
    },
  });

  const plantBeta = await prisma.plant.create({
    data: {
      name: 'Beta Petrochemical Terminal',
      code: 'BPT-02',
    },
  });

  // 2. AREAS
  console.log('Creating Areas...');
  const areaAlkylation = await prisma.area.create({
    data: {
      name: 'Unit 04: Alkylation & Hydrocracking Block',
      plantId: plantAlpha.id,
    },
  });

  const areaDistillation = await prisma.area.create({
    data: {
      name: 'Unit 01: Atmospheric Distillation Column Area',
      plantId: plantAlpha.id,
    },
  });

  const areaUtilities = await prisma.area.create({
    data: {
      name: 'Utilities & 11kV Substation Power Generation',
      plantId: plantAlpha.id,
    },
  });

  const areaTankFarm = await prisma.area.create({
    data: {
      name: 'Bulk Liquid Storage Tank Farm 08',
      plantId: plantBeta.id,
    },
  });

  const areaMarine = await prisma.area.create({
    data: {
      name: 'Marine Berthing & Loading Jetty 12',
      plantId: plantBeta.id,
    },
  });

  const areaFlare = await prisma.area.create({
    data: {
      name: 'Elevated Flare Stack Offgas Header',
      plantId: plantBeta.id,
    },
  });

  // 3. USERS (One for each of the 4 roles)
  console.log('Creating Demo Users for each role...');
  const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);

  const requester = await prisma.user.create({
    data: {
      name: 'Alex Miller',
      email: 'requester@safework.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.REQUESTER,
      areaId: areaAlkylation.id,
    },
  });

  const areaOwner = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'areaowner@safework.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.AREA_OWNER,
      areaId: areaAlkylation.id,
    },
  });

  const safetyOfficer = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'safety@safework.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.SAFETY_OFFICER,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'David Sterling',
      email: 'admin@safework.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN,
    },
  });

  // 4. EQUIPMENT (6 records)
  console.log('Creating Industrial Equipment...');
  const eqReactor = await prisma.equipment.create({
    data: {
      name: 'Catalyst Hydrotreater Reactor Vessel',
      equipmentTag: 'R-102',
      areaId: areaAlkylation.id,
    },
  });

  const eqColumn = await prisma.equipment.create({
    data: {
      name: 'Primary Fractionation Column',
      equipmentTag: 'C-301',
      areaId: areaDistillation.id,
    },
  });

  const eqSwitchgear = await prisma.equipment.create({
    data: {
      name: '11kV High Voltage Main Switchgear Busbar',
      equipmentTag: 'SWG-03',
      areaId: areaUtilities.id,
    },
  });

  const eqPump = await prisma.equipment.create({
    data: {
      name: 'Cooling Water Main Circulation Pump #2',
      equipmentTag: 'P-204',
      areaId: areaUtilities.id,
    },
  });

  const eqTank = await prisma.equipment.create({
    data: {
      name: 'Sulfuric Acid Bulk Storage Vessel',
      equipmentTag: 'TK-502',
      areaId: areaTankFarm.id,
    },
  });

  const eqFlare = await prisma.equipment.create({
    data: {
      name: 'Elevated Flare Tip & Multi-Jet Burner',
      equipmentTag: 'FS-01',
      areaId: areaFlare.id,
    },
  });

  // 5. PERMITS (~10 permits across various statuses and types)
  console.log('Creating Permits with type-specific data, approvals, and audit trails...');

  const now = new Date();
  const pastHours = (h: number) => new Date(now.getTime() - h * 3600000);
  const futureHours = (h: number) => new Date(now.getTime() + h * 3600000);

  const permitsSeed = [
    // 1. DRAFT - Hot Work
    {
      permitNumber: 'PTW-2026-0001',
      type: PermitType.HOT_WORK,
      status: PermitStatus.DRAFT,
      contractorTeam: 'Apex Mechanical Contracting',
      workDescription: 'Surface grinding and beveling of replacement bypass piping spool.',
      plantId: plantAlpha.id,
      areaId: areaAlkylation.id,
      equipmentId: eqReactor.id,
      plannedStart: futureHours(2),
      plannedEnd: futureHours(10),
      hazards: ['Sparks from grinding', 'Hot metal slag', 'Adjacent flammable process lines'],
      ppeRequired: ['Full face shield', 'Leather welding gloves', 'Safety goggles', 'Flame-retardant coveralls'],
      precautions: ['Combustibles cleared within 15m radius', 'Fire blanket barriers deployed', 'Dry chemical extinguisher placed'],
      typeSpecificData: {
        fireWatchName: 'Pending Appointment',
        extinguisherType: 'ABC Powder 9kg',
        gasTestLelPercent: 0.0,
        sparkShieldDeployed: true,
        continuousVentilation: false,
      },
    },

    // 2. PENDING_APPROVAL - Hot Work
    {
      permitNumber: 'PTW-2026-0002',
      type: PermitType.HOT_WORK,
      status: PermitStatus.PENDING_APPROVAL,
      contractorTeam: 'Apex Mechanical Contracting',
      workDescription: 'Nozzle N3 weld crack repair on reactor chamber shell.',
      plantId: plantAlpha.id,
      areaId: areaAlkylation.id,
      equipmentId: eqReactor.id,
      plannedStart: futureHours(1),
      plannedEnd: futureHours(9),
      hazards: ['Open arc welding sparks', 'Hydrocarbon vapor ignition', 'Compressed argon shielding cylinder'],
      ppeRequired: ['Welding helmet shade 11', 'Split-leather welding jacket', 'Steel-toe boots', 'Respirator mask'],
      precautions: ['Continuous LEL monitoring mandatory', 'Certified fire watch stationed', 'Process line depressurized and drained'],
      typeSpecificData: {
        fireWatchName: 'Daniel Vance (Certified Watch)',
        extinguisherType: 'CO2 & Dry Powder',
        gasTestLelPercent: 0.0,
        sparkShieldDeployed: true,
        continuousVentilation: true,
      },
    },

    // 3. APPROVED - Confined Space
    {
      permitNumber: 'PTW-2026-0003',
      type: PermitType.CONFINED_SPACE,
      status: PermitStatus.APPROVED,
      contractorTeam: 'CleanTech Vessel Services',
      workDescription: 'Internal tray fouling inspection and high-pressure jet washing inside column.',
      plantId: plantAlpha.id,
      areaId: areaDistillation.id,
      equipmentId: eqColumn.id,
      plannedStart: futureHours(3),
      plannedEnd: futureHours(11),
      hazards: ['Oxygen deficiency in vessel', 'Toxic H2S residue', 'Slip/fall on tray liquid film', 'Restricted egress'],
      ppeRequired: ['4-gas portable monitor', 'Full body harness with retrieval lanyard', 'Chemical splash suit', 'Air-purifying respirator'],
      precautions: ['Positive pressure forced ventilation running 2 hours prior', 'Standby man at top manway', 'Emergency tripod hoisted'],
      typeSpecificData: {
        oxygenPercent: 20.9,
        flammableLelPercent: 0.0,
        toxicPpmH2S: 0,
        toxicPpmCO: 2,
        standbyPersonName: 'Carlos Morales',
        rescueTripodInspected: true,
        forcedAirVentilation: true,
      },
    },

    // 4. ACTIVE - Working at Height
    {
      permitNumber: 'PTW-2026-0004',
      type: PermitType.WORKING_AT_HEIGHT,
      status: PermitStatus.ACTIVE,
      contractorTeam: 'Skyline Rigging & Scaffolding',
      workDescription: 'Flare header pipe support structural reinforcement at 14-meter elevation.',
      plantId: plantBeta.id,
      areaId: areaFlare.id,
      equipmentId: eqFlare.id,
      plannedStart: pastHours(2),
      plannedEnd: futureHours(6),
      hazards: ['Fall from height (>14m)', 'High wind velocity gusts', 'Dropped tools endangering ground personnel'],
      ppeRequired: ['Full body safety harness', 'Twin energy-absorbing lanyards', 'Hard hat with chinstrap', 'Tool lanyards'],
      precautions: ['Scaffold inspected and tagged GREEN', 'Drop zone barricaded with safety tape', '100% tie-off mandatory'],
      typeSpecificData: {
        workingHeightMeters: 14.5,
        scaffoldTagNumber: 'SCAF-2026-088',
        scaffoldInspectionValid: true,
        fullBodyHarnessVerified: true,
        dropZoneBarricaded: true,
        toolTethersUsed: true,
      },
    },

    // 5. ACTIVE - Electrical LOTO
    {
      permitNumber: 'PTW-2026-0005',
      type: PermitType.ELECTRICAL_LOTO,
      status: PermitStatus.ACTIVE,
      contractorTeam: 'PowerGrid Electrical Engineers',
      workDescription: 'Substation #3 11kV busbar insulation resistance testing and breaker contact cleaning.',
      plantId: plantAlpha.id,
      areaId: areaUtilities.id,
      equipmentId: eqSwitchgear.id,
      plannedStart: pastHours(3),
      plannedEnd: futureHours(5),
      hazards: ['High voltage electrocution (11kV)', 'Arc flash hazard', 'Stored capacitive electrical charge'],
      ppeRequired: ['Arc flash suit (40 cal/cm2)', 'Insulating rubber gloves Class 4', 'Dielectric overshoes'],
      precautions: ['Breaker racked out and padlocked', 'Earthing switches closed and grounded', 'Test before touch verified with detector'],
      typeSpecificData: {
        isolationPoint: 'Substation 3 Main Incomer Feeder #1',
        circuitBreakerNumber: 'CB-11KV-04',
        lotoLockboxNumber: 'LOTO-BOX-12',
        zeroEnergyStateVerified: true,
        padlockAppliedBy: 'Robert Davis (Master Electrician)',
        dangerTagNumber: 'TAG-DANGER-4491',
      },
    },

    // 6. SUSPENDED - Hot Work
    {
      permitNumber: 'PTW-2026-0006',
      type: PermitType.HOT_WORK,
      status: PermitStatus.SUSPENDED,
      contractorTeam: 'Precision Piping Specialists',
      workDescription: 'Acid storage tank TK-502 outlet flange modification.',
      plantId: plantBeta.id,
      areaId: areaTankFarm.id,
      equipmentId: eqTank.id,
      plannedStart: pastHours(6),
      plannedEnd: futureHours(2),
      hazards: ['Acidic vapor exposure', 'Sparks near breather vents', 'Chemical splash'],
      ppeRequired: ['Acid-resistant PVC suit', 'Heavy rubber gauntlets', 'Full face respirator'],
      precautions: ['Tank isolated and purged with nitrogen', 'Continuous atmospheric monitoring', 'Neutralizing agent on hand'],
      typeSpecificData: {
        fireWatchName: 'Timothy Ross',
        extinguisherType: 'Dry Powder 9kg',
        gasTestLelPercent: 4.5,
        sparkShieldDeployed: true,
        continuousVentilation: false,
      },
    },

    // 7. EXPIRED - Confined Space
    {
      permitNumber: 'PTW-2026-0007',
      type: PermitType.CONFINED_SPACE,
      status: PermitStatus.EXPIRED,
      contractorTeam: 'HydroClean Industrial',
      workDescription: 'Cooling tower cold water basin underground sump sludge cleanout.',
      plantId: plantAlpha.id,
      areaId: areaUtilities.id,
      equipmentId: eqPump.id,
      plannedStart: pastHours(18),
      plannedEnd: pastHours(4),
      hazards: ['Submerged slip hazard', 'Biological legionella aerosols', 'Engulfment hazard'],
      ppeRequired: ['Waders and water boots', 'Respiratory mask', 'Safety harness'],
      precautions: ['Basin water inlet pumps locked out', 'Tripod hoist positioned'],
      typeSpecificData: {
        oxygenPercent: 20.8,
        flammableLelPercent: 0.0,
        toxicPpmH2S: 0,
        toxicPpmCO: 0,
        standbyPersonName: 'Samuel Green',
        rescueTripodInspected: true,
        forcedAirVentilation: true,
      },
    },

    // 8. REJECTED - Working at Height
    {
      permitNumber: 'PTW-2026-0008',
      type: PermitType.WORKING_AT_HEIGHT,
      status: PermitStatus.REJECTED,
      contractorTeam: 'HighRise Painting Crew',
      workDescription: 'External corrosion painting on marine berth loading gantry structure.',
      plantId: plantBeta.id,
      areaId: areaMarine.id,
      plannedStart: pastHours(8),
      plannedEnd: pastHours(1),
      hazards: ['Fall over water', 'Corroded structural handrails', 'Tidal spray'],
      ppeRequired: ['Inflatable life vest', 'Fall arrest lanyard', 'Rubberized work gloves'],
      precautions: ['Safety net underneath', 'Life ring deployed at dock'],
      typeSpecificData: {
        workingHeightMeters: 8.0,
        scaffoldTagNumber: 'RED-UNSAFE',
        scaffoldInspectionValid: false,
        fullBodyHarnessVerified: true,
        dropZoneBarricaded: false,
        toolTethersUsed: false,
      },
    },

    // 9. CLOSED - Electrical LOTO
    {
      permitNumber: 'PTW-2026-0009',
      type: PermitType.ELECTRICAL_LOTO,
      status: PermitStatus.CLOSED,
      contractorTeam: 'Alpha Maintenance In-House',
      workDescription: 'Cooling water pump P-204 electric motor terminal reconnection.',
      plantId: plantAlpha.id,
      areaId: areaUtilities.id,
      equipmentId: eqPump.id,
      plannedStart: pastHours(12),
      plannedEnd: pastHours(2),
      hazards: ['Rotating machinery pinch point', '415V electrical contact'],
      ppeRequired: ['Electrical safety shoes', 'Leather gloves', 'Safety glasses'],
      precautions: ['Lockout applied at MCC motor control center', 'Tag verified'],
      typeSpecificData: {
        isolationPoint: 'MCC-02 Cubicle 4B',
        circuitBreakerNumber: 'MCC-CB-4B',
        lotoLockboxNumber: 'LOTO-BOX-05',
        zeroEnergyStateVerified: true,
        padlockAppliedBy: 'Alex Miller',
        dangerTagNumber: 'TAG-DANGER-1102',
      },
    },

    // 10. CLOSED_VERIFIED - Hot Work
    {
      permitNumber: 'PTW-2026-0010',
      type: PermitType.HOT_WORK,
      status: PermitStatus.CLOSED_VERIFIED,
      contractorTeam: 'Apex Mechanical Contracting',
      workDescription: 'Distillation pre-heater steam coil flange seal replacement and bracket welding.',
      plantId: plantAlpha.id,
      areaId: areaDistillation.id,
      equipmentId: eqColumn.id,
      plannedStart: pastHours(24),
      plannedEnd: pastHours(14),
      hazards: ['Steam burns', 'Welding flash', 'Confined space proximity'],
      ppeRequired: ['Welding helmet', 'Heat resistant gloves', 'Coveralls'],
      precautions: ['Steam header blocked and tagged', '30-minute post-work fire watch conducted'],
      typeSpecificData: {
        fireWatchName: 'Daniel Vance',
        extinguisherType: 'ABC Powder 9kg',
        gasTestLelPercent: 0.0,
        sparkShieldDeployed: true,
        continuousVentilation: true,
      },
    },

    // 11. CANCELLED - Confined Space
    {
      permitNumber: 'PTW-2026-0011',
      type: PermitType.CONFINED_SPACE,
      status: PermitStatus.CANCELLED,
      contractorTeam: 'CleanTech Vessel Services',
      workDescription: 'Marine cargo tank pre-survey prior to crude unloading.',
      plantId: plantBeta.id,
      areaId: areaMarine.id,
      plannedStart: pastHours(30),
      plannedEnd: pastHours(20),
      hazards: ['Crude oil sludge fumes', 'Slippery oily surfaces'],
      ppeRequired: ['Full face gas mask', 'Disposable oil-resistant suits'],
      precautions: ['Gas freeing blower operational'],
      typeSpecificData: {
        oxygenPercent: 20.6,
        flammableLelPercent: 1.2,
        toxicPpmH2S: 2,
        toxicPpmCO: 4,
        standbyPersonName: 'James Kelly',
        rescueTripodInspected: false,
        forcedAirVentilation: true,
      },
    },
  ];

  for (const p of permitsSeed) {
    const createdPermit = await prisma.permit.create({
      data: {
        ...p,
        requesterId: requester.id,
      },
    });

    // Create Approval record
    let approvalStatus: ApprovalStatus = ApprovalStatus.PENDING;
    let approvedAt: Date | undefined;
    let rejectionReason: string | undefined;

    if (p.status === PermitStatus.APPROVED || p.status === PermitStatus.ACTIVE || p.status === PermitStatus.CLOSED || p.status === PermitStatus.CLOSED_VERIFIED) {
      approvalStatus = ApprovalStatus.APPROVED;
      approvedAt = new Date();
    } else if (p.status === PermitStatus.REJECTED) {
      approvalStatus = ApprovalStatus.REJECTED;
      rejectionReason = 'Scaffold inspection tag is invalid (RED). Drop zone was not barricaded.';
    }

    await prisma.permitApproval.create({
      data: {
        permitId: createdPermit.id,
        approverId: safetyOfficer.id,
        role: UserRole.SAFETY_OFFICER,
        status: approvalStatus,
        comment: approvalStatus === ApprovalStatus.APPROVED ? 'All mitigations verified and approved on-site.' : undefined,
        approvedAt,
        rejectionReason,
      },
    });

    // Create Initial Audit Log
    await prisma.permitAuditLog.create({
      data: {
        permitId: createdPermit.id,
        whoId: requester.id,
        action: 'PERMIT_CREATED',
        fromValue: null,
        toValue: PermitStatus.DRAFT,
        comment: 'Initial draft permit created with Job Safety Analysis attachments.',
      },
    });

    if (p.status !== PermitStatus.DRAFT) {
      await prisma.permitAuditLog.create({
        data: {
          permitId: createdPermit.id,
          whoId: safetyOfficer.id,
          action: 'STATUS_CHANGED',
          fromValue: PermitStatus.DRAFT,
          toValue: p.status,
          comment: `Permit progressed to ${p.status} following EHS protocol verification.`,
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
  console.log('====================================================');
  console.log('DEMO CREDENTIALS:');
  console.log('Requester:      requester@safework.com    | Password123!');
  console.log('Area Owner:     areaowner@safework.com    | Password123!');
  console.log('Safety Officer: safety@safework.com       | Password123!');
  console.log('Administrator:  admin@safework.com        | Password123!');
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
