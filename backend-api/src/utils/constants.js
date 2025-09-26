// Application Constants
module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  },

  // Social Media Platforms
  PLATFORMS: {
    FACEBOOK: 'facebook',
    INSTAGRAM: 'instagram',
    TWITTER: 'twitter',
    LINKEDIN: 'linkedin',
    TIKTOK: 'tiktok',
    YOUTUBE: 'youtube',
    PINTEREST: 'pinterest'
  },

  // Content Types
  CONTENT_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    CAROUSEL: 'carousel',
    STORY: 'story'
  },

  // User Roles
  ROLES: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user'
  },

  // Campaign Status
  CAMPAIGN_STATUS: {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    ACTIVE: 'active',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    SYSTEM: 'system'
  },

  // AI Agent Types
  AI_AGENTS: {
    CONTENT_CREATOR: 'content_creator',
    ANALYTICS: 'analytics',
    ENGAGEMENT: 'engagement',
    STRATEGY: 'strategy',
    EXECUTION: 'execution',
    LEARNING: 'learning',
    INTELLIGENCE: 'intelligence'
  },

  // Rate Limiting
  RATE_LIMITS: {
    API: 1000, // requests per hour
    AUTH: 5,   // login attempts per hour
    UPLOAD: 10 // file uploads per hour
  },

  // File Upload Limits
  UPLOAD_LIMITS: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']
  },

  // Cache TTL (Time To Live) in seconds
  CACHE_TTL: {
    SHORT: 300,    // 5 minutes
    MEDIUM: 1800,  // 30 minutes
    LONG: 3600,    // 1 hour
    VERY_LONG: 86400 // 24 hours
  }
};
