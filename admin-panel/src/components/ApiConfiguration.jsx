import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Import API hooks
import { 
  useApiKeys,
  useApiEndpoints,
  useRateLimits,
  useAuthSettings,
  useWebhookSettings,
  useCreateApiKey,
  useUpdateApiKey,
  useDeleteApiKey,
  useUpdateRateLimits,
  useUpdateAuthSettings,
  useUpdateWebhookSettings
} from '../hooks/useApiConfiguration.js';
import Modal from './ui/Modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Key, 
  Shield, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Edit,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  Save
} from 'lucide-react';

const ApiConfiguration = ({ isDarkMode = false }) => {
  const [showApiKeys, setShowApiKeys] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const openModal = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // API Rate Limits Configuration
  const [rateLimits, setRateLimits] = useState({
    free_tier: { requests_per_minute: 60, requests_per_day: 1000, burst_limit: 10 },
    pro_tier: { requests_per_minute: 300, requests_per_day: 10000, burst_limit: 50 },
    premium_tier: { requests_per_minute: 1000, requests_per_day: 50000, burst_limit: 200 },
    enterprise_tier: { requests_per_minute: 5000, requests_per_day: 250000, burst_limit: 1000 }
  });

  // API Authentication Settings
  const [authSettings, setAuthSettings] = useState({
    jwt_expiry: 3600,
    refresh_token_expiry: 604800,
    max_login_attempts: 5,
    lockout_duration: 900,
    require_2fa: false,
    api_key_rotation: true,
    session_timeout: 1800
  });

  // Real API integration using backend routes
  const { 
    data: apiKeys, 
    isLoading: apiKeysLoading, 
    error: apiKeysError,
    refetch: refetchApiKeys 
  } = useApiKeys();

  // Webhook Configuration
  const [webhookSettings, setWebhookSettings] = useState({
    timeout: 30,
    retry_attempts: 3,
    retry_delay: 5,
    max_payload_size: 1024,
    signature_verification: true,
    rate_limit: 100
  });

  // Real API integration for endpoints status
  const { 
    data: endpoints, 
    isLoading: endpointsLoading, 
    error: endpointsError,
    refetch: refetchEndpoints 
  } = useApiEndpoints();

  const toggleApiKeyVisibility = (keyId) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleAction = (action, keyId) => {
    const key = (apiKeys || []).find(k => k.id === keyId);
    switch (action) {
      case 'generate':
        openModal(<div>Generate a new API key.</div>);
        break;
      case 'edit':
        openModal(<div>Edit API key: {key.name}</div>);
        break;
      case 'delete':
        openModal(
          <div>
            <p>Are you sure you want to delete the API key \"{key.name}\"?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setIsModalOpen(false)} className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isDarkMode 
                  ? 'text-gray-300 bg-slate-700 border border-slate-600 hover:bg-slate-600' 
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}>Cancel</button>
              <button onClick={() => { console.log('Deleting key:', key.id); setIsModalOpen(false); }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Delete</button>
            </div>
          </div>
        );
        break;
      default:
        break;
    }
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setHasChanges(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800';
      case 'warning': return isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800';
      case 'error': return isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800';
      case 'active': return isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800';
      case 'inactive': return isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800';
      default: return isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="API Key Action">
        {modalContent}
      </Modal>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>API Configuration</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage API settings, rate limits, and authentication</p>
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

        {/* API Rate Limits */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Activity className="h-5 w-5 mr-2" />
              Rate Limits Configuration
            </CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Configure API rate limits for different subscription tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(rateLimits).map(([tier, limits]) => (
                <Card key={tier} className={`border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-sm capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tier.replace('_', ' ')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Requests/Minute
                      </label>
                      <input
                        type="number"
                        value={limits.requests_per_minute}
                        onChange={(e) => {
                          setRateLimits(prev => ({
                            ...prev,
                            [tier]: { ...prev[tier], requests_per_minute: parseInt(e.target.value) }
                          }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'border-slate-600 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Requests/Day
                      </label>
                      <input
                        type="number"
                        value={limits.requests_per_day}
                        onChange={(e) => {
                          setRateLimits(prev => ({
                            ...prev,
                            [tier]: { ...prev[tier], requests_per_day: parseInt(e.target.value) }
                          }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'border-slate-600 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Burst Limit
                      </label>
                      <input
                        type="number"
                        value={limits.burst_limit}
                        onChange={(e) => {
                          setRateLimits(prev => ({
                            ...prev,
                            [tier]: { ...prev[tier], burst_limit: parseInt(e.target.value) }
                          }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'border-slate-600 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Keys Management */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Key className="h-5 w-5 mr-2" />
                  API Keys Management
                </CardTitle>
                <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Manage and monitor API keys for your applications</CardDescription>
              </div>
              <Button size="sm" onClick={() => handleAction('generate')}>
                <Plus className="h-4 w-4 mr-2" />
                Generate New Key
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(apiKeys || []).map((apiKey) => (
                <div key={apiKey.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{apiKey.name}</h4>
                      <Badge className={getStatusColor(apiKey.status)}>
                        {apiKey.status}
                      </Badge>
                    </div>
                    <div className={`mt-2 flex items-center space-x-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span>Created: {apiKey.created}</span>
                      <span>Last used: {apiKey.last_used}</span>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <code className={`px-2 py-1 rounded text-sm font-mono ${
                        isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-900'
                      }`}>
                        {showApiKeys[apiKey.id] ? apiKey.key : `${apiKey.key.substring(0, 12)}...`}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleApiKeyVisibility(apiKey.id)}
                      >
                        {showApiKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleAction('edit', apiKey.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleAction('delete', apiKey.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Authentication Settings */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Shield className="h-5 w-5 mr-2" />
              Authentication Settings
            </CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Configure API authentication and security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  JWT Token Expiry (seconds)
                </label>
                <input
                  type="number"
                  value={authSettings.jwt_expiry}
                  onChange={(e) => {
                    setAuthSettings(prev => ({ ...prev, jwt_expiry: parseInt(e.target.value) }));
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Refresh Token Expiry (seconds)
                </label>
                <input
                  type="number"
                  value={authSettings.refresh_token_expiry}
                  onChange={(e) => {
                    setAuthSettings(prev => ({ ...prev, refresh_token_expiry: parseInt(e.target.value) }));
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={authSettings.max_login_attempts}
                  onChange={(e) => {
                    setAuthSettings(prev => ({ ...prev, max_login_attempts: parseInt(e.target.value) }));
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Lockout Duration (seconds)
                </label>
                <input
                  type="number"
                  value={authSettings.lockout_duration}
                  onChange={(e) => {
                    setAuthSettings(prev => ({ ...prev, lockout_duration: parseInt(e.target.value) }));
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Session Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={authSettings.session_timeout}
                  onChange={(e) => {
                    setAuthSettings(prev => ({ ...prev, session_timeout: parseInt(e.target.value) }));
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="require_2fa"
                  checked={authSettings.require_2fa}
                  onChange={(e) => {
                    setAuthSettings(prev => ({ ...prev, require_2fa: e.target.checked }));
                    setHasChanges(true);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="require_2fa" className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Require 2FA for API Access
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints Status */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Globe className="h-5 w-5 mr-2" />
              API Endpoints Status
            </CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Monitor the health and performance of your API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(endpoints || []).map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(endpoint.status)}
                      <Badge className={getStatusColor(endpoint.status)}>
                        {endpoint.status}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono">{endpoint.path}</code>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-6 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="text-center">
                      <div className="font-medium">{endpoint.response_time}ms</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg. Response</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{endpoint.success_rate}%</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Success Rate</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ApiConfiguration;


