const Analytics = require('../models/Analytics');
const Content = require('../models/Content');
const AIAgent = require('../models/AIAgent');
const logger = require('../utils/logger');
const redisConnection = require('../config/redis');

const analyticsController = {
  // Get dashboard overview analytics
  getDashboard: async (req, res) => {
    try {
      const { period = 'month', startDate, endDate } = req.query;
      const organizationId = req.organization._id;
      
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
          case 'year':
            start = new Date(end.getFullYear(), 0, 1);
            break;
          default:
            start = new Date(end.getFullYear(), end.getMonth(), 1);
        }
      }
      
      // Check cache first
      const cacheKey = `analytics:dashboard:${organizationId}:${period}:${start.getTime()}:${end.getTime()}`;
      const cachedData = await redisConnection.get(cacheKey);
      
      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
          cached: true,
          period: { start, end }
        });
      }
      
      // Get analytics data
      const [
        contentMetrics,
        platformMetrics,
        aiAgentMetrics,
        recentContent
      ] = await Promise.all([
        // Content performance metrics
        Analytics.aggregate([
          {
            $match: {
              organizationId,
              date: { $gte: start, $lte: end },
              type: 'content_performance'
            }
          },
          {
            $group: {
              _id: null,
              totalPosts: { $sum: '$contentMetrics.totalPosts' },
              totalImpressions: { $sum: '$contentMetrics.totalImpressions' },
              totalReach: { $sum: '$contentMetrics.totalReach' },
              totalEngagement: { $sum: '$contentMetrics.totalEngagement' },
              avgEngagementRate: { $avg: '$contentMetrics.engagementRate' }
            }
          }
        ]),
        
        // Platform-specific metrics
        Analytics.aggregate([
          {
            $match: {
              organizationId,
              date: { $gte: start, $lte: end },
              type: 'platform_analytics'
            }
          },
          { $unwind: '$platformMetrics' },
          {
            $group: {
              _id: '$platformMetrics.platform',
              totalFollowers: { $last: '$platformMetrics.followers' },
              totalImpressions: { $sum: '$platformMetrics.impressions' },
              totalEngagement: {
                $sum: {
                  $add: [
                    '$platformMetrics.engagement.likes',
                    '$platformMetrics.engagement.comments',
                    '$platformMetrics.engagement.shares'
                  ]
                }
              },
              followerGrowth: { $sum: '$platformMetrics.followerGrowth' }
            }
          }
        ]),
        
        // AI Agent performance
        Analytics.aggregate([
          {
            $match: {
              organizationId,
              date: { $gte: start, $lte: end },
              type: 'ai_agent_performance'
            }
          },
          {
            $group: {
              _id: null,
              totalTasks: { $sum: '$aiAgentMetrics.totalTasks' },
              completedTasks: { $sum: '$aiAgentMetrics.completedTasks' },
              avgSuccessRate: { $avg: '$aiAgentMetrics.successRate' },
              totalCost: { $sum: '$aiAgentMetrics.costMetrics.totalCost' },
              contentGenerated: { $sum: '$aiAgentMetrics.contentGenerated.total' }
            }
          }
        ]),
        
        // Recent top performing content
        Content.find({
          organizationId,
          createdAt: { $gte: start, $lte: end },
          status: 'published'
        })
          .populate('userId', 'firstName lastName')
          .sort({ 'analytics.totalEngagement': -1 })
          .limit(5)
          .select('title type analytics createdAt userId')
      ]);
      
      // Format response data
      const dashboardData = {
        overview: {
          totalPosts: contentMetrics[0]?.totalPosts || 0,
          totalImpressions: contentMetrics[0]?.totalImpressions || 0,
          totalReach: contentMetrics[0]?.totalReach || 0,
          totalEngagement: contentMetrics[0]?.totalEngagement || 0,
          avgEngagementRate: contentMetrics[0]?.avgEngagementRate || 0
        },
        platforms: platformMetrics.map(platform => ({
          platform: platform._id,
          followers: platform.totalFollowers,
          impressions: platform.totalImpressions,
          engagement: platform.totalEngagement,
          growth: platform.followerGrowth
        })),
        aiPerformance: {
          totalTasks: aiAgentMetrics[0]?.totalTasks || 0,
          completedTasks: aiAgentMetrics[0]?.completedTasks || 0,
          successRate: aiAgentMetrics[0]?.avgSuccessRate || 0,
          totalCost: aiAgentMetrics[0]?.totalCost || 0,
          contentGenerated: aiAgentMetrics[0]?.contentGenerated || 0
        },
        topContent: recentContent,
        period: { start, end }
      };
      
      // Cache for 15 minutes
      await redisConnection.set(cacheKey, dashboardData, 900);
      
      res.json({
        success: true,
        data: dashboardData,
        cached: false
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'analytics.getDashboard',
        userId: req.user._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard analytics',
        code: 'ANALYTICS_DASHBOARD_ERROR'
      });
    }
  },
  
  // Get content performance analytics
  getContentPerformance: async (req, res) => {
    try {
      const {
        startDate,
        endDate,
        platform,
        contentType,
        page = 1,
        limit = 20
      } = req.query;
      
      const organizationId = req.organization._id;
      const skip = (page - 1) * limit;
      
      // Build query
      const query = {
        organizationId,
        status: 'published'
      };
      
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      if (platform && platform !== 'all') {
        query['platforms.platform'] = platform;
      }
      
      if (contentType) {
        query.type = contentType;
      }
      
      // Get content with analytics
      const [contents, total] = await Promise.all([
        Content.find(query)
          .populate('userId', 'firstName lastName')
          .select('title type platforms analytics createdAt userId')
          .sort({ 'analytics.totalEngagement': -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Content.countDocuments(query)
      ]);
      
      // Calculate performance metrics
      const performanceData = contents.map(content => ({
        id: content._id,
        title: content.title,
        type: content.type,
        author: content.userId,
        createdAt: content.createdAt,
        platforms: content.platforms.map(p => p.platform),
        metrics: {
          impressions: content.analytics.impressions,
          reach: content.analytics.reach,
          engagement: content.analytics.engagement,
          engagementRate: content.engagementRate,
          clicks: content.analytics.engagement.clicks
        },
        performance: {
          score: calculatePerformanceScore(content.analytics),
          trend: 'stable' // TODO: Calculate trend based on historical data
        }
      }));
      
      res.json({
        success: true,
        data: {
          contents: performanceData,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'analytics.getContentPerformance',
        userId: req.user._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get content performance',
        code: 'CONTENT_PERFORMANCE_ERROR'
      });
    }
  },
  
  // Get platform analytics
  getPlatformAnalytics: async (req, res) => {
    try {
      const { platform, period = 'month', startDate, endDate } = req.query;
      const organizationId = req.organization._id;
      
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
      
      // Build aggregation pipeline
      const matchStage = {
        organizationId,
        date: { $gte: start, $lte: end },
        type: 'platform_analytics'
      };
      
      const pipeline = [
        { $match: matchStage },
        { $unwind: '$platformMetrics' }
      ];
      
      if (platform && platform !== 'all') {
        pipeline.push({
          $match: { 'platformMetrics.platform': platform }
        });
      }
      
      pipeline.push(
        {
          $group: {
            _id: {
              platform: '$platformMetrics.platform',
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
            },
            followers: { $last: '$platformMetrics.followers' },
            impressions: { $sum: '$platformMetrics.impressions' },
            reach: { $sum: '$platformMetrics.reach' },
            engagement: {
              $sum: {
                $add: [
                  '$platformMetrics.engagement.likes',
                  '$platformMetrics.engagement.comments',
                  '$platformMetrics.engagement.shares',
                  '$platformMetrics.engagement.saves'
                ]
              }
            },
            followerGrowth: { $sum: '$platformMetrics.followerGrowth' }
          }
        },
        {
          $group: {
            _id: '$_id.platform',
            data: {
              $push: {
                date: '$_id.date',
                followers: '$followers',
                impressions: '$impressions',
                reach: '$reach',
                engagement: '$engagement',
                followerGrowth: '$followerGrowth'
              }
            },
            totalFollowers: { $last: '$followers' },
            totalImpressions: { $sum: '$impressions' },
            totalReach: { $sum: '$reach' },
            totalEngagement: { $sum: '$engagement' },
            totalGrowth: { $sum: '$followerGrowth' }
          }
        },
        { $sort: { _id: 1 } }
      );
      
      const platformData = await Analytics.aggregate(pipeline);
      
      // Format response
      const analytics = platformData.map(platform => ({
        platform: platform._id,
        summary: {
          followers: platform.totalFollowers,
          impressions: platform.totalImpressions,
          reach: platform.totalReach,
          engagement: platform.totalEngagement,
          growth: platform.totalGrowth,
          engagementRate: platform.totalReach > 0 ? 
            (platform.totalEngagement / platform.totalReach * 100).toFixed(2) : 0
        },
        timeline: platform.data.sort((a, b) => new Date(a.date) - new Date(b.date))
      }));
      
      res.json({
        success: true,
        data: {
          platforms: analytics,
          period: { start, end }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'analytics.getPlatformAnalytics',
        userId: req.user._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get platform analytics',
        code: 'PLATFORM_ANALYTICS_ERROR'
      });
    }
  },
  
  // Get audience insights
  getAudienceInsights: async (req, res) => {
    try {
      const { platform, period = 'month' } = req.query;
      const organizationId = req.organization._id;
      
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
      
      // Get latest audience insights
      const query = {
        organizationId,
        date: { $gte: start, $lte: end },
        type: 'audience_insights'
      };
      
      const audienceData = await Analytics.findOne(query)
        .sort({ date: -1 });
      
      if (!audienceData) {
        return res.json({
          success: true,
          data: {
            demographics: {
              ageGroups: [],
              gender: { male: 0, female: 0, other: 0 },
              locations: [],
              languages: []
            },
            behavior: {
              activeHours: [],
              activeDays: [],
              deviceTypes: []
            },
            interests: [],
            growth: {
              newFollowers: 0,
              unfollowers: 0,
              netGrowth: 0,
              growthRate: 0
            }
          },
          message: 'No audience data available for the selected period'
        });
      }
      
      res.json({
        success: true,
        data: audienceData.audienceInsights
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'analytics.getAudienceInsights',
        userId: req.user._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get audience insights',
        code: 'AUDIENCE_INSIGHTS_ERROR'
      });
    }
  },
  
  // Get AI agent performance analytics
  getAIPerformance: async (req, res) => {
    try {
      const { agentType, period = 'month' } = req.query;
      const organizationId = req.organization._id;
      
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
      
      // Get AI performance data
      const pipeline = [
        {
          $match: {
            organizationId,
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
            totalCost: { $sum: '$aiAgentMetrics.agentPerformance.cost' }
          }
        },
        { $sort: { totalTasks: -1 } }
      );
      
      const agentPerformance = await Analytics.aggregate(pipeline);
      
      // Get overall AI metrics
      const overallMetrics = await Analytics.aggregate([
        {
          $match: {
            organizationId,
            date: { $gte: start, $lte: end },
            type: 'ai_agent_performance'
          }
        },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: '$aiAgentMetrics.totalTasks' },
            completedTasks: { $sum: '$aiAgentMetrics.completedTasks' },
            avgSuccessRate: { $avg: '$aiAgentMetrics.successRate' },
            totalCost: { $sum: '$aiAgentMetrics.costMetrics.totalCost' },
            contentGenerated: { $sum: '$aiAgentMetrics.contentGenerated.total' },
            contentApproved: { $sum: '$aiAgentMetrics.contentGenerated.approved' }
          }
        }
      ]);
      
      res.json({
        success: true,
        data: {
          overview: overallMetrics[0] || {
            totalTasks: 0,
            completedTasks: 0,
            avgSuccessRate: 0,
            totalCost: 0,
            contentGenerated: 0,
            contentApproved: 0
          },
          agentPerformance: agentPerformance.map(agent => ({
            agentType: agent._id,
            tasks: agent.totalTasks,
            quality: agent.avgQuality,
            executionTime: agent.avgExecutionTime,
            successRate: agent.successRate,
            cost: agent.totalCost,
            efficiency: agent.totalTasks > 0 ? agent.totalCost / agent.totalTasks : 0
          })),
          period: { start, end }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'analytics.getAIPerformance',
        userId: req.user._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get AI performance analytics',
        code: 'AI_PERFORMANCE_ERROR'
      });
    }
  },
  
  // Get ROI and business metrics
  getROIMetrics: async (req, res) => {
    try {
      const { period = 'month', startDate, endDate } = req.query;
      const organizationId = req.organization._id;
      
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
      
      // Get ROI metrics
      const roiData = await Analytics.aggregate([
        {
          $match: {
            organizationId,
            date: { $gte: start, $lte: end },
            type: 'roi_metrics'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$businessMetrics.revenue.total' },
            attributedRevenue: { $sum: '$businessMetrics.revenue.attributed' },
            totalCosts: { $sum: '$businessMetrics.costs.total' },
            totalLeads: { $sum: '$businessMetrics.leads.total' },
            qualifiedLeads: { $sum: '$businessMetrics.leads.qualified' },
            conversions: { $sum: '$businessMetrics.conversions.total' },
            avgConversionRate: { $avg: '$businessMetrics.conversions.rate' }
          }
        }
      ]);
      
      const metrics = roiData[0] || {
        totalRevenue: 0,
        attributedRevenue: 0,
        totalCosts: 0,
        totalLeads: 0,
        qualifiedLeads: 0,
        conversions: 0,
        avgConversionRate: 0
      };
      
      // Calculate derived metrics
      const roi = metrics.totalCosts > 0 ? 
        ((metrics.attributedRevenue - metrics.totalCosts) / metrics.totalCosts * 100) : 0;
      const costPerLead = metrics.totalLeads > 0 ? 
        metrics.totalCosts / metrics.totalLeads : 0;
      const costPerConversion = metrics.conversions > 0 ? 
        metrics.totalCosts / metrics.conversions : 0;
      const leadQualificationRate = metrics.totalLeads > 0 ? 
        (metrics.qualifiedLeads / metrics.totalLeads * 100) : 0;
      
      res.json({
        success: true,
        data: {
          revenue: {
            total: metrics.totalRevenue,
            attributed: metrics.attributedRevenue,
            attributionRate: metrics.totalRevenue > 0 ? 
              (metrics.attributedRevenue / metrics.totalRevenue * 100) : 0
          },
          costs: {
            total: metrics.totalCosts,
            breakdown: {
              // TODO: Add cost breakdown by category
            }
          },
          roi: {
            overall: roi,
            roas: metrics.totalCosts > 0 ? 
              (metrics.attributedRevenue / metrics.totalCosts) : 0
          },
          leads: {
            total: metrics.totalLeads,
            qualified: metrics.qualifiedLeads,
            qualificationRate: leadQualificationRate,
            costPerLead
          },
          conversions: {
            total: metrics.conversions,
            rate: metrics.avgConversionRate,
            costPerConversion
          },
          period: { start, end }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'analytics.getROIMetrics',
        userId: req.user._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get ROI metrics',
        code: 'ROI_METRICS_ERROR'
      });
    }
  },
  
  // Export analytics data
  exportData: async (req, res) => {
    try {
      const { type, format = 'json', startDate, endDate } = req.query;
      const organizationId = req.organization._id;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
          code: 'DATE_RANGE_REQUIRED'
        });
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Build query
      const query = {
        organizationId,
        date: { $gte: start, $lte: end }
      };
      
      if (type) {
        query.type = type;
      }
      
      // Get analytics data
      const analyticsData = await Analytics.find(query)
        .sort({ date: -1 })
        .lean();
      
      // Log export activity
      logger.logUserActivity(req.user._id, 'analytics_exported', {
        type,
        format,
        dateRange: { start, end },
        recordCount: analyticsData.length,
        ip: req.ip
      });
      
      if (format === 'csv') {
        // TODO: Convert to CSV format
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.csv`);
        // res.send(convertToCSV(analyticsData));
        res.json({ message: 'CSV export not implemented yet' });
      } else {
        res.json({
          success: true,
          data: analyticsData,
          meta: {
            totalRecords: analyticsData.length,
            dateRange: { start, end },
            exportedAt: new Date()
          }
        });
      }
      
    } catch (error) {
      logger.logError(error, {
        controller: 'analytics.exportData',
        userId: req.user._id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to export analytics data',
        code: 'EXPORT_ERROR'
      });
    }
  }
};

// Helper function to calculate performance score
function calculatePerformanceScore(analytics) {
  const weights = {
    engagement: 0.4,
    reach: 0.3,
    impressions: 0.2,
    clicks: 0.1
  };
  
  // Normalize metrics (this would typically use historical averages)
  const normalizedEngagement = Math.min(analytics.engagement.likes + analytics.engagement.comments + analytics.engagement.shares, 1000) / 1000;
  const normalizedReach = Math.min(analytics.reach, 10000) / 10000;
  const normalizedImpressions = Math.min(analytics.impressions, 50000) / 50000;
  const normalizedClicks = Math.min(analytics.engagement.clicks, 500) / 500;
  
  const score = (
    normalizedEngagement * weights.engagement +
    normalizedReach * weights.reach +
    normalizedImpressions * weights.impressions +
    normalizedClicks * weights.clicks
  ) * 100;
  
  return Math.round(score);
}

module.exports = analyticsController;

