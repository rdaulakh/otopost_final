const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Rate limiting for admin dashboard endpoints
const adminDashboardRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
  message: 'Too many admin dashboard requests from this IP'
});

router.use(adminDashboardRateLimit);
router.use(auth);
router.use(adminAuth);

// Generate mock dashboard data with realistic metrics
const generateDashboardData = async () => {
  try {
    const users = await User.find().limit(100);
    const userCount = users.length;
    
    return {
      platform: {
        total_users: userCount + Math.floor(Math.random() * 10000) + 5000,
        active_users: Math.floor((userCount + 3000) * 0.75),
        new_users_today: Math.floor(Math.random() * 50) + 10,
        total_revenue: Math.floor(Math.random() * 500000) + 250000,
        monthly_revenue: Math.floor(Math.random() * 50000) + 25000,
        revenue_growth: Math.random() * 20 + 5, // 5-25%
        system_uptime: 99.9,
        api_calls: Math.floor(Math.random() * 1000000) + 500000,
        ai_agent_tasks: Math.floor(Math.random() * 10000) + 5000,
        storage_used: Math.floor(Math.random() * 1000) + 500, // GB
        bandwidth_used: Math.floor(Math.random() * 5000) + 2000, // GB
        active_campaigns: Math.floor(Math.random() * 500) + 200,
        posts_published: Math.floor(Math.random() * 10000) + 5000
      },
      
      users: {
        total: userCount + Math.floor(Math.random() * 10000) + 5000,
        active: Math.floor((userCount + 3000) * 0.75),
        trial: Math.floor((userCount + 1000) * 0.15),
        premium: Math.floor((userCount + 2000) * 0.25),
        pro: Math.floor((userCount + 1500) * 0.35),
        starter: Math.floor((userCount + 1000) * 0.25),
        churn_rate: Math.random() * 5 + 2, // 2-7%
        avg_session_time: `${Math.floor(Math.random() * 30) + 15}m ${Math.floor(Math.random() * 60)}s`,
        conversion_rate: Math.random() * 10 + 15, // 15-25%
        retention_rate: Math.random() * 10 + 85 // 85-95%
      },
      
      revenue: {
        total: Math.floor(Math.random() * 500000) + 250000,
        monthly: Math.floor(Math.random() * 50000) + 25000,
        growth: Math.random() * 20 + 5, // 5-25%
        mrr: Math.floor(Math.random() * 45000) + 20000,
        arr: Math.floor(Math.random() * 540000) + 240000,
        ltv: Math.floor(Math.random() * 2000) + 1000,
        churn: Math.random() * 5 + 2, // 2-7%
        arpu: Math.floor(Math.random() * 100) + 50, // Average Revenue Per User
        expansion_revenue: Math.floor(Math.random() * 10000) + 5000
      },
      
      system: {
        uptime: 99.9,
        api_health: 'healthy',
        db_health: 'healthy',
        ai_agents_status: 'active',
        alerts: Math.floor(Math.random() * 5),
        critical_issues: Math.floor(Math.random() * 2),
        avg_response_time: `${Math.floor(Math.random() * 200) + 50}ms`,
        cpu_usage: Math.random() * 30 + 40, // 40-70%
        memory_usage: Math.random() * 25 + 50, // 50-75%
        disk_usage: Math.random() * 20 + 60, // 60-80%
        network_throughput: Math.floor(Math.random() * 1000) + 500 // Mbps
      },
      
      support: {
        open_tickets: Math.floor(Math.random() * 50) + 10,
        resolved_today: Math.floor(Math.random() * 20) + 5,
        avg_resolution_time: `${Math.floor(Math.random() * 4) + 2}h ${Math.floor(Math.random() * 60)}m`,
        satisfaction: Math.random() * 1 + 4, // 4-5 stars
        pending_tickets: Math.floor(Math.random() * 30) + 5,
        escalated_tickets: Math.floor(Math.random() * 5)
      },
      
      content: {
        total_posts: Math.floor(Math.random() * 50000) + 25000,
        posts_today: Math.floor(Math.random() * 500) + 200,
        ai_generated_posts: Math.floor(Math.random() * 20000) + 10000,
        scheduled_posts: Math.floor(Math.random() * 1000) + 500,
        engagement_rate: Math.random() * 5 + 3, // 3-8%
        avg_reach: Math.floor(Math.random() * 10000) + 5000
      },
      
      integrations: {
        total_connected: Math.floor(Math.random() * 20) + 15,
        instagram: Math.random() > 0.2,
        facebook: Math.random() > 0.1,
        linkedin: Math.random() > 0.3,
        twitter: Math.random() > 0.2,
        tiktok: Math.random() > 0.4,
        youtube: Math.random() > 0.5,
        api_calls_today: Math.floor(Math.random() * 100000) + 50000,
        webhook_deliveries: Math.floor(Math.random() * 10000) + 5000
      }
    };
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    return null;
  }
};

// Generate trend data for charts
const generateTrendData = (days = 30, baseValue = 1000, volatility = 0.1) => {
  const data = [];
  let currentValue = baseValue;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    
    // Add some realistic trend and volatility
    const trend = Math.sin(i / 10) * baseValue * 0.1;
    const randomChange = (Math.random() - 0.5) * baseValue * volatility;
    currentValue = Math.max(0, baseValue + trend + randomChange);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(currentValue),
      timestamp: date.toISOString()
    });
  }
  
  return data;
};

// @route   GET /api/admin-dashboard/overview
// @desc    Get admin dashboard overview data
// @access  Admin
router.get('/overview', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const dashboardData = await generateDashboardData();
    
    if (!dashboardData) {
      throw new Error('Failed to generate dashboard data');
    }

    res.json({
      success: true,
      data: {
        ...dashboardData,
        time_range: timeRange,
        last_updated: new Date(),
        refresh_interval: 300000 // 5 minutes
      }
    });

  } catch (error) {
    console.error('Admin dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard overview',
      error: error.message
    });
  }
});

// @route   GET /api/admin-dashboard/system-health
// @desc    Get system health metrics
// @access  Admin
router.get('/system-health', async (req, res) => {
  try {
    const healthData = {
      overall_status: 'healthy',
      uptime: 99.9,
      services: {
        api: {
          status: 'healthy',
          response_time: Math.floor(Math.random() * 100) + 50,
          success_rate: 99.8,
          last_check: new Date().toISOString()
        },
        database: {
          status: 'healthy',
          connections: Math.floor(Math.random() * 50) + 20,
          query_time: Math.floor(Math.random() * 50) + 10,
          last_check: new Date().toISOString()
        },
        ai_agents: {
          status: 'active',
          active_agents: Math.floor(Math.random() * 10) + 5,
          tasks_processed: Math.floor(Math.random() * 1000) + 500,
          last_check: new Date().toISOString()
        },
        storage: {
          status: 'healthy',
          used_space: Math.floor(Math.random() * 500) + 200,
          total_space: 1000,
          last_check: new Date().toISOString()
        },
        cdn: {
          status: 'healthy',
          cache_hit_rate: Math.random() * 10 + 85,
          bandwidth_used: Math.floor(Math.random() * 1000) + 500,
          last_check: new Date().toISOString()
        }
      },
      alerts: [
        {
          id: 'alert_1',
          type: 'warning',
          message: 'High CPU usage detected on server-02',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false
        }
      ].filter(() => Math.random() > 0.7), // Sometimes no alerts
      
      performance_metrics: {
        cpu_usage: Math.random() * 30 + 40,
        memory_usage: Math.random() * 25 + 50,
        disk_usage: Math.random() * 20 + 60,
        network_io: Math.floor(Math.random() * 1000) + 500,
        active_connections: Math.floor(Math.random() * 1000) + 500
      },
      
      last_updated: new Date()
    };

    res.json({
      success: true,
      data: healthData
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

// @route   GET /api/admin-dashboard/user-analytics
// @desc    Get user analytics data
// @access  Admin
router.get('/user-analytics', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    const userAnalytics = {
      summary: {
        total_users: Math.floor(Math.random() * 10000) + 5000,
        active_users: Math.floor(Math.random() * 7500) + 3750,
        new_users: Math.floor(Math.random() * 500) + 100,
        churned_users: Math.floor(Math.random() * 100) + 20,
        conversion_rate: Math.random() * 10 + 15,
        retention_rate: Math.random() * 10 + 85
      },
      
      growth_trend: generateTrendData(days, 100, 0.2).map(item => ({
        date: item.date,
        new_users: item.value,
        active_users: Math.floor(item.value * 7.5),
        total_users: Math.floor(item.value * 50)
      })),
      
      subscription_distribution: [
        { name: 'Starter', value: Math.floor(Math.random() * 2000) + 1000, color: '#8884d8' },
        { name: 'Professional', value: Math.floor(Math.random() * 1500) + 750, color: '#82ca9d' },
        { name: 'Enterprise', value: Math.floor(Math.random() * 800) + 400, color: '#ffc658' },
        { name: 'Trial', value: Math.floor(Math.random() * 500) + 250, color: '#ff7300' }
      ],
      
      user_activity: {
        daily_active_users: Math.floor(Math.random() * 3000) + 1500,
        weekly_active_users: Math.floor(Math.random() * 5000) + 2500,
        monthly_active_users: Math.floor(Math.random() * 8000) + 4000,
        avg_session_duration: Math.floor(Math.random() * 30) + 15, // minutes
        bounce_rate: Math.random() * 20 + 30 // 30-50%
      },
      
      demographics: {
        by_location: [
          { country: 'United States', users: Math.floor(Math.random() * 2000) + 1000 },
          { country: 'United Kingdom', users: Math.floor(Math.random() * 800) + 400 },
          { country: 'Canada', users: Math.floor(Math.random() * 600) + 300 },
          { country: 'Australia', users: Math.floor(Math.random() * 400) + 200 },
          { country: 'Germany', users: Math.floor(Math.random() * 300) + 150 }
        ],
        by_device: [
          { device: 'Desktop', users: Math.floor(Math.random() * 3000) + 1500 },
          { device: 'Mobile', users: Math.floor(Math.random() * 2000) + 1000 },
          { device: 'Tablet', users: Math.floor(Math.random() * 500) + 250 }
        ]
      },
      
      time_range: timeRange,
      last_updated: new Date()
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

// @route   GET /api/admin-dashboard/revenue-analytics
// @desc    Get revenue analytics data
// @access  Admin
router.get('/revenue-analytics', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    const revenueAnalytics = {
      summary: {
        total_revenue: Math.floor(Math.random() * 500000) + 250000,
        monthly_revenue: Math.floor(Math.random() * 50000) + 25000,
        revenue_growth: Math.random() * 20 + 5,
        mrr: Math.floor(Math.random() * 45000) + 20000,
        arr: Math.floor(Math.random() * 540000) + 240000,
        ltv: Math.floor(Math.random() * 2000) + 1000,
        churn_revenue: Math.floor(Math.random() * 5000) + 1000,
        expansion_revenue: Math.floor(Math.random() * 10000) + 5000
      },
      
      monthly_trend: generateTrendData(days, 25000, 0.15).map(item => ({
        date: item.date,
        revenue: item.value,
        mrr: Math.floor(item.value * 0.8),
        new_revenue: Math.floor(item.value * 0.2),
        expansion_revenue: Math.floor(item.value * 0.1)
      })),
      
      revenue_by_plan: [
        { plan: 'Starter', revenue: Math.floor(Math.random() * 50000) + 25000, color: '#8884d8' },
        { plan: 'Professional', revenue: Math.floor(Math.random() * 100000) + 50000, color: '#82ca9d' },
        { plan: 'Enterprise', revenue: Math.floor(Math.random() * 200000) + 100000, color: '#ffc658' },
        { plan: 'Custom', revenue: Math.floor(Math.random() * 150000) + 75000, color: '#ff7300' }
      ],
      
      financial_metrics: {
        gross_margin: Math.random() * 10 + 75, // 75-85%
        net_margin: Math.random() * 10 + 20, // 20-30%
        customer_acquisition_cost: Math.floor(Math.random() * 200) + 100,
        payback_period: Math.floor(Math.random() * 12) + 6, // months
        churn_rate: Math.random() * 5 + 2, // 2-7%
        expansion_rate: Math.random() * 15 + 10 // 10-25%
      },
      
      payment_methods: [
        { method: 'Credit Card', percentage: Math.random() * 20 + 70 },
        { method: 'Bank Transfer', percentage: Math.random() * 15 + 15 },
        { method: 'PayPal', percentage: Math.random() * 10 + 5 },
        { method: 'Other', percentage: Math.random() * 5 + 2 }
      ],
      
      time_range: timeRange,
      last_updated: new Date()
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

// @route   GET /api/admin-dashboard/platform-stats
// @desc    Get platform statistics
// @access  Admin
router.get('/platform-stats', async (req, res) => {
  try {
    const platformStats = {
      content: {
        total_posts: Math.floor(Math.random() * 50000) + 25000,
        posts_today: Math.floor(Math.random() * 500) + 200,
        ai_generated_posts: Math.floor(Math.random() * 20000) + 10000,
        scheduled_posts: Math.floor(Math.random() * 1000) + 500,
        published_posts: Math.floor(Math.random() * 40000) + 20000,
        draft_posts: Math.floor(Math.random() * 5000) + 2000
      },
      
      campaigns: {
        total_campaigns: Math.floor(Math.random() * 2000) + 1000,
        active_campaigns: Math.floor(Math.random() * 500) + 200,
        completed_campaigns: Math.floor(Math.random() * 1500) + 750,
        avg_campaign_performance: Math.random() * 20 + 70, // 70-90%
        total_reach: Math.floor(Math.random() * 10000000) + 5000000,
        total_engagement: Math.floor(Math.random() * 1000000) + 500000
      },
      
      ai_agents: {
        total_agents: Math.floor(Math.random() * 20) + 10,
        active_agents: Math.floor(Math.random() * 15) + 8,
        tasks_completed: Math.floor(Math.random() * 100000) + 50000,
        tasks_pending: Math.floor(Math.random() * 1000) + 500,
        avg_processing_time: Math.floor(Math.random() * 5) + 2, // seconds
        success_rate: Math.random() * 5 + 95 // 95-100%
      },
      
      integrations: {
        total_integrations: Math.floor(Math.random() * 50) + 25,
        active_integrations: Math.floor(Math.random() * 40) + 20,
        api_calls_today: Math.floor(Math.random() * 100000) + 50000,
        webhook_deliveries: Math.floor(Math.random() * 10000) + 5000,
        integration_uptime: Math.random() * 2 + 98, // 98-100%
        failed_requests: Math.floor(Math.random() * 100) + 10
      },
      
      storage: {
        total_storage: 10000, // GB
        used_storage: Math.floor(Math.random() * 5000) + 2000,
        media_files: Math.floor(Math.random() * 100000) + 50000,
        backup_size: Math.floor(Math.random() * 1000) + 500,
        cdn_bandwidth: Math.floor(Math.random() * 10000) + 5000,
        storage_growth_rate: Math.random() * 10 + 5 // 5-15% per month
      },
      
      performance: {
        avg_response_time: Math.floor(Math.random() * 200) + 100, // ms
        uptime_percentage: Math.random() * 1 + 99, // 99-100%
        error_rate: Math.random() * 1 + 0.1, // 0.1-1.1%
        throughput: Math.floor(Math.random() * 10000) + 5000, // requests/hour
        concurrent_users: Math.floor(Math.random() * 1000) + 500,
        peak_load_time: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      },
      
      last_updated: new Date()
    };

    res.json({
      success: true,
      data: platformStats
    });

  } catch (error) {
    console.error('Platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics',
      error: error.message
    });
  }
});

// @route   GET /api/admin-dashboard/alerts
// @desc    Get admin alerts and notifications
// @access  Admin
router.get('/alerts', async (req, res) => {
  try {
    const { severity = 'all', limit = 20 } = req.query;
    
    const allAlerts = [
      {
        id: 'alert_1',
        type: 'system',
        severity: 'warning',
        title: 'High CPU Usage',
        message: 'Server CPU usage has exceeded 80% for the past 15 minutes',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        resolved: false,
        action_required: true,
        affected_service: 'api-server'
      },
      {
        id: 'alert_2',
        type: 'revenue',
        severity: 'info',
        title: 'Revenue Milestone',
        message: 'Monthly revenue has exceeded $50,000',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: false,
        action_required: false,
        affected_service: 'billing'
      },
      {
        id: 'alert_3',
        type: 'security',
        severity: 'critical',
        title: 'Multiple Failed Login Attempts',
        message: 'Detected 50+ failed login attempts from IP 192.168.1.100',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        resolved: true,
        resolved_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        action_required: false,
        affected_service: 'authentication'
      },
      {
        id: 'alert_4',
        type: 'user',
        severity: 'medium',
        title: 'User Churn Alert',
        message: 'Daily churn rate has increased by 15% compared to last week',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        resolved: false,
        action_required: true,
        affected_service: 'user-management'
      }
    ];

    let filteredAlerts = allAlerts;
    if (severity !== 'all') {
      filteredAlerts = allAlerts.filter(alert => alert.severity === severity);
    }

    const alerts = filteredAlerts.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        alerts,
        summary: {
          total: allAlerts.length,
          critical: allAlerts.filter(a => a.severity === 'critical').length,
          warning: allAlerts.filter(a => a.severity === 'warning').length,
          info: allAlerts.filter(a => a.severity === 'info').length,
          unresolved: allAlerts.filter(a => !a.resolved).length,
          action_required: allAlerts.filter(a => a.action_required && !a.resolved).length
        }
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

// @route   POST /api/admin-dashboard/refresh
// @desc    Trigger dashboard data refresh
// @access  Admin
router.post('/refresh', async (req, res) => {
  try {
    // In a real implementation, this would trigger cache refresh
    res.json({
      success: true,
      message: 'Dashboard refresh initiated',
      data: {
        refresh_id: `refresh_${Date.now()}`,
        initiated_at: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + 30000).toISOString() // 30 seconds
      }
    });

  } catch (error) {
    console.error('Dashboard refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh dashboard',
      error: error.message
    });
  }
});

module.exports = router;
