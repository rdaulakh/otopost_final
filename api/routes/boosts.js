const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Content = require('../models/Content');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for boost endpoints
const boostRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many boost requests from this IP'
});

// Apply rate limiting and auth to all routes
router.use(boostRateLimit);
router.use(auth);

// @route   GET /api/boosts/recommendations
// @desc    Get AI-powered boost recommendations
// @access  Private
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform = 'all', limit = 10 } = req.query;

    // Get user's recent content for analysis
    const recentContent = await Content.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Mock AI boost recommendations (replace with actual AI analysis)
    const mockRecommendations = [
      {
        id: 1,
        priority: 'high',
        postId: 'post_123',
        postTitle: '5 AI Tools Every SaaS Founder Needs',
        platform: 'Instagram',
        postType: 'Carousel',
        postedTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        currentEngagement: 8.9,
        predictedEngagement: 15.2,
        potentialReach: 12500,
        estimatedCost: 45,
        confidence: 92,
        reason: 'High engagement rate and trending topic',
        metrics: {
          likes: 156,
          comments: 23,
          shares: 12,
          saves: 34
        },
        recommendation: {
          budget: 50,
          duration: '3 days',
          targetAudience: 'SaaS founders and entrepreneurs',
          expectedResults: {
            additionalReach: 8500,
            additionalEngagement: 180,
            estimatedROI: '3.2x'
          }
        }
      },
      {
        id: 2,
        priority: 'medium',
        postId: 'post_124',
        postTitle: 'Behind the Scenes: Our Product Development',
        platform: 'LinkedIn',
        postType: 'Video',
        postedTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        currentEngagement: 6.4,
        predictedEngagement: 11.8,
        potentialReach: 8900,
        estimatedCost: 35,
        confidence: 85,
        reason: 'Video content performing well on LinkedIn',
        metrics: {
          likes: 89,
          comments: 15,
          shares: 8,
          views: 1250
        },
        recommendation: {
          budget: 40,
          duration: '2 days',
          targetAudience: 'Tech professionals and product managers',
          expectedResults: {
            additionalReach: 5500,
            additionalEngagement: 120,
            estimatedROI: '2.8x'
          }
        }
      },
      {
        id: 3,
        priority: 'low',
        postId: 'post_125',
        postTitle: 'Customer Success Story: 300% Growth',
        platform: 'Twitter',
        postType: 'Thread',
        postedTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        currentEngagement: 4.2,
        predictedEngagement: 7.8,
        potentialReach: 5600,
        estimatedCost: 25,
        confidence: 78,
        reason: 'Success stories resonate well with audience',
        metrics: {
          likes: 45,
          retweets: 12,
          replies: 8,
          views: 890
        },
        recommendation: {
          budget: 30,
          duration: '1 day',
          targetAudience: 'Business owners and marketers',
          expectedResults: {
            additionalReach: 3200,
            additionalEngagement: 75,
            estimatedROI: '2.1x'
          }
        }
      }
    ];

    // Apply platform filter
    let filteredRecommendations = mockRecommendations;
    if (platform !== 'all') {
      filteredRecommendations = mockRecommendations.filter(rec =>
        rec.platform.toLowerCase() === platform.toLowerCase()
      );
    }

    // Apply limit
    filteredRecommendations = filteredRecommendations.slice(0, parseInt(limit));

    const recommendationsData = {
      recommendations: filteredRecommendations,
      summary: {
        totalRecommendations: filteredRecommendations.length,
        highPriority: filteredRecommendations.filter(r => r.priority === 'high').length,
        estimatedTotalCost: filteredRecommendations.reduce((sum, r) => sum + r.estimatedCost, 0),
        estimatedTotalReach: filteredRecommendations.reduce((sum, r) => sum + r.potentialReach, 0)
      },
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: recommendationsData
    });

  } catch (error) {
    console.error('Boost recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch boost recommendations',
      error: error.message
    });
  }
});

// @route   GET /api/boosts/recent-posts
// @desc    Get recent posts eligible for boosting
// @access  Private
router.get('/recent-posts', async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      search = '', 
      platform = 'all', 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Calculate date range (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Build query filters
    let query = {
      userId,
      createdAt: { $gte: thirtyDaysAgo },
      status: 'published'
    };

    if (platform !== 'all') {
      query.platform = platform;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Get recent posts from database
    const recentPosts = await Content.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit));

    // Enhance posts with mock engagement data
    const enhancedPosts = recentPosts.map(post => ({
      id: post._id,
      title: post.title || post.content?.substring(0, 50) + '...',
      content: post.content,
      platform: post.platform,
      type: post.type || 'image',
      publishedAt: post.publishedAt || post.createdAt,
      engagement: {
        rate: Math.random() * 8 + 2, // 2-10% engagement rate
        likes: Math.floor(Math.random() * 200) + 20,
        comments: Math.floor(Math.random() * 50) + 5,
        shares: Math.floor(Math.random() * 30) + 2,
        saves: Math.floor(Math.random() * 40) + 5,
        reach: Math.floor(Math.random() * 5000) + 500
      },
      boostEligible: true,
      currentlyBoosted: Math.random() > 0.8, // 20% chance of being boosted
      boostPotential: {
        score: Math.floor(Math.random() * 40) + 60, // 60-100 score
        estimatedReach: Math.floor(Math.random() * 8000) + 2000,
        estimatedCost: Math.floor(Math.random() * 50) + 20
      }
    }));

    const recentPostsData = {
      posts: enhancedPosts,
      pagination: {
        total: enhancedPosts.length,
        limit: parseInt(limit),
        hasMore: enhancedPosts.length === parseInt(limit)
      },
      filters: { search, platform },
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: recentPostsData
    });

  } catch (error) {
    console.error('Recent posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent posts',
      error: error.message
    });
  }
});

// @route   GET /api/boosts/active
// @desc    Get active boosts
// @access  Private
router.get('/active', async (req, res) => {
  try {
    const userId = req.user.id;

    // Mock active boosts data (replace with actual database queries)
    const activeBoosts = [
      {
        id: 1,
        postId: 'post_123',
        postTitle: '5 AI Tools Every SaaS Founder Needs',
        platform: 'Instagram',
        status: 'running',
        budget: 50,
        spent: 32.45,
        duration: '3 days',
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        performance: {
          reach: 8750,
          impressions: 12500,
          engagement: 245,
          clicks: 89,
          ctr: 0.71,
          cpe: 0.13 // cost per engagement
        },
        targetAudience: 'SaaS founders and entrepreneurs',
        objectives: ['reach', 'engagement']
      },
      {
        id: 2,
        postId: 'post_124',
        postTitle: 'Behind the Scenes: Our Product Development',
        platform: 'LinkedIn',
        status: 'running',
        budget: 40,
        spent: 18.90,
        duration: '2 days',
        startDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        endDate: new Date(Date.now() + 36 * 60 * 60 * 1000), // 36 hours from now
        performance: {
          reach: 4200,
          impressions: 6800,
          engagement: 156,
          clicks: 45,
          ctr: 0.66,
          cpe: 0.12
        },
        targetAudience: 'Tech professionals and product managers',
        objectives: ['reach', 'video_views']
      }
    ];

    const activeBoostsData = {
      boosts: activeBoosts,
      summary: {
        totalActive: activeBoosts.length,
        totalBudget: activeBoosts.reduce((sum, boost) => sum + boost.budget, 0),
        totalSpent: activeBoosts.reduce((sum, boost) => sum + boost.spent, 0),
        totalReach: activeBoosts.reduce((sum, boost) => sum + boost.performance.reach, 0),
        avgCPE: activeBoosts.reduce((sum, boost) => sum + boost.performance.cpe, 0) / activeBoosts.length
      },
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: activeBoostsData
    });

  } catch (error) {
    console.error('Active boosts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active boosts',
      error: error.message
    });
  }
});

// @route   POST /api/boosts
// @desc    Create new boost
// @access  Private
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      postId,
      platform,
      budget,
      duration,
      objectives = [],
      targetAudience = {},
      startDate
    } = req.body;

    // Validate required fields
    if (!postId || !platform || !budget || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: postId, platform, budget, duration'
      });
    }

    // Mock boost creation (replace with actual database save and platform API calls)
    const newBoost = {
      id: Date.now(), // Mock ID
      postId,
      platform,
      budget: parseFloat(budget),
      duration,
      objectives,
      targetAudience,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(Date.now() + (parseInt(duration) * 24 * 60 * 60 * 1000)),
      status: 'pending', // pending, running, completed, paused
      spent: 0,
      performance: {
        reach: 0,
        impressions: 0,
        engagement: 0,
        clicks: 0,
        ctr: 0,
        cpe: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      userId
    };

    res.status(201).json({
      success: true,
      data: newBoost,
      message: 'Boost created successfully'
    });

  } catch (error) {
    console.error('Boost creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create boost',
      error: error.message
    });
  }
});

// @route   PUT /api/boosts/:id
// @desc    Update boost
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Mock boost update (replace with actual database update and platform API calls)
    const updatedBoost = {
      id: parseInt(id),
      ...updates,
      updatedAt: new Date(),
      userId
    };

    res.json({
      success: true,
      data: updatedBoost,
      message: 'Boost updated successfully'
    });

  } catch (error) {
    console.error('Boost update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update boost',
      error: error.message
    });
  }
});

// @route   DELETE /api/boosts/:id
// @desc    Delete/stop boost
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Mock boost deletion/stopping (replace with actual platform API calls)
    res.json({
      success: true,
      message: 'Boost stopped successfully'
    });

  } catch (error) {
    console.error('Boost deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop boost',
      error: error.message
    });
  }
});

// @route   GET /api/boosts/analytics
// @desc    Get boost analytics overview
// @access  Private
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = '30d' } = req.query;

    // Mock boost analytics data
    const boostAnalytics = {
      overview: {
        totalBoosts: 12,
        activeBoosts: 2,
        completedBoosts: 10,
        totalSpent: 485.67,
        totalReach: 125000,
        totalEngagement: 3450,
        avgCPE: 0.14,
        avgROI: 2.8
      },
      performance: {
        spendTrend: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          spend: Math.floor(Math.random() * 30) + 5,
          reach: Math.floor(Math.random() * 2000) + 500,
          engagement: Math.floor(Math.random() * 100) + 20
        })),
        platformBreakdown: [
          { platform: 'Instagram', boosts: 5, spend: 245.30, reach: 65000, engagement: 1850 },
          { platform: 'LinkedIn', boosts: 4, spend: 156.80, reach: 35000, engagement: 980 },
          { platform: 'Facebook', boosts: 2, spend: 67.40, reach: 18000, engagement: 420 },
          { platform: 'Twitter', boosts: 1, spend: 16.17, reach: 7000, engagement: 200 }
        ],
        topPerformingBoosts: [
          {
            id: 1,
            postTitle: '5 AI Tools Every SaaS Founder Needs',
            platform: 'Instagram',
            spend: 50,
            reach: 12500,
            engagement: 345,
            roi: 4.2
          },
          {
            id: 2,
            postTitle: 'Customer Success Story: 300% Growth',
            platform: 'LinkedIn',
            spend: 35,
            reach: 8900,
            engagement: 267,
            roi: 3.8
          }
        ]
      },
      insights: [
        {
          type: 'success',
          title: 'Instagram Boosts Performing Best',
          description: 'Instagram boosts have the highest engagement rate at 2.8%. Continue focusing on visual content.',
          recommendation: 'Increase Instagram boost budget by 20%'
        },
        {
          type: 'opportunity',
          title: 'LinkedIn Shows Strong ROI',
          description: 'LinkedIn boosts have 3.8x ROI on average. Consider expanding LinkedIn boost strategy.',
          recommendation: 'Test more professional content on LinkedIn'
        }
      ],
      timeRange,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: boostAnalytics
    });

  } catch (error) {
    console.error('Boost analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch boost analytics',
      error: error.message
    });
  }
});

// @route   POST /api/boosts/predict
// @desc    Get AI prediction for boost performance
// @access  Private
router.post('/predict', async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId, platform, budget, duration, targetAudience } = req.body;

    // Mock AI prediction (replace with actual AI model)
    const prediction = {
      postId,
      platform,
      budget: parseFloat(budget),
      duration: parseInt(duration),
      predictions: {
        estimatedReach: Math.floor(budget * 150 + Math.random() * 1000), // Mock calculation
        estimatedEngagement: Math.floor(budget * 8 + Math.random() * 100),
        estimatedClicks: Math.floor(budget * 3 + Math.random() * 50),
        estimatedCPE: Math.round((budget / (budget * 8)) * 100) / 100,
        estimatedROI: Math.round((Math.random() * 3 + 1.5) * 100) / 100,
        confidence: Math.floor(Math.random() * 20) + 75 // 75-95% confidence
      },
      recommendations: [
        'Optimal budget range: $' + Math.floor(budget * 0.8) + ' - $' + Math.floor(budget * 1.2),
        'Best duration: ' + (duration > 3 ? duration - 1 : duration + 1) + ' days',
        'Recommended posting time: 2:00 PM - 4:00 PM'
      ],
      riskFactors: [
        'Audience saturation may occur after day ' + Math.floor(duration * 0.7),
        'Competition is high for this audience segment'
      ],
      generatedAt: new Date()
    };

    res.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    console.error('Boost prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate boost prediction',
      error: error.message
    });
  }
});

module.exports = router;
