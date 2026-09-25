import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';
import { prisma } from '../services/db.js';

describe('Permit State Machine & Workflow Test Suite (STEPS 4-7)', () => {
  let requesterToken: string;
  let requesterId: string;
  let areaOwnerToken: string;
  let areaOwnerId: string;
  let areaOwnerAreaId: string;
  let safetyOfficerToken: string;
  let safetyOfficerId: string;
  let adminToken: string;
  let plantId: string;
  let areaId: string;
  let equipmentId: string;

  beforeAll(async () => {
    // 1. Authenticate Requester
    const reqLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'requester@safework.com', password: 'Password123!' });
    requesterToken = reqLogin.body.data.token;
    requesterId = reqLogin.body.data.user.id;

    // 2. Authenticate Area Owner
    const aoLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'areaowner@safework.com', password: 'Password123!' });
    areaOwnerToken = aoLogin.body.data.token;
    areaOwnerId = aoLogin.body.data.user.id;
    areaOwnerAreaId = aoLogin.body.data.user.areaId;

    // 3. Authenticate Safety Officer
    const soLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'safety@safework.com', password: 'Password123!' });
    safetyOfficerToken = soLogin.body.data.token;
    safetyOfficerId = soLogin.body.data.user.id;

    // 4. Authenticate Admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@safework.com', password: 'Password123!' });
    adminToken = adminLogin.body.data.token;

    // 5. Get plant and area
    const plant = await prisma.plant.findFirst({ include: { areas: { include: { equipment: true } } } });
    if (!plant) throw new Error('Plant seed required');
    plantId = plant.id;
    areaId = areaOwnerAreaId || plant.areas[0].id;
    equipmentId = plant.areas[0].equipment[0]?.id;
  });

  let createdPermitId: string;

  it('STEP 4: POST /api/permits - Requester should create a valid HOT_WORK permit in DRAFT status', async () => {
    const start = new Date(Date.now() - 60000); // 1 min ago so activation window is valid
    const end = new Date(Date.now() + 8 * 3600 * 1000); // 8 hours later

    const res = await request(app)
      .post('/api/permits')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        type: 'HOT_WORK',
        contractorTeam: 'Apex Mechanical Welding Services',
        workDescription: 'Repair cracked weld seam on reaction vessel nozzle N2',
        plantId,
        areaId,
        equipmentId,
        plannedStart: start.toISOString(),
        plannedEnd: end.toISOString(),
        hazards: ['Flammable hydrocarbon vapors', 'High surface temperature (>300C)', 'Flying sparks'],
        ppeRequired: ['Welding hood shade 11', 'Fire-retardant jacket', 'Leather welding gauntlets'],
        precautions: ['Combustible radius cleared (11m)', 'Continuous LEL monitoring active', 'Dedicated fire watch on site'],
        typeSpecificData: {
          hotWorkType: 'welding',
          fireWatchAssigned: true,
          fireExtinguisherType: 'ABC Dry Chemical (9kg)',
          combustibleClearanceRadius: 11,
          gasTestLelPercent: 0,
          gasTestO2Percent: 20.9,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.type).toBe('HOT_WORK');
    expect(res.body.data.permitNumber).toMatch(/^PTW-/);
    createdPermitId = res.body.data.id;
  });

  it('STEP 4: PATCH /api/permits/:id - status modification via PATCH must be REJECTED', async () => {
    const res = await request(app)
      .patch(`/api/permits/${createdPermitId}`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        status: 'ACTIVE',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('STATUS_MODIFICATION_PROHIBITED');
  });

  it('STEP 5: POST /api/permits/:id/activate - Premature activation from DRAFT must be REJECTED', async () => {
    const res = await request(app)
      .post(`/api/permits/${createdPermitId}/activate`)
      .set('Authorization', `Bearer ${requesterToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('INVALID_STATE_TRANSITION');
  });

  it('STEP 5: POST /api/permits/:id/submit - Transition DRAFT -> PENDING_APPROVAL', async () => {
    const res = await request(app)
      .post(`/api/permits/${createdPermitId}/submit`)
      .set('Authorization', `Bearer ${requesterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING_APPROVAL');
  });

  it('STEP 6: CRITICAL - Requester cannot approve their own permit (Self-Approval Forbidden)', async () => {
    const res = await request(app)
      .post(`/api/permits/${createdPermitId}/approve`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ comment: 'Attempting self-approval' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('SELF_APPROVAL_FORBIDDEN');
  });

  it('STEP 6: Rejection requires a reason', async () => {
    const res = await request(app)
      .post(`/api/permits/${createdPermitId}/reject`)
      .set('Authorization', `Bearer ${safetyOfficerToken}`)
      .send({ reason: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('VALIDATION_ERROR');
  });

  it('STEP 6: Multi-Stage Approval - Stage 1: Area Owner Approves', async () => {
    // If areaOwner does not belong to areaId, assign areaOwner to areaId for test repeatability
    await prisma.user.update({
      where: { id: areaOwnerId },
      data: { areaId },
    });

    const res = await request(app)
      .post(`/api/permits/${createdPermitId}/approve`)
      .set('Authorization', `Bearer ${areaOwnerToken}`)
      .send({ comment: 'Process unit verified isolated, drains flushed, water curtain established.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Still PENDING_APPROVAL until Safety Officer also approves
    expect(res.body.data.status).toBe('PENDING_APPROVAL');
  });

  it('STEP 6: Duplicate approval by same user is rejected', async () => {
    const res = await request(app)
      .post(`/api/permits/${createdPermitId}/approve`)
      .set('Authorization', `Bearer ${areaOwnerToken}`)
      .send({ comment: 'Duplicate sign-off' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('DUPLICATE_APPROVAL');
  });

  it('STEP 6: Multi-Stage Approval - Stage 2: Safety Officer Approves -> Status becomes APPROVED', async () => {
    const res = await request(app)
      .post(`/api/permits/${createdPermitId}/approve`)
      .set('Authorization', `Bearer ${safetyOfficerToken}`)
      .send({ comment: 'Gas detector calibrated, LEL 0.0% verified, hot work safety permit countersigned.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('STEP 5: Activation Rule - Cannot activate if plannedStart is in the future', async () => {
    // Create a permit with future start date
    const futurePermit = await prisma.permit.create({
      data: {
        permitNumber: 'PTW-TEST-FUTURE-' + Date.now(),
        type: 'HOT_WORK',
        status: 'APPROVED',
        requesterId,
        contractorTeam: 'Test Future Crew',
        workDescription: 'Future test work description',
        plantId,
        areaId,
        plannedStart: new Date(Date.now() + 24 * 3600 * 1000), // Tomorrow
        plannedEnd: new Date(Date.now() + 48 * 3600 * 1000),
        hazards: ['Test Hazard'],
        ppeRequired: ['Test PPE'],
        precautions: ['Test Precaution'],
      },
    });

    const res = await request(app)
      .post(`/api/permits/${futurePermit.id}/activate`)
      .set('Authorization', `Bearer ${requesterToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('PREMATURE_ACTIVATION');
  });

  it('STEP 5: Activation within valid window: APPROVED -> ACTIVE', async () => {
    const res = await request(app)
      .post(`/api/permits/${createdPermitId}/activate`)
      .set('Authorization', `Bearer ${requesterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('STEP 5 & 6: Safety Officer suspends ACTIVE permit: ACTIVE -> SUSPENDED', async () => {
    const res = await request(app)
      .post(`/api/permits/${createdPermitId}/suspend`)
      .set('Authorization', `Bearer ${safetyOfficerToken}`)
      .send({ reason: 'Sudden rainstorm causing lightning hazard near fuel storage tanks' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SUSPENDED');
  });

  it('STEP 5: Safety Officer resumes SUSPENDED permit: SUSPENDED -> ACTIVE', async () => {
    const res = await request(app)
      .post(`/api/permits/${createdPermitId}/resume`)
      .set('Authorization', `Bearer ${safetyOfficerToken}`)
      .send({ comment: 'Storm cleared, atmospheric testing revalidated, safe to resume work' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('STEP 7: Closure Workflow - Requester completes work: ACTIVE -> CLOSED', async () => {
    const res = await request(app)
      .post(`/api/permits/${createdPermitId}/close`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ completionNotes: 'Welding completed on nozzle N2. Weld visually inspected, slag removed, fire watch stood down.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CLOSED');
  });

  it('STEP 7: Closure Workflow - Safety Officer verifies closure: CLOSED -> CLOSED_VERIFIED', async () => {
    const res = await request(app)
      .post(`/api/permits/${createdPermitId}/verify-closure`)
      .set('Authorization', `Bearer ${safetyOfficerToken}`)
      .send({ verificationComment: 'Site inspection completed. Housekeeping acceptable, tags cleared, permit closed.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CLOSED_VERIFIED');
  });

  it('STEP 7: Immutable Audit Trail - Timeline contains complete history', async () => {
    const res = await request(app)
      .get(`/api/permits/${createdPermitId}`)
      .set('Authorization', `Bearer ${requesterToken}`);

    expect(res.status).toBe(200);
    const permit = res.body.data;
    expect(permit.auditLogs.length).toBeGreaterThanOrEqual(6);

    const actions = permit.auditLogs.map((log: any) => log.action);
    expect(actions).toContain('PERMIT_CREATED');
    expect(actions).toContain('PERMIT_SUBMITTED');
    expect(actions).toContain('PERMIT_ACTIVATED');
    expect(actions).toContain('PERMIT_SUSPENDED');
    expect(actions).toContain('PERMIT_RESUMED');
    expect(actions).toContain('PERMIT_CLOSED');
    expect(actions).toContain('CLOSURE_VERIFIED');
  });
});
