import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import permitRoutes from './permitRoutes.js';
import plantRoutes from './plantRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/permits', permitRoutes);
router.use('/', plantRoutes);

export default router;
