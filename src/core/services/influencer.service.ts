import { InfluencerModel, IInfluencer } from '../models/influencer.model';
import { redisClient } from '../../config/redisClient';
import { PhylloIntegration } from '../../integrations/phyllo.service';

export class InfluencerService {
  static async createInfluencer(data: Partial<IInfluencer>) {
    const influencer = new InfluencerModel(data);
    const saved = await influencer.save();
    await redisClient.del('influencer:list');
    return saved;
  }

  static async getInfluencerById(id: string) {
    const cacheKey = `influencer:${id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const fetched = await InfluencerModel.findById(id);
    if (fetched) {
      await redisClient.set(cacheKey, JSON.stringify(fetched));
    }
    return fetched;
  }

  static async updateInfluencer(id: string, data: Partial<IInfluencer>) {
    const updated = await InfluencerModel.findByIdAndUpdate(id, data, {
      new: true
    });
    if (updated) {
      await redisClient.del(`influencer:${id}`);
      await redisClient.del('influencer:list');
    }
    return updated;
  }

  static async deleteInfluencer(id: string) {
    const removed = await InfluencerModel.findByIdAndDelete(id);
    await redisClient.del(`influencer:${id}`);
    await redisClient.del('influencer:list');
    return removed;
  }

  static async searchInfluencers(filters: Partial<IInfluencer>) {
    const listCacheKey = 'influencer:list';
    const cached = await redisClient.get(listCacheKey);
    if (cached) return JSON.parse(cached);

    const query: any = {};
    if (filters.name) query.name = { $regex: filters.name, $options: 'i' };
    const result = await InfluencerModel.find(query);
    await redisClient.set(listCacheKey, JSON.stringify(result));
    return result;
  }

  static async syncInfluencerWithPhyllo(influencerId: string) {
    const influencer = await InfluencerModel.findById(influencerId);
    if (!influencer || !influencer.phylloId) return null;
    const phylloData = await PhylloIntegration.fetchInfluencerMetrics(influencer.phylloId);
    if (phylloData) {
      influencer.socialAccounts = phylloData.socialAccounts;
      await influencer.save();
      await redisClient.del(`influencer:${influencerId}`);
      await redisClient.del('influencer:list');
      return influencer;
    }
    return null;
  }
}
