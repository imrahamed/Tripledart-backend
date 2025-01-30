import Joi from 'joi';

export const createCampaignSchema = Joi.object({
  name: Joi.string().required(),
  brandId: Joi.string().required(),
  influencers: Joi.array().items(Joi.string()).min(1).required(),
  budget: Joi.number().min(0).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  status: Joi.string().valid('draft', 'active', 'completed').default('draft')
});

export const updateCampaignSchema = Joi.object({
  name: Joi.string(),
  influencers: Joi.array().items(Joi.string()).min(1),
  budget: Joi.number().min(0),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  status: Joi.string().valid('draft', 'active', 'completed')
}).min(1);

export const searchCampaignSchema = Joi.object({
  brandId: Joi.string(),
  status: Joi.string().valid('draft', 'active', 'completed'),
  startDateFrom: Joi.date().iso(),
  startDateTo: Joi.date().iso().min(Joi.ref('startDateFrom')),
  endDateFrom: Joi.date().iso(),
  endDateTo: Joi.date().iso().min(Joi.ref('endDateFrom'))
});