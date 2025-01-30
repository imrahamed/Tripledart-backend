
import { Request, Response } from 'express';
import { AnalyticsService } from '../../core/services/analytics.service';

export class AnalyticsController {
  static async getCampaignAnalytics(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const { startDate, endDate } = req.query;
      const analytics = await AnalyticsService.getCampaignAnalytics(
        campaignId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching campaign analytics' });
    }
  }
}
