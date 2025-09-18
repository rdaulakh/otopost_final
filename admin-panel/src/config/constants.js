// Application Constants

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: import.meta.env.VITE_JWT_STORAGE_KEY || 'admin_token',
  REFRESH_TOKEN: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'admin_refresh_token',
  USER_DATA: 'admin_user_data',
  THEME: 'admin_theme',
  SIDEBAR_STATE: 'admin_sidebar_state',
};

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SUPPORT: 'support',
  VIEWER: 'viewer',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  STARTER: 'starter',
  PRO: 'pro',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
};

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  TRIAL: 'trial',
};

// System Health Status
export const SYSTEM_STATUS = {
  OPERATIONAL: 'operational',
  DEGRADED: 'degraded',
  MAINTENANCE: 'maintenance',
  OUTAGE: 'outage',
};

// Alert Levels
export const ALERT_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  FULL: 'MMMM dd, yyyy HH:mm:ss',
  SHORT: 'MM/dd/yyyy',
  TIME: 'HH:mm:ss',
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#6366f1',
  GRAY: '#6b7280',
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

// API Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  BACKOFF_FACTOR: 2,
};

// Feature Flags
export const FEATURES = {
  ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  MULTI_TENANT: import.meta.env.VITE_ENABLE_MULTI_TENANT === 'true',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
};

// Environment
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  CURRENT: import.meta.env.VITE_ENVIRONMENT || 'development',
};

// Application Info
export const APP_INFO = {
  NAME: import.meta.env.VITE_APP_NAME || 'AI Social Media Admin Panel',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DESCRIPTION: 'Comprehensive Super Admin Dashboard for AI Social Media Platform',
};

// Social Media Platforms
export const SOCIAL_PLATFORMS = {
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
};

// AI Agents
export const AI_AGENTS = {
  INTELLIGENCE: 'intelligence',
  STRATEGY: 'strategy',
  CONTENT: 'content',
  EXECUTION: 'execution',
  LEARNING: 'learning',
  ENGAGEMENT: 'engagement',
  ANALYTICS: 'analytics',
};

// Export all constants
export default {
  STORAGE_KEYS,
  USER_ROLES,
  USER_STATUS,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  SYSTEM_STATUS,
  ALERT_LEVELS,
  NOTIFICATION_TYPES,
  PAGINATION,
  DATE_FORMATS,
  CHART_COLORS,
  FILE_UPLOAD,
  RETRY_CONFIG,
  FEATURES,
  ENVIRONMENT,
  APP_INFO,
  SOCIAL_PLATFORMS,
  AI_AGENTS,
};

