const mongoose = require('mongoose');

const aiStrategySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // User and Organization Association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  
  // Strategy Status and Metadata
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'archived'],
    default: 'draft',
    index: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // AI Generation Details
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiProvider: {
    type: String,
    enum: ['openai', 'anthropic', 'custom', 'hybrid', 'ai-agents'],
    default: 'openai'
  },
  rawAIResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Strategy Configuration
  objectives: [{
    goal: {
      type: String,
      required: true,
      trim: true
    },
    target: {
      type: Number,
      default: 0
    },
    timeline: {
      type: String,
      default: '30d'
    },
    metrics: [{
      type: String,
      enum: ['engagement', 'reach', 'followers', 'conversions', 'website_traffic', 'brand_mentions', 'impressions', 'clicks', 'shares', 'comments', 'likes']
    }],
    status: {
      type: String,
      enum: ['planned', 'active', 'completed', 'paused'],
      default: 'planned'
    }
  }],
  
  // Timeframe and Duration
  timeframe: {
    type: String,
    required: true,
    enum: ['7d', '30d', '90d', '180d', '365d'],
    default: '30d'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  
  // Platform Configuration
  platforms: [{
    type: String,
    enum: ['instagram', 'linkedin', 'twitter', 'facebook', 'youtube', 'tiktok', 'pinterest']
  }],
  
  // Target Audience
  targetAudience: {
    type: String,
    trim: true,
    maxlength: 500
  },
  businessGoals: {
    type: String,
    trim: true,
    maxlength: 500
  },
  currentChallenges: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Strategy Content
  strategy: {
    monthlyTheme: {
      type: String,
      trim: true
    },
    focus: {
      type: String,
      trim: true
    },
    weeklyPlans: [{
      week: {
        type: Number,
        required: true
      },
      theme: {
        type: String,
        required: true,
        trim: true
      },
      focus: {
        type: String,
        required: true,
        trim: true
      },
      contentTypes: [{
        type: String,
        enum: ['video', 'image', 'text', 'carousel', 'story', 'reel', 'poll', 'question', 'interactive']
      }],
      platforms: [{
        type: String,
        enum: ['instagram', 'linkedin', 'twitter', 'facebook', 'youtube', 'tiktok', 'pinterest']
      }],
      postFrequency: {
        type: Number,
        default: 5
      },
      keyMessages: [{
        type: String,
        trim: true
      }]
    }],
    platformStrategies: [{
      platform: {
        type: String,
        required: true,
        enum: ['instagram', 'linkedin', 'twitter', 'facebook', 'youtube', 'tiktok', 'pinterest']
      },
      focus: {
        type: String,
        required: true,
        trim: true
      },
      contentMix: {
        video: {
          type: Number,
          min: 0,
          max: 100,
          default: 0
        },
        image: {
          type: Number,
          min: 0,
          max: 100,
          default: 0
        },
        text: {
          type: Number,
          min: 0,
          max: 100,
          default: 0
        },
        interactive: {
          type: Number,
          min: 0,
          max: 100,
          default: 0
        }
      },
      postingFrequency: {
        type: String,
        enum: ['daily', '3-times-week', 'weekly', 'bi-weekly', 'monthly'],
        default: 'daily'
      },
      keyHashtags: [{
        type: String,
        trim: true
      }],
      engagementTactics: [{
        type: String,
        trim: true
      }]
    }],
    contentMix: {
      video: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      image: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      text: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      interactive: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    },
    kpis: {
      engagementRate: {
        target: {
          type: Number,
          default: 0
        },
        current: {
          type: Number,
          default: 0
        },
        unit: {
          type: String,
          default: '%'
        }
      },
      reach: {
        target: {
          type: Number,
          default: 0
        },
        current: {
          type: Number,
          default: 0
        },
        unit: {
          type: String,
          default: 'people'
        }
      },
      followers: {
        target: {
          type: Number,
          default: 0
        },
        current: {
          type: Number,
          default: 0
        },
        unit: {
          type: String,
          default: 'followers'
        }
      },
      websiteTraffic: {
        target: {
          type: Number,
          default: 0
        },
        current: {
          type: Number,
          default: 0
        },
        unit: {
          type: String,
          default: '% increase'
        }
      },
      leadGeneration: {
        target: {
          type: Number,
          default: 0
        },
        current: {
          type: Number,
          default: 0
        },
        unit: {
          type: String,
          default: 'leads/month'
        }
      },
      brandMentions: {
        target: {
          type: Number,
          default: 0
        },
        current: {
          type: Number,
          default: 0
        },
        unit: {
          type: String,
          default: 'mentions/month'
        }
      }
    },
    nextSteps: [{
      type: String,
      trim: true
    }]
  },
  
  // Performance Metrics
  performance: {
    engagement_rate: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    },
    conversion_rate: {
      type: Number,
      default: 0
    },
    followers_growth: {
      type: Number,
      default: 0
    },
    website_traffic: {
      type: Number,
      default: 0
    }
  },
  
  // Context and Metadata
  context: {
    organization: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      trim: true
    },
    businessType: {
      type: String,
      trim: true
    },
    targetAudience: {
      type: String,
      trim: true
    },
    platforms: [{
      type: String,
      enum: ['instagram', 'linkedin', 'twitter', 'facebook', 'youtube', 'tiktok', 'pinterest']
    }]
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastExecutedAt: {
    type: Date
  },
  lastAnalyzedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
aiStrategySchema.index({ userId: 1, status: 1 });
aiStrategySchema.index({ organizationId: 1, status: 1 });
aiStrategySchema.index({ createdAt: -1 });
aiStrategySchema.index({ aiGenerated: 1, status: 1 });

// Virtual for strategy duration
aiStrategySchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for progress percentage
aiStrategySchema.virtual('progressPercentage').get(function() {
  if (!this.objectives || this.objectives.length === 0) return 0;
  
  const completedObjectives = this.objectives.filter(obj => obj.status === 'completed').length;
  return Math.round((completedObjectives / this.objectives.length) * 100);
});

// Pre-save middleware to update endDate based on timeframe
aiStrategySchema.pre('save', function(next) {
  if (this.isModified('timeframe') || this.isModified('startDate')) {
    const timeframeDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '180d': 180,
      '365d': 365
    };
    
    const days = timeframeDays[this.timeframe] || 30;
    this.endDate = new Date(this.startDate.getTime() + (days * 24 * 60 * 60 * 1000));
  }
  
  this.updatedAt = new Date();
  next();
});

// Instance methods
aiStrategySchema.methods.updatePerformance = function(metrics) {
  this.performance = { ...this.performance, ...metrics };
  this.lastAnalyzedAt = new Date();
  return this.save();
};

aiStrategySchema.methods.markAsExecuted = function() {
  this.lastExecutedAt = new Date();
  return this.save();
};

aiStrategySchema.methods.isActive = function() {
  return this.status === 'active' && 
         this.startDate <= new Date() && 
         (!this.endDate || this.endDate >= new Date());
};

// Static methods
aiStrategySchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.platform) {
    query.platforms = options.platform;
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email')
    .populate('organizationId', 'name')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.offset || 0);
};

aiStrategySchema.statics.findByOrganization = function(organizationId, options = {}) {
  const query = { organizationId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.offset || 0);
};

module.exports = mongoose.model('AIStrategy', aiStrategySchema);

