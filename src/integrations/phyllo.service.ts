import axios from 'axios';
import { ENV } from '../config/environment';

export class PhylloIntegration {
  static async fetchInfluencerMetrics(phylloId: string) {
    try {
      const response = await axios.get(`${ENV.PHYLLO_BASE_URL}/influencers/${phylloId}`, {
        headers: {
          'Authorization': `Bearer ${ENV.PHYLLO_API_KEY}`
        }
      });
      // Transform to match our influencer model fields as needed
      const socialAccounts = response.data.socialAccounts?.map((acc: any) => ({
        platform: acc.platform,
        username: acc.username,
        followers: acc.followers,
        engagementRate: acc.engagementRate
      })) || [];
      return { socialAccounts };
    } catch (error) {
      console.error('Error fetching Phyllo data:', error);
      return null;
    }
  }
}
