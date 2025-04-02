import { Router } from 'express';
import { PlatformSettingsController } from '../controllers/platformSettings.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';

const router = Router();

/**
 * @swagger
 * /api/platform-settings/sync-platforms:
 *   post:
 *     summary: Sync platforms from InsightIQ
 *     tags: [Platform Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platforms synced successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/sync-platforms', authenticate, authorize(['admin']), PlatformSettingsController.syncPlatforms);

/**
 * @swagger
 * /api/platform-settings/sync-topics:
 *   post:
 *     summary: Sync topics from InsightIQ
 *     tags: [Platform Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Topics synced successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/sync-topics', authenticate, authorize(['admin']), PlatformSettingsController.syncTopics);

/**
 * @swagger
 * /api/platform-settings/sync-locations:
 *   post:
 *     summary: Sync locations from InsightIQ
 *     tags: [Platform Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Locations synced successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/sync-locations', authenticate, authorize(['admin']), PlatformSettingsController.syncLocations);

/**
 * @swagger
 * /api/platform-settings:
 *   get:
 *     summary: Get current platform settings
 *     tags: [Platform Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current platform settings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, authorize(['admin']), PlatformSettingsController.getSettings);

/**
 * @swagger
 * /api/platform-settings/status:
 *   put:
 *     summary: Update platform, topic, or location status
 *     tags: [Platform Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - code
 *               - isActive
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [platforms, topics, locations]
 *               code:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.put('/status', authenticate, authorize(['admin']), PlatformSettingsController.updateStatus);

export default router;