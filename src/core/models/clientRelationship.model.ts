
import mongoose, { Schema, Document } from 'mongoose';

export interface IClientRelationship extends Document {
  influencerId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  status: string;
  firstContactDate: Date;
  lastInteractionDate: Date;
  totalRevenue: number;
}

const ClientRelationshipSchema: Schema = new Schema({
  influencerId: { type: Schema.Types.ObjectId, ref: 'Influencer', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'past', 'potential'], required: true },
  firstContactDate: { type: Date, default: Date.now },
  lastInteractionDate: { type: Date, default: Date.now },
  totalRevenue: { type: Number, default: 0 },
});

export const ClientRelationship = mongoose.model<IClientRelationship>('ClientRelationship', ClientRelationshipSchema);
