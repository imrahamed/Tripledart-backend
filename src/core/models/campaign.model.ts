import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  brandId: mongoose.Types.ObjectId;
  influencers: mongoose.Types.ObjectId[];
  budget: number;
  status: 'draft' | 'active' | 'completed';
}

const CampaignSchema: Schema<ICampaign> = new Schema(
  {
    name: { type: String, required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    influencers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Influencer' }],
    budget: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed'],
      default: 'draft'
    }
  },
  { timestamps: true }
);

export const CampaignModel = mongoose.model<ICampaign>(
  'Campaign',
  CampaignSchema
);
