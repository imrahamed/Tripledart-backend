
import express from 'express';
import { ContentController } from '../controllers/content.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { createContentSchema, getContentCalendarSchema, updateContentSchema } from '../../validations/content.validation';

const router = express.Router();

router.get(
  '/calendar/:campaignId',
  validateRequest(getContentCalendarSchema),
  ContentController.getContentCalendar
);
router.post(
  '/',
  validateRequest(createContentSchema),
  ContentController.createContent
);
router.put(
  '/:id',
  validateRequest(updateContentSchema),
  ContentController.updateContent
);

export default router;
