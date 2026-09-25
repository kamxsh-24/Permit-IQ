import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', AuthController.login);
router.get('/me', requireAuth, AuthController.getMe);

export default router;
