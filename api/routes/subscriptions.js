const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Rate limiting for subscription endpoints
const subscriptionRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per 5 minutes
  message: 'Too many subscription requests from this IP'
});

router.use(subscriptionRateLimit);
router.use(auth);
router.use(adminAuth);

// Mock subscription plans data
const subscriptionPlans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals and small teams getting started',
    pricing: {
      monthly: { amount: 29, currency: 'USD' },
      yearly: { amount: 290, currency: 'USD', discount: 17 },
      quarterly: { amount: 80, currency: 'USD', discount: 8 }
    },
    features: {
      users: { included: 1, additionalCost: 0 },
      socialAccounts: { included: 5, additionalCost: 0 },
      monthlyPosts: { included: 50 },
      aiGenerations: { included: 25 },
      storageGB: { included: 1, additionalCost: 0 },
      analyticsRetentionDays: 30,
      aiAgents: true,
      analytics: true,
      teamCollaboration: false,
      whiteLabel: false,
      apiAccess: false,
      prioritySupport: false
    },
    isActive: true,
    isPopular: false,
    sortOrder: 1,
    trial: { enabled: true, days: 14 },
    category: 'standard',
    tags: ['individual', 'starter']
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Advanced features for growing businesses and teams',
    pricing: {
      monthly: { amount: 99, currency: 'USD' },
      yearly: { amount: 990, currency: 'USD', discount: 17 },
      quarterly: { amount: 270, currency: 'USD', discount: 9 }
    },
    features: {
      users: { included: 5, additionalCost: 10 },
      socialAccounts: { included: 15, additionalCost: 0 },
      monthlyPosts: { included: 200 },
      aiGenerations: { included: 100 },
      storageGB: { included: 10, additionalCost: 5 },
      analyticsRetentionDays: 90,
      aiAgents: true,
      analytics: true,
      teamCollaboration: true,
      whiteLabel: false,
      apiAccess: true,
      prioritySupport: true
    },
    isActive: true,
    isPopular: true,
    sortOrder: 2,
    trial: { enabled: true, days: 14 },
    category: 'standard',
    tags: ['business', 'popular']
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Enterprise-grade solution for large organizations',
    pricing: {
      monthly: { amount: 299, currency: 'USD' },
      yearly: { amount: 2990, currency: 'USD', discount: 17 },
      quarterly: { amount: 820, currency: 'USD', discount: 8 }
    },
    features: {
      users: { included: 25, additionalCost: 8 },
      socialAccounts: { included: -1 }, // Unlimited
      monthlyPosts: { included: -1 }, // Unlimited
      aiGenerations: { included: 500 },
      storageGB: { included: 100, additionalCost: 2 },
      analyticsRetentionDays: 365,
      aiAgents: true,
      analytics: true,
      teamCollaboration: true,
      whiteLabel: true,
      apiAccess: true,
      prioritySupport: true,
      customBranding: true,
      advancedAnalytics: true,
      multipleWorkspaces: true,
      sso: true
    },
    isActive: true,
    isPopular: false,
    sortOrder: 3,
    trial: { enabled: true, days: 30 },
    category: 'enterprise',
    tags: ['enterprise', 'unlimited']
  }
];

// Generate mock subscription data
const generateMockSubscriptions = async () => {
  try {
    const users = await User.find().limit(100);
    const plans = ['Starter', 'Pro', 'Premium'];
    const statuses = ['active', 'trial', 'past_due', 'cancelled', 'inactive'];
    
    const subscriptions = users.map((user, index) => {
      const plan = plans[Math.floor(Math.random() * plans.length)];
      const planData = subscriptionPlans.find(p => p.name === plan);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const nextBilling = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      return {
        id: `sub_${user._id}`,
        user_id: user._id,
        user_name: user.name || `User ${index + 1}`,
        user_email: user.email || `user${index + 1}@example.com`,
        plan: plan,
        status: status,
        amount: planData ? planData.pricing.monthly.amount : 29,
        billing_cycle: 'monthly',
        next_billing: status === 'active' ? nextBilling.toISOString() : null,
        created_at: createdAt.toISOString(),
        trial_end: status === 'trial' ? new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() : null,
        payment_method: 'card',
        mrr: status === 'active' ? (planData ? planData.pricing.monthly.amount : 29) : 0,
        usage: {
          posts: Math.floor(Math.random() * 100),
          accounts: Math.floor(Math.random() * 10) + 1,
          ai_tokens: Math.floor(Math.random() * 1000)
        },
        customer: {
          name: user.name || `User ${index + 1}`,
          email: user.email || `user${index + 1}@example.com`,
          avatar: `/api/placeholder/40/40`
        }
      };
    });
    
    return subscriptions;
  } catch (error) {
    console.error('Error generating mock subscriptions:', error);
    return [];
  }
};

// @route   GET /api/subscriptions/metrics
// @desc    Get subscription metrics and KPIs
// @access  Admin
router.get('/metrics', async (req, res) => {
  try {
    const subscriptions = await generateMockSubscriptions();
    
    // Calculate metrics
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const trialSubscriptions = subscriptions.filter(s => s.status === 'trial').length;
    const pastDueSubscriptions = subscriptions.filter(s => s.status === 'past_due').length;
    const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled').length;
    
    const totalMRR = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.mrr, 0);
    const avgRevenuePerUser = activeSubscriptions > 0 ? totalMRR / activeSubscriptions : 0;
    const churnRate = totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0;
    
    // Plan distribution
    const planDistribution = subscriptionPlans.map(plan => ({
      name: plan.name,
      count: subscriptions.filter(s => s.plan === plan.name).length,
      revenue: subscriptions.filter(s => s.plan === plan.name && s.status === 'active')
        .reduce((sum, s) => sum + s.mrr, 0)
    }));
    
    // Growth trends (mock data)
    const growthTrends = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return {
        month: date.toISOString().slice(0, 7),
        subscriptions: Math.floor(Math.random() * 50) + (i * 10) + 100,
        revenue: Math.floor(Math.random() * 5000) + (i * 1000) + 8000,
        churn: Math.random() * 5 + 2
      };
    });

    const metrics = {
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        trial: trialSubscriptions,
        pastDue: pastDueSubscriptions,
        cancelled: cancelledSubscriptions
      },
      revenue: {
        totalMRR: Math.round(totalMRR),
        avgRevenuePerUser: Math.round(avgRevenuePerUser * 100) / 100,
        annualRecurringRevenue: Math.round(totalMRR * 12),
        projectedRevenue: Math.round(totalMRR * 12 * 1.2) // 20% growth projection
      },
      performance: {
        churnRate: Math.round(churnRate * 100) / 100,
        conversionRate: 78.5, // Mock conversion rate
        ltv: Math.round(avgRevenuePerUser * 24), // 24 months average LTV
        cac: 45 // Mock customer acquisition cost
      },
      planDistribution,
      growthTrends,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Subscription metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription metrics',
      error: error.message
    });
  }
});

// @route   GET /api/subscriptions
// @desc    Get subscriptions with filtering and pagination
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      plan = 'all',
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    let subscriptions = await generateMockSubscriptions();

    // Apply filters
    if (status !== 'all') {
      subscriptions = subscriptions.filter(subscription => subscription.status === status);
    }
    
    if (plan !== 'all') {
      subscriptions = subscriptions.filter(subscription => subscription.plan === plan);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      subscriptions = subscriptions.filter(subscription => 
        subscription.user_name.toLowerCase().includes(searchLower) ||
        subscription.user_email.toLowerCase().includes(searchLower) ||
        subscription.plan.toLowerCase().includes(searchLower) ||
        subscription.id.toLowerCase().includes(searchLower)
      );
    }

    // Sort subscriptions
    subscriptions.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'next_billing' || sortBy === 'trial_end') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedSubscriptions = subscriptions.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        subscriptions: paginatedSubscriptions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(subscriptions.length / limit),
          total: subscriptions.length,
          limit: parseInt(limit)
        },
        filters: {
          status,
          plan,
          search,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error.message
    });
  }
});

// @route   GET /api/subscriptions/plans
// @desc    Get available subscription plans
// @access  Admin
router.get('/plans', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        plans: subscriptionPlans,
        summary: {
          totalPlans: subscriptionPlans.length,
          activePlans: subscriptionPlans.filter(p => p.isActive).length,
          popularPlan: subscriptionPlans.find(p => p.isPopular)?.name || 'Pro'
        },
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans',
      error: error.message
    });
  }
});

// @route   GET /api/subscriptions/:id
// @desc    Get specific subscription details
// @access  Admin
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subscriptions = await generateMockSubscriptions();
    const subscription = subscriptions.find(s => s.id === id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Add billing history
    subscription.billingHistory = [
      {
        id: 1,
        date: subscription.created_at,
        amount: subscription.amount,
        status: 'paid',
        invoice: `inv_${Date.now()}`,
        description: `${subscription.plan} Plan - Monthly`
      }
    ];

    // Add usage details
    subscription.usageDetails = {
      currentPeriod: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      },
      usage: subscription.usage,
      limits: subscriptionPlans.find(p => p.name === subscription.plan)?.features || {}
    };

    res.json({
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error('Subscription details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription details',
      error: error.message
    });
  }
});

// @route   PUT /api/subscriptions/:id
// @desc    Update subscription
// @access  Admin
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // In production, this would update the subscription in the database
    // For now, we'll just return a success response
    
    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        id,
        ...updates,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message
    });
  }
});

// @route   POST /api/subscriptions/:id/cancel
// @desc    Cancel subscription
// @access  Admin
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by admin' } = req.body;

    // In production, this would cancel the subscription
    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: {
        id,
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason
      }
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

// @route   POST /api/subscriptions/:id/reactivate
// @desc    Reactivate cancelled subscription
// @access  Admin
router.post('/:id/reactivate', async (req, res) => {
  try {
    const { id } = req.params;

    // In production, this would reactivate the subscription
    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      data: {
        id,
        status: 'active',
        reactivated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate subscription',
      error: error.message
    });
  }
});

// @route   POST /api/subscriptions/plans
// @desc    Create new subscription plan
// @access  Admin
router.post('/plans', async (req, res) => {
  try {
    const planData = req.body;

    // Validate required fields
    if (!planData.name || !planData.pricing) {
      return res.status(400).json({
        success: false,
        message: 'Plan name and pricing are required'
      });
    }

    // In production, this would create the plan in the database
    const newPlan = {
      id: planData.name.toLowerCase().replace(/\s+/g, '-'),
      ...planData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Subscription plan created successfully',
      data: newPlan
    });

  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription plan',
      error: error.message
    });
  }
});

// @route   GET /api/subscriptions/analytics/revenue
// @desc    Get revenue analytics
// @access  Admin
router.get('/analytics/revenue', async (req, res) => {
  try {
    const { timeRange = '12m' } = req.query;
    
    // Generate mock revenue analytics
    const months = timeRange === '12m' ? 12 : timeRange === '6m' ? 6 : 12;
    
    const revenueData = Array.from({ length: months }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));
      return {
        month: date.toISOString().slice(0, 7),
        monthName: date.toLocaleDateString('en-US', { month: 'short' }),
        mrr: Math.floor(Math.random() * 5000) + (i * 1000) + 8000,
        subscriptions: Math.floor(Math.random() * 50) + (i * 10) + 100,
        newSubscriptions: Math.floor(Math.random() * 20) + 10,
        churnedSubscriptions: Math.floor(Math.random() * 10) + 2,
        upgrades: Math.floor(Math.random() * 15) + 5,
        downgrades: Math.floor(Math.random() * 8) + 1
      };
    });

    res.json({
      success: true,
      data: {
        revenueData,
        summary: {
          totalRevenue: revenueData.reduce((sum, month) => sum + month.mrr, 0),
          avgMonthlyGrowth: 12.5,
          totalSubscriptions: revenueData[revenueData.length - 1]?.subscriptions || 0,
          timeRange
        },
        lastUpdated: new Date()
      }
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

module.exports = router;
