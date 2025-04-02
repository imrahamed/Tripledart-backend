import { Request, Response } from 'express';
import { insightIQService } from '../../services/insightiq.service';
import { PlatformSettingsModel, IPlatformSettings } from '../../core/models/platformSettings.model';
import mongoose from 'mongoose';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user: {
                id: mongoose.Types.ObjectId;
            };
        }
    }
}

export class PlatformSettingsController {
    /**
     * Fetch and sync platforms from InsightIQ
     */
    static async syncPlatforms(req: Request, res: Response): Promise<void> {
        try {
            const platforms = await insightIQService.getPlatforms();
            
            // Start a MongoDB session for transaction
            const session = await mongoose.startSession();
            session.startTransaction();
            
            try {
                // Get existing settings or create new ones
                let settings = await PlatformSettingsModel.findOne().session(session);
                
                if (!settings) {
                    settings = new PlatformSettingsModel({
                        platforms: [],
                        topics: [],
                        locations: [],
                        updatedBy: req.user.id
                    });
                }
                
                // Update platforms
                settings.platforms = platforms.map(platform => ({
                    name: platform.name,
                    code: platform.code,
                    icon: platform.icon,
                    description: platform.description,
                    isActive: true
                }));
                
                settings.lastSync = new Date();
                settings.updatedBy = req.user.id;
                settings.updatedAt = new Date();
                
                await settings.save({ session });
                await session.commitTransaction();
                
                res.status(200).json({
                    success: true,
                    message: 'Platforms synced successfully',
                    platforms: settings.platforms
                });
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } catch (error) {
            console.error('Error syncing platforms:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to sync platforms',
                error: (error as Error).message
            });
        }
    }
    
    /**
     * Fetch and sync topics from InsightIQ
     */
    static async syncTopics(req: Request, res: Response): Promise<void> {
        try {
            const topics = await insightIQService.getTopics();
            
            // Start a MongoDB session for transaction
            const session = await mongoose.startSession();
            session.startTransaction();
            
            try {
                // Get existing settings or create new ones
                let settings = await PlatformSettingsModel.findOne().session(session);
                
                if (!settings) {
                    settings = new PlatformSettingsModel({
                        platforms: [],
                        topics: [],
                        locations: [],
                        updatedBy: req.user.id
                    });
                }
                
                // Update topics
                settings.topics = topics.map(topic => ({
                    name: topic.name,
                    code: topic.code,
                    category: topic.category,
                    description: topic.description,
                    isActive: true
                }));
                
                settings.lastSync = new Date();
                settings.updatedBy = req.user.id;
                settings.updatedAt = new Date();
                
                await settings.save({ session });
                await session.commitTransaction();
                
                res.status(200).json({
                    success: true,
                    message: 'Topics synced successfully',
                    topics: settings.topics
                });
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } catch (error) {
            console.error('Error syncing topics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to sync topics',
                error: (error as Error).message
            });
        }
    }

    /**
     * Fetch and sync locations from InsightIQ
     */
    static async syncLocations(req: Request, res: Response): Promise<void> {
        try {
            const locations = await insightIQService.getLocations();
            
            // Start a MongoDB session for transaction
            const session = await mongoose.startSession();
            session.startTransaction();
            
            try {
                // Get existing settings or create new ones
                let settings = await PlatformSettingsModel.findOne().session(session);
                
                if (!settings) {
                    settings = new PlatformSettingsModel({
                        platforms: [],
                        topics: [],
                        locations: [],
                        updatedBy: req.user.id
                    });
                }
                
                // Update locations
                settings.locations = locations.map(location => ({
                    name: location.name,
                    code: location.code,
                    type: location.type,
                    parentCode: location.parentCode,
                    description: location.description,
                    isActive: true
                }));
                
                settings.lastSync = new Date();
                settings.updatedBy = req.user.id;
                settings.updatedAt = new Date();
                
                await settings.save({ session });
                await session.commitTransaction();
                
                res.status(200).json({
                    success: true,
                    message: 'Locations synced successfully',
                    locations: settings.locations
                });
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } catch (error) {
            console.error('Error syncing locations:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to sync locations',
                error: (error as Error).message
            });
        }
    }
    
    /**
     * Get current platform settings
     */
    static async getSettings(req: Request, res: Response): Promise<void> {
        try {
            const settings = await PlatformSettingsModel.findOne()
                .populate('updatedBy', 'name email')
                .sort({ updatedAt: -1 });
            
            if (!settings) {
                res.status(404).json({
                    success: false,
                    message: 'No platform settings found'
                });
                return;
            }
            
            res.status(200).json({
                success: true,
                settings
            });
        } catch (error) {
            console.error('Error getting platform settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get platform settings',
                error: (error as Error).message
            });
        }
    }
    
    /**
     * Update platform, topic, or location status
     */
    static async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            const { type, code, isActive } = req.body;
            
            if (!type || !code || typeof isActive !== 'boolean') {
                res.status(400).json({
                    success: false,
                    message: 'Invalid request parameters'
                });
                return;
            }
            
            if (!['platforms', 'topics', 'locations'].includes(type)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid type. Must be either "platforms", "topics", or "locations"'
                });
                return;
            }
            
            const settings = await PlatformSettingsModel.findOne();
            
            if (!settings) {
                res.status(404).json({
                    success: false,
                    message: 'No platform settings found'
                });
                return;
            }
            
            const item = (settings as any)[type].find((item: any) => item.code === code);
            
            if (!item) {
                res.status(404).json({
                    success: false,
                    message: `${type.slice(0, -1)} not found`
                });
                return;
            }
            
            item.isActive = isActive;
            settings.updatedBy = req.user.id;
            settings.updatedAt = new Date();
            
            await settings.save();
            
            res.status(200).json({
                success: true,
                message: `${type.slice(0, -1)} status updated successfully`,
                [type]: (settings as any)[type]
            });
        } catch (error) {
            console.error('Error updating status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update status',
                error: (error as Error).message
            });
        }
    }
} 