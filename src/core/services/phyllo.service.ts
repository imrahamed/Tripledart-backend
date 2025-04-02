import axios from 'axios';
import { ENV } from '../../config/environment';

interface PhylloSearchFilters {
    platforms?: string[];
    platformIds?: string[];
    platformUsername?: string;
    keywords?: string;
    categories?: string[];
    countries?: string[];
    languages?: string[];
    locations?: string[];
    mentionedBrands?: string[];
    audienceCountries?: string[];
    audienceLanguages?: string[];
    audienceAgeRanges?: string[];
    audienceGenders?: string[];
    audienceInterests?: string[];
    followersRange?: {
        min: number;
        max: number | null;
    };
    engagementRateRange?: {
        min: number;
        max: number | null;
    };
    viewsRange?: {
        min: number;
        max: number | null;
    };
    ageRanges?: string[];
    genders?: string[];
}

interface PhylloSearchResponse {
    results: {
        total: number;
        page: number;
        pageSize: number;
        data: Array<{
            id: string;
            platformId: string;
            platform: string;
            username: string;
            displayName: string;
            bio: string;
            profilePictureUrl: string;
            followers: number;
            engagementRate: number;
            averageViews: number;
            categories: string[];
            contentTypes: string[];
            languages: string[];
            countries: string[];
            locations: string[];
            gender: string;
            age: number;
            contactInfo: {
                email: string;
                phone: string;
                website: string;
            };
            audience: {
                countries: Array<{ name: string; percentage: number }>;
                languages: Array<{ name: string; percentage: number }>;
                genders: Array<{ type: string; percentage: number }>;
                ageRanges: Array<{ range: string; percentage: number }>;
                interests: Array<{ name: string; percentage: number }>;
            };
            recentContent: Array<{
                id: string;
                url: string;
                type: string;
                caption: string;
                thumbnailUrl: string;
                publishedAt: string;
                engagement: {
                    likes: number;
                    comments: number;
                    shares: number;
                    views: number;
                };
            }>;
        }>;
    };
}

export class PhylloService {
    private static readonly API_URL = 'https://api.insightiq.ai/v1';
    private static readonly headers = {
        'Authorization': `Bearer ${ENV.PHYLLO_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    /**
     * @swagger
     * /api/influencers/search:
     *   post:
     *     summary: Search for creators using Phyllo API
     *     description: Search and filter creators based on various criteria
     *     parameters:
     *       - in: body
     *         name: filters
     *         schema:
     *           type: object
     *           properties:
     *             platforms:
     *               type: array
     *               items:
     *                 type: string
     *               description: List of social media platforms
     *             categories:
     *               type: array
     *               items:
     *                 type: string
     *               description: Content categories
     *             keywords:
     *               type: string
     *               description: Search keywords
     *             followersRange:
     *               type: object
     *               properties:
     *                 min:
     *                   type: number
     *                 max:
     *                   type: number
     *               description: Follower count range
     *     responses:
     *       200:
     *         description: List of creators matching the search criteria
     *       400:
     *         description: Invalid request parameters
     *       401:
     *         description: Unauthorized - Invalid API key
     */
    static async searchCreators(filters: PhylloSearchFilters, page = 0, pageSize = 20) {
        try {
            const response = await axios.post<PhylloSearchResponse>(
                `${this.API_URL}/social-creator-profile/search`,
                {
                    filters,
                    sort: {
                        field: "relevance",
                        direction: "desc"
                    },
                    pagination: {
                        page,
                        pageSize
                    }
                },
                { headers: this.headers }
            );

            return response.data.results;
        } catch (error) {
            console.error('Phyllo API Error:', error);
            throw error;
        }
    }

    /**
     * @swagger
     * /api/influencers/{id}/phyllo:
     *   get:
     *     summary: Get influencer data from Phyllo
     *     description: Retrieve detailed profile and stats for a specific influencer
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Phyllo platform ID of the influencer
     *     responses:
     *       200:
     *         description: Influencer profile and stats data
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 profileId:
     *                   type: string
     *                 platform:
     *                   type: string
     *                 username:
     *                   type: string
     *                 stats:
     *                   type: object
     *                   properties:
     *                     followers:
     *                       type: number
     *                     engagementRate:
     *                       type: number
     *                     averageViews:
     *                       type: number
     *       404:
     *         description: Influencer not found
     *       401:
     *         description: Unauthorized - Invalid API key
     */
    static async getInfluencerData(id: string) {
        try {
            const response = await this.searchCreators({
                platformIds: [id]
            });

            if (!response.data.length) {
                return null;
            }

            const profile = response.data[0];
            return {
                stats: {
                    averageViews: profile.averageViews,
                    engagementRate: profile.engagementRate,
                    followers: profile.followers,
                    audience: profile.audience,
                    recentContent: profile.recentContent
                },
                profile: {
                    username: profile.username,
                    displayName: profile.displayName,
                    bio: profile.bio,
                    profilePictureUrl: profile.profilePictureUrl,
                    categories: profile.categories,
                    languages: profile.languages,
                    locations: profile.locations,
                    contactInfo: profile.contactInfo,
                    platform: profile.platform
                }
            };
        } catch (error) {
            console.error('Phyllo API Error:', error);
            return null;
        }
    }
}