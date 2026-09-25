import { Router } from 'express';
import { PermitController } from '../controllers/permitController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All permit endpoints require an authenticated user
router.use(requireAuth);

// Analytics & Specialty Queries
router.get('/stats', PermitController.getStats);
router.get('/pending-approvals', PermitController.getPendingApprovals);
router.get('/conflicts', PermitController.checkConflicts);

// CRUD
router.get('/', PermitController.list);
router.post('/', PermitController.create);
router.get('/:id', PermitController.getById);
router.patch('/:id', PermitController.update);

// Dedicated Lifecycle State Machine Transitions
router.post('/:id/submit', PermitController.submit);
router.post('/:id/approve', PermitController.approve);
router.post('/:id/reject', PermitController.reject);
router.post('/:id/activate', PermitController.activate);
router.post('/:id/suspend', PermitController.suspend);
router.post('/:id/resume', PermitController.resume);
router.post('/:id/close', PermitController.close);
router.post('/:id/verify-closure', PermitController.verifyClosure);
router.post('/:id/cancel', PermitController.cancel);

export default router;
