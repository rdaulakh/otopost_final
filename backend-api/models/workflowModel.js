const mongoose = require('mongoose');

const workflowStepSchema = mongoose.Schema({
  step: {
    type: Number,
    required: true
  },
  agent: {
    type: String,
    required: true,
    enum: ['intelligence', 'strategy', 'content', 'execution', 'learning', 'engagement', 'analytics']
  },
  result: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in milliseconds
    default: 0
  },
  success: {
    type: Boolean,
    default: true
  },
  error: {
    type: String
  }
});

const workflowSchema = mongoose.Schema({
  workflowId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Business'
  },
  type: {
    type: String,
    required: true,
    enum: ['content_generation', 'strategy_generation', 'performance_analysis', 'engagement_optimization']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  steps: [workflowStepSchema],
  input: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  result: {
    type: mongoose.Schema.Types.Mixed
  },
  summary: {
    postsGenerated: Number,
    contentPillars: Number,
    platforms: [String],
    estimatedReach: String,
    nextSteps: [String]
  },
  metrics: {
    totalDuration: Number, // in milliseconds
    agentsUsed: Number,
    stepsCompleted: Number,
    successRate: Number
  },
  error: {
    message: String,
    stack: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
workflowSchema.index({ user: 1, createdAt: -1 });
workflowSchema.index({ business: 1, type: 1 });
workflowSchema.index({ status: 1, createdAt: -1 });

// Virtual for workflow duration
workflowSchema.virtual('duration').get(function() {
  if (this.updatedAt && this.createdAt) {
    return this.updatedAt - this.createdAt;
  }
  return 0;
});

// Method to calculate success rate
workflowSchema.methods.calculateSuccessRate = function() {
  if (this.steps.length === 0) return 0;
  const successfulSteps = this.steps.filter(step => step.success).length;
  return (successfulSteps / this.steps.length) * 100;
};

// Static method to get user workflow stats
workflowSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDuration: { $avg: '$metrics.totalDuration' }
      }
    }
  ]);
  
  return stats;
};

// Static method to get recent workflows
workflowSchema.statics.getRecentWorkflows = async function(userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('business', 'businessName industry')
    .select('workflowId type status summary metrics createdAt updatedAt');
};

module.exports = mongoose.model('Workflow', workflowSchema);
