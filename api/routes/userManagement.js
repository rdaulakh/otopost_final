const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Rate limiting for user management endpoints
const userManagementRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
  message: 'Too many user management requests from this IP'
});

router.use(userManagementRateLimit);
router.use(auth);
router.use(adminAuth);

// Generate mock user data
const generateMockUsers = (count = 50) => {
  const users = [];
  const plans = ['starter', 'professional', 'enterprise', 'trial'];
  const statuses = ['active', 'inactive', 'suspended', 'pending'];
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Emma', 'Alex', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'business.org'];
  
  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const lastLogin = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    users.push({
      id: `user_${i}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      plan: plan,
      status: status,
      role: i <= 3 ? 'admin' : 'user',
      created_at: createdAt.toISOString(),
      updated_at: new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_login: lastLogin.toISOString(),
      email_verified: Math.random() > 0.1,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      company: Math.random() > 0.3 ? `${firstName}'s Company` : null,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
      
      // Subscription details
      subscription: {
        id: `sub_${i}`,
        plan: plan,
        status: plan === 'trial' ? 'trialing' : 'active',
        current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        trial_end: plan === 'trial' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        cancel_at_period_end: Math.random() > 0.9,
        amount: plan === 'starter' ? 29 : plan === 'professional' ? 79 : plan === 'enterprise' ? 199 : 0,
        currency: 'usd',
        interval: 'month'
      },
      
      // Usage statistics
      usage: {
        posts_created: Math.floor(Math.random() * 1000),
        campaigns_run: Math.floor(Math.random() * 50),
        ai_requests: Math.floor(Math.random() * 5000),
        storage_used: Math.floor(Math.random() * 1000), // MB
        api_calls: Math.floor(Math.random() * 10000),
        last_activity: lastLogin.toISOString()
      },
      
      // Profile information
      profile: {
        bio: `${firstName} is a social media professional using our platform.`,
        website: Math.random() > 0.5 ? `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.com` : null,
        location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'][Math.floor(Math.random() * 5)],
        timezone: 'America/New_York',
        language: 'en',
        marketing_emails: Math.random() > 0.3,
        product_updates: Math.random() > 0.2,
        security_alerts: true
      },
      
      // Account security
      security: {
        two_factor_enabled: Math.random() > 0.6,
        login_attempts: Math.floor(Math.random() * 5),
        last_password_change: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        sessions: Math.floor(Math.random() * 3) + 1,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      
      // Billing information
      billing: {
        customer_id: `cus_${Math.random().toString(36).substr(2, 9)}`,
        payment_method: ['card', 'bank_transfer', 'paypal'][Math.floor(Math.random() * 3)],
        last_payment: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        next_payment: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        total_spent: Math.floor(Math.random() * 5000),
        invoices_count: Math.floor(Math.random() * 24)
      },
      
      // Engagement metrics
      engagement: {
        login_frequency: Math.floor(Math.random() * 30), // days
        feature_adoption: Math.random() * 100,
        support_tickets: Math.floor(Math.random() * 10),
        nps_score: Math.floor(Math.random() * 11), // 0-10
        satisfaction_rating: Math.floor(Math.random() * 5) + 1, // 1-5
        referrals: Math.floor(Math.random() * 5)
      }
    });
  }
  
  return users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

// @route   GET /api/user-management/users
// @desc    Get users list with filtering, pagination, and search
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      plan = 'all',
      role = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc',
      date_from,
      date_to
    } = req.query;

    let users = generateMockUsers(200);

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.company?.toLowerCase().includes(searchLower)
      );
    }
    
    if (status !== 'all') {
      users = users.filter(user => user.status === status);
    }
    
    if (plan !== 'all') {
      users = users.filter(user => user.plan === plan);
    }
    
    if (role !== 'all') {
      users = users.filter(user => user.role === role);
    }
    
    if (date_from) {
      users = users.filter(user => new Date(user.created_at) >= new Date(date_from));
    }
    
    if (date_to) {
      users = users.filter(user => new Date(user.created_at) <= new Date(date_to));
    }

    // Sort users
    users.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'updated_at' || sortBy === 'last_login') {
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
    const paginatedUsers = users.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(users.length / limit),
          total: users.length,
          limit: parseInt(limit),
          has_next: endIndex < users.length,
          has_prev: startIndex > 0
        },
        filters: {
          search,
          status,
          plan,
          role,
          sortBy,
          sortOrder,
          date_from,
          date_to
        }
      }
    });

  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users list',
      error: error.message
    });
  }
});

// @route   GET /api/user-management/users/:id
// @desc    Get user details by ID
// @access  Admin
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = generateMockUsers(200);
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
});

// @route   POST /api/user-management/users
// @desc    Create new user
// @access  Admin
router.post('/users', async (req, res) => {
  try {
    const {
      email,
      name,
      first_name,
      last_name,
      plan = 'starter',
      role = 'user',
      phone,
      company,
      send_welcome_email = true
    } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    // Check if user already exists (mock check)
    const existingUsers = generateMockUsers(200);
    const existingUser = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const newUser = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      name,
      first_name: first_name || name.split(' ')[0],
      last_name: last_name || name.split(' ').slice(1).join(' '),
      plan,
      role,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: null,
      email_verified: false,
      phone: phone || null,
      company: company || null,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      
      subscription: {
        id: `sub_${Date.now()}`,
        plan,
        status: plan === 'trial' ? 'trialing' : 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trial_end: plan === 'trial' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() : null,
        cancel_at_period_end: false,
        amount: plan === 'starter' ? 29 : plan === 'professional' ? 79 : plan === 'enterprise' ? 199 : 0,
        currency: 'usd',
        interval: 'month'
      },
      
      usage: {
        posts_created: 0,
        campaigns_run: 0,
        ai_requests: 0,
        storage_used: 0,
        api_calls: 0,
        last_activity: new Date().toISOString()
      },
      
      profile: {
        bio: '',
        website: null,
        location: null,
        timezone: 'America/New_York',
        language: 'en',
        marketing_emails: true,
        product_updates: true,
        security_alerts: true
      },
      
      security: {
        two_factor_enabled: false,
        login_attempts: 0,
        last_password_change: new Date().toISOString(),
        sessions: 0,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      },
      
      billing: {
        customer_id: `cus_${Math.random().toString(36).substr(2, 9)}`,
        payment_method: null,
        last_payment: null,
        next_payment: plan !== 'trial' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        total_spent: 0,
        invoices_count: 0
      },
      
      engagement: {
        login_frequency: 0,
        feature_adoption: 0,
        support_tickets: 0,
        nps_score: null,
        satisfaction_rating: null,
        referrals: 0
      }
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// @route   PUT /api/user-management/users/:id
// @desc    Update user
// @access  Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const users = generateMockUsers(200);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = {
      ...users[userIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// @route   DELETE /api/user-management/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;
    
    const users = generateMockUsers(200);
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (permanent) {
      // Permanent deletion
      res.json({
        success: true,
        message: 'User permanently deleted',
        data: { id, deleted_at: new Date().toISOString() }
      });
    } else {
      // Soft deletion (suspend)
      const updatedUser = {
        ...user,
        status: 'suspended',
        updated_at: new Date().toISOString(),
        suspended_at: new Date().toISOString()
      };
      
      res.json({
        success: true,
        message: 'User suspended successfully',
        data: updatedUser
      });
    }

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// @route   GET /api/user-management/analytics
// @desc    Get user analytics and statistics
// @access  Admin
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const users = generateMockUsers(200);
    
    const analytics = {
      summary: {
        total_users: users.length,
        active_users: users.filter(u => u.status === 'active').length,
        inactive_users: users.filter(u => u.status === 'inactive').length,
        suspended_users: users.filter(u => u.status === 'suspended').length,
        trial_users: users.filter(u => u.plan === 'trial').length,
        premium_users: users.filter(u => u.plan !== 'trial').length,
        verified_users: users.filter(u => u.email_verified).length,
        two_factor_users: users.filter(u => u.security.two_factor_enabled).length
      },
      
      plan_distribution: [
        { plan: 'Trial', count: users.filter(u => u.plan === 'trial').length, color: '#ff7300' },
        { plan: 'Starter', count: users.filter(u => u.plan === 'starter').length, color: '#8884d8' },
        { plan: 'Professional', count: users.filter(u => u.plan === 'professional').length, color: '#82ca9d' },
        { plan: 'Enterprise', count: users.filter(u => u.plan === 'enterprise').length, color: '#ffc658' }
      ],
      
      status_distribution: [
        { status: 'Active', count: users.filter(u => u.status === 'active').length, color: '#82ca9d' },
        { status: 'Inactive', count: users.filter(u => u.status === 'inactive').length, color: '#ffc658' },
        { status: 'Suspended', count: users.filter(u => u.status === 'suspended').length, color: '#ff7300' },
        { status: 'Pending', count: users.filter(u => u.status === 'pending').length, color: '#8884d8' }
      ],
      
      growth_trend: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          new_users: Math.floor(Math.random() * 20) + 5,
          total_users: Math.floor(Math.random() * 100) + users.length - 50 + i * 2
        };
      }),
      
      engagement_metrics: {
        avg_session_duration: '24m 35s',
        avg_monthly_logins: 18.5,
        feature_adoption_rate: 67.3,
        churn_rate: 3.2,
        retention_rate: 91.8,
        nps_score: 8.4
      },
      
      top_users: users
        .sort((a, b) => b.usage.posts_created - a.usage.posts_created)
        .slice(0, 10)
        .map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          posts_created: user.usage.posts_created,
          total_spent: user.billing.total_spent
        })),
      
      recent_signups: users
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
        .map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          created_at: user.created_at,
          status: user.status
        })),
      
      time_range: timeRange,
      last_updated: new Date()
    };

    res.json({
      success: true,
      data: analytics
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

// @route   POST /api/user-management/users/bulk-action
// @desc    Perform bulk actions on users
// @access  Admin
router.post('/users/bulk-action', async (req, res) => {
  try {
    const { action, user_ids, data = {} } = req.body;
    
    if (!action || !user_ids || !Array.isArray(user_ids)) {
      return res.status(400).json({
        success: false,
        message: 'Action and user_ids array are required'
      });
    }

    const results = {
      success_count: 0,
      error_count: 0,
      errors: []
    };

    // Mock bulk action processing
    for (const userId of user_ids) {
      try {
        // Simulate processing each user
        if (Math.random() > 0.1) { // 90% success rate
          results.success_count++;
        } else {
          results.error_count++;
          results.errors.push({
            user_id: userId,
            error: 'Failed to process user'
          });
        }
      } catch (error) {
        results.error_count++;
        results.errors.push({
          user_id: userId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed`,
      data: {
        action,
        total_users: user_ids.length,
        ...results,
        processed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk action',
      error: error.message
    });
  }
});

// @route   GET /api/user-management/export
// @desc    Export users data
// @access  Admin
router.get('/export', async (req, res) => {
  try {
    const { format = 'csv', filters = {} } = req.query;
    
    res.json({
      success: true,
      message: 'Export initiated',
      data: {
        export_id: `export_${Date.now()}`,
        format,
        filters,
        status: 'processing',
        estimated_completion: new Date(Date.now() + 60000).toISOString(), // 1 minute
        download_url: null // Will be provided when ready
      }
    });

  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate export',
      error: error.message
    });
  }
});

module.exports = router;
