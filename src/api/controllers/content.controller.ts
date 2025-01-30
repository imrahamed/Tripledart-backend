
import { Request, Response } from 'express';
import { ContentService } from '../../core/services/content.service';

export class ContentController {
  static async getContentCalendar(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const { startDate, endDate } = req.query;
      const calendar = await ContentService.getContentCalendar(
        campaignId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(calendar);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching content calendar' });
    }
  }

  static async createContent(req: Request, res: Response) {
    try {
      const content = await ContentService.createContent(req.body);
      res.status(201).json(content);
    } catch (error) {
      res.status(500).json({ message: 'Error creating content' });
    }
  }

  static async updateContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const content = await ContentService.updateContent(id, req.body);
      if (!content) {
        res.status(404).json({ message: 'Content not found' });
        return;
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Error updating content' });
    }
  }
}
