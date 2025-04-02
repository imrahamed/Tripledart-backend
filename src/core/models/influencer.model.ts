import mongoose, { Document, Schema } from "mongoose";

interface Audience {
    countries: Array<{ name: string; percentage: number }>;
    languages: Array<{ name: string; percentage: number }>;
    genders: Array<{ type: string; percentage: number }>;
    ageRanges: Array<{ range: string; percentage: number }>;
    interests: Array<{ name: string; percentage: number }>;
}

interface ContentEngagement {
    likes: number;
    comments: number;
    shares: number;
    views: number;
}

interface RecentContent {
    id: string;
    url: string;
    type: string;
    caption: string;
    thumbnailUrl: string;
    publishedAt: string;
    engagement: ContentEngagement;
}

interface SocialMediaStats {
    platform: string;
    followers: number;
    engagement: number;
    url: string;
    username: string;
    profileUrl: string;
}

interface Stats {
    averageViews: number;
    postFrequency: string;
    topLocations: string[];
    previousEngagement?: number;
    currentEngagement?: number;
    engagementRate: number;
    audience?: Audience;
    recentContent?: RecentContent[];
}

interface PhylloProfile {
    id: string;
    platform: string;
    username: string;
    displayName: string;
    bio: string;
    profilePictureUrl: string;
    followers: number;
    engagementRate: number;
    averageViews: number;
    categories: string[];
    languages: string[];
    locations: string[];
    audience?: Audience;
    recentContent?: RecentContent[];
}

interface PhylloData {
    profileId: string;
    platform: string;
    username: string;
    displayName: string;
    bio: string;
    profilePictureUrl: string;
    followers: number;
    engagementRate: number;
    averageViews: number;
    categories: string[];
    languages: string[];
    locations: string[];
}

export interface IPlatformProfile {
    full_name: string;
    url: string;
    image_url: string;
    follower_count: number;
    connection_count: number;
    introduction: string;
    profile_headline: string;
    external_id: string;
    creator_account_type: string[];
    work_platform: {
        id: string;
        name: string;
        logo_url: string;
    };
    creator_location: {
        city: string;
        state: string;
        country: string;
    };
    talks_about: string[];
    open_to: string[];
    current_positions: Array<{
        title: string;
        company: string;
        description: string;
        location: string;
        time_period: {
            start_date: Date;
        };
    }>;
    engagement_rate: number;
    metadata: {
        lastUpdated: Date;
        dataSource: string;
        lastSyncDate: Date;
        platformSpecificData: any;
    };
}

export interface IUiProfile {
    handle: string;
    role: string;
    avatarUrl: string;
    bio: string;
    location: string;
    gender: string;
    accountType: string[];
    isVerified: boolean;
    contactIconUrl: string;
    socialLinks: Array<{
        platform: string;
        url: string;
    }>;
    categories: string[];
    tags: string[];
    topics: string[];
    interests: string[];
    expertise: string[];
    performance: {
        engagementRate: number;
        reach: number;
        impressions: number;
    };
    pricing: {
        minimumBudget: number;
        maximumBudget: number;
        currency: string;
    };
    audienceDemographics: {
        ageRanges: Record<string, number>;
        genderDistribution: Record<string, number>;
        locations: Record<string, number>;
        languages: Record<string, number>;
    };
}

export interface InfluencerDocument extends Document {
    influencer_id: string;
    platform_profiles: IPlatformProfile[];
    ui_profile: IUiProfile;
    metadata: {
        lastSyncDate: Date;
        dataSource: string;
        lastUpdated: Date;
    };
}

const influencerSchema = new Schema<InfluencerDocument>(
    {
        influencer_id: {
            type: String,
            required: true,
            unique: true
        },
        platform_profiles: [{
            full_name: String,
            url: String,
            image_url: String,
            follower_count: Number,
            connection_count: Number,
            introduction: String,
            profile_headline: String,
            external_id: String,
            creator_account_type: [String],
            work_platform: {
                id: String,
                name: String,
                logo_url: String
            },
            creator_location: {
                city: String,
                state: String,
                country: String
            },
            talks_about: [String],
            open_to: [String],
            current_positions: [{
                title: String,
                company: String,
                description: String,
                location: String,
                time_period: {
                    start_date: Date
                }
            }],
            engagement_rate: Number,
            metadata: {
                lastUpdated: Date,
                dataSource: String,
                lastSyncDate: Date,
                platformSpecificData: Schema.Types.Mixed
            }
        }],
        ui_profile: {
            handle: String,
            role: String,
            avatarUrl: String,
            bio: String,
            location: String,
            gender: String,
            accountType: [String],
            isVerified: Boolean,
            contactIconUrl: String,
            socialLinks: [{
                platform: String,
                url: String
            }],
            categories: [String],
            tags: [String],
            topics: [String],
            interests: [String],
            expertise: [String],
            performance: {
                engagementRate: Number,
                reach: Number,
                impressions: Number
            },
            pricing: {
                minimumBudget: Number,
                maximumBudget: Number,
                currency: String
            },
            audienceDemographics: {
                ageRanges: Schema.Types.Mixed,
                genderDistribution: Schema.Types.Mixed,
                locations: Schema.Types.Mixed,
                languages: Schema.Types.Mixed
            }
        },
        metadata: {
            lastSyncDate: Date,
            dataSource: String,
            lastUpdated: Date
        }
    },
    { timestamps: true }
);

// Create indexes for better query performance
influencerSchema.index({ influencer_id: 1 });
influencerSchema.index({ 'platform_profiles.external_id': 1 });
influencerSchema.index({ 'platform_profiles.work_platform.name': 1 });
influencerSchema.index({ 'platform_profiles.creator_location.country': 1 });
influencerSchema.index({ 'platform_profiles.talks_about': 1 });
influencerSchema.index({ 'platform_profiles.creator_account_type': 1 });
influencerSchema.index({ 'ui_profile.handle': 1 });
influencerSchema.index({ 'ui_profile.categories': 1 });
influencerSchema.index({ 'ui_profile.tags': 1 });
influencerSchema.index({ 'ui_profile.topics': 1 });

export const InfluencerModel = mongoose.model<InfluencerDocument>("Influencer", influencerSchema);
