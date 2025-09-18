import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Building, 
  Phone, 
  MapPin, 
  Calendar,
  Camera,
  Edit3,
  Save,
  X,
  Shield,
  Bell,
  CreditCard,
  Key,
  Globe,
  Smartphone,
  Monitor,
  Settings as SettingsIcon,
  Crown,
  CheckCircle,
  AlertCircle,
  Trash2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Brain,
  Zap,
  Target,
  BarChart3,
  Clock,
  Palette,
  Users,
  TrendingUp,
  MessageSquare,
  FileText,
  Briefcase,
  Award,
  Star,
  Lightbulb,
  Cpu,
  Activity,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Info,
  HelpCircle
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
// Import API hooks and UX components
import { 
  useUserProfile,
  useUpdateProfile,
  useUserSettings,
  useUpdateSettings,
  useSocialProfiles,
  useConnectSocialProfile,
  useDisconnectSocialProfile,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useSubscriptionInfo,
  useUpdateSubscription
} from '../hooks/useApi.js'
import { useNotifications } from './NotificationSystem.jsx'
import { TableSkeleton } from './LoadingSkeletons.jsx'


const Settings = ({ data = {}, user = {}, onDataUpdate = () => {} }) => {
  const { isDarkMode } = useTheme()
  
  // UX hooks
  const { success, error, info } = useNotifications()

  // Component state
  const [activeTab, setActiveTab] = useState('business')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  // Real API calls for settings data
  const { 
    data: userProfileData, 
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile 
  } = useUserProfile()
  
  const { 
    data: userSettingsData, 
    isLoading: settingsLoading 
  } = useUserSettings()
  
  const { 
    data: socialProfilesData, 
    isLoading: socialProfilesLoading 
  } = useSocialProfiles()
  
  const { 
    data: notificationSettingsData, 
    isLoading: notificationSettingsLoading 
  } = useNotificationSettings()
  
  const { 
    data: subscriptionData, 
    isLoading: subscriptionLoading 
  } = useSubscriptionInfo()
  
  const { 
    mutate: updateProfile,
    isLoading: isUpdatingProfile 
  } = useUpdateProfile()
  
  const { 
    mutate: updateSettings,
    isLoading: isUpdatingSettings 
  } = useUpdateSettings()
  
  const { 
    mutate: connectSocialProfile,
    isLoading: isConnectingSocial 
  } = useConnectSocialProfile()
  
  const { 
    mutate: disconnectSocialProfile,
    isLoading: isDisconnectingSocial 
  } = useDisconnectSocialProfile()
  
  const { 
    mutate: updateNotificationSettings,
    isLoading: isUpdatingNotifications 
  } = useUpdateNotificationSettings()
  
  const { 
    mutate: updateSubscription,
    isLoading: isUpdatingSubscription 
  } = useUpdateSubscription()

  // Loading state
  const isLoading = profileLoading || settingsLoading || socialProfilesLoading || notificationSettingsLoading || subscriptionLoading

  // Error handling
  const hasError = profileError

  // Use real API data only - no mock fallbacks
  const businessProfile = userProfileData?.businessProfile || {
    companyName: '',
    industry: '',
    businessType: '',
    companySize: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    founded: '',
    description: '',
    targetAudience: '',
    businessObjectives: [],
    geographicReach: '',
    brandVoice: '',
    contentStyle: '',
    postingFrequency: '',
    primaryGoals: []
  }

  const [businessProfileState, setBusinessProfile] = useState(businessProfile)

  // AI Preferences from API - no mock fallbacks
  const aiPreferences = userSettingsData?.aiPreferences || {
    creativityLevel: 'Balanced',
    contentTone: 'Professional',
    autoApproval: false,
    autoScheduling: false,
    aiSuggestions: false,
    learningMode: false,
    contentTypes: {
      text: false,
      images: false,
      videos: false,
      stories: false,
      reels: false
    },
    platforms: {
      instagram: false,
      facebook: false,
      linkedin: false,
      twitter: false,
      tiktok: false
    },
    optimization: {
      bestTimes: false,
      hashtags: false,
      captions: false,
      engagement: false
    },
    notifications: {
      contentReady: false,
      performanceAlerts: false,
      weeklyReports: false,
      monthlyInsights: false
    },
    dataRetention: '1 month',
    privacyLevel: 'Standard',
    apiAccess: false
  }

  const [aiPreferencesState, setAiPreferences] = useState(aiPreferences)

  // Social profiles from API
  const socialProfiles = socialProfilesData?.profiles || []
  
  // Notification settings from API - no mock fallbacks
  const notificationSettings = notificationSettingsData || {
    email: false,
    push: false,
    sms: false,
    contentReady: false,
    performanceAlerts: false,
    weeklyReports: false,
    monthlyInsights: false
  }

  const [notificationSettingsState, setNotificationSettings] = useState(notificationSettings)

  // Subscription info from API - no mock fallbacks
  const subscriptionInfo = subscriptionData || {
    plan: 'Free',
    status: 'inactive',
    billingCycle: 'monthly',
    nextBilling: null,
    usage: {
      posts: 0,
      limit: 10
    }
  }

  const [brandColors, setBrandColors] = useState(userSettingsData?.brandColors || {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    background: '#F8FAFC',
    text: '#1F2937'
  })

  const colorPresets = [
    { name: 'Ocean Blue', colors: { primary: '#0EA5E9', secondary: '#3B82F6', accent: '#06B6D4' } },
    { name: 'Forest Green', colors: { primary: '#059669', secondary: '#10B981', accent: '#34D399' } },
    { name: 'Sunset Orange', colors: { primary: '#EA580C', secondary: '#F97316', accent: '#FB923C' } },
    { name: 'Royal Purple', colors: { primary: '#7C3AED', secondary: '#8B5CF6', accent: '#A78BFA' } }
  ]

  // Handle settings operations
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      info('Saving business profile...')
      await updateProfile({ businessProfile: businessProfileState })
      success('Business profile saved successfully!')
      setSaveStatus('success')
      await refetchProfile()
    } catch (err) {
      error('Failed to save business profile')
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      info('Saving AI preferences...')
      await updateSettings({ 
        aiPreferences: aiPreferencesState,
        brandColors 
      })
      success('Settings saved successfully!')
      setSaveStatus('success')
    } catch (err) {
      error('Failed to save settings')
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConnectSocial = async (platform) => {
    try {
      info(`Connecting ${platform}...`)
      await connectSocialProfile({ platform })
      success(`${platform} connected successfully!`)
    } catch (err) {
      error(`Failed to connect ${platform}`)
    }
  }

  const handleDisconnectSocial = async (profileId) => {
    try {
      await disconnectSocialProfile(profileId)
      success('Social profile disconnected successfully!')
    } catch (err) {
      error('Failed to disconnect social profile')
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setIsSaving(true)
      info('Saving notification settings...')
      await updateNotificationSettings(notificationSettingsState)
      success('Notification settings saved successfully!')
      setSaveStatus('success')
    } catch (err) {
      error('Failed to save notification settings')
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRefresh = async () => {
    try {
      await refetchProfile()
      success('Settings refreshed successfully')
    } catch (err) {
      error('Failed to refresh settings')
    }
  }

  // Show loading skeleton
  if (isLoading && !businessProfile && !aiPreferences) {
    return <TableSkeleton />
  }

  // Show error state
  if (hasError && !businessProfile && !aiPreferences) {
    return (
      <div className="p-6">
        <div className="border border-red-200 bg-red-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading settings. Please try refreshing.</span>
          </div>
          <button 
            onClick={handleRefresh} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Retry'}
          </button>
        </div>
      </div>
    )
  }

  // Enhanced Business Profile Tab
  const renderBusinessProfileTab = () => (
    <div className="space-y-8">
      {/* Company Information */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-blue-600" />
            Company Information
          </CardTitle>
          <CardDescription>
            Basic information about your business and organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Name *</label>
              <input
                type="text"
                value={businessProfile.companyName}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Industry *</label>
              <select 
                value={businessProfile.industry}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option>Technology</option>
                <option>Healthcare</option>
                <option>Finance</option>
                <option>Education</option>
                <option>Retail</option>
                <option>Manufacturing</option>
                <option>Real Estate</option>
                <option>Food & Beverage</option>
                <option>Entertainment</option>
                <option>Non-profit</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Type</label>
              <select 
                value={businessProfile.businessType}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessType: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option>B2B</option>
                <option>B2C</option>
                <option>B2B2C</option>
                <option>Non-profit</option>
                <option>Government</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Size</label>
              <select 
                value={businessProfile.companySize}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, companySize: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option>1-10 employees</option>
                <option>11-50 employees</option>
                <option>51-200 employees</option>
                <option>201-1000 employees</option>
                <option>1000+ employees</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Website</label>
              <input
                type="url"
                value={businessProfile.website}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Founded Year</label>
              <input
                type="text"
                value={businessProfile.founded}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, founded: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Description</label>
            <textarea
              rows={4}
              value={businessProfile.description}
              onChange={(e) => setBusinessProfile(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="h-5 w-5 mr-2 text-green-600" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Contact details for your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Email</label>
              <input
                type="email"
                value={businessProfile.email}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={businessProfile.phone}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Address</label>
            <input
              type="text"
              value={businessProfile.address}
              onChange={(e) => setBusinessProfile(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Marketing Strategy */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            Marketing Strategy
          </CardTitle>
          <CardDescription>
            Define your social media marketing approach and objectives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Brand Voice</label>
              <select 
                value={businessProfile.brandVoice}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, brandVoice: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option>Professional</option>
                <option>Friendly</option>
                <option>Casual</option>
                <option>Authoritative</option>
                <option>Playful</option>
                <option>Inspirational</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content Style</label>
              <select 
                value={businessProfile.contentStyle}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, contentStyle: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option>Educational</option>
                <option>Promotional</option>
                <option>Inspirational</option>
                <option>Entertainment</option>
                <option>News & Updates</option>
                <option>Behind the Scenes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Posting Frequency</label>
              <select 
                value={businessProfile.postingFrequency}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, postingFrequency: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option>Multiple times daily</option>
                <option>Daily</option>
                <option>Every other day</option>
                <option>3-4 times per week</option>
                <option>Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Geographic Reach</label>
              <select 
                value={businessProfile.geographicReach}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, geographicReach: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option>Local</option>
                <option>Regional</option>
                <option>National</option>
                <option>International</option>
                <option>Global</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Audience</label>
            <textarea
              rows={3}
              value={businessProfile.targetAudience}
              onChange={(e) => setBusinessProfile(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="Describe your ideal customer demographics, interests, and behaviors..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Business Objectives</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Brand Awareness', 'Lead Generation', 'Customer Engagement', 'Sales Growth', 'Customer Support', 'Market Research', 'Community Building', 'Thought Leadership'].map((objective) => (
                <label key={objective} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={businessProfileState.businessObjectives.includes(objective)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBusinessProfile(prev => ({ 
                          ...prev, 
                          businessObjectives: [...prev.businessObjectives, objective] 
                        }))
                      } else {
                        setBusinessProfile(prev => ({ 
                          ...prev, 
                          businessObjectives: prev.businessObjectives.filter(obj => obj !== objective) 
                        }))
                      }
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{objective}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Enhanced AI Preferences Tab
  const renderAIPreferencesTab = () => (
    <div className="space-y-8">
      {/* Content Generation Settings */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-indigo-600" />
            Content Generation
          </CardTitle>
          <CardDescription>
            Configure how AI generates and optimizes your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">AI Creativity Level</label>
              <select 
                value={aiPreferencesState.creativityLevel}
                onChange={(e) => setAiPreferences(prev => ({ ...prev, creativityLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option>Conservative</option>
                <option>Balanced</option>
                <option>Creative</option>
                <option>Experimental</option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">How creative should AI be when generating content</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content Tone</label>
              <select 
                value={aiPreferences.contentTone}
                onChange={(e) => setAiPreferences(prev => ({ ...prev, contentTone: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option>Professional</option>
                <option>Casual</option>
                <option>Friendly</option>
                <option>Authoritative</option>
                <option>Humorous</option>
                <option>Inspirational</option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Default tone for AI-generated content</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Auto-approve AI Content</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Automatically approve high-confidence AI generated content</p>
              </div>
              <button
                onClick={() => setAiPreferences(prev => ({ ...prev, autoApproval: !prev.autoApproval }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  aiPreferences.autoApproval ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiPreferences.autoApproval ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Auto-scheduling</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Let AI automatically schedule approved content at optimal times</p>
              </div>
              <button
                onClick={() => setAiPreferences(prev => ({ ...prev, autoScheduling: !prev.autoScheduling }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  aiPreferences.autoScheduling ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiPreferences.autoScheduling ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">AI Suggestions</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Receive AI-powered suggestions for content improvement</p>
              </div>
              <button
                onClick={() => setAiPreferences(prev => ({ ...prev, aiSuggestions: !prev.aiSuggestions }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  aiPreferences.aiSuggestions ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiPreferences.aiSuggestions ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Learning Mode</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Allow AI to learn from your content preferences and performance</p>
              </div>
              <button
                onClick={() => setAiPreferences(prev => ({ ...prev, learningMode: !prev.learningMode }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  aiPreferences.learningMode ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiPreferences.learningMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Types */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-600" />
            Content Types
          </CardTitle>
          <CardDescription>
            Select which types of content AI should generate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(aiPreferences.contentTypes).map(([type, enabled]) => (
              <div key={type} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    type === 'text' ? 'bg-blue-100 text-blue-600' :
                    type === 'images' ? 'bg-green-100 text-green-600' :
                    type === 'videos' ? 'bg-red-100 text-red-600' :
                    type === 'stories' ? 'bg-purple-100 text-purple-600' :
                    'bg-pink-100 text-pink-600'
                  }`}>
                    {type === 'text' && <FileText className="h-4 w-4" />}
                    {type === 'images' && <Camera className="h-4 w-4" />}
                    {type === 'videos' && <Activity className="h-4 w-4" />}
                    {type === 'stories' && <MessageSquare className="h-4 w-4" />}
                    {type === 'reels' && <Zap className="h-4 w-4" />}
                  </div>
                  <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">{type}</span>
                </div>
                <button
                  onClick={() => setAiPreferences(prev => ({ 
                    ...prev, 
                    contentTypes: { ...prev.contentTypes, [type]: !enabled } 
                  }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    enabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Preferences */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            Platform Preferences
          </CardTitle>
          <CardDescription>
            Configure AI behavior for each social media platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(aiPreferences.platforms).map(([platform, enabled]) => (
              <div key={platform} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    platform === 'instagram' ? 'bg-pink-500' :
                    platform === 'facebook' ? 'bg-blue-600' :
                    platform === 'linkedin' ? 'bg-blue-700' :
                    platform === 'twitter' ? 'bg-sky-500' :
                    'bg-black'
                  } text-white`}>
                    {platform === 'instagram' && <Instagram className="h-5 w-5" />}
                    {platform === 'facebook' && <Facebook className="h-5 w-5" />}
                    {platform === 'linkedin' && <Linkedin className="h-5 w-5" />}
                    {platform === 'twitter' && <Twitter className="h-5 w-5" />}
                    {platform === 'tiktok' && <Activity className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 capitalize">{platform}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">AI content generation for {platform}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAiPreferences(prev => ({ 
                    ...prev, 
                    platforms: { ...prev.platforms, [platform]: !enabled } 
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Settings */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
            Optimization Settings
          </CardTitle>
          <CardDescription>
            Configure AI optimization features for better performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(aiPreferences.optimization).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {feature === 'bestTimes' && 'Optimize posting times for maximum engagement'}
                    {feature === 'hashtags' && 'AI-powered hashtag suggestions and optimization'}
                    {feature === 'captions' && 'Optimize captions for better performance'}
                    {feature === 'engagement' && 'AI-driven engagement optimization strategies'}
                  </p>
                </div>
                <button
                  onClick={() => setAiPreferences(prev => ({ 
                    ...prev, 
                    optimization: { ...prev.optimization, [feature]: !enabled } 
                  }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    enabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data Settings */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-red-600" />
            Privacy & Data
          </CardTitle>
          <CardDescription>
            Manage data retention and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Data Retention Period</label>
              <select 
                value={aiPreferences.dataRetention}
                onChange={(e) => setAiPreferences(prev => ({ ...prev, dataRetention: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option>3 months</option>
                <option>6 months</option>
                <option>12 months</option>
                <option>24 months</option>
                <option>Indefinite</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Privacy Level</label>
              <select 
                value={aiPreferences.privacyLevel}
                onChange={(e) => setAiPreferences(prev => ({ ...prev, privacyLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option>Basic</option>
                <option>Standard</option>
                <option>Enhanced</option>
                <option>Maximum</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">API Access</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Allow third-party applications to access your AI preferences</p>
            </div>
            <button
              onClick={() => setAiPreferences(prev => ({ ...prev, apiAccess: !prev.apiAccess }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                aiPreferences.apiAccess ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiPreferences.apiAccess ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Brand Assets Tab (existing implementation)
  const renderBrandAssetsTab = () => (
    <div className="space-y-8">
      {/* Brand Colors */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Brand Colors</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Define your brand's color palette to maintain consistency across all content</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4">Custom Colors</h4>
            <div className="space-y-4">
              {Object.entries(brandColors).map(([key, color]) => (
                <div key={key} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-slate-200 dark:border-slate-700 cursor-pointer"
                      style={{ backgroundColor: color }}
                    ></div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{key}</label>
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setBrandColors(prev => ({ ...prev, [key]: e.target.value }))}
                        className="mt-1 block w-24 text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4">Color Presets</h4>
            <div className="space-y-3">
              {colorPresets.map((preset) => (
                <div 
                  key={preset.name}
                  className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  onClick={() => setBrandColors(prev => ({ ...prev, ...preset.colors }))}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      {Object.values(preset.colors).map((color, index) => (
                        <div 
                          key={index}
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{preset.name}</span>
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-700">Apply</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brand Assets Upload */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Brand Assets</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Upload your brand assets to maintain consistent visual identity</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: 'logo', label: 'Primary Logo', desc: 'Main logo for light backgrounds (PNG, SVG)', size: '200x80px recommended' },
            { key: 'logoLight', label: 'Light Logo', desc: 'Logo for dark backgrounds (PNG, SVG)', size: '200x80px recommended' },
            { key: 'favicon', label: 'Favicon', desc: 'Small icon for browser tabs (ICO, PNG)', size: '32x32px required' },
            { key: 'watermark', label: 'Watermark', desc: 'Transparent overlay for content (PNG)', size: '100x100px recommended' }
          ].map((asset) => (
            <div key={asset.key} className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <Camera className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">{asset.label}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{asset.desc}</p>
                  <p className="text-xs text-slate-400">{asset.size}</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Upload {asset.label}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Guidelines */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Brand Guidelines</h3>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Brand Voice</label>
              <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                <option>Professional</option>
                <option>Friendly</option>
                <option>Casual</option>
                <option>Authoritative</option>
                <option>Playful</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content Style</label>
              <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                <option>Educational</option>
                <option>Promotional</option>
                <option>Inspirational</option>
                <option>Entertainment</option>
                <option>News & Updates</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Brand Description</label>
              <textarea
                rows={4}
                placeholder="Describe your brand personality, values, and key messaging..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg flex items-center space-x-2 ${
            saveStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {saveStatus === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {saveStatus === 'success' ? 'Settings saved successfully!' : 'Failed to save settings. Please try again.'}
          </span>
        </motion.div>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business">Business Profile</TabsTrigger>
          <TabsTrigger value="platforms">Platform Connections</TabsTrigger>
          <TabsTrigger value="brand">Brand Assets</TabsTrigger>
          <TabsTrigger value="ai">AI Preferences</TabsTrigger>
        </TabsList>

        {/* Business Profile Tab */}
        <TabsContent value="business" className="space-y-6">
          {renderBusinessProfileTab()}
        </TabsContent>

        {/* Platform Connections Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-green-600" />
                Social Media Platforms
              </CardTitle>
              <CardDescription>
                Connect and manage your social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { platform: 'Instagram', icon: Instagram, connected: true, color: 'bg-pink-500' },
                  { platform: 'Facebook', icon: Facebook, connected: true, color: 'bg-blue-600' },
                  { platform: 'LinkedIn', icon: Linkedin, connected: true, color: 'bg-blue-700' },
                  { platform: 'Twitter', icon: Twitter, connected: false, color: 'bg-sky-500' },
                  { platform: 'YouTube', icon: Youtube, connected: false, color: 'bg-red-600' }
                ].map((account) => (
                  <div key={account.platform} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${account.color} rounded-lg flex items-center justify-center text-white`}>
                        <account.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">{account.platform}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {account.connected ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={account.connected ? "destructive" : "default"}
                      size="sm"
                    >
                      {account.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Assets Tab */}
        <TabsContent value="brand" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2 text-purple-600" />
                Brand Assets
              </CardTitle>
              <CardDescription>
                Manage your brand colors, assets, and guidelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderBrandAssetsTab()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Preferences Tab */}
        <TabsContent value="ai" className="space-y-6">
          {renderAIPreferencesTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings

