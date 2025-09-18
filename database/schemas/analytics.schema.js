const Joi = require('joi');

// Analytics validation schemas
const analyticsSchemas = {
  // Analytics data creation schema
  create: Joi.object({
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
      .required()
      .messages({
        'any.only': 'Platform must be one of: facebook, instagram, twitter, linkedin, tiktok, youtube, pinterest, snapchat',
        'any.required': 'Platform is required'
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
    
    metrics: Joi.object({
      // Engagement metrics
      likes: Joi.number().integer().min(0).default(0),
      comments: Joi.number().integer().min(0).default(0),
      shares: Joi.number().integer().min(0).default(0),
      saves: Joi.number().integer().min(0).default(0),
      reactions: Joi.number().integer().min(0).default(0),
      
      // Reach and impression metrics
      reach: Joi.number().integer().min(0).default(0),
      impressions: Joi.number().integer().min(0).default(0),
      uniqueReach: Joi.number().integer().min(0).default(0),
      
      // Click metrics
      clicks: Joi.number().integer().min(0).default(0),
      linkClicks: Joi.number().integer().min(0).default(0),
      profileClicks: Joi.number().integer().min(0).default(0),
      
      // Video metrics (for video content)
      videoViews: Joi.number().integer().min(0).default(0),
      videoCompletions: Joi.number().integer().min(0).default(0),
      videoCompletionRate: Joi.number().min(0).max(100).default(0),
      averageWatchTime: Joi.number().min(0).default(0),
      
      // Story metrics (for story content)
      storyViews: Joi.number().integer().min(0).default(0),
      storyExits: Joi.number().integer().min(0).default(0),
      storyReplies: Joi.number().integer().min(0).default(0),
      
      // Audience metrics
      audienceSize: Joi.number().integer().min(0).default(0),
      audienceGrowth: Joi.number().min(-100).max(100).default(0),
      audienceEngagement: Joi.number().min(0).max(100).default(0),
      
      // Performance metrics
      engagementRate: Joi.number().min(0).max(100).default(0),
      clickThroughRate: Joi.number().min(0).max(100).default(0),
      reachRate: Joi.number().min(0).max(100).default(0),
      impressionRate: Joi.number().min(0).max(100).default(0),
      
      // Sentiment metrics
      sentiment: Joi.string().valid('positive', 'negative', 'neutral').default('neutral'),
      sentimentScore: Joi.number().min(-1).max(1).default(0),
      
      // Demographic metrics
      demographics: Joi.object({
        ageGroups: Joi.object({
          '13-17': Joi.number().min(0).max(100).default(0),
          '18-24': Joi.number().min(0).max(100).default(0),
          '25-34': Joi.number().min(0).max(100).default(0),
          '35-44': Joi.number().min(0).max(100).default(0),
          '45-54': Joi.number().min(0).max(100).default(0),
          '55-64': Joi.number().min(0).max(100).default(0),
          '65+': Joi.number().min(0).max(100).default(0)
        }).default({}),
        genders: Joi.object({
          male: Joi.number().min(0).max(100).default(0),
          female: Joi.number().min(0).max(100).default(0),
          other: Joi.number().min(0).max(100).default(0)
        }).default({}),
        locations: Joi.object().pattern(
          Joi.string(),
          Joi.number().min(0).max(100)
        ).default({})
      }).default({}),
      
      // Time-based metrics
      peakHours: Joi.array().items(Joi.string().pattern(/^\d{2}:\d{2}$/)).default([]),
      peakDays: Joi.array().items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')).default([]),
      
      // Hashtag performance
      hashtagPerformance: Joi.array().items(Joi.object({
        hashtag: Joi.string().required(),
        reach: Joi.number().integer().min(0).default(0),
        engagement: Joi.number().integer().min(0).default(0),
        impressions: Joi.number().integer().min(0).default(0)
      })).default([]),
      
      // Competitor comparison
      competitorComparison: Joi.object({
        industryAverage: Joi.number().min(0).max(100).default(0),
        topPerformers: Joi.number().min(0).max(100).default(0),
        marketShare: Joi.number().min(0).max(100).default(0)
      }).default({})
    }).required(),
    
    date: Joi.date()
      .required()
      .messages({
        'date.base': 'Date must be a valid date',
        'any.required': 'Date is required'
      }),
    
    timezone: Joi.string()
      .default('UTC')
      .messages({
        'any.default': 'Timezone will default to UTC'
      }),
    
    source: Joi.string()
      .valid('api', 'manual', 'import', 'webhook')
      .default('api')
      .messages({
        'any.only': 'Source must be one of: api, manual, import, webhook'
      }),
    
    isRealTime: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'Is real time must be a boolean value'
      })
  }),

  // Analytics update schema
  update: Joi.object({
    metrics: Joi.object({
      // Engagement metrics
      likes: Joi.number().integer().min(0).optional(),
      comments: Joi.number().integer().min(0).optional(),
      shares: Joi.number().integer().min(0).optional(),
      saves: Joi.number().integer().min(0).optional(),
      reactions: Joi.number().integer().min(0).optional(),
      
      // Reach and impression metrics
      reach: Joi.number().integer().min(0).optional(),
      impressions: Joi.number().integer().min(0).optional(),
      uniqueReach: Joi.number().integer().min(0).optional(),
      
      // Click metrics
      clicks: Joi.number().integer().min(0).optional(),
      linkClicks: Joi.number().integer().min(0).optional(),
      profileClicks: Joi.number().integer().min(0).optional(),
      
      // Video metrics
      videoViews: Joi.number().integer().min(0).optional(),
      videoCompletions: Joi.number().integer().min(0).optional(),
      videoCompletionRate: Joi.number().min(0).max(100).optional(),
      averageWatchTime: Joi.number().min(0).optional(),
      
      // Story metrics
      storyViews: Joi.number().integer().min(0).optional(),
      storyExits: Joi.number().integer().min(0).optional(),
      storyReplies: Joi.number().integer().min(0).optional(),
      
      // Audience metrics
      audienceSize: Joi.number().integer().min(0).optional(),
      audienceGrowth: Joi.number().min(-100).max(100).optional(),
      audienceEngagement: Joi.number().min(0).max(100).optional(),
      
      // Performance metrics
      engagementRate: Joi.number().min(0).max(100).optional(),
      clickThroughRate: Joi.number().min(0).max(100).optional(),
      reachRate: Joi.number().min(0).max(100).optional(),
      impressionRate: Joi.number().min(0).max(100).optional(),
      
      // Sentiment metrics
      sentiment: Joi.string().valid('positive', 'negative', 'neutral').optional(),
      sentimentScore: Joi.number().min(-1).max(1).optional(),
      
      // Demographic metrics
      demographics: Joi.object({
        ageGroups: Joi.object().pattern(
          Joi.string(),
          Joi.number().min(0).max(100)
        ).optional(),
        genders: Joi.object().pattern(
          Joi.string(),
          Joi.number().min(0).max(100)
        ).optional(),
        locations: Joi.object().pattern(
          Joi.string(),
          Joi.number().min(0).max(100)
        ).optional()
      }).optional(),
      
      // Time-based metrics
      peakHours: Joi.array().items(Joi.string().pattern(/^\d{2}:\d{2}$/)).optional(),
      peakDays: Joi.array().items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')).optional(),
      
      // Hashtag performance
      hashtagPerformance: Joi.array().items(Joi.object({
        hashtag: Joi.string().required(),
        reach: Joi.number().integer().min(0).default(0),
        engagement: Joi.number().integer().min(0).default(0),
        impressions: Joi.number().integer().min(0).default(0)
      })).optional(),
      
      // Competitor comparison
      competitorComparison: Joi.object({
        industryAverage: Joi.number().min(0).max(100).optional(),
        topPerformers: Joi.number().min(0).max(100).optional(),
        marketShare: Joi.number().min(0).max(100).optional()
      }).optional()
    }).optional(),
    
    date: Joi.date()
      .optional()
      .messages({
        'date.base': 'Date must be a valid date'
      }),
    
    timezone: Joi.string()
      .optional()
      .messages({
        'any.optional': 'Timezone is optional'
      }),
    
    source: Joi.string()
      .valid('api', 'manual', 'import', 'webhook')
      .optional()
      .messages({
        'any.only': 'Source must be one of: api, manual, import, webhook'
      }),
    
    isRealTime: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Is real time must be a boolean value'
      })
  }),

  // Analytics ID validation schema
  analyticsId: Joi.object({
    id: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'Analytics ID must be a valid MongoDB ObjectId',
        'string.length': 'Analytics ID must be 24 characters long',
        'any.required': 'Analytics ID is required'
      })
  }),

  // Analytics query parameters schema
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
    
    contentId: Joi.string()
      .hex()
      .length(24)
      .optional()
      .messages({
        'string.hex': 'Content ID must be a valid MongoDB ObjectId',
        'string.length': 'Content ID must be 24 characters long'
      }),
    
    platform: Joi.string()
      .valid('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat')
      .optional()
      .messages({
        'any.only': 'Platform must be one of: facebook, instagram, twitter, linkedin, tiktok, youtube, pinterest, snapchat'
      }),
    
    organization: Joi.string()
      .hex()
      .length(24)
      .optional()
      .messages({
        'string.hex': 'Organization ID must be a valid MongoDB ObjectId',
        'string.length': 'Organization ID must be 24 characters long'
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
    
    timezone: Joi.string()
      .optional()
      .messages({
        'any.optional': 'Timezone is optional'
      }),
    
    source: Joi.string()
      .valid('api', 'manual', 'import', 'webhook')
      .optional()
      .messages({
        'any.only': 'Source must be one of: api, manual, import, webhook'
      }),
    
    isRealTime: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Is real time must be a boolean value'
      }),
    
    sortBy: Joi.string()
      .valid('date', 'engagementRate', 'reach', 'impressions', 'clicks', 'createdAt')
      .default('date')
      .messages({
        'any.only': 'Sort by must be one of: date, engagementRate, reach, impressions, clicks, createdAt'
      }),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'Sort order must be either asc or desc'
      })
  }),

  // Analytics aggregation schema
  aggregation: Joi.object({
    contentId: Joi.string()
      .hex()
      .length(24)
      .optional()
      .messages({
        'string.hex': 'Content ID must be a valid MongoDB ObjectId',
        'string.length': 'Content ID must be 24 characters long'
      }),
    
    platform: Joi.string()
      .valid('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat')
      .optional()
      .messages({
        'any.only': 'Platform must be one of: facebook, instagram, twitter, linkedin, tiktok, youtube, pinterest, snapchat'
      }),
    
    organization: Joi.string()
      .hex()
      .length(24)
      .optional()
      .messages({
        'string.hex': 'Organization ID must be a valid MongoDB ObjectId',
        'string.length': 'Organization ID must be 24 characters long'
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
    
    groupBy: Joi.string()
      .valid('day', 'week', 'month', 'quarter', 'year', 'platform', 'contentType')
      .default('day')
      .messages({
        'any.only': 'Group by must be one of: day, week, month, quarter, year, platform, contentType'
      }),
    
    metrics: Joi.array()
      .items(Joi.string().valid(
        'likes', 'comments', 'shares', 'saves', 'reactions',
        'reach', 'impressions', 'uniqueReach',
        'clicks', 'linkClicks', 'profileClicks',
        'videoViews', 'videoCompletions', 'videoCompletionRate',
        'storyViews', 'storyExits', 'storyReplies',
        'engagementRate', 'clickThroughRate', 'reachRate', 'impressionRate'
      ))
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one metric must be selected',
        'any.required': 'Metrics are required'
      }),
    
    aggregationType: Joi.string()
      .valid('sum', 'average', 'min', 'max', 'count', 'median')
      .default('sum')
      .messages({
        'any.only': 'Aggregation type must be one of: sum, average, min, max, count, median'
      }),
    
    timezone: Joi.string()
      .default('UTC')
      .messages({
        'any.default': 'Timezone will default to UTC'
      })
  }),

  // Analytics report schema
  report: Joi.object({
    organization: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'Organization ID must be a valid MongoDB ObjectId',
        'string.length': 'Organization ID must be 24 characters long',
        'any.required': 'Organization ID is required'
      }),
    
    reportType: Joi.string()
      .valid('overview', 'content', 'platform', 'campaign', 'audience', 'competitor', 'custom')
      .required()
      .messages({
        'any.only': 'Report type must be one of: overview, content, platform, campaign, audience, competitor, custom',
        'any.required': 'Report type is required'
      }),
    
    dateFrom: Joi.date()
      .required()
      .messages({
        'date.base': 'Date from must be a valid date',
        'any.required': 'Date from is required'
      }),
    
    dateTo: Joi.date()
      .min(Joi.ref('dateFrom'))
      .required()
      .messages({
        'date.base': 'Date to must be a valid date',
        'date.min': 'Date to must be after date from',
        'any.required': 'Date to is required'
      }),
    
    platforms: Joi.array()
      .items(Joi.string().valid('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat'))
      .optional()
      .messages({
        'array.base': 'Platforms must be an array of platform names'
      }),
    
    contentTypes: Joi.array()
      .items(Joi.string().valid('text', 'image', 'video', 'carousel', 'story', 'reel', 'live'))
      .optional()
      .messages({
        'array.base': 'Content types must be an array of content type names'
      }),
    
    metrics: Joi.array()
      .items(Joi.string().valid(
        'likes', 'comments', 'shares', 'saves', 'reactions',
        'reach', 'impressions', 'uniqueReach',
        'clicks', 'linkClicks', 'profileClicks',
        'videoViews', 'videoCompletions', 'videoCompletionRate',
        'storyViews', 'storyExits', 'storyReplies',
        'engagementRate', 'clickThroughRate', 'reachRate', 'impressionRate',
        'audienceGrowth', 'audienceEngagement', 'sentimentScore'
      ))
      .optional()
      .messages({
        'array.base': 'Metrics must be an array of metric names'
      }),
    
    groupBy: Joi.string()
      .valid('day', 'week', 'month', 'quarter', 'year', 'platform', 'contentType', 'campaign')
      .default('day')
      .messages({
        'any.only': 'Group by must be one of: day, week, month, quarter, year, platform, contentType, campaign'
      }),
    
    format: Joi.string()
      .valid('json', 'csv', 'pdf', 'excel')
      .default('json')
      .messages({
        'any.only': 'Format must be one of: json, csv, pdf, excel'
      }),
    
    timezone: Joi.string()
      .default('UTC')
      .messages({
        'any.default': 'Timezone will default to UTC'
      }),
    
    includeInsights: Joi.boolean()
      .default(true)
      .messages({
        'boolean.base': 'Include insights must be a boolean value'
      }),
    
    includeRecommendations: Joi.boolean()
      .default(true)
      .messages({
        'boolean.base': 'Include recommendations must be a boolean value'
      })
  })
};

module.exports = analyticsSchemas;

