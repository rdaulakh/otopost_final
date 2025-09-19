const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for advanced analytics endpoints
const analyticsRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per minute
  message: 'Too many analytics requests from this IP'
});

router.use(analyticsRateLimit);
router.use(auth);
router.use(adminAuth);

// Generate mock advanced analytics data
const generateAdvancedAnalyticsData = (timeRange = '30d') => {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  
  // Generate time series data
  const timeSeriesData = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    
    return {
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 5000) + 2000,
      users: Math.floor(Math.random() * 1000) + 500,
      engagement: Math.random() * 10 + 5,
      posts: Math.floor(Math.random() * 200) + 100,
      clicks: Math.floor(Math.random() * 5000) + 2000,
      impressions: Math.floor(Math.random() * 50000) + 25000,
      conversions: Math.floor(Math.random() * 100) + 50
    };
  });

  // Calculate totals and changes
  const currentPeriod = timeSeriesData.slice(-Math.floor(days/2));
  const previousPeriod = timeSeriesData.slice(0, Math.floor(days/2));
  
  const currentRevenue = currentPeriod.reduce((sum, day) => sum + day.revenue, 0);
  const previousRevenue = previousPeriod.reduce((sum, day) => sum + day.revenue, 0);
  const revenueChange = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  
  const currentUsers = currentPeriod.reduce((sum, day) => sum + day.users, 0);
  const previousUsers = previousPeriod.reduce((sum, day) => sum + day.users, 0);
  const userGrowth = ((currentUsers - previousUsers) / previousUsers) * 100;
  
  const currentEngagement = currentPeriod.reduce((sum, day) => sum + day.engagement, 0) / currentPeriod.length;
  const previousEngagement = previousPeriod.reduce((sum, day) => sum + day.engagement, 0) / previousPeriod.length;
  const engagementChange = ((currentEngagement - previousEngagement) / previousEngagement) * 100;

  return {
    // Summary metrics
    totalRevenue: currentRevenue,
    revenueChange: Math.round(revenueChange * 100) / 100,
    activeUsers: Math.floor(currentUsers / currentPeriod.length),
    userGrowth: Math.round(userGrowth * 100) / 100,
    engagementRate: Math.round(currentEngagement * 100) / 100,
    engagementChange: Math.round(engagementChange * 100) / 100,
    conversionRate: Math.random() * 5 + 2,
    conversionChange: (Math.random() - 0.5) * 10,
    
    // Time series data
    timeSeriesData,
    
    // Platform performance
    platformPerformance: [
      {
        platform: 'Instagram',
        users: Math.floor(Math.random() * 10000) + 5000,
        engagement: Math.random() * 8 + 4,
        revenue: Math.floor(Math.random() * 20000) + 10000,
        growth: (Math.random() - 0.3) * 50,
        color: '#E4405F'
      },
      {
        platform: 'Facebook',
        users: Math.floor(Math.random() * 8000) + 4000,
        engagement: Math.random() * 6 + 3,
        revenue: Math.floor(Math.random() * 15000) + 8000,
        growth: (Math.random() - 0.3) * 40,
        color: '#1877F2'
      },
      {
        platform: 'LinkedIn',
        users: Math.floor(Math.random() * 6000) + 3000,
        engagement: Math.random() * 10 + 5,
        revenue: Math.floor(Math.random() * 25000) + 12000,
        growth: (Math.random() - 0.2) * 60,
        color: '#0A66C2'
      },
      {
        platform: 'Twitter',
        users: Math.floor(Math.random() * 7000) + 3500,
        engagement: Math.random() * 7 + 3.5,
        revenue: Math.floor(Math.random() * 12000) + 6000,
        growth: (Math.random() - 0.4) * 35,
        color: '#1DA1F2'
      },
      {
        platform: 'YouTube',
        users: Math.floor(Math.random() * 5000) + 2500,
        engagement: Math.random() * 12 + 6,
        revenue: Math.floor(Math.random() * 30000) + 15000,
        growth: (Math.random() - 0.1) * 70,
        color: '#FF0000'
      },
      {
        platform: 'TikTok',
        users: Math.floor(Math.random() * 12000) + 6000,
        engagement: Math.random() * 15 + 8,
        revenue: Math.floor(Math.random() * 18000) + 9000,
        growth: (Math.random() + 0.2) * 80,
        color: '#000000'
      }
    ],
    
    // Audience demographics
    audienceDemographics: {
      ageGroups: [
        { age: '18-24', percentage: Math.random() * 20 + 15, count: Math.floor(Math.random() * 5000) + 2000 },
        { age: '25-34', percentage: Math.random() * 25 + 20, count: Math.floor(Math.random() * 8000) + 4000 },
        { age: '35-44', percentage: Math.random() * 20 + 15, count: Math.floor(Math.random() * 6000) + 3000 },
        { age: '45-54', percentage: Math.random() * 15 + 10, count: Math.floor(Math.random() * 4000) + 2000 },
        { age: '55+', percentage: Math.random() * 15 + 5, count: Math.floor(Math.random() * 3000) + 1000 }
      ],
      genderDistribution: [
        { gender: 'Female', percentage: Math.random() * 20 + 40, count: Math.floor(Math.random() * 12000) + 8000 },
        { gender: 'Male', percentage: Math.random() * 20 + 35, count: Math.floor(Math.random() * 10000) + 7000 },
        { gender: 'Other', percentage: Math.random() * 10 + 5, count: Math.floor(Math.random() * 2000) + 500 }
      ],
      topLocations: [
        { country: 'United States', percentage: Math.random() * 20 + 30, count: Math.floor(Math.random() * 8000) + 6000 },
        { country: 'Canada', percentage: Math.random() * 10 + 8, count: Math.floor(Math.random() * 3000) + 2000 },
        { country: 'United Kingdom', percentage: Math.random() * 8 + 6, count: Math.floor(Math.random() * 2500) + 1500 },
        { country: 'Australia', percentage: Math.random() * 6 + 4, count: Math.floor(Math.random() * 2000) + 1000 },
        { country: 'Germany', percentage: Math.random() * 5 + 3, count: Math.floor(Math.random() * 1500) + 800 }
      ]
    },
    
    // Content performance
    contentPerformance: {
      topPosts: Array.from({ length: 10 }, (_, i) => ({
        id: `post_${i + 1}`,
        title: `Top Performing Post ${i + 1}`,
        platform: ['Instagram', 'Facebook', 'LinkedIn', 'Twitter'][Math.floor(Math.random() * 4)],
        engagement: Math.floor(Math.random() * 10000) + 1000,
        reach: Math.floor(Math.random() * 50000) + 10000,
        clicks: Math.floor(Math.random() * 2000) + 500,
        shares: Math.floor(Math.random() * 500) + 100,
        comments: Math.floor(Math.random() * 200) + 50,
        likes: Math.floor(Math.random() * 5000) + 1000,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })),
      contentTypes: [
        { type: 'Image', posts: Math.floor(Math.random() * 500) + 200, engagement: Math.random() * 8 + 4 },
        { type: 'Video', posts: Math.floor(Math.random() * 300) + 150, engagement: Math.random() * 12 + 6 },
        { type: 'Carousel', posts: Math.floor(Math.random() * 200) + 100, engagement: Math.random() * 10 + 5 },
        { type: 'Story', posts: Math.floor(Math.random() * 400) + 200, engagement: Math.random() * 6 + 3 },
        { type: 'Reel', posts: Math.floor(Math.random() * 250) + 125, engagement: Math.random() * 15 + 8 }
      ],
      hashtagPerformance: Array.from({ length: 20 }, (_, i) => ({
        hashtag: `#hashtag${i + 1}`,
        usage: Math.floor(Math.random() * 1000) + 100,
        reach: Math.floor(Math.random() * 50000) + 5000,
        engagement: Math.random() * 8 + 2
      }))
    },
    
    // Revenue breakdown
    revenueBreakdown: {
      byPlan: [
        { plan: 'Starter', revenue: Math.floor(Math.random() * 10000) + 5000, users: Math.floor(Math.random() * 500) + 200 },
        { plan: 'Professional', revenue: Math.floor(Math.random() * 25000) + 15000, users: Math.floor(Math.random() * 300) + 150 },
        { plan: 'Enterprise', revenue: Math.floor(Math.random() * 50000) + 30000, users: Math.floor(Math.random() * 100) + 50 }
      ],
      byRegion: [
        { region: 'North America', revenue: Math.floor(Math.random() * 40000) + 25000 },
        { region: 'Europe', revenue: Math.floor(Math.random() * 25000) + 15000 },
        { region: 'Asia Pacific', revenue: Math.floor(Math.random() * 20000) + 10000 },
        { region: 'Latin America', revenue: Math.floor(Math.random() * 10000) + 5000 },
        { region: 'Other', revenue: Math.floor(Math.random() * 5000) + 2000 }
      ],
      monthlyRecurring: Math.floor(Math.random() * 80000) + 50000,
      churnRate: Math.random() * 5 + 2,
      lifetimeValue: Math.floor(Math.random() * 2000) + 1000
    },
    
    // Performance insights
    insights: [
      {
        type: 'opportunity',
        title: 'Instagram Engagement Surge',
        description: 'Instagram engagement is up 45% this week. Consider increasing content frequency.',
        impact: 'high',
        action: 'Increase Instagram posting schedule'
      },
      {
        type: 'warning',
        title: 'Facebook Reach Declining',
        description: 'Facebook organic reach has decreased by 12% over the past month.',
        impact: 'medium',
        action: 'Review Facebook content strategy'
      },
      {
        type: 'success',
        title: 'LinkedIn Conversion Rate',
        description: 'LinkedIn is showing the highest conversion rate at 8.3%.',
        impact: 'high',
        action: 'Allocate more budget to LinkedIn campaigns'
      },
      {
        type: 'info',
        title: 'Video Content Performance',
        description: 'Video content generates 3x more engagement than static posts.',
        impact: 'medium',
        action: 'Increase video content production'
      }
    ],
    
    // Competitive analysis
    competitiveAnalysis: {
      marketShare: Math.random() * 20 + 10,
      competitorComparison: [
        { competitor: 'Competitor A', marketShare: Math.random() * 15 + 8, growth: (Math.random() - 0.5) * 20 },
        { competitor: 'Competitor B', marketShare: Math.random() * 12 + 6, growth: (Math.random() - 0.5) * 15 },
        { competitor: 'Competitor C', marketShare: Math.random() * 10 + 5, growth: (Math.random() - 0.5) * 25 }
      ],
      industryBenchmarks: {
        avgEngagementRate: Math.random() * 5 + 3,
        avgConversionRate: Math.random() * 3 + 1.5,
        avgCostPerClick: Math.random() * 2 + 0.5
      }
    },
    
    // Predictive analytics
    predictions: {
      nextMonthRevenue: Math.floor(Math.random() * 100000) + 60000,
      nextMonthUsers: Math.floor(Math.random() * 5000) + 3000,
      seasonalTrends: [
        { month: 'Jan', predicted: Math.random() * 20000 + 40000 },
        { month: 'Feb', predicted: Math.random() * 20000 + 45000 },
        { month: 'Mar', predicted: Math.random() * 20000 + 50000 },
        { month: 'Apr', predicted: Math.random() * 20000 + 55000 },
        { month: 'May', predicted: Math.random() * 20000 + 60000 },
        { month: 'Jun', predicted: Math.random() * 20000 + 65000 }
      ]
    },
    
    last_updated: new Date().toISOString()
  };
};

// @route   GET /api/advanced-analytics/overview
// @desc    Get comprehensive advanced analytics overview
// @access  Admin
router.get('/overview', async (req, res) => {
  try {
    const { 
      timeRange = '30d',
      metrics = ['revenue', 'users', 'engagement'],
      platforms = ['all']
    } = req.query;

    const analyticsData = generateAdvancedAnalyticsData(timeRange);

    // Filter by platforms if specified
    if (!platforms.includes('all')) {
      analyticsData.platformPerformance = analyticsData.platformPerformance.filter(
        platform => platforms.includes(platform.platform.toLowerCase())
      );
    }

    // Filter metrics if specified
    const metricsArray = Array.isArray(metrics) ? metrics : [metrics];
    const filteredData = {
      ...analyticsData,
      requestedMetrics: metricsArray,
      appliedFilters: {
        timeRange,
        platforms,
        metrics: metricsArray
      }
    };

    res.json({
      success: true,
      data: filteredData
    });

  } catch (error) {
    console.error('Advanced analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advanced analytics overview',
      error: error.message
    });
  }
});

// @route   GET /api/advanced-analytics/platform-performance
// @desc    Get platform-specific performance analytics
// @access  Admin
router.get('/platform-performance', async (req, res) => {
  try {
    const { timeRange = '30d', platform = 'all' } = req.query;
    
    const analyticsData = generateAdvancedAnalyticsData(timeRange);
    let platformData = analyticsData.platformPerformance;

    if (platform !== 'all') {
      platformData = platformData.filter(p => 
        p.platform.toLowerCase() === platform.toLowerCase()
      );
    }

    // Add detailed metrics for each platform
    const detailedPlatformData = platformData.map(p => ({
      ...p,
      detailedMetrics: {
        postsPublished: Math.floor(Math.random() * 200) + 50,
        avgEngagementPerPost: Math.random() * 500 + 100,
        topPerformingTime: `${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        audienceGrowthRate: (Math.random() - 0.3) * 20,
        clickThroughRate: Math.random() * 5 + 1,
        costPerEngagement: Math.random() * 2 + 0.5,
        reachGrowth: (Math.random() - 0.2) * 30,
        impressionShare: Math.random() * 40 + 30
      }
    }));

    res.json({
      success: true,
      data: {
        platforms: detailedPlatformData,
        summary: {
          totalPlatforms: detailedPlatformData.length,
          bestPerforming: detailedPlatformData.reduce((best, current) => 
            current.engagement > best.engagement ? current : best
          ),
          totalUsers: detailedPlatformData.reduce((sum, p) => sum + p.users, 0),
          totalRevenue: detailedPlatformData.reduce((sum, p) => sum + p.revenue, 0),
          avgEngagement: detailedPlatformData.reduce((sum, p) => sum + p.engagement, 0) / detailedPlatformData.length
        },
        timeRange,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Platform performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform performance data',
      error: error.message
    });
  }
});

// @route   GET /api/advanced-analytics/revenue-analytics
// @desc    Get detailed revenue analytics
// @access  Admin
router.get('/revenue-analytics', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const analyticsData = generateAdvancedAnalyticsData(timeRange);
    
    const revenueAnalytics = {
      ...analyticsData.revenueBreakdown,
      timeSeriesRevenue: analyticsData.timeSeriesData.map(day => ({
        date: day.date,
        revenue: day.revenue,
        subscriptions: Math.floor(Math.random() * 50) + 20,
        oneTimePayments: Math.floor(Math.random() * 20) + 5
      })),
      metrics: {
        totalRevenue: analyticsData.totalRevenue,
        revenueGrowth: analyticsData.revenueChange,
        averageRevenuePerUser: Math.floor(analyticsData.totalRevenue / analyticsData.activeUsers),
        monthlyRecurringRevenue: analyticsData.revenueBreakdown.monthlyRecurring,
        churnRate: analyticsData.revenueBreakdown.churnRate,
        customerLifetimeValue: analyticsData.revenueBreakdown.lifetimeValue
      },
      forecasting: analyticsData.predictions,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: revenueAnalytics
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: error.message
    });
  }
});

// @route   GET /api/advanced-analytics/custom-reports
// @desc    Get custom reports and saved analytics
// @access  Admin
router.get('/custom-reports', async (req, res) => {
  try {
    const customReports = [
      {
        id: 'report_1',
        name: 'Weekly Performance Summary',
        description: 'Comprehensive weekly performance across all platforms',
        type: 'scheduled',
        frequency: 'weekly',
        last_generated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        next_generation: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        metrics: ['revenue', 'engagement', 'users', 'conversions'],
        platforms: ['instagram', 'facebook', 'linkedin'],
        status: 'active',
        created_by: 'Admin User',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'report_2',
        name: 'Monthly Revenue Deep Dive',
        description: 'Detailed monthly revenue analysis with forecasting',
        type: 'scheduled',
        frequency: 'monthly',
        last_generated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        next_generation: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        metrics: ['revenue', 'subscriptions', 'churn', 'ltv'],
        platforms: ['all'],
        status: 'active',
        created_by: 'Finance Manager',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'report_3',
        name: 'Content Performance Analysis',
        description: 'Analysis of top-performing content across platforms',
        type: 'on_demand',
        frequency: 'manual',
        last_generated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        next_generation: null,
        metrics: ['engagement', 'reach', 'clicks', 'shares'],
        platforms: ['instagram', 'facebook', 'twitter', 'linkedin'],
        status: 'active',
        created_by: 'Content Manager',
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        reports: customReports,
        summary: {
          total_reports: customReports.length,
          active_reports: customReports.filter(r => r.status === 'active').length,
          scheduled_reports: customReports.filter(r => r.type === 'scheduled').length,
          on_demand_reports: customReports.filter(r => r.type === 'on_demand').length
        },
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Custom reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom reports',
      error: error.message
    });
  }
});

// @route   POST /api/advanced-analytics/custom-reports
// @desc    Create new custom report
// @access  Admin
router.post('/custom-reports', async (req, res) => {
  try {
    const {
      name,
      description,
      type = 'on_demand',
      frequency = 'manual',
      metrics = [],
      platforms = ['all'],
      schedule = null
    } = req.body;

    if (!name || !metrics.length) {
      return res.status(400).json({
        success: false,
        message: 'Report name and metrics are required'
      });
    }

    const newReport = {
      id: `report_${Date.now()}`,
      name,
      description: description || '',
      type,
      frequency,
      metrics,
      platforms,
      schedule,
      status: 'active',
      created_by: req.user.email || 'Admin User',
      created_at: new Date().toISOString(),
      last_generated: null,
      next_generation: type === 'scheduled' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null
    };

    res.status(201).json({
      success: true,
      message: 'Custom report created successfully',
      data: newReport
    });

  } catch (error) {
    console.error('Create custom report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom report',
      error: error.message
    });
  }
});

// @route   GET /api/advanced-analytics/insights
// @desc    Get AI-powered insights and recommendations
// @access  Admin
router.get('/insights', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const analyticsData = generateAdvancedAnalyticsData(timeRange);
    
    const insights = {
      performance_insights: analyticsData.insights,
      competitive_analysis: analyticsData.competitiveAnalysis,
      recommendations: [
        {
          id: 'rec_1',
          type: 'content_optimization',
          priority: 'high',
          title: 'Optimize Video Content Strategy',
          description: 'Video content shows 3x higher engagement. Increase video production by 40%.',
          expected_impact: '+25% engagement',
          effort_required: 'medium',
          timeframe: '2-4 weeks'
        },
        {
          id: 'rec_2',
          type: 'platform_focus',
          priority: 'high',
          title: 'Increase LinkedIn Investment',
          description: 'LinkedIn shows highest conversion rate. Allocate 30% more budget.',
          expected_impact: '+15% conversions',
          effort_required: 'low',
          timeframe: '1-2 weeks'
        },
        {
          id: 'rec_3',
          type: 'audience_targeting',
          priority: 'medium',
          title: 'Target 25-34 Age Group',
          description: 'This demographic shows highest engagement and conversion potential.',
          expected_impact: '+12% ROI',
          effort_required: 'medium',
          timeframe: '3-6 weeks'
        }
      ],
      anomalies: [
        {
          metric: 'engagement_rate',
          platform: 'Instagram',
          change: '+45%',
          significance: 'high',
          description: 'Unusual spike in Instagram engagement detected',
          possible_causes: ['Viral content', 'Algorithm change', 'Trending hashtag']
        },
        {
          metric: 'conversion_rate',
          platform: 'Facebook',
          change: '-18%',
          significance: 'medium',
          description: 'Facebook conversion rate decline detected',
          possible_causes: ['Ad fatigue', 'Audience saturation', 'Seasonal trend']
        }
      ],
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Analytics insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics insights',
      error: error.message
    });
  }
});

module.exports = router;
