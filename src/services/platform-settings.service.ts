import { PlatformSettingsModel, IPlatformSettings } from '../core/models/platform-settings.model';

export class PlatformSettingsService {
    async getAllPlatforms(): Promise<IPlatformSettings[]> {
        return await PlatformSettingsModel.find({ isActive: true });
    }

    async getPlatformById(platformId: string): Promise<IPlatformSettings | null> {
        return await PlatformSettingsModel.findOne({ platformId, isActive: true });
    }

    async initializeDefaultPlatforms(): Promise<void> {
        const defaultPlatforms = [
            {
                platformId: "14d9ddf5-51c6-415e-bde6-f8ed36ad7054",
                name: "YouTube",
                icon: "youtube.svg",
                isActive: true
            },
            {
                platformId: "7645460a-96e0-4192-a3ce-a1fc30641f72",
                name: "Twitter",
                icon: "x-twitter.svg",
                isActive: true
            },
            {
                platformId: "36410629-f907-43ba-aa0d-434ca9c0501a",
                name: "LinkedIn",
                icon: "linkedin.svg",
                isActive: true
            }
        ];

        for (const platform of defaultPlatforms) {
            await PlatformSettingsModel.findOneAndUpdate(
                { platformId: platform.platformId },
                platform,
                { upsert: true, new: true }
            );
        }
    }
}

export const platformSettingsService = new PlatformSettingsService(); 