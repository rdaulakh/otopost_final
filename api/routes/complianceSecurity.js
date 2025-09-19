const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for compliance security endpoints
const complianceSecurityRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per 5 minutes
  message: 'Too many compliance security requests from this IP'
});

router.use(complianceSecurityRateLimit);
router.use(auth);
router.use(adminAuth);

// Generate mock security events
const generateMockSecurityEvents = () => {
  const eventTypes = ['login_attempt', 'data_access', 'permission_change', 'api_access', 'file_upload', 'system_change'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['allowed', 'blocked', 'flagged', 'approved', 'denied'];
  const locations = ['New York, US', 'San Francisco, US', 'London, UK', 'Tokyo, JP', 'Sydney, AU'];
  const devices = ['Chrome on Windows', 'Firefox on macOS', 'Safari on iOS', 'Edge on Windows', 'Chrome on Android'];
  
  const events = [];
  for (let i = 1; i <= 200; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    events.push({
      id: `event_${i}`,
      type: eventType,
      severity: severities[Math.floor(Math.random() * severities.length)],
      title: `Security event ${i}`,
      description: `Description for security event ${i}`,
      user: `user${i}@example.com`,
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      timestamp: timestamp.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      metadata: {
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: `session_${Math.random().toString(36).substr(2, 9)}`,
        request_id: `req_${Math.random().toString(36).substr(2, 9)}`,
        endpoint: eventType === 'api_access' ? '/api/posts' : null,
        resource: eventType === 'data_access' ? 'customer_data' : null
      },
      risk_score: Math.floor(Math.random() * 100),
      resolved: Math.random() > 0.3,
      resolved_at: Math.random() > 0.3 ? new Date(timestamp.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : null,
      resolved_by: Math.random() > 0.3 ? 'security@platform.com' : null
    });
  }
  
  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Generate mock compliance data
const generateMockComplianceFrameworks = () => {
  return [
    {
      id: 'gdpr',
      name: 'GDPR',
      full_name: 'General Data Protection Regulation',
      status: 'compliant',
      score: 98.5,
      last_audit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      next_audit: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: {
        total: 47,
        completed: 46,
        pending: 1,
        failed: 0
      },
      description: 'EU regulation on data protection and privacy',
      region: 'EU',
      mandatory: true,
      certification_body: 'EU Data Protection Authority',
      certificate_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      key_requirements: [
        'Data subject consent',
        'Right to be forgotten',
        'Data portability',
        'Privacy by design',
        'Data breach notification'
      ],
      recent_changes: [
        {
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Updated privacy policy template',
          impact: 'low'
        }
      ]
    },
    {
      id: 'soc2',
      name: 'SOC 2 Type II',
      full_name: 'Service Organization Control 2',
      status: 'compliant',
      score: 96.8,
      last_audit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      next_audit: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: {
        total: 32,
        completed: 31,
        pending: 1,
        failed: 0
      },
      description: 'Security, availability, processing integrity, confidentiality, and privacy',
      region: 'US',
      mandatory: false,
      certification_body: 'AICPA',
      certificate_expiry: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
      key_requirements: [
        'Security controls',
        'Availability monitoring',
        'Processing integrity',
        'Confidentiality measures',
        'Privacy protection'
      ],
      recent_changes: [
        {
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Enhanced access control policies',
          impact: 'medium'
        }
      ]
    },
    {
      id: 'iso27001',
      name: 'ISO 27001',
      full_name: 'Information Security Management System',
      status: 'in_progress',
      score: 87.3,
      last_audit: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      next_audit: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: {
        total: 114,
        completed: 99,
        pending: 15,
        failed: 0
      },
      description: 'International standard for information security management',
      region: 'Global',
      mandatory: false,
      certification_body: 'ISO',
      certificate_expiry: null,
      key_requirements: [
        'Risk assessment',
        'Security policies',
        'Asset management',
        'Access control',
        'Incident management'
      ],
      recent_changes: [
        {
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Implemented new risk assessment framework',
          impact: 'high'
        }
      ]
    },
    {
      id: 'ccpa',
      name: 'CCPA',
      full_name: 'California Consumer Privacy Act',
      status: 'compliant',
      score: 99.1,
      last_audit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      next_audit: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: {
        total: 23,
        completed: 23,
        pending: 0,
        failed: 0
      },
      description: 'California state privacy law',
      region: 'California, US',
      mandatory: true,
      certification_body: 'California Attorney General',
      certificate_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      key_requirements: [
        'Consumer rights disclosure',
        'Data deletion requests',
        'Opt-out mechanisms',
        'Non-discrimination',
        'Third-party data sharing disclosure'
      ],
      recent_changes: [
        {
          date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Updated consumer request portal',
          impact: 'medium'
        }
      ]
    },
    {
      id: 'hipaa',
      name: 'HIPAA',
      full_name: 'Health Insurance Portability and Accountability Act',
      status: 'not_applicable',
      score: 0,
      last_audit: null,
      next_audit: null,
      requirements: {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0
      },
      description: 'US healthcare data protection law',
      region: 'US',
      mandatory: false,
      certification_body: 'HHS',
      certificate_expiry: null,
      key_requirements: [],
      recent_changes: []
    }
  ];
};

// @route   GET /api/compliance-security/metrics
// @desc    Get security and compliance metrics
// @access  Admin
router.get('/metrics', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const securityEvents = generateMockSecurityEvents();
    const complianceFrameworks = generateMockComplianceFrameworks();
    
    // Calculate time range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const timeRangeStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentEvents = securityEvents.filter(event => new Date(event.timestamp) >= timeRangeStart);
    
    const metrics = {
      security: {
        security_score: 94.5,
        active_threats: recentEvents.filter(e => e.severity === 'critical' && !e.resolved).length,
        blocked_attempts: recentEvents.filter(e => e.status === 'blocked').length,
        vulnerabilities: 2,
        data_breaches: 0,
        last_security_audit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        ssl_certificate_expiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        encryption_status: 'active',
        backup_status: 'healthy',
        firewall_status: 'active',
        intrusion_detection: 'active'
      },
      
      compliance: {
        overall_compliance_score: complianceFrameworks.reduce((sum, f) => sum + f.score, 0) / complianceFrameworks.filter(f => f.status !== 'not_applicable').length,
        compliant_frameworks: complianceFrameworks.filter(f => f.status === 'compliant').length,
        in_progress_frameworks: complianceFrameworks.filter(f => f.status === 'in_progress').length,
        non_compliant_frameworks: complianceFrameworks.filter(f => f.status === 'non_compliant').length,
        total_requirements: complianceFrameworks.reduce((sum, f) => sum + f.requirements.total, 0),
        completed_requirements: complianceFrameworks.reduce((sum, f) => sum + f.requirements.completed, 0),
        pending_requirements: complianceFrameworks.reduce((sum, f) => sum + f.requirements.pending, 0),
        upcoming_audits: complianceFrameworks.filter(f => {
          if (!f.next_audit) return false;
          const nextAudit = new Date(f.next_audit);
          const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          return nextAudit <= thirtyDaysFromNow;
        }).length
      },
      
      events: {
        total_events: recentEvents.length,
        high_severity_events: recentEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length,
        unresolved_events: recentEvents.filter(e => !e.resolved).length,
        blocked_events: recentEvents.filter(e => e.status === 'blocked').length,
        flagged_events: recentEvents.filter(e => e.status === 'flagged').length,
        avg_resolution_time: '2.3 hours',
        events_by_type: {
          login_attempt: recentEvents.filter(e => e.type === 'login_attempt').length,
          data_access: recentEvents.filter(e => e.type === 'data_access').length,
          permission_change: recentEvents.filter(e => e.type === 'permission_change').length,
          api_access: recentEvents.filter(e => e.type === 'api_access').length,
          file_upload: recentEvents.filter(e => e.type === 'file_upload').length,
          system_change: recentEvents.filter(e => e.type === 'system_change').length
        }
      },
      
      data_protection: {
        data_encryption_at_rest: true,
        data_encryption_in_transit: true,
        data_backup_frequency: 'daily',
        data_retention_policy: 'active',
        data_anonymization: 'enabled',
        gdpr_compliance: true,
        ccpa_compliance: true,
        data_subject_requests: {
          total: 45,
          completed: 42,
          pending: 3,
          avg_response_time: '5.2 days'
        }
      },
      
      access_control: {
        two_factor_authentication: 'enforced',
        password_policy: 'strong',
        session_management: 'active',
        role_based_access: 'enabled',
        privileged_access_management: 'enabled',
        failed_login_attempts: recentEvents.filter(e => e.type === 'login_attempt' && e.status === 'blocked').length,
        active_sessions: 1247,
        admin_sessions: 23
      },
      
      time_range: timeRange,
      last_updated: new Date()
    };

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Compliance security metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance security metrics',
      error: error.message
    });
  }
});

// @route   GET /api/compliance-security/events
// @desc    Get security events with filtering and pagination
// @access  Admin
router.get('/events', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type = 'all',
      severity = 'all',
      status = 'all',
      resolved = 'all',
      search = '',
      sortBy = 'timestamp',
      sortOrder = 'desc',
      date_from,
      date_to
    } = req.query;

    let events = generateMockSecurityEvents();

    // Apply filters
    if (type !== 'all') {
      events = events.filter(e => e.type === type);
    }
    
    if (severity !== 'all') {
      events = events.filter(e => e.severity === severity);
    }
    
    if (status !== 'all') {
      events = events.filter(e => e.status === status);
    }
    
    if (resolved !== 'all') {
      if (resolved === 'true') {
        events = events.filter(e => e.resolved);
      } else {
        events = events.filter(e => !e.resolved);
      }
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      events = events.filter(e => 
        e.title.toLowerCase().includes(searchLower) ||
        e.description.toLowerCase().includes(searchLower) ||
        e.user.toLowerCase().includes(searchLower) ||
        e.ip.includes(searchLower)
      );
    }
    
    if (date_from) {
      events = events.filter(e => new Date(e.timestamp) >= new Date(date_from));
    }
    
    if (date_to) {
      events = events.filter(e => new Date(e.timestamp) <= new Date(date_to));
    }

    // Sort events
    events.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'timestamp' || sortBy === 'resolved_at') {
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
    const paginatedEvents = events.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        events: paginatedEvents,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(events.length / limit),
          total: events.length,
          limit: parseInt(limit)
        },
        filters: {
          type,
          severity,
          status,
          resolved,
          search,
          sortBy,
          sortOrder,
          date_from,
          date_to
        }
      }
    });

  } catch (error) {
    console.error('Security events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security events',
      error: error.message
    });
  }
});

// @route   GET /api/compliance-security/frameworks
// @desc    Get compliance frameworks status
// @access  Admin
router.get('/frameworks', async (req, res) => {
  try {
    const frameworks = generateMockComplianceFrameworks();

    res.json({
      success: true,
      data: {
        frameworks,
        summary: {
          total_frameworks: frameworks.length,
          compliant: frameworks.filter(f => f.status === 'compliant').length,
          in_progress: frameworks.filter(f => f.status === 'in_progress').length,
          non_compliant: frameworks.filter(f => f.status === 'non_compliant').length,
          not_applicable: frameworks.filter(f => f.status === 'not_applicable').length,
          avg_score: frameworks.filter(f => f.status !== 'not_applicable').reduce((sum, f) => sum + f.score, 0) / frameworks.filter(f => f.status !== 'not_applicable').length,
          total_requirements: frameworks.reduce((sum, f) => sum + f.requirements.total, 0),
          completed_requirements: frameworks.reduce((sum, f) => sum + f.requirements.completed, 0),
          pending_requirements: frameworks.reduce((sum, f) => sum + f.requirements.pending, 0)
        }
      }
    });

  } catch (error) {
    console.error('Compliance frameworks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance frameworks',
      error: error.message
    });
  }
});

// @route   PUT /api/compliance-security/events/:id/resolve
// @desc    Resolve security event
// @access  Admin
router.put('/events/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution_note = '', action_taken = '' } = req.body;

    res.json({
      success: true,
      message: 'Security event resolved successfully',
      data: {
        id,
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: req.user.email,
        resolution_note,
        action_taken
      }
    });

  } catch (error) {
    console.error('Resolve security event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve security event',
      error: error.message
    });
  }
});

// @route   POST /api/compliance-security/audit
// @desc    Initiate compliance audit
// @access  Admin
router.post('/audit', async (req, res) => {
  try {
    const { framework_id, audit_type = 'internal', scheduled_date } = req.body;

    if (!framework_id) {
      return res.status(400).json({
        success: false,
        message: 'Framework ID is required'
      });
    }

    const audit = {
      id: `audit_${Date.now()}`,
      framework_id,
      audit_type,
      status: 'scheduled',
      scheduled_date: scheduled_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      created_by: req.user.email,
      estimated_duration: '2-3 weeks',
      auditor: audit_type === 'external' ? 'External Auditing Firm' : 'Internal Compliance Team'
    };

    res.status(201).json({
      success: true,
      message: 'Compliance audit scheduled successfully',
      data: audit
    });

  } catch (error) {
    console.error('Schedule audit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule compliance audit',
      error: error.message
    });
  }
});

// @route   GET /api/compliance-security/reports
// @desc    Generate compliance and security reports
// @access  Admin
router.get('/reports', async (req, res) => {
  try {
    const { type = 'summary', format = 'json', timeRange = '30d' } = req.query;
    
    const events = generateMockSecurityEvents();
    const frameworks = generateMockComplianceFrameworks();
    
    const report = {
      id: `report_${Date.now()}`,
      type,
      format,
      time_range: timeRange,
      generated_at: new Date().toISOString(),
      generated_by: req.user.email,
      
      executive_summary: {
        overall_security_score: 94.5,
        overall_compliance_score: 95.7,
        critical_issues: 0,
        high_priority_issues: 2,
        recommendations: 5
      },
      
      security_summary: {
        total_events: events.length,
        resolved_events: events.filter(e => e.resolved).length,
        high_severity_events: events.filter(e => e.severity === 'high' || e.severity === 'critical').length,
        avg_resolution_time: '2.3 hours'
      },
      
      compliance_summary: {
        compliant_frameworks: frameworks.filter(f => f.status === 'compliant').length,
        total_frameworks: frameworks.filter(f => f.status !== 'not_applicable').length,
        pending_requirements: frameworks.reduce((sum, f) => sum + f.requirements.pending, 0),
        upcoming_audits: frameworks.filter(f => {
          if (!f.next_audit) return false;
          const nextAudit = new Date(f.next_audit);
          const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          return nextAudit <= thirtyDaysFromNow;
        }).length
      },
      
      recommendations: [
        {
          priority: 'high',
          category: 'security',
          title: 'Implement additional MFA for admin accounts',
          description: 'Consider implementing hardware tokens for super admin accounts'
        },
        {
          priority: 'medium',
          category: 'compliance',
          title: 'Complete ISO 27001 certification',
          description: 'Finish remaining 15 requirements for full compliance'
        },
        {
          priority: 'low',
          category: 'monitoring',
          title: 'Enhance log retention',
          description: 'Extend security log retention to 2 years for better forensics'
        }
      ],
      
      next_actions: [
        'Schedule quarterly security review',
        'Update privacy policy for GDPR compliance',
        'Conduct penetration testing',
        'Review access control policies'
      ]
    };

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate compliance security report',
      error: error.message
    });
  }
});

// @route   GET /api/compliance-security/vulnerabilities
// @desc    Get security vulnerabilities assessment
// @access  Admin
router.get('/vulnerabilities', async (req, res) => {
  try {
    const vulnerabilities = [
      {
        id: 'vuln_1',
        title: 'Outdated SSL Certificate',
        description: 'SSL certificate expires in 60 days',
        severity: 'medium',
        category: 'infrastructure',
        status: 'open',
        discovered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        cvss_score: 5.3,
        affected_systems: ['web-server-01', 'api-gateway'],
        remediation: 'Renew SSL certificate before expiration',
        estimated_fix_time: '2 hours',
        assigned_to: 'devops@platform.com'
      },
      {
        id: 'vuln_2',
        title: 'Weak Password Policy',
        description: 'Some user accounts have weak passwords',
        severity: 'low',
        category: 'access_control',
        status: 'in_progress',
        discovered_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        cvss_score: 3.1,
        affected_systems: ['user-management'],
        remediation: 'Enforce stronger password requirements',
        estimated_fix_time: '1 week',
        assigned_to: 'security@platform.com'
      }
    ];

    res.json({
      success: true,
      data: {
        vulnerabilities,
        summary: {
          total: vulnerabilities.length,
          critical: vulnerabilities.filter(v => v.severity === 'critical').length,
          high: vulnerabilities.filter(v => v.severity === 'high').length,
          medium: vulnerabilities.filter(v => v.severity === 'medium').length,
          low: vulnerabilities.filter(v => v.severity === 'low').length,
          open: vulnerabilities.filter(v => v.status === 'open').length,
          in_progress: vulnerabilities.filter(v => v.status === 'in_progress').length,
          resolved: vulnerabilities.filter(v => v.status === 'resolved').length
        }
      }
    });

  } catch (error) {
    console.error('Vulnerabilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security vulnerabilities',
      error: error.message
    });
  }
});

module.exports = router;
