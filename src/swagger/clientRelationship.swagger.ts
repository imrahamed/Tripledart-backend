/**
 * @swagger
 * tags:
 *   name: Client Relationships
 *   description: API endpoints for managing client-influencer relationships
 */

/**
 * @swagger
 * /api/client-relationships:
 *   post:
 *     summary: Create a new client relationship
 *     tags: [Client Relationships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - influencerId
 *               - clientId
 *               - status
 *             properties:
 *               influencerId:
 *                 type: string
 *               clientId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *               contractDetails:
 *                 type: object
 *     responses:
 *       201:
 *         description: Client relationship created successfully
 *       500:
 *         description: Error creating client relationship
 */

/**
 * @swagger
 * /api/client-relationships/influencer/{influencerId}:
 *   get:
 *     summary: Get all client relationships for an influencer
 *     tags: [Client Relationships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: influencerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client relationships retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   influencerId:
 *                     type: string
 *                   clientId:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [active, inactive, pending]
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *                   notes:
 *                     type: string
 *                   contractDetails:
 *                     type: object
 *       500:
 *         description: Error fetching client relationships
 */

/**
 * @swagger
 * /api/client-relationships/{id}:
 *   put:
 *     summary: Update client relationship
 *     tags: [Client Relationships]
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
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *               contractDetails:
 *                 type: object
 *     responses:
 *       200:
 *         description: Client relationship updated successfully
 *       404:
 *         description: Client relationship not found
 *       500:
 *         description: Error updating client relationship
 */ 