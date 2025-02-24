import { SwaggerDocs } from '../../decorators/swagger.decorator';
import { Request, Response } from 'express';
import { AnalyticsService } from '../../core/services/analytics.service';

export class AnalyticsController {
  @SwaggerDocs({
    '/api/analytics/campaign/{campaignId}': {
      get: {
        summary: 'Get campaign analytics',
        tags: ['Analytics'],
        parameters: [
          {
            in: 'path',
            name: 'campaignId',
            required: true,
            schema: { type: 'string' }
          },
          {
            in: 'query',
            name: 'startDate',
            required: true,
            schema: { type: 'string', format: 'date' }
          },
          {
            in: 'query',
            name: 'endDate',
            required: true,
            schema: { type: 'string', format: 'date' }
          }
        ],
        responses: {
          200: {
            description: 'Campaign analytics retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CampaignAnalytics' }
              }
            }
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        },
        security: [{ BearerAuth: [] }]
      }
    }
  })
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
