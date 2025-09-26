const express = require('express');
const router = express.Router();

// Mock data for admin dashboard
const mockDashboardData = {
  platform: {
    totalUsers: 2847,
    activeUsers: 1923,
    newUsersToday: 47,
    totalRevenue: 89420,
    monthlyRevenue: 12340,
    revenueGrowth: 23.5,
    systemUptime: 99.97,
    apiCalls: 1247893,
    aiAgentTasks: 45672,
    storageUsed: 78.3
  },
  support: {
    openTickets: 23,
    resolvedToday: 12,
    avgResolutionTime: '2h 15m',
    satisfaction: 4.7
  }
};

const mockSystemHealth = {
  system: {
    uptime: 99.97,
    apiHealth: 'operational',
    dbHealth: 'operational',
    aiAgentsStatus: 'active',
    alerts: 2,
    criticalIssues: 0,
    avgResponseTime: '145ms'
  }
};

const mockUserAnalytics = {
  users: {
    total: 2847,
    active: 1923,
    trial: 234,
    premium: 892,
    pro: 567,
    starter: 464,
    churnRate: 2.3,
    avgSessionTime: '24m 32s'
  },
  growthTrend: [
    { date: '2024-01-01', total: 2100, active: 1800 },
    { date: '2024-01-02', total: 2150, active: 1820 },
    { date: '2024-01-03', total: 2200, active: 1850 },
    { date: '2024-01-04', total: 2250, active: 1880 },
    { date: '2024-01-05', total: 2300, active: 1900 },
    { date: '2024-01-06', total: 2350, active: 1920 },
    { date: '2024-01-07', total: 2400, active: 1950 }
  ],
  subscriptionDistribution: [
    { name: 'Starter', value: 464, color: '#8884d8' },
    { name: 'Premium', value: 892, color: '#82ca9d' },
    { name: 'Pro', value: 567, color: '#ffc658' },
    { name: 'Trial', value: 234, color: '#ff7300' }
  ]
};

const mockRevenueAnalytics = {
  revenue: {
    total: 89420,
    monthly: 12340,
    growth: 23.5,
    mrr: 12340,
    arr: 148080,
    ltv: 2450,
    churn: 2.3
  },
  monthlyTrend: [
    { month: 'Jan', revenue: 8500 },
    { month: 'Feb', revenue: 9200 },
    { month: 'Mar', revenue: 9800 },
    { month: 'Apr', revenue: 10500 },
    { month: 'May', revenue: 11200 },
    { month: 'Jun', revenue: 11800 },
    { month: 'Jul', revenue: 12340 }
  ]
};

const mockPlatformStats = {
  totalUsers: 2847,
  activeUsers: 1923,
  totalRevenue: 89420,
  monthlyRevenue: 12340,
  systemUptime: 99.97,
  apiCalls: 1247893,
  aiAgentTasks: 45672,
  storageUsed: 78.3
};

const mockAdminAlerts = {
  alerts: [
    {
      id: 1,
      type: 'warning',
      message: 'High API usage detected',
      timestamp: new Date().toISOString(),
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      message: 'System maintenance scheduled',
      timestamp: new Date().toISOString(),
      severity: 'low'
    }
  ]
};

// Admin Dashboard Overview
router.get('/overview', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Simulate API delay
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockDashboardData,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 500);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview',
      error: error.message
    });
  }
});

// System Health
router.get('/system-health', (req, res) => {
  try {
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockSystemHealth,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 300);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health',
      error: error.message
    });
  }
});

// User Analytics
router.get('/user-analytics', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockUserAnalytics,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 400);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
      error: error.message
    });
  }
});

// Revenue Analytics
router.get('/revenue-analytics', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockRevenueAnalytics,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 350);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: error.message
    });
  }
});

// Platform Stats
router.get('/platform-stats', (req, res) => {
  try {
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockPlatformStats,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 250);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform stats',
      error: error.message
    });
  }
});

// Admin Alerts
router.get('/alerts', (req, res) => {
  try {
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockAdminAlerts,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 200);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin alerts',
      error: error.message
    });
  }
});

// User Management Analytics (for frontend compatibility)
router.get('/user-management/analytics', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockUserAnalytics,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 400);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
      error: error.message
    });
  }
});

// User Management Users (for frontend compatibility)
router.get('/user-management/users', (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', plan = '' } = req.query;
    
    // Mock user data
    const mockUsers = {
      users: [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          status: 'active',
          plan: 'premium',
          createdAt: '2024-01-15T10:30:00Z',
          lastLogin: '2024-01-20T14:22:00Z'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          status: 'active',
          plan: 'pro',
          createdAt: '2024-01-10T09:15:00Z',
          lastLogin: '2024-01-20T11:45:00Z'
        }
      ],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 2,
        pages: 1
      }
    };
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockUsers,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 300);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Advanced Analytics Overview
router.get('/advanced-analytics/overview', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const mockAdvancedAnalytics = {
      overview: {
        totalUsers: 2847,
        activeUsers: 1923,
        totalRevenue: 89420,
        monthlyRevenue: 12340,
        conversionRate: 12.5,
        churnRate: 2.3,
        avgSessionTime: '24m 32s',
        bounceRate: 35.2
      }
    };
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockAdvancedAnalytics,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 400);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advanced analytics overview',
      error: error.message
    });
  }
});

// Advanced Analytics Platform Performance
router.get('/advanced-analytics/platform-performance', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const mockPlatformPerformance = {
      performance: {
        uptime: 99.97,
        responseTime: 145,
        throughput: 1250,
        errorRate: 0.03,
        cpuUsage: 45.2,
        memoryUsage: 67.8,
        diskUsage: 78.3
      }
    };
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockPlatformPerformance,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 350);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform performance',
      error: error.message
    });
  }
});

// Advanced Analytics Revenue Analytics
router.get('/advanced-analytics/revenue-analytics', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockRevenueAnalytics,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 300);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: error.message
    });
  }
});

// Advanced Analytics Custom Reports
router.get('/advanced-analytics/custom-reports', (req, res) => {
  try {
    const mockCustomReports = {
      reports: [
        {
          id: 1,
          name: 'Monthly User Growth',
          type: 'line',
          data: mockUserAnalytics.growthTrend,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Revenue Trends',
          type: 'area',
          data: mockRevenueAnalytics.monthlyTrend,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
    };
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockCustomReports,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 250);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom reports',
      error: error.message
    });
  }
});

// Advanced Analytics Insights
router.get('/advanced-analytics/insights', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const mockInsights = {
      insights: [
        {
          id: 1,
          type: 'trend',
          title: 'User Growth Accelerating',
          description: 'User growth has increased by 23% this month',
          impact: 'high',
          confidence: 0.85
        },
        {
          id: 2,
          type: 'anomaly',
          title: 'Unusual API Usage Pattern',
          description: 'API calls spiked by 150% during off-peak hours',
          impact: 'medium',
          confidence: 0.72
        }
      ]
    };
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockInsights,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 400);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insights',
      error: error.message
    });
  }
});

// Revenue Dashboard Metrics
router.get('/revenue-dashboard/metrics', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const mockRevenueMetrics = {
      metrics: {
        totalRevenue: 89420,
        monthlyRevenue: 12340,
        growth: 23.5,
        mrr: 12340,
        arr: 148080,
        ltv: 2450,
        churn: 2.3,
        arpu: 31.4
      }
    };
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockRevenueMetrics,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 300);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue metrics',
      error: error.message
    });
  }
});

// Revenue Dashboard Analytics
router.get('/revenue-dashboard/analytics', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockRevenueAnalytics,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 350);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: error.message
    });
  }
});

// Revenue Dashboard Subscriptions
router.get('/revenue-dashboard/subscriptions', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const mockSubscriptions = {
      subscriptions: {
        total: 2847,
        active: 1923,
        trial: 234,
        premium: 892,
        pro: 567,
        starter: 464,
        churnRate: 2.3,
        growthRate: 12.5
      }
    };
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockSubscriptions,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 300);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription data',
      error: error.message
    });
  }
});

// Revenue Dashboard Cohorts
router.get('/revenue-dashboard/cohorts', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const mockCohorts = {
      cohorts: [
        {
          cohort: '2024-01',
          users: 150,
          retention: [100, 85, 72, 68, 65, 62, 60]
        },
        {
          cohort: '2024-02',
          users: 200,
          retention: [100, 88, 75, 70, 67, 64, 62]
        }
      ]
    };
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockCohorts,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 400);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cohort data',
      error: error.message
    });
  }
});

// Revenue Dashboard Forecasting
router.get('/revenue-dashboard/forecasting', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const mockForecasting = {
      forecasting: {
        nextMonth: 13500,
        nextQuarter: 42000,
        nextYear: 180000,
        confidence: 0.78,
        factors: ['user growth', 'pricing changes', 'market trends']
      }
    };
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          ...mockForecasting,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 500);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forecasting data',
      error: error.message
    });
  }
});

// ============================================================================
// MULTI-TENANT MANAGEMENT ENDPOINTS
// ============================================================================

// Multi-Tenant Instances
router.get('/multi-tenant/instances', (req, res) => {
  try {
    const { status, plan, search, page = 1, limit = 20 } = req.query;
    
    // Mock multi-tenant instances data
    const mockInstances = {
      tenants: [
        {
          id: 'tenant_1',
          name: 'TechStart Solutions',
          subdomain: 'techstart',
          custom_domain: 'social.techstart.com',
          plan: 'Enterprise',
          status: 'active',
          industry: 'Technology',
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          users: 456,
          storage_used: 125.6,
          cpu_usage: 45.2,
          memory_usage: 67.8,
          api_calls: 234567,
          bandwidth_used: 890,
          revenue: 4890,
          billing_cycle: 'monthly',
          payment_status: 'current',
          contact: {
            name: 'Sarah Johnson',
            email: 'admin@techstart.com',
            phone: '+1-555-0123'
          },
          features: {
            white_label: true,
            custom_domain: true,
            api_access: true,
            advanced_analytics: true,
            priority_support: true,
            sso: true,
            custom_integrations: true
          },
          health: {
            overall_score: 92,
            uptime: 99.9,
            response_time: 89,
            error_rate: 0.2
          }
        },
        {
          id: 'tenant_2',
          name: 'Digital Marketing Pro',
          subdomain: 'digitalmarketing',
          custom_domain: null,
          plan: 'Professional',
          status: 'active',
          industry: 'Marketing',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          last_activity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          users: 234,
          storage_used: 78.3,
          cpu_usage: 32.1,
          memory_usage: 54.2,
          api_calls: 156789,
          bandwidth_used: 567,
          revenue: 2490,
          billing_cycle: 'monthly',
          payment_status: 'current',
          contact: {
            name: 'Mike Chen',
            email: 'admin@digitalmarketing.com',
            phone: '+1-555-0456'
          },
          features: {
            white_label: false,
            custom_domain: false,
            api_access: true,
            advanced_analytics: false,
            priority_support: false,
            sso: false,
            custom_integrations: false
          },
          health: {
            overall_score: 85,
            uptime: 99.8,
            response_time: 134,
            error_rate: 0.5
          }
        },
        {
          id: 'tenant_3',
          name: 'E-commerce Plus',
          subdomain: 'ecommerceplus',
          custom_domain: 'social.ecommerceplus.com',
          plan: 'Starter',
          status: 'trial',
          industry: 'E-commerce',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_activity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          users: 45,
          storage_used: 12.8,
          cpu_usage: 15.3,
          memory_usage: 28.7,
          api_calls: 12345,
          bandwidth_used: 89,
          revenue: 0,
          billing_cycle: 'monthly',
          payment_status: 'trial',
          contact: {
            name: 'Lisa Rodriguez',
            email: 'admin@ecommerceplus.com',
            phone: '+1-555-0789'
          },
          features: {
            white_label: false,
            custom_domain: true,
            api_access: false,
            advanced_analytics: false,
            priority_support: false,
            sso: false,
            custom_integrations: false
          },
          health: {
            overall_score: 78,
            uptime: 99.5,
            response_time: 156,
            error_rate: 0.8
          }
        }
      ],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 3,
        totalPages: 1
      },
      filters: {
        status,
        plan,
        search
      }
    };
    
    setTimeout(() => {
      res.json({
        success: true,
        data: mockInstances
      });
    }, 200);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch multi-tenant instances',
      error: error.message
    });
  }
});

// Tenant Plans
router.get('/multi-tenant/plans', (req, res) => {
  try {
    const mockPlans = {
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          description: 'Perfect for small businesses getting started',
          price: 29,
          billing_cycle: 'monthly',
          features: [
            'Up to 100 users',
            'Basic analytics',
            'Email support',
            'Standard templates'
          ],
          limits: {
            users: 100,
            storage: 10, // GB
            api_calls: 10000,
            bandwidth: 50 // GB
          },
          is_popular: false
        },
        {
          id: 'professional',
          name: 'Professional',
          description: 'Ideal for growing businesses with advanced needs',
          price: 79,
          billing_cycle: 'monthly',
          features: [
            'Up to 500 users',
            'Advanced analytics',
            'Priority support',
            'Custom templates',
            'API access',
            'White-label options'
          ],
          limits: {
            users: 500,
            storage: 100, // GB
            api_calls: 100000,
            bandwidth: 500 // GB
          },
          is_popular: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          description: 'For large organizations with complex requirements',
          price: 199,
          billing_cycle: 'monthly',
          features: [
            'Unlimited users',
            'Advanced analytics',
            '24/7 priority support',
            'Custom integrations',
            'SSO integration',
            'Custom domain',
            'Dedicated account manager'
          ],
          limits: {
            users: -1, // unlimited
            storage: 1000, // GB
            api_calls: 1000000,
            bandwidth: 5000 // GB
          },
          is_popular: false
        }
      ]
    };
    
    setTimeout(() => {
      res.json({
        success: true,
        data: mockPlans
      });
    }, 200);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant plans',
      error: error.message
    });
  }
});

// Multi-Tenant Statistics
router.get('/multi-tenant/stats', (req, res) => {
  try {
    const mockStats = {
      overview: {
        total_tenants: 47,
        active_tenants: 42,
        trial_tenants: 8,
        suspended_tenants: 3,
        inactive_tenants: 2
      },
      financial: {
        total_revenue: 89340,
        avg_revenue_per_tenant: 1900,
        monthly_recurring_revenue: 75000,
        yearly_recurring_revenue: 14340,
        overdue_payments: 3
      },
      usage: {
        total_users: 12847,
        avg_users_per_tenant: 273,
        total_storage_used: 2400, // GB
        total_api_calls: 15678900,
        total_bandwidth_used: 8900, // GB
        avg_cpu_usage: 45.2,
        avg_memory_usage: 67.8
      },
      plan_distribution: {
        starter: 12,
        professional: 18,
        enterprise: 14,
        custom: 3
      },
      feature_adoption: {
        white_label: 17,
        custom_domain: 17,
        api_access: 35,
        advanced_analytics: 17,
        sso: 17,
        custom_integrations: 17
      },
      health: {
        avg_uptime: 99.9,
        avg_response_time: 125,
        avg_error_rate: 0.8,
        tenants_with_incidents: 2
      },
      growth: {
        new_tenants_this_month: 5,
        churned_tenants_this_month: 1,
        trial_to_paid_conversion: 78.5,
        avg_time_to_value: 4.2
      }
    };
    
    setTimeout(() => {
      res.json({
        success: true,
        data: mockStats
      });
    }, 200);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch multi-tenant statistics',
      error: error.message
    });
  }
});

// Multi-Tenant Resource Usage
router.get('/multi-tenant/resource-usage', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const mockResourceUsage = {
      overview: {
        total_cpu_usage: 45.2,
        total_memory_usage: 67.8,
        total_storage_used: 2400,
        total_bandwidth_used: 8900,
        total_api_calls: 15678900
      },
      trends: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          total_cpu: Math.random() * 80 + 10,
          total_memory: Math.random() * 85 + 10,
          total_storage: Math.random() * 1000 + 500,
          total_bandwidth: Math.random() * 500 + 100,
          active_tenants: Math.floor(Math.random() * 10) + 40,
          api_calls: Math.floor(Math.random() * 1000000) + 500000
        };
      }),
      top_consumers: {
        by_cpu: [
          { tenant_id: 'tenant_1', tenant_name: 'TechStart Solutions', usage: 95.2 },
          { tenant_id: 'tenant_2', tenant_name: 'Digital Marketing Pro', usage: 78.5 }
        ],
        by_memory: [
          { tenant_id: 'tenant_1', tenant_name: 'TechStart Solutions', usage: 89.3 },
          { tenant_id: 'tenant_2', tenant_name: 'Digital Marketing Pro', usage: 67.8 }
        ],
        by_storage: [
          { tenant_id: 'tenant_1', tenant_name: 'TechStart Solutions', usage: 125.6 },
          { tenant_id: 'tenant_2', tenant_name: 'Digital Marketing Pro', usage: 78.3 }
        ],
        by_api_calls: [
          { tenant_id: 'tenant_1', tenant_name: 'TechStart Solutions', usage: 234567 },
          { tenant_id: 'tenant_2', tenant_name: 'Digital Marketing Pro', usage: 156789 }
        ]
      },
      alerts: [
        {
          type: 'high_cpu',
          message: 'Tenant techstart is using 95% CPU',
          severity: 'critical',
          tenant_id: 'tenant_1',
          timestamp: new Date().toISOString()
        },
        {
          type: 'high_memory',
          message: 'Tenant digitalmarketing is using 89% memory',
          severity: 'warning',
          tenant_id: 'tenant_2',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
    
    setTimeout(() => {
      res.json({
        success: true,
        data: mockResourceUsage
      });
    }, 200);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource usage data',
      error: error.message
    });
  }
});

module.exports = router;
