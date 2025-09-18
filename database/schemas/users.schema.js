const Joi = require('joi');

// User validation schemas
const userSchemas = {
  // User registration schema
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username must contain only alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required'
      }),
    
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    
    organization: Joi.string()
      .hex()
      .length(24)
      .optional()
      .messages({
        'string.hex': 'Organization ID must be a valid MongoDB ObjectId',
        'string.length': 'Organization ID must be 24 characters long'
      }),
    
    role: Joi.string()
      .valid('admin', 'member', 'viewer')
      .default('member')
      .messages({
        'any.only': 'Role must be one of: admin, member, viewer'
      }),
    
    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    
    timezone: Joi.string()
      .default('UTC')
      .messages({
        'any.default': 'Timezone will default to UTC'
      }),
    
    preferences: Joi.object({
      notifications: Joi.object({
        email: Joi.boolean().default(true),
        push: Joi.boolean().default(true),
        sms: Joi.boolean().default(false)
      }).default({}),
      language: Joi.string().valid('en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko').default('en'),
      theme: Joi.string().valid('light', 'dark', 'auto').default('auto'),
      dateFormat: Joi.string().valid('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD').default('MM/DD/YYYY'),
      timeFormat: Joi.string().valid('12h', '24h').default('12h')
    }).default({})
  }),

  // User login schema
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      }),
    
    rememberMe: Joi.boolean()
      .default(false)
      .messages({
        'any.default': 'Remember me will default to false'
      })
  }),

  // User update schema
  update: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .optional()
      .messages({
        'string.alphanum': 'Username must contain only alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters'
      }),
    
    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    
    firstName: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters'
      }),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters'
      }),
    
    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    
    timezone: Joi.string()
      .optional()
      .messages({
        'any.optional': 'Timezone is optional'
      }),
    
    preferences: Joi.object({
      notifications: Joi.object({
        email: Joi.boolean(),
        push: Joi.boolean(),
        sms: Joi.boolean()
      }),
      language: Joi.string().valid('en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'),
      theme: Joi.string().valid('light', 'dark', 'auto'),
      dateFormat: Joi.string().valid('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'),
      timeFormat: Joi.string().valid('12h', '24h')
    }).optional()
  }),

  // Password change schema
  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    
    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        'any.required': 'New password is required'
      }),
    
    confirmNewPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'New passwords do not match',
        'any.required': 'New password confirmation is required'
      })
  }),

  // Password reset request schema
  resetPasswordRequest: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
  }),

  // Password reset schema
  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required'
      }),
    
    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        'any.required': 'New password is required'
      }),
    
    confirmNewPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'New passwords do not match',
        'any.required': 'New password confirmation is required'
      })
  }),

  // User ID validation schema
  userId: Joi.object({
    id: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'User ID must be a valid MongoDB ObjectId',
        'string.length': 'User ID must be 24 characters long',
        'any.required': 'User ID is required'
      })
  }),

  // User query parameters schema
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
    
    role: Joi.string()
      .valid('admin', 'member', 'viewer')
      .optional()
      .messages({
        'any.only': 'Role must be one of: admin, member, viewer'
      }),
    
    status: Joi.string()
      .valid('active', 'inactive', 'suspended')
      .optional()
      .messages({
        'any.only': 'Status must be one of: active, inactive, suspended'
      }),
    
    sortBy: Joi.string()
      .valid('username', 'email', 'firstName', 'lastName', 'createdAt', 'lastLogin')
      .default('createdAt')
      .messages({
        'any.only': 'Sort by must be one of: username, email, firstName, lastName, createdAt, lastLogin'
      }),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'Sort order must be either asc or desc'
      })
  })
};

module.exports = userSchemas;

