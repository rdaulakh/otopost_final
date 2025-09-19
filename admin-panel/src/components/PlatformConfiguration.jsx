
import React, { useState, useEffect } from 'react';
import TeamManagement from './TeamManagement';
import FeatureFlags from './FeatureFlags';
import Integrations from './Integrations';
import ApiConfiguration from './ApiConfiguration';
import SecuritySettings from './SecuritySettings';
import WhiteLabelSettings from './WhiteLabelSettings';
import { motion } from 'framer-motion'

// Import platform configuration hooks
import { 
  usePlatformSettings,
  useAIAgentConfigs,
  useSystemSettings,
  useAPIConfigurations,
  useFeatureFlags,
  useIntegrationSettings,
  useUpdatePlatformSettings,
  useUpdateAIAgentConfig,
  useUpdateSystemSettings
} from '../hooks/usePlatformConfiguration.js'
import { 
  Settings, 
  Zap, 
  Globe, 
  Shield, 
  Key,
  Database,
  Server,
  Monitor,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Lock,
  Unlock,
  Edit,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Upload,
  Download,
  Code,
  Palette,
  Bell,
  Mail,
  Smartphone,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Activity,
  BarChart3,
  Target,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

const PlatformConfiguration = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  const [activeTab, setActiveTab] = useState('ai_agents')
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState({})

  // AI Agent Configuration
  const [aiAgentConfig, setAiAgentConfig] = useState({
    intelligence_agent: {
      enabled: true,
      performance_mode: 'balanced',
      max_concurrent_tasks: 5,
      timeout: 300,
      retry_attempts: 3,
      learning_rate: 0.85,
      confidence_threshold: 0.75
    },
    strategy_agent: {
      enabled: true,
      performance_mode: 'optimized',
      max_concurrent_tasks: 3,
      timeout: 600,
      retry_attempts: 2,
      learning_rate: 0.90,
      confidence_threshold: 0.80
    },
    content_agent: {
      enabled: true,
      performance_mode: 'creative',
      max_concurrent_tasks: 8,
      timeout: 900,
      retry_attempts: 3,
      learning_rate: 0.75,
      confidence_threshold: 0.70
    },
    execution_agent: {
      enabled: true,
      performance_mode: 'fast',
      max_concurrent_tasks: 10,
      timeout: 120,
      retry_attempts: 5,
      learning_rate: 0.95,
      confidence_threshold: 0.85
    },
    learning_agent: {
      enabled: true,
      performance_mode: 'analytical',
      max_concurrent_tasks: 2,
      timeout: 1200,
      retry_attempts: 2,
      learning_rate: 0.88,
      confidence_threshold: 0.82
    },
    engagement_agent: {
      enabled: true,
      performance_mode: 'responsive',
      max_concurrent_tasks: 15,
      timeout: 180,
      retry_attempts: 4,
      learning_rate: 0.80,
      confidence_threshold: 0.75
    },
    analytics_agent: {
      enabled: true,
      performance_mode: 'precise',
      max_concurrent_tasks: 4,
      timeout: 450,
      retry_attempts: 2,
      learning_rate: 0.92,
      confidence_threshold: 0.88
    }
  })

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    maintenance_mode: false,
    debug_mode: false,
    auto_scaling: true,
    load_balancing: true,
    cdn_enabled: true,
    cache_enabled: true,
    compression_enabled: true,
    ssl_enforcement: true,
    rate_limiting: true,
    api_versioning: true,
    webhook_retries: 3,
    session_timeout: 3600,
    max_file_size: 50,
    allowed_file_types: ['jpg', 'png', 'gif', 'mp4', 'pdf'],
    backup_frequency: 'daily',
    log_retention: 30
  })

  // API Configuration
  const [apiConfig, setApiConfig] = useState({
    rate_limits: {
      free_tier: { requests_per_minute: 60, requests_per_day: 1000 },
      pro_tier: { requests_per_minute: 300, requests_per_day: 10000 },
      premium_tier: { requests_per_minute: 1000, requests_per_day: 50000 }
    },
    authentication: {
      jwt_expiry: 3600,
      refresh_token_expiry: 604800,
      max_login_attempts: 5,
      lockout_duration: 900,
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_symbols: true
      }
    },
    webhooks: {
      timeout: 30,
      retry_attempts: 3,
      retry_delay: 5,
      max_payload_size: 1024
    }
  })

  // Feature Flags
  const [featureFlags, setFeatureFlags] = useState({
    ai_content_generation: { enabled: true, rollout_percentage: 100 },
    advanced_analytics: { enabled: true, rollout_percentage: 100 },
    multi_platform_posting: { enabled: true, rollout_percentage: 100 },
    automated_scheduling: { enabled: true, rollout_percentage: 100 },
    sentiment_analysis: { enabled: true, rollout_percentage: 85 },
    competitor_tracking: { enabled: false, rollout_percentage: 0 },
    white_label_branding: { enabled: true, rollout_percentage: 50 },
    api_access: { enabled: true, rollout_percentage: 100 },
    webhook_integration: { enabled: true, rollout_percentage: 75 },
    custom_domains: { enabled: false, rollout_percentage: 0 }
  })

  // Integration Settings
  const [integrationSettings, setIntegrationSettings] = useState({
    social_platforms: {
      instagram: { enabled: true, api_key: 'ig_***************', status: 'connected' },
      facebook: { enabled: true, api_key: 'fb_***************', status: 'connected' },
      linkedin: { enabled: true, api_key: 'li_***************', status: 'connected' },
      twitter: { enabled: true, api_key: 'tw_***************', status: 'connected' },
      tiktok: { enabled: true, api_key: 'tt_***************', status: 'connected' },
      youtube: { enabled: true, api_key: 'yt_***************', status: 'connected' }
    },
    third_party_services: {
      openai: { enabled: true, api_key: 'sk-***************', status: 'connected' },
      anthropic: { enabled: true, api_key: 'ant_***************', status: 'connected' },
      google_analytics: { enabled: true, api_key: 'ga_***************', status: 'connected' },
      stripe: { enabled: true, api_key: 'sk_***************', status: 'connected' },
      sendgrid: { enabled: true, api_key: 'sg_***************', status: 'connected' },
      aws_s3: { enabled: true, api_key: 'aws_***************', status: 'connected' }
    }
  })



  const handleSaveChanges = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setHasChanges(false)
  }

  const handleResetToDefaults = () => {
    // Reset configurations to default values
    setHasChanges(true)
  }

  const toggleApiKeyVisibility = (service) => {
    setShowApiKeys(prev => ({
      ...prev,
      [service]: !prev[service]
    }))
  }

  const renderAiAgentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Agent Configuration</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Configure performance and behavior of all 7 AI agents</p>
        </div>
        <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset All
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(aiAgentConfig).map(([agentKey, config]) => (
          <Card key={agentKey} className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={`capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {agentKey.replace('_', ' ')}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={config.enabled ? 
                    (isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800') : 
                    (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800')
                  }>
                    {config.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <button
                    onClick={() => {
                      setAiAgentConfig(prev => ({
                        ...prev,
                        [agentKey]: { ...prev[agentKey], enabled: !prev[agentKey].enabled }
                      }))
                      setHasChanges(true)
                    }}
                    className="cursor-pointer"
                  >
                    {config.enabled ? 
                      <ToggleRight className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} /> : 
                      <ToggleLeft className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    }
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Performance Mode
                </label>
                <select
                  value={config.performance_mode}
                  onChange={(e) => {
                    setAiAgentConfig(prev => ({
                      ...prev,
                      [agentKey]: { ...prev[agentKey], performance_mode: e.target.value }
                    }))
                    setHasChanges(true)
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                    isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  {performanceModes.map(mode => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label} - {mode.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                    Max Concurrent Tasks
                  </label>
                  <input
                    type="number"
                    value={config.max_concurrent_tasks}
                    onChange={(e) => {
                      setAiAgentConfig(prev => ({
                        ...prev,
                        [agentKey]: { ...prev[agentKey], max_concurrent_tasks: parseInt(e.target.value) }
                      }))
                      setHasChanges(true)
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                    Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={config.timeout}
                    onChange={(e) => {
                      setAiAgentConfig(prev => ({
                        ...prev,
                        [agentKey]: { ...prev[agentKey], timeout: parseInt(e.target.value) }
                      }))
                      setHasChanges(true)
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    min="30"
                    max="1800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                    Learning Rate
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={config.learning_rate}
                      onChange={(e) => {
                        setAiAgentConfig(prev => ({
                          ...prev,
                          [agentKey]: { ...prev[agentKey], learning_rate: parseFloat(e.target.value) }
                        }))
                        setHasChanges(true)
                      }}
                      className="flex-1"
                    />
                    <span className={`text-sm font-medium w-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {config.learning_rate}
                    </span>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                    Confidence Threshold
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={config.confidence_threshold}
                      onChange={(e) => {
                        setAiAgentConfig(prev => ({
                          ...prev,
                          [agentKey]: { ...prev[agentKey], confidence_threshold: parseFloat(e.target.value) }
                        }))
                        setHasChanges(true)
                      }}
                      className="flex-1"
                    />
                    <span className={`text-sm font-medium w-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {config.confidence_threshold}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Configuration</h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Core system settings and performance options</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(systemSettings).map(([key, value]) => (
          <Card key={key} className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {key.replace(/_/g, ' ')}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {typeof value === 'boolean' ? 
                      (value ? 'Enabled' : 'Disabled') : 
                      `Current: ${value}`
                    }
                  </p>
                </div>
                {typeof value === 'boolean' ? (
                  <button
                    onClick={() => {
                      setSystemSettings(prev => ({ ...prev, [key]: !prev[key] }))
                      setHasChanges(true)
                    }}
                    className="cursor-pointer"
                  >
                    {value ? 
                      <ToggleRight className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} /> : 
                      <ToggleLeft className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    }
                  </button>
                ) : (
                  <Button variant="ghost" size="sm" className={isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : ''}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderFeaturesTab = () => <FeatureFlags />;
  const renderIntegrationsTab = () => <Integrations />;
  const renderTeamTab = () => <TeamManagement />;

  const renderContent = () => {
    switch (activeTab) {
      case 'ai_agents':
        return renderAiAgentsTab();
      case 'system':
        return renderSystemTab();
      case 'api':
        return <ApiConfiguration isDarkMode={isDarkMode} />;
      case 'team':
        return <TeamManagement isDarkMode={isDarkMode} />;
      case 'features':
        return <FeatureFlags isDarkMode={isDarkMode} />;
      case 'integrations':
        return <Integrations isDarkMode={isDarkMode} />;
      case 'security':
        return <SecuritySettings isDarkMode={isDarkMode} />;
      case 'branding':
        return <WhiteLabelSettings isDarkMode={isDarkMode} />;
      default:
        return renderAiAgentsTab();
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Platform Configuration</h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage your entire platform from a single interface</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline"
              onClick={handleResetToDefaults}
              disabled={!hasChanges || isLoading}
              className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
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
        </div>

        <div className="flex space-x-8">
          <aside className="w-1/4">
            <div className="sticky top-8 space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-slate-700' 
                        : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </aside>

          <main className="w-3/4">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default PlatformConfiguration


