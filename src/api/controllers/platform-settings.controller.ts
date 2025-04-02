import { Request, Response } from 'express';
import { platformSettingsService } from '../../services/platform-settings.service';

export class PlatformSettingsController {
    async getAllPlatforms(req: Request, res: Response) {
        try {
            const platforms = await platformSettingsService.getAllPlatforms();
            res.json(platforms);
        } catch (error) {
            console.error('Error fetching platforms:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getPlatformById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const platform = await platformSettingsService.getPlatformById(id);
            
            if (!platform) {
                return res.status(404).json({ message: 'Platform not found' });
            }
            
            res.json(platform);
        } catch (error) {
            console.error('Error fetching platform:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export const platformSettingsController = new PlatformSettingsController(); 