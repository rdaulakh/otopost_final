const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Rate limiting for customer success endpoints
const customerSuccessRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // limit each IP to 200 requests per 5 minutes
  message: 'Too many customer success requests from this IP'
});

router.use(customerSuccessRateLimit);
router.use(auth);
router.use(adminAuth);

// Generate mock customer success data
const generateMockCustomers = async () => {
  try {
    const users = await User.find().limit(100);
    const segments = ['Champions', 'Advocates', 'Satisfied', 'At Risk', 'Critical'];
    const industries = ['Technology', 'Marketing', 'E-commerce', 'Healthcare', 'Finance', 'Education', 'Media'];
    const plans = ['Starter', 'Professional', 'Enterprise', 'Custom'];
    const journeyStages = ['Trial Started', 'Onboarding', 'First Value', 'Active User', 'Power User'];
    
    const customers = [];
    for (let i = 1; i <= 200; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const lastActive = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const healthScore = Math.floor(Math.random() * 100);
      const segment = segments[Math.floor(Math.random() * segments.length)];
      
      customers.push({
        id: `customer_${i}`,
        name: user?.name || `Customer ${i}`,
        email: user?.email || `customer${i}@example.com`,
        company: `Company ${i}`,
        industry: industries[Math.floor(Math.random() * industries.length)],
        plan: plans[Math.floor(Math.random() * plans.length)],
        health_score: healthScore,
        segment: segment,
        journey_stage: journeyStages[Math.floor(Math.random() * journeyStages.length)],
        churn_risk: healthScore > 80 ? 'low' : healthScore > 60 ? 'medium' : healthScore > 40 ? 'high' : 'critical',
        created_at: createdAt.toISOString(),
        last_active: lastActive.toISOString(),
        onboarding_completed: Math.random() > 0.2,
        first_value_achieved: Math.random() > 0.3,
        
        // Engagement metrics
        engagement: {
          login_frequency: Math.floor(Math.random() * 30) + 1,
          feature_adoption: Math.floor(Math.random() * 100),
          support_tickets: Math.floor(Math.random() * 10),
          nps_score: Math.floor(Math.random() * 11) - 5, // -5 to 5
          csat_score: Math.floor(Math.random() * 5) + 1, // 1 to 5
          last_survey: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
        },
        
        // Usage metrics
        usage: {
          posts_created: Math.floor(Math.random() * 500),
          campaigns_run: Math.floor(Math.random() * 50),
          api_calls: Math.floor(Math.random() * 10000),
          storage_used: Math.floor(Math.random() * 1000), // MB
          team_members: Math.floor(Math.random() * 20) + 1,
          integrations_connected: Math.floor(Math.random() * 10)
        },
        
        // Financial metrics
        financial: {
          mrr: Math.floor(Math.random() * 1000) + 50,
          ltv: Math.floor(Math.random() * 10000) + 500,
          expansion_revenue: Math.floor(Math.random() * 500),
          payment_status: Math.random() > 0.1 ? 'current' : 'overdue',
          contract_end_date: new Date(createdAt.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        
        // Success metrics
        success_metrics: {
          time_to_value: Math.floor(Math.random() * 30) + 1, // days
          onboarding_score: Math.floor(Math.random() * 100),
          product_stickiness: Math.floor(Math.random() * 100),
          expansion_likelihood: Math.floor(Math.random() * 100),
          renewal_probability: Math.floor(Math.random() * 100)
        },
        
        // Contact information
        contact: {
          primary_contact: user?.name || `Contact ${i}`,
          phone: '+1-555-0123',
          timezone: 'America/New_York',
          preferred_communication: ['email', 'phone', 'slack'][Math.floor(Math.random() * 3)]
        },
        
        // Recent activities
        recent_activities: [
          {
            type: 'login',
            description: 'Logged into platform',
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'feature_usage',
            description: 'Used AI content generation',
            timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        
        // Tags and notes
        tags: ['high-value', 'enterprise', 'power-user'].filter(() => Math.random() > 0.7),
        notes: `Customer notes for ${user?.name || `Customer ${i}`}`,
        assigned_csm: 'csm@platform.com',
        
        // Risk factors
        risk_factors: [
          'Low engagement',
          'Support tickets',
          'Payment issues',
          'Contract expiring'
        ].filter(() => Math.random() > 0.8)
      });
    }
    
    return customers;
  } catch (error) {
    console.error('Error generating mock customers:', error);
    return [];
  }
};

// @route   GET /api/customer-success/metrics
// @desc    Get customer success metrics and KPIs
// @access  Admin
router.get('/metrics', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const customers = await generateMockCustomers();
    
    // Calculate comprehensive metrics
    const metrics = {
      overview: {
        total_customers: customers.length,
        active_customers: customers.filter(c => {
          const lastActive = new Date(c.last_active);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return lastActive > thirtyDaysAgo;
        }).length,
        churn_rate: 2.3,
        avg_health_score: customers.reduce((sum, c) => sum + c.health_score, 0) / customers.length,
        nps: 67,
        csat: customers.reduce((sum, c) => sum + c.engagement.csat_score, 0) / customers.length,
        onboarding_completion: (customers.filter(c => c.onboarding_completed).length / customers.length) * 100,
        time_to_value: customers.reduce((sum, c) => sum + c.success_metrics.time_to_value, 0) / customers.length,
        expansion_revenue: customers.reduce((sum, c) => sum + c.financial.expansion_revenue, 0),
        retention_rate: 94.7
      },
      
      // Segment distribution
      segments: {
        champions: {
          count: customers.filter(c => c.segment === 'Champions').length,
          percentage: (customers.filter(c => c.segment === 'Champions').length / customers.length) * 100,
          avg_health_score: customers.filter(c => c.segment === 'Champions')
            .reduce((sum, c) => sum + c.health_score, 0) / customers.filter(c => c.segment === 'Champions').length || 0,
          churn_risk: 'low'
        },
        advocates: {
          count: customers.filter(c => c.segment === 'Advocates').length,
          percentage: (customers.filter(c => c.segment === 'Advocates').length / customers.length) * 100,
          avg_health_score: customers.filter(c => c.segment === 'Advocates')
            .reduce((sum, c) => sum + c.health_score, 0) / customers.filter(c => c.segment === 'Advocates').length || 0,
          churn_risk: 'low'
        },
        satisfied: {
          count: customers.filter(c => c.segment === 'Satisfied').length,
          percentage: (customers.filter(c => c.segment === 'Satisfied').length / customers.length) * 100,
          avg_health_score: customers.filter(c => c.segment === 'Satisfied')
            .reduce((sum, c) => sum + c.health_score, 0) / customers.filter(c => c.segment === 'Satisfied').length || 0,
          churn_risk: 'medium'
        },
        at_risk: {
          count: customers.filter(c => c.segment === 'At Risk').length,
          percentage: (customers.filter(c => c.segment === 'At Risk').length / customers.length) * 100,
          avg_health_score: customers.filter(c => c.segment === 'At Risk')
            .reduce((sum, c) => sum + c.health_score, 0) / customers.filter(c => c.segment === 'At Risk').length || 0,
          churn_risk: 'high'
        },
        critical: {
          count: customers.filter(c => c.segment === 'Critical').length,
          percentage: (customers.filter(c => c.segment === 'Critical').length / customers.length) * 100,
          avg_health_score: customers.filter(c => c.segment === 'Critical')
            .reduce((sum, c) => sum + c.health_score, 0) / customers.filter(c => c.segment === 'Critical').length || 0,
          churn_risk: 'critical'
        }
      },
      
      // Journey stage metrics
      journey_stages: {
        trial_started: {
          customers: customers.filter(c => c.journey_stage === 'Trial Started').length,
          conversion_rate: 78.5,
          avg_duration: 7,
          dropoff_rate: 21.5
        },
        onboarding: {
          customers: customers.filter(c => c.journey_stage === 'Onboarding').length,
          conversion_rate: 89.3,
          avg_duration: 3,
          dropoff_rate: 10.7
        },
        first_value: {
          customers: customers.filter(c => c.journey_stage === 'First Value').length,
          conversion_rate: 92.1,
          avg_duration: 4.2,
          dropoff_rate: 7.9
        },
        active_user: {
          customers: customers.filter(c => c.journey_stage === 'Active User').length,
          conversion_rate: 95.3,
          avg_duration: 30,
          dropoff_rate: 4.7
        },
        power_user: {
          customers: customers.filter(c => c.journey_stage === 'Power User').length,
          conversion_rate: 98.1,
          avg_duration: 90,
          dropoff_rate: 1.9
        }
      },
      
      // Financial metrics
      financial: {
        total_mrr: customers.reduce((sum, c) => sum + c.financial.mrr, 0),
        avg_ltv: customers.reduce((sum, c) => sum + c.financial.ltv, 0) / customers.length,
        total_expansion_revenue: customers.reduce((sum, c) => sum + c.financial.expansion_revenue, 0),
        payment_health: {
          current: customers.filter(c => c.financial.payment_status === 'current').length,
          overdue: customers.filter(c => c.financial.payment_status === 'overdue').length
        }
      },
      
      // Engagement metrics
      engagement: {
        avg_login_frequency: customers.reduce((sum, c) => sum + c.engagement.login_frequency, 0) / customers.length,
        avg_feature_adoption: customers.reduce((sum, c) => sum + c.engagement.feature_adoption, 0) / customers.length,
        total_support_tickets: customers.reduce((sum, c) => sum + c.engagement.support_tickets, 0),
        avg_nps: customers.reduce((sum, c) => sum + c.engagement.nps_score, 0) / customers.length,
        avg_csat: customers.reduce((sum, c) => sum + c.engagement.csat_score, 0) / customers.length
      },
      
      time_range: timeRange,
      last_updated: new Date()
    };

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Customer success metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer success metrics',
      error: error.message
    });
  }
});

// @route   GET /api/customer-success/customers
// @desc    Get customer list with filtering and pagination
// @access  Admin
router.get('/customers', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      segment = 'all',
      health_score = 'all',
      churn_risk = 'all',
      journey_stage = 'all',
      plan = 'all',
      industry = 'all',
      search = '',
      sortBy = 'health_score',
      sortOrder = 'desc'
    } = req.query;

    let customers = await generateMockCustomers();

    // Apply filters
    if (segment !== 'all') {
      customers = customers.filter(c => c.segment === segment);
    }
    
    if (health_score !== 'all') {
      const [min, max] = health_score.split('-').map(Number);
      customers = customers.filter(c => c.health_score >= min && c.health_score <= max);
    }
    
    if (churn_risk !== 'all') {
      customers = customers.filter(c => c.churn_risk === churn_risk);
    }
    
    if (journey_stage !== 'all') {
      customers = customers.filter(c => c.journey_stage === journey_stage);
    }
    
    if (plan !== 'all') {
      customers = customers.filter(c => c.plan === plan);
    }
    
    if (industry !== 'all') {
      customers = customers.filter(c => c.industry === industry);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.company.toLowerCase().includes(searchLower)
      );
    }

    // Sort customers
    customers.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'last_active') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortBy === 'mrr') {
        aValue = a.financial.mrr;
        bValue = b.financial.mrr;
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
    const paginatedCustomers = customers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        customers: paginatedCustomers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(customers.length / limit),
          total: customers.length,
          limit: parseInt(limit)
        },
        filters: {
          segment,
          health_score,
          churn_risk,
          journey_stage,
          plan,
          industry,
          search,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Customer list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer list',
      error: error.message
    });
  }
});

// @route   GET /api/customer-success/customers/:id
// @desc    Get specific customer details
// @access  Admin
router.get('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customers = await generateMockCustomers();
    const customer = customers.find(c => c.id === id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Add additional details for single customer view
    customer.detailed_activities = [
      {
        type: 'login',
        description: 'Logged into platform',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: { ip: '192.168.1.100', device: 'Desktop' }
      },
      {
        type: 'feature_usage',
        description: 'Used AI content generation',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        metadata: { feature: 'ai_content', usage_count: 5 }
      },
      {
        type: 'support_ticket',
        description: 'Created support ticket #1234',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        metadata: { ticket_id: '1234', priority: 'medium' }
      }
    ];

    customer.health_score_history = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      score: Math.max(0, Math.min(100, customer.health_score + (Math.random() - 0.5) * 20))
    })).reverse();

    customer.recommendations = [
      {
        type: 'engagement',
        priority: 'high',
        title: 'Increase feature adoption',
        description: 'Customer has low feature adoption. Consider onboarding call.',
        action: 'Schedule call'
      },
      {
        type: 'expansion',
        priority: 'medium',
        title: 'Upsell opportunity',
        description: 'Customer is approaching usage limits. Good upsell candidate.',
        action: 'Send upgrade email'
      }
    ];

    res.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Customer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer details',
      error: error.message
    });
  }
});

// @route   PUT /api/customer-success/customers/:id/health-score
// @desc    Update customer health score
// @access  Admin
router.put('/customers/:id/health-score', async (req, res) => {
  try {
    const { id } = req.params;
    const { health_score, reason = 'Manual update by admin' } = req.body;

    if (health_score < 0 || health_score > 100) {
      return res.status(400).json({
        success: false,
        message: 'Health score must be between 0 and 100'
      });
    }

    res.json({
      success: true,
      message: 'Customer health score updated successfully',
      data: {
        id,
        health_score,
        updated_at: new Date().toISOString(),
        updated_by: req.user.email,
        reason
      }
    });

  } catch (error) {
    console.error('Update health score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update health score',
      error: error.message
    });
  }
});

// @route   POST /api/customer-success/customers/:id/outreach
// @desc    Create customer outreach activity
// @access  Admin
router.post('/customers/:id/outreach', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, subject, message, channel = 'email' } = req.body;

    if (!type || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Type, subject, and message are required'
      });
    }

    const outreach = {
      id: `outreach_${Date.now()}`,
      customer_id: id,
      type,
      subject,
      message,
      channel,
      status: 'sent',
      created_at: new Date().toISOString(),
      created_by: req.user.email
    };

    res.status(201).json({
      success: true,
      message: 'Customer outreach created successfully',
      data: outreach
    });

  } catch (error) {
    console.error('Create outreach error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer outreach',
      error: error.message
    });
  }
});

// @route   GET /api/customer-success/analytics/trends
// @desc    Get customer success trends and analytics
// @access  Admin
router.get('/analytics/trends', async (req, res) => {
  try {
    const { timeRange = '30d', metric = 'health_score' } = req.query;
    
    // Generate trend data
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const trends = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        health_score: Math.floor(Math.random() * 20) + 70,
        churn_rate: Math.random() * 5 + 1,
        nps: Math.floor(Math.random() * 20) + 60,
        csat: Math.random() * 1 + 4,
        active_customers: Math.floor(Math.random() * 100) + 2000,
        new_customers: Math.floor(Math.random() * 20) + 5,
        churned_customers: Math.floor(Math.random() * 10) + 1
      };
    });

    res.json({
      success: true,
      data: {
        trends,
        time_range: timeRange,
        metric,
        summary: {
          avg_health_score: trends.reduce((sum, t) => sum + t.health_score, 0) / trends.length,
          avg_churn_rate: trends.reduce((sum, t) => sum + t.churn_rate, 0) / trends.length,
          avg_nps: trends.reduce((sum, t) => sum + t.nps, 0) / trends.length,
          avg_csat: trends.reduce((sum, t) => sum + t.csat, 0) / trends.length,
          total_new_customers: trends.reduce((sum, t) => sum + t.new_customers, 0),
          total_churned_customers: trends.reduce((sum, t) => sum + t.churned_customers, 0)
        }
      }
    });

  } catch (error) {
    console.error('Customer success trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer success trends',
      error: error.message
    });
  }
});

// @route   GET /api/customer-success/at-risk
// @desc    Get at-risk customers requiring attention
// @access  Admin
router.get('/at-risk', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const customers = await generateMockCustomers();
    
    // Filter at-risk and critical customers
    const atRiskCustomers = customers
      .filter(c => c.churn_risk === 'high' || c.churn_risk === 'critical')
      .sort((a, b) => a.health_score - b.health_score)
      .slice(0, parseInt(limit));

    // Add risk analysis
    const customersWithAnalysis = atRiskCustomers.map(customer => ({
      ...customer,
      risk_analysis: {
        primary_risk_factors: customer.risk_factors,
        days_since_last_login: Math.floor((Date.now() - new Date(customer.last_active)) / (24 * 60 * 60 * 1000)),
        support_ticket_trend: 'increasing',
        usage_trend: 'decreasing',
        payment_health: customer.financial.payment_status,
        recommended_actions: [
          'Schedule check-in call',
          'Review usage patterns',
          'Offer training session'
        ]
      }
    }));

    res.json({
      success: true,
      data: {
        at_risk_customers: customersWithAnalysis,
        summary: {
          total_at_risk: atRiskCustomers.length,
          critical_risk: atRiskCustomers.filter(c => c.churn_risk === 'critical').length,
          high_risk: atRiskCustomers.filter(c => c.churn_risk === 'high').length,
          avg_health_score: atRiskCustomers.reduce((sum, c) => sum + c.health_score, 0) / atRiskCustomers.length,
          potential_revenue_at_risk: atRiskCustomers.reduce((sum, c) => sum + c.financial.ltv, 0)
        }
      }
    });

  } catch (error) {
    console.error('At-risk customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch at-risk customers',
      error: error.message
    });
  }
});

module.exports = router;
