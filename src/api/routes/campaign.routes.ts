import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';

const router = Router();

router.post('/', authenticate, authorize(['brand']), CampaignController.createCampaign);
router.get('/', authenticate, authorize(['admin', 'brand']), CampaignController.getAllCampaigns);
router.get('/:id', authenticate, CampaignController.getCampaign);
router.put('/:id', authenticate, authorize(['brand']), CampaignController.updateCampaign);
router.delete('/:id', authenticate, authorize(['admin', 'brand']), CampaignController.deleteCampaign);

export default router;
