const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  // Basic Information
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Time Period
  date: {
    type: Date,
    required: true,
    index: true
  },
  period: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  
  // Analytics Type
  type: {
    type: String,
    enum: [
      'content_performance',
      'platform_analytics',
      'audience_insights',
      'engagement_metrics',
      'ai_agent_performance',
      'campaign_analytics',
      'competitor_analysis',
      'trend_analysis',
      'roi_metrics',
      'user_behavior'
    ],
    required: true
  },
  
  // Aggregation Level
  aggregation: {
    type: String,
    enum: ['individual', 'platform', 'campaign', 'organization', 'global'],
    default: 'organization'
  },
  
  // Content Performance Metrics
  contentMetrics: {
    totalPosts: {
      type: Number,
      default: 0
    },
    publishedPosts: {
      type: Number,
      default: 0
    },
    scheduledPosts: {
      type: Number,
      default: 0
    },
    draftPosts: {
      type: Number,
      default: 0
    },
    
    // Engagement Metrics
    totalImpressions: {
      type: Number,
      default: 0
    },
    totalReach: {
      type: Number,
      default: 0
    },
    totalEngagement: {
      type: Number,
      default: 0
    },
    
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      reactions: { type: Number, default: 0 }
    },
    
    // Performance Rates
    engagementRate: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    
    // Content Types Performance
    contentTypePerformance: [{
      type: {
        type: String,
        enum: ['post', 'story', 'reel', 'carousel', 'video', 'live', 'poll', 'article']
      },
      count: { type: Number, default: 0 },
      avgEngagement: { type: Number, default: 0 },
      avgReach: { type: Number, default: 0 },
      avgImpressions: { type: Number, default: 0 }
    }]
  },
  
  // Platform-Specific Analytics
  platformMetrics: [{
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest'],
      required: true
    },
    
    // Basic Metrics
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    posts: { type: Number, default: 0 },
    
    // Engagement Metrics
    impressions: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 }
    },
    
    // Growth Metrics
    followerGrowth: { type: Number, default: 0 },
    engagementGrowth: { type: Number, default: 0 },
    reachGrowth: { type: Number, default: 0 },
    
    // Platform-Specific Metrics
    platformSpecific: {
      // Instagram specific
      storyViews: { type: Number, default: 0 },
      reelPlays: { type: Number, default: 0 },
      profileVisits: { type: Number, default: 0 },
      
      // Twitter specific
      retweets: { type: Number, default: 0 },
      mentions: { type: Number, default: 0 },
      hashtagPerformance: [{ hashtag: String, usage: Number }],
      
      // LinkedIn specific
      companyPageViews: { type: Number, default: 0 },
      uniqueVisitors: { type: Number, default: 0 },
      
      // TikTok specific
      videoViews: { type: Number, default: 0 },
      videoShares: { type: Number, default: 0 },
      
      // YouTube specific
      watchTime: { type: Number, default: 0 },
      subscribers: { type: Number, default: 0 },
      views: { type: Number, default: 0 }
    },
    
    // Top Performing Content
    topContent: [{
      contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
      },
      title: String,
      engagement: Number,
      reach: Number,
      impressions: Number
    }]
  }],
  
  // Audience Insights
  audienceInsights: {
    demographics: {
      ageGroups: [{
        range: String, // e.g., "18-24", "25-34"
        percentage: Number,
        count: Number
      }],
      gender: {
        male: { type: Number, default: 0 },
        female: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
      },
      locations: [{
        country: String,
        city: String,
        percentage: Number,
        count: Number
      }],
      languages: [{
        language: String,
        percentage: Number,
        count: Number
      }]
    },
    
    behavior: {
      activeHours: [{
        hour: Number, // 0-23
        engagement: Number
      }],
      activeDays: [{
        day: Number, // 0-6, Sunday = 0
        engagement: Number
      }],
      deviceTypes: [{
        device: String, // mobile, desktop, tablet
        percentage: Number
      }],
      averageSessionDuration: Number,
      bounceRate: Number
    },
    
    interests: [{
      category: String,
      percentage: Number,
      engagement: Number
    }],
    
    growth: {
      newFollowers: { type: Number, default: 0 },
      unfollowers: { type: Number, default: 0 },
      netGrowth: { type: Number, default: 0 },
      growthRate: { type: Number, default: 0 }
    }
  },
  
  // AI Agent Performance
  aiAgentMetrics: {
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    failedTasks: { type: Number, default: 0 },
    averageExecutionTime: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    
    agentPerformance: [{
      agentType: {
        type: String,
        enum: [
          'intelligence_agent', 'strategy_agent', 'content_agent',
          'execution_agent', 'learning_agent', 'engagement_agent', 'analytics_agent'
        ]
      },
      tasksCompleted: { type: Number, default: 0 },
      averageQuality: { type: Number, default: 0 },
      executionTime: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      cost: { type: Number, default: 0 }
    }],
    
    contentGenerated: {
      total: { type: Number, default: 0 },
      approved: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
      averageQuality: { type: Number, default: 0 }
    },
    
    costMetrics: {
      totalCost: { type: Number, default: 0 },
      costPerTask: { type: Number, default: 0 },
      costPerContent: { type: Number, default: 0 },
      tokenUsage: { type: Number, default: 0 }
    }
  },
  
  // Campaign Analytics
  campaignMetrics: [{
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    campaignName: String,
    objective: String,
    
    performance: {
      impressions: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
      engagement: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },
    
    roi: {
      spend: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      roi: { type: Number, default: 0 },
      roas: { type: Number, default: 0 } // Return on Ad Spend
    },
    
    timeline: [{
      date: Date,
      impressions: Number,
      engagement: Number,
      spend: Number
    }]
  }],
  
  // Competitor Analysis
  competitorMetrics: [{
    competitorName: String,
    platform: String,
    
    metrics: {
      followers: Number,
      engagement: Number,
      postsPerDay: Number,
      averageEngagementRate: Number
    },
    
    contentAnalysis: {
      topContentTypes: [String],
      postingFrequency: String,
      hashtagUsage: [String],
      engagementPatterns: mongoose.Schema.Types.Mixed
    },
    
    comparison: {
      followerDifference: Number,
      engagementDifference: Number,
      contentGap: [String]
    }
  }],
  
  // Trend Analysis
  trendMetrics: {
    hashtags: [{
      hashtag: String,
      usage: Number,
      growth: Number,
      engagement: Number
    }],
    
    topics: [{
      topic: String,
      mentions: Number,
      sentiment: Number, // -1 to 1
      growth: Number
    }],
    
    contentTrends: [{
      type: String,
      popularity: Number,
      growth: Number,
      platforms: [String]
    }],
    
    seasonality: [{
      period: String,
      metric: String,
      value: Number,
      change: Number
    }]
  },
  
  // ROI and Business Metrics
  businessMetrics: {
    revenue: {
      total: { type: Number, default: 0 },
      attributed: { type: Number, default: 0 },
      organic: { type: Number, default: 0 },
      paid: { type: Number, default: 0 }
    },
    
    costs: {
      total: { type: Number, default: 0 },
      content: { type: Number, default: 0 },
      advertising: { type: Number, default: 0 },
      tools: { type: Number, default: 0 },
      ai: { type: Number, default: 0 }
    },
    
    leads: {
      total: { type: Number, default: 0 },
      qualified: { type: Number, default: 0 },
      converted: { type: Number, default: 0 },
      costPerLead: { type: Number, default: 0 }
    },
    
    conversions: {
      total: { type: Number, default: 0 },
      rate: { type: Number, default: 0 },
      value: { type: Number, default: 0 },
      costPerConversion: { type: Number, default: 0 }
    },
    
    roi: {
      overall: { type: Number, default: 0 },
      organic: { type: Number, default: 0 },
      paid: { type: Number, default: 0 },
      content: { type: Number, default: 0 }
    }
  },
  
  // User Behavior Analytics
  userBehavior: {
    sessions: {
      total: { type: Number, default: 0 },
      unique: { type: Number, default: 0 },
      averageDuration: { type: Number, default: 0 },
      bounceRate: { type: Number, default: 0 }
    },
    
    pageViews: {
      total: { type: Number, default: 0 },
      unique: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 }
    },
    
    interactions: {
      clicks: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 },
      formSubmissions: { type: Number, default: 0 },
      emailSignups: { type: Number, default: 0 }
    },
    
    traffic: {
      organic: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      direct: { type: Number, default: 0 },
      referral: { type: Number, default: 0 },
      paid: { type: Number, default: 0 }
    }
  },
  
  // Custom Metrics
  customMetrics: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  
  // Data Sources and Metadata
  dataSources: [{
    source: String,
    lastUpdated: Date,
    status: {
      type: String,
      enum: ['active', 'error', 'syncing'],
      default: 'active'
    },
    error: String
  }],
  
  // Calculation Metadata
  calculationMetadata: {
    calculatedAt: {
      type: Date,
      default: Date.now
    },
    calculationDuration: Number, // milliseconds
    dataPoints: Number,
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    version: {
      type: String,
      default: '1.0'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
analyticsSchema.index({ organizationId: 1, date: -1 });
analyticsSchema.index({ type: 1, date: -1 });
analyticsSchema.index({ aggregation: 1, date: -1 });
analyticsSchema.index({ period: 1, date: -1 });
analyticsSchema.index({ 'platformMetrics.platform': 1 });

// Virtual for total engagement across all platforms
analyticsSchema.virtual('totalPlatformEngagement').get(function() {
  return this.platformMetrics.reduce((total, platform) => {
    const engagement = platform.engagement;
    return total + engagement.likes + engagement.comments + engagement.shares + engagement.saves + engagement.clicks;
  }, 0);
});

// Virtual for average engagement rate
analyticsSchema.virtual('averageEngagementRate').get(function() {
  if (this.contentMetrics.totalReach === 0) return 0;
  return (this.contentMetrics.totalEngagement / this.contentMetrics.totalReach) * 100;
});

// Virtual for ROI calculation
analyticsSchema.virtual('calculatedROI').get(function() {
  if (this.businessMetrics.costs.total === 0) return 0;
  return ((this.businessMetrics.revenue.total - this.businessMetrics.costs.total) / this.businessMetrics.costs.total) * 100;
});

// Instance method to add platform metrics
analyticsSchema.methods.addPlatformMetrics = function(platform, metrics) {
  const existingPlatform = this.platformMetrics.find(p => p.platform === platform);
  
  if (existingPlatform) {
    Object.assign(existingPlatform, metrics);
  } else {
    this.platformMetrics.push({ platform, ...metrics });
  }
  
  return this.save();
};

// Instance method to update content metrics
analyticsSchema.methods.updateContentMetrics = function(metrics) {
  Object.assign(this.contentMetrics, metrics);
  
  // Recalculate engagement rate
  if (this.contentMetrics.totalReach > 0) {
    this.contentMetrics.engagementRate = (this.contentMetrics.totalEngagement / this.contentMetrics.totalReach) * 100;
  }
  
  return this.save();
};

// Instance method to add AI agent performance
analyticsSchema.methods.updateAIAgentMetrics = function(agentType, metrics) {
  const existingAgent = this.aiAgentMetrics.agentPerformance.find(a => a.agentType === agentType);
  
  if (existingAgent) {
    Object.assign(existingAgent, metrics);
  } else {
    this.aiAgentMetrics.agentPerformance.push({ agentType, ...metrics });
  }
  
  // Update overall AI metrics
  this.aiAgentMetrics.totalTasks = this.aiAgentMetrics.agentPerformance.reduce((sum, agent) => sum + agent.tasksCompleted, 0);
  this.aiAgentMetrics.completedTasks = this.aiAgentMetrics.totalTasks;
  
  if (this.aiAgentMetrics.totalTasks > 0) {
    this.aiAgentMetrics.successRate = (this.aiAgentMetrics.completedTasks / this.aiAgentMetrics.totalTasks) * 100;
  }
  
  return this.save();
};

// Instance method to add campaign metrics
analyticsSchema.methods.addCampaignMetrics = function(campaignId, campaignName, metrics) {
  const existingCampaign = this.campaignMetrics.find(c => c.campaignId.toString() === campaignId.toString());
  
  if (existingCampaign) {
    Object.assign(existingCampaign, metrics);
  } else {
    this.campaignMetrics.push({ campaignId, campaignName, ...metrics });
  }
  
  return this.save();
};

// Instance method to update business metrics
analyticsSchema.methods.updateBusinessMetrics = function(metrics) {
  Object.assign(this.businessMetrics, metrics);
  
  // Recalculate ROI
  if (this.businessMetrics.costs.total > 0) {
    this.businessMetrics.roi.overall = ((this.businessMetrics.revenue.total - this.businessMetrics.costs.total) / this.businessMetrics.costs.total) * 100;
  }
  
  return this.save();
};

// Instance method to add competitor data
analyticsSchema.methods.addCompetitorMetrics = function(competitorName, platform, metrics) {
  const existingCompetitor = this.competitorMetrics.find(c => c.competitorName === competitorName && c.platform === platform);
  
  if (existingCompetitor) {
    Object.assign(existingCompetitor, metrics);
  } else {
    this.competitorMetrics.push({ competitorName, platform, ...metrics });
  }
  
  return this.save();
};

// Instance method to update trend metrics
analyticsSchema.methods.updateTrendMetrics = function(trends) {
  Object.assign(this.trendMetrics, trends);
  return this.save();
};

// Static method to find analytics by organization and period
analyticsSchema.statics.findByOrganizationAndPeriod = function(organizationId, startDate, endDate, type = null) {
  const query = {
    organizationId,
    date: { $gte: startDate, $lte: endDate }
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query).sort({ date: -1 });
};

// Static method to get latest analytics for organization
analyticsSchema.statics.getLatestForOrganization = function(organizationId, type = null) {
  const query = { organizationId };
  
  if (type) {
    query.type = type;
  }
  
  return this.findOne(query).sort({ date: -1 });
};

// Static method to aggregate analytics by period
analyticsSchema.statics.aggregateByPeriod = function(organizationId, period, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        organizationId: new mongoose.Types.ObjectId(organizationId),
        period,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        },
        totalImpressions: { $sum: '$contentMetrics.totalImpressions' },
        totalReach: { $sum: '$contentMetrics.totalReach' },
        totalEngagement: { $sum: '$contentMetrics.totalEngagement' },
        totalPosts: { $sum: '$contentMetrics.totalPosts' },
        avgEngagementRate: { $avg: '$contentMetrics.engagementRate' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
  ]);
};

// Static method to get top performing content
analyticsSchema.statics.getTopPerformingContent = function(organizationId, limit = 10) {
  return this.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
    { $unwind: '$platformMetrics' },
    { $unwind: '$platformMetrics.topContent' },
    { $sort: { 'platformMetrics.topContent.engagement': -1 } },
    { $limit: limit },
    {
      $project: {
        contentId: '$platformMetrics.topContent.contentId',
        title: '$platformMetrics.topContent.title',
        engagement: '$platformMetrics.topContent.engagement',
        reach: '$platformMetrics.topContent.reach',
        platform: '$platformMetrics.platform'
      }
    }
  ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema);

