
import express from 'express';
import { RevenueController } from '../controllers/revenue.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { addRevenueSchema, getRevenueOverviewSchema } from '../../validations/revenue.validation';

const router = express.Router();

router.get(
  '/overview',
  validateRequest(getRevenueOverviewSchema),
  RevenueController.getRevenueOverview
);
router.post(
  '/',
  validateRequest(addRevenueSchema),
  RevenueController.addRevenue
);

export default router;
