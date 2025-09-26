const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Content = require('../models/Content');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for campaign endpoints
const campaignRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many campaign requests from this IP'
});

// Apply rate limiting and auth to all routes
router.use(campaignRateLimit);
router.use(auth);

// @route   GET /api/campaigns
// @desc    Get user's campaigns
// @access  Private
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      search = '', 
      status = 'all', 
      platform = 'all',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Mock campaign data (replace with actual database queries)
    const mockCampaigns = [
      {
        id: 1,
        name: 'SaaS Lead Generation Q4 2025',
        platform: 'LinkedIn',
        status: 'active',
        spend: 456,
        budget: 500,
        roas: 5.2,
        conversions: 23,
        clicks: 1250,
        impressions: 45000,
        ctr: 2.78,
        cpc: 0.36,
        objective: 'Lead Generation',
        startDate: new Date('2025-10-01'),
        endDate: null, // Ongoing
        createdAt: new Date('2025-09-25'),
        updatedAt: new Date(),
        targetAudience: {
          age: '25-45',
          interests: ['SaaS', 'Technology', 'Business'],
          location: 'United States'
        },
        adSets: [
          {
            id: 1,
            name: 'Tech Professionals',
            budget: 300,
            spend: 276,
            conversions: 15
          },
          {
            id: 2,
            name: 'Business Owners',
            budget: 200,
            spend: 180,
            conversions: 8
          }
        ]
      },
      {
        id: 2,
        name: 'App Downloads Campaign',
        platform: 'Facebook',
        status: 'active',
        spend: 234,
        budget: 300,
        roas: 3.8,
        conversions: 45,
        clicks: 890,
        impressions: 32000,
        ctr: 2.78,
        cpc: 0.26,
        objective: 'App Installs',
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-12-31'),
        createdAt: new Date('2025-10-28'),
        updatedAt: new Date(),
        targetAudience: {
          age: '18-35',
          interests: ['Mobile Apps', 'Productivity', 'Technology'],
          location: 'North America'
        },
        adSets: [
          {
            id: 3,
            name: 'Young Professionals',
            budget: 200,
            spend: 156,
            conversions: 28
          },
          {
            id: 4,
            name: 'Students',
            budget: 100,
            spend: 78,
            conversions: 17
          }
        ]
      },
      {
        id: 3,
        name: 'Brand Awareness Holiday',
        platform: 'Instagram',
        status: 'paused',
        spend: 89,
        budget: 150,
        roas: 2.1,
        conversions: 12,
        clicks: 456,
        impressions: 18000,
        ctr: 2.53,
        cpc: 0.19,
        objective: 'Brand Awareness',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-25'),
        createdAt: new Date('2025-11-25'),
        updatedAt: new Date(),
        targetAudience: {
          age: '22-40',
          interests: ['Fashion', 'Lifestyle', 'Shopping'],
          location: 'Global'
        },
        adSets: [
          {
            id: 5,
            name: 'Holiday Shoppers',
            budget: 150,
            spend: 89,
            conversions: 12
          }
        ]
      }
    ];

    // Apply filters
    let filteredCampaigns = mockCampaigns;

    if (search) {
      filteredCampaigns = filteredCampaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(campaign =>
        campaign.status === status
      );
    }

    if (platform !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(campaign =>
        campaign.platform.toLowerCase() === platform.toLowerCase()
      );
    }

    // Apply sorting
    filteredCampaigns.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

    const campaignData = {
      campaigns: paginatedCampaigns,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(filteredCampaigns.length / limit),
        total: filteredCampaigns.length,
        limit: parseInt(limit)
      },
      filters: { search, status, platform },
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: campaignData
    });

  } catch (error) {
    console.error('Campaign list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns',
      error: error.message
    });
  }
});

// @route   GET /api/campaigns/stats
// @desc    Get campaign statistics overview
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = '30d' } = req.query;

    // Mock campaign statistics
    const campaignStats = {
      overview: {
        totalCampaigns: 3,
        activeCampaigns: 2,
        pausedCampaigns: 1,
        completedCampaigns: 0,
        totalSpend: 779,
        totalBudget: 950,
        avgROAS: 3.7,
        totalConversions: 80,
        totalClicks: 2596,
        totalImpressions: 95000
      },
      performance: {
        spendTrend: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          spend: Math.floor(Math.random() * 50) + 20,
          conversions: Math.floor(Math.random() * 5) + 1
        })),
        platformBreakdown: [
          { platform: 'LinkedIn', spend: 456, conversions: 23, roas: 5.2 },
          { platform: 'Facebook', spend: 234, conversions: 45, roas: 3.8 },
          { platform: 'Instagram', spend: 89, conversions: 12, roas: 2.1 }
        ],
        objectiveBreakdown: [
          { objective: 'Lead Generation', campaigns: 1, spend: 456, conversions: 23 },
          { objective: 'App Installs', campaigns: 1, spend: 234, conversions: 45 },
          { objective: 'Brand Awareness', campaigns: 1, spend: 89, conversions: 12 }
        ]
      },
      insights: [
        {
          type: 'opportunity',
          title: 'LinkedIn Campaigns Performing Best',
          description: 'Your LinkedIn campaigns have the highest ROAS at 5.2x. Consider increasing budget allocation.',
          impact: 'high',
          recommendation: 'Increase LinkedIn budget by 25%'
        },
        {
          type: 'warning',
          title: 'Instagram Campaign Underperforming',
          description: 'Instagram campaign ROAS is below target at 2.1x. Review targeting and creative.',
          impact: 'medium',
          recommendation: 'Optimize Instagram targeting and creative assets'
        }
      ],
      timeRange,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: campaignStats
    });

  } catch (error) {
    console.error('Campaign stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign statistics',
      error: error.message
    });
  }
});

// @route   POST /api/campaigns
// @desc    Create new campaign
// @access  Private
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      platform,
      objective,
      budget,
      startDate,
      endDate,
      targetAudience,
      adSets = []
    } = req.body;

    // Validate required fields
    if (!name || !platform || !objective || !budget) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, platform, objective, budget'
      });
    }

    // Mock campaign creation (replace with actual database save)
    const newCampaign = {
      id: Date.now(), // Mock ID
      name,
      platform,
      objective,
      budget: parseFloat(budget),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      targetAudience: targetAudience || {},
      adSets: adSets.map(adSet => ({
        ...adSet,
        id: Date.now() + Math.random(),
        spend: 0,
        conversions: 0
      })),
      status: 'draft',
      spend: 0,
      roas: 0,
      conversions: 0,
      clicks: 0,
      impressions: 0,
      ctr: 0,
      cpc: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId
    };

    res.status(201).json({
      success: true,
      data: newCampaign,
      message: 'Campaign created successfully'
    });

  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    });
  }
});

// @route   PUT /api/campaigns/:id
// @desc    Update campaign
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Mock campaign update (replace with actual database update)
    const updatedCampaign = {
      id: parseInt(id),
      ...updates,
      updatedAt: new Date(),
      userId
    };

    res.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign updated successfully'
    });

  } catch (error) {
    console.error('Campaign update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign',
      error: error.message
    });
  }
});

// @route   DELETE /api/campaigns/:id
// @desc    Delete campaign
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Mock campaign deletion (replace with actual database deletion)
    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('Campaign deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign',
      error: error.message
    });
  }
});

// @route   GET /api/campaigns/:id/analytics
// @desc    Get detailed campaign analytics
// @access  Private
router.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { timeRange = '30d' } = req.query;

    // Mock detailed analytics for specific campaign
    const campaignAnalytics = {
      campaignId: parseInt(id),
      performance: {
        spend: 456,
        budget: 500,
        roas: 5.2,
        conversions: 23,
        clicks: 1250,
        impressions: 45000,
        ctr: 2.78,
        cpc: 0.36,
        conversionRate: 1.84
      },
      trends: {
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          spend: Math.floor(Math.random() * 30) + 10,
          conversions: Math.floor(Math.random() * 3) + 1,
          clicks: Math.floor(Math.random() * 100) + 30,
          impressions: Math.floor(Math.random() * 2000) + 1000
        }))
      },
      adSets: [
        {
          id: 1,
          name: 'Tech Professionals',
          budget: 300,
          spend: 276,
          conversions: 15,
          clicks: 750,
          impressions: 27000,
          ctr: 2.78,
          cpc: 0.37,
          roas: 5.4
        },
        {
          id: 2,
          name: 'Business Owners',
          budget: 200,
          spend: 180,
          conversions: 8,
          clicks: 500,
          impressions: 18000,
          ctr: 2.78,
          cpc: 0.36,
          roas: 4.9
        }
      ],
      demographics: {
        age: [
          { range: '25-34', percentage: 45, conversions: 12 },
          { range: '35-44', percentage: 35, conversions: 8 },
          { range: '45-54', percentage: 20, conversions: 3 }
        ],
        gender: [
          { type: 'male', percentage: 60, conversions: 14 },
          { type: 'female', percentage: 40, conversions: 9 }
        ],
        location: [
          { country: 'United States', percentage: 70, conversions: 16 },
          { country: 'Canada', percentage: 20, conversions: 5 },
          { country: 'United Kingdom', percentage: 10, conversions: 2 }
        ]
      },
      timeRange,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: campaignAnalytics
    });

  } catch (error) {
    console.error('Campaign analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign analytics',
      error: error.message
    });
  }
});

// @route   POST /api/campaigns/:id/optimize
// @desc    Get AI optimization recommendations for campaign
// @access  Private
router.post('/:id/optimize', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Mock AI optimization recommendations
    const optimizationRecommendations = {
      campaignId: parseInt(id),
      score: 78,
      recommendations: [
        {
          type: 'budget',
          priority: 'high',
          title: 'Increase Budget for High-Performing Ad Set',
          description: 'Tech Professionals ad set is performing 20% above average. Consider increasing budget by $100.',
          impact: 'Potential 15% increase in conversions',
          action: 'increase_budget',
          parameters: { adSetId: 1, budgetIncrease: 100 }
        },
        {
          type: 'targeting',
          priority: 'medium',
          title: 'Expand Age Targeting',
          description: '45-54 age group shows good engagement but low volume. Consider expanding targeting.',
          impact: 'Potential 10% increase in reach',
          action: 'expand_targeting',
          parameters: { ageRange: '45-64' }
        },
        {
          type: 'creative',
          priority: 'medium',
          title: 'Test New Creative Variations',
          description: 'Current creative has been running for 30 days. Test new variations to prevent ad fatigue.',
          impact: 'Maintain or improve CTR',
          action: 'test_creative',
          parameters: { variations: 3 }
        }
      ],
      estimatedImpact: {
        conversions: '+25%',
        roas: '+15%',
        cpc: '-10%'
      },
      confidence: 85,
      generatedAt: new Date()
    };

    res.json({
      success: true,
      data: optimizationRecommendations
    });

  } catch (error) {
    console.error('Campaign optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate optimization recommendations',
      error: error.message
    });
  }
});

module.exports = router;
