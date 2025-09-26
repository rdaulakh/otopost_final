const mongoose = require('mongoose');

const aiAgentSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: [
      'intelligence_agent',    // Data analysis and insights
      'strategy_agent',        // Content strategy planning
      'content_agent',         // Content creation and optimization
      'execution_agent',       // Publishing and scheduling
      'learning_agent',        // Performance analysis and improvement
      'engagement_agent',      // Community management and responses
      'analytics_agent'        // Advanced reporting and metrics
    ],
    required: true
  },
  description: {
    type: String,
    maxlength: 500,
    default: null
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  
  // Agent Configuration
  configuration: {
    model: {
      type: String,
      enum: ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-2', 'custom'],
      default: 'gpt-4'
    },
    temperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.7
    },
    maxTokens: {
      type: Number,
      min: 1,
      max: 8000,
      default: 2000
    },
    systemPrompt: {
      type: String,
      maxlength: 5000,
      required: true
    },
    customInstructions: {
      type: String,
      maxlength: 2000,
      default: null
    },
    tools: [{
      name: String,
      description: String,
      parameters: mongoose.Schema.Types.Mixed
    }],
    capabilities: [{
      type: String,
      enum: [
        'text_generation', 'image_analysis', 'data_analysis', 'web_search',
        'social_media_posting', 'analytics_reporting', 'content_optimization',
        'trend_analysis', 'sentiment_analysis', 'competitor_analysis'
      ]
    }]
  },
  
  // Organization-Specific Settings
  organizationSpecific: {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null // null means global agent
    },
    isCustomized: {
      type: Boolean,
      default: false
    },
    customPrompts: {
      type: Map,
      of: String,
      default: new Map()
    },
    brandVoice: {
      type: String,
      default: null
    },
    targetAudience: {
      type: String,
      default: null
    },
    businessObjectives: [String],
    industryContext: {
      type: String,
      default: null
    }
  },
  
  // Status and Control
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error', 'training'],
    default: 'active'
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Performance Metrics
  performance: {
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    failedTasks: {
      type: Number,
      default: 0
    },
    averageExecutionTime: {
      type: Number,
      default: 0 // milliseconds
    },
    successRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastExecutionTime: {
      type: Number,
      default: 0
    },
    averageQualityScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    totalTokensUsed: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    }
  },
  
  // Learning and Memory
  memory: {
    vectorStoreId: {
      type: String,
      default: null // Chroma collection ID
    },
    conversationHistory: [{
      timestamp: { type: Date, default: Date.now },
      input: String,
      output: String,
      context: mongoose.Schema.Types.Mixed,
      feedback: {
        rating: { type: Number, min: 1, max: 5 },
        comments: String
      }
    }],
    learnedPatterns: [{
      pattern: String,
      confidence: { type: Number, min: 0, max: 1 },
      usage_count: { type: Number, default: 0 },
      last_used: { type: Date, default: Date.now }
    }],
    preferences: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map()
    },
    knowledgeBase: [{
      topic: String,
      content: String,
      source: String,
      confidence: { type: Number, min: 0, max: 1 },
      last_updated: { type: Date, default: Date.now }
    }]
  },
  
  // Workflow Integration
  workflow: {
    dependencies: [{
      agentType: {
        type: String,
        enum: [
          'intelligence_agent', 'strategy_agent', 'content_agent',
          'execution_agent', 'learning_agent', 'engagement_agent', 'analytics_agent'
        ]
      },
      relationship: {
        type: String,
        enum: ['requires', 'triggers', 'informs', 'collaborates'],
        default: 'requires'
      },
      priority: { type: Number, min: 1, max: 10, default: 5 }
    }],
    triggers: [{
      event: String,
      condition: mongoose.Schema.Types.Mixed,
      action: String
    }],
    schedule: {
      isScheduled: { type: Boolean, default: false },
      cronExpression: String,
      timezone: { type: String, default: 'UTC' },
      nextRun: Date,
      lastRun: Date
    }
  },
  
  // Task Queue and Execution
  taskQueue: [{
    taskId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'content_generation', 'content_optimization', 'analytics_analysis',
        'strategy_planning', 'engagement_response', 'trend_analysis',
        'performance_review', 'competitor_analysis'
      ],
      required: true
    },
    priority: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'queued'
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    error: {
      message: String,
      stack: String,
      code: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    startedAt: Date,
    completedAt: Date,
    executionTime: Number, // milliseconds
    retryCount: {
      type: Number,
      default: 0
    },
    maxRetries: {
      type: Number,
      default: 3
    }
  }],
  
  // Collaboration with Other Agents
  collaboration: {
    communicationLog: [{
      fromAgent: String,
      toAgent: String,
      message: mongoose.Schema.Types.Mixed,
      timestamp: { type: Date, default: Date.now },
      messageType: {
        type: String,
        enum: ['request', 'response', 'notification', 'error'],
        default: 'request'
      }
    }],
    sharedContext: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map()
    },
    activeCollaborations: [{
      agentType: String,
      taskId: String,
      role: {
        type: String,
        enum: ['leader', 'contributor', 'reviewer'],
        default: 'contributor'
      },
      startedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['active', 'completed', 'failed'],
        default: 'active'
      }
    }]
  },
  
  // Quality Control
  qualityControl: {
    outputValidation: {
      enabled: { type: Boolean, default: true },
      rules: [{
        rule: String,
        weight: { type: Number, min: 0, max: 1, default: 1 }
      }]
    },
    humanFeedback: [{
      taskId: String,
      rating: { type: Number, min: 1, max: 5 },
      feedback: String,
      timestamp: { type: Date, default: Date.now },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    qualityMetrics: {
      accuracy: { type: Number, min: 0, max: 100, default: 0 },
      relevance: { type: Number, min: 0, max: 100, default: 0 },
      creativity: { type: Number, min: 0, max: 100, default: 0 },
      consistency: { type: Number, min: 0, max: 100, default: 0 }
    }
  },
  
  // Resource Usage
  resources: {
    cpuUsage: {
      current: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      peak: { type: Number, default: 0 }
    },
    memoryUsage: {
      current: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      peak: { type: Number, default: 0 }
    },
    apiCalls: {
      total: { type: Number, default: 0 },
      successful: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      rateLimited: { type: Number, default: 0 }
    },
    costs: {
      daily: { type: Number, default: 0 },
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }
  },
  
  // Health and Monitoring
  health: {
    status: {
      type: String,
      enum: ['healthy', 'warning', 'critical', 'unknown'],
      default: 'healthy'
    },
    lastHealthCheck: {
      type: Date,
      default: Date.now
    },
    uptime: {
      type: Number,
      default: 0 // seconds
    },
    errorRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    responseTime: {
      current: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      p95: { type: Number, default: 0 }
    },
    alerts: [{
      type: {
        type: String,
        enum: ['error', 'warning', 'info'],
        required: true
      },
      message: String,
      timestamp: { type: Date, default: Date.now },
      resolved: { type: Boolean, default: false },
      resolvedAt: Date
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
aiAgentSchema.index({ type: 1, status: 1 });
aiAgentSchema.index({ 'organizationSpecific.organizationId': 1 });
aiAgentSchema.index({ isEnabled: 1, status: 1 });
aiAgentSchema.index({ 'taskQueue.status': 1, 'taskQueue.priority': -1 });
aiAgentSchema.index({ 'workflow.schedule.nextRun': 1 });
aiAgentSchema.index({ 'health.status': 1 });

// Virtual for current task count
aiAgentSchema.virtual('currentTaskCount').get(function() {
  return this.taskQueue.filter(task => 
    task.status === 'queued' || task.status === 'processing'
  ).length;
});

// Virtual for success rate calculation
aiAgentSchema.virtual('calculatedSuccessRate').get(function() {
  if (this.performance.totalTasks === 0) return 0;
  return (this.performance.completedTasks / this.performance.totalTasks) * 100;
});

// Virtual for average quality score
aiAgentSchema.virtual('averageQuality').get(function() {
  if (this.qualityControl.humanFeedback.length === 0) return 0;
  const total = this.qualityControl.humanFeedback.reduce((sum, feedback) => sum + feedback.rating, 0);
  return total / this.qualityControl.humanFeedback.length;
});

// Instance method to add task to queue
aiAgentSchema.methods.addTask = function(type, input, priority = 5) {
  const taskId = new mongoose.Types.ObjectId().toString();
  
  this.taskQueue.push({
    taskId,
    type,
    input,
    priority
  });
  
  // Sort queue by priority (higher priority first)
  this.taskQueue.sort((a, b) => b.priority - a.priority);
  
  return taskId;
};

// Instance method to update task status
aiAgentSchema.methods.updateTaskStatus = function(taskId, status, output = null, error = null) {
  const task = this.taskQueue.find(t => t.taskId === taskId);
  if (!task) return false;
  
  task.status = status;
  
  if (status === 'processing') {
    task.startedAt = new Date();
  } else if (status === 'completed') {
    task.completedAt = new Date();
    task.output = output;
    if (task.startedAt) {
      task.executionTime = task.completedAt - task.startedAt;
    }
    
    // Update performance metrics
    this.performance.completedTasks += 1;
    this.updatePerformanceMetrics();
  } else if (status === 'failed') {
    task.completedAt = new Date();
    task.error = error;
    this.performance.failedTasks += 1;
    this.updatePerformanceMetrics();
  }
  
  return true;
};

// Instance method to update performance metrics
aiAgentSchema.methods.updatePerformanceMetrics = function() {
  this.performance.totalTasks = this.performance.completedTasks + this.performance.failedTasks;
  
  if (this.performance.totalTasks > 0) {
    this.performance.successRate = (this.performance.completedTasks / this.performance.totalTasks) * 100;
  }
  
  // Calculate average execution time
  const completedTasks = this.taskQueue.filter(t => t.status === 'completed' && t.executionTime);
  if (completedTasks.length > 0) {
    const totalTime = completedTasks.reduce((sum, task) => sum + task.executionTime, 0);
    this.performance.averageExecutionTime = totalTime / completedTasks.length;
  }
};

// Instance method to add to memory
aiAgentSchema.methods.addToMemory = function(input, output, context = {}) {
  this.memory.conversationHistory.push({
    input,
    output,
    context
  });
  
  // Keep only last 100 conversations
  if (this.memory.conversationHistory.length > 100) {
    this.memory.conversationHistory = this.memory.conversationHistory.slice(-100);
  }
  
  return this.save();
};

// Instance method to add learned pattern
aiAgentSchema.methods.addLearnedPattern = function(pattern, confidence = 0.5) {
  const existingPattern = this.memory.learnedPatterns.find(p => p.pattern === pattern);
  
  if (existingPattern) {
    existingPattern.usage_count += 1;
    existingPattern.last_used = new Date();
    existingPattern.confidence = Math.min(existingPattern.confidence + 0.1, 1.0);
  } else {
    this.memory.learnedPatterns.push({
      pattern,
      confidence,
      usage_count: 1
    });
  }
  
  return this.save();
};

// Instance method to communicate with other agents
aiAgentSchema.methods.sendMessage = function(toAgent, message, messageType = 'request') {
  this.collaboration.communicationLog.push({
    fromAgent: this.type,
    toAgent,
    message,
    messageType
  });
  
  // Keep only last 500 messages
  if (this.collaboration.communicationLog.length > 500) {
    this.collaboration.communicationLog = this.collaboration.communicationLog.slice(-500);
  }
  
  return this.save();
};

// Instance method to add human feedback
aiAgentSchema.methods.addFeedback = function(taskId, rating, feedback, userId) {
  this.qualityControl.humanFeedback.push({
    taskId,
    rating,
    feedback,
    userId
  });
  
  // Update quality metrics
  this.updateQualityMetrics();
  
  return this.save();
};

// Instance method to update quality metrics
aiAgentSchema.methods.updateQualityMetrics = function() {
  const feedback = this.qualityControl.humanFeedback;
  if (feedback.length === 0) return;
  
  const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
  this.performance.averageQualityScore = totalRating / feedback.length;
};

// Instance method to update health status
aiAgentSchema.methods.updateHealthStatus = function() {
  const now = new Date();
  this.health.lastHealthCheck = now;
  
  // Calculate error rate
  const recentTasks = this.taskQueue.filter(t => 
    t.createdAt > new Date(now - 24 * 60 * 60 * 1000) // Last 24 hours
  );
  
  if (recentTasks.length > 0) {
    const failedTasks = recentTasks.filter(t => t.status === 'failed').length;
    this.health.errorRate = (failedTasks / recentTasks.length) * 100;
  }
  
  // Determine health status
  if (this.health.errorRate > 50) {
    this.health.status = 'critical';
  } else if (this.health.errorRate > 20) {
    this.health.status = 'warning';
  } else {
    this.health.status = 'healthy';
  }
  
  return this.save();
};

// Instance method to get next task
aiAgentSchema.methods.getNextTask = function() {
  const queuedTasks = this.taskQueue
    .filter(t => t.status === 'queued')
    .sort((a, b) => b.priority - a.priority);
  
  return queuedTasks.length > 0 ? queuedTasks[0] : null;
};

// Static method to find agents by organization
aiAgentSchema.statics.findByOrganization = function(organizationId) {
  return this.find({
    $or: [
      { 'organizationSpecific.organizationId': organizationId },
      { 'organizationSpecific.organizationId': null } // Global agents
    ],
    isEnabled: true,
    status: 'active'
  });
};

// Static method to find agents by type
aiAgentSchema.statics.findByType = function(type) {
  return this.find({ 
    type, 
    isEnabled: true, 
    status: 'active' 
  });
};

// Static method to find agents needing health check
aiAgentSchema.statics.findNeedingHealthCheck = function(minutes = 5) {
  const threshold = new Date(Date.now() - minutes * 60 * 1000);
  return this.find({
    'health.lastHealthCheck': { $lt: threshold },
    isEnabled: true
  });
};

module.exports = mongoose.model('AIAgent', aiAgentSchema);

