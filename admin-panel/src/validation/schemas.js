// Validation Schemas
import { USER_ROLES, SUBSCRIPTION_PLANS, FILE_UPLOAD } from '../config/constants.js';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation regex (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Phone validation regex
const PHONE_REGEX = /^\+?[\d\s\-\(\)]{10,}$/;

// URL validation regex
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Base validation functions
export const validators = {
  required: (value, fieldName = 'Field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value, fieldName = 'Email') => {
    if (!value) return null;
    if (!EMAIL_REGEX.test(value)) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  },

  password: (value, fieldName = 'Password') => {
    if (!value) return null;
    if (value.length < 8) {
      return `${fieldName} must be at least 8 characters long`;
    }
    if (!PASSWORD_REGEX.test(value)) {
      return `${fieldName} must contain at least one uppercase letter, one lowercase letter, and one number`;
    }
    return null;
  },

  confirmPassword: (value, originalPassword, fieldName = 'Confirm Password') => {
    if (!value) return null;
    if (value !== originalPassword) {
      return `${fieldName} must match the password`;
    }
    return null;
  },

  phone: (value, fieldName = 'Phone') => {
    if (!value) return null;
    if (!PHONE_REGEX.test(value)) {
      return `${fieldName} must be a valid phone number`;
    }
    return null;
  },

  url: (value, fieldName = 'URL') => {
    if (!value) return null;
    if (!URL_REGEX.test(value)) {
      return `${fieldName} must be a valid URL`;
    }
    return null;
  },

  minLength: (value, min, fieldName = 'Field') => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (value, max, fieldName = 'Field') => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} must be no more than ${max} characters long`;
    }
    return null;
  },

  min: (value, min, fieldName = 'Field') => {
    if (value === null || value === undefined || value === '') return null;
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < min) {
      return `${fieldName} must be at least ${min}`;
    }
    return null;
  },

  max: (value, max, fieldName = 'Field') => {
    if (value === null || value === undefined || value === '') return null;
    const numValue = Number(value);
    if (isNaN(numValue) || numValue > max) {
      return `${fieldName} must be no more than ${max}`;
    }
    return null;
  },

  oneOf: (value, options, fieldName = 'Field') => {
    if (!value) return null;
    if (!options.includes(value)) {
      return `${fieldName} must be one of: ${options.join(', ')}`;
    }
    return null;
  },

  fileSize: (file, fieldName = 'File') => {
    if (!file) return null;
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      return `${fieldName} size must be less than ${FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  },

  fileType: (file, fieldName = 'File') => {
    if (!file) return null;
    if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
      return `${fieldName} must be one of: ${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(', ')}`;
    }
    return null;
  },
};

// User validation schema
export const userSchema = {
  name: [
    (value) => validators.required(value, 'Name'),
    (value) => validators.minLength(value, 2, 'Name'),
    (value) => validators.maxLength(value, 100, 'Name'),
  ],
  email: [
    (value) => validators.required(value, 'Email'),
    (value) => validators.email(value, 'Email'),
  ],
  password: [
    (value) => validators.required(value, 'Password'),
    (value) => validators.password(value, 'Password'),
  ],
  confirmPassword: (originalPassword) => [
    (value) => validators.required(value, 'Confirm Password'),
    (value) => validators.confirmPassword(value, originalPassword, 'Confirm Password'),
  ],
  phone: [
    (value) => validators.phone(value, 'Phone'),
  ],
  role: [
    (value) => validators.required(value, 'Role'),
    (value) => validators.oneOf(value, Object.values(USER_ROLES), 'Role'),
  ],
};

// Login validation schema
export const loginSchema = {
  email: [
    (value) => validators.required(value, 'Email'),
    (value) => validators.email(value, 'Email'),
  ],
  password: [
    (value) => validators.required(value, 'Password'),
  ],
};

// Subscription plan validation schema
export const subscriptionPlanSchema = {
  name: [
    (value) => validators.required(value, 'Plan Name'),
    (value) => validators.minLength(value, 2, 'Plan Name'),
    (value) => validators.maxLength(value, 50, 'Plan Name'),
  ],
  description: [
    (value) => validators.required(value, 'Description'),
    (value) => validators.maxLength(value, 500, 'Description'),
  ],
  price: [
    (value) => validators.required(value, 'Price'),
    (value) => validators.min(value, 0, 'Price'),
  ],
  billingCycle: [
    (value) => validators.required(value, 'Billing Cycle'),
    (value) => validators.oneOf(value, ['monthly', 'yearly'], 'Billing Cycle'),
  ],
  features: [
    (value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return 'At least one feature is required';
      }
      return null;
    },
  ],
};

// Team member invitation schema
export const teamInvitationSchema = {
  email: [
    (value) => validators.required(value, 'Email'),
    (value) => validators.email(value, 'Email'),
  ],
  role: [
    (value) => validators.required(value, 'Role'),
    (value) => validators.oneOf(value, Object.values(USER_ROLES), 'Role'),
  ],
  message: [
    (value) => validators.maxLength(value, 500, 'Message'),
  ],
};

// Support ticket schema
export const supportTicketSchema = {
  title: [
    (value) => validators.required(value, 'Title'),
    (value) => validators.minLength(value, 5, 'Title'),
    (value) => validators.maxLength(value, 200, 'Title'),
  ],
  description: [
    (value) => validators.required(value, 'Description'),
    (value) => validators.minLength(value, 10, 'Description'),
    (value) => validators.maxLength(value, 2000, 'Description'),
  ],
  priority: [
    (value) => validators.required(value, 'Priority'),
    (value) => validators.oneOf(value, ['low', 'medium', 'high', 'critical'], 'Priority'),
  ],
  category: [
    (value) => validators.required(value, 'Category'),
  ],
};

// System alert rule schema
export const alertRuleSchema = {
  name: [
    (value) => validators.required(value, 'Rule Name'),
    (value) => validators.minLength(value, 3, 'Rule Name'),
    (value) => validators.maxLength(value, 100, 'Rule Name'),
  ],
  metric: [
    (value) => validators.required(value, 'Metric'),
  ],
  condition: [
    (value) => validators.required(value, 'Condition'),
    (value) => validators.oneOf(value, ['>', '<', '>=', '<=', '==', '!='], 'Condition'),
  ],
  threshold: [
    (value) => validators.required(value, 'Threshold'),
    (value) => validators.min(value, 0, 'Threshold'),
  ],
  severity: [
    (value) => validators.required(value, 'Severity'),
    (value) => validators.oneOf(value, ['info', 'warning', 'error', 'critical'], 'Severity'),
  ],
};

// File upload schema
export const fileUploadSchema = {
  file: [
    (value) => validators.required(value, 'File'),
    (value) => validators.fileSize(value, 'File'),
    (value) => validators.fileType(value, 'File'),
  ],
};

// White label settings schema
export const whiteLabelSchema = {
  companyName: [
    (value) => validators.required(value, 'Company Name'),
    (value) => validators.minLength(value, 2, 'Company Name'),
    (value) => validators.maxLength(value, 100, 'Company Name'),
  ],
  domain: [
    (value) => validators.url(value, 'Domain'),
  ],
  primaryColor: [
    (value) => validators.required(value, 'Primary Color'),
  ],
  secondaryColor: [
    (value) => validators.required(value, 'Secondary Color'),
  ],
  logo: [
    (value) => validators.fileSize(value, 'Logo'),
    (value) => validators.fileType(value, 'Logo'),
  ],
  favicon: [
    (value) => validators.fileSize(value, 'Favicon'),
    (value) => validators.fileType(value, 'Favicon'),
  ],
};

// Generic validation function
export const validateField = (value, validationRules) => {
  if (!validationRules || !Array.isArray(validationRules)) {
    return null;
  }

  for (const rule of validationRules) {
    const error = rule(value);
    if (error) {
      return error;
    }
  }

  return null;
};

// Validate entire form
export const validateForm = (formData, schema) => {
  const errors = {};
  let isValid = true;

  Object.keys(schema).forEach(field => {
    const value = formData[field];
    const rules = typeof schema[field] === 'function' 
      ? schema[field](formData) 
      : schema[field];
    
    const error = validateField(value, rules);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Async validation for unique fields
export const asyncValidators = {
  uniqueEmail: async (email, userId = null) => {
    try {
      // This would typically call an API to check if email exists
      // For now, return a mock validation
      if (email === 'admin@example.com' && !userId) {
        return 'Email already exists';
      }
      return null;
    } catch (error) {
      return 'Unable to validate email uniqueness';
    }
  },

  uniqueUsername: async (username, userId = null) => {
    try {
      // Mock validation
      if (username === 'admin' && !userId) {
        return 'Username already exists';
      }
      return null;
    } catch (error) {
      return 'Unable to validate username uniqueness';
    }
  },
};

export default {
  validators,
  userSchema,
  loginSchema,
  subscriptionPlanSchema,
  teamInvitationSchema,
  supportTicketSchema,
  alertRuleSchema,
  fileUploadSchema,
  whiteLabelSchema,
  validateField,
  validateForm,
  asyncValidators,
};

