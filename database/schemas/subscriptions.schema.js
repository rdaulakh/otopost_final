const Joi = require('joi');

// Subscription validation schemas
const subscriptionSchemas = {
  // Subscription creation schema
  create: Joi.object({
    organization: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'Organization ID must be a valid MongoDB ObjectId',
        'string.length': 'Organization ID must be 24 characters long',
        'any.required': 'Organization ID is required'
      }),
    
    plan: Joi.string()
      .valid('free', 'basic', 'professional', 'enterprise')
      .required()
      .messages({
        'any.only': 'Plan must be one of: free, basic, professional, enterprise',
        'any.required': 'Plan is required'
      }),
    
    status: Joi.string()
      .valid('active', 'inactive', 'cancelled', 'expired', 'suspended', 'trial')
      .default('active')
      .messages({
        'any.only': 'Status must be one of: active, inactive, cancelled, expired, suspended, trial'
      }),
    
    billingCycle: Joi.string()
      .valid('monthly', 'quarterly', 'yearly')
      .default('monthly')
      .messages({
        'any.only': 'Billing cycle must be one of: monthly, quarterly, yearly'
      }),
    
    startDate: Joi.date()
      .default(Date.now)
      .messages({
        'date.base': 'Start date must be a valid date'
      }),
    
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.base': 'End date must be a valid date',
        'date.min': 'End date must be after start date'
      }),
    
    trialEndDate: Joi.date()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.base': 'Trial end date must be a valid date',
        'date.min': 'Trial end date must be after start date'
      }),
    
    pricing: Joi.object({
      basePrice: Joi.number().min(0).required(),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR').default('USD'),
      discount: Joi.number().min(0).max(100).default(0),
      taxRate: Joi.number().min(0).max(100).default(0),
      setupFee: Joi.number().min(0).default(0)
    }).required(),
    
    features: Joi.object({
      maxUsers: Joi.number().integer().min(1).required(),
      maxPostsPerMonth: Joi.number().integer().min(0).required(),
      maxScheduledPosts: Joi.number().integer().min(0).required(),
      maxAnalyticsReports: Joi.number().integer().min(0).required(),
      maxCampaigns: Joi.number().integer().min(0).required(),
      maxContentTemplates: Joi.number().integer().min(0).required(),
      maxStorageGB: Joi.number().min(0).required(),
      aiContentGeneration: Joi.boolean().default(false),
      advancedAnalytics: Joi.boolean().default(false),
      teamCollaboration: Joi.boolean().default(false),
      customBranding: Joi.boolean().default(false),
      prioritySupport: Joi.boolean().default(false),
      apiAccess: Joi.boolean().default(false),
      whiteLabel: Joi.boolean().default(false),
      customIntegrations: Joi.boolean().default(false),
      advancedScheduling: Joi.boolean().default(false),
      competitorAnalysis: Joi.boolean().default(false),
      crisisManagement: Joi.boolean().default(false),
      socialListening: Joi.boolean().default(false),
      influencerOutreach: Joi.boolean().default(false),
      contentModeration: Joi.boolean().default(false),
      multiLanguageSupport: Joi.boolean().default(false),
      customReports: Joi.boolean().default(false),
      dataExport: Joi.boolean().default(false),
      sso: Joi.boolean().default(false),
      auditLogs: Joi.boolean().default(false)
    }).required(),
    
    limits: Joi.object({
      dailyApiCalls: Joi.number().integer().min(0).default(1000),
      monthlyApiCalls: Joi.number().integer().min(0).default(30000),
      maxFileSize: Joi.number().integer().min(0).default(10), // MB
      maxVideoLength: Joi.number().integer().min(0).default(60), // seconds
      maxImageResolution: Joi.string().valid('720p', '1080p', '4K', 'unlimited').default('1080p'),
      retentionPeriod: Joi.number().integer().min(30).default(365), // days
      backupFrequency: Joi.string().valid('daily', 'weekly', 'monthly', 'none').default('weekly')
    }).default({}),
    
    payment: Joi.object({
      method: Joi.string().valid('credit_card', 'paypal', 'bank_transfer', 'crypto', 'invoice').required(),
      provider: Joi.string().valid('stripe', 'paypal', 'square', 'razorpay', 'manual').required(),
      transactionId: Joi.string().optional(),
      lastPaymentDate: Joi.date().optional(),
      nextPaymentDate: Joi.date().optional(),
      paymentStatus: Joi.string().valid('pending', 'completed', 'failed', 'refunded', 'cancelled').default('pending'),
      billingAddress: Joi.object({
        street: Joi.string().min(5).max(100).optional(),
        city: Joi.string().min(2).max(50).optional(),
        state: Joi.string().min(2).max(50).optional(),
        country: Joi.string().min(2).max(50).optional(),
        zipCode: Joi.string().min(3).max(20).optional()
      }).optional()
    }).required(),
    
    autoRenew: Joi.boolean()
      .default(true)
      .messages({
        'boolean.base': 'Auto renew must be a boolean value'
      }),
    
    cancellationPolicy: Joi.object({
      canCancel: Joi.boolean().default(true),
      noticePeriod: Joi.number().integer().min(0).default(30), // days
      refundPolicy: Joi.string().valid('none', 'prorated', 'full').default('prorated'),
      cancellationReason: Joi.string().max(500).optional()
    }).default({}),
    
    metadata: Joi.object({
      salesRep: Joi.string().optional(),
      referralSource: Joi.string().optional(),
      notes: Joi.string().max(1000).optional(),
      tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
      customFields: Joi.object().optional()
    }).default({})
  }),

  // Subscription update schema
  update: Joi.object({
    plan: Joi.string()
      .valid('free', 'basic', 'professional', 'enterprise')
      .optional()
      .messages({
        'any.only': 'Plan must be one of: free, basic, professional, enterprise'
      }),
    
    status: Joi.string()
      .valid('active', 'inactive', 'cancelled', 'expired', 'suspended', 'trial')
      .optional()
      .messages({
        'any.only': 'Status must be one of: active, inactive, cancelled, expired, suspended, trial'
      }),
    
    billingCycle: Joi.string()
      .valid('monthly', 'quarterly', 'yearly')
      .optional()
      .messages({
        'any.only': 'Billing cycle must be one of: monthly, quarterly, yearly'
      }),
    
    endDate: Joi.date()
      .optional()
      .messages({
        'date.base': 'End date must be a valid date'
      }),
    
    trialEndDate: Joi.date()
      .optional()
      .messages({
        'date.base': 'Trial end date must be a valid date'
      }),
    
    pricing: Joi.object({
      basePrice: Joi.number().min(0).optional(),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR').optional(),
      discount: Joi.number().min(0).max(100).optional(),
      taxRate: Joi.number().min(0).max(100).optional(),
      setupFee: Joi.number().min(0).optional()
    }).optional(),
    
    features: Joi.object({
      maxUsers: Joi.number().integer().min(1).optional(),
      maxPostsPerMonth: Joi.number().integer().min(0).optional(),
      maxScheduledPosts: Joi.number().integer().min(0).optional(),
      maxAnalyticsReports: Joi.number().integer().min(0).optional(),
      maxCampaigns: Joi.number().integer().min(0).optional(),
      maxContentTemplates: Joi.number().integer().min(0).optional(),
      maxStorageGB: Joi.number().min(0).optional(),
      aiContentGeneration: Joi.boolean().optional(),
      advancedAnalytics: Joi.boolean().optional(),
      teamCollaboration: Joi.boolean().optional(),
      customBranding: Joi.boolean().optional(),
      prioritySupport: Joi.boolean().optional(),
      apiAccess: Joi.boolean().optional(),
      whiteLabel: Joi.boolean().optional(),
      customIntegrations: Joi.boolean().optional(),
      advancedScheduling: Joi.boolean().optional(),
      competitorAnalysis: Joi.boolean().optional(),
      crisisManagement: Joi.boolean().optional(),
      socialListening: Joi.boolean().optional(),
      influencerOutreach: Joi.boolean().optional(),
      contentModeration: Joi.boolean().optional(),
      multiLanguageSupport: Joi.boolean().optional(),
      customReports: Joi.boolean().optional(),
      dataExport: Joi.boolean().optional(),
      sso: Joi.boolean().optional(),
      auditLogs: Joi.boolean().optional()
    }).optional(),
    
    limits: Joi.object({
      dailyApiCalls: Joi.number().integer().min(0).optional(),
      monthlyApiCalls: Joi.number().integer().min(0).optional(),
      maxFileSize: Joi.number().integer().min(0).optional(),
      maxVideoLength: Joi.number().integer().min(0).optional(),
      maxImageResolution: Joi.string().valid('720p', '1080p', '4K', 'unlimited').optional(),
      retentionPeriod: Joi.number().integer().min(30).optional(),
      backupFrequency: Joi.string().valid('daily', 'weekly', 'monthly', 'none').optional()
    }).optional(),
    
    payment: Joi.object({
      method: Joi.string().valid('credit_card', 'paypal', 'bank_transfer', 'crypto', 'invoice').optional(),
      provider: Joi.string().valid('stripe', 'paypal', 'square', 'razorpay', 'manual').optional(),
      transactionId: Joi.string().optional(),
      lastPaymentDate: Joi.date().optional(),
      nextPaymentDate: Joi.date().optional(),
      paymentStatus: Joi.string().valid('pending', 'completed', 'failed', 'refunded', 'cancelled').optional(),
      billingAddress: Joi.object({
        street: Joi.string().min(5).max(100).optional().allow(''),
        city: Joi.string().min(2).max(50).optional().allow(''),
        state: Joi.string().min(2).max(50).optional().allow(''),
        country: Joi.string().min(2).max(50).optional().allow(''),
        zipCode: Joi.string().min(3).max(20).optional().allow('')
      }).optional()
    }).optional(),
    
    autoRenew: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Auto renew must be a boolean value'
      }),
    
    cancellationPolicy: Joi.object({
      canCancel: Joi.boolean().optional(),
      noticePeriod: Joi.number().integer().min(0).optional(),
      refundPolicy: Joi.string().valid('none', 'prorated', 'full').optional(),
      cancellationReason: Joi.string().max(500).optional().allow('')
    }).optional(),
    
    metadata: Joi.object({
      salesRep: Joi.string().optional().allow(''),
      referralSource: Joi.string().optional().allow(''),
      notes: Joi.string().max(1000).optional().allow(''),
      tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
      customFields: Joi.object().optional()
    }).optional()
  }),

  // Subscription ID validation schema
  subscriptionId: Joi.object({
    id: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'Subscription ID must be a valid MongoDB ObjectId',
        'string.length': 'Subscription ID must be 24 characters long',
        'any.required': 'Subscription ID is required'
      })
  }),

  // Subscription query parameters schema
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
    
    organization: Joi.string()
      .hex()
      .length(24)
      .optional()
      .messages({
        'string.hex': 'Organization ID must be a valid MongoDB ObjectId',
        'string.length': 'Organization ID must be 24 characters long'
      }),
    
    plan: Joi.string()
      .valid('free', 'basic', 'professional', 'enterprise')
      .optional()
      .messages({
        'any.only': 'Plan must be one of: free, basic, professional, enterprise'
      }),
    
    status: Joi.string()
      .valid('active', 'inactive', 'cancelled', 'expired', 'suspended', 'trial')
      .optional()
      .messages({
        'any.only': 'Status must be one of: active, inactive, cancelled, expired, suspended, trial'
      }),
    
    billingCycle: Joi.string()
      .valid('monthly', 'quarterly', 'yearly')
      .optional()
      .messages({
        'any.only': 'Billing cycle must be one of: monthly, quarterly, yearly'
      }),
    
    paymentStatus: Joi.string()
      .valid('pending', 'completed', 'failed', 'refunded', 'cancelled')
      .optional()
      .messages({
        'any.only': 'Payment status must be one of: pending, completed, failed, refunded, cancelled'
      }),
    
    autoRenew: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Auto renew must be a boolean value'
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
      .valid('createdAt', 'startDate', 'endDate', 'plan', 'status', 'pricing.basePrice')
      .default('createdAt')
      .messages({
        'any.only': 'Sort by must be one of: createdAt, startDate, endDate, plan, status, pricing.basePrice'
      }),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'Sort order must be either asc or desc'
      })
  }),

  // Subscription upgrade/downgrade schema
  changePlan: Joi.object({
    newPlan: Joi.string()
      .valid('free', 'basic', 'professional', 'enterprise')
      .required()
      .messages({
        'any.only': 'New plan must be one of: free, basic, professional, enterprise',
        'any.required': 'New plan is required'
      }),
    
    effectiveDate: Joi.date()
      .min('now')
      .optional()
      .messages({
        'date.min': 'Effective date must be in the future'
      }),
    
    prorate: Joi.boolean()
      .default(true)
      .messages({
        'boolean.base': 'Prorate must be a boolean value'
      }),
    
    reason: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Reason cannot exceed 500 characters'
      })
  }),

  // Subscription cancellation schema
  cancel: Joi.object({
    reason: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Reason cannot exceed 500 characters'
      }),
    
    effectiveDate: Joi.date()
      .min('now')
      .optional()
      .messages({
        'date.min': 'Effective date must be in the future'
      }),
    
    refundRequested: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'Refund requested must be a boolean value'
      }),
    
    feedback: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Feedback cannot exceed 1000 characters'
      })
  }),

  // Subscription renewal schema
  renew: Joi.object({
    billingCycle: Joi.string()
      .valid('monthly', 'quarterly', 'yearly')
      .optional()
      .messages({
        'any.only': 'Billing cycle must be one of: monthly, quarterly, yearly'
      }),
    
    autoRenew: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Auto renew must be a boolean value'
      }),
    
    paymentMethod: Joi.string()
      .valid('credit_card', 'paypal', 'bank_transfer', 'crypto', 'invoice')
      .optional()
      .messages({
        'any.only': 'Payment method must be one of: credit_card, paypal, bank_transfer, crypto, invoice'
      })
  })
};

module.exports = subscriptionSchemas;

