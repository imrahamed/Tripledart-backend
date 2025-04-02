/**
 * @swagger
 * tags:
 *   name: Platform Settings
 *   description: API endpoints for managing platform settings
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Platforms synced successfully
 *                 platforms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       description:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *       500:
 *         description: Failed to sync platforms
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Topics synced successfully
 *                 topics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       category:
 *                         type: string
 *                       description:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *       500:
 *         description: Failed to sync topics
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Locations synced successfully
 *                 locations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       type:
 *                         type: string
 *                       parentCode:
 *                         type: string
 *                       description:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *       500:
 *         description: Failed to sync locations
 */

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
 *         description: Platform settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 settings:
 *                   type: object
 *                   properties:
 *                     platforms:
 *                       type: array
 *                       items:
 *                         type: object
 *                     topics:
 *                       type: array
 *                       items:
 *                         type: object
 *                     locations:
 *                       type: array
 *                       items:
 *                         type: object
 *                     lastSync:
 *                       type: string
 *                       format: date-time
 *                     updatedBy:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: No platform settings found
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Platform status updated successfully
 *                 platforms:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Platform settings or item not found
 *       500:
 *         description: Failed to update status
 */