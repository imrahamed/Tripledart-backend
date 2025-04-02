import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
    platformId: string;
    name: string;
    icon: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const platformSettingsSchema = new Schema<IPlatformSettings>(
    {
        platformId: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const PlatformSettingsModel = mongoose.model<IPlatformSettings>('PlatformSettings', platformSettingsSchema); 