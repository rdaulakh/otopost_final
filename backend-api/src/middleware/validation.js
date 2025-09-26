const { body, param, query, validationResult } = require('express-validator');
const validator = require('validator');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
      location: error.location
    }));
    
    logger.logAPI(req.path, req.method, 400, 0, {
      validationErrors: formattedErrors,
      userId: req.user?.id,
      adminId: req.admin?.id
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: formattedErrors
    });
  }
  
  next();
};

// Common validation rules
const commonValidations = {
  // MongoDB ObjectId validation
  objectId: (field) => {
    return param(field)
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error(`Invalid ${field} format`);
        }
        return true;
      });
  },
  
  // Email validation
  email: (field = 'email') => {
    return body(field)
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address');
  },
  
  // Password validation
  password: (field = 'password') => {
    return body(field)
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');
  },
  
  // Name validation
  name: (field) => {
    return body(field)
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage(`${field} must be between 1 and 50 characters`)
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage(`${field} can only contain letters, spaces, hyphens, and apostrophes`);
  },
  
  // Phone number validation
  phone: (field = 'phoneNumber') => {
    return body(field)
      .optional()
      .custom((value) => {
        if (!value || value.trim() === '') return true; // Allow empty values
        return /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''));
      })
      .withMessage('Please provide a valid phone number');
  },
  
  // URL validation
  url: (field) => {
    return body(field)
      .optional()
      .isURL()
      .withMessage(`${field} must be a valid URL`);
  },
  
  // Date validation
  date: (field) => {
    return body(field)
      .isISO8601()
      .toDate()
      .withMessage(`${field} must be a valid date`);
  },
  
  // Pagination validation
  pagination: () => {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      query('sort')
        .optional()
        .isIn(['asc', 'desc', '1', '-1'])
        .withMessage('Sort must be asc, desc, 1, or -1'),
      query('sortBy')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('SortBy field name is required')
    ];
  }
};

// User validation rules
const userValidations = {
  register: [
    commonValidations.email(),
    commonValidations.password(),
    commonValidations.name('firstName'),
    commonValidations.name('lastName'),
    body('organizationName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Organization name must be between 1 and 100 characters'),
    body('company')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Company name must be between 1 and 100 characters'),
    body('acceptTerms')
      .isBoolean()
      .custom((value) => {
        if (!value) {
          throw new Error('You must accept the terms and conditions');
        }
        return true;
      }),
    body()
      .custom((value) => {
        if (!value.organizationName && !value.company) {
          throw new Error('Either organizationName or company must be provided');
        }
        return true;
      })
  ],
  
  login: [
    commonValidations.email(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  
  updateProfile: [
    commonValidations.name('firstName').optional(),
    commonValidations.name('lastName').optional(),
    commonValidations.phone().optional(),
    body('profilePicture')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Allow null, undefined, or empty string
        }
        return validator.isURL(value); // Validate URL only if value exists
      })
      .withMessage('Profile picture must be a valid URL or null')
  ],
  
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    commonValidations.password('newPassword')
  ],
  
  forgotPassword: [
    commonValidations.email()
  ],
  
  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    commonValidations.password('newPassword')
  ]
};

// Admin validation rules
const adminValidations = {
  login: [
    commonValidations.email(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  
  createAdmin: [
    commonValidations.email(),
    commonValidations.password(),
    commonValidations.name('firstName'),
    commonValidations.name('lastName'),
    body('role')
      .isIn(['super_admin', 'admin', 'support_manager', 'financial_manager', 'technical_manager', 'content_manager'])
      .withMessage('Invalid admin role'),
    body('department')
      .optional()
      .isIn(['administration', 'support', 'finance', 'technical', 'content', 'marketing'])
      .withMessage('Invalid department')
  ],
  
  updateAdmin: [
    commonValidations.name('firstName').optional(),
    commonValidations.name('lastName').optional(),
    body('role')
      .optional()
      .isIn(['super_admin', 'admin', 'support_manager', 'financial_manager', 'technical_manager', 'content_manager'])
      .withMessage('Invalid admin role'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ]
};

// Content validation rules
const contentValidations = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('type')
      .isIn(['post', 'story', 'reel', 'carousel', 'video', 'live', 'poll', 'article'])
      .withMessage('Invalid content type'),
    body('category')
      .optional()
      .isIn(['educational', 'promotional', 'behind-the-scenes', 'user-generated', 'industry-news', 'company-updates', 'thought-leadership', 'entertainment'])
      .withMessage('Invalid content category'),
    body('content.text')
      .optional()
      .isLength({ max: 10000 })
      .withMessage('Content text cannot exceed 10,000 characters'),
    body('platforms')
      .isArray({ min: 1 })
      .withMessage('At least one platform must be selected'),
    body('platforms.*')
      .isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest'])
      .withMessage('Invalid platform')
  ],
  
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('content.text')
      .optional()
      .isLength({ max: 10000 })
      .withMessage('Content text cannot exceed 10,000 characters'),
    body('status')
      .optional()
      .isIn(['draft', 'in_review', 'approved', 'scheduled', 'published', 'archived'])
      .withMessage('Invalid status')
  ],
  
  schedule: [
    body('scheduledAt')
      .isISO8601()
      .toDate()
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Scheduled time must be in the future');
        }
        return true;
      }),
    body('platforms')
      .isArray({ min: 1 })
      .withMessage('At least one platform must be selected')
  ],
  
  approve: [
    body('status')
      .isIn(['approved', 'rejected', 'revision_requested'])
      .withMessage('Invalid approval status'),
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Notes cannot exceed 1,000 characters')
  ]
};

// Organization validation rules
const organizationValidations = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Organization name must be between 1 and 100 characters'),
    body('businessInfo.industry')
      .optional()
      .isIn(['technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing', 'real-estate', 'food-beverage', 'travel', 'entertainment', 'other'])
      .withMessage('Invalid industry'),
    body('contactInfo.primaryEmail')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid primary email')
  ],
  
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Organization name must be between 1 and 100 characters'),
    body('website')
      .optional()
      .isURL()
      .withMessage('Website must be a valid URL'),
    body('businessInfo.industry')
      .optional()
      .isIn(['technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing', 'real-estate', 'food-beverage', 'travel', 'entertainment', 'other'])
      .withMessage('Invalid industry')
  ]
};

// Analytics validation rules
const analyticsValidations = {
  query: [
    query('startDate')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Start date must be a valid date'),
    query('endDate')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('End date must be a valid date'),
    query('type')
      .optional()
      .isIn(['content_performance', 'platform_analytics', 'audience_insights', 'engagement_metrics', 'ai_agent_performance', 'campaign_analytics', 'competitor_analysis', 'trend_analysis', 'roi_metrics', 'user_behavior'])
      .withMessage('Invalid analytics type'),
    query('platform')
      .optional()
      .isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest'])
      .withMessage('Invalid platform')
  ]
};

// AI Agent validation rules
const aiAgentValidations = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Agent name must be between 1 and 100 characters'),
    body('type')
      .isIn(['intelligence_agent', 'strategy_agent', 'content_agent', 'execution_agent', 'learning_agent', 'engagement_agent', 'analytics_agent'])
      .withMessage('Invalid agent type'),
    body('configuration.model')
      .optional()
      .isIn(['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-2', 'custom'])
      .withMessage('Invalid AI model'),
    body('configuration.temperature')
      .optional()
      .isFloat({ min: 0, max: 2 })
      .withMessage('Temperature must be between 0 and 2')
  ],
  
  addTask: [
    body('type')
      .isIn(['content_generation', 'content_optimization', 'analytics_analysis', 'strategy_planning', 'engagement_response', 'trend_analysis', 'performance_review', 'competitor_analysis'])
      .withMessage('Invalid task type'),
    body('input')
      .notEmpty()
      .withMessage('Task input is required'),
    body('priority')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Priority must be between 1 and 10')
  ]
};

// Subscription validation rules
const subscriptionValidations = {
  create: [
    body('organizationId')
      .isMongoId()
      .withMessage('Valid organization ID is required'),
    body('planId')
      .isIn(['free', 'starter', 'professional', 'enterprise', 'custom'])
      .withMessage('Valid plan ID is required'),
    body('planName')
      .notEmpty()
      .withMessage('Plan name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Plan name must be between 2 and 100 characters'),
    body('billing.cycle')
      .isIn(['monthly', 'yearly', 'quarterly'])
      .withMessage('Valid billing cycle is required'),
    body('billing.amount')
      .isNumeric()
      .withMessage('Billing amount must be a number')
      .isFloat({ min: 0 })
      .withMessage('Billing amount must be positive'),
    body('billing.currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be 3 characters'),
    body('features.users.included')
      .isInt({ min: 0 })
      .withMessage('User limit must be a positive integer'),
    body('features.socialAccounts.included')
      .isInt({ min: 0 })
      .withMessage('Social accounts limit must be a positive integer'),
    body('features.monthlyPosts.included')
      .isInt({ min: 0 })
      .withMessage('Monthly posts limit must be a positive integer'),
    body('features.aiGenerations.included')
      .isInt({ min: 0 })
      .withMessage('AI generations limit must be a positive integer'),
    body('features.storageGB.included')
      .isInt({ min: 0 })
      .withMessage('Storage limit must be a positive integer'),
    body('features.analyticsRetentionDays')
      .isInt({ min: 1 })
      .withMessage('Analytics retention days must be at least 1'),
    handleValidationErrors
  ],

  update: [
    body('planId')
      .optional()
      .isIn(['free', 'starter', 'professional', 'enterprise', 'custom'])
      .withMessage('Valid plan ID is required'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended', 'cancelled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'])
      .withMessage('Valid status is required'),
    body('billing.cycle')
      .optional()
      .isIn(['monthly', 'yearly', 'quarterly'])
      .withMessage('Valid billing cycle is required'),
    body('billing.amount')
      .optional()
      .isNumeric()
      .withMessage('Billing amount must be a number')
      .isFloat({ min: 0 })
      .withMessage('Billing amount must be positive'),
    body('features.users.included')
      .optional()
      .isInt({ min: 0 })
      .withMessage('User limit must be a positive integer'),
    body('features.socialAccounts.included')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Social accounts limit must be a positive integer'),
    body('features.monthlyPosts.included')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Monthly posts limit must be a positive integer'),
    body('features.aiGenerations.included')
      .optional()
      .isInt({ min: 0 })
      .withMessage('AI generations limit must be a positive integer'),
    body('features.storageGB.included')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Storage limit must be a positive integer'),
    handleValidationErrors
  ],
  
  updatePaymentMethod: [
    body('paymentMethodId')
      .notEmpty()
      .withMessage('Payment method ID is required')
  ],
  
  applyCoupon: [
    body('couponCode')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Coupon code must be between 1 and 50 characters')
  ],

  // Agent configuration validation
  agentConfiguration: [
    body('configuration.temperature')
      .optional()
      .isFloat({ min: 0, max: 2 })
      .withMessage('Temperature must be between 0 and 2'),
    body('configuration.maxTokens')
      .optional()
      .isInt({ min: 1, max: 8000 })
      .withMessage('Max tokens must be between 1 and 8000'),
    body('configuration.customInstructions')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Custom instructions must be less than 2000 characters'),
    body('workflow.timeout')
      .optional()
      .isInt({ min: 30, max: 3600 })
      .withMessage('Timeout must be between 30 and 3600 seconds'),
    body('priority')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Priority must be between 1 and 10'),
    body('isEnabled')
      .optional()
      .isBoolean()
      .withMessage('isEnabled must be a boolean value')
  ]
};

// Search validation rules
const searchValidations = {
  search: [
    query('q')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Search query must be between 1 and 200 characters'),
    query('type')
      .optional()
      .isIn(['content', 'users', 'organizations', 'analytics'])
      .withMessage('Invalid search type'),
    ...commonValidations.pagination()
  ]
};

// Content validation rules
const validateContentQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().isLength({ max: 100 }).withMessage('Search term must be a string with max 100 characters'),
  query('type').optional().isIn(['post', 'story', 'reel', 'video', 'image', 'carousel']).withMessage('Invalid content type'),
  query('status').optional().isIn(['draft', 'published', 'scheduled', 'archived', 'rejected']).withMessage('Invalid content status'),
  query('platform').optional().isIn(['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube']).withMessage('Invalid platform'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'publishedAt', 'title', 'analytics.totalEngagement']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  handleValidationErrors
];

const validateContentModeration = [
  body('action').isIn(['approved', 'rejected', 'flagged']).withMessage('Action must be approved, rejected, or flagged'),
  body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason must be a string with max 500 characters'),
  body('notes').optional().isString().isLength({ max: 1000 }).withMessage('Notes must be a string with max 1000 characters'),
  handleValidationErrors
];

const validateContentStatusUpdate = [
  body('status').isIn(['draft', 'published', 'scheduled', 'archived', 'rejected']).withMessage('Invalid content status'),
  handleValidationErrors
];

// Notification validation rules
const validateNotificationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().isLength({ max: 100 }).withMessage('Search term must be a string with max 100 characters'),
  query('type').optional().isIn(['email', 'sms', 'push', 'in_app', 'webhook']).withMessage('Invalid notification type'),
  query('status').optional().isIn(['pending', 'sent', 'delivered', 'failed', 'bounced']).withMessage('Invalid notification status'),
  query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid notification priority'),
  query('sortBy').optional().isIn(['createdAt', 'sentAt', 'title', 'type', 'status']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  handleValidationErrors
];

const validateNotificationCreation = [
  body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be between 1 and 200 characters'),
  body('message').isString().isLength({ min: 1, max: 1000 }).withMessage('Message is required and must be between 1 and 1000 characters'),
  body('type').isIn(['email', 'sms', 'push', 'in_app', 'webhook']).withMessage('Invalid notification type'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid notification priority'),
  body('userId').optional().isMongoId().withMessage('Invalid user ID'),
  body('organizationId').optional().isMongoId().withMessage('Invalid organization ID'),
  handleValidationErrors
];

const validateNotificationDataUpdate = [
  body('title').optional().isString().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('message').optional().isString().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('status').optional().isIn(['pending', 'sent', 'delivered', 'failed', 'bounced']).withMessage('Invalid notification status'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid notification priority'),
  handleValidationErrors
];

const validateNotificationModeration = [
  body('action').isIn(['approved', 'rejected', 'flagged']).withMessage('Action must be approved, rejected, or flagged'),
  body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason must be a string with max 500 characters'),
  body('notes').optional().isString().isLength({ max: 1000 }).withMessage('Notes must be a string with max 1000 characters'),
  handleValidationErrors
];

// Agent configuration validation
const validateAgentConfiguration = [
  ...subscriptionValidations.agentConfiguration,
  handleValidationErrors
];

// File upload validation
const fileValidations = {
  upload: [
    body('type')
      .optional()
      .isIn(['image', 'video', 'document'])
      .withMessage('Invalid file type'),
    body('category')
      .optional()
      .isIn(['profile', 'content', 'brand', 'document'])
      .withMessage('Invalid file category')
  ]
};

// Custom validation helpers
const customValidations = {
  // Check if date range is valid
  dateRange: (startField, endField) => {
    return body(endField).custom((endDate, { req }) => {
      const startDate = req.body[startField];
      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    });
  },
  
  // Check if array contains unique values
  uniqueArray: (field) => {
    return body(field).custom((array) => {
      if (Array.isArray(array) && array.length !== new Set(array).size) {
        throw new Error(`${field} must contain unique values`);
      }
      return true;
    });
  },
  
  // Check if value exists in database
  exists: (Model, field = '_id') => {
    return body(field).custom(async (value) => {
      const document = await Model.findById(value);
      if (!document) {
        throw new Error(`${Model.modelName} not found`);
      }
      return true;
    });
  },
  
  // Check if value is unique in database
  unique: (Model, field, excludeId = null) => {
    return body(field).custom(async (value, { req }) => {
      const query = { [field]: value };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      const document = await Model.findOne(query);
      if (document) {
        throw new Error(`${field} already exists`);
      }
      return true;
    });
  }
};

// Additional validation functions for users routes
const validateProfileUpdate = [
  body('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters'),
  body('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters'),
  body('phoneNumber').optional().custom((value) => {
    if (!value || value.trim() === '') return true; // Allow empty values
    return /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''));
  }).withMessage('Invalid phone number format'),
  body('profilePicture').optional().custom((value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Allow null, undefined, or empty string
    }
    return validator.isURL(value); // Validate URL only if value exists
  }).withMessage('Profile picture must be a valid URL or null'),
  body('timezone').optional().isString().withMessage('Timezone must be a string'),
  body('language').optional().isString().withMessage('Language must be a string'),
  handleValidationErrors
];

const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
  handleValidationErrors
];

const validateNotificationUpdate = [
  body('email').optional().isObject().withMessage('Email preference must be an object'),
  body('push').optional().isObject().withMessage('Push preference must be an object'),
  body('sms').optional().isBoolean().withMessage('SMS preference must be a boolean'),
  body('marketing').optional().isBoolean().withMessage('Marketing preference must be a boolean'),
  body('weeklyReports').optional().isBoolean().withMessage('Weekly reports preference must be a boolean'),
  body('performanceAlerts').optional().isBoolean().withMessage('Performance alerts preference must be a boolean'),
  handleValidationErrors
];

const validateSocialAccountConnection = [
  body('platform').isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest']).withMessage('Invalid platform'),
  body('accessToken').notEmpty().withMessage('Access token is required'),
  body('accountId').notEmpty().withMessage('Account ID is required'),
  body('accountName').notEmpty().withMessage('Account name is required'),
  handleValidationErrors
];

const validateAccountDeletion = [
  body('password').notEmpty().withMessage('Password is required for account deletion'),
  body('confirmDeletion').equals('true').withMessage('Account deletion must be confirmed'),
  handleValidationErrors
];

// Content validation functions
const validateContentCreation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['post', 'story', 'reel', 'video', 'carousel', 'article']).withMessage('Invalid content type'),
  body('platforms').isArray({ min: 1 }).withMessage('At least one platform is required'),
  body('platforms.*').isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest']).withMessage('Invalid platform'),
  body('content').notEmpty().withMessage('Content is required'),
  handleValidationErrors
];

const validateContentUpdate = [
  body('title').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  handleValidationErrors
];

const validateContentScheduling = [
  body('scheduledAt').isISO8601().withMessage('Invalid scheduled date format'),
  body('platforms').isArray({ min: 1 }).withMessage('At least one platform is required'),
  body('platforms.*').isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest']).withMessage('Invalid platform'),
  handleValidationErrors
];

const validateContentApproval = [
  body('status').isIn(['approved', 'rejected', 'revision_requested']).withMessage('Invalid approval status'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
  handleValidationErrors
];

const validateComment = [
  body('text').notEmpty().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
  handleValidationErrors
];

const validateAIGeneration = [
  body('type').isIn(['post', 'story', 'reel', 'video', 'carousel', 'article']).withMessage('Invalid content type'),
  body('platform').isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest']).withMessage('Invalid platform'),
  body('topic').notEmpty().withMessage('Topic is required'),
  body('tone').optional().isIn(['professional', 'casual', 'friendly', 'authoritative', 'humorous']).withMessage('Invalid tone'),
  body('length').optional().isIn(['short', 'medium', 'long']).withMessage('Invalid length'),
  handleValidationErrors
];

const validateCalendarQuery = [
  query('startDate').isISO8601().withMessage('Invalid start date format'),
  query('endDate').isISO8601().withMessage('Invalid end date format'),
  query('view').optional().isIn(['month', 'week', 'day']).withMessage('Invalid view type'),
  handleValidationErrors
];

// Analytics validation functions
const validateAnalyticsQuery = [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  handleValidationErrors
];

const validateContentPerformanceQuery = [
  query('contentId').optional().isMongoId().withMessage('Invalid content ID'),
  query('type').optional().isIn(['post', 'story', 'reel', 'video', 'carousel', 'article']).withMessage('Invalid content type'),
  query('platform').optional().isIn(['all', 'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest']).withMessage('Invalid platform'),
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('timeRange').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid time range'),
  query('metric').optional().isIn(['engagement', 'reach', 'impressions', 'clicks', 'conversions']).withMessage('Invalid metric'),
  handleValidationErrors
];

const validatePlatformAnalyticsQuery = [
  query('platform').isIn(['all', 'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest']).withMessage('Invalid platform'),
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('timeRange').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid time range'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  handleValidationErrors
];

const validateAudienceInsightsQuery = [
  query('platform').optional().isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest']).withMessage('Invalid platform'),
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('demographics').optional().isBoolean().withMessage('Demographics must be boolean'),
  query('interests').optional().isBoolean().withMessage('Interests must be boolean'),
  handleValidationErrors
];

const validateAIPerformanceQuery = [
  query('agentType').optional().isIn(['intelligence', 'strategy', 'content', 'execution', 'learning', 'engagement', 'analytics']).withMessage('Invalid agent type'),
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  handleValidationErrors
];

const validateROIQuery = [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('includeCosts').optional().isBoolean().withMessage('Include costs must be boolean'),
  handleValidationErrors
];

const validateExportQuery = [
  query('format').isIn(['csv', 'xlsx', 'json']).withMessage('Invalid export format'),
  query('type').isIn(['dashboard', 'content', 'platform', 'audience', 'ai', 'roi']).withMessage('Invalid export type'),
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  handleValidationErrors
];

// Admin validation functions
const validateUserQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search must be between 1 and 100 characters'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  query('role').optional().isIn(['owner', 'admin', 'manager', 'editor', 'viewer']).withMessage('Invalid role'),
  query('organizationId').optional().isMongoId().withMessage('Invalid organization ID'),
  query('sortBy').optional().isIn(['createdAt', 'lastLogin', 'firstName', 'lastName', 'email']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order'),
  handleValidationErrors
];

const validateUserStatusUpdate = [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters'),
  handleValidationErrors
];

const validateUserPermissionsUpdate = [
  body('permissions').isObject().withMessage('Permissions must be an object'),
  body('permissions.canCreateContent').optional().isBoolean().withMessage('canCreateContent must be boolean'),
  body('permissions.canEditContent').optional().isBoolean().withMessage('canEditContent must be boolean'),
  body('permissions.canDeleteContent').optional().isBoolean().withMessage('canDeleteContent must be boolean'),
  body('permissions.canPublishContent').optional().isBoolean().withMessage('canPublishContent must be boolean'),
  body('permissions.canManageTeam').optional().isBoolean().withMessage('canManageTeam must be boolean'),
  body('permissions.canManageBilling').optional().isBoolean().withMessage('canManageBilling must be boolean'),
  body('permissions.canManageSettings').optional().isBoolean().withMessage('canManageSettings must be boolean'),
  body('permissions.canViewAnalytics').optional().isBoolean().withMessage('canViewAnalytics must be boolean'),
  body('permissions.canManageAIAgents').optional().isBoolean().withMessage('canManageAIAgents must be boolean'),
  handleValidationErrors
];

const validateUserImpersonation = [
  body('reason').notEmpty().isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),
  body('duration').optional().isInt({ min: 1, max: 480 }).withMessage('Duration must be between 1 and 480 minutes'),
  handleValidationErrors
];

const validateUserExport = [
  query('format').isIn(['csv', 'xlsx', 'json']).withMessage('Invalid export format'),
  query('fields').optional().isArray().withMessage('Fields must be an array'),
  query('status').optional().isIn(['active', 'inactive', 'all']).withMessage('Invalid status filter'),
  query('role').optional().isIn(['owner', 'admin', 'manager', 'editor', 'viewer']).withMessage('Invalid role filter'),
  handleValidationErrors
];

// Organization validation functions
const validateOrganizationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search must be between 1 and 100 characters'),
  query('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  query('subscriptionStatus').optional().isIn(['active', 'cancelled', 'past_due', 'trialing']).withMessage('Invalid subscription status'),
  query('plan').optional().isIn(['free', 'basic', 'premium', 'enterprise']).withMessage('Invalid plan'),
  query('sortBy').optional().isIn(['createdAt', 'name', 'subscription.plan', 'subscription.status']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order'),
  handleValidationErrors
];

const validateOrganizationStatusUpdate = [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters'),
  body('suspensionReason').optional().isLength({ max: 500 }).withMessage('Suspension reason must be less than 500 characters'),
  handleValidationErrors
];


const validateOrganizationAnalyticsQuery = [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('metrics').optional().isArray().withMessage('Metrics must be an array'),
  handleValidationErrors
];

const validateUsageReset = [
  body('resetType').isIn(['monthly', 'all', 'specific']).withMessage('Invalid reset type'),
  body('resetFields').optional().isArray().withMessage('Reset fields must be an array'),
  body('reason').notEmpty().isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),
  handleValidationErrors
];

// Admin analytics validation functions
const validateSystemAnalyticsQuery = [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('includeMetrics').optional().isArray().withMessage('Include metrics must be an array'),
  handleValidationErrors
];

const validatePlatformUsageQuery = [
  query('platform').optional().isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest']).withMessage('Invalid platform'),
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('groupBy').optional().isIn(['platform', 'organization', 'user']).withMessage('Invalid group by field'),
  handleValidationErrors
];

const validateRevenueAnalyticsQuery = [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('includeBreakdown').optional().isBoolean().withMessage('Include breakdown must be boolean'),
  query('currency').optional().isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).withMessage('Invalid currency'),
  handleValidationErrors
];

const validateAISystemPerformanceQuery = [
  query('agentType').optional().isIn(['intelligence', 'strategy', 'content', 'execution', 'learning', 'engagement', 'analytics']).withMessage('Invalid agent type'),
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('includeErrors').optional().isBoolean().withMessage('Include errors must be boolean'),
  handleValidationErrors
];

const validateCustomReportGeneration = [
  body('reportType').isIn(['system', 'platform', 'revenue', 'ai', 'custom']).withMessage('Invalid report type'),
  body('title').notEmpty().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('period').isIn(['week', 'month', 'quarter', 'year', 'custom']).withMessage('Invalid period'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  body('metrics').isArray({ min: 1 }).withMessage('At least one metric is required'),
  body('filters').optional().isObject().withMessage('Filters must be an object'),
  body('format').isIn(['pdf', 'excel', 'csv', 'json']).withMessage('Invalid format'),
  handleValidationErrors
];

// Individual validation functions for subscriptions
const validateSubscriptionCreation = subscriptionValidations.create;
const validateSubscriptionUpdate = subscriptionValidations.update;

module.exports = {
  handleValidationErrors,
  commonValidations,
  userValidations,
  adminValidations,
  contentValidations,
  organizationValidations,
  analyticsValidations,
  aiAgentValidations,
  subscriptionValidations,
  searchValidations,
  validateProfileUpdate,
  validatePasswordChange,
  validateNotificationUpdate,
  validateSocialAccountConnection,
  validateAccountDeletion,
  validateContentCreation,
  validateContentUpdate,
  validateContentScheduling,
  validateContentApproval,
  validateComment,
  validateAIGeneration,
  validateCalendarQuery,
  validateAnalyticsQuery,
  validateContentPerformanceQuery,
  validatePlatformAnalyticsQuery,
  validateAudienceInsightsQuery,
  validateAIPerformanceQuery,
  validateROIQuery,
  validateExportQuery,
  validateUserQuery,
  validateUserStatusUpdate,
  validateUserPermissionsUpdate,
  validateUserImpersonation,
  validateUserExport,
  validateOrganizationQuery,
  validateOrganizationStatusUpdate,
  validateSubscriptionUpdate,
  validateSubscriptionCreation,
  validateOrganizationAnalyticsQuery,
  validateUsageReset,
  validateSystemAnalyticsQuery,
  validatePlatformUsageQuery,
  validateRevenueAnalyticsQuery,
  validateAISystemPerformanceQuery,
  validateCustomReportGeneration,
  validateContentQuery,
  validateContentModeration,
  validateContentStatusUpdate,
  validateNotificationQuery,
  validateNotificationCreation,
  validateNotificationDataUpdate,
  validateNotificationModeration,
  validateAgentConfiguration,
  fileValidations,
  customValidations
};

