
import { Revenue, IRevenue } from '../models/revenue.model';

export class RevenueService {
  static async getRevenueOverview(startDate: Date, endDate: Date): Promise<any> {
    const totalRevenue = await Revenue.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate }, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyTrend = await Revenue.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate }, status: 'paid' } },
      { $group: { _id: { $month: '$date' }, amount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    const pendingPayments = await Revenue.find({ status: 'pending' }).populate('campaignId');

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyTrend,
      pendingPayments
    };
  }

  static async addRevenue(revenueData: Partial<IRevenue>): Promise<IRevenue> {
    const revenue = new Revenue(revenueData);
    return revenue.save();
  }
}
