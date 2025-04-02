/**
 * @swagger
 * tags:
 *   name: Content
 *   description: API endpoints for managing content and content calendar
 */

/**
 * @swagger
 * /api/content/calendar/{campaignId}:
 *   get:
 *     summary: Get content calendar for a campaign
 *     tags: [Content]
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
 *         description: Content calendar retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contentItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       scheduledDate:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         enum: [draft, scheduled, published, archived]
 *                       platform:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [post, story, reel, video]
 *       500:
 *         description: Error fetching content calendar
 */

/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: Create new content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - campaignId
 *               - platform
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               campaignId:
 *                 type: string
 *               platform:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [post, story, reel, video]
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               mediaUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Content created successfully
 *       500:
 *         description: Error creating content
 */

/**
 * @swagger
 * /api/content/{id}:
 *   put:
 *     summary: Update content
 *     tags: [Content]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               platform:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [post, story, reel, video]
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               mediaUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, scheduled, published, archived]
 *     responses:
 *       200:
 *         description: Content updated successfully
 *       404:
 *         description: Content not found
 *       500:
 *         description: Error updating content
 */ 