
import { ClientRelationship, IClientRelationship } from '../models/clientRelationship.model';

export class ClientRelationshipService {
  static async createRelationship(relationshipData: Partial<IClientRelationship>): Promise<IClientRelationship> {
    const relationship = new ClientRelationship(relationshipData);
    return relationship.save();
  }

  static async getRelationships(influencerId: string): Promise<IClientRelationship[]> {
    return ClientRelationship.find({ influencerId });
  }

  static async updateRelationship(id: string, relationshipData: Partial<IClientRelationship>): Promise<IClientRelationship | null> {
    return ClientRelationship.findByIdAndUpdate(id, relationshipData, { new: true });
  }
}
