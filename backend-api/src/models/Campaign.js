const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: [100, 'Campaign name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Campaign type is required'],
    enum: {
      values: ['content', 'promotional', 'brand_awareness', 'engagement', 'conversion', 'custom'],
      message: 'Invalid campaign type'
    }
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['draft', 'active', 'paused', 'completed', 'cancelled'],
      message: 'Invalid campaign status'
    },
    default: 'draft'
  },

  // Organization and User References
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization ID is required'],
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Content Management
  contentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],

  // Campaign Settings
  settings: {
    // Scheduling
    startDate: {
      type: Date,
      required: [true, 'Campaign start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'Campaign end date is required'],
      validate: {
        validator: function(value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    
    // Budget and Goals
    budget: {
      total: {
        type: Number,
        min: [0, 'Budget cannot be negative']
      },
      spent: {
        type: Number,
        default: 0,
        min: [0, 'Spent amount cannot be negative']
      },
      currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
      }
    },
    
    // Target Audience
    targetAudience: {
      demographics: {
        ageRange: {
          min: { type: Number, min: 13, max: 100 },
          max: { type: Number, min: 13, max: 100 }
        },
        genders: [{
          type: String,
          enum: ['male', 'female', 'other', 'all']
        }],
        locations: [{
          country: String,
          state: String,
          city: String
        }],
        languages: [String]
      },
      interests: [String],
      behaviors: [String],
      customAudience: {
        type: String,
        enum: ['lookalike', 'custom', 'saved_audience']
      }
    },

    // Platform Settings
    platforms: [{
      platform: {
        type: String,
        required: true,
        enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest']
      },
      enabled: {
        type: Boolean,
        default: true
      },
      settings: {
        postingFrequency: {
          type: String,
          enum: ['daily', 'weekly', 'custom'],
          default: 'daily'
        },
        optimalTimes: [{
          day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          },
          time: String // Format: "HH:MM"
        }],
        hashtags: [String],
        mentions: [String]
      }
    }],

    // AI Settings
    aiSettings: {
      enabled: {
        type: Boolean,
        default: true
      },
      contentGeneration: {
        enabled: { type: Boolean, default: true },
        tone: {
          type: String,
          enum: ['professional', 'casual', 'friendly', 'authoritative', 'creative'],
          default: 'professional'
        },
        style: {
          type: String,
          enum: ['informative', 'promotional', 'engaging', 'educational', 'entertaining'],
          default: 'engaging'
        }
      },
      optimization: {
        enabled: { type: Boolean, default: true },
        hashtagOptimization: { type: Boolean, default: true },
        timingOptimization: { type: Boolean, default: true },
        contentOptimization: { type: Boolean, default: true }
      },
      analytics: {
        enabled: { type: Boolean, default: true },
        realTimeMonitoring: { type: Boolean, default: true },
        performanceTracking: { type: Boolean, default: true }
      }
    }
  },

  // Performance Metrics
  metrics: {
    // Reach and Impressions
    reach: {
      total: { type: Number, default: 0 },
      unique: { type: Number, default: 0 },
      byPlatform: [{
        platform: String,
        count: { type: Number, default: 0 }
      }]
    },
    impressions: {
      total: { type: Number, default: 0 },
      byPlatform: [{
        platform: String,
        count: { type: Number, default: 0 }
      }]
    },

    // Engagement
    engagement: {
      total: { type: Number, default: 0 },
      rate: { type: Number, default: 0 }, // Percentage
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      byPlatform: [{
        platform: String,
        total: { type: Number, default: 0 },
        rate: { type: Number, default: 0 }
      }]
    },

    // Clicks and Conversions
    clicks: {
      total: { type: Number, default: 0 },
      unique: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 }, // Click-through rate
      byPlatform: [{
        platform: String,
        count: { type: Number, default: 0 }
      }]
    },
    conversions: {
      total: { type: Number, default: 0 },
      rate: { type: Number, default: 0 },
      value: { type: Number, default: 0 },
      byPlatform: [{
        platform: String,
        count: { type: Number, default: 0 }
      }]
    },

    // ROI and Performance
    roi: {
      value: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    cpm: { type: Number, default: 0 }, // Cost per mille
    cpc: { type: Number, default: 0 }, // Cost per click
    cpa: { type: Number, default: 0 }  // Cost per acquisition
  },

  // Timeline
  startedAt: Date,
  pausedAt: Date,
  completedAt: Date,
  cancelledAt: Date,

  // Approval Workflow
  approval: {
    required: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    rejectionReason: String,
    notes: String
  },

  // Tags and Categories
  tags: [String],
  category: {
    type: String,
    enum: ['marketing', 'branding', 'product_launch', 'event', 'seasonal', 'educational', 'other']
  },

  // Notifications
  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      recipients: [String]
    },
    inApp: {
      enabled: { type: Boolean, default: true }
    },
    webhook: {
      enabled: { type: Boolean, default: false },
      url: String,
      events: [String]
    }
  },

  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'import'],
      default: 'web'
    },
    version: {
      type: Number,
      default: 1
    },
    lastAnalyzed: Date,
    lastOptimized: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
campaignSchema.index({ organizationId: 1, status: 1 });
campaignSchema.index({ organizationId: 1, createdAt: -1 });
campaignSchema.index({ organizationId: 1, 'settings.startDate': 1, 'settings.endDate': 1 });
campaignSchema.index({ createdBy: 1, createdAt: -1 });
campaignSchema.index({ status: 1, 'settings.startDate': 1 });
campaignSchema.index({ tags: 1 });
campaignSchema.index({ 'approval.status': 1 });

// Virtual fields
campaignSchema.virtual('duration').get(function() {
  if (this.startedAt && this.completedAt) {
    return Math.ceil((this.completedAt - this.startedAt) / (1000 * 60 * 60 * 24)); // Days
  }
  return null;
});

campaignSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

campaignSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

campaignSchema.virtual('budgetRemaining').get(function() {
  if (this.settings.budget.total && this.settings.budget.spent !== undefined) {
    return this.settings.budget.total - this.settings.budget.spent;
  }
  return null;
});

campaignSchema.virtual('contentCount').get(function() {
  return this.contentIds ? this.contentIds.length : 0;
});

// Pre-save middleware
campaignSchema.pre('save', function(next) {
  // Update status based on dates
  const now = new Date();
  
  if (this.status === 'active' && this.settings.endDate && now > this.settings.endDate) {
    this.status = 'completed';
    this.completedAt = now;
  }
  
  // Validate budget
  if (this.settings.budget.spent > this.settings.budget.total) {
    return next(new Error('Spent amount cannot exceed total budget'));
  }
  
  next();
});

// Instance methods
campaignSchema.methods.start = function() {
  this.status = 'active';
  this.startedAt = new Date();
  return this.save();
};

campaignSchema.methods.pause = function() {
  this.status = 'paused';
  this.pausedAt = new Date();
  return this.save();
};

campaignSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

campaignSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  return this.save();
};

campaignSchema.methods.addContent = function(contentId) {
  if (!this.contentIds.includes(contentId)) {
    this.contentIds.push(contentId);
  }
  return this.save();
};

campaignSchema.methods.removeContent = function(contentId) {
  this.contentIds = this.contentIds.filter(id => !id.equals(contentId));
  return this.save();
};

campaignSchema.methods.updateMetrics = function(platform, metrics) {
  // Update platform-specific metrics
  const platformMetrics = this.metrics.engagement.byPlatform.find(p => p.platform === platform);
  if (platformMetrics) {
    Object.assign(platformMetrics, metrics);
  } else {
    this.metrics.engagement.byPlatform.push({ platform, ...metrics });
  }
  
  // Recalculate totals
  this.recalculateTotals();
  return this.save();
};

campaignSchema.methods.recalculateTotals = function() {
  // Recalculate engagement totals
  this.metrics.engagement.total = this.metrics.engagement.byPlatform.reduce((sum, p) => sum + (p.total || 0), 0);
  
  // Recalculate reach totals
  this.metrics.reach.total = this.metrics.reach.byPlatform.reduce((sum, p) => sum + (p.count || 0), 0);
  
  // Recalculate clicks totals
  this.metrics.clicks.total = this.metrics.clicks.byPlatform.reduce((sum, p) => sum + (p.count || 0), 0);
  
  // Calculate engagement rate
  if (this.metrics.reach.total > 0) {
    this.metrics.engagement.rate = (this.metrics.engagement.total / this.metrics.reach.total) * 100;
  }
  
  // Calculate CTR
  if (this.metrics.impressions.total > 0) {
    this.metrics.clicks.ctr = (this.metrics.clicks.total / this.metrics.impressions.total) * 100;
  }
  
  // Calculate ROI
  if (this.settings.budget.spent > 0) {
    this.metrics.roi.value = this.metrics.conversions.value - this.settings.budget.spent;
    this.metrics.roi.percentage = (this.metrics.roi.value / this.settings.budget.spent) * 100;
  }
};

// Static methods
campaignSchema.statics.findActiveCampaigns = function(organizationId) {
  return this.find({
    organizationId,
    status: 'active',
    'settings.startDate': { $lte: new Date() },
    'settings.endDate': { $gte: new Date() }
  });
};

campaignSchema.statics.findByDateRange = function(organizationId, startDate, endDate) {
  return this.find({
    organizationId,
    'settings.startDate': { $lte: endDate },
    'settings.endDate': { $gte: startDate }
  });
};

campaignSchema.statics.getCampaignStats = function(organizationId) {
  return this.aggregate([
    { $match: { organizationId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalBudget: { $sum: '$settings.budget.total' },
        totalSpent: { $sum: '$settings.budget.spent' }
      }
    }
  ]);
};

module.exports = mongoose.model('Campaign', campaignSchema);

