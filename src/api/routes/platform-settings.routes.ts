import { Router } from 'express';
import { platformSettingsController } from '../controllers/platform-settings.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, platformSettingsController.getAllPlatforms);
router.get('/:id', authenticate, platformSettingsController.getPlatformById);

export default router; 