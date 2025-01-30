
import { Analytics, IAnalytics } from '../models/analytics.model';

export class AnalyticsService {
  static async getCampaignAnalytics(campaignId: string, startDate: Date, endDate: Date): Promise<IAnalytics[]> {
    return Analytics.find({
      campaignId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
  }

  static async addAnalytics(analyticsData: Partial<IAnalytics>): Promise<IAnalytics> {
    const analytics = new Analytics(analyticsData);
    return analytics.save();
  }
}
