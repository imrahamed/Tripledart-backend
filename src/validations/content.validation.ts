
import Joi from 'joi';

export const getContentCalendarSchema = Joi.object({
  campaignId: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
});

export const createContentSchema = Joi.object({
  campaignId: Joi.string().required(),
  influencerId: Joi.string().
required(),
  platform: Joi.string().required(),
  contentType: Joi.string().valid('post', 'story', 'video').required(),
  scheduledDate: Joi.date().iso().required(),
  content: Joi.string().required(),
  status: Joi.string().valid('draft', 'scheduled', 'published').default('draft')
});

export const updateContentSchema = Joi.object({
  platform: Joi.string(),
  contentType: Joi.string().valid('post', 'story', 'video'),
  scheduledDate: Joi.date().iso(),
  content: Joi.string(),
  status: Joi.string().valid('draft', 'scheduled', 'published')
}).min(1);
