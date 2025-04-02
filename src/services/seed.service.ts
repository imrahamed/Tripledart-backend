import { InfluencerModel } from '../core/models/influencer.model';
import { UserModel } from '../core/models/user.model';
import { platformSettingsService } from './platform-settings.service';

export class SeedService {
    async seedDummyInfluencers() {
        try {
            const platforms = await platformSettingsService.getAllPlatforms();
            
            const dummyInfluencers = [
                {
                    email: 'john@youtube.insightiq',
                    name: 'John Tech',
                    username: 'johntech',
                    platform: 'YouTube',
                    followers: 150000,
                    bio: 'Tech reviewer and gadget enthusiast',
                    profilePictureUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
                    categories: ['Technology', 'Gaming', 'Reviews']
                },
                {
                    email: 'sarah@twitter.insightiq',
                    name: 'Sarah Marketing',
                    username: 'sarahmarketing',
                    platform: 'Twitter',
                    followers: 85000,
                    bio: 'Digital marketing expert and social media strategist',
                    profilePictureUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
                    categories: ['Marketing', 'Social Media', 'Business']
                },
                {
                    email: 'mike@linkedin.insightiq',
                    name: 'Mike Professional',
                    username: 'mikeprofessional',
                    platform: 'LinkedIn',
                    followers: 120000,
                    bio: 'Career development coach and professional mentor',
                    profilePictureUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
                    categories: ['Career Development', 'Professional Growth', 'Leadership']
                }
            ];

            for (const influencer of dummyInfluencers) {
                // Create or update user
                let user = await UserModel.findOne({ email: influencer.email });
                
                if (!user) {
                    const newUsers = await UserModel.create([{
                        name: influencer.name,
                        email: influencer.email,
                        password: Math.random().toString(36).slice(-10),
                        role: 'influencer' as const
                    }]);
                    user = newUsers[0];
                }

                // Create platform profile
                const platformProfile = {
                    full_name: influencer.name,
                    url: `https://${influencer.platform.toLowerCase()}.com/${influencer.username}`,
                    image_url: influencer.profilePictureUrl,
                    follower_count: influencer.followers,
                    connection_count: Math.floor(influencer.followers * 0.1),
                    introduction: influencer.bio,
                    profile_headline: influencer.bio,
                    external_id: Math.random().toString(36).slice(-8),
                    creator_account_type: 'personal',
                    work_platform: {
                        id: platforms.find(p => p.name === influencer.platform)?.platformId || '',
                        name: influencer.platform,
                        logo_url: `assets/icons/${platforms.find(p => p.name === influencer.platform)?.icon || ''}`
                    },
                    creator_location: {
                        city: 'San Francisco',
                        state: 'CA',
                        country: 'United States'
                    },
                    talks_about: influencer.categories,
                    open_to: ['Sponsored Content', 'Brand Collaborations', 'Product Reviews'],
                    current_positions: [{
                        title: 'Content Creator',
                        company: influencer.platform,
                        description: 'Creating engaging content for my audience',
                        location: 'San Francisco, CA',
                        time_period: {
                            start_date: new Date('2020-01-01')
                        }
                    }],
                    engagement_rate: 0.03 + Math.random() * 0.02,
                    metadata: {
                        lastUpdated: new Date(),
                        dataSource: 'insightiq',
                        lastSyncDate: new Date(),
                        platformSpecificData: {}
                    }
                };

                // Create or update influencer
                await InfluencerModel.findOneAndUpdate(
                    { influencer_id: user._id.toString() },
                    {
                        influencer_id: user._id.toString(),
                        platform_profiles: [platformProfile],
                        ui_profile: {
                            handle: influencer.username,
                            role: 'Content Creator',
                            avatarUrl: influencer.profilePictureUrl,
                            bio: influencer.bio,
                            location: 'San Francisco, CA',
                            gender: 'Not Specified',
                            accountType: 'Personal',
                            isVerified: true,
                            contactIconUrl: 'assets/icons/contact.svg',
                            socialLinks: [{
                                platform: influencer.platform,
                                url: `https://${influencer.platform.toLowerCase()}.com/${influencer.username}`
                            }],
                            categories: influencer.categories,
                            tags: influencer.categories,
                            topics: influencer.categories,
                            interests: influencer.categories,
                            expertise: influencer.categories,
                            performance: {
                                engagementRate: platformProfile.engagement_rate,
                                reach: influencer.followers,
                                impressions: influencer.followers * 2
                            },
                            pricing: {
                                minimumBudget: 500,
                                maximumBudget: 5000,
                                currency: 'USD'
                            },
                            audienceDemographics: {
                                ageRanges: {
                                    '18-24': 0.3,
                                    '25-34': 0.4,
                                    '35-44': 0.2,
                                    '45+': 0.1
                                },
                                genderDistribution: {
                                    'Male': 0.6,
                                    'Female': 0.4
                                },
                                locations: {
                                    'United States': 0.7,
                                    'Canada': 0.1,
                                    'United Kingdom': 0.1,
                                    'Other': 0.1
                                },
                                languages: {
                                    'English': 0.9,
                                    'Spanish': 0.05,
                                    'Other': 0.05
                                }
                            }
                        },
                        metadata: {
                            lastSyncDate: new Date(),
                            dataSource: 'insightiq',
                            lastUpdated: new Date()
                        }
                    },
                    { upsert: true, new: true }
                );
            }

            console.log('Dummy influencers seeded successfully');
        } catch (error) {
            console.error('Error seeding dummy influencers:', error);
            throw error;
        }
    }
}

export const seedService = new SeedService(); 