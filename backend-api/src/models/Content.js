const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000,
    default: null
  },
  type: {
    type: String,
    enum: ['post', 'story', 'reel', 'carousel', 'video', 'live', 'poll', 'article'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'educational', 'promotional', 'behind-the-scenes', 'user-generated',
      'industry-news', 'company-updates', 'thought-leadership', 'entertainment'
    ],
    default: 'educational'
  },
  
  // Organization and User Association
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Content Data
  content: {
    text: {
      type: String,
      maxlength: 10000,
      default: null
    },
    hashtags: [String],
    mentions: [String],
    links: [{
      url: String,
      title: String,
      description: String
    }],
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
      thumbnailUrl: {
        type: String,
        default: null
      },
      altText: {
        type: String,
        maxlength: 200,
        default: null
      },
      size: {
        type: Number,
        default: 0
      },
      dimensions: {
        width: Number,
        height: Number
      },
      duration: {
        type: Number,
        default: null // for videos in seconds
      },
      metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    }],
    poll: {
      question: String,
      options: [String],
      duration: Number, // hours
      allowMultipleAnswers: { type: Boolean, default: false }
    }
  },
  
  // Platform-Specific Configuration
  platforms: [{
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest'],
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'failed', 'cancelled'],
      default: 'draft'
    },
    scheduledAt: {
      type: Date,
      default: null
    },
    publishedAt: {
      type: Date,
      default: null
    },
    platformPostId: {
      type: String,
      default: null
    },
    platformSpecific: {
      // Facebook/Instagram specific
      targetAudience: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      },
      boostPost: {
        type: Boolean,
        default: false
      },
      budget: {
        type: Number,
        default: null
      },
      
      // Twitter specific
      threadId: {
        type: String,
        default: null
      },
      isThread: {
        type: Boolean,
        default: false
      },
      
      // LinkedIn specific
      visibility: {
        type: String,
        enum: ['public', 'connections', 'logged-in'],
        default: 'public'
      },
      
      // TikTok specific
      effects: [String],
      sounds: [{
        id: String,
        title: String,
        artist: String
      }],
      
      // YouTube specific
      category: String,
      tags: [String],
      thumbnail: String,
      privacy: {
        type: String,
        enum: ['public', 'unlisted', 'private'],
        default: 'public'
      }
    },
    error: {
      message: String,
      code: String,
      timestamp: Date
    },
    retryCount: {
      type: Number,
      default: 0
    },
    maxRetries: {
      type: Number,
      default: 3
    }
  }],
  
  // AI Generation Information
  aiGenerated: {
    isAIGenerated: {
      type: Boolean,
      default: false
    },
    aiAgent: {
      type: String,
      enum: ['content_agent', 'strategy_agent', 'engagement_agent'],
      default: null
    },
    prompt: {
      type: String,
      maxlength: 2000,
      default: null
    },
    model: {
      type: String,
      default: null
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null
    },
    alternatives: [{
      text: String,
      confidence: Number,
      selected: { type: Boolean, default: false }
    }],
    generationMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  
  // Approval Workflow
  approval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revision_requested'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    rejectedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
      default: null
    },
    revisionNotes: {
      type: String,
      maxlength: 1000,
      default: null
    },
    approvalHistory: [{
      action: {
        type: String,
        enum: ['submitted', 'approved', 'rejected', 'revision_requested'],
        required: true
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      notes: String
    }]
  },
  
  // Performance Analytics
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    },
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 }
    },
    platformAnalytics: [{
      platform: String,
      impressions: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
      engagement: {
        likes: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        saves: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 }
      },
      demographics: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    }],
    roi: {
      cost: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 }, // Click-through rate
      cpm: { type: Number, default: 0 }, // Cost per mille
      cpc: { type: Number, default: 0 }  // Cost per click
    },
    lastAnalyticsUpdate: {
      type: Date,
      default: null
    }
  },
  
  // Campaign Association
  campaign: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      default: null
    },
    name: {
      type: String,
      default: null
    },
    objective: {
      type: String,
      enum: ['awareness', 'engagement', 'traffic', 'leads', 'sales'],
      default: null
    }
  },
  
  // Collaboration
  collaboration: {
    assignedTo: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['creator', 'reviewer', 'approver', 'publisher'],
        default: 'creator'
      },
      assignedAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        maxlength: 1000
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      isResolved: {
        type: Boolean,
        default: false
      },
      replies: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        text: {
          type: String,
          required: true,
          maxlength: 500
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }]
    }],
    versions: [{
      versionNumber: {
        type: Number,
        required: true
      },
      content: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      changeLog: String
    }]
  },
  
  // SEO and Optimization
  seo: {
    keywords: [String],
    metaDescription: {
      type: String,
      maxlength: 160
    },
    optimizationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    suggestions: [{
      type: String,
      suggestion: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }]
  },
  
  // Status and Flags
  status: {
    type: String,
    enum: ['draft', 'in_review', 'approved', 'scheduled', 'published', 'archived', 'deleted'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateCategory: {
    type: String,
    default: null
  },
  tags: [String],
  
  // Scheduling
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
      isRecurring: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: null
      },
      interval: { type: Number, default: 1 },
      endDate: { type: Date, default: null },
      daysOfWeek: [Number], // 0-6, Sunday = 0
      dayOfMonth: Number // 1-31
    }
  },
  
  // Compliance and Moderation
  compliance: {
    isCompliant: {
      type: Boolean,
      default: true
    },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'flagged', 'rejected'],
      default: 'pending'
    },
    moderationFlags: [{
      flag: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      description: String
    }],
    legalReview: {
      required: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: null
      },
      reviewedBy: String,
      reviewedAt: Date,
      notes: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
contentSchema.index({ organizationId: 1, createdAt: -1 });
contentSchema.index({ userId: 1, createdAt: -1 });
contentSchema.index({ 'platforms.status': 1, 'platforms.scheduledAt': 1 });
contentSchema.index({ 'approval.status': 1 });
contentSchema.index({ status: 1, organizationId: 1 });
contentSchema.index({ type: 1, category: 1 });
contentSchema.index({ 'campaign.id': 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ 'scheduling.recurringSchedule.isRecurring': 1 });

// Virtual for total engagement
contentSchema.virtual('totalEngagement').get(function() {
  const engagement = this.analytics.engagement;
  return engagement.likes + engagement.comments + engagement.shares + engagement.saves + engagement.clicks;
});

// Virtual for engagement rate
contentSchema.virtual('engagementRate').get(function() {
  if (this.analytics.reach === 0) return 0;
  return (this.totalEngagement / this.analytics.reach) * 100;
});

// Virtual for current version
contentSchema.virtual('currentVersion').get(function() {
  if (this.collaboration.versions.length === 0) return 1;
  return Math.max(...this.collaboration.versions.map(v => v.versionNumber));
});

// Virtual for platform count
contentSchema.virtual('platformCount').get(function() {
  return this.platforms.length;
});

// Virtual for published platform count
contentSchema.virtual('publishedPlatformCount').get(function() {
  return this.platforms.filter(p => p.status === 'published').length;
});

// Instance method to add platform
contentSchema.methods.addPlatform = function(platform, scheduledAt = null) {
  const existingPlatform = this.platforms.find(p => p.platform === platform);
  if (existingPlatform) {
    return false; // Platform already exists
  }
  
  this.platforms.push({
    platform,
    scheduledAt,
    status: scheduledAt ? 'scheduled' : 'draft'
  });
  
  return true;
};

// Instance method to update platform status
contentSchema.methods.updatePlatformStatus = function(platform, status, additionalData = {}) {
  const platformIndex = this.platforms.findIndex(p => p.platform === platform);
  if (platformIndex === -1) {
    return false;
  }
  
  this.platforms[platformIndex].status = status;
  
  if (status === 'published') {
    this.platforms[platformIndex].publishedAt = new Date();
  }
  
  Object.assign(this.platforms[platformIndex], additionalData);
  return true;
};

// Instance method to add approval history
contentSchema.methods.addApprovalHistory = function(action, userId, notes = null) {
  this.approval.approvalHistory.push({
    action,
    userId,
    notes
  });
  
  // Update main approval status
  this.approval.status = action === 'submitted' ? 'pending' : action;
  
  if (action === 'approved') {
    this.approval.approvedBy = userId;
    this.approval.approvedAt = new Date();
  } else if (action === 'rejected') {
    this.approval.rejectedBy = userId;
    this.approval.rejectedAt = new Date();
    if (notes) {
      this.approval.rejectionReason = notes;
    }
  }
};

// Instance method to add comment
contentSchema.methods.addComment = function(userId, text) {
  this.collaboration.comments.push({
    userId,
    text
  });
  return this.save();
};

// Instance method to add version
contentSchema.methods.addVersion = function(content, createdBy, changeLog = null) {
  const versionNumber = this.currentVersion + 1;
  
  this.collaboration.versions.push({
    versionNumber,
    content,
    createdBy,
    changeLog
  });
  
  return this.save();
};

// Instance method to update analytics
contentSchema.methods.updateAnalytics = function(platform, analyticsData) {
  // Update overall analytics
  Object.assign(this.analytics, analyticsData);
  
  // Update platform-specific analytics
  const platformAnalytics = this.analytics.platformAnalytics.find(p => p.platform === platform);
  if (platformAnalytics) {
    Object.assign(platformAnalytics, analyticsData);
    platformAnalytics.lastUpdated = new Date();
  } else {
    this.analytics.platformAnalytics.push({
      platform,
      ...analyticsData,
      lastUpdated: new Date()
    });
  }
  
  this.analytics.lastAnalyticsUpdate = new Date();
  return this.save();
};

// Instance method to check if content is ready for publishing
contentSchema.methods.isReadyForPublishing = function() {
  return this.approval.status === 'approved' && 
         this.platforms.some(p => p.status === 'scheduled' || p.status === 'draft');
};

// Instance method to get next scheduled platform
contentSchema.methods.getNextScheduledPlatform = function() {
  const scheduledPlatforms = this.platforms
    .filter(p => p.status === 'scheduled' && p.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  
  return scheduledPlatforms.length > 0 ? scheduledPlatforms[0] : null;
};

// Static method to find content by organization
contentSchema.statics.findByOrganization = function(organizationId, options = {}) {
  const query = { organizationId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email')
    .populate('approval.approvedBy', 'firstName lastName')
    .populate('approval.rejectedBy', 'firstName lastName')
    .sort({ createdAt: -1 });
};

// Static method to find scheduled content
contentSchema.statics.findScheduledContent = function(timeRange = 60) {
  const now = new Date();
  const futureTime = new Date(now.getTime() + timeRange * 60000); // timeRange in minutes
  
  return this.find({
    'platforms.status': 'scheduled',
    'platforms.scheduledAt': {
      $gte: now,
      $lte: futureTime
    }
  });
};

// Static method to find content needing approval
contentSchema.statics.findPendingApproval = function(organizationId) {
  return this.find({
    organizationId,
    'approval.status': 'pending'
  })
  .populate('userId', 'firstName lastName email')
  .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Content', contentSchema);

