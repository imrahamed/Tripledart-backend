import mongoose, { Schema, Document } from 'mongoose';

interface ISocialAccount {
  platform: string;
  username: string;
  followers: number;
  engagementRate: number;
}

export interface IInfluencer extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  socialAccounts: ISocialAccount[];
  phylloId?: string;
}

const InfluencerSchema: Schema<IInfluencer> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    socialAccounts: [
      {
        platform: String,
        username: String,
        followers: Number,
        engagementRate: Number
      }
    ],
    phylloId: { type: String }
  },
  { timestamps: true }
);

export const InfluencerModel = mongoose.model<IInfluencer>(
  'Influencer',
  InfluencerSchema
);
