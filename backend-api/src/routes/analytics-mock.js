const express = require('express');
const router = express.Router();

// Mock analytics data
const mockDashboardData = {
  overview: {
    totalPosts: 156,
    totalImpressions: 125000,
    totalReach: 89000,
    totalEngagement: 12450,
    avgEngagementRate: 4.2
  },
  platforms: [
    {
      platform: 'instagram',
      followers: 12500,
      impressions: 45000,
      engagement: 5200,
      growth: 156
    },
    {
      platform: 'twitter',
      followers: 8900,
      impressions: 32000,
      engagement: 3800,
      growth: 89
    },
    {
      platform: 'linkedin',
      followers: 5600,
      impressions: 18000,
      engagement: 2100,
      growth: 45
    },
    {
      platform: 'facebook',
      followers: 3200,
      impressions: 30000,
      engagement: 1350,
      growth: 23
    }
  ],
  aiPerformance: {
    totalTasks: 89,
    completedTasks: 84,
    successRate: 94.4,
    totalCost: 45.60,
    contentGenerated: 67
  },
  topContent: [
    {
      _id: '1',
      title: 'AI-Powered Social Media Strategy',
      type: 'post',
      analytics: {
        totalEngagement: 1250,
        impressions: 8500,
        reach: 6200
      },
      createdAt: new Date(),
      userId: { firstName: 'John', lastName: 'Doe' }
    }
  ],
  period: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  }
};

const mockContentPerformance = {
  contents: [
    {
      id: '1',
      title: 'AI-Powered Social Media Strategy',
      type: 'post',
      author: { firstName: 'John', lastName: 'Doe' },
      createdAt: new Date(),
      platforms: ['instagram', 'twitter'],
      metrics: {
        impressions: 8500,
        reach: 6200,
        engagement: 1250,
        engagementRate: 4.8,
        clicks: 89
      },
      performance: {
        score: 85,
        trend: 'up'
      }
    },
    {
      id: '2',
      title: 'Content Creation Tips',
      type: 'carousel',
      author: { firstName: 'Jane', lastName: 'Smith' },
      createdAt: new Date(),
      platforms: ['instagram', 'linkedin'],
      metrics: {
        impressions: 7200,
        reach: 5400,
        engagement: 980,
        engagementRate: 3.9,
        clicks: 67
      },
      performance: {
        score: 78,
        trend: 'stable'
      }
    }
  ],
  pagination: {
    currentPage: 1,
    totalPages: 5,
    totalItems: 95,
    itemsPerPage: 20
  }
};

const mockPlatformAnalytics = {
  platforms: [
    {
      platform: 'instagram',
      summary: {
        followers: 12500,
        impressions: 45000,
        reach: 32000,
        engagement: 5200,
        growth: 156,
        engagementRate: 16.25
      },
      timeline: [
        { date: '2024-01-01', followers: 12000, impressions: 42000, reach: 30000, engagement: 4800, followerGrowth: 12 },
        { date: '2024-01-02', followers: 12100, impressions: 43000, reach: 31000, engagement: 5000, followerGrowth: 15 }
      ]
    }
  ],
  period: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  }
};

const mockAudienceInsights = {
  demographics: {
    ageGroups: [
      { age: '18-24', percentage: 25 },
      { age: '25-34', percentage: 35 },
      { age: '35-44', percentage: 28 },
      { age: '45-54', percentage: 12 }
    ],
    gender: { male: 45, female: 52, other: 3 },
    locations: [
      { country: 'United States', percentage: 40 },
      { country: 'Canada', percentage: 25 },
      { country: 'United Kingdom', percentage: 20 },
      { country: 'Australia', percentage: 15 }
    ],
    languages: [
      { language: 'English', percentage: 85 },
      { language: 'Spanish', percentage: 10 },
      { language: 'French', percentage: 5 }
    ]
  },
  behavior: {
    activeHours: [
      { hour: 9, activity: 85 },
      { hour: 12, activity: 95 },
      { hour: 15, activity: 78 },
      { hour: 18, activity: 92 },
      { hour: 21, activity: 88 }
    ],
    activeDays: [
      { day: 'Monday', activity: 85 },
      { day: 'Tuesday', activity: 92 },
      { day: 'Wednesday', activity: 88 },
      { day: 'Thursday', activity: 90 },
      { day: 'Friday', activity: 95 },
      { day: 'Saturday', activity: 78 },
      { day: 'Sunday', activity: 72 }
    ],
    deviceTypes: [
      { device: 'Mobile', percentage: 75 },
      { device: 'Desktop', percentage: 20 },
      { device: 'Tablet', percentage: 5 }
    ]
  },
  interests: [
    { interest: 'Technology', percentage: 45 },
    { interest: 'Business', percentage: 38 },
    { interest: 'Marketing', percentage: 32 },
    { interest: 'AI/ML', percentage: 28 },
    { interest: 'Social Media', percentage: 25 }
  ],
  growth: {
    newFollowers: 156,
    unfollowers: 23,
    netGrowth: 133,
    growthRate: 1.1
  }
};

const mockAIPerformance = {
  overview: {
    totalTasks: 89,
    completedTasks: 84,
    avgSuccessRate: 94.4,
    totalCost: 45.60,
    contentGenerated: 67,
    contentApproved: 58
  },
  agentPerformance: [
    {
      agentType: 'content-agent',
      tasks: 45,
      quality: 8.5,
      executionTime: 2.3,
      successRate: 96.2,
      cost: 22.50,
      efficiency: 0.50
    },
    {
      agentType: 'analytics-agent',
      tasks: 28,
      quality: 9.1,
      executionTime: 1.8,
      successRate: 92.8,
      cost: 15.20,
      efficiency: 0.54
    },
    {
      agentType: 'strategy-agent',
      tasks: 16,
      quality: 8.8,
      executionTime: 3.2,
      successRate: 93.7,
      cost: 7.90,
      efficiency: 0.49
    }
  ],
  period: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  }
};

const mockROIMetrics = {
  revenue: {
    total: 12500,
    attributed: 8900,
    attributionRate: 71.2
  },
  costs: {
    total: 3200,
    breakdown: {
      aiAgents: 1200,
      advertising: 1500,
      tools: 500
    }
  },
  roi: {
    overall: 178.1,
    roas: 2.78
  },
  leads: {
    total: 156,
    qualified: 89,
    qualificationRate: 57.1,
    costPerLead: 20.51
  },
  conversions: {
    total: 23,
    rate: 14.7,
    costPerConversion: 139.13
  },
  period: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  }
};

// Dashboard analytics
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    data: mockDashboardData,
    cached: false
  });
});

// Content performance analytics
router.get('/content-performance', (req, res) => {
  res.json({
    success: true,
    data: mockContentPerformance
  });
});

// Platform analytics
router.get('/platform', (req, res) => {
  res.json({
    success: true,
    data: mockPlatformAnalytics
  });
});

// Audience insights
router.get('/audience', (req, res) => {
  res.json({
    success: true,
    data: mockAudienceInsights
  });
});

// AI performance analytics
router.get('/ai-performance', (req, res) => {
  res.json({
    success: true,
    data: mockAIPerformance
  });
});

// ROI metrics
router.get('/roi', (req, res) => {
  res.json({
    success: true,
    data: mockROIMetrics
  });
});

// Export data
router.get('/export', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Mock export data',
      totalRecords: 100,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      exportedAt: new Date()
    }
  });
});

module.exports = router;
