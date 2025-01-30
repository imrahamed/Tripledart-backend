
import { Content, IContent } from '../models/content.model';

export class ContentService {
  static async getContentCalendar(campaignId: string, startDate: Date, endDate: Date): Promise<IContent[]> {
    return Content.find({
      campaignId,
      scheduledDate: { $gte: startDate, $lte: endDate }
    }).sort({ scheduledDate: 1 });
  }

  static async createContent(contentData: Partial<IContent>): Promise<IContent> {
    const content = new Content(contentData);
    return content.save();
  }

  static async updateContent(id: string, contentData: Partial<IContent>): Promise<IContent | null> {
    return Content.findByIdAndUpdate(id, contentData, { new: true });
  }
}
