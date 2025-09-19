import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const createApiClient = () => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

export const useComplianceSecurity = () => {
  const [securityMetrics, setSecurityMetrics] = useState({
    security: {
      security_score: 0,
      active_threats: 0,
      blocked_attempts: 0,
      vulnerabilities: 0,
      data_breaches: 0,
      last_security_audit: null,
      ssl_certificate_expiry: null,
      encryption_status: 'unknown',
      backup_status: 'unknown',
      firewall_status: 'unknown',
      intrusion_detection: 'unknown'
    },
    compliance: {
      overall_compliance_score: 0,
      compliant_frameworks: 0,
      in_progress_frameworks: 0,
      non_compliant_frameworks: 0,
      total_requirements: 0,
      completed_requirements: 0,
      pending_requirements: 0,
      upcoming_audits: 0
    },
    events: {
      total_events: 0,
      high_severity_events: 0,
      unresolved_events: 0,
      blocked_events: 0,
      flagged_events: 0,
      avg_resolution_time: '0 hours',
      events_by_type: {}
    },
    data_protection: {},
    access_control: {}
  });
  
  const [securityEvents, setSecurityEvents] = useState([]);
  const [complianceFrameworks, setComplianceFrameworks] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSecurityMetrics = useCallback(async (timeRange = '30d') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/compliance-security/metrics?timeRange=${timeRange}`);
      
      if (response.data.success) {
        setSecurityMetrics(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch security metrics');
      }
    } catch (err) {
      console.error('Error fetching security metrics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch security metrics');
      
      // Fallback to mock data if API fails
      const mockMetrics = {
        security: {
          security_score: 94.5,
          active_threats: 0,
          blocked_attempts: 1247,
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
          overall_compliance_score: 95.7,
          compliant_frameworks: 3,
          in_progress_frameworks: 1,
          non_compliant_frameworks: 0,
          total_requirements: 216,
          completed_requirements: 199,
          pending_requirements: 17,
          upcoming_audits: 2
        },
        events: {
          total_events: 156,
          high_severity_events: 8,
          unresolved_events: 12,
          blocked_events: 89,
          flagged_events: 23,
          avg_resolution_time: '2.3 hours',
          events_by_type: {
            login_attempt: 45,
            data_access: 32,
            permission_change: 18,
            api_access: 28,
            file_upload: 21,
            system_change: 12
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
          failed_login_attempts: 89,
          active_sessions: 1247,
          admin_sessions: 23
        }
      };
      setSecurityMetrics(mockMetrics);
      return mockMetrics;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSecurityEvents = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/compliance-security/events?${queryParams}`);
      
      if (response.data.success) {
        setSecurityEvents(response.data.data.events);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch security events');
      }
    } catch (err) {
      console.error('Error fetching security events:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch security events');
      
      // Fallback to mock events
      const mockEvents = [
        {
          id: 'event_1',
          type: 'login_attempt',
          severity: 'medium',
          title: 'Multiple failed login attempts',
          description: 'User attempted to login 5 times with incorrect password',
          user: 'john.doe@example.com',
          ip: '192.168.1.100',
          location: 'New York, US',
          device: 'Chrome on Windows',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'blocked',
          resolved: false,
          risk_score: 75
        },
        {
          id: 'event_2',
          type: 'data_access',
          severity: 'low',
          title: 'Bulk data export',
          description: 'Admin exported customer data for analytics',
          user: 'admin@aisocialmedia.com',
          ip: '10.0.0.5',
          location: 'San Francisco, US',
          device: 'Firefox on macOS',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'allowed',
          resolved: true,
          resolved_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          risk_score: 25
        }
      ];
      setSecurityEvents(mockEvents);
      return { events: mockEvents, pagination: { current: 1, pages: 1, total: 2, limit: 20 } };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchComplianceFrameworks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get('/compliance-security/frameworks');
      
      if (response.data.success) {
        setComplianceFrameworks(response.data.data.frameworks);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch compliance frameworks');
      }
    } catch (err) {
      console.error('Error fetching compliance frameworks:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch compliance frameworks');
      
      // Fallback to mock frameworks
      const mockFrameworks = [
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
          mandatory: true
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
          mandatory: false
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
          mandatory: false
        }
      ];
      setComplianceFrameworks(mockFrameworks);
      return { frameworks: mockFrameworks, summary: { total_frameworks: 3, compliant: 2, in_progress: 1 } };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVulnerabilities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get('/compliance-security/vulnerabilities');
      
      if (response.data.success) {
        setVulnerabilities(response.data.data.vulnerabilities);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch vulnerabilities');
      }
    } catch (err) {
      console.error('Error fetching vulnerabilities:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch vulnerabilities');
      
      // Fallback to mock vulnerabilities
      const mockVulnerabilities = [
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
        }
      ];
      setVulnerabilities(mockVulnerabilities);
      return { vulnerabilities: mockVulnerabilities, summary: { total: 1, open: 1 } };
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveSecurityEvent = useCallback(async (eventId, resolutionNote = '', actionTaken = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.put(`/compliance-security/events/${eventId}/resolve`, {
        resolution_note: resolutionNote,
        action_taken: actionTaken
      });
      
      if (response.data.success) {
        // Update local state
        setSecurityEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, resolved: true, resolved_at: new Date().toISOString() }
            : event
        ));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to resolve security event');
      }
    } catch (err) {
      console.error('Error resolving security event:', err);
      setError(err.response?.data?.message || err.message || 'Failed to resolve security event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleAudit = useCallback(async (frameworkId, auditType = 'internal', scheduledDate) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.post('/compliance-security/audit', {
        framework_id: frameworkId,
        audit_type: auditType,
        scheduled_date: scheduledDate
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to schedule audit');
      }
    } catch (err) {
      console.error('Error scheduling audit:', err);
      setError(err.response?.data?.message || err.message || 'Failed to schedule audit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (type = 'summary', format = 'json', timeRange = '30d') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/compliance-security/reports?type=${type}&format=${format}&timeRange=${timeRange}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAllData = useCallback(async (timeRange = '30d', eventFilters = {}) => {
    await Promise.all([
      fetchSecurityMetrics(timeRange),
      fetchSecurityEvents(eventFilters),
      fetchComplianceFrameworks(),
      fetchVulnerabilities()
    ]);
  }, [fetchSecurityMetrics, fetchSecurityEvents, fetchComplianceFrameworks, fetchVulnerabilities]);

  // Calculate derived metrics
  const getDerivedMetrics = useCallback(() => {
    return {
      eventSeverityDistribution: {
        low: securityEvents.filter(e => e.severity === 'low').length,
        medium: securityEvents.filter(e => e.severity === 'medium').length,
        high: securityEvents.filter(e => e.severity === 'high').length,
        critical: securityEvents.filter(e => e.severity === 'critical').length
      },
      eventStatusDistribution: {
        allowed: securityEvents.filter(e => e.status === 'allowed').length,
        blocked: securityEvents.filter(e => e.status === 'blocked').length,
        flagged: securityEvents.filter(e => e.status === 'flagged').length,
        approved: securityEvents.filter(e => e.status === 'approved').length,
        denied: securityEvents.filter(e => e.status === 'denied').length
      },
      complianceStatusDistribution: {
        compliant: complianceFrameworks.filter(f => f.status === 'compliant').length,
        in_progress: complianceFrameworks.filter(f => f.status === 'in_progress').length,
        non_compliant: complianceFrameworks.filter(f => f.status === 'non_compliant').length,
        not_applicable: complianceFrameworks.filter(f => f.status === 'not_applicable').length
      },
      vulnerabilityDistribution: {
        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length
      }
    };
  }, [securityEvents, complianceFrameworks, vulnerabilities]);

  return {
    // Data
    securityMetrics,
    securityEvents,
    complianceFrameworks,
    vulnerabilities,
    selectedEvent,
    
    // Derived metrics
    derivedMetrics: getDerivedMetrics(),
    
    // State
    loading,
    error,
    
    // Actions
    fetchSecurityMetrics,
    fetchSecurityEvents,
    fetchComplianceFrameworks,
    fetchVulnerabilities,
    resolveSecurityEvent,
    scheduleAudit,
    generateReport,
    refreshAllData,
    
    // Local state management
    setSelectedEvent
  };
};

export default useComplianceSecurity;
