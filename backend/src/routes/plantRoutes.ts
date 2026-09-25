import { Router } from 'express';
import { PlantController } from '../controllers/plantController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/plants', PlantController.getPlants);
router.get('/areas', PlantController.getAreas);
router.get('/equipment', PlantController.getEquipment);

export default router;
