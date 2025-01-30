import { Request, Response } from "express";
import { CampaignService } from "../../core/services/campaign.service";

export class CampaignController {
    static async createCampaign(req: Request, res: Response) {
        try {
            const campaign = await CampaignService.createCampaign(req.body);
            res.status(201).json(campaign);
        } catch (err) {
            res.status(500).json({ message: "Error creating campaign" });
        }
    }

    static async getCampaign(req: Request, res: Response) {
        try {
            const campaign = await CampaignService.getCampaignById(req.params.id);
            if (!campaign) {
                res.status(404).json({ message: "Campaign not found" });
            }
            res.json(campaign);
        } catch (err) {
            res.status(500).json({ message: "Error fetching campaign" });
        }
    }

    static async updateCampaign(req: Request, res: Response) {
        try {
            const campaign = await CampaignService.updateCampaign(req.params.id, req.body);
            if (!campaign) {
                res.status(404).json({ message: "Campaign not found" });
            }
            res.json(campaign);
        } catch (err) {
            res.status(500).json({ message: "Error updating campaign" });
        }
    }

    static async deleteCampaign(req: Request, res: Response) {
        try {
            const deleted = await CampaignService.deleteCampaign(req.params.id);
            if (!deleted) {
                res.status(404).json({ message: "Campaign not found" });
            }
            res.json({ message: "Campaign deleted" });
        } catch (err) {
            res.status(500).json({ message: "Error deleting campaign" });
        }
    }

    static async getAllCampaigns(_req: Request, res: Response) {
        try {
            const campaigns = await CampaignService.getAllCampaigns();
            res.json(campaigns);
        } catch (err) {
            res.status(500).json({ message: "Error fetching campaigns" });
        }
    }
}
