const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const User = require('../models/User');
const SocialAccount = require('../models/SocialAccount');
const AIStrategy = require('../models/AIStrategy');
const aiAgentsService = require('../services/aiAgentsService');
const logger = require('../utils/logger');
const { authenticateCustomer } = require('../middleware/auth');

// All routes require customer authentication
router.use(authenticateCustomer);

// Note: Mock data removed - using database storage

const mockPerformance = {
  totalStrategies: 3,
  activeStrategies: 2,
  averageEngagement: 4.4,
  totalReach: 41050,
  averageConversion: 3.7,
  performanceTrend: 'up',
  topPerformingStrategy: 'Audience Targeting Strategy',
  recentImprovements: [
    {
      metric: 'Engagement Rate',
      improvement: '+12%',
      period: 'Last 7 days'
    },
    {
      metric: 'Reach',
      improvement: '+8%',
      period: 'Last 7 days'
    }
  ]
};

const mockLearningInsights = {
  insights: [
    {
      id: '1',
      title: 'Peak Engagement Times',
      description: 'Content posted between 2-4 PM shows 23% higher engagement',
      confidence: 0.87,
      category: 'timing',
      actionable: true
    },
    {
      id: '2',
      title: 'Optimal Content Length',
      description: 'Posts with 150-200 characters perform best for your audience',
      confidence: 0.92,
      category: 'content',
      actionable: true
    },
    {
      id: '3',
      title: 'Hashtag Effectiveness',
      description: 'Using 3-5 hashtags maximizes reach without appearing spammy',
      confidence: 0.78,
      category: 'hashtags',
      actionable: true
    }
  ],
  lastUpdated: '2024-01-20T15:30:00Z'
};

const mockAgentPerformance = {
  agents: [
    {
      id: 'content-agent',
      name: 'Content Optimization Agent',
      status: 'active',
      performance: {
        tasksCompleted: 156,
        successRate: 0.94,
        averageResponseTime: '2.3s',
        lastActive: '2024-01-20T15:25:00Z'
      }
    },
    {
      id: 'analytics-agent',
      name: 'Analytics Agent',
      status: 'active',
      performance: {
        tasksCompleted: 89,
        successRate: 0.91,
        averageResponseTime: '1.8s',
        lastActive: '2024-01-20T15:28:00Z'
      }
    },
    {
      id: 'scheduling-agent',
      name: 'Scheduling Agent',
      status: 'maintenance',
      performance: {
        tasksCompleted: 234,
        successRate: 0.88,
        averageResponseTime: '3.1s',
        lastActive: '2024-01-20T14:45:00Z'
      }
    }
  ],
  overallPerformance: {
    totalTasks: 479,
    averageSuccessRate: 0.91,
    systemUptime: '99.7%'
  }
};

const mockLearningProgress = {
  currentLevel: 3,
  totalLevels: 5,
  progress: 0.68,
  skills: [
    {
      name: 'Content Optimization',
      level: 4,
      progress: 0.85,
      nextMilestone: 'Advanced A/B Testing'
    },
    {
      name: 'Audience Analysis',
      level: 3,
      progress: 0.72,
      nextMilestone: 'Predictive Analytics'
    },
    {
      name: 'Performance Tracking',
      level: 2,
      progress: 0.45,
      nextMilestone: 'Real-time Monitoring'
    }
  ],
  achievements: [
    {
      id: '1',
      title: 'First Optimization',
      description: 'Successfully optimized your first post',
      earnedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Engagement Master',
      description: 'Achieved 5%+ engagement rate for 7 consecutive days',
      earnedAt: '2024-01-18T16:20:00Z'
    }
  ]
};

const mockOptimizationRecommendations = [
  {
    id: '1',
    title: 'Optimize Posting Schedule',
    description: 'Adjust posting times to 2-4 PM for 23% higher engagement',
    priority: 'high',
    estimatedImpact: '+23% engagement',
    effort: 'low',
    category: 'timing'
  },
  {
    id: '2',
    title: 'Improve Content Length',
    description: 'Keep posts between 150-200 characters for better performance',
    priority: 'medium',
    estimatedImpact: '+15% reach',
    effort: 'medium',
    category: 'content'
  },
  {
    id: '3',
    title: 'Enhance Hashtag Strategy',
    description: 'Use 3-5 relevant hashtags per post',
    priority: 'low',
    estimatedImpact: '+8% visibility',
    effort: 'low',
    category: 'hashtags'
  }
];

const mockPerformanceMetrics = {
  engagement: {
    current: 4.4,
    previous: 4.1,
    change: '+7.3%',
    trend: 'up'
  },
  reach: {
    current: 41050,
    previous: 38500,
    change: '+6.6%',
    trend: 'up'
  },
  conversion: {
    current: 3.7,
    previous: 3.4,
    change: '+8.8%',
    trend: 'up'
  },
  aiAccuracy: {
    current: 0.91,
    previous: 0.88,
    change: '+3.4%',
    trend: 'up'
  }
};

// Routes

// @route   POST /api/ai-strategy/generate
// @desc    Generate new AI strategy
// @access  Private
router.post('/generate', async (req, res) => {
  try {
    // No longer require user input - Intelligence Agent will gather data
    const userId = req.user._id;
    const organizationId = req.organization._id;
    
    // Log incoming request data
    logger.info('🚀 API: /api/ai-strategy/generate - AUTONOMOUS REQUEST RECEIVED', {
      endpoint: '/api/ai-strategy/generate',
      method: 'POST',
      userId,
      organizationId,
      message: 'Autonomous strategy generation - Intelligence Agent will gather organization data',
      requestHeaders: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
        'authorization': req.headers['authorization'] ? 'Bearer [REDACTED]' : 'None'
      },
      timestamp: new Date().toISOString()
    });
    
    // Intelligence Agent will gather all data autonomously
    logger.info('🤖 API: /api/ai-strategy/generate - INTELLIGENCE AGENT GATHERING DATA', {
      organizationId,
      userId,
      message: 'Intelligence Agent will gather organization data autonomously',
      timestamp: new Date().toISOString()
    });
    
    // Prepare minimal strategy data for autonomous generation
    const strategyData = {
      type: 'generate_strategy',
      organization_id: organizationId,
      user_id: userId
    };
    
    logger.info('📤 API: /api/ai-strategy/generate - AUTONOMOUS STRATEGY DATA PREPARED', {
      strategyDataKeys: Object.keys(strategyData),
      message: 'Minimal data sent - Intelligence Agent will gather the rest',
      timestamp: new Date().toISOString()
    });
    
    // Call AI agents service for autonomous strategy generation
    logger.info('🤖 API: /api/ai-strategy/generate - CALLING AI AGENTS SERVICE (AUTONOMOUS)', {
      organizationId,
      userId,
      message: 'AI Agents will work autonomously to gather data and create strategy',
      timestamp: new Date().toISOString()
    });
    
    const result = await aiAgentsService.generateStrategy(strategyData, {
      organizationId,
      userId,
      priority: 'high'
    });
    
    logger.info('📥 API: /api/ai-strategy/generate - AI AGENTS SERVICE RESPONSE (AUTONOMOUS)', {
      success: result?.success,
      resultKeys: result ? Object.keys(result) : 'No result',
      confidence: result?.data?.confidence,
      message: 'Strategy generated autonomously by AI Agents',
      timestamp: new Date().toISOString()
    });
    
    if (!result.success) {
      logger.error('❌ API: /api/ai-strategy/generate - AI AGENTS SERVICE FAILED', {
        error: result.message,
        timestamp: new Date().toISOString()
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to generate strategy',
        error: result.message
      });
    }
    
    // Create strategy record in database
    const strategy = new AIStrategy({
      userId,
      organizationId,
      name: result.data?.name || `AI Strategy - ${new Date().toLocaleDateString()}`,
      description: result.data?.description || 'AI-generated strategy',
      status: 'active',
      confidence: result.data?.confidence || 95,
      priority: 'high',
      rawAIResponse: result.data || {},
      strategy: result.data?.strategy || {},
      aiGenerated: true,
      metadata: {
        objectives: result.data?.objectives || [],
        timeframe: result.data?.timeframe || '1 month',
        platforms: result.data?.platforms || [],
        targetAudience: result.data?.context?.targetAudience || '',
        businessGoals: result.data?.context?.businessGoals || [],
        currentChallenges: result.data?.context?.currentChallenges || '',
        generatedAt: new Date(),
        aiAgentUsed: result.data?.aiGenerated ? 'ai_agent' : 'fallback'
      }
    });
    
    await strategy.save();
    
    logger.info('Strategy generated successfully', {
      strategyId: strategy._id,
      userId,
      organizationId
    });
    
    res.status(201).json({
      success: true,
      data: strategy,
      message: 'Strategy generated successfully'
    });
  } catch (error) {
    logger.error('Error generating strategy:', error);
    
    // Check if it's an AI agents service error
    if (error.message.includes('AI agents service is currently unavailable')) {
      res.status(503).json({
        success: false,
        message: 'AI strategy generation service is temporarily unavailable. Please try again later.',
        error: 'Service temporarily unavailable'
      });
    } else {
    res.status(500).json({
      success: false,
        message: 'Failed to generate strategy. Please try again later.',
      error: error.message
    });
    }
  }
});

// @route   GET /api/ai-strategy/strategies
// @desc    Get all AI strategies for the user
// @access  Private
router.get('/strategies', async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;
    const userId = req.user._id;
    const organizationId = req.organization._id;
    
    const query = { userId, organizationId };
    if (status) {
      query.status = status;
    }
    
    const strategies = await AIStrategy.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await AIStrategy.countDocuments(query);
    
    res.json({
      success: true,
      data: strategies,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    logger.error('Error fetching strategies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch strategies',
      error: error.message
    });
  }
});

// @route   GET /api/ai-strategy/:id
// @desc    Get a specific AI strategy
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const organizationId = req.organization._id;
    
    const strategy = await AIStrategy.findOne({ 
      _id: id, 
      userId, 
      organizationId 
    });
    
    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: 'Strategy not found'
      });
    }
    
    res.json({
      success: true,
      data: strategy
    });
  } catch (error) {
    logger.error('Error fetching strategy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch strategy',
      error: error.message
    });
  }
});

// @route   PUT /api/ai-strategy/:id
// @desc    Update an AI strategy
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const organizationId = req.organization._id;
    const updates = req.body;
    
    const strategy = await AIStrategy.findOneAndUpdate(
      { _id: id, userId, organizationId },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: 'Strategy not found'
      });
    }
    
    res.json({
      success: true,
      data: strategy,
      message: 'Strategy updated successfully'
    });
  } catch (error) {
    logger.error('Error updating strategy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update strategy',
      error: error.message
    });
  }
});

// @route   DELETE /api/ai-strategy/:id
// @desc    Delete an AI strategy
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const organizationId = req.organization._id;
    
    const strategy = await AIStrategy.findOneAndDelete({ 
      _id: id, 
      userId, 
      organizationId 
    });
    
    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: 'Strategy not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Strategy deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting strategy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete strategy',
      error: error.message
    });
  }
});

module.exports = router;
