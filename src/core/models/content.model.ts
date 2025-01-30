
import mongoose, { Schema, Document } from 'mongoose';

export interface IContent extends Document {
  campaignId: mongoose.Types.ObjectId;
  influencerId: mongoose.Types.ObjectId;
  platform: string;
  contentType: string;
  scheduledDate: Date;
  content: string;
  status: string;
}

const ContentSchema: Schema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  influencerId: { type: Schema.Types.ObjectId, ref: 'Influencer', required: true },
  platform: { type: String, required: true },
  contentType: { type: String, enum: ['post', 'story', 'video'], required: true },
  scheduledDate: { type: Date, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['draft', 'scheduled', 'published'], default: 'draft' },
});

export const Content = mongoose.model<IContent>('Content', ContentSchema);
