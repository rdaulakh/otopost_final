const mongoose = require('mongoose');

const socialProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'],
    required: true
  },
  platformId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  followerCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  tokenExpiry: {
    type: Date
  },
  permissions: [{
    type: String
  }],
  platformData: {
    // Platform-specific data
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  settings: {
    autoPost: {
      type: Boolean,
      default: true
    },
    optimalTiming: {
      type: Boolean,
      default: true
    },
    hashtagSuggestions: {
      type: Boolean,
      default: true
    },
    contentOptimization: {
      type: Boolean,
      default: true
    }
  },
  analytics: {
    lastSyncAt: {
      type: Date,
      default: Date.now
    },
    totalReach: {
      type: Number,
      default: 0
    },
    totalImpressions: {
      type: Number,
      default: 0
    },
    totalEngagement: {
      type: Number,
      default: 0
    },
    averageEngagementRate: {
      type: Number,
      default: 0
    },
    bestPostingTimes: [{
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6
      },
      hour: {
        type: Number,
        min: 0,
        max: 23
      },
      engagementScore: Number
    }],
    topHashtags: [{
      hashtag: String,
      usage: Number,
      performance: Number
    }],
    audienceInsights: {
      demographics: {
        ageGroups: [{
          range: String,
          percentage: Number
        }],
        gender: {
          male: Number,
          female: Number,
          other: Number
        },
        locations: [{
          country: String,
          city: String,
          percentage: Number
        }]
      },
      interests: [{
        category: String,
        percentage: Number
      }],
      activeHours: [{
        hour: Number,
        activity: Number
      }]
    }
  },
  lastPostAt: {
    type: Date
  },
  connectionStatus: {
    type: String,
    enum: ['connected', 'disconnected', 'error', 'expired'],
    default: 'connected'
  },
  errorMessage: {
    type: String,
    default: ''
  },
  webhookUrl: {
    type: String
  },
  rateLimits: {
    postsPerHour: {
      type: Number,
      default: 10
    },
    postsPerDay: {
      type: Number,
      default: 100
    },
    currentHourlyUsage: {
      type: Number,
      default: 0
    },
    currentDailyUsage: {
      type: Number,
      default: 0
    },
    resetTime: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Compound index for user and platform uniqueness
socialProfileSchema.index({ user: 1, platform: 1, platformId: 1 }, { unique: true });

// Indexes for better query performance
socialProfileSchema.index({ user: 1, isActive: 1 });
socialProfileSchema.index({ platform: 1, connectionStatus: 1 });
socialProfileSchema.index({ tokenExpiry: 1 });

// Virtual for connection health
socialProfileSchema.virtual('connectionHealth').get(function() {
  if (this.connectionStatus === 'connected') {
    if (this.tokenExpiry && this.tokenExpiry < new Date()) {
      return 'expired';
    }
    return 'healthy';
  }
  return this.connectionStatus;
});

// Method to check if token needs refresh
socialProfileSchema.methods.needsTokenRefresh = function() {
  if (!this.tokenExpiry) return false;
  const now = new Date();
  const expiryBuffer = new Date(this.tokenExpiry.getTime() - (30 * 60 * 1000)); // 30 minutes before expiry
  return now >= expiryBuffer;
};

// Method to update analytics
socialProfileSchema.methods.updateAnalytics = function(analyticsData) {
  this.analytics = {
    ...this.analytics,
    ...analyticsData,
    lastSyncAt: new Date()
  };
};

// Method to check rate limits
socialProfileSchema.methods.canPost = function() {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - (60 * 60 * 1000));
  const dayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

  // Reset counters if needed
  if (this.rateLimits.resetTime < hourAgo) {
    this.rateLimits.currentHourlyUsage = 0;
  }
  
  if (this.rateLimits.resetTime < dayAgo) {
    this.rateLimits.currentDailyUsage = 0;
  }

  return (
    this.rateLimits.currentHourlyUsage < this.rateLimits.postsPerHour &&
    this.rateLimits.currentDailyUsage < this.rateLimits.postsPerDay
  );
};

// Method to increment rate limit usage
socialProfileSchema.methods.incrementUsage = function() {
  this.rateLimits.currentHourlyUsage += 1;
  this.rateLimits.currentDailyUsage += 1;
  this.rateLimits.resetTime = new Date();
  this.lastPostAt = new Date();
};

// Static method to get active profiles for user
socialProfileSchema.statics.getActiveProfiles = function(userId) {
  return this.find({
    user: userId,
    isActive: true,
    connectionStatus: 'connected'
  });
};

// Static method to get profiles by platform
socialProfileSchema.statics.getByPlatform = function(userId, platform) {
  return this.find({
    user: userId,
    platform,
    isActive: true
  });
};

// Static method to get profiles needing token refresh
socialProfileSchema.statics.getProfilesNeedingRefresh = function() {
  const now = new Date();
  const refreshBuffer = new Date(now.getTime() + (30 * 60 * 1000)); // 30 minutes from now
  
  return this.find({
    tokenExpiry: { $lte: refreshBuffer },
    connectionStatus: 'connected',
    isActive: true
  });
};

// Pre-save middleware to update connection status based on token expiry
socialProfileSchema.pre('save', function(next) {
  if (this.tokenExpiry && this.tokenExpiry < new Date()) {
    this.connectionStatus = 'expired';
  }
  next();
});

module.exports = mongoose.model('SocialProfile', socialProfileSchema);
