
import Joi from 'joi';

export const getRevenueOverviewSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
});

export const addRevenueSchema = Joi.object({
  campaignId: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  date: Joi.date().iso().required(),
  status: Joi.string().valid('pending', 'paid').required()
});
