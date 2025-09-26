const Joi = require('joi');

// Content validation schemas
const contentSchemas = {
  // Content creation schema
  create: Joi.object({
    title: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': 'Title must be at least 1 character long',
        'string.max': 'Title cannot exceed 200 characters',
        'any.required': 'Title is required'
      }),
    
    content: Joi.string()
      .min(1)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Content must be at least 1 character long',
        'string.max': 'Content cannot exceed 2000 characters',
        'any.required': 'Content is required'
      }),
    
    type: Joi.string()
      .valid('text', 'image', 'video', 'carousel', 'story', 'reel', 'live')
      .required()
      .messages({
        'any.only': 'Type must be one of: text, image, video, carousel, story, reel, live',
        'any.required': 'Content type is required'
      }),
    
    platforms: Joi.array()
      .items(Joi.string().valid('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat'))
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one platform must be selected',
        'any.required': 'Platforms are required'
      }),
    
    media: Joi.array()
      .items(Joi.object({
        type: Joi.string().valid('image', 'video', 'gif', 'audio').required(),
        url: Joi.string().uri().required(),
        altText: Joi.string().max(200).optional(),
        caption: Joi.string().max(500).optional(),
        duration: Joi.number().positive().optional(),
        size: Joi.number().positive().optional(),
        format: Joi.string().valid('jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'mp3', 'wav').optional()
      }))
      .optional()
      .messages({
        'array.base': 'Media must be an array of media objects'
      }),
    
    hashtags: Joi.array()
      .items(Joi.string().pattern(/^#?[a-zA-Z0-9_]+$/).max(50))
      .max(30)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 30 hashtags',
        'string.pattern.base': 'Hashtags must contain only letters, numbers, and underscores',
        'string.max': 'Each hashtag cannot exceed 50 characters'
      }),
    
    mentions: Joi.array()
      .items(Joi.string().pattern(/^@[a-zA-Z0-9_]+$/).max(50))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 10 mentions',
        'string.pattern.base': 'Mentions must start with @ and contain only letters, numbers, and underscores',
        'string.max': 'Each mention cannot exceed 50 characters'
      }),
    
    scheduledDate: Joi.date()
      .min('now')
      .optional()
      .messages({
        'date.min': 'Scheduled date must be in the future'
      }),
    
    status: Joi.string()
      .valid('draft', 'scheduled', 'published', 'failed', 'cancelled')
      .default('draft')
      .messages({
        'any.only': 'Status must be one of: draft, scheduled, published, failed, cancelled'
      }),
    
    visibility: Joi.string()
      .valid('public', 'followers', 'private')
      .default('public')
      .messages({
        'any.only': 'Visibility must be one of: public, followers, private'
      }),
    
    engagement: Joi.object({
      likes: Joi.number().integer().min(0).default(0),
      comments: Joi.number().integer().min(0).default(0),
      shares: Joi.number().integer().min(0).default(0),
      saves: Joi.number().integer().min(0).default(0),
      clicks: Joi.number().integer().min(0).default(0),
      reach: Joi.number().integer().min(0).default(0),
      impressions: Joi.number().integer().min(0).default(0)
    }).default({}),
    
    analytics: Joi.object({
      engagementRate: Joi.number().min(0).max(100).default(0),
      clickThroughRate: Joi.number().min(0).max(100).default(0),
      reachRate: Joi.number().min(0).max(100).default(0),
      sentiment: Joi.string().valid('positive', 'negative', 'neutral').default('neutral'),
      performanceScore: Joi.number().min(0).max(100).default(0)
    }).default({}),
    
    aiGenerated: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'AI generated must be a boolean value'
      }),
    
    aiPrompt: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'AI prompt cannot exceed 500 characters'
      }),
    
    tags: Joi.array()
      .items(Joi.string().min(1).max(50))
      .max(20)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 20 tags',
        'string.min': 'Each tag must be at least 1 character long',
        'string.max': 'Each tag cannot exceed 50 characters'
      }),
    
    campaign: Joi.string()
      .hex()
      .length(24)
      .optional()
      .messages({
        'string.hex': 'Campaign ID must be a valid MongoDB ObjectId',
        'string.length': 'Campaign ID must be 24 characters long'
      }),
    
    organization: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'Organization ID must be a valid MongoDB ObjectId',
        'string.length': 'Organization ID must be 24 characters long',
        'any.required': 'Organization ID is required'
      }),
    
    createdBy: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'Created by must be a valid MongoDB ObjectId',
        'string.length': 'Created by must be 24 characters long',
        'any.required': 'Created by is required'
      })
  }),

  // Content update schema
  update: Joi.object({
    title: Joi.string()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.min': 'Title must be at least 1 character long',
        'string.max': 'Title cannot exceed 200 characters'
      }),
    
    content: Joi.string()
      .min(1)
      .max(2000)
      .optional()
      .messages({
        'string.min': 'Content must be at least 1 character long',
        'string.max': 'Content cannot exceed 2000 characters'
      }),
    
    type: Joi.string()
      .valid('text', 'image', 'video', 'carousel', 'story', 'reel', 'live')
      .optional()
      .messages({
        'any.only': 'Type must be one of: text, image, video, carousel, story, reel, live'
      }),
    
    platforms: Joi.array()
      .items(Joi.string().valid('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat'))
      .min(1)
      .optional()
      .messages({
        'array.min': 'At least one platform must be selected'
      }),
    
    media: Joi.array()
      .items(Joi.object({
        type: Joi.string().valid('image', 'video', 'gif', 'audio').required(),
        url: Joi.string().uri().required(),
        altText: Joi.string().max(200).optional(),
        caption: Joi.string().max(500).optional(),
        duration: Joi.number().positive().optional(),
        size: Joi.number().positive().optional(),
        format: Joi.string().valid('jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'mp3', 'wav').optional()
      }))
      .optional()
      .messages({
        'array.base': 'Media must be an array of media objects'
      }),
    
    hashtags: Joi.array()
      .items(Joi.string().pattern(/^#?[a-zA-Z0-9_]+$/).max(50))
      .max(30)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 30 hashtags',
        'string.pattern.base': 'Hashtags must contain only letters, numbers, and underscores',
        'string.max': 'Each hashtag cannot exceed 50 characters'
      }),
    
    mentions: Joi.array()
      .items(Joi.string().pattern(/^@[a-zA-Z0-9_]+$/).max(50))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 10 mentions',
        'string.pattern.base': 'Mentions must start with @ and contain only letters, numbers, and underscores',
        'string.max': 'Each mention cannot exceed 50 characters'
      }),
    
    scheduledDate: Joi.date()
      .min('now')
      .optional()
      .messages({
        'date.min': 'Scheduled date must be in the future'
      }),
    
    status: Joi.string()
      .valid('draft', 'scheduled', 'published', 'failed', 'cancelled')
      .optional()
      .messages({
        'any.only': 'Status must be one of: draft, scheduled, published, failed, cancelled'
      }),
    
    visibility: Joi.string()
      .valid('public', 'followers', 'private')
      .optional()
      .messages({
        'any.only': 'Visibility must be one of: public, followers, private'
      }),
    
    tags: Joi.array()
      .items(Joi.string().min(1).max(50))
      .max(20)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 20 tags',
        'string.min': 'Each tag must be at least 1 character long',
        'string.max': 'Each tag cannot exceed 50 characters'
      }),
    
    campaign: Joi.string()
      .hex()
      .length(24)
      .optional()
      .allow(null)
      .messages({
        'string.hex': 'Campaign ID must be a valid MongoDB ObjectId',
        'string.length': 'Campaign ID must be 24 characters long'
      })
  }),

  // Content ID validation schema
  contentId: Joi.object({
    id: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'Content ID must be a valid MongoDB ObjectId',
        'string.length': 'Content ID must be 24 characters long',
        'any.required': 'Content ID is required'
      })
  }),

  // Content query parameters schema
  query: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      }),
    
    search: Joi.string()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Search term must be at least 1 character long',
        'string.max': 'Search term cannot exceed 100 characters'
      }),
    
    type: Joi.string()
      .valid('text', 'image', 'video', 'carousel', 'story', 'reel', 'live')
      .optional()
      .messages({
        'any.only': 'Type must be one of: text, image, video, carousel, story, reel, live'
      }),
    
    platform: Joi.string()
      .valid('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat')
      .optional()
      .messages({
        'any.only': 'Platform must be one of: facebook, instagram, twitter, linkedin, tiktok, youtube, pinterest, snapchat'
      }),
    
    status: Joi.string()
      .valid('draft', 'scheduled', 'published', 'failed', 'cancelled')
      .optional()
      .messages({
        'any.only': 'Status must be one of: draft, scheduled, published, failed, cancelled'
      }),
    
    visibility: Joi.string()
      .valid('public', 'followers', 'private')
      .optional()
      .messages({
        'any.only': 'Visibility must be one of: public, followers, private'
      }),
    
    aiGenerated: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'AI generated must be a boolean value'
      }),
    
    campaign: Joi.string()
      .hex()
      .length(24)
      .optional()
      .messages({
        'string.hex': 'Campaign ID must be a valid MongoDB ObjectId',
        'string.length': 'Campaign ID must be 24 characters long'
      }),
    
    organization: Joi.string()
      .hex()
      .length(24)
      .optional()
      .messages({
        'string.hex': 'Organization ID must be a valid MongoDB ObjectId',
        'string.length': 'Organization ID must be 24 characters long'
      }),
    
    createdBy: Joi.string()
      .hex()
      .length(24)
      .optional()
      .messages({
        'string.hex': 'Created by must be a valid MongoDB ObjectId',
        'string.length': 'Created by must be 24 characters long'
      }),
    
    dateFrom: Joi.date()
      .optional()
      .messages({
        'date.base': 'Date from must be a valid date'
      }),
    
    dateTo: Joi.date()
      .min(Joi.ref('dateFrom'))
      .optional()
      .messages({
        'date.base': 'Date to must be a valid date',
        'date.min': 'Date to must be after date from'
      }),
    
    sortBy: Joi.string()
      .valid('title', 'createdAt', 'scheduledDate', 'status', 'engagement', 'performanceScore')
      .default('createdAt')
      .messages({
        'any.only': 'Sort by must be one of: title, createdAt, scheduledDate, status, engagement, performanceScore'
      }),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'Sort order must be either asc or desc'
      })
  }),

  // Content scheduling schema
  schedule: Joi.object({
    contentId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'Content ID must be a valid MongoDB ObjectId',
        'string.length': 'Content ID must be 24 characters long',
        'any.required': 'Content ID is required'
      }),
    
    scheduledDate: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Scheduled date must be in the future',
        'any.required': 'Scheduled date is required'
      }),
    
    platforms: Joi.array()
      .items(Joi.string().valid('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat'))
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one platform must be selected',
        'any.required': 'Platforms are required'
      }),
    
    timezone: Joi.string()
      .default('UTC')
      .messages({
        'any.default': 'Timezone will default to UTC'
      })
  }),

  // Content analytics schema
  analytics: Joi.object({
    contentId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'Content ID must be a valid MongoDB ObjectId',
        'string.length': 'Content ID must be 24 characters long',
        'any.required': 'Content ID is required'
      }),
    
    platform: Joi.string()
      .valid('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat')
      .optional()
      .messages({
        'any.only': 'Platform must be one of: facebook, instagram, twitter, linkedin, tiktok, youtube, pinterest, snapchat'
      }),
    
    dateFrom: Joi.date()
      .optional()
      .messages({
        'date.base': 'Date from must be a valid date'
      }),
    
    dateTo: Joi.date()
      .min(Joi.ref('dateFrom'))
      .optional()
      .messages({
        'date.base': 'Date to must be a valid date',
        'date.min': 'Date to must be after date from'
      }),
    
    metrics: Joi.array()
      .items(Joi.string().valid('likes', 'comments', 'shares', 'saves', 'clicks', 'reach', 'impressions', 'engagementRate', 'clickThroughRate', 'reachRate'))
      .optional()
      .messages({
        'array.base': 'Metrics must be an array of metric names'
      })
  })
};

module.exports = contentSchemas;

