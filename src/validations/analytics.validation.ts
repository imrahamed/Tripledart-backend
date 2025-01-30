
import Joi from 'joi';

export const getCampaignAnalyticsSchema = Joi.object({
  campaignId: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
});

export const addAnalyticsSchema = Joi.object({
  campaignId: Joi.string().required(),
  date: Joi.date().iso().required(),
  impressions: Joi.number().min(0).required(),
  engagement: Joi.number().min(0).required(),
  clicks: Joi.number().min(0).required(),
  conversions: Joi.number().min(0).required()
});
