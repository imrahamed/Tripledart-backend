/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: API endpoints for analytics and reporting
 */

/**
 * @swagger
 * /api/analytics/campaign/{campaignId}:
 *   get:
 *     summary: Get campaign analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Campaign analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalReach:
 *                   type: number
 *                 totalEngagement:
 *                   type: number
 *                 totalImpressions:
 *                   type: number
 *                 totalClicks:
 *                   type: number
 *                 conversionRate:
 *                   type: number
 *                 roi:
 *                   type: number
 *                 dailyStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       reach:
 *                         type: number
 *                       engagement:
 *                         type: number
 *                       impressions:
 *                         type: number
 *                       clicks:
 *                         type: number
 *       500:
 *         description: Error fetching campaign analytics
 */ 