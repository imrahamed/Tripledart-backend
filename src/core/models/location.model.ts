import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
    name: string;
    country: string;
    state?: string;
    city?: string;
    code: string;
    type: 'country' | 'state' | 'city';
    parentCode?: string;
    metadata: {
        lastUpdated: Date;
        dataSource: string;
    };
}

const LocationSchema: Schema = new Schema({
    name: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String },
    city: { type: String },
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ['country', 'state', 'city'], required: true },
    parentCode: { type: String },
    metadata: {
        lastUpdated: { type: Date, default: Date.now },
        dataSource: { type: String, default: 'insightiq' }
    }
});

export const Location = mongoose.model<ILocation>('Location', LocationSchema); 