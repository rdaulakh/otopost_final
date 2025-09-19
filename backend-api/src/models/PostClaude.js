const mongoose = require('mongoose');

const postClaudeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UserClaude', 
    required: true 
  },
  content: {
    text: {
      type: String,
      required: true,
      maxlength: [2000, 'Content cannot exceed 2000 characters']
    },
    media: [{
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['image', 'video', 'gif'],
        required: true
      },
      thumbnail: String,
      duration: Number, // for videos
      size: Number
    }],
    hashtags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    mentions: [{
      type: String,
      trim: true
    }]
  },
  platforms: [{
    name: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'],
      required: true
    },
    postId: {
      type: String
    },
    status: { 
      type: String, 
      enum: ['scheduled', 'published', 'failed', 'draft'], 
      default: 'draft' 
    },
    scheduledTime: {
      type: Date
    },
    publishedAt: {
      type: Date
    },
    postUrl: {
      type: String
    },
    error: {
      type: String
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft'
  },
  scheduledFor: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  aiGenerated: { 
    type: Boolean, 
    default: false 
  },
  aiPrompt: {
    type: String
  },
  analytics: {
    likes: { 
      type: Number, 
      default: 0 
    },
    comments: { 
      type: Number, 
      default: 0 
    },
    shares: { 
      type: Number, 
      default: 0 
    },
    impressions: { 
      type: Number, 
      default: 0 
    },
    engagement: { 
      type: Number, 
      default: 0 
    },
    clickThroughRate: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Indexes for performance
postClaudeSchema.index({ userId: 1, createdAt: -1 });
postClaudeSchema.index({ status: 1 });
postClaudeSchema.index({ scheduledFor: 1 });
postClaudeSchema.index({ 'platforms.name': 1 });

// Pre-save middleware to update updatedAt
postClaudeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for total engagement
postClaudeSchema.virtual('totalEngagement').get(function() {
  return this.analytics.likes + this.analytics.comments + this.analytics.shares;
});

// Instance method to calculate engagement rate
postClaudeSchema.methods.calculateEngagementRate = function() {
  if (this.analytics.impressions === 0) return 0;
  return (this.totalEngagement / this.analytics.impressions) * 100;
};

module.exports = mongoose.model('PostClaude', postClaudeSchema);
