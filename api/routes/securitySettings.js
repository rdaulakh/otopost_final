const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const securityLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many security requests from this IP'
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
router.use(securityLimit);
router.use(authenticateToken);
router.use(requireAdmin);

// ============================================================================
// SECURITY METRICS
// ============================================================================

// Get security metrics and overview
router.get('/metrics', async (req, res) => {
  try {
    const securityMetrics = {
      overall_score: Math.floor(Math.random() * 10) + 90, // 90-100
      last_scan: new Date().toISOString(),
      vulnerabilities: {
        critical: Math.floor(Math.random() * 2), // 0-1
        high: Math.floor(Math.random() * 3) + 1, // 1-3
        medium: Math.floor(Math.random() * 5) + 2, // 2-6
        low: Math.floor(Math.random() * 10) + 5 // 5-14
      },
      compliance_status: {
        gdpr: Math.random() > 0.1 ? 'compliant' : 'in_progress',
        soc2: Math.random() > 0.2 ? 'compliant' : 'in_progress',
        iso27001: Math.random() > 0.3 ? 'compliant' : 'in_progress',
        ccpa: Math.random() > 0.1 ? 'compliant' : 'in_progress',
        hipaa: Math.random() > 0.5 ? 'compliant' : 'not_applicable'
      },
      threat_detection: {
        blocked_attempts: Math.floor(Math.random() * 100) + 50,
        suspicious_activities: Math.floor(Math.random() * 20) + 5,
        malware_detected: Math.floor(Math.random() * 5),
        ddos_attempts: Math.floor(Math.random() * 10)
      }
    };

    res.json({
      success: true,
      data: securityMetrics
    });
  } catch (error) {
    console.error('Error fetching security metrics:', error);
    res.status(500).json({ error: 'Failed to fetch security metrics' });
  }
});

// ============================================================================
// SECURITY EVENTS
// ============================================================================

// Get security events with pagination and filtering
router.get('/events', async (req, res) => {
  try {
    const { page = 1, limit = 10, severity, type, status } = req.query;
    
    // Generate realistic security events
    const eventTypes = ['login_attempt', 'api_access', 'data_export', 'password_change', 'privilege_escalation', 'file_access', 'system_access'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['allowed', 'blocked', 'flagged', 'completed', 'investigated', 'pending'];
    const users = ['admin@company.com', 'john.doe@company.com', 'jane.smith@company.com', 'api_user_123', 'system_admin', 'unknown@hacker.com'];
    const ips = ['192.168.1.100', '192.168.1.105', '192.168.1.110', '10.0.0.50', '127.0.0.1', '203.0.113.1'];

    const securityEvents = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      user: users[Math.floor(Math.random() * users.length)],
      ip: ips[Math.floor(Math.random() * ips.length)],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      description: `Security event detected: ${eventTypes[Math.floor(Math.random() * eventTypes.length)]}`,
      risk_score: Math.floor(Math.random() * 100)
    }));

    // Apply filters
    let filteredEvents = securityEvents;
    if (severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === severity);
    }
    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }
    if (status) {
      filteredEvents = filteredEvents.filter(event => event.status === status);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedEvents,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: filteredEvents.length,
        total_pages: Math.ceil(filteredEvents.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({ error: 'Failed to fetch security events' });
  }
});

// ============================================================================
// AUDIT LOGS
// ============================================================================

// Get audit logs with pagination and filtering
router.get('/audit-logs', async (req, res) => {
  try {
    const { page = 1, limit = 10, action, user, result } = req.query;
    
    // Generate realistic audit logs
    const actions = ['User Login', 'Data Export', 'Permission Change', 'API Key Generation', 'Failed Login', 'File Upload', 'System Configuration', 'User Creation', 'Password Reset'];
    const users_list = ['admin@company.com', 'john.doe@company.com', 'jane.smith@company.com', 'system_admin', 'unknown@hacker.com'];
    const resources = ['Admin Dashboard', 'Customer Database', 'User Management', 'API Management', 'Login Page', 'File System', 'System Settings'];
    const results = ['Success', 'Failed', 'Blocked', 'Pending', 'Partial'];
    const ips = ['192.168.1.100', '192.168.1.105', '192.168.1.110', '127.0.0.1', '203.0.113.1'];

    const auditLogs = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      action: actions[Math.floor(Math.random() * actions.length)],
      user: users_list[Math.floor(Math.random() * users_list.length)],
      resource: resources[Math.floor(Math.random() * resources.length)],
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      ip: ips[Math.floor(Math.random() * ips.length)],
      result: results[Math.floor(Math.random() * results.length)],
      details: `Audit log entry for ${actions[Math.floor(Math.random() * actions.length)]}`,
      session_id: `sess_${Math.random().toString(36).substr(2, 16)}`
    }));

    // Apply filters
    let filteredLogs = auditLogs;
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action.toLowerCase().includes(action.toLowerCase()));
    }
    if (user) {
      filteredLogs = filteredLogs.filter(log => log.user.toLowerCase().includes(user.toLowerCase()));
    }
    if (result) {
      filteredLogs = filteredLogs.filter(log => log.result === result);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: filteredLogs.length,
        total_pages: Math.ceil(filteredLogs.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// ============================================================================
// ACCESS CONTROL SETTINGS
// ============================================================================

// Get access control settings
router.get('/access-control', async (req, res) => {
  try {
    const accessControl = {
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_symbols: true,
        password_expiry: 90,
        password_history: 5
      },
      session_management: {
        session_timeout: 30,
        concurrent_sessions: 3,
        idle_timeout: 15,
        force_logout_on_password_change: true
      },
      two_factor_auth: {
        enabled: true,
        required_for_admin: true,
        backup_codes: true,
        sms_enabled: true,
        app_enabled: true
      },
      ip_restrictions: {
        enabled: false,
        whitelist: ['192.168.1.0/24', '10.0.0.0/8'],
        blacklist: ['203.0.113.0/24']
      }
    };

    res.json({
      success: true,
      data: accessControl
    });
  } catch (error) {
    console.error('Error fetching access control settings:', error);
    res.status(500).json({ error: 'Failed to fetch access control settings' });
  }
});

// Update access control settings
router.put('/access-control', async (req, res) => {
  try {
    const { accessControl } = req.body;

    // In production, save to database and apply changes
    res.json({
      success: true,
      data: accessControl,
      message: 'Access control settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating access control settings:', error);
    res.status(500).json({ error: 'Failed to update access control settings' });
  }
});

// ============================================================================
// DATA PRIVACY SETTINGS
// ============================================================================

// Get data privacy settings
router.get('/privacy-settings', async (req, res) => {
  try {
    const privacySettings = {
      data_retention: {
        user_data: 365,
        analytics_data: 730,
        log_data: 90,
        backup_data: 2555
      },
      encryption: {
        data_at_rest: true,
        data_in_transit: true,
        key_rotation: true,
        encryption_algorithm: 'AES-256'
      },
      anonymization: {
        auto_anonymize: true,
        anonymize_after_days: 30,
        pseudonymization: true
      },
      consent_management: {
        explicit_consent: true,
        consent_tracking: true,
        withdrawal_mechanism: true
      }
    };

    res.json({
      success: true,
      data: privacySettings
    });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    res.status(500).json({ error: 'Failed to fetch privacy settings' });
  }
});

// Update data privacy settings
router.put('/privacy-settings', async (req, res) => {
  try {
    const { privacySettings } = req.body;

    // In production, save to database and apply changes
    res.json({
      success: true,
      data: privacySettings,
      message: 'Privacy settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// ============================================================================
// SECURITY SCAN
// ============================================================================

// Trigger security scan
router.post('/scan', async (req, res) => {
  try {
    // Simulate security scan
    const scanResult = {
      scan_id: `scan_${Date.now()}`,
      status: 'running',
      started_at: new Date().toISOString(),
      estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };

    res.json({
      success: true,
      data: scanResult,
      message: 'Security scan initiated successfully'
    });
  } catch (error) {
    console.error('Error starting security scan:', error);
    res.status(500).json({ error: 'Failed to start security scan' });
  }
});

module.exports = router;
