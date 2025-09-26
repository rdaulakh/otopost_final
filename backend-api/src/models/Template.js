const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: [
      'promotional',
      'educational',
      'entertainment',
      'news',
      'announcement',
      'question',
      'poll',
      'story',
      'behind_scenes',
      'user_generated',
      'seasonal',
      'trending',
      'custom'
    ],
    index: true
  },
  platforms: [{
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'snapchat'],
    required: true
  }],
  content: {
    text: {
      type: String,
      required: true,
      maxlength: 2000
    },
    hashtags: [{
      type: String,
      maxlength: 50
    }],
    mentions: [{
      type: String,
      maxlength: 50
    }],
    callToAction: {
      type: String,
      maxlength: 100
    },
    link: {
      type: String,
      maxlength: 500
    }
  },
  media: {
    images: [{
      url: String,
      alt: String,
      caption: String,
      order: Number
    }],
    videos: [{
      url: String,
      thumbnail: String,
      duration: Number,
      caption: String,
      order: Number
    }],
    gifs: [{
      url: String,
      alt: String,
      order: Number
    }]
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'url', 'hashtag', 'mention'],
      required: true
    },
    defaultValue: String,
    required: {
      type: Boolean,
      default: false
    },
    description: String
  }],
  aiSettings: {
    useAI: {
      type: Boolean,
      default: false
    },
    aiPrompt: String,
    aiModel: {
      type: String,
      enum: ['gpt-3.5-turbo', 'gpt-4', 'claude-3', 'gemini-pro'],
      default: 'gpt-3.5-turbo'
    },
    aiTemperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.7
    }
  },
  scheduling: {
    optimalTimes: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      time: String,
      timezone: String
    }],
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom'],
      default: 'weekly'
    },
    customFrequency: String
  },
  performance: {
    usageCount: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
    },
    avgEngagement: {
      type: Number,
      default: 0
    },
    avgReach: {
      type: Number,
      default: 0
    },
    avgClicks: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    maxlength: 30
  }],
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  version: {
    type: Number,
    default: 1
  },
  parentTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  metadata: {
    createdBy: {
      type: String,
      default: 'user'
    },
    source: {
      type: String,
      enum: ['manual', 'ai_generated', 'imported', 'duplicated'],
      default: 'manual'
    },
    originalTemplate: mongoose.Schema.Types.ObjectId,
    industry: String,
    targetAudience: String,
    brandVoice: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
templateSchema.index({ user: 1, category: 1, isActive: 1 });
templateSchema.index({ organization: 1, isPublic: 1, isActive: 1 });
templateSchema.index({ platforms: 1, category: 1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ 'performance.usageCount': -1 });
templateSchema.index({ createdAt: -1 });

// Virtual for template preview
templateSchema.virtual('preview').get(function() {
  return {
    id: this._id,
    name: this.name,
    category: this.category,
    platforms: this.platforms,
    text: this.content.text.substring(0, 100) + (this.content.text.length > 100 ? '...' : ''),
    hashtags: this.content.hashtags.slice(0, 3),
    usageCount: this.performance.usageCount,
    lastUsed: this.performance.lastUsed
  };
});

// Virtual for template variables count
templateSchema.virtual('variablesCount').get(function() {
  return this.variables.length;
});

// Static method to create template
templateSchema.statics.createTemplate = async function(templateData) {
  try {
    const template = new this(templateData);
    await template.save();
    return template;
  } catch (error) {
    throw new Error(`Failed to create template: ${error.message}`);
  }
};

// Static method to get user templates
templateSchema.statics.getUserTemplates = async function(userId, options = {}) {
  const {
    category,
    platforms,
    tags,
    isPublic = false,
    isActive = true,
    isArchived = false,
    search,
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;

  const query = { user: userId };
  
  if (category) query.category = category;
  if (platforms && platforms.length > 0) query.platforms = { $in: platforms };
  if (tags && tags.length > 0) query.tags = { $in: tags };
  if (isPublic !== null) query.isPublic = isPublic;
  if (isActive !== null) query.isActive = isActive;
  if (isArchived !== null) query.isArchived = isArchived;
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'content.text': { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder;

  return await this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('user', 'username email firstName lastName')
    .populate('organization', 'name');
};

// Static method to get public templates
templateSchema.statics.getPublicTemplates = async function(options = {}) {
  const {
    category,
    platforms,
    tags,
    search,
    limit = 20,
    skip = 0,
    sortBy = 'performance.usageCount',
    sortOrder = -1
  } = options;

  const query = { isPublic: true, isActive: true, isArchived: false };
  
  if (category) query.category = category;
  if (platforms && platforms.length > 0) query.platforms = { $in: platforms };
  if (tags && tags.length > 0) query.tags = { $in: tags };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'content.text': { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder;

  return await this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('user', 'username email firstName lastName')
    .populate('organization', 'name');
};

// Static method to duplicate template
templateSchema.statics.duplicateTemplate = async function(templateId, userId, organizationId) {
  const originalTemplate = await this.findById(templateId);
  if (!originalTemplate) {
    throw new Error('Template not found');
  }

  const duplicatedTemplate = new this({
    ...originalTemplate.toObject(),
    _id: undefined,
    user: userId,
    organization: organizationId,
    name: `${originalTemplate.name} (Copy)`,
    isPublic: false,
    performance: {
      usageCount: 0,
      avgEngagement: 0,
      avgReach: 0,
      avgClicks: 0,
      successRate: 0
    },
    metadata: {
      ...originalTemplate.metadata,
      source: 'duplicated',
      originalTemplate: templateId
    },
    version: 1
  });

  await duplicatedTemplate.save();
  return duplicatedTemplate;
};

// Instance method to use template
templateSchema.methods.useTemplate = function(variables = {}) {
  let content = { ...this.content };
  
  // Replace variables in text
  if (this.variables.length > 0) {
    this.variables.forEach(variable => {
      const value = variables[variable.name] || variable.defaultValue || `{${variable.name}}`;
      const regex = new RegExp(`{${variable.name}}`, 'g');
      content.text = content.text.replace(regex, value);
    });
  }

  // Replace variables in hashtags
  if (content.hashtags) {
    content.hashtags = content.hashtags.map(hashtag => {
      this.variables.forEach(variable => {
        const value = variables[variable.name] || variable.defaultValue || `{${variable.name}}`;
        const regex = new RegExp(`{${variable.name}}`, 'g');
        hashtag = hashtag.replace(regex, value);
      });
      return hashtag;
    });
  }

  return content;
};

// Instance method to update performance
templateSchema.methods.updatePerformance = function(metrics) {
  this.performance.usageCount += 1;
  this.performance.lastUsed = new Date();
  
  if (metrics.engagement) {
    this.performance.avgEngagement = 
      (this.performance.avgEngagement * (this.performance.usageCount - 1) + metrics.engagement) / 
      this.performance.usageCount;
  }
  
  if (metrics.reach) {
    this.performance.avgReach = 
      (this.performance.avgReach * (this.performance.usageCount - 1) + metrics.reach) / 
      this.performance.usageCount;
  }
  
  if (metrics.clicks) {
    this.performance.avgClicks = 
      (this.performance.avgClicks * (this.performance.usageCount - 1) + metrics.clicks) / 
      this.performance.usageCount;
  }

  return this.save();
};

// Instance method to archive
templateSchema.methods.archive = function() {
  this.isArchived = true;
  this.isActive = false;
  return this.save();
};

// Instance method to restore
templateSchema.methods.restore = function() {
  this.isArchived = false;
  this.isActive = true;
  return this.save();
};

module.exports = mongoose.model('Template', templateSchema);

