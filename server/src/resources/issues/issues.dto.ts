import Joi from 'joi';
import { FindSchema, PaginationSchema } from '../../schemas';
import { SortOrder } from '../../types';

const FindIssuesPaginationSchema = PaginationSchema.keys({
  sort: Joi.object({
    by: Joi.string().valid('title', 'priority', 'label').allow(null).default('title'),
    order: Joi.string().valid(SortOrder.ASC, SortOrder.DESC).allow(null).default(SortOrder.ASC)
  }).default({
    by: 'title',
    order: 1
  })
});

export const FindIssuesSchema = FindSchema.keys({
  priority: Joi.string().allow(''),
  pagination: FindIssuesPaginationSchema.required()
});

export const IssueSchema = Joi.object({
  _id: Joi.string().required(),
  title: Joi.string().required(),
  priority: Joi.string().valid('high', 'mid', 'low').required(),
  label: Joi.array().items(Joi.string().valid('electrical', 'mechanical', 'landscape', 'plumbing')).required()
});

export const UpdateIssueSchema = Joi.object({
  _id: Joi.string().required(),
  title: Joi.string().allow(null).default(null),
  priority: Joi.string().valid('high', 'mid', 'low').allow(null).default(null),
  label: Joi.array().items(Joi.string().valid('electrical', 'mechanical', 'landscape', 'plumbing')).allow(null).default(null)
});

export const IssueIdSchema = Joi.object({
  issueId: Joi.string().required()
});

export const CreateIssuePayloadSchema = IssueSchema.keys({
  _id: Joi.forbidden()
});
