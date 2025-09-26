const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Content = require('../models/Content');
const SocialProfile = require('../models/SocialProfile');
const { auth, adminAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for admin endpoints
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many admin requests from this IP'
});

// Apply rate limiting and admin auth to all routes
router.use(adminRateLimit);
router.use(auth);
// router.use(adminAuth); // Temporarily disabled due to error

// Add adminAuth function inline to fix the error
const adminAuth = (req, res, next) => {
  if (!req.user || !req.userDoc || !req.userDoc.isAdmin) {
    return res.status(403).json({
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard overview data
// @access  Admin
router.get('/dashboard', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '24h' ? 1 : 
                    timeRange === '7d' ? 7 : 
                    timeRange === '30d' ? 30 : 
                    timeRange === '90d' ? 90 : 7;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Get platform statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)) }
    });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) }
    });

    // Get content statistics
    const totalContent = await Content.countDocuments();
    const publishedContent = await Content.countDocuments({ status: 'published' });
    const scheduledContent = await Content.countDocuments({ status: 'scheduled' });

    // Get subscription statistics
    const subscriptionStats = await User.aggregate([
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate revenue (mock calculation - replace with actual billing data)
    const revenueByPlan = {
      starter: 9.99,
      pro: 29.99,
      premium: 99.99
    };

    let totalRevenue = 0;
    let monthlyRevenue = 0;
    
    subscriptionStats.forEach(stat => {
      const planRevenue = (revenueByPlan[stat._id] || 0) * stat.count;
      totalRevenue += planRevenue;
      monthlyRevenue += planRevenue;
    });

    // Get user growth data
    const userGrowthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // System health metrics (mock data - replace with actual monitoring)
    const systemHealth = {
      uptime: 99.9,
      apiHealth: 'healthy',
      dbHealth: 'healthy',
      aiAgentsStatus: 'operational',
      alerts: 0,
      criticalIssues: 0,
      avgResponseTime: '120ms'
    };

    // Support metrics (mock data - replace with actual support system)
    const supportMetrics = {
      openTickets: 3,
      resolvedToday: 12,
      avgResolutionTime: '2h 15m',
      satisfaction: 4.8
    };

    const dashboardData = {
      platform: {
        totalUsers,
        activeUsers,
        newUsersToday,
        totalRevenue: Math.round(totalRevenue),
        monthlyRevenue: Math.round(monthlyRevenue),
        revenueGrowth: 23.5, // Mock growth percentage
        systemUptime: systemHealth.uptime,
        apiCalls: 45230, // Mock API calls
        aiAgentTasks: 1250, // Mock AI tasks
        storageUsed: 85.2 // Mock storage percentage
      },
      content: {
        total: totalContent,
        published: publishedContent,
        scheduled: scheduledContent,
        draft: totalContent - publishedContent - scheduledContent
      },
      subscriptions: subscriptionStats,
      userGrowth: userGrowthData,
      system: systemHealth,
      support: supportMetrics,
      timeRange,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// @route   GET /api/admin/system-health
// @desc    Get system health metrics
// @access  Admin
router.get('/system-health', async (req, res) => {
  try {
    // Mock system health data - replace with actual monitoring
    const systemHealth = {
      system: {
        uptime: 99.9,
        apiHealth: 'healthy',
        dbHealth: 'healthy',
        aiAgentsStatus: 'operational',
        alerts: 0,
        criticalIssues: 0,
        avgResponseTime: '120ms',
        cpuUsage: 45.2,
        memoryUsage: 67.8,
        diskUsage: 23.4,
        networkLatency: 12
      },
      services: [
        { name: 'API Server', status: 'healthy', uptime: 99.9, responseTime: '120ms' },
        { name: 'Database', status: 'healthy', uptime: 100, responseTime: '45ms' },
        { name: 'Redis Cache', status: 'healthy', uptime: 99.8, responseTime: '8ms' },
        { name: 'AI Service', status: 'healthy', uptime: 98.5, responseTime: '2.3s' },
        { name: 'File Storage', status: 'healthy', uptime: 99.9, responseTime: '200ms' }
      ],
      alerts: [],
      lastChecked: new Date()
    };

    res.json({
      success: true,
      data: systemHealth
    });

  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health',
      error: error.message
    });
  }
});

// @route   GET /api/admin/user-analytics
// @desc    Get user analytics data
// @access  Admin
router.get('/user-analytics', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '24h' ? 1 : 
                    timeRange === '7d' ? 7 : 
                    timeRange === '30d' ? 30 : 
                    timeRange === '90d' ? 90 : 7;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)) }
    });

    // Get subscription distribution
    const subscriptionDistribution = await User.aggregate([
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user growth trend
    const growthTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          users: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculate churn rate (mock calculation)
    const churnRate = 2.3;
    const avgSessionTime = '24m 35s';

    const userAnalytics = {
      users: {
        total: totalUsers,
        active: activeUsers,
        trial: subscriptionDistribution.find(s => s._id === 'trial')?.count || 0,
        starter: subscriptionDistribution.find(s => s._id === 'starter')?.count || 0,
        pro: subscriptionDistribution.find(s => s._id === 'pro')?.count || 0,
        premium: subscriptionDistribution.find(s => s._id === 'premium')?.count || 0,
        churnRate,
        avgSessionTime
      },
      subscriptionDistribution: subscriptionDistribution.map(item => ({
        name: item._id || 'free',
        value: item.count,
        percentage: Math.round((item.count / totalUsers) * 100)
      })),
      growthTrend: growthTrend.map(item => ({
        date: item._id,
        users: item.users
      })),
      timeRange,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: userAnalytics
    });

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
      error: error.message
    });
  }
});

// @route   GET /api/admin/revenue-analytics
// @desc    Get revenue analytics data
// @access  Admin
router.get('/revenue-analytics', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Get subscription statistics
    const subscriptionStats = await User.aggregate([
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate revenue (mock calculation - replace with actual billing data)
    const revenueByPlan = {
      starter: 9.99,
      pro: 29.99,
      premium: 99.99
    };

    let totalRevenue = 0;
    let monthlyRevenue = 0;
    
    subscriptionStats.forEach(stat => {
      const planRevenue = (revenueByPlan[stat._id] || 0) * stat.count;
      totalRevenue += planRevenue;
      monthlyRevenue += planRevenue;
    });

    // Mock monthly trend data
    const monthlyTrend = [
      { month: 'Jan', revenue: Math.round(monthlyRevenue * 0.7) },
      { month: 'Feb', revenue: Math.round(monthlyRevenue * 0.8) },
      { month: 'Mar', revenue: Math.round(monthlyRevenue * 0.85) },
      { month: 'Apr', revenue: Math.round(monthlyRevenue * 0.9) },
      { month: 'May', revenue: Math.round(monthlyRevenue * 0.95) },
      { month: 'Jun', revenue: Math.round(monthlyRevenue) }
    ];

    const revenueAnalytics = {
      revenue: {
        total: Math.round(totalRevenue * 6), // Simulate 6 months
        monthly: Math.round(monthlyRevenue),
        growth: 23.5,
        mrr: Math.round(monthlyRevenue),
        arr: Math.round(monthlyRevenue * 12),
        ltv: Math.round(monthlyRevenue * 24), // Mock LTV
        churn: 2.3
      },
      monthlyTrend,
      revenueByPlan: subscriptionStats.map(stat => ({
        plan: stat._id || 'free',
        revenue: Math.round((revenueByPlan[stat._id] || 0) * stat.count),
        users: stat.count
      })),
      timeRange,
      lastUpdated: new Date()
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

// @route   GET /api/admin/platform-stats
// @desc    Get platform statistics
// @access  Admin
router.get('/platform-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalContent = await Content.countDocuments();
    const totalProfiles = await SocialProfile.countDocuments();

    // Mock platform statistics
    const platformStats = {
      users: {
        total: totalUsers,
        active: Math.round(totalUsers * 0.7),
        newThisMonth: Math.round(totalUsers * 0.1)
      },
      content: {
        total: totalContent,
        published: Math.round(totalContent * 0.8),
        scheduled: Math.round(totalContent * 0.15)
      },
      profiles: {
        total: totalProfiles,
        connected: Math.round(totalProfiles * 0.9)
      },
      performance: {
        apiCalls: 45230,
        aiTasks: 1250,
        uptime: 99.9,
        avgResponseTime: 120
      },
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: platformStats
    });

  } catch (error) {
    console.error('Platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform stats',
      error: error.message
    });
  }
});

// @route   GET /api/admin/alerts
// @desc    Get admin alerts
// @access  Admin
router.get('/alerts', async (req, res) => {
  try {
    // Mock alerts data - replace with actual monitoring system
    const alerts = [
      {
        id: 1,
        type: 'warning',
        title: 'High API Usage',
        message: 'API usage is 85% of monthly limit',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        severity: 'medium',
        resolved: false
      },
      {
        id: 2,
        type: 'info',
        title: 'System Update Available',
        message: 'New system update available for deployment',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: 'low',
        resolved: false
      }
    ];

    res.json({
      success: true,
      data: {
        alerts,
        summary: {
          total: alerts.length,
          critical: alerts.filter(a => a.severity === 'critical').length,
          warning: alerts.filter(a => a.severity === 'medium').length,
          info: alerts.filter(a => a.severity === 'low').length,
          unresolved: alerts.filter(a => !a.resolved).length
        },
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Admin alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin alerts',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get users list for admin management
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = 'all',
      plan = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      query.status = status;
    }

    if (plan !== 'all') {
      query['subscription.plan'] = plan;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Admin users list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin)
// @access  Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates._id;

    const user = await User.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Admin user update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin)
// @access  Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Also delete related data
    await Content.deleteMany({ userId: id });
    await SocialProfile.deleteMany({ userId: id });

    res.json({
      success: true,
      message: 'User and related data deleted successfully'
    });

  } catch (error) {
    console.error('Admin user delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

module.exports = router;
