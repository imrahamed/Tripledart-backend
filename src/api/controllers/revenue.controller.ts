
import { Request, Response } from 'express';
import { RevenueService } from '../../core/services/revenue.service';

export class RevenueController {
  static async getRevenueOverview(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const overview = await RevenueService.getRevenueOverview(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(overview);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching revenue overview' });
    }
  }

  static async addRevenue(req: Request, res: Response) {
    try {
      const revenue = await RevenueService.addRevenue(req.body);
      res.status(201).json(revenue);
    } catch (error) {
      res.status(500).json({ message: 'Error adding revenue' });
    }
  }
}
