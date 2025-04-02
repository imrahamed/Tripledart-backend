import axios from "axios";
import { ENV } from "../config/environment";
import {
  IPlatformProfile,
  InfluencerModel,
} from "../core/models/influencer.model";
import { scheduleInsightIQSync } from "../jobs/insightiqSync.job";

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

export interface InsightIQProfile {
  id: string;
  username: string;
  platform: string;
  name?: string;
  bio?: string;
  followers?: number;
  following?: number;
  engagement?: number;
  categories?: string[];
  languages?: string[];
  locations?: string[];
  topics?: string[];
  stats?: {
    followers: number;
    following: number;
    posts: number;
    engagement: number;
  };
}

export interface InsightIQPlatform {
  name: string;
  code: string;
  icon?: string;
  description?: string;
}

export interface InsightIQTopic {
  name: string;
  code: string;
  category?: string;
  description?: string;
}

export interface InsightIQLocation {
  name: string;
  code: string;
  type: "country" | "city" | "region";
  parentCode?: string;
  description?: string;
}

export interface InsightIQExportParams {
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
  exportFormat?: "json" | "csv";
}

export interface InsightIQWebhookEvent {
  event_type: string;
  payload: {
    export_id: string;
    status: string;
    download_url?: string;
    total_profiles?: number;
    processed_profiles?: number;
    error?: string;
  };
}

export class InsightIQService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl =
      process.env.INSIGHTIQ_BASE_URL || "https://api.insightiq.ai/v1";
    this.apiKey = process.env.INSIGHTIQ_API_KEY || "";
  }

  private getHeaders() {
    return {
      Authorization: `Basic ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async getProfiles(influencerId: string): Promise<IPlatformProfile[]> {
    try {
      // Get the influencer to access socialLinks
      const influencer = await InfluencerModel.findOne({ influencer_id: influencerId });
      if (!influencer) {
        throw new Error(`Influencer with ID ${influencerId} not found`);
      }

      // Get social links from the influencer profile
      const socialLinks = influencer.ui_profile?.socialLinks || [];
      
      if (socialLinks.length === 0) {
        // Fallback to a default call if no social links are available
        return this.fetchProfileFromInsightIQ(
          `http://example.com/${influencerId}`, 
          influencerId
        );
      }

      // Make API calls for each social link
      const profilePromises = socialLinks.map(link => {
        // Find matching platform profile to get the work_platform_id
        const matchingPlatformProfile = influencer.platform_profiles.find(
          profile => profile.work_platform?.name?.toLowerCase() === link.platform?.toLowerCase()
        );
        
        const workPlatformId = matchingPlatformProfile?.work_platform?.id || influencerId;
        
        // Call InsightIQ API for this social link
        return this.fetchProfileFromInsightIQ(link.url, workPlatformId);
      });

      // Await all profile fetches
      const profileArrays = await Promise.all(profilePromises);
      
      // Flatten the array of arrays into a single array
      return profileArrays.flat();
    } catch (error: any) {
      console.error("Error fetching profiles from InsightIQ:", error.response?.data || error.message);
      throw new Error("Failed to fetch profiles from InsightIQ");
    }
  }

  /**
   * Helper method to fetch a profile from InsightIQ API
   */
  private async fetchProfileFromInsightIQ(profileUrl: string, workPlatformId: string): Promise<IPlatformProfile[]> {
    try {
      console.log(`Fetching profile from InsightIQ: ${profileUrl} with platform ID: ${workPlatformId}`);
      
      const response = await axios.post(
        `${this.apiUrl}/professional/creators/profiles/analytics`,
        {
          profile_url: profileUrl,
          work_platform_id: workPlatformId
        },
        { headers: this.getHeaders() }
      );

      const data = response.data;
      
      // Map the API response to our platform profile format
      return [{
        full_name: `${data.first_name || ''} ${data.middle_name || ''} ${data.last_name || ''}`.trim(),
        url: data.url || profileUrl,
        image_url: data.image_url || '',
        follower_count: data.follower_count || 0,
        connection_count: data.reputation?.connection_count || 0,
        introduction: data.profile_summary || '',
        profile_headline: data.profile_headline || '',
        external_id: data.id,
        creator_account_type: data.platform_account_type || [],
        work_platform: {
          id: data.work_platform?.id || workPlatformId,
          name: data.work_platform?.name || 'Unknown Platform',
          logo_url: ''
        },
        creator_location: {
          city: data.location?.city || '',
          state: data.location?.state || '',
          country: data.location?.country_name || ''
        },
        talks_about: data.talks_about?.map((item: any) => item.name) || [],
        open_to: [],
        current_positions: data.work_experiences ? [{
          title: data.work_experiences.title || '',
          company: data.work_experiences.company?.name || '',
          description: data.work_experiences.description || '',
          location: data.work_experiences.location?.name || '',
          time_period: {
            start_date: data.work_experiences.time_period?.start_date ? 
              new Date(data.work_experiences.time_period.start_date.year, 
                      (data.work_experiences.time_period.start_date.month || 1) - 1) : 
              new Date()
          }
        }] : [],
        engagement_rate: data.engagement_rate || 0,
        metadata: {
          lastUpdated: new Date(),
          dataSource: 'insightiq',
          lastSyncDate: new Date(),
          platformSpecificData: {
            topContents: data.top_contents || [],
            recentContents: data.recent_contents || [],
            topHashtags: data.top_hashtags || [],
            languages: data.languages || [],
            skills: data.skills || []
          }
        }
      }];
    } catch (error: any) {
      console.error(`Error fetching profile from InsightIQ for URL ${profileUrl}:`, error.response?.data || error.message);
      // Return empty array instead of throwing to allow other profiles to be processed
      return [];
    }
  }

  async searchProfiles(params: {
    work_platform_id?: string;
    follower_count?: {
      min: number;
      max: number;
    };
    has_contact_details?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    profiles: IPlatformProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      console.debug(
        `${this.apiUrl}/professional/creators/profiles/search`,
        { headers: this.getHeaders() }
      );
      console.log( {
        work_platform_id: params.work_platform_id,
        follower_count: params.follower_count,
        has_contact_details: params.has_contact_details,
        page: params.page || 1,
        limit: params.limit || 10,
      });
      const response = await axios.post(
        `${this.apiUrl}/professional/creators/profiles/search`,
        {
          work_platform_id: params.work_platform_id,
          follower_count: params.follower_count,
          has_contact_details: params.has_contact_details,
          page: params.page || 1,
          limit: params.limit || 10,
          "sort_by": {
            "field": "FOLLOWER_COUNT",
            "order": "DESCENDING"
          },
        
        },
        {
          headers: this.getHeaders(),
        }
      );
      console.log((response.data.data[0].current_position));
      return {
        profiles: response.data.data.map((profile: any) => ({
          full_name: profile.full_name,
          url: profile.url,
          image_url: profile.image_url,
          external_id: profile.external_id,
          profile_headline: profile.profile_headline,
          follower_count: profile.follower_count,
          connection_count: profile.connection_count,
          introduction: profile.introduction,
          talks_about: profile.talks_about || [],
          current_positions: profile.current_position?.map((position: any) => ({
            title: position.title,
            company: position.company,
            description: position.description,
            location: position.location,
            time_period: {
              start_date: position.time_period?.start_date ? new Date(position.time_period.start_date) : null
            }
          })) || [],
          creator_location: profile.creator_location,
          creator_account_type: profile.creator_account_type,
          open_to: profile.open_to,
          engagement_rate: profile.engagement_rate,
          metadata: {
            lastUpdated: new Date(),
            dataSource: "insightiq",
            lastSyncDate: new Date(),
            platformSpecificData: profile
          }
        })),
        total: response.data.metadata.total,
        page: response.data.metadata.page,
        totalPages: response.data.metadata.total_pages,
      };
    } catch (error: any) {
      console.error("Error searching profiles in InsightIQ:", error.response?.data || error);
      throw new Error("Failed to search profiles in InsightIQ");
    }
  }

  async getPlatforms(): Promise<InsightIQPlatform[]> {
    try {
      // Since platforms are managed in Airtable, we'll return a static list
      // This can be updated based on the Airtable data
      return [
        {
          name: "Instagram",
          code: "instagram",
          icon: "instagram",
          description: "Instagram social media platform",
        },
        {
          name: "YouTube",
          code: "youtube",
          icon: "youtube",
          description: "YouTube video platform",
        },
        {
          name: "TikTok",
          code: "tiktok",
          icon: "tiktok",
          description: "TikTok short video platform",
        },
        {
          name: "Twitter",
          code: "twitter",
          icon: "twitter",
          description: "Twitter social media platform",
        },
        {
          name: "Facebook",
          code: "facebook",
          icon: "facebook",
          description: "Facebook social media platform",
        },
        {
          name: "LinkedIn",
          code: "linkedin",
          icon: "linkedin",
          description: "LinkedIn professional network",
        },
        {
          name: "Pinterest",
          code: "pinterest",
          icon: "pinterest",
          description: "Pinterest visual discovery platform",
        },
        {
          name: "Snapchat",
          code: "snapchat",
          icon: "snapchat",
          description: "Snapchat messaging platform",
        },
      ];
    } catch (error) {
      console.error("Error getting platforms:", error);
      throw error;
    }
  }

  async getTopics(): Promise<InsightIQTopic[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/social/creators/dictionary/topics`,
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error getting topics:", error.response.data);
      throw error.response.data;
    }
  }

  async getLocations(): Promise<InsightIQLocation[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/v1/social/creators/dictionary/locations`,
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting locations:", error);
      throw error;
    }
  }

  async createOrUpdateInfluencer(
    email: string,
    profile: IPlatformProfile
  ): Promise<any> {
    try {
      // Find existing influencer by email
      let influencer = await InfluencerModel.findOne({
        "ui_profile.email": email,
      });

      if (!influencer) {
        // Create new influencer with initial UI profile
        influencer = new InfluencerModel({
          influencer_id: profile.external_id,
          platform_profiles: [profile],
          ui_profile: {
            handle: profile.full_name,
            role: "influencer",
            avatarUrl: profile.image_url,
            bio: profile.introduction,
            location: profile.creator_location.city,
            gender: "any",
            accountType: profile.creator_account_type,
            isVerified: false,
            contactIconUrl: "",
            email: email,
            socialLinks: [
              {
                platform: profile.work_platform.name,
                url: profile.url,
              },
            ],
            categories: [],
            tags: profile.talks_about,
            topics: [],
            interests: [],
            expertise: [],
            performance: {
              engagementRate: profile.engagement_rate,
              reach: profile.follower_count,
              impressions: 0,
            },
            pricing: {
              minimumBudget: 0,
              maximumBudget: 0,
              currency: "USD",
            },
            audienceDemographics: {
              ageRanges: {},
              genderDistribution: {},
              locations: {},
              languages: {},
            },
          },
          metadata: {
            lastSyncDate: new Date(),
            dataSource: "insightiq",
            lastUpdated: new Date(),
          },
        });
      } else {
        // Update existing influencer
        const existingProfileIndex = influencer.platform_profiles.findIndex(
          (p) => p.external_id === profile.external_id
        );

        if (existingProfileIndex === -1) {
          // Add new platform profile
          influencer.platform_profiles.push(profile);
        } else {
          // Update existing platform profile
          influencer.platform_profiles[existingProfileIndex] = profile;
        }

        // Update UI profile with latest data
        influencer.ui_profile = {
          ...influencer.ui_profile,
          handle: profile.full_name,
          avatarUrl: profile.image_url,
          bio: profile.introduction,
          location: profile.creator_location.city,
          accountType: profile.creator_account_type,
          socialLinks: [
            ...influencer.ui_profile.socialLinks.filter(
              (link) => link.platform !== profile.work_platform.name
            ),
            {
              platform: profile.work_platform.name,
              url: profile.url,
            },
          ],
          tags: [
            ...new Set([...influencer.ui_profile.tags, ...profile.talks_about]),
          ],
        };

        influencer.metadata.lastUpdated = new Date();
      }

      await influencer.save();
      return influencer;
    } catch (error: any) {
      console.error("Error creating/updating influencer:", error.message);
      throw new Error("Failed to create/update influencer");
    }
  }

  async handleWebhookEvent(event: InsightIQWebhookEvent): Promise<void> {
    try {
      switch (event.event_type) {
        case "CREATOR_SEARCH_EXPORT.SUCCESS":
          // Schedule a job to process the export
          await scheduleInsightIQSync(
            { exportId: event.payload.export_id },
            { priority: 10 }
          );
          break;

        case "CREATOR_SEARCH_EXPORT.FAILED":
          console.error("Export failed:", event.payload.error);
          // You might want to notify administrators or update a status in your database
          break;

        case "CREATOR_SEARCH_EXPORT.PROGRESS":
          console.log(
            `Export progress: ${event.payload.processed_profiles}/${event.payload.total_profiles}`
          );
          break;
      }
    } catch (error) {
      console.error("Error handling webhook event:", error);
      throw error;
    }
  }

  async exportProfiles(params: InsightIQExportParams): Promise<{
    exportId: string;
    status: string;
    downloadUrl?: string;
  }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/social-creator-profile-search-export`,
        {
          platform: params.platform,
          username: params.username,
          category: params.category,
          language: params.language,
          location: params.location,
          min_followers: params.minFollowers,
          max_followers: params.maxFollowers,
          min_engagement: params.minEngagement,
          max_engagement: params.maxEngagement,
          format: params.exportFormat || "json",
          webhook_url: `${process.env.API_BASE_URL}/api/webhooks/insightiq`, // Add your webhook URL
        },
        { headers: this.getHeaders() }
      );

      return {
        exportId: response.data.export_id,
        status: response.data.status,
        downloadUrl: response.data.download_url,
      };
    } catch (error: any) {
      console.error("Error exporting profiles from InsightIQ:", error.message);
      throw new Error("Failed to export profiles from InsightIQ");
    }
  }

  async getExportStatus(exportId: string): Promise<{
    status: string;
    downloadUrl?: string;
    progress?: number;
  }> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/social-creator-profile-search-export/${exportId}`,
        { headers: this.getHeaders() }
      );

      return {
        status: response.data.status,
        downloadUrl: response.data.download_url,
        progress: response.data.progress,
      };
    } catch (error: any) {
      console.error("Error checking export status:", error.message);
      throw new Error("Failed to check export status");
    }
  }

  async downloadExport(exportId: string): Promise<Buffer> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/social-creator-profile-search-export/${exportId}/download`,
        {
          headers: this.getHeaders(),
          responseType: "arraybuffer",
        }
      );

      return Buffer.from(response.data);
    } catch (error: any) {
      console.error("Error downloading export:", error.message);
      throw new Error("Failed to download export");
    }
  }
}

export const insightIQService = new InsightIQService();
