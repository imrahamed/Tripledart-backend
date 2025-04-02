import { Request, Response } from "express";
import { InfluencerService } from "../../core/services/influencer.service";
import { SwaggerDocs } from "../../decorators/swagger.decorator";
import { InfluencerModel, InfluencerDocument, IPlatformProfile, IUiProfile } from '../../core/models/influencer.model';
import { InsightIQService } from '../../services/insightiq.service';

export class InfluencerController {
    private insightIQService: InsightIQService;

    constructor() {
        this.insightIQService = new InsightIQService();
    }

    public searchInfluencers = async (req: Request, res: Response): Promise<void> => {
        try {
            const { 
                search, 
                platforms, 
                minBudget, 
                maxBudget, 
                followers, 
                page = 1, 
                limit = 10,
                sortField = 'ui_profile.isVerified',
                sortDir = 'desc'
            } = req.query;
            const query: any = {};

            if (search) {
                query.$or = [
                    { 'ui_profile.handle': { $regex: search, $options: 'i' } },
                    { 'ui_profile.bio': { $regex: search, $options: 'i' } }
                ];
            }

            if (platforms) {
                query['platform_profiles.work_platform.name'] = { $in: (platforms as string).split(',') };
            }

            // if (minBudget || maxBudget) {
            //     query['ui_profile.pricing.minimumBudget'] = {};
            //     if (minBudget) query['ui_profile.pricing.minimumBudget'].$gte = Number(minBudget);
            //     if (maxBudget) query['ui_profile.pricing.minimumBudget'].$lte = Number(maxBudget);
            // }

            if (followers) {
                query['platform_profiles.follower_count'] = { $gte: Number(followers) };
            }

            // Create sort options
            const sortOptions: any = {};

            // Map frontend sort fields to database fields
            const sortFieldMapping: Record<string, string> = {
                'followers': 'platform_profiles.follower_count',
                'engagement': 'platform_profiles.engagement_rate',
                'budget': 'ui_profile.pricing.minimumBudget',
                'relevance': 'ui_profile.isVerified'
            };

            // Use the mapping or fallback to the direct field name
            const sortFieldStr = sortField as string;
            const dbSortField = sortFieldMapping[sortFieldStr] || sortFieldStr;
            sortOptions[dbSortField] = sortDir === 'desc' ? -1 : 1;

            // Always prioritize verified influencers unless explicitly sorting by verification
            if (dbSortField !== 'ui_profile.isVerified') {
                sortOptions['ui_profile.isVerified'] = -1;
            }

            const influencers = await InfluencerModel.find(query)
                .sort(sortOptions)
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit));

            const total = await InfluencerModel.countDocuments(query);

            res.json({
                influencers,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to search influencers' });
        }
    };

    public getInfluencer = async (req: Request, res: Response): Promise<void> => {
        try {
            const influencer = await InfluencerModel.findById(req.params.id);
            if (!influencer) {
                res.status(404).json({ error: 'Influencer not found' });
                return;
            }

            // Check if data is stale (older than 24 hours) or has never been synced with InsightIQ
            const lastSyncDate = influencer.metadata?.lastSyncDate ? new Date(influencer.metadata.lastSyncDate) : null;
            const isStale = !lastSyncDate || 
                            (new Date().getTime() - lastSyncDate.getTime() > 24 * 60 * 60 * 1000);

            if (isStale && influencer.influencer_id) {
                try {
                    // Sync data from InsightIQ
                    console.log(`Fetching fresh data from InsightIQ for influencer ${influencer.influencer_id}`);
                    const newProfiles = await this.insightIQService.getProfiles(influencer.influencer_id);
                    
                    // Update existing profiles or add new ones
                    if (newProfiles.length > 0) {
                        // For each new profile from InsightIQ
                        newProfiles.forEach((newProfile: IPlatformProfile) => {
                            // Try to find a matching existing profile by platform and ID
                            const existingProfileIndex = influencer.platform_profiles.findIndex(
                                (profile) => 
                                    profile.external_id === newProfile.external_id ||
                                    (profile.work_platform.name === newProfile.work_platform.name && 
                                     profile.url === newProfile.url)
                            );

                            if (existingProfileIndex !== -1) {
                                // Update existing profile with new data
                                influencer.platform_profiles[existingProfileIndex] = {
                                    ...influencer.platform_profiles[existingProfileIndex],
                                    ...newProfile,
                                    metadata: {
                                        lastUpdated: new Date(),
                                        dataSource: 'insightiq',
                                        lastSyncDate: new Date(),
                                        platformSpecificData: newProfile.metadata.platformSpecificData || {}
                                    }
                                };
                            } else {
                                // Add new profile
                                influencer.platform_profiles.push({
                                    ...newProfile,
                                    metadata: {
                                        lastUpdated: new Date(),
                                        dataSource: 'insightiq',
                                        lastSyncDate: new Date(),
                                        platformSpecificData: newProfile.metadata.platformSpecificData || {}
                                    }
                                });
                            }
                        });

                        // Update UI profile with any new data
                        if (newProfiles.length > 0 && newProfiles[0]) {
                            const mainProfile = newProfiles[0];
                            
                            // Update UI profile with latest data
                            influencer.ui_profile = {
                                ...influencer.ui_profile,
                                handle: influencer.ui_profile.handle || mainProfile.full_name,
                                avatarUrl: influencer.ui_profile.avatarUrl || mainProfile.image_url,
                                bio: influencer.ui_profile.bio || mainProfile.introduction,
                                location: influencer.ui_profile.location || 
                                    (mainProfile.creator_location ? 
                                        `${mainProfile.creator_location.city}${mainProfile.creator_location.country ? ', ' + mainProfile.creator_location.country : ''}` : 
                                        ''),
                                performance: {
                                    ...influencer.ui_profile.performance,
                                    engagementRate: mainProfile.engagement_rate || influencer.ui_profile.performance.engagementRate,
                                    reach: mainProfile.follower_count || influencer.ui_profile.performance.reach
                                }
                            };
                        }

                        // Update metadata
                        influencer.metadata = {
                            ...influencer.metadata,
                            lastSyncDate: new Date(),
                            lastUpdated: new Date()
                        };

                        await influencer.save();
                        console.log(`Successfully updated influencer data from InsightIQ for ${influencer.influencer_id}`);
                    }
                } catch (syncError) {
                    console.error(`Error syncing with InsightIQ: ${syncError}`);
                    // Continue with returning the existing influencer data even if sync fails
                }
            }

            res.json(influencer);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get influencer' });
        }
    };

    public createInfluencer = async (req: Request, res: Response): Promise<void> => {
        try {
            const influencer = new InfluencerModel(req.body);
            await influencer.save();
            res.status(201).json(influencer);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create influencer' });
        }
    };

    public updateInfluencer = async (req: Request, res: Response): Promise<void> => {
        try {
            const influencer = await InfluencerModel.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            if (!influencer) {
                res.status(404).json({ error: 'Influencer not found' });
                return;
            }
            res.json(influencer);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update influencer' });
        }
    };

    public deleteInfluencer = async (req: Request, res: Response): Promise<void> => {
        try {
            const influencer = await InfluencerModel.findByIdAndDelete(req.params.id);
            if (!influencer) {
                res.status(404).json({ error: 'Influencer not found' });
                return;
            }
            res.json({ message: 'Influencer deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete influencer' });
        }
    };

    public addPlatformProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const influencer = await InfluencerModel.findById(req.params.id);
            if (!influencer) {
                res.status(404).json({ error: 'Influencer not found' });
                return;
            }

            const newProfile: IPlatformProfile = req.body;
            influencer.platform_profiles.push(newProfile);
            await influencer.save();

            res.json(influencer);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add platform profile' });
        }
    };

    public updatePlatformProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id, profileId } = req.params;
            const influencer = await InfluencerModel.findById(id);
            if (!influencer) {
                res.status(404).json({ error: 'Influencer not found' });
                return;
            }

            const profileIndex = influencer.platform_profiles.findIndex(
                profile => profile.external_id === profileId
            );

            if (profileIndex === -1) {
                res.status(404).json({ error: 'Platform profile not found' });
                return;
            }

            influencer.platform_profiles[profileIndex] = {
                ...influencer.platform_profiles[profileIndex],
                ...req.body
            };

            await influencer.save();
            res.json(influencer);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update platform profile' });
        }
    };

    public updateUiProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const influencer = await InfluencerModel.findById(req.params.id);
            if (!influencer) {
                res.status(404).json({ error: 'Influencer not found' });
                return;
            }

            influencer.ui_profile = {
                ...influencer.ui_profile,
                ...req.body
            };

            await influencer.save();
            res.json(influencer);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update UI profile' });
        }
    };

    public getAnalytics = async (req: Request, res: Response): Promise<void> => {
        try {
            const influencer = await InfluencerModel.findById(req.params.id);
            if (!influencer) {
                res.status(404).json({ error: 'Influencer not found' });
                return;
            }

            const analytics = {
                totalFollowers: influencer.platform_profiles.reduce(
                    (sum, profile) => sum + profile.follower_count,
                    0
                ),
                averageEngagementRate: influencer.platform_profiles.reduce(
                    (sum, profile) => sum + profile.engagement_rate,
                    0
                ) / influencer.platform_profiles.length,
                platformBreakdown: influencer.platform_profiles.map(profile => ({
                    platform: profile.work_platform.name,
                    followers: profile.follower_count,
                    engagementRate: profile.engagement_rate
                }))
            };

            res.json(analytics);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get analytics' });
        }
    };

    public verifyInfluencer = async (req: Request, res: Response): Promise<void> => {
        try {
            const influencer = await InfluencerModel.findById(req.params.id);
            if (!influencer) {
                res.status(404).json({ error: 'Influencer not found' });
                return;
            }

            influencer.ui_profile.isVerified = true;
            await influencer.save();

            res.json(influencer);
        } catch (error) {
            res.status(500).json({ error: 'Failed to verify influencer' });
        }
    };

    public getPlatforms = async (req: Request, res: Response): Promise<void> => {
        try {
            const platforms = await InfluencerModel.distinct('platform_profiles.work_platform.name');
            res.json(platforms);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get platforms' });
        }
    };

    public getCategories = async (req: Request, res: Response): Promise<void> => {
        try {
            const categories = await InfluencerModel.distinct('ui_profile.categories');
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get categories' });
        }
    };

    public getTopics = async (req: Request, res: Response): Promise<void> => {
        try {
            const topics = await InfluencerModel.distinct('ui_profile.topics');
            res.json(topics);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get topics' });
        }
    };

    public getGenders = async (req: Request, res: Response): Promise<void> => {
        try {
            const genders = await InfluencerModel.distinct('ui_profile.gender');
            res.json(genders);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get genders' });
        }
    };

    public getAccountTypes = async (req: Request, res: Response): Promise<void> => {
        try {
            const accountTypes = await InfluencerModel.distinct('ui_profile.accountType');
            res.json(accountTypes);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get account types' });
        }
    };

    public syncWithInsightIQ = async (req: Request, res: Response): Promise<void> => {
        try {
            const influencer = await InfluencerModel.findById(req.params.id);
            if (!influencer) {
                res.status(404).json({ error: 'Influencer not found' });
                return;
            }

            const newProfiles = await this.insightIQService.getProfiles(influencer.influencer_id);
            
            // Update existing profiles or add new ones
            if (newProfiles.length > 0) {
                // For each new profile from InsightIQ
                newProfiles.forEach((newProfile: IPlatformProfile) => {
                    // Try to find a matching existing profile by platform and ID
                    const existingProfileIndex = influencer.platform_profiles.findIndex(
                        (profile) => 
                            profile.external_id === newProfile.external_id ||
                            (profile.work_platform.name === newProfile.work_platform.name && 
                             profile.url === newProfile.url)
                    );

                    if (existingProfileIndex !== -1) {
                        // Update existing profile with new data
                        influencer.platform_profiles[existingProfileIndex] = {
                            ...influencer.platform_profiles[existingProfileIndex],
                            ...newProfile,
                            metadata: {
                                lastUpdated: new Date(),
                                dataSource: 'insightiq',
                                lastSyncDate: new Date(),
                                platformSpecificData: newProfile.metadata.platformSpecificData || {}
                            }
                        };
                    } else {
                        // Add new profile
                        influencer.platform_profiles.push({
                            ...newProfile,
                            metadata: {
                                lastUpdated: new Date(),
                                dataSource: 'insightiq',
                                lastSyncDate: new Date(),
                                platformSpecificData: newProfile.metadata.platformSpecificData || {}
                            }
                        });
                    }
                });

                // Update UI profile with any new data
                if (newProfiles.length > 0 && newProfiles[0]) {
                    const mainProfile = newProfiles[0];
                    
                    // Update UI profile with latest data
                    influencer.ui_profile = {
                        ...influencer.ui_profile,
                        handle: influencer.ui_profile.handle || mainProfile.full_name,
                        avatarUrl: influencer.ui_profile.avatarUrl || mainProfile.image_url,
                        bio: influencer.ui_profile.bio || mainProfile.introduction,
                        location: influencer.ui_profile.location || 
                            (mainProfile.creator_location ? 
                                `${mainProfile.creator_location.city}${mainProfile.creator_location.country ? ', ' + mainProfile.creator_location.country : ''}` : 
                                ''),
                        performance: {
                            ...influencer.ui_profile.performance,
                            engagementRate: mainProfile.engagement_rate || influencer.ui_profile.performance.engagementRate,
                            reach: mainProfile.follower_count || influencer.ui_profile.performance.reach
                        }
                    };
                }

                // Update metadata
                influencer.metadata = {
                    ...influencer.metadata,
                    lastSyncDate: new Date(),
                    lastUpdated: new Date()
                };

                await influencer.save();
            }
            
            res.json(influencer);
        } catch (error) {
            console.error('Failed to sync with InsightIQ:', error);
            res.status(500).json({ error: 'Failed to sync with InsightIQ' });
        }
    };
}
