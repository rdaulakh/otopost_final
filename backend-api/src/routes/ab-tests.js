const express = require('express');
const router = express.Router();

// Mock A/B testing data
const mockABTests = [
  {
    id: 'test-1',
    name: 'Headline Optimization Test',
    description: 'Testing different headlines for better engagement',
    status: 'running',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-02-15T00:00:00Z',
    variants: [
      {
        id: 'variant-a',
        name: 'Control',
        description: 'Original headline',
        content: 'Boost Your Social Media Presence Today!',
        trafficAllocation: 50
      },
      {
        id: 'variant-b',
        name: 'Variant B',
        description: 'New headline with emoji',
        content: '🚀 Boost Your Social Media Presence Today!',
        trafficAllocation: 50
      }
    ],
    metrics: {
      impressions: 12500,
      clicks: 1250,
      conversions: 125,
      engagementRate: 10.0,
      conversionRate: 10.0
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'test-2',
    name: 'CTA Button Color Test',
    description: 'Testing different CTA button colors',
    status: 'completed',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-14T00:00:00Z',
    variants: [
      {
        id: 'variant-a',
        name: 'Control',
        description: 'Blue button',
        content: 'Get Started',
        trafficAllocation: 50
      },
      {
        id: 'variant-b',
        name: 'Variant B',
        description: 'Green button',
        content: 'Get Started',
        trafficAllocation: 50
      }
    ],
    metrics: {
      impressions: 8000,
      clicks: 960,
      conversions: 96,
      engagementRate: 12.0,
      conversionRate: 10.0
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z'
  },
  {
    id: 'test-3',
    name: 'Image Style Test',
    description: 'Testing different image styles for posts',
    status: 'draft',
    startDate: null,
    endDate: null,
    variants: [
      {
        id: 'variant-a',
        name: 'Control',
        description: 'Original image style',
        content: 'Professional photos',
        trafficAllocation: 50
      },
      {
        id: 'variant-b',
        name: 'Variant B',
        description: 'Illustrated style',
        content: 'Custom illustrations',
        trafficAllocation: 50
      }
    ],
    metrics: {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      engagementRate: 0,
      conversionRate: 0
    },
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  }
];

const mockTestResults = {
  'test-1': {
    testId: 'test-1',
    summary: {
      totalImpressions: 12500,
      totalClicks: 1250,
      totalConversions: 125,
      overallEngagementRate: 10.0,
      overallConversionRate: 10.0,
      confidenceLevel: 95.2,
      statisticalSignificance: true
    },
    variants: [
      {
        variantId: 'variant-a',
        name: 'Control',
        impressions: 6250,
        clicks: 625,
        conversions: 62,
        engagementRate: 10.0,
        conversionRate: 9.92,
        confidenceInterval: [8.5, 11.5],
        isWinner: false
      },
      {
        variantId: 'variant-b',
        name: 'Variant B',
        impressions: 6250,
        clicks: 625,
        conversions: 63,
        engagementRate: 10.0,
        conversionRate: 10.08,
        confidenceInterval: [8.6, 11.6],
        isWinner: true
      }
    ],
    dailyData: [
      { date: '2024-01-15', impressions: 500, clicks: 50, conversions: 5 },
      { date: '2024-01-16', impressions: 520, clicks: 52, conversions: 5 },
      { date: '2024-01-17', impressions: 480, clicks: 48, conversions: 5 },
      { date: '2024-01-18', impressions: 510, clicks: 51, conversions: 5 },
      { date: '2024-01-19', impressions: 530, clicks: 53, conversions: 5 }
    ],
    demographics: {
      ageGroups: [
        { age: '18-24', percentage: 25 },
        { age: '25-34', percentage: 35 },
        { age: '35-44', percentage: 25 },
        { age: '45-54', percentage: 15 }
      ],
      genders: [
        { gender: 'Male', percentage: 45 },
        { gender: 'Female', percentage: 55 }
      ],
      locations: [
        { location: 'United States', percentage: 40 },
        { location: 'Canada', percentage: 20 },
        { location: 'United Kingdom', percentage: 15 },
        { location: 'Australia', percentage: 10 },
        { location: 'Other', percentage: 15 }
      ]
    }
  },
  'test-2': {
    testId: 'test-2',
    summary: {
      totalImpressions: 8000,
      totalClicks: 960,
      totalConversions: 96,
      overallEngagementRate: 12.0,
      overallConversionRate: 10.0,
      confidenceLevel: 98.5,
      statisticalSignificance: true
    },
    variants: [
      {
        variantId: 'variant-a',
        name: 'Control',
        impressions: 4000,
        clicks: 480,
        conversions: 48,
        engagementRate: 12.0,
        conversionRate: 10.0,
        confidenceInterval: [8.5, 11.5],
        isWinner: false
      },
      {
        variantId: 'variant-b',
        name: 'Variant B',
        impressions: 4000,
        clicks: 480,
        conversions: 48,
        engagementRate: 12.0,
        conversionRate: 10.0,
        confidenceInterval: [8.5, 11.5],
        isWinner: false
      }
    ],
    dailyData: [
      { date: '2024-01-01', impressions: 300, clicks: 36, conversions: 4 },
      { date: '2024-01-02', impressions: 320, clicks: 38, conversions: 4 },
      { date: '2024-01-03', impressions: 280, clicks: 34, conversions: 3 },
      { date: '2024-01-04', impressions: 310, clicks: 37, conversions: 4 },
      { date: '2024-01-05', impressions: 330, clicks: 40, conversions: 4 }
    ],
    demographics: {
      ageGroups: [
        { age: '18-24', percentage: 30 },
        { age: '25-34', percentage: 40 },
        { age: '35-44', percentage: 20 },
        { age: '45-54', percentage: 10 }
      ],
      genders: [
        { gender: 'Male', percentage: 50 },
        { gender: 'Female', percentage: 50 }
      ],
      locations: [
        { location: 'United States', percentage: 50 },
        { location: 'Canada', percentage: 25 },
        { location: 'United Kingdom', percentage: 15 },
        { location: 'Other', percentage: 10 }
      ]
    }
  }
};

const mockTestMetrics = {
  'test-1': {
    testId: 'test-1',
    performance: {
      engagementRate: 10.0,
      conversionRate: 10.0,
      clickThroughRate: 10.0,
      bounceRate: 45.0,
      timeOnPage: 120
    },
    trends: {
      engagementTrend: 'increasing',
      conversionTrend: 'stable',
      trafficTrend: 'increasing'
    },
    insights: [
      'Variant B shows 0.8% higher conversion rate',
      'Engagement peaks during 2-4 PM',
      'Mobile users show higher engagement',
      'Weekend performance is 15% better'
    ],
    recommendations: [
      'Consider implementing Variant B as the default',
      'Optimize for mobile experience',
      'Schedule more content for weekends',
      'Test different time slots for better engagement'
    ]
  },
  'test-2': {
    testId: 'test-2',
    performance: {
      engagementRate: 12.0,
      conversionRate: 10.0,
      clickThroughRate: 12.0,
      bounceRate: 40.0,
      timeOnPage: 135
    },
    trends: {
      engagementTrend: 'stable',
      conversionTrend: 'stable',
      trafficTrend: 'stable'
    },
    insights: [
      'Both variants performed equally well',
      'No significant difference in conversion rates',
      'Consistent performance across all metrics',
      'Test completed successfully with no clear winner'
    ],
    recommendations: [
      'Both variants can be used interchangeably',
      'Consider testing different elements',
      'Focus on other optimization opportunities',
      'Run longer tests for more conclusive results'
    ]
  }
};

// GET /api/ab-tests - List all A/B tests
router.get('/', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: mockABTests,
      pagination: {
        page: 1,
        limit: 10,
        total: mockABTests.length,
        pages: 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch A/B tests',
      error: error.message
    });
  }
});

// GET /api/ab-tests/:id - Get specific A/B test
router.get('/:id', (req, res) => {
  try {
    const testId = req.params.id;
    const test = mockABTests.find(t => t.id === testId);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch A/B test',
      error: error.message
    });
  }
});

// GET /api/ab-tests/:id/results - Get A/B test results
router.get('/:id/results', (req, res) => {
  try {
    const testId = req.params.id;
    const results = mockTestResults[testId];
    
    if (!results) {
      return res.status(404).json({
        success: false,
        message: 'A/B test results not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch A/B test results',
      error: error.message
    });
  }
});

// GET /api/ab-tests/:id/metrics - Get A/B test metrics
router.get('/:id/metrics', (req, res) => {
  try {
    const testId = req.params.id;
    const metrics = mockTestMetrics[testId];
    
    if (!metrics) {
      return res.status(404).json({
        success: false,
        message: 'A/B test metrics not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch A/B test metrics',
      error: error.message
    });
  }
});

// POST /api/ab-tests - Create new A/B test
router.post('/', (req, res) => {
  try {
    const newTest = {
      id: `test-${Date.now()}`,
      ...req.body,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        engagementRate: 0,
        conversionRate: 0
      }
    };
    
    mockABTests.push(newTest);
    
    res.status(201).json({
      success: true,
      data: newTest,
      message: 'A/B test created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create A/B test',
      error: error.message
    });
  }
});

// PUT /api/ab-tests/:id - Update A/B test
router.put('/:id', (req, res) => {
  try {
    const testId = req.params.id;
    const testIndex = mockABTests.findIndex(t => t.id === testId);
    
    if (testIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
    
    mockABTests[testIndex] = {
      ...mockABTests[testIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      data: mockABTests[testIndex],
      message: 'A/B test updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update A/B test',
      error: error.message
    });
  }
});

// DELETE /api/ab-tests/:id - Delete A/B test
router.delete('/:id', (req, res) => {
  try {
    const testId = req.params.id;
    const testIndex = mockABTests.findIndex(t => t.id === testId);
    
    if (testIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
    
    mockABTests.splice(testIndex, 1);
    delete mockTestResults[testId];
    delete mockTestMetrics[testId];
    
    res.status(200).json({
      success: true,
      message: 'A/B test deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete A/B test',
      error: error.message
    });
  }
});

// POST /api/ab-tests/:id/start - Start A/B test
router.post('/:id/start', (req, res) => {
  try {
    const testId = req.params.id;
    const test = mockABTests.find(t => t.id === testId);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
    
    test.status = 'running';
    test.startDate = new Date().toISOString();
    test.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      data: test,
      message: 'A/B test started successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start A/B test',
      error: error.message
    });
  }
});

// POST /api/ab-tests/:id/pause - Pause A/B test
router.post('/:id/pause', (req, res) => {
  try {
    const testId = req.params.id;
    const test = mockABTests.find(t => t.id === testId);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
    
    test.status = 'paused';
    test.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      data: test,
      message: 'A/B test paused successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to pause A/B test',
      error: error.message
    });
  }
});

// POST /api/ab-tests/:id/stop - Stop A/B test
router.post('/:id/stop', (req, res) => {
  try {
    const testId = req.params.id;
    const test = mockABTests.find(t => t.id === testId);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
    
    test.status = 'completed';
    test.endDate = new Date().toISOString();
    test.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      data: test,
      message: 'A/B test stopped successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to stop A/B test',
      error: error.message
    });
  }
});

module.exports = router;
