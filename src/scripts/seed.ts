// src/scripts/seed.ts
import 'dotenv/config';
import mongoose from 'mongoose';
import { ClientRelationshipService } from '../core/services/clientRelationship.service';
import { redisClient } from '../config/redisClient';
import { UserService } from '../core/services/user.service';
import { InfluencerService } from '../core/services/influencer.service';
import { CampaignService } from '../core/services/campaign.service';
import { connectDatabase } from '../config/database';

const seedDatabase = async () => {
  try {
    await connectDatabase();
    await redisClient.connect();
    await redisClient.flushAll();


    // Check existing data
    const [users, influencers, campaigns] = await Promise.all([
      UserService.listUsers(),
      InfluencerService.searchInfluencers({}),
      CampaignService.getAllCampaigns()
    ]);

    if (users.length > 0 || influencers.length > 0 || campaigns.length > 0) {
        console.log({users, influencers, campaigns})
      console.warn('Database already contains data - aborting seeding');
      return;
    }

    // Seed Admin User
    const admin = await UserService.createUser({
      name: 'Tripledart Admin',
      email: 'admin@tripledart.com',
      password: process.env.DEFAULT_ADMIN_PWD!,
      role: 'admin'
    });

    // Seed Brand User
    const brand = await UserService.createUser({
      name: 'Demo SaaS Corp',
      email: 'brand@tripledart.com',
      password: process.env.DEFAULT_BRAND_PWD!,
      role: 'brand'
    });

    // Seed Influencer
    const influencer = await InfluencerService.createInfluencer({
      name: 'Tech Thought Leader',
      socialAccounts: [{
        platform: 'LinkedIn',
        username: 'demo_influencer',
        followers: 25000,
        engagementRate: 4.5
      }],
      userId: new mongoose.Types.ObjectId(),
      phylloId: 'DEMO_PHYLLO_123'
    });

    // Seed Campaign
    const campaign = await CampaignService.createCampaign({
      name: 'Product Launch 2025',
      brandId: brand.id,
      influencers: [influencer.id],
      budget: 15000,
      status: 'active'
    });

    // Seed Client Relationship
    await ClientRelationshipService.createRelationship({
      influencerId: influencer.id,
      clientId: brand.id,
      status: 'active'
    });

    // Warm Redis cache
    await redisClient.set(`user:${admin.id}`, JSON.stringify(admin));
    await redisClient.set(`influencer:${influencer.id}`, JSON.stringify(influencer));
    
    console.info('Database seeded successfully');
  } catch (error) {
    console.error('Seeding failed', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    await redisClient.quit();
  }
};

seedDatabase();
