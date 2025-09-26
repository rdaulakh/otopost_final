const express = require('express');
const Content = require('../models/Content');
const SocialProfile = require('../models/SocialProfile');
const { auth, checkSubscription } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics overview
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get content analytics
    const contentAnalytics = await Content.aggregate([
      {
        $match: {
          user: req.user.id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalViews: { $sum: '$analytics.views' },
          totalLikes: { $sum: '$analytics.likes' },
          totalShares: { $sum: '$analytics.shares' },
          totalComments: { $sum: '$analytics.comments' },
          totalReach: { $sum: '$analytics.reach' },
          totalImpressions: { $sum: '$analytics.impressions' },
          avgEngagementRate: { $avg: '$analytics.engagement.rate' }
        }
      }
    ]);

    // Get social profiles summary
    const socialProfiles = await SocialProfile.find({
      user: req.user.id,
      isActive: true
    });

    // Calculate growth metrics
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(period));

    const previousPeriodAnalytics = await Content.aggregate([
      {
        $match: {
          user: req.user.id,
          createdAt: { $gte: previousPeriodStart, $lt: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalViews: { $sum: '$analytics.views' },
          totalLikes: { $sum: '$analytics.likes' },
          totalShares: { $sum: '$analytics.shares' },
          totalComments: { $sum: '$analytics.comments' },
          totalReach: { $sum: '$analytics.reach' },
          totalImpressions: { $sum: '$analytics.impressions' }
        }
      }
    ]);

    const current = contentAnalytics[0] || {
      totalPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
      totalReach: 0,
      totalImpressions: 0,
      avgEngagementRate: 0
    };

    const previous = previousPeriodAnalytics[0] || {
      totalPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
      totalReach: 0,
      totalImpressions: 0
    };

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const dashboard = {
      overview: {
        totalPosts: current.totalPosts,
        totalViews: current.totalViews,
        totalLikes: current.totalLikes,
        totalShares: current.totalShares,
        totalComments: current.totalComments,
        totalReach: current.totalReach,
        totalImpressions: current.totalImpressions,
        avgEngagementRate: current.avgEngagementRate || 0,
        totalEngagement: current.totalLikes + current.totalShares + current.totalComments
      },
      growth: {
        posts: calculateGrowth(current.totalPosts, previous.totalPosts),
        views: calculateGrowth(current.totalViews, previous.totalViews),
        likes: calculateGrowth(current.totalLikes, previous.totalLikes),
        shares: calculateGrowth(current.totalShares, previous.totalShares),
        comments: calculateGrowth(current.totalComments, previous.totalComments),
        reach: calculateGrowth(current.totalReach, previous.totalReach),
        impressions: calculateGrowth(current.totalImpressions, previous.totalImpressions)
      },
      socialProfiles: {
        total: socialProfiles.length,
        connected: socialProfiles.filter(p => p.connectionStatus === 'connected').length,
        totalFollowers: socialProfiles.reduce((sum, p) => sum + (p.followerCount || 0), 0),
        platforms: socialProfiles.map(p => ({
          platform: p.platform,
          username: p.username,
          followers: p.followerCount,
          connectionStatus: p.connectionStatus
        }))
      },
      period: parseInt(period)
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/analytics/performance
// @desc    Get detailed performance analytics
// @access  Private
router.get('/performance', auth, async (req, res) => {
  try {
    const { period = '30', platform, postType } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Build match criteria
    const matchCriteria = {
      user: req.user.id,
      createdAt: { $gte: startDate },
      status: 'published'
    };

    if (platform) {
      matchCriteria['platforms.platform'] = platform;
    }

    if (postType) {
      matchCriteria.postType = postType;
    }

    // Get performance by day
    const dailyPerformance = await Content.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          posts: { $sum: 1 },
          views: { $sum: '$analytics.views' },
          likes: { $sum: '$analytics.likes' },
          shares: { $sum: '$analytics.shares' },
          comments: { $sum: '$analytics.comments' },
          reach: { $sum: '$analytics.reach' },
          impressions: { $sum: '$analytics.impressions' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get performance by platform
    const platformPerformance = await Content.aggregate([
      { $match: matchCriteria },
      { $unwind: '$platforms' },
      {
        $group: {
          _id: '$platforms.platform',
          posts: { $sum: 1 },
          views: { $sum: '$analytics.views' },
          likes: { $sum: '$analytics.likes' },
          shares: { $sum: '$analytics.shares' },
          comments: { $sum: '$analytics.comments' },
          reach: { $sum: '$analytics.reach' },
          impressions: { $sum: '$analytics.impressions' }
        }
      }
    ]);

    // Get performance by post type
    const postTypePerformance = await Content.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: '$postType',
          posts: { $sum: 1 },
          views: { $sum: '$analytics.views' },
          likes: { $sum: '$analytics.likes' },
          shares: { $sum: '$analytics.shares' },
          comments: { $sum: '$analytics.comments' },
          reach: { $sum: '$analytics.reach' },
          impressions: { $sum: '$analytics.impressions' },
          avgEngagementRate: { $avg: '$analytics.engagement.rate' }
        }
      }
    ]);

    // Get top performing content
    const topContent = await Content.find(matchCriteria)
      .sort({ 'analytics.engagement.rate': -1 })
      .limit(10)
      .select('title content.text analytics postType platforms createdAt');

    res.json({
      dailyPerformance,
      platformPerformance,
      postTypePerformance,
      topContent,
      period: parseInt(period)
    });
  } catch (error) {
    console.error('Get performance analytics error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/analytics/engagement
// @desc    Get engagement analytics and insights
// @access  Private
router.get('/engagement', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get engagement trends
    const engagementTrends = await Content.aggregate([
      {
        $match: {
          user: req.user.id,
          createdAt: { $gte: startDate },
          status: 'published'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          avgEngagementRate: { $avg: '$analytics.engagement.rate' },
          totalLikes: { $sum: '$analytics.likes' },
          totalShares: { $sum: '$analytics.shares' },
          totalComments: { $sum: '$analytics.comments' },
          totalReach: { $sum: '$analytics.reach' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get engagement by time of day
    const engagementByHour = await Content.aggregate([
      {
        $match: {
          user: req.user.id,
          createdAt: { $gte: startDate },
          status: 'published'
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          avgEngagementRate: { $avg: '$analytics.engagement.rate' },
          posts: { $sum: 1 },
          totalEngagement: {
            $sum: {
              $add: ['$analytics.likes', '$analytics.shares', '$analytics.comments']
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get engagement by day of week
    const engagementByDay = await Content.aggregate([
      {
        $match: {
          user: req.user.id,
          createdAt: { $gte: startDate },
          status: 'published'
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          avgEngagementRate: { $avg: '$analytics.engagement.rate' },
          posts: { $sum: 1 },
          totalEngagement: {
            $sum: {
              $add: ['$analytics.likes', '$analytics.shares', '$analytics.comments']
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get hashtag performance
    const hashtagPerformance = await Content.aggregate([
      {
        $match: {
          user: req.user.id,
          createdAt: { $gte: startDate },
          status: 'published'
        }
      },
      { $unwind: '$content.hashtags' },
      {
        $group: {
          _id: '$content.hashtags',
          usage: { $sum: 1 },
          avgEngagementRate: { $avg: '$analytics.engagement.rate' },
          totalReach: { $sum: '$analytics.reach' },
          totalEngagement: {
            $sum: {
              $add: ['$analytics.likes', '$analytics.shares', '$analytics.comments']
            }
          }
        }
      },
      { $sort: { avgEngagementRate: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      engagementTrends,
      engagementByHour,
      engagementByDay: engagementByDay.map(day => ({
        ...day,
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day._id - 1]
      })),
      hashtagPerformance,
      period: parseInt(period)
    });
  } catch (error) {
    console.error('Get engagement analytics error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/analytics/audience
// @desc    Get audience insights and demographics
// @access  Private
router.get('/audience', auth, async (req, res) => {
  try {
    const socialProfiles = await SocialProfile.find({
      user: req.user.id,
      isActive: true,
      connectionStatus: 'connected'
    }).select('platform analytics.audienceInsights followerCount');

    // Aggregate audience data across platforms
    const audienceInsights = {
      totalFollowers: 0,
      demographics: {
        ageGroups: {},
        gender: { male: 0, female: 0, other: 0 },
        locations: {}
      },
      interests: {},
      activeHours: Array(24).fill(0),
      platformBreakdown: {}
    };

    socialProfiles.forEach(profile => {
      audienceInsights.totalFollowers += profile.followerCount || 0;
      
      // Platform breakdown
      audienceInsights.platformBreakdown[profile.platform] = {
        followers: profile.followerCount || 0,
        insights: profile.analytics.audienceInsights || {}
      };

      // Aggregate demographics
      const insights = profile.analytics.audienceInsights;
      if (insights) {
        // Age groups
        if (insights.demographics?.ageGroups) {
          insights.demographics.ageGroups.forEach(age => {
            if (!audienceInsights.demographics.ageGroups[age.range]) {
              audienceInsights.demographics.ageGroups[age.range] = 0;
            }
            audienceInsights.demographics.ageGroups[age.range] += age.percentage || 0;
          });
        }

        // Gender
        if (insights.demographics?.gender) {
          audienceInsights.demographics.gender.male += insights.demographics.gender.male || 0;
          audienceInsights.demographics.gender.female += insights.demographics.gender.female || 0;
          audienceInsights.demographics.gender.other += insights.demographics.gender.other || 0;
        }

        // Locations
        if (insights.demographics?.locations) {
          insights.demographics.locations.forEach(location => {
            const key = `${location.city}, ${location.country}`;
            if (!audienceInsights.demographics.locations[key]) {
              audienceInsights.demographics.locations[key] = 0;
            }
            audienceInsights.demographics.locations[key] += location.percentage || 0;
          });
        }

        // Interests
        if (insights.interests) {
          insights.interests.forEach(interest => {
            if (!audienceInsights.interests[interest.category]) {
              audienceInsights.interests[interest.category] = 0;
            }
            audienceInsights.interests[interest.category] += interest.percentage || 0;
          });
        }

        // Active hours
        if (insights.activeHours) {
          insights.activeHours.forEach(hour => {
            if (hour.hour >= 0 && hour.hour < 24) {
              audienceInsights.activeHours[hour.hour] += hour.activity || 0;
            }
          });
        }
      }
    });

    // Normalize percentages
    const profileCount = socialProfiles.length;
    if (profileCount > 0) {
      // Age groups
      Object.keys(audienceInsights.demographics.ageGroups).forEach(key => {
        audienceInsights.demographics.ageGroups[key] /= profileCount;
      });

      // Gender
      audienceInsights.demographics.gender.male /= profileCount;
      audienceInsights.demographics.gender.female /= profileCount;
      audienceInsights.demographics.gender.other /= profileCount;

      // Locations
      Object.keys(audienceInsights.demographics.locations).forEach(key => {
        audienceInsights.demographics.locations[key] /= profileCount;
      });

      // Interests
      Object.keys(audienceInsights.interests).forEach(key => {
        audienceInsights.interests[key] /= profileCount;
      });

      // Active hours
      audienceInsights.activeHours = audienceInsights.activeHours.map(hour => hour / profileCount);
    }

    res.json(audienceInsights);
  } catch (error) {
    console.error('Get audience analytics error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   GET /api/analytics/reports/export
// @desc    Export analytics report
// @access  Private
router.get('/reports/export', auth, checkSubscription('premium'), async (req, res) => {
  try {
    const { period = '30', format = 'json' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get comprehensive analytics data
    const analyticsData = await Content.aggregate([
      {
        $match: {
          user: req.user.id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $project: {
          title: 1,
          'content.text': 1,
          'content.hashtags': 1,
          postType: 1,
          platforms: 1,
          analytics: 1,
          createdAt: 1,
          status: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Title',
        'Content',
        'Post Type',
        'Platforms',
        'Views',
        'Likes',
        'Shares',
        'Comments',
        'Reach',
        'Impressions',
        'Engagement Rate',
        'Created At',
        'Status'
      ];

      const csvRows = analyticsData.map(item => [
        item.title,
        item.content?.text?.substring(0, 100) + '...',
        item.postType,
        item.platforms?.map(p => p.platform).join(', '),
        item.analytics?.views || 0,
        item.analytics?.likes || 0,
        item.analytics?.shares || 0,
        item.analytics?.comments || 0,
        item.analytics?.reach || 0,
        item.analytics?.impressions || 0,
        item.analytics?.engagement?.rate || 0,
        item.createdAt,
        item.status
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-report-${period}days.csv"`);
      res.send(csvContent);
    } else {
      // Return JSON format
      res.json({
        period: parseInt(period),
        exportedAt: new Date(),
        totalRecords: analyticsData.length,
        data: analyticsData
      });
    }
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;
