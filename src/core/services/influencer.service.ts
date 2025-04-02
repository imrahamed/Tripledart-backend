import { InfluencerModel, InfluencerDocument, IUiProfile, IPlatformProfile } from '../models/influencer.model';

export class InfluencerService {
    static async createInfluencer(data: Partial<InfluencerDocument>) {
        return await InfluencerModel.create(data);
    }

    static async getInfluencerById(id: string) {
        return await InfluencerModel.findById(id);
    }

    static async searchInfluencers(query: any) {
        const {
            category,
            platform,
            minFollowers,
            maxFollowers,
            minBudget,
            maxBudget,
            gender,
            accountType,
            topic,
            location,
            page = 1,
            limit = 20
        } = query;

        try {
            // Build MongoDB filter
            const filter: any = {};
            
            // Add platform filter
            if (platform) {
                filter['platform_profiles.work_platform.name'] = platform;
            }
            
            // Add budget filter
            if (minBudget || maxBudget) {
                filter['ui_profile.pricing'] = filter['ui_profile.pricing'] || {};
                
                if (minBudget) {
                    filter['ui_profile.pricing.minimumBudget'] = { $gte: Number(minBudget) };
                }
                
                if (maxBudget) {
                    filter['ui_profile.pricing.maximumBudget'] = { $lte: Number(maxBudget) };
                }
            }
            
            // Add gender filter
            if (gender && gender !== 'any') {
                filter['ui_profile.gender'] = gender;
            }
            
            // Add account type filter
            if (accountType && accountType !== 'any') {
                filter['ui_profile.accountType'] = accountType;
            }
            
            // Add topic filter
            if (topic) {
                filter['ui_profile.topics'] = topic;
            }
            
            // Add location filter
            if (location) {
                filter['ui_profile.location'] = { $regex: location, $options: 'i' };
            }
            
            // Add category filter
            if (category) {
                filter['ui_profile.categories'] = category;
            }

            // Add follower count filter
            if (minFollowers || maxFollowers) {
                filter['platform_profiles.follower_count'] = {};
                if (minFollowers) {
                    filter['platform_profiles.follower_count'].$gte = Number(minFollowers);
                }
                if (maxFollowers) {
                    filter['platform_profiles.follower_count'].$lte = Number(maxFollowers);
                }
            }

            const skip = (Number(page) - 1) * Number(limit);
            const total = await InfluencerModel.countDocuments(filter);
            const influencers = await InfluencerModel.find(filter)
                .skip(skip)
                .limit(Number(limit))
                .sort({ 'metadata.lastUpdated': -1 });

            return {
                influencers,
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            };
        } catch (error) {
            console.error('Error searching influencers:', error);
            throw error;
        }
    }

    static async getInfluencerAnalytics(id: string) {
        const influencer = await InfluencerModel.findById(id);
        if (!influencer) return null;

        const primaryProfile = influencer.platform_profiles[0];
        if (!primaryProfile) return null;

        return {
            engagement: {
                rate: primaryProfile.engagement_rate || 0,
                trend: this.calculateEngagementTrend(
                    primaryProfile.engagement_rate || 0,
                    primaryProfile.metadata?.platformSpecificData?.previousEngagementRate || 0
                )
            },
            reach: {
                total: primaryProfile.follower_count || 0,
                platforms: influencer.platform_profiles.map(profile => ({
                    platform: profile.work_platform.name,
                    followers: profile.follower_count
                }))
            },
            performance: {
                lastMonth: this.calculateLastMonthPerformance(primaryProfile.metadata?.platformSpecificData?.recentContent || [])
            },
            audience: primaryProfile.metadata?.platformSpecificData?.audience || null
        };
    }

    static async verifyInfluencer(id: string) {
        const influencer = await InfluencerModel.findById(id);
        if (!influencer) return null;

        influencer.ui_profile.isVerified = true;
        return await influencer.save();
    }

    static async updateInfluencer(id: string, data: Partial<InfluencerDocument>) {
        return await InfluencerModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );
    }

    static async deleteInfluencer(id: string) {
        return await InfluencerModel.findByIdAndDelete(id);
    }

    static async getCategories() {
        const categories = await InfluencerModel.distinct('ui_profile.categories');
        return categories;
    }

    static async getPlatforms() {
        const platforms = await InfluencerModel.distinct('platform_profiles.work_platform.name');
        return platforms;
    }

    static async getTopics() {
        const topics = await InfluencerModel.distinct('ui_profile.topics');
        return topics;
    }

    static async getGenders() {
        return ['any', 'female', 'male', 'gender neutral', 'organization'];
    }

    static async getAccountTypes() {
        return ['any', 'personal', 'creator', 'business'];
    }

    private static calculateEngagementTrend(current: number, previous: number): string {
        if (current > previous) return 'increasing';
        if (current < previous) return 'decreasing';
        return 'stable';
    }

    private static calculateLastMonthPerformance(recentContent: any[]) {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const lastMonthContent = recentContent.filter(content => 
            new Date(content.publishedAt) >= lastMonth
        );

        return {
            posts: lastMonthContent.length,
            engagement: lastMonthContent.reduce((acc, content) => 
                acc + (content.engagement.likes + content.engagement.comments + content.engagement.shares), 0
            ),
            views: lastMonthContent.reduce((acc, content) => 
                acc + (content.engagement.views || 0), 0
            )
        };
    }
}
