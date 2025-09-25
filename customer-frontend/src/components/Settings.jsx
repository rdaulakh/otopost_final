import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
  HelpCircle,
  RefreshCw
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
// Import API hooks and UX components
import { 
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
import { useNotificationSystem } from './NotificationSystem.jsx'
import { TableSkeleton } from './LoadingSkeletons.jsx'


const Settings = ({ data = {}, user = {}, onDataUpdate = () => {} }) => {
  const { isDarkMode } = useTheme()
  const queryClient = useQueryClient()
  
  // UX hooks
  const { success, error, info } = useNotificationSystem()

  // Component state
  const [activeTab, setActiveTab] = useState('business')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  // Real API calls for settings data
  const { 
    data: userSettingsData, 
    isLoading: settingsLoading 
  } = useUserSettings()

  // Organization business profile state
  const [organizationProfile, setOrganizationProfile] = useState(null)
  const [isLoadingOrgProfile, setIsLoadingOrgProfile] = useState(true)

  // Fetch organization profile data
  const fetchOrganizationProfile = async () => {
    try {
      setIsLoadingOrgProfile(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch('https://digiads.digiaeon.com/api/users/organization/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.success) {
        setOrganizationProfile(data.data.organization)
      }
    } catch (error) {
      console.error('Error fetching organization profile:', error)
    } finally {
      setIsLoadingOrgProfile(false)
    }
  }

  // Fetch brand assets data
  const fetchBrandAssets = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('https://digiads.digiaeon.com/api/users/organization/brand-assets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.success) {
        setBrandAssets(data.data.brandAssets)
      }
    } catch (error) {
      console.error('Error fetching brand assets:', error)
    }
  }

  // Delete brand asset
  const deleteBrandAsset = async (assetType) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`https://digiads.digiaeon.com/api/users/organization/brand-assets/${assetType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete brand asset')
      }
      return data
    } catch (error) {
      console.error('Error deleting brand asset:', error)
      throw error
    }
  }

  // Save organization profile data
  const saveOrganizationProfile = async (profileData) => {
    try {
      // Ensure website has proper protocol
      const processedData = { ...profileData }
      if (processedData.website && !processedData.website.startsWith('http://') && !processedData.website.startsWith('https://')) {
        processedData.website = `https://${processedData.website}`
      }
      
      // Transform flat form data to proper organization structure
      const organizationData = {
        name: processedData.companyName,
        description: processedData.description,
        website: processedData.website,
        businessInfo: {
          industry: processedData.industry,
          businessType: processedData.businessType,
          companySize: processedData.companySize,
          foundedYear: processedData.founded ? parseInt(processedData.founded) : undefined,
          headquarters: {
            address: processedData.address
          }
        },
        marketingStrategy: {
          targetAudience: processedData.targetAudience,
          businessObjectives: (processedData.businessObjectives || []).map(obj => {
            // Map frontend values to backend enum values
            const mapping = {
              'Brand Awareness': 'brand_awareness',
              'Lead Generation': 'lead_generation',
              'Sales Growth': 'sales_growth',
              'Customer Engagement': 'customer_engagement',
              'Thought Leadership': 'thought_leadership',
              'Community Building': 'community_building',
              'Product Promotion': 'product_promotion',
              'Customer Support': 'customer_support',
              'Market Research': 'market_research'
            };
            return mapping[obj] || obj.toLowerCase().replace(/\s+/g, '_');
          }).filter((value, index, self) => {
            // Filter out invalid enum values and duplicates
            const validValues = ['brand_awareness', 'lead_generation', 'sales_growth', 'customer_engagement', 'thought_leadership', 'community_building', 'product_promotion', 'customer_support', 'market_research'];
            return validValues.includes(value) && self.indexOf(value) === index;
          }),
          geographicReach: processedData.geographicReach,
          postingFrequency: processedData.postingFrequency?.toLowerCase(),
          primaryGoals: processedData.primaryGoals || []
        },
        branding: {
          brandVoice: processedData.brandVoice,
          contentStyle: processedData.contentStyle,
          brandGuidelines: processedData.brandGuidelines
        },
        contactInfo: {
          primaryEmail: processedData.email,
          phoneNumber: processedData.phone
        },
        aiPreferences: aiPreferencesState,
        brandAssets: {
          colors: brandColors
        },
        platformConnections: {
          // Platform connections will be handled separately
        }
      }
      
      const token = localStorage.getItem('authToken')
      const response = await fetch('https://digiads.digiaeon.com/api/users/organization/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(organizationData)
      })
      const data = await response.json()
      if (data.success) {
        setOrganizationProfile(data.data.organization)
        return true
      }
      return false
    } catch (error) {
      console.error('Error saving organization profile:', error)
      return false
    }
  }

  // Load organization profile and brand assets on component mount
  React.useEffect(() => {
    fetchOrganizationProfile()
    fetchBrandAssets()
  }, [])
  
  const { 
    data: socialProfilesData, 
    isLoading: socialProfilesLoading,
    refetch: refetchSocialProfiles
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
  const isLoading = settingsLoading || socialProfilesLoading || notificationSettingsLoading || subscriptionLoading || isLoadingOrgProfile

  // Error handling
  const hasError = false // No profile errors since we removed useUserProfile

  // Initialize business profile from organization data
  const businessProfile = organizationProfile ? {
    companyName: organizationProfile.name || '',
    industry: organizationProfile.businessInfo?.industry || '',
    businessType: organizationProfile.businessInfo?.businessType || '',
    companySize: organizationProfile.businessInfo?.companySize || '',
    website: organizationProfile.website || '',
    phone: organizationProfile.contactInfo?.phoneNumber || '',
    email: organizationProfile.contactInfo?.primaryEmail || '',
    address: organizationProfile.businessInfo?.headquarters?.address || '',
    founded: organizationProfile.businessInfo?.foundedYear || '',
    description: organizationProfile.description || '',
    targetAudience: organizationProfile.marketingStrategy?.targetAudience || '',
    businessObjectives: (organizationProfile.marketingStrategy?.businessObjectives || []).map(obj => {
      // Map backend enum values to frontend display values
      const mapping = {
        'brand_awareness': 'Brand Awareness',
        'lead_generation': 'Lead Generation',
        'sales_growth': 'Sales Growth',
        'customer_engagement': 'Customer Engagement',
        'thought_leadership': 'Thought Leadership',
        'community_building': 'Community Building',
        'product_promotion': 'Product Promotion',
        'customer_support': 'Customer Support',
        'market_research': 'Market Research'
      };
      return mapping[obj] || obj.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }),
    geographicReach: organizationProfile.marketingStrategy?.geographicReach?.charAt(0).toUpperCase() + organizationProfile.marketingStrategy?.geographicReach?.slice(1) || '',
    brandVoice: organizationProfile.branding?.brandVoice || '',
    contentStyle: organizationProfile.branding?.contentStyle || '',
    brandGuidelines: organizationProfile.branding?.brandGuidelines || '',
    postingFrequency: organizationProfile.marketingStrategy?.postingFrequency || '',
    primaryGoals: organizationProfile.marketingStrategy?.primaryGoals || []
  } : {
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
    brandGuidelines: '',
    postingFrequency: '',
    primaryGoals: []
  }

  const [businessProfileState, setBusinessProfile] = useState(businessProfile)

  // Update business profile state when organization data loads
  React.useEffect(() => {
    if (organizationProfile) {
      setBusinessProfile({
        companyName: organizationProfile.name || '',
        industry: organizationProfile.businessInfo?.industry || '',
        businessType: organizationProfile.businessInfo?.businessType || '',
        companySize: organizationProfile.businessInfo?.companySize || '',
        website: organizationProfile.website || '',
        phone: organizationProfile.contactInfo?.phoneNumber || '',
        email: organizationProfile.contactInfo?.primaryEmail || '',
        address: organizationProfile.businessInfo?.headquarters?.address || '',
        founded: organizationProfile.businessInfo?.foundedYear || '',
        description: organizationProfile.description || '',
        targetAudience: organizationProfile.marketingStrategy?.targetAudience || '',
        businessObjectives: (organizationProfile.marketingStrategy?.businessObjectives || []).map(obj => {
          // Map backend enum values to frontend display values
          const mapping = {
            'brand_awareness': 'Brand Awareness',
            'lead_generation': 'Lead Generation',
            'sales_growth': 'Sales Growth',
            'customer_engagement': 'Customer Engagement',
            'thought_leadership': 'Thought Leadership',
            'community_building': 'Community Building',
            'product_promotion': 'Product Promotion',
            'customer_support': 'Customer Support',
            'market_research': 'Market Research'
          };
          return mapping[obj] || obj.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }),
        geographicReach: organizationProfile.marketingStrategy?.geographicReach?.charAt(0).toUpperCase() + organizationProfile.marketingStrategy?.geographicReach?.slice(1) || '',
        brandVoice: organizationProfile.branding?.brandVoice || '',
        contentStyle: organizationProfile.branding?.contentStyle || '',
        brandGuidelines: organizationProfile.branding?.brandGuidelines || '',
        postingFrequency: organizationProfile.marketingStrategy?.postingFrequency || '',
        primaryGoals: organizationProfile.marketingStrategy?.primaryGoals || []
      })

      // Update AI preferences state
      if (organizationProfile.aiPreferences) {
        setAiPreferences(organizationProfile.aiPreferences)
      } else {
        setAiPreferences(defaultAiPreferences)
      }

      // Update brand colors state
      if (organizationProfile.brandAssets?.colors) {
        setBrandColors(organizationProfile.brandAssets.colors)
      }

      // Update brand assets state
      if (organizationProfile.brandAssets) {
        setBrandAssets(organizationProfile.brandAssets)
      }
    }
  }, [organizationProfile])

  // Default AI preferences
  const defaultAiPreferences = {
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

  const [aiPreferencesState, setAiPreferences] = useState(defaultAiPreferences)

  // Social profiles from API
  const socialProfiles = socialProfilesData?.profiles || []
  
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

  const [brandColors, setBrandColors] = useState(organizationProfile?.brandAssets?.colors || {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    background: '#F8FAFC',
    text: '#1F2937'
  })

  // Brand assets state
  const [brandAssets, setBrandAssets] = useState(organizationProfile?.brandAssets || {
    primaryLogo: null,
    lightLogo: null,
    favicon: null,
    watermark: null,
    logo: null
  })

  // Loading state for individual asset removals
  const [removingAssets, setRemovingAssets] = useState(new Set())

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
      const success = await saveOrganizationProfile(businessProfileState)
      if (success) {
        success('Business profile saved successfully!')
        setSaveStatus('success')
        await fetchOrganizationProfile() // Refresh organization data
      } else {
        error('Failed to save business profile')
        setSaveStatus('error')
      }
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
      console.log('Initiating OAuth for platform:', platform)
      info(`Redirecting to ${platform} for authorization...`)
      
      // Redirect to the OAuth initiation endpoint
      const oauthUrl = `https://digiads.digiaeon.com/api/social-accounts/oauth/${platform}`
      window.location.href = oauthUrl
    } catch (err) {
      console.error('OAuth initiation error:', err)
      error(`Failed to initiate ${platform} connection: ${err.message}`)
    }
  }

  // Check for OAuth success and complete connection
  const completeOAuthConnection = async () => {
    try {
      console.log('Attempting to complete OAuth connection...')
      
      // First, let's check the OAuth session debug info
      const debugResponse = await fetch('https://digiads.digiaeon.com/api/social-accounts/oauth/debug', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      const debugData = await debugResponse.json()
      console.log('OAuth debug data:', debugData)
      
      const response = await fetch('https://digiads.digiaeon.com/api/social-accounts/oauth/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      const data = await response.json()
      console.log('Complete OAuth response:', data)
      
      if (data.success) {
        success(`${data.data.platform} connected successfully!`)
        // Refetch social profiles data
        queryClient.invalidateQueries(['social-profiles', 'list'])
        // Remove OAuth success from URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } else {
        error(data.message || 'Failed to complete OAuth connection')
      }
    } catch (err) {
      console.error('Complete OAuth error:', err)
      error('Failed to complete OAuth connection')
    }
  }

  // Check for OAuth success and tab parameter on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const oauthSuccess = urlParams.get('oauth_success')
    const platform = urlParams.get('platform')
    const tab = urlParams.get('tab')
    
    console.log('Settings.jsx URL Debug:', {
      pathname: window.location.pathname,
      search: window.location.search,
      tab: tab,
      oauthSuccess: oauthSuccess,
      platform: platform,
      activeTab: activeTab
    });
    
    // Set the active tab if specified in URL
    if (tab && ['business', 'branding', 'platforms', 'billing'].includes(tab)) {
      console.log(`Setting active tab to: ${tab}`)
      setActiveTab(tab)
    }
    
    if (oauthSuccess === 'true' && platform) {
      console.log(`OAuth success detected for ${platform}`)
      completeOAuthConnection()
    }
  }, [])

  const handleDisconnectSocial = async (profileId) => {
    try {
      info('Disconnecting social profile...')
      await disconnectSocialProfile(profileId)
      success('Social profile disconnected successfully!')
      // The mutation should automatically refetch social profiles data
    } catch (err) {
      console.error('Disconnect social error:', err)
      error(`Failed to disconnect social profile: ${err.message}`)
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

  // Handle brand asset upload
  const handleLogoUpload = async (assetKey, file) => {
    try {
      if (!file) return

      // Validate file type based on asset type
      const allowedImageTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
      const allowedFaviconTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png']
      
      let allowedTypes = allowedImageTypes
      if (assetKey === 'favicon') {
        allowedTypes = allowedFaviconTypes
      }

      if (!allowedTypes.includes(file.type)) {
        error(`Please upload a valid file for ${assetKey}. Allowed types: ${allowedTypes.join(', ')}`)
        return
      }

      // Validate file size (1MB for favicon, 5MB for others)
      const maxSize = assetKey === 'favicon' ? 1024 * 1024 : 5 * 1024 * 1024
      if (file.size > maxSize) {
        error(`File size must be less than ${maxSize / (1024 * 1024)}MB for ${assetKey}`)
        return
      }

      // Create FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('assetType', assetKey)

      // Upload to backend
      const token = localStorage.getItem('authToken')
      const response = await fetch('https://digiads.digiaeon.com/api/users/organization/upload-asset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setBrandAssets(prev => ({
            ...prev,
            [assetKey]: result.data.url
          }))
          success(`${assetKey} uploaded successfully!`)
          
          // Refresh brand assets to get updated data
          await fetchBrandAssets()
        } else {
          error(result.message || 'Failed to upload asset')
        }
      } else {
        const errorData = await response.json()
        error(errorData.message || 'Failed to upload asset')
      }
    } catch (err) {
      console.error('Upload error:', err)
      error('Failed to upload asset')
    }
  }

  // General save function that saves all current settings
  const handleSave = async () => {
    try {
      setIsSaving(true)
      info('Saving all settings...')
      
      // Save all settings in parallel
      await Promise.all([
        saveOrganizationProfile(businessProfileState), // Use organization API instead of user profile
        updateSettings({ 
          aiPreferences: aiPreferencesState,
          brandColors 
        }),
        updateNotificationSettings(notificationSettingsState)
      ])
      
      success('All settings saved successfully!')
      setSaveStatus('success')
      await fetchOrganizationProfile() // Refresh organization data instead of user profile
    } catch (err) {
      error('Failed to save settings')
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
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
                value={businessProfileState.companyName}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Industry *</label>
              <select 
                value={businessProfileState.industry}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="real-estate">Real Estate</option>
                <option value="food-beverage">Food & Beverage</option>
                <option value="travel">Travel</option>
                <option value="entertainment">Entertainment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Type</label>
              <select 
                value={businessProfileState.businessType}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessType: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="b2b">B2B</option>
                <option value="b2c">B2C</option>
                <option value="b2b2c">B2B2C</option>
                <option value="nonprofit">Non-profit</option>
                <option value="government">Government</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Size</label>
              <select 
                value={businessProfileState.companySize}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, companySize: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Website</label>
              <input
                type="url"
                value={businessProfileState.website}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Founded Year</label>
              <input
                type="text"
                value={businessProfileState.founded}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, founded: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Description</label>
            <textarea
              rows={4}
              value={businessProfileState.description}
              onChange={(e) => setBusinessProfile(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className={`${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
          : 'border-0 shadow-lg bg-white/80 backdrop-blur-sm'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <Phone className="h-5 w-5 mr-2 text-green-600" />
            Contact Information
          </CardTitle>
          <CardDescription className={`${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Contact details for your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Email</label>
              <input
                type="email"
                value={businessProfileState.email}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={businessProfileState.phone}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Address</label>
            <input
              type="text"
              value={businessProfileState.address}
              onChange={(e) => setBusinessProfile(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Marketing Strategy */}
      <Card className={`${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
          : 'border-0 shadow-lg bg-white/80 backdrop-blur-sm'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            Marketing Strategy
          </CardTitle>
          <CardDescription className={`${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Define your social media marketing approach and objectives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Brand Voice</label>
              <select 
                value={businessProfileState.brandVoice}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, brandVoice: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="casual">Casual</option>
                <option value="authoritative">Authoritative</option>
                <option value="playful">Playful</option>
                <option value="inspirational">Inspirational</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content Style</label>
              <select 
                value={businessProfileState.contentStyle}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, contentStyle: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="minimalist">Minimalist</option>
                <option value="bold">Bold</option>
                <option value="elegant">Elegant</option>
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="creative">Creative</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Posting Frequency</label>
              <select 
                value={businessProfileState.postingFrequency}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, postingFrequency: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="daily">Daily</option>
                <option value="3-times-week">3 times per week</option>
                <option value="weekly">Weekly</option>
                <option value="2-times-week">2 times per week</option>
                <option value="bi-weekly">Every other day</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Geographic Reach</label>
              <select 
                value={businessProfileState.geographicReach}
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
              value={businessProfileState.targetAudience}
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
      <Card className={`${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
          : 'border-0 shadow-lg bg-white/80 backdrop-blur-sm'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <Brain className="h-5 w-5 mr-2 text-indigo-600" />
            Content Generation
          </CardTitle>
          <CardDescription className={`${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
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
                value={aiPreferencesState.contentTone}
                onChange={(e) => setAiPreferences(prev => ({ ...prev, contentTone: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option>Professional</option>
                <option>Casual</option>
                <option>Friendly</option>
                <option>Authoritative</option>
                <option>Playful</option>
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
                  aiPreferencesState.autoApproval ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiPreferencesState.autoApproval ? 'translate-x-6' : 'translate-x-1'
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
                  aiPreferencesState.autoScheduling ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiPreferencesState.autoScheduling ? 'translate-x-6' : 'translate-x-1'
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
                  aiPreferencesState.aiSuggestions ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiPreferencesState.aiSuggestions ? 'translate-x-6' : 'translate-x-1'
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
                  aiPreferencesState.learningMode ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiPreferencesState.learningMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Types */}
      <Card className={`${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
          : 'border-0 shadow-lg bg-white/80 backdrop-blur-sm'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <FileText className="h-5 w-5 mr-2 text-green-600" />
            Content Types
          </CardTitle>
          <CardDescription className={`${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Select which types of content AI should generate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(aiPreferencesState.contentTypes || {}).map(([type, enabled]) => (
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
                  onClick={() => {
                    console.log('Content type toggle clicked:', type, 'Current state:', aiPreferencesState.contentTypes);
                    setAiPreferences(prev => {
                      const newState = {
                        ...prev, 
                        contentTypes: { ...prev.contentTypes, [type]: !prev.contentTypes[type] } 
                      };
                      console.log('New state after toggle:', newState.contentTypes);
                      return newState;
                    });
                  }}
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
      <Card className={`${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
          : 'border-0 shadow-lg bg-white/80 backdrop-blur-sm'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            Platform Preferences
          </CardTitle>
          <CardDescription className={`${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Configure AI behavior for each social media platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(aiPreferencesState.platforms).map(([platform, enabled]) => (
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
                    platforms: { ...prev.platforms, [platform]: !prev.platforms[platform] } 
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
      <Card className={`${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
          : 'border-0 shadow-lg bg-white/80 backdrop-blur-sm'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
            Optimization Settings
          </CardTitle>
          <CardDescription className={`${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Configure AI optimization features for better performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(aiPreferencesState.optimization).map(([feature, enabled]) => (
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
                    optimization: { ...prev.optimization, [feature]: !prev.optimization[feature] } 
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
      <Card className={`${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
          : 'border-0 shadow-lg bg-white/80 backdrop-blur-sm'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <Shield className="h-5 w-5 mr-2 text-red-600" />
            Privacy & Data
          </CardTitle>
          <CardDescription className={`${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Manage data retention and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Data Retention Period</label>
              <select 
                value={aiPreferencesState.dataRetention}
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
                value={aiPreferencesState.privacyLevel}
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
                aiPreferencesState.apiAccess ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiPreferencesState.apiAccess ? 'translate-x-6' : 'translate-x-1'
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
                        disabled
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
            { key: 'primaryLogo', label: 'Primary Logo', desc: 'Main logo for light backgrounds (PNG, SVG)', size: '200x80px recommended' },
            { key: 'lightLogo', label: 'Light Logo', desc: 'Logo for dark backgrounds (PNG, SVG)', size: '200x80px recommended' },
            { key: 'favicon', label: 'Favicon', desc: 'Small icon for browser tabs (ICO, PNG)', size: '32x32px required' },
            { key: 'watermark', label: 'Watermark', desc: 'Transparent overlay for content (PNG)', size: '100x100px recommended' }
          ].map((asset) => (
            <div key={asset.key} className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
              <div className="space-y-3">
                {brandAssets[asset.key] ? (
                  <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={brandAssets[asset.key]} 
                      alt={asset.label}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <Camera className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">{asset.label}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{asset.desc}</p>
                  <p className="text-xs text-slate-400">{asset.size}</p>
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    id={`upload-${asset.key}`}
                    accept={asset.key === 'favicon' ? 'image/x-icon,image/vnd.microsoft.icon,image/png' : 'image/png,image/jpeg,image/svg+xml,image/webp'}
                    onChange={(e) => handleLogoUpload(asset.key, e.target.files[0])}
                    className="hidden"
                  />
                  <label
                    htmlFor={`upload-${asset.key}`}
                    className="block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    {brandAssets[asset.key] ? 'Replace' : 'Upload'} {asset.label}
                  </label>
                  {brandAssets[asset.key] && (
                    <button
                      onClick={async () => {
                        try {
                          setRemovingAssets(prev => new Set(prev).add(asset.key))
                          info(`Removing ${asset.label}...`)
                          await deleteBrandAsset(asset.key)
                          setBrandAssets(prev => ({ ...prev, [asset.key]: null }))
                          success(`${asset.label} removed successfully!`)
                        } catch (error) {
                          console.error('Error removing asset:', error)
                          error(`Failed to remove ${asset.label}: ${error.message}`)
                        } finally {
                          setRemovingAssets(prev => {
                            const newSet = new Set(prev)
                            newSet.delete(asset.key)
                            return newSet
                          })
                        }
                      }}
                      disabled={removingAssets.has(asset.key)}
                      className={`px-3 py-1 text-white text-xs rounded transition-colors ${
                        removingAssets.has(asset.key) 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {removingAssets.has(asset.key) ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin inline" />
                          Removing...
                        </>
                      ) : (
                        'Remove'
                      )}
                    </button>
                  )}
                </div>
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
              <select 
                value={businessProfileState.brandVoice}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, brandVoice: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="casual">Casual</option>
                <option value="authoritative">Authoritative</option>
                <option value="playful">Playful</option>
                <option value="inspirational">Inspirational</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content Style</label>
              <select 
                value={businessProfileState.contentStyle}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, contentStyle: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="minimalist">Minimalist</option>
                <option value="bold">Bold</option>
                <option value="elegant">Elegant</option>
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="creative">Creative</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Brand Guidelines</label>
              <textarea
                rows={4}
                value={businessProfileState.brandGuidelines || ''}
                onChange={(e) => setBusinessProfile(prev => ({ ...prev, brandGuidelines: e.target.value }))}
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
        <TabsList className={`grid w-full grid-cols-4 ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100'
        }`}>
          <TabsTrigger 
            value="business"
            className={`${
              isDarkMode ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300 hover:bg-slate-700' : ''
            }`}
          >
            Business Profile
          </TabsTrigger>
          <TabsTrigger 
            value="platforms"
            className={`${
              isDarkMode ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300 hover:bg-slate-700' : ''
            }`}
          >
            Platform Connections
          </TabsTrigger>
          <TabsTrigger 
            value="brand"
            className={`${
              isDarkMode ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300 hover:bg-slate-700' : ''
            }`}
          >
            Brand Assets
          </TabsTrigger>
          <TabsTrigger 
            value="ai"
            className={`${
              isDarkMode ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300 hover:bg-slate-700' : ''
            }`}
          >
            AI Preferences
          </TabsTrigger>
        </TabsList>

        {/* Business Profile Tab */}
        <TabsContent value="business" className="space-y-6">
          {renderBusinessProfileTab()}
        </TabsContent>

        {/* Platform Connections Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <Card className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
              : 'border-0 shadow-lg bg-white/80 backdrop-blur-sm'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <Globe className="h-5 w-5 mr-2 text-green-600" />
                Social Media Platforms
              </CardTitle>
              <CardDescription className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Connect and manage your social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const platformConfigs = {
                    'instagram': { name: 'Instagram', icon: Instagram, color: 'bg-pink-500' },
                    'facebook': { name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
                    'linkedin': { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
                    'twitter': { name: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
                    'youtube': { name: 'YouTube', icon: Youtube, color: 'bg-red-600' },
                    'tiktok': { name: 'TikTok', icon: Youtube, color: 'bg-black' }
                  }
                  
                  // Debug: Log the social profiles data structure
                  console.log('Social profiles data:', socialProfilesData)
                  
                  const connectedProfiles = Array.isArray(socialProfilesData?.data) ? socialProfilesData.data : []
                  const connectedPlatforms = connectedProfiles.map(profile => profile.platform?.toLowerCase())
                  
                  return Object.entries(platformConfigs).map(([platformKey, config]) => {
                    const isConnected = connectedPlatforms.includes(platformKey)
                    const connectedProfile = connectedProfiles.find(profile => profile.platform?.toLowerCase() === platformKey)
                    
                    return (
                      <div key={platformKey} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${config.color} rounded-lg flex items-center justify-center text-white`}>
                            <config.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">{config.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {isConnected ? `Connected as @${connectedProfile?.username || 'user'}` : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={isConnected ? "destructive" : "default"}
                          size="sm"
                          onClick={() => isConnected ? handleDisconnectSocial(connectedProfile?._id) : handleConnectSocial(platformKey)}
                          disabled={isConnectingSocial || isDisconnectingSocial}
                        >
                          {isConnectingSocial || isDisconnectingSocial ? 'Processing...' : (isConnected ? 'Disconnect' : 'Connect')}
                        </Button>
                      </div>
                    )
                  })
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Assets Tab */}
        <TabsContent value="brand" className="space-y-6">
          <Card className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
              : 'border-0 shadow-lg bg-white/80 backdrop-blur-sm'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <Palette className="h-5 w-5 mr-2 text-purple-600" />
                Brand Assets
              </CardTitle>
              <CardDescription className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
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

