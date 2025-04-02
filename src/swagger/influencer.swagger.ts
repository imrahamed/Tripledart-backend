/**
 * @swagger
 * tags:
 *   name: Influencers
 *   description: API endpoints for managing influencers
 */

/**
 * @swagger
 * /api/influencers:
 *   post:
 *     summary: Create a new influencer
 *     tags: [Influencers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               socialMedia:
 *                 type: object
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Influencer created successfully
 *       500:
 *         description: Error creating influencer
 */

/**
 * @swagger
 * /api/influencers/{id}:
 *   get:
 *     summary: Get influencer by ID
 *     tags: [Influencers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Influencer retrieved successfully
 *       404:
 *         description: Influencer not found
 *       500:
 *         description: Error fetching influencer
 */

/**
 * @swagger
 * /api/influencers/search:
 *   get:
 *     summary: Search influencers
 *     tags: [Influencers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *       - in: query
 *         name: followers
 *         schema:
 *           type: number
 *     responses:
 *       201:
 *         description: Search results retrieved successfully
 *       500:
 *         description: Error searching influencers
 */

/**
 * @swagger
 * /api/influencers/{id}/sync-phyllo:
 *   post:
 *     summary: Sync influencer data with Phyllo
 *     tags: [Influencers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Sync completed successfully
 *       404:
 *         description: Could not sync influencer with Phyllo
 *       500:
 *         description: Error syncing with Phyllo
 */

/**
 * @swagger
 * /api/influencers/{id}/analytics:
 *   get:
 *     summary: Get influencer analytics
 *     tags: [Influencers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Analytics retrieved successfully
 *       404:
 *         description: Analytics not found
 *       500:
 *         description: Error fetching analytics
 */

/**
 * @swagger
 * /api/influencers/{id}/verify:
 *   post:
 *     summary: Verify an influencer
 *     tags: [Influencers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Influencer verified successfully
 *       404:
 *         description: Could not verify influencer
 *       500:
 *         description: Error verifying influencer
 */

/**
 * @swagger
 * /api/influencers/{id}:
 *   put:
 *     summary: Update influencer details
 *     tags: [Influencers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               socialMedia:
 *                 type: object
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Influencer updated successfully
 *       404:
 *         description: Influencer not found
 *       500:
 *         description: Error updating influencer
 */

/**
 * @swagger
 * /api/influencers/{id}:
 *   delete:
 *     summary: Delete an influencer
 *     tags: [Influencers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Influencer deleted successfully
 *       404:
 *         description: Influencer not found
 *       500:
 *         description: Error deleting influencer
 */

/**
 * @swagger
 * /api/influencers/{id}/phyllo-data:
 *   get:
 *     summary: Get influencer's Phyllo data
 *     tags: [Influencers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Phyllo data retrieved successfully
 *       404:
 *         description: Phyllo data not found
 *       500:
 *         description: Error fetching Phyllo data
 */

/**
 * @swagger
 * /api/influencers/categories:
 *   get:
 *     summary: Get all influencer categories
 *     tags: [Influencers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Categories retrieved successfully
 *       500:
 *         description: Error fetching categories
 */

/**
 * @swagger
 * /api/influencers/platforms:
 *   get:
 *     summary: Get all influencer platforms
 *     tags: [Influencers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Platforms retrieved successfully
 *       500:
 *         description: Error fetching platforms
 */ 