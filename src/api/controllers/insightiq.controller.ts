import { Request, Response } from "express";
import { 
    scheduleInsightIQSync, 
    scheduleRecurringSync, 
    scheduleSingleProfileSync,
    insightIQSyncQueue
} from "../../jobs/insightiqSync.job";
import { InsightIQSearchParams } from "../../integrations/insightiq.service";

/**
 * Controller for InsightIQ sync operations
 */
export class InsightIQController {
    /**
     * Trigger a sync job with search parameters
     * @param req Request
     * @param res Response
     */
    static async triggerSync(req: Request, res: Response): Promise<void> {
        try {
            const searchParams: InsightIQSearchParams = req.body;
            
            if (!searchParams || Object.keys(searchParams).length === 0) {
                res.status(400).json({
                    success: false,
                    message: "Search parameters are required"
                });
                return;
            }
            
            const job = await scheduleInsightIQSync({ searchParams });
            
            res.status(200).json({
                success: true,
                message: "Sync job scheduled successfully",
                jobId: job.id
            });
        } catch (error) {
            console.error("Error scheduling sync job:", error);
            res.status(500).json({
                success: false,
                message: "Failed to schedule sync job",
                error: (error as Error).message
            });
        }
    }
    
    /**
     * Trigger a sync job for a specific profile
     * @param req Request
     * @param res Response
     */
    static async triggerProfileSync(req: Request, res: Response): Promise<void> {
        try {
            const { profileId } = req.params;
            
            if (!profileId) {
                res.status(400).json({
                    success: false,
                    message: "Profile ID is required"
                });
                return;
            }
            
            const job = await scheduleSingleProfileSync(profileId);
            
            res.status(200).json({
                success: true,
                message: "Profile sync job scheduled successfully",
                jobId: job.id
            });
        } catch (error) {
            console.error("Error scheduling profile sync job:", error);
            res.status(500).json({
                success: false,
                message: "Failed to schedule profile sync job",
                error: (error as Error).message
            });
        }
    }
    
    /**
     * Schedule a recurring sync job
     * @param req Request
     * @param res Response
     */
    static async scheduleRecurringSync(req: Request, res: Response): Promise<void> {
        try {
            const { searchParams, cronSchedule } = req.body;
            
            if (!searchParams || Object.keys(searchParams).length === 0) {
                res.status(400).json({
                    success: false,
                    message: "Search parameters are required"
                });
                return;
            }
            
            const job = await scheduleRecurringSync(searchParams, cronSchedule);
            
            res.status(200).json({
                success: true,
                message: "Recurring sync job scheduled successfully",
                jobId: job.id
            });
        } catch (error) {
            console.error("Error scheduling recurring sync job:", error);
            res.status(500).json({
                success: false,
                message: "Failed to schedule recurring sync job",
                error: (error as Error).message
            });
        }
    }
    
    /**
     * Get all active sync jobs
     * @param req Request
     * @param res Response
     */
    static async getJobs(req: Request, res: Response): Promise<void> {
        try {
            const jobs = await insightIQSyncQueue.getJobs();
            
            res.status(200).json({
                success: true,
                jobs: jobs.map(job => ({
                    id: job.id,
                    name: job.name,
                    data: job.data,
                    timestamp: job.timestamp
                }))
            });
        } catch (error) {
            console.error("Error getting sync jobs:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get sync jobs",
                error: (error as Error).message
            });
        }
    }
    
    /**
     * Get a specific job by ID
     * @param req Request
     * @param res Response
     */
    static async getJob(req: Request, res: Response): Promise<void> {
        try {
            const { jobId } = req.params;
            
            if (!jobId) {
                res.status(400).json({
                    success: false,
                    message: "Job ID is required"
                });
                return;
            }
            
            const job = await insightIQSyncQueue.getJob(jobId);
            
            if (!job) {
                res.status(404).json({
                    success: false,
                    message: "Job not found"
                });
                return;
            }
            
            res.status(200).json({
                success: true,
                job: {
                    id: job.id,
                    name: job.name,
                    data: job.data,
                    timestamp: job.timestamp,
                    returnvalue: job.returnvalue,
                    failedReason: job.failedReason,
                    stacktrace: job.stacktrace,
                    opts: job.opts
                }
            });
        } catch (error) {
            console.error("Error getting job:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get job",
                error: (error as Error).message
            });
        }
    }
} 