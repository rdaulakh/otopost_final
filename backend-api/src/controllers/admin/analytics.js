const Analytics = require('../../models/Analytics');
const User = require('../../models/User');
const Organization = require('../../models/Organization');
const Content = require('../../models/Content');
const AIAgent = require('../../models/AIAgent');
const logger = require('../../utils/logger');

const adminAnalyticsController = {
  // Get system-wide dashboard analytics
  getSystemDashboard: async (req, res) => {
    try {
      const { period = 'month' } = req.query;
      
      // Calculate date range
      const end = new Date();
      let start;
      switch (period) {
        case 'week':
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(end.getFullYear(), end.getMonth(), 1);
          break;
        case 'quarter':
          start = new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          start = new Date(end.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(end.getFullYear(), end.getMonth(), 1);
      }
      
      // Get basic system metrics without Analytics dependency
      const [
        userMetrics,
        organizationMetrics,
        contentMetrics,
        revenueMetrics
      ] = await Promise.all([
        // User metrics
        Promise.all([
          User.countDocuments({}),
          User.countDocuments({ isActive: true }),
          User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          User.countDocuments({ 'activity.lastActiveAt': { $gte: start, $lte: end } })
        ]),
        
        // Organization metrics
        Promise.all([
          Organization.countDocuments({}),
          Organization.countDocuments({ isActive: true }),
          Organization.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          Organization.aggregate([
            { $group: { _id: '$subscription.planId', count: { $sum: 1 } } }
          ])
        ]),
        
        // Content metrics
        Promise.all([
          Content.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          Content.countDocuments({ 
            createdAt: { $gte: start, $lte: end },
            status: 'published'
          }),
          Content.aggregate([
            {
              $match: {
                createdAt: { $gte: start, $lte: end },
                status: 'published'
              }
            },
            {
              $group: {
                _id: null,
                totalEngagement: { $sum: '$analytics.totalEngagement' },
                totalImpressions: { $sum: '$analytics.impressions' }
              }
            }
          ])
        ]),
        
        // Revenue metrics (from subscriptions)
        Organization.aggregate([
          {
            $match: {
              'subscription.status': { $in: ['active', 'trialing'] }
            }
          },
          {
            $group: {
              _id: '$subscription.planId',
              count: { $sum: 1 },
              // TODO: Add actual revenue calculation based on plan pricing
              estimatedRevenue: {
                $sum: {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$subscription.planId', 'starter'] }, then: 29 },
                      { case: { $eq: ['$subscription.planId', 'professional'] }, then: 99 },
                      { case: { $eq: ['$subscription.planId', 'enterprise'] }, then: 299 }
                    ],
                    default: 0
                  }
                }
              }
            }
          }
        ])
      ]);
      
      // Format dashboard data
      const dashboardData = {
        totalUsers: userMetrics[0],
        activeUsers: userMetrics[1],
        newUsersToday: userMetrics[2],
        totalRevenue: revenueMetrics.reduce((sum, item) => sum + item.estimatedRevenue, 0),
        monthlyRevenue: revenueMetrics.reduce((sum, item) => sum + item.estimatedRevenue, 0),
        revenueGrowth: 0,
        systemUptime: 99.9,
        apiCalls: 0,
        aiAgentTasks: 0,
        storageUsed: 0,
        users: {
          total: userMetrics[0],
          active: userMetrics[1],
          newThisPeriod: userMetrics[2],
          activeThisPeriod: userMetrics[3],
          growthRate: userMetrics[0] > 0 ? ((userMetrics[2] / userMetrics[0]) * 100).toFixed(2) : 0
        },
        organizations: {
          total: organizationMetrics[0],
          active: organizationMetrics[1],
          newThisPeriod: organizationMetrics[2],
          byPlan: organizationMetrics[3].reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        content: {
          totalCreated: contentMetrics[0],
          totalPublished: contentMetrics[1],
          totalEngagement: contentMetrics[2][0]?.totalEngagement || 0,
          totalImpressions: contentMetrics[2][0]?.totalImpressions || 0
        },
        revenue: {
          byPlan: revenueMetrics.reduce((acc, item) => {
            acc[item._id] = {
              subscribers: item.count,
              estimatedRevenue: item.estimatedRevenue
            };
            return acc;
          }, {}),
          totalEstimated: revenueMetrics.reduce((sum, item) => sum + item.estimatedRevenue, 0)
        },
        ai: {
          totalTasks: 0,
          completedTasks: 0,
          successRate: 0,
          totalCost: 0,
          contentGenerated: 0
        },
        period: { start, end }
      };
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'system_dashboard_viewed', 'system', null, {
        period,
        ip: req.ip
      });
      
      res.json({
        success: true,
        data: dashboardData,
        cached: false
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminAnalytics.getSystemDashboard',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get system dashboard',
        code: 'ADMIN_SYSTEM_DASHBOARD_ERROR'
      });
    }
  },
  
  // Get platform usage analytics
  getPlatformUsage: async (req, res) => {
    try {
      const { period = 'month', startDate, endDate } = req.query;
      
      // Calculate date range
      let start, end;
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        end = new Date();
        switch (period) {
          case 'week':
            start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            start = new Date(end.getFullYear(), end.getMonth(), 1);
            break;
          case 'quarter':
            start = new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3, 1);
            break;
          default:
            start = new Date(end.getFullYear(), end.getMonth(), 1);
        }
      }
      
      // Get platform usage data
      const [
        platformMetrics,
        contentByPlatform,
        engagementByPlatform
      ] = await Promise.all([
        Analytics.aggregate([
          {
            $match: {
              date: { $gte: start, $lte: end },
              type: 'platform_analytics'
            }
          },
          { $unwind: '$platformMetrics' },
          {
            $group: {
              _id: '$platformMetrics.platform',
              totalImpressions: { $sum: '$platformMetrics.impressions' },
              totalReach: { $sum: '$platformMetrics.reach' },
              totalEngagement: {
                $sum: {
                  $add: [
                    '$platformMetrics.engagement.likes',
                    '$platformMetrics.engagement.comments',
                    '$platformMetrics.engagement.shares'
                  ]
                }
              },
              avgFollowers: { $avg: '$platformMetrics.followers' }
            }
          },
          { $sort: { totalEngagement: -1 } }
        ]),
        
        Content.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
              status: 'published'
            }
          },
          { $unwind: '$platforms' },
          {
            $group: {
              _id: '$platforms.platform',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]),
        
        Content.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
              status: 'published'
            }
          },
          { $unwind: '$platforms' },
          {
            $group: {
              _id: '$platforms.platform',
              avgEngagement: { $avg: '$analytics.totalEngagement' },
              totalPosts: { $sum: 1 }
            }
          }
        ])
      ]);
      
      // Combine data
      const platformData = platformMetrics.map(platform => {
        const contentData = contentByPlatform.find(c => c._id === platform._id) || { count: 0 };
        const engagementData = engagementByPlatform.find(e => e._id === platform._id) || { avgEngagement: 0, totalPosts: 0 };
        
        return {
          platform: platform._id,
          metrics: {
            impressions: platform.totalImpressions,
            reach: platform.totalReach,
            engagement: platform.totalEngagement,
            followers: Math.round(platform.avgFollowers),
            posts: contentData.count,
            avgEngagementPerPost: engagementData.avgEngagement
          },
          performance: {
            engagementRate: platform.totalReach > 0 ? 
              ((platform.totalEngagement / platform.totalReach) * 100).toFixed(2) : 0
          }
        };
      });
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'platform_usage_viewed', 'system', null, {
        period,
        dateRange: { start, end },
        ip: req.ip
      });
      
      res.json({
        success: true,
        data: {
          platforms: platformData,
          summary: {
            totalPlatforms: platformData.length,
            totalImpressions: platformData.reduce((sum, p) => sum + p.metrics.impressions, 0),
            totalEngagement: platformData.reduce((sum, p) => sum + p.metrics.engagement, 0),
            totalPosts: platformData.reduce((sum, p) => sum + p.metrics.posts, 0)
          },
          period: { start, end }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminAnalytics.getPlatformUsage',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get platform usage analytics',
        code: 'ADMIN_PLATFORM_USAGE_ERROR'
      });
    }
  },
  
  // Get revenue analytics
  getRevenueAnalytics: async (req, res) => {
    try {
      const { period = 'month' } = req.query;
      
      // Calculate date range
      const end = new Date();
      let start;
      switch (period) {
        case 'week':
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(end.getFullYear(), end.getMonth(), 1);
          break;
        case 'quarter':
          start = new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          start = new Date(end.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(end.getFullYear(), end.getMonth(), 1);
      }
      
      // Get revenue data
      const [
        subscriptionData,
        churnData,
        trialConversions
      ] = await Promise.all([
        Organization.aggregate([
          {
            $group: {
              _id: {
                plan: '$subscription.planId',
                status: '$subscription.status'
              },
              count: { $sum: 1 },
              // TODO: Replace with actual pricing from subscription plans
              estimatedRevenue: {
                $sum: {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$subscription.planId', 'starter'] }, then: 29 },
                      { case: { $eq: ['$subscription.planId', 'professional'] }, then: 99 },
                      { case: { $eq: ['$subscription.planId', 'enterprise'] }, then: 299 }
                    ],
                    default: 0
                  }
                }
              }
            }
          }
        ]),
        
        Organization.aggregate([
          {
            $match: {
              'subscription.cancelledAt': { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: '$subscription.planId',
              churnCount: { $sum: 1 }
            }
          }
        ]),
        
        Organization.aggregate([
          {
            $match: {
              'subscription.status': 'active',
              'subscription.trialEnd': { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: '$subscription.planId',
              conversions: { $sum: 1 }
            }
          }
        ])
      ]);
      
      // Calculate metrics
      const revenueByPlan = {};
      const totalRevenue = subscriptionData.reduce((sum, item) => {
        const plan = item._id.plan;
        const status = item._id.status;
        
        if (!revenueByPlan[plan]) {
          revenueByPlan[plan] = {
            active: 0,
            trialing: 0,
            cancelled: 0,
            revenue: 0
          };
        }
        
        revenueByPlan[plan][status] = item.count;
        if (status === 'active') {
          revenueByPlan[plan].revenue = item.estimatedRevenue;
        }
        
        return sum + (status === 'active' ? item.estimatedRevenue : 0);
      }, 0);
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'revenue_analytics_viewed', 'system', null, {
        period,
        ip: req.ip
      });
      
      res.json({
        success: true,
        data: {
          overview: {
            totalRevenue,
            totalSubscribers: subscriptionData.reduce((sum, item) => 
              sum + (item._id.status === 'active' ? item.count : 0), 0),
            totalTrials: subscriptionData.reduce((sum, item) => 
              sum + (item._id.status === 'trialing' ? item.count : 0), 0)
          },
          byPlan: revenueByPlan,
          churn: churnData.reduce((acc, item) => {
            acc[item._id] = item.churnCount;
            return acc;
          }, {}),
          conversions: trialConversions.reduce((acc, item) => {
            acc[item._id] = item.conversions;
            return acc;
          }, {}),
          period: { start, end }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminAnalytics.getRevenueAnalytics',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get revenue analytics',
        code: 'ADMIN_REVENUE_ANALYTICS_ERROR'
      });
    }
  },
  
  // Get AI system performance
  getAISystemPerformance: async (req, res) => {
    try {
      const { period = 'month', agentType } = req.query;
      
      // Calculate date range
      const end = new Date();
      let start;
      switch (period) {
        case 'week':
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(end.getFullYear(), end.getMonth(), 1);
          break;
        case 'quarter':
          start = new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3, 1);
          break;
        default:
          start = new Date(end.getFullYear(), end.getMonth(), 1);
      }
      
      // Build aggregation pipeline
      const pipeline = [
        {
          $match: {
            date: { $gte: start, $lte: end },
            type: 'ai_agent_performance'
          }
        },
        { $unwind: '$aiAgentMetrics.agentPerformance' }
      ];
      
      if (agentType) {
        pipeline.push({
          $match: { 'aiAgentMetrics.agentPerformance.agentType': agentType }
        });
      }
      
      pipeline.push(
        {
          $group: {
            _id: '$aiAgentMetrics.agentPerformance.agentType',
            totalTasks: { $sum: '$aiAgentMetrics.agentPerformance.tasksCompleted' },
            avgQuality: { $avg: '$aiAgentMetrics.agentPerformance.averageQuality' },
            avgExecutionTime: { $avg: '$aiAgentMetrics.agentPerformance.executionTime' },
            successRate: { $avg: '$aiAgentMetrics.agentPerformance.successRate' },
            totalCost: { $sum: '$aiAgentMetrics.agentPerformance.cost' },
            errorCount: { $sum: '$aiAgentMetrics.agentPerformance.errors' }
          }
        },
        { $sort: { totalTasks: -1 } }
      );
      
      const [agentPerformance, systemMetrics] = await Promise.all([
        Analytics.aggregate(pipeline),
        Analytics.aggregate([
          {
            $match: {
              date: { $gte: start, $lte: end },
              type: 'ai_agent_performance'
            }
          },
          {
            $group: {
              _id: null,
              totalTasks: { $sum: '$aiAgentMetrics.totalTasks' },
              completedTasks: { $sum: '$aiAgentMetrics.completedTasks' },
              totalCost: { $sum: '$aiAgentMetrics.costMetrics.totalCost' },
              avgResponseTime: { $avg: '$aiAgentMetrics.avgResponseTime' }
            }
          }
        ])
      ]);
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'ai_system_performance_viewed', 'system', null, {
        period,
        agentType,
        ip: req.ip
      });
      
      res.json({
        success: true,
        data: {
          overview: systemMetrics[0] || {
            totalTasks: 0,
            completedTasks: 0,
            totalCost: 0,
            avgResponseTime: 0
          },
          agentPerformance: agentPerformance.map(agent => ({
            agentType: agent._id,
            metrics: {
              tasks: agent.totalTasks,
              quality: agent.avgQuality,
              executionTime: agent.avgExecutionTime,
              successRate: agent.successRate,
              cost: agent.totalCost,
              errors: agent.errorCount
            },
            efficiency: {
              costPerTask: agent.totalTasks > 0 ? agent.totalCost / agent.totalTasks : 0,
              errorRate: agent.totalTasks > 0 ? (agent.errorCount / agent.totalTasks * 100) : 0
            }
          })),
          period: { start, end }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminAnalytics.getAISystemPerformance',
        adminId: req.admin._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get AI system performance',
        code: 'ADMIN_AI_PERFORMANCE_ERROR'
      });
    }
  },
  
  // Generate custom report
  generateCustomReport: async (req, res) => {
    try {
      const {
        reportType,
        metrics,
        filters,
        dateRange,
        format = 'json'
      } = req.body;
      
      if (!reportType || !metrics || !dateRange) {
        return res.status(400).json({
          success: false,
          message: 'Report type, metrics, and date range are required',
          code: 'INVALID_REPORT_PARAMS'
        });
      }
      
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      
      // Build query based on report type and filters
      let reportData = {};
      
      switch (reportType) {
        case 'user_engagement':
          reportData = await generateUserEngagementReport(start, end, filters, metrics);
          break;
        case 'content_performance':
          reportData = await generateContentPerformanceReport(start, end, filters, metrics);
          break;
        case 'revenue_analysis':
          reportData = await generateRevenueAnalysisReport(start, end, filters, metrics);
          break;
        case 'ai_efficiency':
          reportData = await generateAIEfficiencyReport(start, end, filters, metrics);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid report type',
            code: 'INVALID_REPORT_TYPE'
          });
      }
      
      // Log admin activity
      logger.logAdminActivity(req.admin._id, 'custom_report_generated', 'system', null, {
        reportType,
        metrics,
        filters,
        dateRange,
        format,
        ip: req.ip
      });
      
      if (format === 'csv') {
        // TODO: Convert to CSV format
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${reportType}-${Date.now()}.csv`);
        res.json({ message: 'CSV export not implemented yet' });
      } else {
        res.json({
          success: true,
          data: {
            reportType,
            generatedAt: new Date(),
            dateRange: { start, end },
            ...reportData
          }
        });
      }
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminAnalytics.generateCustomReport',
        adminId: req.admin._id,
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to generate custom report',
        code: 'CUSTOM_REPORT_ERROR'
      });
    }
  }
};

// Helper functions for custom reports
async function generateUserEngagementReport(start, end, filters, metrics) {
  try {
    const query = {
      createdAt: { $gte: start, $lte: end }
    };
    
    // Apply filters
    if (filters.organizationId) {
      query.organization = filters.organizationId;
    }
    if (filters.userRole) {
      query.role = filters.userRole;
    }
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    
    // Get user engagement data
    const users = await User.find(query).populate('organization');
    
    const engagementData = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      newUsers: users.filter(u => u.createdAt >= start).length,
      userGrowth: 0,
      engagementMetrics: {},
      topPerformingUsers: [],
      userActivity: [],
      demographics: {}
    };
    
    // Calculate user growth
    const previousPeriodStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
    const previousUsers = await User.countDocuments({
      ...query,
      createdAt: { $gte: previousPeriodStart, $lt: start }
    });
    engagementData.userGrowth = previousUsers > 0 ? 
      ((engagementData.newUsers - previousUsers) / previousUsers * 100) : 0;
    
    // Calculate engagement metrics
    for (const user of users) {
      const userContent = await Content.find({ author: user._id, createdAt: { $gte: start, $lte: end } });
      const userAnalytics = await Analytics.find({ userId: user._id, createdAt: { $gte: start, $lte: end } });
      
      const totalEngagement = userAnalytics.reduce((sum, analytics) => 
        sum + (analytics.likes || 0) + (analytics.comments || 0) + (analytics.shares || 0), 0);
      
      engagementData.topPerformingUsers.push({
        userId: user._id,
        username: user.username,
        email: user.email,
        totalContent: userContent.length,
        totalEngagement: totalEngagement,
        avgEngagementPerPost: userContent.length > 0 ? totalEngagement / userContent.length : 0
      });
    }
    
    // Sort by engagement
    engagementData.topPerformingUsers.sort((a, b) => b.totalEngagement - a.totalEngagement);
    engagementData.topPerformingUsers = engagementData.topPerformingUsers.slice(0, 10);
    
    // Calculate demographics
    const roles = {};
    const organizations = {};
    users.forEach(user => {
      roles[user.role] = (roles[user.role] || 0) + 1;
      if (user.organization) {
        organizations[user.organization.name] = (organizations[user.organization.name] || 0) + 1;
      }
    });
    
    engagementData.demographics = { roles, organizations };
    
    // Calculate overall engagement metrics
    const allAnalytics = await Analytics.find({
      createdAt: { $gte: start, $lte: end },
      userId: { $in: users.map(u => u._id) }
    });
    
    engagementData.engagementMetrics = {
      totalLikes: allAnalytics.reduce((sum, a) => sum + (a.likes || 0), 0),
      totalComments: allAnalytics.reduce((sum, a) => sum + (a.comments || 0), 0),
      totalShares: allAnalytics.reduce((sum, a) => sum + (a.shares || 0), 0),
      avgEngagementRate: allAnalytics.length > 0 ? 
        allAnalytics.reduce((sum, a) => sum + (a.engagementRate || 0), 0) / allAnalytics.length : 0
    };
    
    return engagementData;
  } catch (error) {
    logger.error('Error generating user engagement report:', error);
    throw error;
  }
}

async function generateContentPerformanceReport(start, end, filters, metrics) {
  try {
    const query = {
      createdAt: { $gte: start, $lte: end }
    };
    
    // Apply filters
    if (filters.contentType) {
      query.type = filters.contentType;
    }
    if (filters.platform) {
      query.platforms = { $in: [filters.platform] };
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.organizationId) {
      query.organization = filters.organizationId;
    }
    
    // Get content data
    const content = await Content.find(query).populate('author', 'username email');
    
    const performanceData = {
      totalContent: content.length,
      contentByType: {},
      contentByPlatform: {},
      topPerformingContent: [],
      performanceMetrics: {},
      engagementTrends: [],
      contentQuality: {}
    };
    
    // Analyze content by type
    content.forEach(item => {
      performanceData.contentByType[item.type] = (performanceData.contentByType[item.type] || 0) + 1;
      item.platforms.forEach(platform => {
        performanceData.contentByPlatform[platform] = (performanceData.contentByPlatform[platform] || 0) + 1;
      });
    });
    
    // Get analytics for each content piece
    for (const item of content) {
      const analytics = await Analytics.find({ contentId: item._id });
      const totalEngagement = analytics.reduce((sum, a) => 
        sum + (a.likes || 0) + (a.comments || 0) + (a.shares || 0), 0);
      
      performanceData.topPerformingContent.push({
        contentId: item._id,
        title: item.title,
        type: item.type,
        platforms: item.platforms,
        author: item.author.username,
        totalEngagement: totalEngagement,
        engagementRate: analytics.length > 0 ? 
          analytics.reduce((sum, a) => sum + (a.engagementRate || 0), 0) / analytics.length : 0,
        reach: analytics.reduce((sum, a) => sum + (a.reach || 0), 0),
        impressions: analytics.reduce((sum, a) => sum + (a.impressions || 0), 0),
        createdAt: item.createdAt
      });
    }
    
    // Sort by engagement
    performanceData.topPerformingContent.sort((a, b) => b.totalEngagement - a.totalEngagement);
    performanceData.topPerformingContent = performanceData.topPerformingContent.slice(0, 20);
    
    // Calculate overall performance metrics
    const allAnalytics = await Analytics.find({
      contentId: { $in: content.map(c => c._id) }
    });
    
    performanceData.performanceMetrics = {
      totalLikes: allAnalytics.reduce((sum, a) => sum + (a.likes || 0), 0),
      totalComments: allAnalytics.reduce((sum, a) => sum + (a.comments || 0), 0),
      totalShares: allAnalytics.reduce((sum, a) => sum + (a.shares || 0), 0),
      totalReach: allAnalytics.reduce((sum, a) => sum + (a.reach || 0), 0),
      totalImpressions: allAnalytics.reduce((sum, a) => sum + (a.impressions || 0), 0),
      avgEngagementRate: allAnalytics.length > 0 ? 
        allAnalytics.reduce((sum, a) => sum + (a.engagementRate || 0), 0) / allAnalytics.length : 0
    };
    
    // Calculate content quality metrics
    performanceData.contentQuality = {
      avgEngagementPerPost: content.length > 0 ? 
        performanceData.performanceMetrics.totalLikes / content.length : 0,
      highPerformingContent: performanceData.topPerformingContent.filter(c => c.engagementRate > 0.05).length,
      lowPerformingContent: performanceData.topPerformingContent.filter(c => c.engagementRate < 0.01).length
    };
    
    return performanceData;
  } catch (error) {
    logger.error('Error generating content performance report:', error);
    throw error;
  }
}

async function generateRevenueAnalysisReport(start, end, filters, metrics) {
  try {
    const query = {
      createdAt: { $gte: start, $lte: end }
    };
    
    // Apply filters
    if (filters.organizationId) {
      query.organization = filters.organizationId;
    }
    if (filters.subscriptionStatus) {
      query.status = filters.subscriptionStatus;
    }
    
    // Get subscription data
    const subscriptions = await Subscription.find(query).populate('organization', 'name');
    
    const revenueData = {
      totalRevenue: 0,
      totalSubscriptions: subscriptions.length,
      revenueByPlan: {},
      revenueByOrganization: {},
      subscriptionGrowth: 0,
      churnRate: 0,
      averageRevenuePerUser: 0,
      revenueTrends: [],
      topRevenueOrganizations: []
    };
    
    // Calculate revenue metrics
    subscriptions.forEach(sub => {
      const monthlyRevenue = sub.amount || 0;
      revenueData.totalRevenue += monthlyRevenue;
      
      // Revenue by plan
      const planName = sub.planName || 'Unknown';
      revenueData.revenueByPlan[planName] = (revenueData.revenueByPlan[planName] || 0) + monthlyRevenue;
      
      // Revenue by organization
      if (sub.organization) {
        const orgName = sub.organization.name;
        revenueData.revenueByOrganization[orgName] = (revenueData.revenueByOrganization[orgName] || 0) + monthlyRevenue;
      }
    });
    
    // Calculate subscription growth
    const previousPeriodStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
    const previousSubscriptions = await Subscription.countDocuments({
      ...query,
      createdAt: { $gte: previousPeriodStart, $lt: start }
    });
    revenueData.subscriptionGrowth = previousSubscriptions > 0 ? 
      ((subscriptions.length - previousSubscriptions) / previousSubscriptions * 100) : 0;
    
    // Calculate churn rate
    const cancelledSubscriptions = await Subscription.countDocuments({
      ...query,
      status: 'cancelled'
    });
    revenueData.churnRate = subscriptions.length > 0 ? 
      (cancelledSubscriptions / subscriptions.length * 100) : 0;
    
    // Calculate ARPU
    revenueData.averageRevenuePerUser = subscriptions.length > 0 ? 
      revenueData.totalRevenue / subscriptions.length : 0;
    
    // Get top revenue organizations
    Object.entries(revenueData.revenueByOrganization).forEach(([orgName, revenue]) => {
      revenueData.topRevenueOrganizations.push({ organization: orgName, revenue });
    });
    revenueData.topRevenueOrganizations.sort((a, b) => b.revenue - a.revenue);
    revenueData.topRevenueOrganizations = revenueData.topRevenueOrganizations.slice(0, 10);
    
    return revenueData;
  } catch (error) {
    logger.error('Error generating revenue analysis report:', error);
    throw error;
  }
}

async function generateAIEfficiencyReport(start, end, filters, metrics) {
  try {
    const query = {
      createdAt: { $gte: start, $lte: end }
    };
    
    // Apply filters
    if (filters.agentType) {
      query.agentType = filters.agentType;
    }
    if (filters.organizationId) {
      query.organizationId = filters.organizationId;
    }
    
    // Get AI agent data
    const aiAgents = await AIAgent.find(query);
    const agentTasks = await AgentTask.find(query);
    
    const efficiencyData = {
      totalAgents: aiAgents.length,
      totalTasks: agentTasks.length,
      agentPerformance: {},
      taskEfficiency: {},
      aiUsage: {},
      costAnalysis: {},
      recommendations: []
    };
    
    // Analyze agent performance
    for (const agent of aiAgents) {
      const agentTasks = await AgentTask.find({ agentId: agent._id, ...query });
      const completedTasks = agentTasks.filter(task => task.status === 'completed');
      const failedTasks = agentTasks.filter(task => task.status === 'failed');
      
      const successRate = agentTasks.length > 0 ? 
        (completedTasks.length / agentTasks.length * 100) : 0;
      
      const avgExecutionTime = completedTasks.length > 0 ? 
        completedTasks.reduce((sum, task) => sum + (task.executionTime || 0), 0) / completedTasks.length : 0;
      
      efficiencyData.agentPerformance[agent.name] = {
        totalTasks: agentTasks.length,
        completedTasks: completedTasks.length,
        failedTasks: failedTasks.length,
        successRate: successRate,
        avgExecutionTime: avgExecutionTime,
        totalCost: agentTasks.reduce((sum, task) => sum + (task.cost || 0), 0)
      };
    }
    
    // Analyze task efficiency
    const taskTypes = {};
    agentTasks.forEach(task => {
      const type = task.taskType || 'unknown';
      if (!taskTypes[type]) {
        taskTypes[type] = { total: 0, completed: 0, failed: 0, totalTime: 0, totalCost: 0 };
      }
      taskTypes[type].total++;
      if (task.status === 'completed') taskTypes[type].completed++;
      if (task.status === 'failed') taskTypes[type].failed++;
      taskTypes[type].totalTime += task.executionTime || 0;
      taskTypes[type].totalCost += task.cost || 0;
    });
    
    efficiencyData.taskEfficiency = taskTypes;
    
    // Calculate AI usage metrics
    efficiencyData.aiUsage = {
      totalApiCalls: agentTasks.reduce((sum, task) => sum + (task.apiCalls || 0), 0),
      totalTokensUsed: agentTasks.reduce((sum, task) => sum + (task.tokensUsed || 0), 0),
      avgTokensPerTask: agentTasks.length > 0 ? 
        agentTasks.reduce((sum, task) => sum + (task.tokensUsed || 0), 0) / agentTasks.length : 0
    };
    
    // Calculate cost analysis
    efficiencyData.costAnalysis = {
      totalCost: agentTasks.reduce((sum, task) => sum + (task.cost || 0), 0),
      avgCostPerTask: agentTasks.length > 0 ? 
        agentTasks.reduce((sum, task) => sum + (task.cost || 0), 0) / agentTasks.length : 0,
      costByAgentType: {},
      costByTaskType: {}
    };
    
    // Cost by agent type
    aiAgents.forEach(agent => {
      const agentTasks = agentTasks.filter(task => task.agentId === agent._id);
      const totalCost = agentTasks.reduce((sum, task) => sum + (task.cost || 0), 0);
      efficiencyData.costAnalysis.costByAgentType[agent.agentType] = 
        (efficiencyData.costAnalysis.costByAgentType[agent.agentType] || 0) + totalCost;
    });
    
    // Cost by task type
    Object.entries(taskTypes).forEach(([type, data]) => {
      efficiencyData.costAnalysis.costByTaskType[type] = data.totalCost;
    });
    
    // Generate recommendations
    const lowPerformingAgents = Object.entries(efficiencyData.agentPerformance)
      .filter(([name, perf]) => perf.successRate < 70)
      .map(([name, perf]) => ({ name, successRate: perf.successRate }));
    
    if (lowPerformingAgents.length > 0) {
      efficiencyData.recommendations.push({
        type: 'agent_optimization',
        priority: 'high',
        message: `Consider optimizing agents with low success rates: ${lowPerformingAgents.map(a => a.name).join(', ')}`
      });
    }
    
    const highCostTasks = Object.entries(efficiencyData.costAnalysis.costByTaskType)
      .filter(([type, cost]) => cost > efficiencyData.costAnalysis.avgCostPerTask * 2)
      .map(([type, cost]) => ({ type, cost }));
    
    if (highCostTasks.length > 0) {
      efficiencyData.recommendations.push({
        type: 'cost_optimization',
        priority: 'medium',
        message: `High-cost task types detected: ${highCostTasks.map(t => t.type).join(', ')}`
      });
    }
    
    return efficiencyData;
  } catch (error) {
    logger.error('Error generating AI efficiency report:', error);
    throw error;
  }
}

module.exports = adminAnalyticsController;

