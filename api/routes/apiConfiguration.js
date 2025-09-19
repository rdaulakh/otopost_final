const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const apiConfigLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many API configuration requests from this IP'
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin role verification
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Apply middleware to all routes
router.use(apiConfigLimit);
router.use(authenticateToken);
router.use(requireAdmin);

// ============================================================================
// API KEYS MANAGEMENT
// ============================================================================

// Get all API keys
router.get('/api-keys', async (req, res) => {
  try {
    // In production, this would fetch from database
    const apiKeys = [
      { 
        id: 1, 
        name: 'Production API', 
        key: 'pk_live_51H7zaBCDEFGHIJKLMNOPQRSTUVWXYZ', 
        status: 'active', 
        created: new Date('2024-01-15').toISOString(), 
        last_used: new Date().toISOString(),
        permissions: ['read', 'write'],
        rate_limit: 1000
      },
      { 
        id: 2, 
        name: 'Development API', 
        key: 'pk_test_51H7zaBCDEFGHIJKLMNOPQRSTUVWXYZ', 
        status: 'active', 
        created: new Date('2024-02-01').toISOString(), 
        last_used: new Date(Date.now() - 86400000).toISOString(),
        permissions: ['read'],
        rate_limit: 500
      },
      { 
        id: 3, 
        name: 'Mobile App API', 
        key: 'pk_mobile_51H7zaBCDEFGHIJKLMNOPQRSTUVWXYZ', 
        status: 'inactive', 
        created: new Date('2024-03-10').toISOString(), 
        last_used: new Date(Date.now() - 2592000000).toISOString(),
        permissions: ['read'],
        rate_limit: 200
      }
    ];

    res.json({
      success: true,
      data: apiKeys,
      total: apiKeys.length
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Create new API key
router.post('/api-keys', async (req, res) => {
  try {
    const { name, permissions, rate_limit } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'API key name is required' });
    }

    // Generate new API key
    const newKey = {
      id: Date.now(),
      name,
      key: `pk_${Math.random().toString(36).substr(2, 32)}`,
      status: 'active',
      created: new Date().toISOString(),
      last_used: null,
      permissions: permissions || ['read'],
      rate_limit: rate_limit || 100
    };

    res.status(201).json({
      success: true,
      data: newKey,
      message: 'API key created successfully'
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// Update API key
router.put('/api-keys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, permissions, rate_limit } = req.body;

    // In production, update in database
    const updatedKey = {
      id: parseInt(id),
      name: name || 'Updated API Key',
      status: status || 'active',
      permissions: permissions || ['read'],
      rate_limit: rate_limit || 100,
      updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedKey,
      message: 'API key updated successfully'
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

// Delete API key
router.delete('/api-keys/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // In production, delete from database
    res.json({
      success: true,
      message: `API key ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

// ============================================================================
// API ENDPOINTS STATUS
// ============================================================================

// Get API endpoints status
router.get('/endpoints', async (req, res) => {
  try {
    const endpoints = [
      { 
        path: '/api/v1/users', 
        method: 'GET', 
        status: 'healthy', 
        response_time: Math.floor(Math.random() * 100) + 20, 
        success_rate: 99.8,
        last_check: new Date().toISOString()
      },
      { 
        path: '/api/v1/posts', 
        method: 'POST', 
        status: 'healthy', 
        response_time: Math.floor(Math.random() * 200) + 50, 
        success_rate: 99.5,
        last_check: new Date().toISOString()
      },
      { 
        path: '/api/v1/analytics', 
        method: 'GET', 
        status: Math.random() > 0.8 ? 'warning' : 'healthy', 
        response_time: Math.floor(Math.random() * 300) + 100, 
        success_rate: 98.2,
        last_check: new Date().toISOString()
      },
      { 
        path: '/api/v1/campaigns', 
        method: 'PUT', 
        status: 'healthy', 
        response_time: Math.floor(Math.random() * 150) + 50, 
        success_rate: 99.9,
        last_check: new Date().toISOString()
      },
      { 
        path: '/api/v1/webhooks', 
        method: 'POST', 
        status: Math.random() > 0.9 ? 'error' : 'healthy', 
        response_time: Math.floor(Math.random() * 400) + 100, 
        success_rate: 95.1,
        last_check: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: endpoints,
      total: endpoints.length,
      healthy: endpoints.filter(e => e.status === 'healthy').length,
      warning: endpoints.filter(e => e.status === 'warning').length,
      error: endpoints.filter(e => e.status === 'error').length
    });
  } catch (error) {
    console.error('Error fetching endpoints status:', error);
    res.status(500).json({ error: 'Failed to fetch endpoints status' });
  }
});

// ============================================================================
// RATE LIMITS CONFIGURATION
// ============================================================================

// Get rate limits configuration
router.get('/rate-limits', async (req, res) => {
  try {
    const rateLimits = {
      free_tier: { 
        requests_per_minute: 60, 
        requests_per_day: 1000, 
        burst_limit: 10,
        current_usage: Math.floor(Math.random() * 800) + 100
      },
      pro_tier: { 
        requests_per_minute: 300, 
        requests_per_day: 10000, 
        burst_limit: 50,
        current_usage: Math.floor(Math.random() * 8000) + 1000
      },
      premium_tier: { 
        requests_per_minute: 1000, 
        requests_per_day: 50000, 
        burst_limit: 200,
        current_usage: Math.floor(Math.random() * 40000) + 5000
      },
      enterprise_tier: { 
        requests_per_minute: 5000, 
        requests_per_day: 250000, 
        burst_limit: 1000,
        current_usage: Math.floor(Math.random() * 200000) + 20000
      }
    };

    res.json({
      success: true,
      data: rateLimits
    });
  } catch (error) {
    console.error('Error fetching rate limits:', error);
    res.status(500).json({ error: 'Failed to fetch rate limits' });
  }
});

// Update rate limits configuration
router.put('/rate-limits', async (req, res) => {
  try {
    const { rateLimits } = req.body;

    // In production, save to database
    res.json({
      success: true,
      data: rateLimits,
      message: 'Rate limits updated successfully'
    });
  } catch (error) {
    console.error('Error updating rate limits:', error);
    res.status(500).json({ error: 'Failed to update rate limits' });
  }
});

// ============================================================================
// AUTHENTICATION SETTINGS
// ============================================================================

// Get authentication settings
router.get('/auth-settings', async (req, res) => {
  try {
    const authSettings = {
      jwt_expiry: 3600,
      refresh_token_expiry: 604800,
      max_login_attempts: 5,
      lockout_duration: 900,
      require_2fa: false,
      api_key_rotation: true,
      session_timeout: 1800,
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_symbols: true
      }
    };

    res.json({
      success: true,
      data: authSettings
    });
  } catch (error) {
    console.error('Error fetching auth settings:', error);
    res.status(500).json({ error: 'Failed to fetch authentication settings' });
  }
});

// Update authentication settings
router.put('/auth-settings', async (req, res) => {
  try {
    const { authSettings } = req.body;

    // In production, save to database and apply changes
    res.json({
      success: true,
      data: authSettings,
      message: 'Authentication settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating auth settings:', error);
    res.status(500).json({ error: 'Failed to update authentication settings' });
  }
});

// ============================================================================
// WEBHOOK CONFIGURATION
// ============================================================================

// Get webhook settings
router.get('/webhook-settings', async (req, res) => {
  try {
    const webhookSettings = {
      timeout: 30,
      retry_attempts: 3,
      retry_delay: 5,
      max_payload_size: 1024,
      signature_verification: true,
      rate_limit: 100,
      active_webhooks: Math.floor(Math.random() * 50) + 10,
      failed_deliveries: Math.floor(Math.random() * 5),
      success_rate: 98.5
    };

    res.json({
      success: true,
      data: webhookSettings
    });
  } catch (error) {
    console.error('Error fetching webhook settings:', error);
    res.status(500).json({ error: 'Failed to fetch webhook settings' });
  }
});

// Update webhook settings
router.put('/webhook-settings', async (req, res) => {
  try {
    const { webhookSettings } = req.body;

    // In production, save to database
    res.json({
      success: true,
      data: webhookSettings,
      message: 'Webhook settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating webhook settings:', error);
    res.status(500).json({ error: 'Failed to update webhook settings' });
  }
});

module.exports = router;
