import { Router } from 'express';
import { InfluencerController } from '../controllers/influencer.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';

const router = Router();

router.post('/', authenticate, authorize(['admin', 'brand']), InfluencerController.createInfluencer);
router.get('/', authenticate, InfluencerController.searchInfluencers);
router.get('/:id', authenticate, InfluencerController.getInfluencer);
router.put('/:id', authenticate, authorize(['admin', 'brand', 'influencer']), InfluencerController.updateInfluencer);
router.delete('/:id', authenticate, authorize(['admin']), InfluencerController.deleteInfluencer);

// Additional route for Phyllo sync, accessible by brand or admin
router.post('/:id/sync-phyllo', authenticate, authorize(['admin', 'brand']), InfluencerController.syncPhyllo);

export default router;
