
import Joi from 'joi';

export const createClientRelationshipSchema = Joi.object({
  influencerId: Joi.string().required(),
  clientId: Joi.string().required(),
  status: Joi.string().valid('active', 'past', 'potential').required()
});

export const updateClientRelationshipSchema = Joi.object({
  status: Joi.string().valid('active', 'past', 'potential'),
  lastInteractionDate: Joi.date().iso(),
  totalRevenue: Joi.number().min(0)
}).min(1);
