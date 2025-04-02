import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
    platforms: {
        name: string;
        code: string;
        isActive: boolean;
        icon?: string;
        description?: string;
    }[];
    topics: {
        name: string;
        code: string;
        isActive: boolean;
        category?: string;
        description?: string;
    }[];
    locations: {
        name: string;
        code: string;
        type: 'country' | 'city' | 'region';
        parentCode?: string;
        isActive: boolean;
        description?: string;
    }[];
    lastSync: Date;
    updatedBy: mongoose.Types.ObjectId;
    updatedAt: Date;
}

const platformSettingsSchema = new Schema<IPlatformSettings>({
    platforms: [{
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: true },
        icon: String,
        description: String
    }],
    topics: [{
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: true },
        category: String,
        description: String
    }],
    locations: [{
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        type: { type: String, enum: ['country', 'city', 'region'], required: true },
        parentCode: String,
        isActive: { type: Boolean, default: true },
        description: String
    }],
    lastSync: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Create indexes
platformSettingsSchema.index({ 'platforms.code': 1 });
platformSettingsSchema.index({ 'topics.code': 1 });
platformSettingsSchema.index({ 'locations.code': 1 });

export const PlatformSettingsModel = mongoose.model<IPlatformSettings>('PlatformSettings', platformSettingsSchema); 