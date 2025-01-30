import { CampaignModel, ICampaign } from '../models/campaign.model';
import { redisClient } from '../../config/redisClient';

export class CampaignService {
  static async createCampaign(data: Partial<ICampaign>) {
    const campaign = new CampaignModel(data);
    const saved = await campaign.save();
    await redisClient.del('campaign:list');
    return saved;
  }

  static async getCampaignById(id: string) {
    const cacheKey = `campaign:${id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const fetched = await CampaignModel.findById(id).populate('influencers');
    if (fetched) {
      await redisClient.set(cacheKey, JSON.stringify(fetched));
    }
    return fetched;
  }

  static async updateCampaign(id: string, data: Partial<ICampaign>) {
    const updated = await CampaignModel.findByIdAndUpdate(id, data, {
      new: true
    });
    if (updated) {
      await redisClient.del(`campaign:${id}`);
      await redisClient.del('campaign:list');
    }
    return updated;
  }

  static async deleteCampaign(id: string) {
    const removed = await CampaignModel.findByIdAndDelete(id);
    await redisClient.del(`campaign:${id}`);
    await redisClient.del('campaign:list');
    return removed;
  }

  static async getAllCampaigns() {
    const listCacheKey = 'campaign:list';
    const cached = await redisClient.get(listCacheKey);
    if (cached) return JSON.parse(cached);

    const campaigns = await CampaignModel.find();
    await redisClient.set(listCacheKey, JSON.stringify(campaigns));
    return campaigns;
  }
}
