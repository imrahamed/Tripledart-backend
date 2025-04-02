import express from 'express';
import webhookRoutes from './routes/webhooks.route';
import platformSettingsRoutes from './api/routes/platform-settings.routes';
import { platformSettingsService } from './services/platform-settings.service';

const app = express();

// Initialize platform settings
platformSettingsService.initializeDefaultPlatforms()
    .then(() => console.log('Platform settings initialized'))
    .catch(error => console.error('Failed to initialize platform settings:', error));

// Register routes
app.use('/api/webhooks', webhookRoutes);
app.use('/api/platform-settings', platformSettingsRoutes);

// ... rest of the file ... 