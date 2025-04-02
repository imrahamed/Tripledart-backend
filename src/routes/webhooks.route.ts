import express from 'express';
import { insightIQService } from '../services/insightiq.service';
import { InsightIQWebhookEvent } from '../services/insightiq.service';

const router = express.Router();

// Verify webhook signature middleware
const verifyWebhookSignature = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const signature = req.headers['x-insightiq-signature'];
    // TODO: Implement signature verification
    // For now, we'll just pass through
    next();
};

// Handle InsightIQ webhooks
router.post('/insightiq', verifyWebhookSignature, async (req: express.Request, res: express.Response) => {
    try {
        const event = req.body as InsightIQWebhookEvent;
        
        // Handle the webhook event
        await insightIQService.handleWebhookEvent(event);
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).json({ success: false, error: 'Failed to process webhook' });
    }
});

export default router; 