const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Content = require('../models/Content');
const SocialProfile = require('../models/SocialProfile');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for analytics endpoints
const analyticsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many analytics requests from this IP'
});

// Apply rate limiting and auth to all routes
router.use(analyticsRateLimit);
router.use(auth);

// @route   GET /api/customer-analytics/overview
// @desc    Get analytics overview for customer dashboard
// @access  Private
router.get('/overview', async (req, res) => {
  try {
    const { timeRange = '30d', platform = 'all' } = req.query;
    const userId = req.user.id;
    
    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : 
                    timeRange === '30d' ? 30 : 
                    timeRange === '90d' ? 90 : 
                    timeRange === '1y' ? 365 : 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Build platform filter
    let platformFilter = {};
    if (platform !== 'all') {
      platformFilter.platform = platform;
    }

    // Get user's content for the time range
    const userContent = await Content.find({
      userId,
      createdAt: { $gte: startDate },
      ...platformFilter
    });

    // Get user's social profiles
    const socialProfiles = await SocialProfile.find({ userId });

    // Calculate overview metrics (mock data with some real calculations)
    const totalPosts = userContent.length;
    const publishedPosts = userContent.filter(c => c.status === 'published').length;
    const scheduledPosts = userContent.filter(c => c.status === 'scheduled').length;

    // Mock engagement metrics (replace with real social media API data)
    const totalReach = Math.floor(Math.random() * 50000) + 10000;
    const totalImpressions = Math.floor(totalReach * 2.5);
    const totalEngagements = Math.floor(totalReach * 0.05);
    const totalFollowers = socialProfiles.reduce((sum, profile) => sum + (profile.followers || 0), 0);

    // Calculate engagement rate
    const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions * 100) : 0;

    // Mock growth metrics
    const followerGrowth = Math.floor(Math.random() * 500) + 50;
    const reachGrowth = Math.floor(Math.random() * 20) + 5;
    const engagementGrowth = Math.floor(Math.random() * 15) + 2;

    const overviewData = {
      summary: {
        totalPosts,
        publishedPosts,
        scheduledPosts,
        totalReach,
        totalImpressions,
        totalEngagements,
        totalFollowers,
        engagementRate: Math.round(engagementRate * 100) / 100,
        followerGrowth,
        reachGrowth,
        engagementGrowth
      },
      platforms: socialProfiles.map(profile => ({
        platform: profile.platform,
        followers: profile.followers || Math.floor(Math.random() * 5000) + 500,
        posts: userContent.filter(c => c.platform === profile.platform).length,
        engagement: Math.floor(Math.random() * 1000) + 100,
        reach: Math.floor(Math.random() * 10000) + 1000
      })),
      timeRange,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: overviewData
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics overview',
      error: error.message
    });
  }
});

// @route   GET /api/customer-analytics/performance
// @desc    Get performance analytics data
// @access  Private
router.get('/performance', async (req, res) => {
  try {
    const { timeRange = '30d', metric = 'engagement', platform = 'all' } = req.query;
    const userId = req.user.id;
    
    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : 
                    timeRange === '30d' ? 30 : 
                    timeRange === '90d' ? 90 : 
                    timeRange === '1y' ? 365 : 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Generate mock performance trend data
    const performanceTrend = [];
    const dataPoints = Math.min(daysBack, 30); // Max 30 data points for readability
    const interval = Math.ceil(daysBack / dataPoints);

    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(startDate.getTime() + (i * interval * 24 * 60 * 60 * 1000));
      const baseValue = metric === 'engagement' ? 150 : 
                       metric === 'reach' ? 2500 : 
                       metric === 'impressions' ? 5000 : 100;
      
      const variation = Math.random() * 0.4 - 0.2; // ±20% variation
      const value = Math.floor(baseValue * (1 + variation));

      performanceTrend.push({
        date: date.toISOString().split('T')[0],
        value,
        metric
      });
    }

    // Calculate performance metrics
    const currentValue = performanceTrend[performanceTrend.length - 1]?.value || 0;
    const previousValue = performanceTrend[performanceTrend.length - 2]?.value || 0;
    const change = previousValue > 0 ? ((currentValue - previousValue) / previousValue * 100) : 0;

    // Top performing content (mock data)
    const topContent = [
      {
        id: '1',
        title: 'AI Tools for Social Media Marketing',
        platform: 'linkedin',
        engagement: 245,
        reach: 3200,
        impressions: 8500,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        title: 'Social Media Trends 2024',
        platform: 'instagram',
        engagement: 189,
        reach: 2800,
        impressions: 6200,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        title: 'Content Strategy Tips',
        platform: 'twitter',
        engagement: 156,
        reach: 2100,
        impressions: 4800,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const performanceData = {
      trend: performanceTrend,
      summary: {
        currentValue,
        change: Math.round(change * 100) / 100,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      },
      topContent,
      metric,
      timeRange,
      platform,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance analytics',
      error: error.message
    });
  }
});

// @route   GET /api/customer-analytics/engagement
// @desc    Get engagement analytics data
// @access  Private
router.get('/engagement', async (req, res) => {
  try {
    const { timeRange = '30d', platform = 'all' } = req.query;
    const userId = req.user.id;

    // Mock engagement breakdown data
    const engagementBreakdown = [
      { type: 'likes', value: Math.floor(Math.random() * 1000) + 500, color: '#FF6B6B' },
      { type: 'comments', value: Math.floor(Math.random() * 200) + 100, color: '#4ECDC4' },
      { type: 'shares', value: Math.floor(Math.random() * 150) + 50, color: '#45B7D1' },
      { type: 'saves', value: Math.floor(Math.random() * 100) + 25, color: '#96CEB4' }
    ];

    // Mock engagement by platform
    const platformEngagement = [
      { platform: 'instagram', engagement: Math.floor(Math.random() * 500) + 200, color: '#E4405F' },
      { platform: 'linkedin', engagement: Math.floor(Math.random() * 300) + 150, color: '#0077B5' },
      { platform: 'twitter', engagement: Math.floor(Math.random() * 250) + 100, color: '#1DA1F2' },
      { platform: 'facebook', engagement: Math.floor(Math.random() * 200) + 80, color: '#1877F2' }
    ];

    // Mock engagement rate by post type
    const postTypeEngagement = [
      { type: 'image', rate: 3.2, posts: 15 },
      { type: 'video', rate: 4.8, posts: 8 },
      { type: 'carousel', rate: 5.1, posts: 12 },
      { type: 'text', rate: 2.1, posts: 6 }
    ];

    // Mock best performing times
    const bestTimes = [
      { hour: 9, engagement: 85 },
      { hour: 12, engagement: 92 },
      { hour: 15, engagement: 78 },
      { hour: 18, engagement: 95 },
      { hour: 21, engagement: 88 }
    ];

    const engagementData = {
      breakdown: engagementBreakdown,
      platformEngagement,
      postTypeEngagement,
      bestTimes,
      summary: {
        totalEngagement: engagementBreakdown.reduce((sum, item) => sum + item.value, 0),
        averageRate: 3.8,
        topPlatform: platformEngagement.reduce((max, platform) => 
          platform.engagement > max.engagement ? platform : max
        ).platform
      },
      timeRange,
      platform,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: engagementData
    });

  } catch (error) {
    console.error('Engagement analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch engagement analytics',
      error: error.message
    });
  }
});

// @route   GET /api/customer-analytics/audience
// @desc    Get audience analytics data
// @access  Private
router.get('/audience', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const userId = req.user.id;

    // Mock audience demographics
    const demographics = {
      age: [
        { range: '18-24', percentage: 15, count: 450 },
        { range: '25-34', percentage: 35, count: 1050 },
        { range: '35-44', percentage: 28, count: 840 },
        { range: '45-54', percentage: 15, count: 450 },
        { range: '55+', percentage: 7, count: 210 }
      ],
      gender: [
        { type: 'female', percentage: 52, count: 1560 },
        { type: 'male', percentage: 45, count: 1350 },
        { type: 'other', percentage: 3, count: 90 }
      ],
      location: [
        { country: 'United States', percentage: 45, count: 1350 },
        { country: 'Canada', percentage: 12, count: 360 },
        { country: 'United Kingdom', percentage: 10, count: 300 },
        { country: 'Australia', percentage: 8, count: 240 },
        { country: 'Germany', percentage: 7, count: 210 },
        { country: 'Other', percentage: 18, count: 540 }
      ]
    };

    // Mock audience growth
    const audienceGrowth = [];
    const daysBack = timeRange === '7d' ? 7 : 
                    timeRange === '30d' ? 30 : 
                    timeRange === '90d' ? 90 : 30;
    const startDate = new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000));

    for (let i = 0; i < daysBack; i++) {
      const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      const baseFollowers = 3000;
      const growth = Math.floor(Math.random() * 20) - 5; // -5 to +15 daily growth
      
      audienceGrowth.push({
        date: date.toISOString().split('T')[0],
        followers: baseFollowers + (i * 5) + growth,
        growth
      });
    }

    // Mock audience interests
    const interests = [
      { category: 'Technology', percentage: 28 },
      { category: 'Marketing', percentage: 22 },
      { category: 'Business', percentage: 18 },
      { category: 'Design', percentage: 15 },
      { category: 'Social Media', percentage: 12 },
      { category: 'Other', percentage: 5 }
    ];

    const audienceData = {
      demographics,
      growth: audienceGrowth,
      interests,
      summary: {
        totalFollowers: audienceGrowth[audienceGrowth.length - 1]?.followers || 3000,
        growthRate: 2.3,
        topAgeGroup: '25-34',
        topLocation: 'United States',
        engagementByAge: demographics.age.map(group => ({
          ...group,
          engagement: Math.random() * 5 + 2 // 2-7% engagement rate
        }))
      },
      timeRange,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: audienceData
    });

  } catch (error) {
    console.error('Audience analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audience analytics',
      error: error.message
    });
  }
});

// @route   GET /api/customer-analytics/content
// @desc    Get content analytics data
// @access  Private
router.get('/content', async (req, res) => {
  try {
    const { timeRange = '30d', platform = 'all' } = req.query;
    const userId = req.user.id;

    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : 
                    timeRange === '30d' ? 30 : 
                    timeRange === '90d' ? 90 : 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Build platform filter
    let platformFilter = {};
    if (platform !== 'all') {
      platformFilter.platform = platform;
    }

    // Get user's content for the time range
    const userContent = await Content.find({
      userId,
      createdAt: { $gte: startDate },
      ...platformFilter
    }).sort({ createdAt: -1 });

    // Mock content performance data
    const contentPerformance = userContent.map(content => ({
      id: content._id,
      title: content.title || content.content?.substring(0, 50) + '...',
      platform: content.platform,
      type: content.type || 'image',
      publishedAt: content.publishedAt || content.createdAt,
      engagement: Math.floor(Math.random() * 500) + 50,
      reach: Math.floor(Math.random() * 5000) + 500,
      impressions: Math.floor(Math.random() * 10000) + 1000,
      clicks: Math.floor(Math.random() * 200) + 20,
      saves: Math.floor(Math.random() * 100) + 10,
      shares: Math.floor(Math.random() * 50) + 5
    }));

    // Content type performance
    const contentTypes = ['image', 'video', 'carousel', 'text'];
    const typePerformance = contentTypes.map(type => {
      const typeContent = contentPerformance.filter(c => c.type === type);
      const avgEngagement = typeContent.length > 0 
        ? typeContent.reduce((sum, c) => sum + c.engagement, 0) / typeContent.length 
        : 0;
      
      return {
        type,
        count: typeContent.length,
        avgEngagement: Math.round(avgEngagement),
        totalReach: typeContent.reduce((sum, c) => sum + c.reach, 0)
      };
    });

    // Publishing frequency
    const publishingFrequency = [];
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      const dayContent = userContent.filter(c => {
        const contentDate = new Date(c.createdAt);
        return contentDate.toDateString() === date.toDateString();
      });
      
      publishingFrequency.push({
        date: date.toISOString().split('T')[0],
        posts: dayContent.length
      });
    }

    const contentData = {
      performance: contentPerformance,
      typePerformance,
      publishingFrequency,
      summary: {
        totalPosts: userContent.length,
        avgEngagement: Math.round(
          contentPerformance.reduce((sum, c) => sum + c.engagement, 0) / contentPerformance.length || 0
        ),
        bestPerforming: contentPerformance.sort((a, b) => b.engagement - a.engagement)[0],
        mostActiveDay: publishingFrequency.reduce((max, day) => 
          day.posts > max.posts ? day : max, { posts: 0 }
        )
      },
      timeRange,
      platform,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: contentData
    });

  } catch (error) {
    console.error('Content analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content analytics',
      error: error.message
    });
  }
});

// @route   GET /api/customer-analytics/export
// @desc    Export analytics data
// @access  Private
router.get('/export', async (req, res) => {
  try {
    const { timeRange = '30d', format = 'json' } = req.query;
    const userId = req.user.id;

    // This would typically generate a comprehensive report
    // For now, return a success message
    res.json({
      success: true,
      message: 'Analytics export initiated',
      data: {
        exportId: `export_${Date.now()}`,
        format,
        timeRange,
        status: 'processing',
        estimatedTime: '2-3 minutes'
      }
    });

  } catch (error) {
    console.error('Analytics export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics',
      error: error.message
    });
  }
});

module.exports = router;
