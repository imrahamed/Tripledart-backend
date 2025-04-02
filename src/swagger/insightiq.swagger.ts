/**
 * @swagger
 * tags:
 *   name: InsightIQ
 *   description: API endpoints for managing InsightIQ sync operations
 */

/**
 * @swagger
 * /api/insightiq/sync:
 *   post:
 *     summary: Trigger a sync job with search parameters
 *     tags: [InsightIQ]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - searchParams
 *             properties:
 *               searchParams:
 *                 type: object
 *                 properties:
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *                   platforms:
 *                     type: array
 *                     items:
 *                       type: string
 *                   categories:
 *                     type: array
 *                     items:
 *                       type: string
 *                   locations:
 *                     type: array
 *                     items:
 *                       type: string
 *                   followers:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: number
 *                       max:
 *                         type: number
 *                   engagement:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: number
 *                       max:
 *                         type: number
 *     responses:
 *       200:
 *         description: Sync job scheduled successfully
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
 *                   example: Sync job scheduled successfully
 *                 jobId:
 *                   type: string
 *       400:
 *         description: Search parameters are required
 *       500:
 *         description: Failed to schedule sync job
 */

/**
 * @swagger
 * /api/insightiq/sync/profile/{profileId}:
 *   post:
 *     summary: Trigger a sync job for a specific profile
 *     tags: [InsightIQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile sync job scheduled successfully
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
 *                   example: Profile sync job scheduled successfully
 *                 jobId:
 *                   type: string
 *       400:
 *         description: Profile ID is required
 *       500:
 *         description: Failed to schedule profile sync job
 */

/**
 * @swagger
 * /api/insightiq/sync/recurring:
 *   post:
 *     summary: Schedule a recurring sync job
 *     tags: [InsightIQ]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - searchParams
 *               - cronSchedule
 *             properties:
 *               searchParams:
 *                 type: object
 *                 properties:
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *                   platforms:
 *                     type: array
 *                     items:
 *                       type: string
 *                   categories:
 *                     type: array
 *                     items:
 *                       type: string
 *                   locations:
 *                     type: array
 *                     items:
 *                       type: string
 *                   followers:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: number
 *                       max:
 *                         type: number
 *                   engagement:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: number
 *                       max:
 *                         type: number
 *               cronSchedule:
 *                 type: string
 *                 description: Cron expression for scheduling
 *     responses:
 *       200:
 *         description: Recurring sync job scheduled successfully
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
 *                   example: Recurring sync job scheduled successfully
 *                 jobId:
 *                   type: string
 *       400:
 *         description: Search parameters and cron schedule are required
 *       500:
 *         description: Failed to schedule recurring sync job
 */

/**
 * @swagger
 * /api/insightiq/jobs:
 *   get:
 *     summary: Get all active sync jobs
 *     tags: [InsightIQ]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sync jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       data:
 *                         type: object
 *                       timestamp:
 *                         type: number
 *       500:
 *         description: Failed to get sync jobs
 */

/**
 * @swagger
 * /api/insightiq/jobs/{jobId}:
 *   get:
 *     summary: Get a specific job by ID
 *     tags: [InsightIQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 job:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     data:
 *                       type: object
 *                     timestamp:
 *                       type: number
 *                     returnvalue:
 *                       type: object
 *                     failedReason:
 *                       type: string
 *                     stacktrace:
 *                       type: string
 *                     opts:
 *                       type: object
 *       400:
 *         description: Job ID is required
 *       404:
 *         description: Job not found
 *       500:
 *         description: Failed to get job
 */ 