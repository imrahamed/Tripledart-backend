
import mongoose, { Schema, Document } from 'mongoose';

export interface IRevenue extends Document {
  campaignId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  status: string;
}

const RevenueSchema: Schema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
});

export const Revenue = mongoose.model<IRevenue>('Revenue', RevenueSchema);
