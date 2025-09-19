const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for customer dashboard endpoints
const customerDashboardRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per minute
  message: 'Too many dashboard requests from this IP'
});

router.use(customerDashboardRateLimit);
router.use(auth);

// Generate mock customer dashboard data
const generateCustomerDashboardData = (userId, timeRange = '7d') => {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  
  // Generate time series data for analytics
  const analyticsData = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    
    return {
      date: date.toISOString().split('T')[0],
      engagement: Math.floor(Math.random() * 1000) + 500,
      reach: Math.floor(Math.random() * 5000) + 2000,
      impressions: Math.floor(Math.random() * 10000) + 5000,
      clicks: Math.floor(Math.random() * 500) + 200,
      shares: Math.floor(Math.random() * 100) + 50,
      comments: Math.floor(Math.random() * 200) + 100,
      likes: Math.floor(Math.random() * 800) + 400,
      followers: Math.floor(Math.random() * 50) + 25,
      posts: Math.floor(Math.random() * 10) + 3
    };
  });

  // Calculate current vs previous period
  const currentPeriod = analyticsData.slice(-Math.floor(days/2));
  const previousPeriod = analyticsData.slice(0, Math.floor(days/2));
  
  const currentEngagement = currentPeriod.reduce((sum, day) => sum + day.engagement, 0);
  const previousEngagement = previousPeriod.reduce((sum, day) => sum + day.engagement, 0);
  const engagementChange = ((currentEngagement - previousEngagement) / previousEngagement) * 100;
  
  const currentReach = currentPeriod.reduce((sum, day) => sum + day.reach, 0);
  const previousReach = previousPeriod.reduce((sum, day) => sum + day.reach, 0);
  const reachChange = ((currentReach - previousReach) / previousReach) * 100;

  return {
    // Overview metrics
    overview: {
      totalEngagement: currentEngagement,
      engagementChange: Math.round(engagementChange * 100) / 100,
      totalReach: currentReach,
      reachChange: Math.round(reachChange * 100) / 100,
      totalImpressions: currentPeriod.reduce((sum, day) => sum + day.impressions, 0),
      totalClicks: currentPeriod.reduce((sum, day) => sum + day.clicks, 0),
      totalFollowers: Math.floor(Math.random() * 10000) + 5000,
      followerGrowth: (Math.random() - 0.3) * 20,
      engagementRate: Math.random() * 8 + 2,
      clickThroughRate: Math.random() * 5 + 1
    },
    
    // Time series data
    timeSeriesData: analyticsData,
    
    // Platform breakdown
    platformMetrics: [
      {
        platform: 'Instagram',
        followers: Math.floor(Math.random() * 5000) + 2000,
        engagement: Math.floor(Math.random() * 500) + 200,
        posts: Math.floor(Math.random() * 20) + 10,
        growth: (Math.random() - 0.2) * 30,
        color: '#E4405F',
        status: 'connected'
      },
      {
        platform: 'Facebook',
        followers: Math.floor(Math.random() * 3000) + 1500,
        engagement: Math.floor(Math.random() * 300) + 150,
        posts: Math.floor(Math.random() * 15) + 8,
        growth: (Math.random() - 0.3) * 25,
        color: '#1877F2',
        status: 'connected'
      },
      {
        platform: 'LinkedIn',
        followers: Math.floor(Math.random() * 2000) + 1000,
        engagement: Math.floor(Math.random() * 400) + 200,
        posts: Math.floor(Math.random() * 12) + 6,
        growth: (Math.random() - 0.1) * 35,
        color: '#0A66C2',
        status: 'connected'
      },
      {
        platform: 'Twitter',
        followers: Math.floor(Math.random() * 4000) + 2000,
        engagement: Math.floor(Math.random() * 350) + 175,
        posts: Math.floor(Math.random() * 25) + 15,
        growth: (Math.random() - 0.4) * 20,
        color: '#1DA1F2',
        status: 'connected'
      }
    ],
    
    // Recent content performance
    recentContent: Array.from({ length: 10 }, (_, i) => ({
      id: `content_${i + 1}`,
      title: `Social Media Post ${i + 1}`,
      platform: ['Instagram', 'Facebook', 'LinkedIn', 'Twitter'][Math.floor(Math.random() * 4)],
      type: ['image', 'video', 'carousel', 'text'][Math.floor(Math.random() * 4)],
      status: ['published', 'scheduled', 'draft'][Math.floor(Math.random() * 3)],
      engagement: Math.floor(Math.random() * 1000) + 100,
      reach: Math.floor(Math.random() * 5000) + 500,
      likes: Math.floor(Math.random() * 500) + 50,
      comments: Math.floor(Math.random() * 100) + 10,
      shares: Math.floor(Math.random() * 50) + 5,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      published_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })),
    
    // AI agents status
    aiAgents: [
      {
        id: 'content_creator',
        name: 'Content Creator',
        type: 'content_generation',
        status: 'active',
        performance: Math.random() * 30 + 70, // 70-100%
        tasksCompleted: Math.floor(Math.random() * 100) + 50,
        lastActivity: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
        metrics: {
          postsGenerated: Math.floor(Math.random() * 50) + 20,
          engagementRate: Math.random() * 8 + 4,
          approvalRate: Math.random() * 20 + 80
        }
      },
      {
        id: 'engagement_optimizer',
        name: 'Engagement Optimizer',
        type: 'optimization',
        status: 'active',
        performance: Math.random() * 25 + 75,
        tasksCompleted: Math.floor(Math.random() * 80) + 40,
        lastActivity: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
        metrics: {
          optimizationsApplied: Math.floor(Math.random() * 30) + 15,
          performanceImprovement: Math.random() * 20 + 10,
          successRate: Math.random() * 15 + 85
        }
      },
      {
        id: 'analytics_assistant',
        name: 'Analytics Assistant',
        type: 'analytics',
        status: 'active',
        performance: Math.random() * 20 + 80,
        tasksCompleted: Math.floor(Math.random() * 60) + 30,
        lastActivity: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(),
        metrics: {
          reportsGenerated: Math.floor(Math.random() * 20) + 10,
          insightsProvided: Math.floor(Math.random() * 40) + 20,
          accuracyRate: Math.random() * 10 + 90
        }
      },
      {
        id: 'scheduler',
        name: 'Smart Scheduler',
        type: 'scheduling',
        status: 'active',
        performance: Math.random() * 25 + 75,
        tasksCompleted: Math.floor(Math.random() * 120) + 60,
        lastActivity: new Date(Date.now() - Math.random() * 15 * 60 * 1000).toISOString(),
        metrics: {
          postsScheduled: Math.floor(Math.random() * 100) + 50,
          optimalTimingAccuracy: Math.random() * 15 + 85,
          engagementLift: Math.random() * 30 + 15
        }
      }
    ],
    
    // Usage statistics
    usageStats: {
      postsCreated: Math.floor(Math.random() * 100) + 50,
      aiRequestsUsed: Math.floor(Math.random() * 500) + 200,
      storageUsed: Math.floor(Math.random() * 1000) + 200, // MB
      apiCallsUsed: Math.floor(Math.random() * 2000) + 500,
      scheduledPosts: Math.floor(Math.random() * 50) + 20,
      campaignsActive: Math.floor(Math.random() * 10) + 3,
      
      // Plan limits
      planLimits: {
        postsPerMonth: 500,
        aiRequestsPerMonth: 2000,
        storageLimit: 5000, // MB
        apiCallsPerMonth: 10000,
        scheduledPostsLimit: 200,
        campaignsLimit: 20
      },
      
      // Usage percentages
      usagePercentages: {
        posts: Math.random() * 40 + 30, // 30-70%
        aiRequests: Math.random() * 50 + 25, // 25-75%
        storage: Math.random() * 30 + 20, // 20-50%
        apiCalls: Math.random() * 35 + 15, // 15-50%
        scheduledPosts: Math.random() * 40 + 20, // 20-60%
        campaigns: Math.random() * 60 + 20 // 20-80%
      }
    },
    
    // Quick actions and recommendations
    quickActions: [
      {
        id: 'create_post',
        title: 'Create New Post',
        description: 'Generate AI-powered content for your social media',
        icon: 'plus',
        action: 'create_post',
        priority: 'high'
      },
      {
        id: 'schedule_content',
        title: 'Schedule Content',
        description: 'Plan and schedule your upcoming posts',
        icon: 'calendar',
        action: 'schedule_content',
        priority: 'medium'
      },
      {
        id: 'analyze_performance',
        title: 'Analyze Performance',
        description: 'Review your content performance and insights',
        icon: 'bar_chart',
        action: 'analyze_performance',
        priority: 'medium'
      },
      {
        id: 'optimize_strategy',
        title: 'Optimize Strategy',
        description: 'Get AI recommendations to improve your strategy',
        icon: 'target',
        action: 'optimize_strategy',
        priority: 'low'
      }
    ],
    
    // Notifications and alerts
    notifications: [
      {
        id: 'notif_1',
        type: 'success',
        title: 'Post Performance Alert',
        message: 'Your latest Instagram post is performing 40% above average!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 'notif_2',
        type: 'info',
        title: 'Scheduled Post Ready',
        message: '3 posts are scheduled to publish today',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 'notif_3',
        type: 'warning',
        title: 'Usage Limit Alert',
        message: 'You\'ve used 80% of your monthly AI requests',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        read: true
      }
    ],
    
    timeRange,
    last_updated: new Date().toISOString()
  };
};

// @route   GET /api/customer-dashboard/overview
// @desc    Get customer dashboard overview
// @access  Private (Customer)
router.get('/overview', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const userId = req.user.id;
    
    const dashboardData = generateCustomerDashboardData(userId, timeRange);

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Customer dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview',
      error: error.message
    });
  }
});

// @route   GET /api/customer-dashboard/analytics
// @desc    Get customer analytics overview
// @access  Private (Customer)
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const userId = req.user.id;
    
    const dashboardData = generateCustomerDashboardData(userId, timeRange);

    const analytics = {
      overview: dashboardData.overview,
      timeSeriesData: dashboardData.timeSeriesData,
      platformMetrics: dashboardData.platformMetrics,
      
      // Additional analytics
      topPerformingContent: dashboardData.recentContent
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5),
      
      engagementTrends: dashboardData.timeSeriesData.map(day => ({
        date: day.date,
        engagement: day.engagement,
        reach: day.reach,
        engagementRate: (day.engagement / day.reach) * 100
      })),
      
      audienceInsights: {
        bestPostingTimes: [
          { time: '9:00 AM', engagement: Math.random() * 100 + 50 },
          { time: '1:00 PM', engagement: Math.random() * 100 + 60 },
          { time: '6:00 PM', engagement: Math.random() * 100 + 70 },
          { time: '8:00 PM', engagement: Math.random() * 100 + 80 }
        ],
        topHashtags: [
          { hashtag: '#socialmedia', usage: Math.floor(Math.random() * 50) + 20 },
          { hashtag: '#marketing', usage: Math.floor(Math.random() * 40) + 15 },
          { hashtag: '#business', usage: Math.floor(Math.random() * 35) + 12 },
          { hashtag: '#content', usage: Math.floor(Math.random() * 30) + 10 }
        ],
        audienceGrowth: dashboardData.timeSeriesData.map(day => ({
          date: day.date,
          followers: day.followers,
          growth: day.followers > 0 ? ((day.followers / 25) * 100).toFixed(1) : 0
        }))
      },
      
      timeRange,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
});

// @route   GET /api/customer-dashboard/content
// @desc    Get customer content list
// @access  Private (Customer)
router.get('/content', async (req, res) => {
  try {
    const { 
      limit = 10, 
      status = 'all',
      platform = 'all',
      type = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const userId = req.user.id;
    const dashboardData = generateCustomerDashboardData(userId);
    
    let content = dashboardData.recentContent;
    
    // Apply filters
    if (status !== 'all') {
      content = content.filter(item => item.status === status);
    }
    
    if (platform !== 'all') {
      content = content.filter(item => item.platform.toLowerCase() === platform.toLowerCase());
    }
    
    if (type !== 'all') {
      content = content.filter(item => item.type === type);
    }
    
    // Sort content
    content.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'published_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // Apply limit
    const limitedContent = content.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        content: limitedContent,
        total: content.length,
        filters: { status, platform, type, sortBy, sortOrder },
        summary: {
          published: content.filter(item => item.status === 'published').length,
          scheduled: content.filter(item => item.status === 'scheduled').length,
          draft: content.filter(item => item.status === 'draft').length,
          totalEngagement: content.reduce((sum, item) => sum + item.engagement, 0),
          totalReach: content.reduce((sum, item) => sum + item.reach, 0)
        }
      }
    });

  } catch (error) {
    console.error('Customer content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content data',
      error: error.message
    });
  }
});

// @route   GET /api/customer-dashboard/ai-agents
// @desc    Get AI agents status and performance
// @access  Private (Customer)
router.get('/ai-agents', async (req, res) => {
  try {
    const userId = req.user.id;
    const dashboardData = generateCustomerDashboardData(userId);
    
    const aiAgentsData = {
      agents: dashboardData.aiAgents,
      summary: {
        totalAgents: dashboardData.aiAgents.length,
        activeAgents: dashboardData.aiAgents.filter(agent => agent.status === 'active').length,
        averagePerformance: dashboardData.aiAgents.reduce((sum, agent) => sum + agent.performance, 0) / dashboardData.aiAgents.length,
        totalTasksCompleted: dashboardData.aiAgents.reduce((sum, agent) => sum + agent.tasksCompleted, 0)
      },
      
      // Agent recommendations
      recommendations: [
        {
          agentId: 'content_creator',
          type: 'optimization',
          title: 'Increase Content Variety',
          description: 'Try generating more video content to boost engagement',
          priority: 'medium'
        },
        {
          agentId: 'engagement_optimizer',
          type: 'strategy',
          title: 'Optimize Posting Times',
          description: 'Your audience is most active between 6-8 PM',
          priority: 'high'
        }
      ],
      
      // Performance trends
      performanceTrends: dashboardData.aiAgents.map(agent => ({
        agentId: agent.id,
        name: agent.name,
        trend: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          performance: agent.performance + (Math.random() - 0.5) * 10
        }))
      })),
      
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: aiAgentsData
    });

  } catch (error) {
    console.error('AI agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI agents data',
      error: error.message
    });
  }
});

// @route   GET /api/customer-dashboard/usage-stats
// @desc    Get customer usage statistics
// @access  Private (Customer)
router.get('/usage-stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const dashboardData = generateCustomerDashboardData(userId);

    res.json({
      success: true,
      data: dashboardData.usageStats
    });

  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch usage statistics',
      error: error.message
    });
  }
});

// @route   GET /api/customer-dashboard/social-profiles
// @desc    Get connected social media profiles
// @access  Private (Customer)
router.get('/social-profiles', async (req, res) => {
  try {
    const userId = req.user.id;
    const dashboardData = generateCustomerDashboardData(userId);

    const socialProfiles = {
      profiles: dashboardData.platformMetrics.map(platform => ({
        id: platform.platform.toLowerCase(),
        platform: platform.platform,
        username: `@user_${userId}`,
        followers: platform.followers,
        following: Math.floor(platform.followers * 0.8),
        posts: platform.posts,
        engagement: platform.engagement,
        growth: platform.growth,
        status: platform.status,
        color: platform.color,
        lastSync: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
        permissions: ['read', 'write', 'publish'],
        features: {
          autoPosting: true,
          analytics: true,
          scheduling: true,
          aiGeneration: true
        }
      })),
      
      summary: {
        totalProfiles: dashboardData.platformMetrics.length,
        connectedProfiles: dashboardData.platformMetrics.filter(p => p.status === 'connected').length,
        totalFollowers: dashboardData.platformMetrics.reduce((sum, p) => sum + p.followers, 0),
        totalEngagement: dashboardData.platformMetrics.reduce((sum, p) => sum + p.engagement, 0),
        averageGrowth: dashboardData.platformMetrics.reduce((sum, p) => sum + p.growth, 0) / dashboardData.platformMetrics.length
      },
      
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: socialProfiles
    });

  } catch (error) {
    console.error('Social profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social profiles',
      error: error.message
    });
  }
});

// @route   GET /api/customer-dashboard/subscription
// @desc    Get customer subscription information
// @access  Private (Customer)
router.get('/subscription', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = {
      id: `sub_${userId}`,
      plan: ['starter', 'professional', 'enterprise'][Math.floor(Math.random() * 3)],
      status: 'active',
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      
      // Plan details
      planDetails: {
        name: 'Professional Plan',
        price: 79,
        currency: 'USD',
        interval: 'month',
        features: [
          'Unlimited posts',
          'AI content generation',
          'Advanced analytics',
          'Multi-platform publishing',
          'Priority support'
        ]
      },
      
      // Usage vs limits
      usage: {
        postsCreated: Math.floor(Math.random() * 100) + 50,
        aiRequestsUsed: Math.floor(Math.random() * 500) + 200,
        storageUsed: Math.floor(Math.random() * 1000) + 200,
        apiCallsUsed: Math.floor(Math.random() * 2000) + 500
      },
      
      limits: {
        postsPerMonth: 500,
        aiRequestsPerMonth: 2000,
        storageLimit: 5000,
        apiCallsPerMonth: 10000
      },
      
      // Billing
      billing: {
        nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        lastPayment: {
          amount: 79,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'paid'
        },
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'visa'
        }
      },
      
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription data',
      error: error.message
    });
  }
});

module.exports = router;
