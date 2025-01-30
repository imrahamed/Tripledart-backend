import { Request, Response } from "express";
import { InfluencerService } from "../../core/services/influencer.service";

export class InfluencerController {
    static async createInfluencer(req: Request, res: Response) {
        try {
            const influencer = await InfluencerService.createInfluencer(req.body);
            res.status(201).json(influencer);
        } catch (err) {
            res.status(500).json({ message: "Error creating influencer" });
        }
    }

    static async getInfluencer(req: Request, res: Response) {
        try {
            const influencer = await InfluencerService.getInfluencerById(req.params.id);
            if (!influencer) {
                res.status(404).json({ message: "Influencer not found" });
            }
            res.json(influencer);
        } catch (err) {
            res.status(500).json({ message: "Error fetching influencer" });
        }
    }

    static async updateInfluencer(req: Request, res: Response) {
        try {
            const influencer = await InfluencerService.updateInfluencer(req.params.id, req.body);
            if (!influencer) {
                res.status(404).json({ message: "Influencer not found" });
            }
            res.json(influencer);
        } catch (err) {
            res.status(500).json({ message: "Error updating influencer" });
        }
    }

    static async deleteInfluencer(req: Request, res: Response) {
        try {
            const removed = await InfluencerService.deleteInfluencer(req.params.id);
            if (!removed) {
                res.status(404).json({ message: "Influencer not found" });
            }
            res.json({ message: "Influencer deleted" });
        } catch (err) {
            res.status(500).json({ message: "Error deleting influencer" });
        }
    }

    static async searchInfluencers(req: Request, res: Response) {
        try {
            const influencers = await InfluencerService.searchInfluencers(req.query);
            res.json(influencers);
        } catch (err) {
            res.status(500).json({ message: "Error searching influencers" });
        }
    }

    static async syncPhyllo(req: Request, res: Response) {
        try {
            const updated = await InfluencerService.syncInfluencerWithPhyllo(req.params.id);
            if (!updated) {
                res.status(404).json({ message: "Could not sync influencer with Phyllo" });
            }
            res.json(updated);
        } catch (err) {
            res.status(500).json({ message: "Error syncing with Phyllo" });
        }
    }
}
