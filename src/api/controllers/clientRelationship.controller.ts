
import { Request, Response } from 'express';
import { ClientRelationshipService } from '../../core/services/clientRelationship.service';

export class ClientRelationshipController {
  static async createRelationship(req: Request, res: Response) {
    try {
      const relationship = await ClientRelationshipService.createRelationship(req.body);
      res.status(201).json(relationship);
    } catch (error) {
      res.status(500).json({ message: 'Error creating client relationship' });
    }
  }

  static async getRelationships(req: Request, res: Response) {
    try {
      const { influencerId } = req.params;
      const relationships = await ClientRelationshipService.getRelationships(influencerId);
      res.json(relationships);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching client relationships' });
    }
  }

  static async updateRelationship(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const relationship = await ClientRelationshipService.updateRelationship(id, req.body);
      if (!relationship) {
        res.status(404).json({ message: 'Client relationship not found' });
      }
      res.json(relationship);
    } catch (error) {
      res.status(500).json({ message: 'Error updating client relationship' });
    }
  }
}
