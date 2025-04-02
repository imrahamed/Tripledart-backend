import { Queue, Worker, Job } from "bullmq";
import { redisClient } from "../config/redisClient";
import { insightIQService } from "../services/insightiq.service";
import { InfluencerModel } from "../core/models/influencer.model";
import { UserModel } from "../core/models/user.model";
import mongoose from "mongoose";
import { ENV } from "../config/environment";

// Define interfaces
interface InsightIQCreatorProfile {
    id: string;
    username: string;
    platform: string;
    displayName?: string;
    bio?: string;
    followers?: number;
    following?: number;
    engagement?: number;
    profilePictureUrl?: string;
    categories?: string[];
    locations?: string[];
    accountType?: string;
}

interface InsightIQSearchParams {
    platform?: string;
    username?: string;
    category?: string;
    language?: string;
    location?: string;
    minFollowers?: number;
    maxFollowers?: number;
    minEngagement?: number;
    maxEngagement?: number;
    page?: number;
    limit?: number;
}

interface InsightIQExportParams {
    platform?: string;
    username?: string;
    category?: string;
    language?: string;
    location?: string;
    minFollowers?: number;
    maxFollowers?: number;
    minEngagement?: number;
    maxEngagement?: number;
    page?: number;
    limit?: number;
    exportFormat?: 'json' | 'csv';
}

interface IPlatformProfile {
    // Add any necessary properties for the IPlatformProfile interface
}

// Define the job data interface
interface SyncJobData {
    searchParams?: InsightIQSearchParams;
    profileId?: string;
    exportParams?: InsightIQExportParams;
    exportId?: string;
}

// Redis connection options
const redisConnection = {
    connection: {
        host: new URL(ENV.REDIS_URI).hostname,
        port: parseInt(new URL(ENV.REDIS_URI).port),
        password: new URL(ENV.REDIS_URI).password
    }
};

// Create a queue for InsightIQ sync jobs
export const insightIQSyncQueue = new Queue<SyncJobData>("insightiq-sync", redisConnection);

/**
 * Process a single creator profile from InsightIQ
 * - Creates a new user if not exists
 * - Creates a new influencer if not exists
 * - Updates existing influencer with new platform profiles
 * 
 * @param profile The creator profile from InsightIQ
 */
async function processCreatorProfile(profile: InsightIQCreatorProfile): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const email = `${profile.username.toLowerCase()}@${profile.platform.toLowerCase()}.insightiq`;
        let user = await UserModel.findOne({ email }).session(session);
        
        if (!user) {
            const newUsers = await UserModel.create([{
                name: profile.displayName || profile.username,
                email,
                password: Math.random().toString(36).slice(-10),
                role: "influencer" as const
            }], { session });
            user = newUsers[0];
        }

        const platformProfile = {
            full_name: profile.displayName || profile.username,
            url: `https://${profile.platform.toLowerCase()}.com/${profile.username}`,
            image_url: profile.profilePictureUrl || "",
            follower_count: profile.followers || 0,
            connection_count: profile.following || 0,
            introduction: profile.bio || "",
            profile_headline: profile.bio || "",
            external_id: profile.id,
            creator_account_type: profile.accountType ? [profile.accountType] : [],
            work_platform: {
                id: profile.platform,
                name: profile.platform,
                logo_url: ""
            },
            creator_location: {
                city: profile.locations?.[0] || "Unknown",
                state: "",
                country: profile.locations?.[0] || "Unknown"
            },
            talks_about: profile.categories || [],
            open_to: [],
            current_positions: [],
            engagement_rate: profile.engagement || 0,
            metadata: {
                lastUpdated: new Date(),
                dataSource: 'insightiq',
                lastSyncDate: new Date(),
                platformSpecificData: profile
            }
        };

        await insightIQService.createOrUpdateInfluencer(email, platformProfile);
        
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        console.error(`Error processing creator profile ${profile.username}:`, error);
        throw error;
    } finally {
        session.endSession();
    }
}

/**
 * Worker to process InsightIQ sync jobs
 */
export const insightIQSyncWorker = new Worker<SyncJobData>(
    "insightiq-sync",
    async (job: Job<SyncJobData>) => {
        try {
            const { searchParams, profileId, exportParams, exportId } = job.data;
            
            if (exportId) {
                // Check export status and download if ready
                const status = await insightIQService.getExportStatus(exportId);
                
                if (status.status === 'completed' && status.downloadUrl) {
                    const data = await insightIQService.downloadExport(exportId);
                    const profiles = JSON.parse(data.toString());
                    
                    // Process each profile
                    const results = await Promise.allSettled(
                        profiles.map((profile: IPlatformProfile) => processCreatorProfile(profile as unknown as InsightIQCreatorProfile))
                    );
                    
                    const successful = results.filter((r: PromiseSettledResult<void>) => r.status === "fulfilled").length;
                    const failed = results.filter((r: PromiseSettledResult<void>) => r.status === "rejected").length;
                    
                    return {
                        success: failed === 0,
                        message: `Processed ${successful} profiles from export, ${failed} failed`
                    };
                } else if (status.status === 'failed') {
                    throw new Error('Export failed');
                } else {
                    // Export is still processing, reschedule the job
                    await job.moveToDelayed(Date.now() + 30000); // Check again in 30 seconds
                    return { success: true, message: 'Export still processing, rescheduled' };
                }
            } else if (exportParams) {
                // Start a new export
                const exportResult = await insightIQService.exportProfiles(exportParams);
                
                // Schedule a job to check the export status
                await scheduleInsightIQSync(
                    { exportId: exportResult.exportId },
                    { delay: 30000 } // Check after 30 seconds
                );
                
                return { 
                    success: true, 
                    message: `Export started with ID: ${exportResult.exportId}` 
                };
            } else if (profileId) {
                // Process a single profile
                const profiles = await insightIQService.getProfiles(profileId);
                if (profiles.length > 0) {
                    await processCreatorProfile(profiles[0] as unknown as InsightIQCreatorProfile);
                    return { success: true, message: `Processed profile: ${profileId}` };
                }
                return { success: false, message: `Profile not found: ${profileId}` };
            } else if (searchParams) {
                // Process multiple profiles from search
                const { profiles } = await insightIQService.searchProfiles(searchParams);
                
                if (profiles.length === 0) {
                    return { success: true, message: "No profiles found matching search criteria" };
                }
                
                // Process each profile
                const results = await Promise.allSettled(
                    profiles.map((profile: IPlatformProfile) => processCreatorProfile(profile as unknown as InsightIQCreatorProfile))
                );
                
                const successful = results.filter((r: PromiseSettledResult<void>) => r.status === "fulfilled").length;
                const failed = results.filter((r: PromiseSettledResult<void>) => r.status === "rejected").length;
                
                return {
                    success: failed === 0,
                    message: `Processed ${successful} profiles successfully, ${failed} failed`
                };
            }
            
            return { success: false, message: "No valid parameters provided" };
        } catch (error) {
            console.error("Error processing InsightIQ sync job:", error);
            throw error;
        }
    },
    redisConnection
);

// Handle worker events
insightIQSyncWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

insightIQSyncWorker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error);
});

/**
 * Schedule a job to sync profiles from InsightIQ
 * @param data Job data containing search parameters or profile ID
 * @param options Job options
 * @returns The created job
 */
export async function scheduleInsightIQSync(
    data: SyncJobData,
    options: { 
        priority?: number; 
        delay?: number; 
        repeat?: { pattern: string; tz?: string; } 
    } = {}
) {
    return await insightIQSyncQueue.add("sync-profiles", data, options);
}

/**
 * Schedule a recurring job to sync profiles from InsightIQ based on search parameters
 * @param searchParams Search parameters for InsightIQ profiles
 * @param cronSchedule Cron schedule for the recurring job
 * @returns The created job
 */
export async function scheduleRecurringSync(
    searchParams: InsightIQSearchParams,
    cronSchedule: string = "0 0 * * *" // Default: daily at midnight
) {
    return await scheduleInsightIQSync(
        { searchParams },
        { 
            repeat: { 
                pattern: cronSchedule 
            },
            priority: 10
        }
    );
}

/**
 * Schedule an immediate sync for a specific profile
 * @param profileId The profile ID to sync
 * @returns The created job
 */
export async function scheduleSingleProfileSync(profileId: string) {
    return await scheduleInsightIQSync(
        { profileId },
        { priority: 5 }
    );
}

/**
 * Schedule a job to export profiles from InsightIQ
 * @param exportParams Export parameters for InsightIQ profiles
 * @returns The created job
 */
export async function scheduleProfileExport(
    exportParams: InsightIQExportParams
) {
    return await scheduleInsightIQSync(
        { exportParams },
        { priority: 5 }
    );
}

/**
 * Schedule a job to check export status and process results
 * @param exportId The export ID to check
 * @returns The created job
 */
export async function scheduleExportCheck(exportId: string) {
    return await scheduleInsightIQSync(
        { exportId },
        { priority: 5 }
    );
}

// Initialize the worker and queue
export async function initializeInsightIQSync() {
    try {
        // Make sure Redis is connected
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        
        console.log("InsightIQ sync worker initialized");
        
        // Schedule default recurring sync jobs
        await scheduleRecurringSync(
            { 
                minFollowers: 10000,
                limit: 100
            },
            "0 0 * * *" // Daily at midnight
        );
        
        await scheduleRecurringSync(
            {
                platform: "instagram",
                minFollowers: 50000,
                limit: 100
            },
            "0 12 * * *" // Daily at noon
        );
        
        console.log("Default InsightIQ sync jobs scheduled");
    } catch (error) {
        console.error("Failed to initialize InsightIQ sync:", error);
    }
} 