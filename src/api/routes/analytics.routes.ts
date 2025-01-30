
import express from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { getCampaignAnalyticsSchema } from '../../validations/analytics.validation';

const router = express.Router();

router.get(
  '/campaign/:campaignId',
  validateRequest(getCampaignAnalyticsSchema),
  AnalyticsController.getCampaignAnalytics
);

export default router;
