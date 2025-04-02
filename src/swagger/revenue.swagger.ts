/**
 * @swagger
 * tags:
 *   name: Revenue
 *   description: API endpoints for managing revenue and financial data
 */

/**
 * @swagger
 * /api/revenue/overview:
 *   get:
 *     summary: Get revenue overview
 *     tags: [Revenue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Revenue overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *                 revenueBySource:
 *                   type: object
 *                   properties:
 *                     campaigns:
 *                       type: number
 *                     sponsorships:
 *                       type: number
 *                     other:
 *                       type: number
 *                 revenueByPeriod:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       period:
 *                         type: string
 *                       amount:
 *                         type: number
 *       500:
 *         description: Error fetching revenue overview
 */

/**
 * @swagger
 * /api/revenue:
 *   post:
 *     summary: Add new revenue entry
 *     tags: [Revenue]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - source
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *               source:
 *                 type: string
 *                 enum: [campaign, sponsorship, other]
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               campaignId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Revenue entry added successfully
 *       500:
 *         description: Error adding revenue
 */ 