import Joi from 'joi';

export const createInfluencerSchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().required(),
  socialAccounts: Joi.array().items(Joi.object({
    platform: Joi.string().required(),
    username: Joi.string().required(),
    followers: Joi.number().integer().min(0).required(),
    engagementRate: Joi.number().min(0).max(100).required()
  })).min(1).required()
});

export const updateInfluencerSchema = Joi.object({
  name: Joi.string(),
  socialAccounts: Joi.array().items(Joi.object({
    platform: Joi.string(),
    username: Joi.string(),
    followers: Joi.number().integer().min(0),
    engagementRate: Joi.number().min(0).max(100)
  }))
}).min(1);

export const searchInfluencerSchema = Joi.object({
  platform: Joi.string(),
  minFollowers: Joi.number().integer().min(0),
  maxFollowers: Joi.number().integer().min(0),
  minEngagementRate: Joi.number().min(0).max(100),
  maxEngagementRate: Joi.number().min(0).max(100)
});