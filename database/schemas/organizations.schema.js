const Joi = require('joi');

// Organization validation schemas
const organizationSchemas = {
  // Organization creation schema
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Organization name must be at least 2 characters long',
        'string.max': 'Organization name cannot exceed 100 characters',
        'any.required': 'Organization name is required'
      }),
    
    description: Joi.string()
      .min(10)
      .max(500)
      .optional()
      .messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': 'Description cannot exceed 500 characters'
      }),
    
    industry: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Industry must be at least 2 characters long',
        'string.max': 'Industry cannot exceed 50 characters',
        'any.required': 'Industry is required'
      }),
    
    website: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Please provide a valid website URL'
      }),
    
    contactEmail: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid contact email address',
        'any.required': 'Contact email is required'
      }),
    
    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    
    address: Joi.object({
      street: Joi.string().min(5).max(100).optional(),
      city: Joi.string().min(2).max(50).optional(),
      state: Joi.string().min(2).max(50).optional(),
      country: Joi.string().min(2).max(50).optional(),
      zipCode: Joi.string().min(3).max(20).optional()
    }).optional(),
    
    socialMedia: Joi.object({
      facebook: Joi.string().uri().optional(),
      twitter: Joi.string().uri().optional(),
      linkedin: Joi.string().uri().optional(),
      instagram: Joi.string().uri().optional(),
      youtube: Joi.string().uri().optional(),
      tiktok: Joi.string().uri().optional()
    }).optional(),
    
    settings: Joi.object({
      timezone: Joi.string().default('UTC'),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR').default('USD'),
      language: Joi.string().valid('en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko').default('en'),
      dateFormat: Joi.string().valid('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD').default('MM/DD/YYYY'),
      timeFormat: Joi.string().valid('12h', '24h').default('12h'),
      notifications: Joi.object({
        email: Joi.boolean().default(true),
        push: Joi.boolean().default(true),
        sms: Joi.boolean().default(false)
      }).default({}),
      features: Joi.object({
        aiContentGeneration: Joi.boolean().default(true),
        analytics: Joi.boolean().default(true),
        scheduling: Joi.boolean().default(true),
        teamCollaboration: Joi.boolean().default(true),
        customBranding: Joi.boolean().default(false)
      }).default({})
    }).default({}),
    
    subscription: Joi.object({
      plan: Joi.string().valid('free', 'basic', 'professional', 'enterprise').default('free'),
      status: Joi.string().valid('active', 'inactive', 'cancelled', 'expired').default('active'),
      startDate: Joi.date().default(Date.now),
      endDate: Joi.date().optional(),
      maxUsers: Joi.number().integer().min(1).default(1),
      maxPostsPerMonth: Joi.number().integer().min(0).default(10)
    }).default({})
  }),

  // Organization update schema
  update: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Organization name must be at least 2 characters long',
        'string.max': 'Organization name cannot exceed 100 characters'
      }),
    
    description: Joi.string()
      .min(10)
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': 'Description cannot exceed 500 characters'
      }),
    
    industry: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Industry must be at least 2 characters long',
        'string.max': 'Industry cannot exceed 50 characters'
      }),
    
    website: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Please provide a valid website URL'
      }),
    
    contactEmail: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'Please provide a valid contact email address'
      }),
    
    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    
    address: Joi.object({
      street: Joi.string().min(5).max(100).optional().allow(''),
      city: Joi.string().min(2).max(50).optional().allow(''),
      state: Joi.string().min(2).max(50).optional().allow(''),
      country: Joi.string().min(2).max(50).optional().allow(''),
      zipCode: Joi.string().min(3).max(20).optional().allow('')
    }).optional(),
    
    socialMedia: Joi.object({
      facebook: Joi.string().uri().optional().allow(''),
      twitter: Joi.string().uri().optional().allow(''),
      linkedin: Joi.string().uri().optional().allow(''),
      instagram: Joi.string().uri().optional().allow(''),
      youtube: Joi.string().uri().optional().allow(''),
      tiktok: Joi.string().uri().optional().allow('')
    }).optional(),
    
    settings: Joi.object({
      timezone: Joi.string().optional(),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR').optional(),
      language: Joi.string().valid('en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko').optional(),
      dateFormat: Joi.string().valid('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD').optional(),
      timeFormat: Joi.string().valid('12h', '24h').optional(),
      notifications: Joi.object({
        email: Joi.boolean(),
        push: Joi.boolean(),
        sms: Joi.boolean()
      }).optional(),
      features: Joi.object({
        aiContentGeneration: Joi.boolean(),
        analytics: Joi.boolean(),
        scheduling: Joi.boolean(),
        teamCollaboration: Joi.boolean(),
        customBranding: Joi.boolean()
      }).optional()
    }).optional()
  }),

  // Organization ID validation schema
  organizationId: Joi.object({
    id: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'Organization ID must be a valid MongoDB ObjectId',
        'string.length': 'Organization ID must be 24 characters long',
        'any.required': 'Organization ID is required'
      })
  }),

  // Organization query parameters schema
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
    
    industry: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Industry must be at least 2 characters long',
        'string.max': 'Industry cannot exceed 50 characters'
      }),
    
    status: Joi.string()
      .valid('active', 'inactive', 'suspended')
      .optional()
      .messages({
        'any.only': 'Status must be one of: active, inactive, suspended'
      }),
    
    subscriptionPlan: Joi.string()
      .valid('free', 'basic', 'professional', 'enterprise')
      .optional()
      .messages({
        'any.only': 'Subscription plan must be one of: free, basic, professional, enterprise'
      }),
    
    sortBy: Joi.string()
      .valid('name', 'industry', 'createdAt', 'lastActivity', 'userCount')
      .default('createdAt')
      .messages({
        'any.only': 'Sort by must be one of: name, industry, createdAt, lastActivity, userCount'
      }),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'Sort order must be either asc or desc'
      })
  }),

  // Organization member management schema
  addMember: Joi.object({
    userId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'User ID must be a valid MongoDB ObjectId',
        'string.length': 'User ID must be 24 characters long',
        'any.required': 'User ID is required'
      }),
    
    role: Joi.string()
      .valid('admin', 'member', 'viewer')
      .default('member')
      .messages({
        'any.only': 'Role must be one of: admin, member, viewer'
      }),
    
    permissions: Joi.object({
      canCreateContent: Joi.boolean().default(true),
      canSchedulePosts: Joi.boolean().default(true),
      canViewAnalytics: Joi.boolean().default(true),
      canManageUsers: Joi.boolean().default(false),
      canManageSettings: Joi.boolean().default(false)
    }).default({})
  }),

  // Organization member update schema
  updateMember: Joi.object({
    role: Joi.string()
      .valid('admin', 'member', 'viewer')
      .optional()
      .messages({
        'any.only': 'Role must be one of: admin, member, viewer'
      }),
    
    permissions: Joi.object({
      canCreateContent: Joi.boolean(),
      canSchedulePosts: Joi.boolean(),
      canViewAnalytics: Joi.boolean(),
      canManageUsers: Joi.boolean(),
      canManageSettings: Joi.boolean()
    }).optional()
  }),

  // Organization settings update schema
  updateSettings: Joi.object({
    timezone: Joi.string().optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR').optional(),
    language: Joi.string().valid('en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko').optional(),
    dateFormat: Joi.string().valid('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD').optional(),
    timeFormat: Joi.string().valid('12h', '24h').optional(),
    notifications: Joi.object({
      email: Joi.boolean(),
      push: Joi.boolean(),
      sms: Joi.boolean()
    }).optional(),
    features: Joi.object({
      aiContentGeneration: Joi.boolean(),
      analytics: Joi.boolean(),
      scheduling: Joi.boolean(),
      teamCollaboration: Joi.boolean(),
      customBranding: Joi.boolean()
    }).optional()
  }),

  // Organization subscription update schema
  updateSubscription: Joi.object({
    plan: Joi.string()
      .valid('free', 'basic', 'professional', 'enterprise')
      .required()
      .messages({
        'any.only': 'Plan must be one of: free, basic, professional, enterprise',
        'any.required': 'Plan is required'
      }),
    
    status: Joi.string()
      .valid('active', 'inactive', 'cancelled', 'expired')
      .optional()
      .messages({
        'any.only': 'Status must be one of: active, inactive, cancelled, expired'
      }),
    
    endDate: Joi.date()
      .optional()
      .messages({
        'date.base': 'End date must be a valid date'
      }),
    
    maxUsers: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        'number.base': 'Max users must be a number',
        'number.integer': 'Max users must be an integer',
        'number.min': 'Max users must be at least 1'
      }),
    
    maxPostsPerMonth: Joi.number()
      .integer()
      .min(0)
      .optional()
      .messages({
        'number.base': 'Max posts per month must be a number',
        'number.integer': 'Max posts per month must be an integer',
        'number.min': 'Max posts per month must be at least 0'
      })
  })
};

module.exports = organizationSchemas;

