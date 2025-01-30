
import express from 'express';
import { ClientRelationshipController } from '../controllers/clientRelationship.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { createClientRelationshipSchema, updateClientRelationshipSchema } from '../../validations/clientRelationship.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(createClientRelationshipSchema),
  ClientRelationshipController.createRelationship
);
router.get(
  '/influencer/:influencerId',
  ClientRelationshipController.getRelationships
);
router.put(
  '/:id',
  validateRequest(updateClientRelationshipSchema),
  ClientRelationshipController.updateRelationship
);

export default router;
