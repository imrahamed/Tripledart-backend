import { Router } from "express";
import { InsightIQController } from "../controllers/insightiq.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";

const router = Router();

/**
 * @swagger
 * /api/insightiq/sync:
 *   post:
 *     summary: Trigger a sync job with search parameters
 *     tags: [InsightIQ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *                 description: Social media platform
 *               username:
 *                 type: string
 *                 description: Username to search for
 *               category:
 *                 type: string
 *                 description: Category to filter by
 *               language:
 *                 type: string
 *                 description: Language to filter by
 *               location:
 *                 type: string
 *                 description: Location to filter by
 *               minFollowers:
 *                 type: number
 *                 description: Minimum number of followers
 *               maxFollowers:
 *                 type: number
 *                 description: Maximum number of followers
 *               minEngagement:
 *                 type: number
 *                 description: Minimum engagement rate
 *               maxEngagement:
 *                 type: number
 *                 description: Maximum engagement rate
 *               page:
 *                 type: number
 *                 description: Page number for pagination
 *               limit:
 *                 type: number
 *                 description: Number of results per page
 *     responses:
 *       200:
 *         description: Sync job scheduled successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post("/sync", authenticate, authorize(["admin"]), InsightIQController.triggerSync);

/**
 * @swagger
 * /api/insightiq/sync/profile/{profileId}:
 *   post:
 *     summary: Trigger a sync job for a specific profile
 *     tags: [InsightIQ]
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the profile to sync
 *     responses:
 *       200:
 *         description: Profile sync job scheduled successfully
 *       400:
 *         description: Invalid profile ID
 *       500:
 *         description: Server error
 */
router.post("/sync/profile/:profileId", authenticate, authorize(["admin"]), InsightIQController.triggerProfileSync);

/**
 * @swagger
 * /api/insightiq/sync/recurring:
 *   post:
 *     summary: Schedule a recurring sync job
 *     tags: [InsightIQ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               searchParams:
 *                 type: object
 *                 description: Search parameters for InsightIQ
 *               cronSchedule:
 *                 type: string
 *                 description: Cron schedule for the recurring job
 *     responses:
 *       200:
 *         description: Recurring sync job scheduled successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post("/sync/recurring", authenticate, authorize(["admin"]), InsightIQController.scheduleRecurringSync);

/**
 * @swagger
 * /api/insightiq/jobs:
 *   get:
 *     summary: Get all active sync jobs
 *     tags: [InsightIQ]
 *     responses:
 *       200:
 *         description: List of active sync jobs
 *       500:
 *         description: Server error
 */
router.get("/jobs", authenticate, authorize(["admin"]), InsightIQController.getJobs);

/**
 * @swagger
 * /api/insightiq/jobs/{jobId}:
 *   get:
 *     summary: Get a specific job by ID
 *     tags: [InsightIQ]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the job to get
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get("/jobs/:jobId", authenticate, authorize(["admin"]), InsightIQController.getJob);

export default router; 