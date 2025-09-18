import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity, 
  Key, 
  Globe, 
  Database, 
  Server,
  RefreshCw,
  Save,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  FileText,
  Settings
} from 'lucide-react';

const SecuritySettings = ({ isDarkMode = false }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Security Score and Metrics
  const [securityMetrics, setSecurityMetrics] = useState({
    overall_score: 94.5,
    last_scan: '2024-09-16 14:30:00',
    vulnerabilities: {
      critical: 0,
      high: 1,
      medium: 3,
      low: 7
    },
    compliance_status: {
      gdpr: 'compliant',
      soc2: 'compliant',
      iso27001: 'in_progress',
      ccpa: 'compliant',
      hipaa: 'not_applicable'
    }
  });

  // Security Events
  const [securityEvents, setSecurityEvents] = useState([
    { id: 1, type: 'login_attempt', severity: 'medium', user: 'admin@company.com', ip: '192.168.1.100', timestamp: '2024-09-16 14:25:00', status: 'blocked' },
    { id: 2, type: 'api_access', severity: 'low', user: 'api_user_123', ip: '10.0.0.50', timestamp: '2024-09-16 14:20:00', status: 'allowed' },
    { id: 3, type: 'data_export', severity: 'high', user: 'john.doe@company.com', ip: '192.168.1.105', timestamp: '2024-09-16 14:15:00', status: 'flagged' },
    { id: 4, type: 'password_change', severity: 'low', user: 'jane.smith@company.com', ip: '192.168.1.110', timestamp: '2024-09-16 14:10:00', status: 'completed' },
    { id: 5, type: 'privilege_escalation', severity: 'critical', user: 'system_admin', ip: '127.0.0.1', timestamp: '2024-09-16 14:05:00', status: 'investigated' }
  ]);

  // Access Control Settings
  const [accessControl, setAccessControl] = useState({
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
    }
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'User Login', user: 'admin@company.com', resource: 'Admin Dashboard', timestamp: '2024-09-16 14:30:00', ip: '192.168.1.100', result: 'Success' },
    { id: 2, action: 'Data Export', user: 'john.doe@company.com', resource: 'Customer Database', timestamp: '2024-09-16 14:25:00', ip: '192.168.1.105', result: 'Success' },
    { id: 3, action: 'Permission Change', user: 'admin@company.com', resource: 'User Management', timestamp: '2024-09-16 14:20:00', ip: '192.168.1.100', result: 'Success' },
    { id: 4, action: 'API Key Generation', user: 'system_admin', resource: 'API Management', timestamp: '2024-09-16 14:15:00', ip: '127.0.0.1', result: 'Success' },
    { id: 5, action: 'Failed Login', user: 'unknown@hacker.com', resource: 'Login Page', timestamp: '2024-09-16 14:10:00', ip: '203.0.113.1', result: 'Blocked' }
  ]);

  // Data Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    data_retention: {
      user_data: 365,
      log_data: 90,
      analytics_data: 730,
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
    }
  });

  const handleSaveChanges = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setHasChanges(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800';
      case 'high': return isDarkMode ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800';
      case 'medium': return isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800';
      case 'low': return isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800';
      default: return isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (status) => {
    switch (status) {
      case 'compliant': return isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800';
      case 'in_progress': return isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800';
      case 'not_applicable': return isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800';
      default: return isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'allowed': case 'completed': case 'Success': return isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800';
      case 'blocked': case 'Blocked': return isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800';
      case 'flagged': case 'investigated': return isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800';
      default: return isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Security Overview', icon: Shield },
    { id: 'access', name: 'Access Control', icon: Lock },
    { id: 'events', name: 'Security Events', icon: AlertTriangle },
    { id: 'audit', name: 'Audit Logs', icon: FileText },
    { id: 'privacy', name: 'Data Privacy', icon: Database }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Security Score */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Shield className="h-5 w-5 mr-2" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-green-600">{securityMetrics.overall_score}%</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Overall Security Score</div>
            </div>
            <div className="text-right">
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Last Scan</div>
              <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{securityMetrics.last_scan}</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${securityMetrics.overall_score}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Vulnerabilities */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Vulnerability Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(securityMetrics.vulnerabilities).map(([severity, count]) => (
              <div key={severity} className={`text-center p-4 border rounded-lg ${
                isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'
              }`}>
                <div className={`text-2xl font-bold ${
                  severity === 'critical' ? 'text-red-600' :
                  severity === 'high' ? 'text-orange-600' :
                  severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  {count}
                </div>
                <div className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{severity}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(securityMetrics.compliance_status).map(([framework, status]) => (
              <div key={framework} className={`text-center p-4 border rounded-lg ${
                isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'
              }`}>
                <div className={`font-medium uppercase mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{framework}</div>
                <Badge className={getComplianceColor(status)}>
                  {status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccessControl = () => (
    <div className="space-y-6">
      {/* Password Policy */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Key className="h-5 w-5 mr-2" />
            Password Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Minimum Length
              </label>
              <input
                type="number"
                value={accessControl.password_policy.min_length}
                onChange={(e) => {
                  setAccessControl(prev => ({
                    ...prev,
                    password_policy: { ...prev.password_policy, min_length: parseInt(e.target.value) }
                  }));
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password Expiry (days)
              </label>
              <input
                type="number"
                value={accessControl.password_policy.password_expiry}
                onChange={(e) => {
                  setAccessControl(prev => ({
                    ...prev,
                    password_policy: { ...prev.password_policy, password_expiry: parseInt(e.target.value) }
                  }));
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password History
              </label>
              <input
                type="number"
                value={accessControl.password_policy.password_history}
                onChange={(e) => {
                  setAccessControl(prev => ({
                    ...prev,
                    password_policy: { ...prev.password_policy, password_history: parseInt(e.target.value) }
                  }));
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[
              { key: 'require_uppercase', label: 'Require Uppercase Letters' },
              { key: 'require_lowercase', label: 'Require Lowercase Letters' },
              { key: 'require_numbers', label: 'Require Numbers' },
              { key: 'require_symbols', label: 'Require Symbols' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={key}
                  checked={accessControl.password_policy[key]}
                  onChange={(e) => {
                    setAccessControl(prev => ({
                      ...prev,
                      password_policy: { ...prev.password_policy, [key]: e.target.checked }
                    }));
                    setHasChanges(true);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={key} className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Shield className="h-5 w-5 mr-2" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: 'enabled', label: 'Enable Two-Factor Authentication' },
              { key: 'required_for_admin', label: 'Required for Admin Users' },
              { key: 'backup_codes', label: 'Enable Backup Codes' },
              { key: 'sms_enabled', label: 'SMS Authentication' },
              { key: 'app_enabled', label: 'Authenticator App' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={key}
                  checked={accessControl.two_factor_auth[key]}
                  onChange={(e) => {
                    setAccessControl(prev => ({
                      ...prev,
                      two_factor_auth: { ...prev.two_factor_auth, [key]: e.target.checked }
                    }));
                    setHasChanges(true);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={key} className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Clock className="h-5 w-5 mr-2" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={accessControl.session_management.session_timeout}
                onChange={(e) => {
                  setAccessControl(prev => ({
                    ...prev,
                    session_management: { ...prev.session_management, session_timeout: parseInt(e.target.value) }
                  }));
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Concurrent Sessions
              </label>
              <input
                type="number"
                value={accessControl.session_management.concurrent_sessions}
                onChange={(e) => {
                  setAccessControl(prev => ({
                    ...prev,
                    session_management: { ...prev.session_management, concurrent_sessions: parseInt(e.target.value) }
                  }));
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idle Timeout (minutes)
              </label>
              <input
                type="number"
                value={accessControl.session_management.idle_timeout}
                onChange={(e) => {
                  setAccessControl(prev => ({
                    ...prev,
                    session_management: { ...prev.session_management, idle_timeout: parseInt(e.target.value) }
                  }));
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurityEvents = () => (
    <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <AlertTriangle className="h-5 w-5 mr-2" />
            Recent Security Events
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {securityEvents.map((event) => (
            <div key={event.id} className={`flex items-center justify-between p-4 border rounded-lg ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-4">
                <Badge className={getSeverityColor(event.severity)}>
                  {event.severity}
                </Badge>
                <div>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{event.type.replace('_', ' ')}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    User: {event.user} | IP: {event.ip}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
                <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{event.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderAuditLogs = () => (
    <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <FileText className="h-5 w-5 mr-2" />
            Audit Logs
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Action</th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User</th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resource</th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>IP Address</th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Timestamp</th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Result</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{log.action}</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{log.user}</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{log.resource}</td>
                  <td className={`py-3 px-4 font-mono text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{log.ip}</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{log.timestamp}</td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(log.result)}>
                      {log.result}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderDataPrivacy = () => (
    <div className="space-y-6">
      {/* Data Retention */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Database className="h-5 w-5 mr-2" />
            Data Retention Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(privacySettings.data_retention).map(([type, days]) => (
              <div key={type}>
                <label className={`block text-sm font-medium mb-2 capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {type.replace('_', ' ')} (days)
                </label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => {
                    setPrivacySettings(prev => ({
                      ...prev,
                      data_retention: { ...prev.data_retention, [type]: parseInt(e.target.value) }
                    }));
                    setHasChanges(true);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Encryption Settings */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Lock className="h-5 w-5 mr-2" />
            Encryption Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Encryption Algorithm
              </label>
              <select
                value={privacySettings.encryption.encryption_algorithm}
                onChange={(e) => {
                  setPrivacySettings(prev => ({
                    ...prev,
                    encryption: { ...prev.encryption, encryption_algorithm: e.target.value }
                  }));
                  setHasChanges(true);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="AES-256">AES-256</option>
                <option value="AES-128">AES-128</option>
                <option value="ChaCha20">ChaCha20</option>
              </select>
            </div>
            <div className="space-y-3">
              {[
                { key: 'data_at_rest', label: 'Encrypt Data at Rest' },
                { key: 'data_in_transit', label: 'Encrypt Data in Transit' },
                { key: 'key_rotation', label: 'Enable Key Rotation' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={key}
                    checked={privacySettings.encryption[key]}
                    onChange={(e) => {
                      setPrivacySettings(prev => ({
                        ...prev,
                        encryption: { ...prev.encryption, [key]: e.target.checked }
                      }));
                      setHasChanges(true);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={key} className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Anonymization */}
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Eye className="h-5 w-5 mr-2" />
            Data Anonymization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Auto-Anonymize After (days)
              </label>
              <input
                type="number"
                value={privacySettings.anonymization.anonymize_after_days}
                onChange={(e) => {
                  setPrivacySettings(prev => ({
                    ...prev,
                    anonymization: { ...prev.anonymization, anonymize_after_days: parseInt(e.target.value) }
                  }));
                  setHasChanges(true);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
            <div className="space-y-3">
              {[
                { key: 'auto_anonymize', label: 'Enable Auto-Anonymization' },
                { key: 'pseudonymization', label: 'Enable Pseudonymization' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={key}
                    checked={privacySettings.anonymization[key]}
                    onChange={(e) => {
                      setPrivacySettings(prev => ({
                        ...prev,
                        anonymization: { ...prev.anonymization, [key]: e.target.checked }
                      }));
                      setHasChanges(true);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={key} className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'access': return renderAccessControl();
      case 'events': return renderSecurityEvents();
      case 'audit': return renderAuditLogs();
      case 'privacy': return renderDataPrivacy();
      default: return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Security Settings</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage security policies, access control, and compliance</p>
        </div>
        <Button 
          onClick={handleSaveChanges}
          disabled={!hasChanges || isLoading}
          className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          {isLoading ? (
            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> Save Changes</>
          )}
        </Button>
      </div>

      {/* Security Tabs */}
      <div className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderContent()}
    </div>
  );
};

export default SecuritySettings;

