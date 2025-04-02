/**
 * @swagger
 * tags:
 *   name: Campaigns
 *   description: API endpoints for managing campaigns
 */

/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
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
 *               - description
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               budget:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [draft, active, completed, cancelled]
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       500:
 *         description: Error creating campaign
 */

/**
 * @swagger
 * /api/campaigns/{id}:
 *   get:
 *     summary: Get campaign by ID
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign retrieved successfully
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Error fetching campaign
 */

/**
 * @swagger
 * /api/campaigns/{id}:
 *   put:
 *     summary: Update campaign details
 *     tags: [Campaigns]
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
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               budget:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [draft, active, completed, cancelled]
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Error updating campaign
 */

/**
 * @swagger
 * /api/campaigns/{id}:
 *   delete:
 *     summary: Delete a campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign deleted successfully
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Error deleting campaign
 */

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Campaigns retrieved successfully
 *       500:
 *         description: Error fetching campaigns
 */ 