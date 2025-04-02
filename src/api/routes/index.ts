import express from 'express';
import analyticsRoutes from './analytics.routes';
import contentRoutes from './content.routes';
import clientRelationshipRoutes from './clientRelationship.routes';
import revenueRoutes from './revenue.routes';
import userRoutes from './user.routes';
import influencerRoutes from './influencer.routes';
import campaignRoutes from './campaign.routes';
import authRoutes from './authRoutes';
import insightiqRoutes from './insightiq.routes';
import platformSettingsRoutes from './platformSettings.routes';
import workspaceRoutes from './workspace.routes';

const router = express.Router();

router.use('/analytics', analyticsRoutes);
router.use('/content', contentRoutes);
router.use('/client-relationships', clientRelationshipRoutes);
router.use('/revenue', revenueRoutes);
router.use('/users', userRoutes);
router.use('/influencers', influencerRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/auth', authRoutes);
router.use('/insightiq', insightiqRoutes);
router.use('/platform-settings', platformSettingsRoutes);
router.use('/workspaces', workspaceRoutes);

export default router;
