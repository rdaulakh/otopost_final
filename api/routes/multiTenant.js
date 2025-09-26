const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for multi-tenant endpoints
const multiTenantRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per 5 minutes
  message: 'Too many multi-tenant requests from this IP'
});

router.use(multiTenantRateLimit);
router.use(auth);
router.use(adminAuth);

// Generate mock tenant data
const generateMockTenants = () => {
  const plans = ['Starter', 'Professional', 'Enterprise', 'Custom'];
  const statuses = ['active', 'trial', 'suspended', 'inactive'];
  const industries = ['Technology', 'Marketing', 'E-commerce', 'Healthcare', 'Finance', 'Education'];
  
  const tenants = [];
  for (let i = 1; i <= 50; i++) {
    const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const lastActivity = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    tenants.push({
      id: `tenant_${i}`,
      name: `Tenant ${i} Corp`,
      subdomain: `tenant${i}`,
      custom_domain: Math.random() > 0.6 ? `social.tenant${i}.com` : null,
      plan: plan,
      status: status,
      industry: industries[Math.floor(Math.random() * industries.length)],
      created_at: createdAt.toISOString(),
      last_activity: lastActivity.toISOString(),
      
      // Usage metrics
      users: Math.floor(Math.random() * 1000) + 50,
      storage_used: Math.floor(Math.random() * 500) + 10, // GB
      cpu_usage: Math.random() * 80 + 10,
      memory_usage: Math.random() * 90 + 10,
      api_calls: Math.floor(Math.random() * 1000000) + 10000,
      bandwidth_used: Math.floor(Math.random() * 1000) + 100, // GB
      
      // Financial metrics
      revenue: Math.floor(Math.random() * 5000) + 100,
      billing_cycle: ['monthly', 'yearly'][Math.floor(Math.random() * 2)],
      next_billing: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      payment_method: ['Credit Card', 'Bank Transfer', 'PayPal'][Math.floor(Math.random() * 3)],
      payment_status: Math.random() > 0.1 ? 'current' : 'overdue',
      
      // Features and configuration
      features: {
        white_label: plan === 'Enterprise' || plan === 'Custom',
        custom_domain: plan === 'Enterprise' || plan === 'Custom',
        api_access: plan !== 'Starter',
        advanced_analytics: plan === 'Enterprise' || plan === 'Custom',
        priority_support: plan === 'Enterprise' || plan === 'Custom',
        sso: plan === 'Enterprise' || plan === 'Custom',
        custom_integrations: plan === 'Enterprise' || plan === 'Custom',
        bulk_operations: plan !== 'Starter',
        team_collaboration: plan !== 'Starter',
        webhook_support: plan !== 'Starter'
      },
      
      // Branding configuration
      branding: {
        logo_url: `/api/placeholder/120/40`,
        primary_color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        secondary_color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        accent_color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        font_family: ['Inter', 'Roboto', 'Open Sans', 'Lato'][Math.floor(Math.random() * 4)],
        custom_css: plan === 'Enterprise' || plan === 'Custom',
        favicon_url: `/api/placeholder/32/32`,
        company_name: `Tenant ${i} Corp`,
        tagline: `Powering social media for Tenant ${i}`
      },
      
      // Contact information
      contact: {
        name: `Admin User ${i}`,
        email: `admin@tenant${i}.com`,
        phone: '+1-555-0123',
        timezone: 'America/New_York',
        language: 'en'
      },
      
      // Resource limits
      limits: {
        users: plan === 'Starter' ? 10 : plan === 'Professional' ? 100 : plan === 'Enterprise' ? 1000 : 10000,
        storage: plan === 'Starter' ? 10 : plan === 'Professional' ? 100 : plan === 'Enterprise' ? 1000 : 10000, // GB
        api_calls_per_month: plan === 'Starter' ? 10000 : plan === 'Professional' ? 100000 : plan === 'Enterprise' ? 1000000 : 10000000,
        bandwidth_per_month: plan === 'Starter' ? 100 : plan === 'Professional' ? 1000 : plan === 'Enterprise' ? 10000 : 100000, // GB
        campaigns: plan === 'Starter' ? 5 : plan === 'Professional' ? 50 : plan === 'Enterprise' ? 500 : 5000,
        integrations: plan === 'Starter' ? 3 : plan === 'Professional' ? 10 : plan === 'Enterprise' ? 50 : 100
      },
      
      // Security settings
      security: {
        two_factor_required: plan === 'Enterprise' || plan === 'Custom',
        ip_whitelist_enabled: false,
        ip_whitelist: [],
        session_timeout: 3600,
        password_policy: {
          min_length: 8,
          require_uppercase: true,
          require_lowercase: true,
          require_numbers: true,
          require_symbols: plan === 'Enterprise' || plan === 'Custom'
        },
        audit_logging: plan !== 'Starter',
        data_retention_days: plan === 'Starter' ? 30 : plan === 'Professional' ? 90 : 365
      },
      
      // Integration settings
      integrations: {
        enabled_platforms: ['instagram', 'facebook', 'linkedin', 'twitter'].filter(() => Math.random() > 0.3),
        webhook_endpoints: [],
        api_keys: {
          public_key: `pk_${i}_${Math.random().toString(36).substr(2, 9)}`,
          secret_key: `sk_${i}_${Math.random().toString(36).substr(2, 9)}`
        },
        rate_limits: {
          requests_per_minute: plan === 'Starter' ? 60 : plan === 'Professional' ? 300 : plan === 'Enterprise' ? 1000 : 5000,
          burst_limit: plan === 'Starter' ? 10 : plan === 'Professional' ? 50 : plan === 'Enterprise' ? 200 : 1000
        }
      },
      
      // Database and infrastructure
      infrastructure: {
        database_size: Math.floor(Math.random() * 10) + 1, // GB
        backup_frequency: plan === 'Starter' ? 'weekly' : plan === 'Professional' ? 'daily' : 'hourly',
        backup_retention: plan === 'Starter' ? 7 : plan === 'Professional' ? 30 : 90, // days
        cdn_enabled: plan !== 'Starter',
        load_balancer: plan === 'Enterprise' || plan === 'Custom',
        auto_scaling: plan === 'Enterprise' || plan === 'Custom',
        dedicated_resources: plan === 'Custom'
      },
      
      // Compliance and governance
      compliance: {
        gdpr_compliant: true,
        ccpa_compliant: true,
        soc2_compliant: plan === 'Enterprise' || plan === 'Custom',
        hipaa_compliant: plan === 'Custom',
        data_residency: 'US',
        encryption_at_rest: true,
        encryption_in_transit: true
      },
      
      // Recent activities
      recent_activities: [
        {
          type: 'user_login',
          description: 'User logged in',
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          user: `user@tenant${i}.com`
        },
        {
          type: 'api_call',
          description: 'API endpoint accessed',
          timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString(),
          endpoint: '/api/posts'
        }
      ],
      
      // Health metrics
      health: {
        overall_score: Math.floor(Math.random() * 30) + 70,
        uptime: 99.9,
        response_time: Math.floor(Math.random() * 200) + 50, // ms
        error_rate: Math.random() * 2, // %
        last_incident: Math.random() > 0.8 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
      }
    });
  }
  
  return tenants;
};

// @route   GET /api/multi-tenant/stats
// @desc    Get multi-tenant statistics and metrics
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    const tenants = generateMockTenants();
    
    const stats = {
      overview: {
        total_tenants: tenants.length,
        active_tenants: tenants.filter(t => t.status === 'active').length,
        trial_tenants: tenants.filter(t => t.status === 'trial').length,
        suspended_tenants: tenants.filter(t => t.status === 'suspended').length,
        inactive_tenants: tenants.filter(t => t.status === 'inactive').length
      },
      
      // Financial metrics
      financial: {
        total_revenue: tenants.reduce((sum, t) => sum + t.revenue, 0),
        avg_revenue_per_tenant: tenants.reduce((sum, t) => sum + t.revenue, 0) / tenants.length,
        monthly_recurring_revenue: tenants
          .filter(t => t.billing_cycle === 'monthly')
          .reduce((sum, t) => sum + t.revenue, 0),
        yearly_recurring_revenue: tenants
          .filter(t => t.billing_cycle === 'yearly')
          .reduce((sum, t) => sum + t.revenue, 0) / 12,
        overdue_payments: tenants.filter(t => t.payment_status === 'overdue').length
      },
      
      // Usage metrics
      usage: {
        total_users: tenants.reduce((sum, t) => sum + t.users, 0),
        avg_users_per_tenant: tenants.reduce((sum, t) => sum + t.users, 0) / tenants.length,
        total_storage_used: tenants.reduce((sum, t) => sum + t.storage_used, 0), // GB
        total_api_calls: tenants.reduce((sum, t) => sum + t.api_calls, 0),
        total_bandwidth_used: tenants.reduce((sum, t) => sum + t.bandwidth_used, 0), // GB
        avg_cpu_usage: tenants.reduce((sum, t) => sum + t.cpu_usage, 0) / tenants.length,
        avg_memory_usage: tenants.reduce((sum, t) => sum + t.memory_usage, 0) / tenants.length
      },
      
      // Plan distribution
      plan_distribution: {
        starter: tenants.filter(t => t.plan === 'Starter').length,
        professional: tenants.filter(t => t.plan === 'Professional').length,
        enterprise: tenants.filter(t => t.plan === 'Enterprise').length,
        custom: tenants.filter(t => t.plan === 'Custom').length
      },
      
      // Feature adoption
      feature_adoption: {
        white_label: tenants.filter(t => t.features.white_label).length,
        custom_domain: tenants.filter(t => t.features.custom_domain).length,
        api_access: tenants.filter(t => t.features.api_access).length,
        advanced_analytics: tenants.filter(t => t.features.advanced_analytics).length,
        sso: tenants.filter(t => t.features.sso).length,
        custom_integrations: tenants.filter(t => t.features.custom_integrations).length
      },
      
      // Health metrics
      health: {
        avg_uptime: tenants.reduce((sum, t) => sum + t.health.uptime, 0) / tenants.length,
        avg_response_time: tenants.reduce((sum, t) => sum + t.health.response_time, 0) / tenants.length,
        avg_error_rate: tenants.reduce((sum, t) => sum + t.health.error_rate, 0) / tenants.length,
        tenants_with_incidents: tenants.filter(t => t.health.last_incident).length
      },
      
      // Growth metrics
      growth: {
        new_tenants_this_month: tenants.filter(t => {
          const createdAt = new Date(t.created_at);
          const thisMonth = new Date();
          thisMonth.setDate(1);
          return createdAt >= thisMonth;
        }).length,
        churned_tenants_this_month: tenants.filter(t => t.status === 'inactive').length,
        trial_to_paid_conversion: 78.5,
        avg_time_to_value: 4.2 // days
      },
      
      last_updated: new Date()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Multi-tenant stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch multi-tenant statistics',
      error: error.message
    });
  }
});

// @route   GET /api/multi-tenant/tenants
// @desc    Get tenant list with filtering and pagination
// @access  Admin
router.get('/tenants', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      plan = 'all',
      industry = 'all',
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc',
      has_custom_domain = 'all',
      payment_status = 'all'
    } = req.query;

    let tenants = generateMockTenants();

    // Apply filters
    if (status !== 'all') {
      tenants = tenants.filter(t => t.status === status);
    }
    
    if (plan !== 'all') {
      tenants = tenants.filter(t => t.plan === plan);
    }
    
    if (industry !== 'all') {
      tenants = tenants.filter(t => t.industry === industry);
    }
    
    if (has_custom_domain !== 'all') {
      if (has_custom_domain === 'true') {
        tenants = tenants.filter(t => t.custom_domain !== null);
      } else {
        tenants = tenants.filter(t => t.custom_domain === null);
      }
    }
    
    if (payment_status !== 'all') {
      tenants = tenants.filter(t => t.payment_status === payment_status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      tenants = tenants.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.subdomain.toLowerCase().includes(searchLower) ||
        t.contact.email.toLowerCase().includes(searchLower)
      );
    }

    // Sort tenants
    tenants.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'last_activity' || sortBy === 'next_billing') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
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
    const paginatedTenants = tenants.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        tenants: paginatedTenants,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(tenants.length / limit),
          total: tenants.length,
          limit: parseInt(limit)
        },
        filters: {
          status,
          plan,
          industry,
          search,
          sortBy,
          sortOrder,
          has_custom_domain,
          payment_status
        }
      }
    });

  } catch (error) {
    console.error('Tenant list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant list',
      error: error.message
    });
  }
});

// @route   GET /api/multi-tenant/tenants/:id
// @desc    Get specific tenant details
// @access  Admin
router.get('/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenants = generateMockTenants();
    const tenant = tenants.find(t => t.id === id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Add additional details for single tenant view
    tenant.detailed_usage_history = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      users: Math.max(0, tenant.users + (Math.random() - 0.5) * 100),
      api_calls: Math.max(0, tenant.api_calls / 30 + (Math.random() - 0.5) * 10000),
      storage_used: Math.max(0, tenant.storage_used + (Math.random() - 0.5) * 20),
      cpu_usage: Math.max(0, Math.min(100, tenant.cpu_usage + (Math.random() - 0.5) * 30)),
      memory_usage: Math.max(0, Math.min(100, tenant.memory_usage + (Math.random() - 0.5) * 30))
    })).reverse();

    tenant.billing_history = [
      {
        id: 'invoice_1',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: tenant.revenue,
        status: 'paid',
        description: `${tenant.plan} plan - Monthly billing`
      },
      {
        id: 'invoice_2',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        amount: tenant.revenue,
        status: 'paid',
        description: `${tenant.plan} plan - Monthly billing`
      }
    ];

    tenant.support_tickets = [
      {
        id: 'ticket_1',
        subject: 'API rate limit issue',
        status: 'resolved',
        priority: 'medium',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        resolved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: tenant
    });

  } catch (error) {
    console.error('Tenant details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant details',
      error: error.message
    });
  }
});

// @route   POST /api/multi-tenant/tenants
// @desc    Create new tenant
// @access  Admin
router.post('/tenants', async (req, res) => {
  try {
    const {
      name,
      subdomain,
      plan,
      contact_email,
      contact_name,
      industry = 'Technology'
    } = req.body;

    // Validation
    if (!name || !subdomain || !plan || !contact_email || !contact_name) {
      return res.status(400).json({
        success: false,
        message: 'Name, subdomain, plan, contact email, and contact name are required'
      });
    }

    const newTenant = {
      id: `tenant_${Date.now()}`,
      name,
      subdomain,
      custom_domain: null,
      plan,
      status: 'trial',
      industry,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      users: 1,
      storage_used: 0,
      cpu_usage: 0,
      memory_usage: 0,
      api_calls: 0,
      bandwidth_used: 0,
      revenue: 0,
      contact: {
        name: contact_name,
        email: contact_email,
        phone: '',
        timezone: 'America/New_York',
        language: 'en'
      },
      created_by: req.user.email
    };

    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      data: newTenant
    });

  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tenant',
      error: error.message
    });
  }
});

// @route   PUT /api/multi-tenant/tenants/:id
// @desc    Update tenant configuration
// @access  Admin
router.put('/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: {
        id,
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: req.user.email
      }
    });

  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant',
      error: error.message
    });
  }
});

// @route   PUT /api/multi-tenant/tenants/:id/status
// @desc    Update tenant status (activate, suspend, etc.)
// @access  Admin
router.put('/tenants/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason = 'Status updated by admin' } = req.body;

    if (!['active', 'trial', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    res.json({
      success: true,
      message: `Tenant status updated to ${status}`,
      data: {
        id,
        status,
        status_changed_at: new Date().toISOString(),
        status_changed_by: req.user.email,
        reason
      }
    });

  } catch (error) {
    console.error('Update tenant status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant status',
      error: error.message
    });
  }
});

// @route   DELETE /api/multi-tenant/tenants/:id
// @desc    Delete tenant (with data cleanup)
// @access  Admin
router.delete('/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { confirm_deletion = false, backup_data = true } = req.body;

    if (!confirm_deletion) {
      return res.status(400).json({
        success: false,
        message: 'Deletion confirmation required'
      });
    }

    res.json({
      success: true,
      message: 'Tenant deletion initiated',
      data: {
        id,
        deletion_initiated_at: new Date().toISOString(),
        deletion_initiated_by: req.user.email,
        backup_data,
        estimated_completion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tenant',
      error: error.message
    });
  }
});

// @route   GET /api/multi-tenant/resource-usage
// @desc    Get resource usage analytics across all tenants
// @access  Admin
router.get('/resource-usage', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const tenants = generateMockTenants();
    
    // Generate resource usage trends
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const usage_trends = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        total_cpu: Math.random() * 80 + 10,
        total_memory: Math.random() * 85 + 10,
        total_storage: Math.random() * 1000 + 500,
        total_bandwidth: Math.random() * 500 + 100,
        active_tenants: Math.floor(Math.random() * 10) + 40,
        api_calls: Math.floor(Math.random() * 1000000) + 500000
      };
    });

    const resource_usage = {
      overview: {
        total_cpu_usage: tenants.reduce((sum, t) => sum + t.cpu_usage, 0) / tenants.length,
        total_memory_usage: tenants.reduce((sum, t) => sum + t.memory_usage, 0) / tenants.length,
        total_storage_used: tenants.reduce((sum, t) => sum + t.storage_used, 0),
        total_bandwidth_used: tenants.reduce((sum, t) => sum + t.bandwidth_used, 0),
        total_api_calls: tenants.reduce((sum, t) => sum + t.api_calls, 0)
      },
      
      trends: usage_trends,
      
      top_consumers: {
        by_cpu: tenants.sort((a, b) => b.cpu_usage - a.cpu_usage).slice(0, 10),
        by_memory: tenants.sort((a, b) => b.memory_usage - a.memory_usage).slice(0, 10),
        by_storage: tenants.sort((a, b) => b.storage_used - a.storage_used).slice(0, 10),
        by_api_calls: tenants.sort((a, b) => b.api_calls - a.api_calls).slice(0, 10)
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
          type: 'storage_limit',
          message: 'Tenant digitalmarketing approaching storage limit',
          severity: 'warning',
          tenant_id: 'tenant_2',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ],
      
      time_range: timeRange,
      last_updated: new Date()
    };

    res.json({
      success: true,
      data: resource_usage
    });

  } catch (error) {
    console.error('Resource usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource usage',
      error: error.message
    });
  }
});

module.exports = router;
