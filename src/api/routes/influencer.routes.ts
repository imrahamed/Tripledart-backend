import { Router } from 'express';
import { InfluencerController } from '../controllers/influencer.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';

const router = Router();
const influencerController = new InfluencerController();

// Base routes
router.post('/', authenticate, authorize(['admin', 'brand']), influencerController.createInfluencer);
router.get('/', authenticate, influencerController.searchInfluencers);
router.get('/:id', authenticate, influencerController.getInfluencer);
router.put('/:id', authenticate, authorize(['admin', 'brand', 'influencer']), influencerController.updateInfluencer);
router.delete('/:id', authenticate, authorize(['admin']), influencerController.deleteInfluencer);

// Platform profile routes
router.post('/:id/platform-profiles', authenticate, authorize(['admin', 'brand']), influencerController.addPlatformProfile);
router.put('/:id/platform-profiles/:platformId', authenticate, authorize(['admin', 'brand']), influencerController.updatePlatformProfile);

// UI profile routes
router.put('/:id/ui-profile', authenticate, authorize(['admin', 'brand', 'influencer']), influencerController.updateUiProfile);

// Analytics and verification routes
router.get('/:id/analytics', authenticate, authorize(['admin', 'brand', 'influencer']), influencerController.getAnalytics);
router.post('/:id/verify', authenticate, authorize(['admin']), influencerController.verifyInfluencer);

// InsightIQ integration routes
router.post('/:id/sync-insightiq', authenticate, authorize(['admin', 'brand']), influencerController.syncWithInsightIQ);

// Search and filter routes
router.get('/search', authenticate, influencerController.searchInfluencers);
router.get('/categories', authenticate, influencerController.getCategories);
router.get('/platforms', authenticate, influencerController.getPlatforms);
router.get('/topics', authenticate, influencerController.getTopics);
router.get('/genders', authenticate, influencerController.getGenders);
router.get('/account-types', authenticate, influencerController.getAccountTypes);

export default router;
