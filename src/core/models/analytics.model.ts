
import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  campaignId: mongoose.Types.ObjectId;
  date: Date;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
}

const AnalyticsSchema: Schema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  date: { type: Date, required: true },
  impressions: { type: Number, default: 0 },
  engagement: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
});

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
