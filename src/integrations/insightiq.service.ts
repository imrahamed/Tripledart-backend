import axios from "axios";
import { ENV } from "../config/environment";

export interface InsightIQCreatorProfile {
    id: string;
    platform: string;
    username: string;
    displayName: string;
    bio: string;
    profilePictureUrl: string;
    followers: number;
    engagement: number;
    averageViews?: number;
    categories: string[];
    languages: string[];
    locations: string[];
    audience?: any;
    recentContent?: any[];
}

export interface InsightIQSearchParams {
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

/**
 * Service to interact with the InsightIQ API
 */
export class InsightIQService {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = ENV.INSIGHTIQ_BASE_URL || "https://api.insightiq.ai/v1";
        this.apiKey = ENV.INSIGHTIQ_API_KEY || "";
    }

    /**
     * Search for creator profiles in InsightIQ
     * @param params Search parameters
     * @returns List of creator profiles
     */
    async searchCreatorProfiles(params: InsightIQSearchParams): Promise<InsightIQCreatorProfile[]> {
        try {
            const response = await axios.post(`${this.baseUrl}/social/creator/profile/search`, params, {
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.data && response.data.data) {
                return response.data.data;
            }
            
            return [];
        } catch (error) {
            console.error("Error searching InsightIQ creator profiles:", error);
            throw error;
        }
    }

    /**
     * Get a specific creator profile by ID
     * @param profileId The profile ID
     * @returns The creator profile
     */
    async getCreatorProfile(profileId: string): Promise<InsightIQCreatorProfile | null> {
        try {
            const response = await axios.get(`${this.baseUrl}/social/creator/profile/${profileId}`, {
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.data && response.data.data) {
                return response.data.data;
            }
            
            return null;
        } catch (error) {
            console.error(`Error fetching InsightIQ creator profile ${profileId}:`, error);
            throw error;
        }
    }
}

export const insightIQService = new InsightIQService(); 