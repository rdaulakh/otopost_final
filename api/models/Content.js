const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    text: {
      type: String,
      required: true
    },
    hashtags: [{
      type: String,
      trim: true
    }],
    mentions: [{
      type: String,
      trim: true
    }]
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'gif', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: String,
    size: Number,
    dimensions: {
      width: Number,
      height: Number
    },
    duration: Number, // for videos
    thumbnail: String // for videos
  }],
  platforms: [{
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'],
      required: true
    },
    postId: String, // ID from the social platform
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'failed'],
      default: 'draft'
    },
    scheduledFor: Date,
    publishedAt: Date,
    platformSpecific: {
      // Platform-specific content variations
      text: String,
      hashtags: [String],
      mentions: [String]
    },
    error: String // Error message if publishing failed
  }],
  postType: {
    type: String,
    enum: ['text', 'image', 'video', 'carousel', 'story', 'reel', 'poll'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'archived'],
    default: 'draft'
  },
  aiGenerated: {
    isAIGenerated: {
      type: Boolean,
      default: false
    },
    prompt: String,
    model: String,
    confidence: Number,
    suggestions: [{
      type: String,
      content: String,
      confidence: Number
    }]
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    },
    impressions: {
      type: Number,
      default: 0
    },
    engagement: {
      rate: {
        type: Number,
        default: 0
      },
      score: {
        type: Number,
        default: 0
      }
    },
    platformAnalytics: [{
      platform: String,
      metrics: mongoose.Schema.Types.Mixed
    }]
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  tags: [{
    type: String,
    trim: true
  }],
  approval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_revision'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    feedback: String,
    revisionRequests: [{
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      requestedAt: {
        type: Date,
        default: Date.now
      },
      feedback: String,
      resolved: {
        type: Boolean,
        default: false
      }
    }]
  },
  scheduling: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    optimalTime: {
      type: Boolean,
      default: false
    },
    recurringSchedule: {
      enabled: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly']
      },
      interval: Number,
      endDate: Date
    }
  },
  performance: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    benchmarks: {
      industry: Number,
      account: Number
    },
    predictions: {
      expectedReach: Number,
      expectedEngagement: Number,
      confidence: Number
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
contentSchema.index({ user: 1, status: 1 });
contentSchema.index({ user: 1, createdAt: -1 });
contentSchema.index({ 'platforms.platform': 1, 'platforms.status': 1 });
contentSchema.index({ 'platforms.scheduledFor': 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ campaign: 1 });

// Virtual for total engagement
contentSchema.virtual('totalEngagement').get(function() {
  return this.analytics.likes + this.analytics.shares + this.analytics.comments;
});

// Virtual for engagement rate calculation
contentSchema.virtual('engagementRate').get(function() {
  if (this.analytics.reach === 0) return 0;
  return (this.totalEngagement / this.analytics.reach) * 100;
});

// Method to check if content is scheduled
contentSchema.methods.isScheduled = function() {
  return this.platforms.some(platform => 
    platform.status === 'scheduled' && platform.scheduledFor > new Date()
  );
};

// Method to get platform-specific content
contentSchema.methods.getPlatformContent = function(platformName) {
  return this.platforms.find(platform => platform.platform === platformName);
};

// Method to update analytics
contentSchema.methods.updateAnalytics = function(platformName, metrics) {
  const platform = this.platforms.find(p => p.platform === platformName);
  if (platform) {
    // Update overall analytics
    Object.keys(metrics).forEach(key => {
      if (this.analytics[key] !== undefined) {
        this.analytics[key] += metrics[key] || 0;
      }
    });

    // Update platform-specific analytics
    const existingPlatformAnalytics = this.analytics.platformAnalytics.find(
      pa => pa.platform === platformName
    );
    
    if (existingPlatformAnalytics) {
      existingPlatformAnalytics.metrics = { ...existingPlatformAnalytics.metrics, ...metrics };
    } else {
      this.analytics.platformAnalytics.push({
        platform: platformName,
        metrics
      });
    }

    // Recalculate engagement rate
    this.analytics.engagement.rate = this.engagementRate;
  }
};

// Static method to get content by status
contentSchema.statics.getByStatus = function(userId, status) {
  return this.find({ user: userId, status });
};

// Static method to get scheduled content
contentSchema.statics.getScheduledContent = function(userId) {
  return this.find({
    user: userId,
    'platforms.status': 'scheduled',
    'platforms.scheduledFor': { $gte: new Date() }
  }).sort({ 'platforms.scheduledFor': 1 });
};

module.exports = mongoose.model('Content', contentSchema);
