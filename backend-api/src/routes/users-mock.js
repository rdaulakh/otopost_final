const express = require('express');
const router = express.Router();

// Mock user data
const mockUserProfile = {
  id: 'user_123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  avatar: 'https://via.placeholder.com/150',
  role: 'customer',
  organization: {
    id: 'org_123',
    name: 'Acme Corp',
    plan: 'premium'
  },
  preferences: {
    theme: 'dark',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    language: 'en',
    timezone: 'UTC'
  },
  createdAt: new Date('2024-01-15'),
  lastLoginAt: new Date(),
  isActive: true
};

const mockSecurityData = {
  twoFactorEnabled: false,
  lastPasswordChange: new Date('2024-01-15'),
  activeSessions: [
    {
      id: 'session_1',
      device: 'Chrome on macOS',
      location: 'New York, NY',
      ipAddress: '192.168.1.100',
      lastActive: new Date(),
      isCurrent: true
    },
    {
      id: 'session_2',
      device: 'Safari on iPhone',
      location: 'New York, NY',
      ipAddress: '192.168.1.101',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isCurrent: false
    }
  ],
  loginHistory: [
    {
      date: new Date(),
      device: 'Chrome on macOS',
      location: 'New York, NY',
      ipAddress: '192.168.1.100',
      success: true
    },
    {
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      device: 'Safari on iPhone',
      location: 'New York, NY',
      ipAddress: '192.168.1.101',
      success: true
    }
  ],
  securityAlerts: [
    {
      id: 'alert_1',
      type: 'unusual_login',
      message: 'New login from Chrome on macOS',
      date: new Date(),
      resolved: false
    }
  ]
};

const mockUserStats = {
  totalPosts: 156,
  totalEngagement: 12450,
  totalReach: 89000,
  totalFollowers: 12500,
  avgEngagementRate: 4.2,
  topPerformingPost: {
    id: 'post_1',
    title: 'AI-Powered Social Media Strategy',
    engagement: 1250,
    reach: 8500,
    platform: 'instagram'
  },
  monthlyGrowth: {
    followers: 156,
    engagement: 12.5,
    reach: 8.2
  },
  platformBreakdown: [
    {
      platform: 'instagram',
      posts: 45,
      engagement: 5200,
      reach: 32000,
      followers: 8500
    },
    {
      platform: 'twitter',
      posts: 38,
      engagement: 3800,
      reach: 25000,
      followers: 3200
    },
    {
      platform: 'linkedin',
      posts: 28,
      engagement: 2100,
      reach: 18000,
      followers: 1200
    },
    {
      platform: 'facebook',
      posts: 45,
      engagement: 1350,
      reach: 14000,
      followers: 800
    }
  ],
  recentActivity: [
    {
      id: 'activity_1',
      type: 'post_published',
      message: 'Published "AI-Powered Social Media Strategy"',
      date: new Date(),
      platform: 'instagram'
    },
    {
      id: 'activity_2',
      type: 'boost_created',
      message: 'Created boost for "Content Creation Tips"',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      platform: 'twitter'
    },
    {
      id: 'activity_3',
      type: 'ai_generated',
      message: 'AI generated 5 new posts',
      date: new Date(Date.now() - 4 * 60 * 60 * 1000),
      platform: 'all'
    }
  ]
};

const mockSubscriptionData = {
  id: 'sub_123',
  plan: {
    id: 'premium',
    name: 'Premium Plan',
    price: 49.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited posts',
      'AI content generation',
      'Advanced analytics',
      'Priority support',
      'Custom branding'
    ]
  },
  status: 'active',
  currentPeriodStart: new Date('2024-01-01'),
  currentPeriodEnd: new Date('2024-02-01'),
  cancelAtPeriodEnd: false,
  trialEnd: null,
  usage: {
    postsThisMonth: 45,
    postsLimit: -1, // unlimited
    aiGenerationsThisMonth: 23,
    aiGenerationsLimit: 100,
    analyticsExportsThisMonth: 2,
    analyticsExportsLimit: 10
  },
  billingHistory: [
    {
      id: 'invoice_1',
      date: new Date('2024-01-01'),
      amount: 49.99,
      currency: 'USD',
      status: 'paid',
      description: 'Premium Plan - Monthly'
    },
    {
      id: 'invoice_2',
      date: new Date('2023-12-01'),
      amount: 49.99,
      currency: 'USD',
      status: 'paid',
      description: 'Premium Plan - Monthly'
    }
  ],
  paymentMethod: {
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expMonth: 12,
    expYear: 2025
  }
};

// User profile endpoints
router.get('/me', (req, res) => {
  res.json({
    success: true,
    data: mockUserProfile
  });
});

router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: mockUserProfile
  });
});

router.put('/profile', (req, res) => {
  res.json({
    success: true,
    data: { ...mockUserProfile, ...req.body },
    message: 'Profile updated successfully'
  });
});

// Additional profile endpoints
router.put('/profile/notifications', (req, res) => {
  res.json({
    success: true,
    data: { ...mockUserProfile, preferences: { ...mockUserProfile.preferences, notifications: req.body } },
    message: 'Notification preferences updated successfully'
  });
});

router.put('/profile/preferences', (req, res) => {
  res.json({
    success: true,
    data: { ...mockUserProfile, preferences: { ...mockUserProfile.preferences, ...req.body } },
    message: 'Preferences updated successfully'
  });
});

router.post('/profile/avatar', (req, res) => {
  res.json({
    success: true,
    data: { ...mockUserProfile, avatar: 'https://via.placeholder.com/150' },
    message: 'Avatar updated successfully'
  });
});

// Security endpoints
router.get('/security', (req, res) => {
  res.json({
    success: true,
    data: mockSecurityData
  });
});

router.put('/security/password', (req, res) => {
  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

router.post('/security/2fa/enable', (req, res) => {
  res.json({
    success: true,
    data: {
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      secret: 'JBSWY3DPEHPK3PXP'
    },
    message: '2FA enabled successfully'
  });
});

router.post('/security/2fa/disable', (req, res) => {
  res.json({
    success: true,
    message: '2FA disabled successfully'
  });
});

// Stats endpoints
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: mockUserStats
  });
});

// Subscription endpoints
router.get('/subscription', (req, res) => {
  res.json({
    success: true,
    data: mockSubscriptionData
  });
});

router.put('/subscription', (req, res) => {
  res.json({
    success: true,
    data: { ...mockSubscriptionData, ...req.body },
    message: 'Subscription updated successfully'
  });
});

router.post('/subscription/cancel', (req, res) => {
  res.json({
    success: true,
    data: {
      ...mockSubscriptionData,
      cancelAtPeriodEnd: true
    },
    message: 'Subscription will be cancelled at the end of the current period'
  });
});

router.post('/subscription/reactivate', (req, res) => {
  res.json({
    success: true,
    data: {
      ...mockSubscriptionData,
      cancelAtPeriodEnd: false
    },
    message: 'Subscription reactivated successfully'
  });
});

// Social accounts endpoints
router.get('/social-accounts', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'ig_123',
        platform: 'instagram',
        username: '@johndoe',
        followers: 8500,
        connectedAt: new Date('2024-01-10'),
        isActive: true
      },
      {
        id: 'tw_123',
        platform: 'twitter',
        username: '@johndoe',
        followers: 3200,
        connectedAt: new Date('2024-01-12'),
        isActive: true
      },
      {
        id: 'li_123',
        platform: 'linkedin',
        username: 'John Doe',
        followers: 1200,
        connectedAt: new Date('2024-01-15'),
        isActive: true
      }
    ]
  });
});

router.post('/social-accounts', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'new_account_123',
      platform: req.body.platform,
      username: req.body.username,
      followers: 0,
      connectedAt: new Date(),
      isActive: true
    },
    message: 'Social account connected successfully'
  });
});

router.delete('/social-accounts/:platform', (req, res) => {
  res.json({
    success: true,
    message: `${req.params.platform} account disconnected successfully`
  });
});

// Activity endpoints
router.get('/activity', (req, res) => {
  res.json({
    success: true,
    data: mockUserStats.recentActivity
  });
});

// Dashboard stats
router.get('/dashboard-stats', (req, res) => {
  res.json({
    success: true,
    data: {
      overview: {
        totalPosts: mockUserStats.totalPosts,
        totalEngagement: mockUserStats.totalEngagement,
        totalReach: mockUserStats.totalReach,
        totalFollowers: mockUserStats.totalFollowers,
        avgEngagementRate: mockUserStats.avgEngagementRate
      },
      recentActivity: mockUserStats.recentActivity.slice(0, 5),
      topPerformingPost: mockUserStats.topPerformingPost
    }
  });
});

// Account management
router.delete('/account', (req, res) => {
  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

module.exports = router;
