import { useState, useEffect } from 'react'
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
  Settings,
  Crown,
  CheckCircle,
  AlertCircle,
  Trash2,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useNotificationSystem } from './NotificationSystem.jsx'
import apiClient, { apiHelpers, API_ENDPOINTS } from '../config/api.js'

// API calls using the centralized API module
const fetchUserProfile = async () => {
  try {
    const response = await apiHelpers.get(API_ENDPOINTS.USERS.PROFILE)
    return response.data // Return the full response data
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

const fetchUserSubscription = async () => {
  try {
    const response = await apiHelpers.get(API_ENDPOINTS.USERS.SUBSCRIPTION)
    return response.data.data // Extract subscription data from response
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

const uploadProfilePicture = async (file) => {
  try {
    console.log('Uploading profile picture file:', file.name, file.size, file.type)
    
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await apiClient.post(API_ENDPOINTS.PROFILE.UPLOAD_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    console.log('Upload result:', response.data)
    
    // The API returns { data: { avatar: "/uploads/filename.jpg" } } structure
    if (response.data.data && response.data.data.avatar) {
      // Convert relative path to full URL
      const fullUrl = response.data.data.avatar.startsWith('http') 
        ? response.data.data.avatar 
        : `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${response.data.data.avatar}`
      return { url: fullUrl }
    } else if (response.data.avatar) {
      // Fallback for old API structure
      const fullUrl = response.data.avatar.startsWith('http') 
        ? response.data.avatar 
        : `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${response.data.avatar}`
      return { url: fullUrl }
    } else {
      throw new Error('Invalid response format from upload API')
    }
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    throw error
  }
}

const deleteProfilePicture = async () => {
  try {
    console.log('Deleting profile picture...')
    const response = await apiClient.put(API_ENDPOINTS.PROFILE.DELETE_AVATAR, {
      profilePicture: null
    })
    
    if (response.data.success) {
      console.log('Profile picture deleted successfully')
      return { success: true }
    } else {
      throw new Error(response.data.message || 'Failed to delete profile picture')
    }
  } catch (error) {
    console.error('Error deleting profile picture:', error)
    throw error
  }
}

const updateUserProfile = async (profileData) => {
  try {
    console.log('Sending profile data:', profileData)
    
    const response = await apiHelpers.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, profileData)
    
    console.log('Profile update result:', response.data)
    return response.data // Return the full response data
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}

const updateOrganizationProfile = async (organizationData) => {
  try {
    console.log('Sending organization data:', organizationData)
    
    const response = await apiHelpers.put('/users/organization/profile', organizationData)
    
    console.log('Organization update result:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating organization:', error)
    throw error
  }
}

const UserProfileSimple = () => {
  const { isDarkMode } = useTheme()
  
  // Component state
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [isUploading, setIsUploading] = useState(false)
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState({})
  const [subscriptionData, setSubscriptionData] = useState({})
  const [lastSavedData, setLastSavedData] = useState({})
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    location: '',
    bio: '',
    website: '',
    timezone: 'UTC'
  })
  const [formErrors, setFormErrors] = useState({})
  const [notificationsState, setNotifications] = useState({
    email: {
      contentApproval: false,
      publishingUpdates: false,
      analyticsReports: false,
      teamActivity: false,
      systemUpdates: false
    },
    push: {
      contentApproval: false,
      publishingUpdates: false,
      analyticsReports: false,
      teamActivity: false,
      systemUpdates: false
    },
    sms: false,
    marketing: false,
    weeklyReports: false,
    performanceAlerts: false
  })

  // Mock notification functions to avoid circular dependencies
  // UX hooks
  const { success, error, info } = useNotificationSystem()

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateProfilePicture = (file) => {
    const errors = []
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      errors.push('Only JPG, JPEG, PNG, and WebP files are allowed')
    }
    
    // Check file size (1MB = 1024 * 1024 bytes)
    const maxSize = 1024 * 1024 // 1MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 1MB')
    }
    
    return errors
  }

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  const validateForm = () => {
    const errors = {}
    
    // First Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters'
    }
    
    // Last Name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters'
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    
    // Website validation (optional but if provided, should be valid URL)
    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website.startsWith('http') ? formData.website : `https://${formData.website}`)
      } catch {
        errors.website = 'Please enter a valid website URL'
      }
    }
    
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Load notification preferences from API
  const loadNotificationPreferences = async () => {
    try {
      const response = await apiHelpers.get('/users/notifications')
      if (response.data.success && response.data.data) {
        const prefs = response.data.data
        console.log('📥 Loaded notification preferences:', prefs)
        setNotifications({
          email: prefs.email || {
            contentApproval: false,
            publishingUpdates: false,
            analyticsReports: false,
            teamActivity: false,
            systemUpdates: false
          },
          push: prefs.push || {
            contentApproval: false,
            publishingUpdates: false,
            analyticsReports: false,
            teamActivity: false,
            systemUpdates: false
          },
          sms: prefs.sms || false,
          marketing: prefs.marketing || false,
          weeklyReports: prefs.weeklyReports || false,
          performanceAlerts: prefs.performanceAlerts || false
        })
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    }
  }

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [profile, subscription] = await Promise.all([
          fetchUserProfile(),
          fetchUserSubscription()
        ])
        
        // Debug: Log the API response to see the structure
        console.log('Profile API Response:', profile)
        console.log('Subscription API Response:', subscription)
        
        if (profile?.data?.user) {
          const userData = profile.data.user
          setProfileData(userData)
          const initialFormData = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phoneNumber || userData.preferences?.phone || userData.phone || '',
            company: userData.organization?.name || userData.company || '',
            jobTitle: userData.preferences?.jobTitle || userData.jobTitle || '',
            location: userData.preferences?.location || userData.location || '',
            bio: userData.preferences?.bio || userData.bio || '',
            website: userData.preferences?.website || userData.website || '',
            timezone: userData.preferences?.timezone || userData.timezone || 'UTC'
          }
          setFormData(initialFormData)
          setLastSavedData(initialFormData) // Set initial saved data
          
          // Set profile picture if available
          if (userData.profilePicture || userData.avatar) {
            setProfilePicturePreview(userData.profilePicture || userData.avatar)
          }
        } else if (profile?.data) {
          // Handle case where user data is directly in data object
          const userData = profile.data
          setProfileData(userData)
          const initialFormData = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phoneNumber || userData.preferences?.phone || userData.phone || '',
            company: userData.organization?.name || userData.company || '',
            jobTitle: userData.preferences?.jobTitle || userData.jobTitle || '',
            location: userData.preferences?.location || userData.location || '',
            bio: userData.preferences?.bio || userData.bio || '',
            website: userData.preferences?.website || userData.website || '',
            timezone: userData.preferences?.timezone || userData.timezone || 'UTC'
          }
          setFormData(initialFormData)
          setLastSavedData(initialFormData)
          
          // Set profile picture if available
          if (userData.profilePicture || userData.avatar) {
            setProfilePicturePreview(userData.profilePicture || userData.avatar)
          }
        } else if (profile) {
          // Handle case where user data is directly in profile object
          setProfileData(profile)
          const initialFormData = {
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phone: profile.phoneNumber || profile.preferences?.phone || profile.phone || '',
            company: profile.organization?.name || profile.company || '',
            jobTitle: profile.preferences?.jobTitle || profile.jobTitle || '',
            location: profile.preferences?.location || profile.location || '',
            bio: profile.preferences?.bio || profile.bio || '',
            website: profile.preferences?.website || profile.website || '',
            timezone: profile.preferences?.timezone || profile.timezone || 'UTC'
          }
          setFormData(initialFormData)
          setLastSavedData(initialFormData)
          
          // Set profile picture if available
          if (profile.profilePicture || profile.avatar) {
            setProfilePicturePreview(profile.profilePicture || profile.avatar)
          }
        }
        
        // Debug: Log the form data that was set
        console.log('Form data set:', formData)
        
        if (subscription?.data) {
          setSubscriptionData(subscription.data)
        }
        
        // Load notification preferences
        await loadNotificationPreferences()
        
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNotificationChange = async (key, value) => {
    const updatedNotifications = {
      ...notificationsState,
      [key]: value
    }
    setNotifications(updatedNotifications)
    
    try {
      info('Saving notification preferences...')
      
      // Prepare the notification data for the API (backend expects objects with specific properties)
      const notificationData = {
        email: updatedNotifications.email,
        push: updatedNotifications.push,
        sms: updatedNotifications.sms,
        marketing: updatedNotifications.marketing,
        weeklyReports: updatedNotifications.weeklyReports,
        performanceAlerts: updatedNotifications.performanceAlerts
      }
      
      // Save to backend API
      const response = await apiHelpers.put('/users/notifications', notificationData)
      
      if (response.data.success) {
        success('Notification preferences saved successfully!')
      } else {
        throw new Error(response.data.message || 'Failed to save notification preferences')
      }
    } catch (err) {
      console.error('Notification save error:', err)
      error('Failed to save notification preferences')
      setNotifications(notificationsState) // Rollback on error
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate the file
    const validationErrors = validateProfilePicture(file);
    if (validationErrors.length > 0) {
      validationErrors.forEach(err => error(err));
      return;
    }

    try {
      setIsUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Store the file for upload
      setProfilePicture(file);
      
      const fileSizeKB = (file.size / 1024).toFixed(1);
      success(`Profile picture selected successfully! (${fileSizeKB} KB) Click Save to upload.`);
    } catch (err) {
      error("Failed to process profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      setIsDeletingAvatar(true)
      info("Removing profile picture...")
      
      // Call API to delete profile picture from backend
      await deleteProfilePicture()
      
      // Update local state
      setProfilePicture(null);
      setProfilePicturePreview(null);
      
      // Update profile data to remove avatar
      setProfileData(prev => ({
        ...prev,
        avatar: null,
        profilePicture: null
      }))
      
      success("Profile picture removed successfully!");
    } catch (err) {
      console.error('Error removing profile picture:', err)
      error(`Failed to remove profile picture: ${err.message}`);
    } finally {
      setIsDeletingAvatar(false)
    }
  };

  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      error("Please fix the validation errors before saving.");
      return;
    }

    setIsSaving(true)
    try {
      info('Saving profile...')
      
      // First, upload profile picture if one was selected
      let avatarUrl = null;
      if (profilePicture) {
        try {
          console.log('Uploading profile picture...');
          const uploadResult = await uploadProfilePicture(profilePicture);
          avatarUrl = uploadResult.url;
          console.log('Profile picture uploaded successfully:', avatarUrl);
        } catch (uploadError) {
          console.error('Profile picture upload failed:', uploadError);
          error(`Failed to upload profile picture: ${uploadError.message}`);
          // Continue with profile update even if picture upload fails
        }
      }

      // Prepare the user profile update data (without company)
      let userUpdateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone, // API expects phoneNumber, not phone
        jobTitle: formData.jobTitle,
        location: formData.location,
        bio: formData.bio,
        website: formData.website,
        timezone: formData.timezone
      }

      // Add avatar URL if we have one
      if (avatarUrl) {
        userUpdateData.profilePicture = avatarUrl;
      }
      
      console.log('Attempting to save user profile with data:', userUpdateData)
      console.log('Payload being sent to API:', JSON.stringify(userUpdateData, null, 2))
      
      // Update user profile
      const result = await updateUserProfile(userUpdateData);
      
      // Update organization profile if company name changed
      if (formData.company) {
        console.log('Updating organization profile with company:', formData.company)
        await updateOrganizationProfile({ name: formData.company });
      }
      
      if (result && result.success) {
        success('Profile saved successfully!');
        setIsEditing(false);
        setFormErrors({}) // Clear all errors on successful save
        
        // Clear profile picture state after successful save
        if (profilePicture) {
          setProfilePicture(null);
          setProfilePicturePreview(null);
        }
        
        // Update the profile picture preview with the uploaded URL
        if (avatarUrl) {
          setProfilePicturePreview(avatarUrl);
        }
        
        // Since the API doesn't return all fields, keep the user's entered data as the "saved" data
        // This ensures the form shows what the user actually saved
        setLastSavedData(formData)
        console.log('Data saved successfully. Form data preserved:', formData)
        
        // Try to reload from API for any fields that might have been updated by the server
        try {
          console.log('Fetching fresh profile data to verify save...')
          const freshProfile = await fetchUserProfile()
          console.log('Fresh profile data after save:', freshProfile)
          
          if (freshProfile?.data?.user) {
            const userData = freshProfile.data.user
            setProfileData(userData)
            
            // Update form data with fresh data from API
            setFormData(prevFormData => ({
              ...prevFormData, // Keep all user's entered data
              // Only update fields that API returned
              firstName: userData.firstName || prevFormData.firstName,
              lastName: userData.lastName || prevFormData.lastName,
              email: userData.email || prevFormData.email,
              timezone: userData.preferences?.timezone || userData.timezone || prevFormData.timezone,
              phone: userData.preferences?.phone || userData.phone || prevFormData.phone,
              company: userData.organization?.name || userData.company || prevFormData.company,
              jobTitle: userData.preferences?.jobTitle || userData.jobTitle || prevFormData.jobTitle,
              location: userData.preferences?.location || userData.location || prevFormData.location,
              bio: userData.preferences?.bio || userData.bio || prevFormData.bio,
              website: userData.preferences?.website || userData.website || prevFormData.website
            }))
            
            // Update profile picture if returned by API
            if (userData.profilePicture || userData.avatar) {
              setProfilePicturePreview(userData.profilePicture || userData.avatar);
              console.log('Profile picture updated from API response');
            }
            
            console.log('Form updated with API data where available, user data preserved for other fields')
          }
        } catch (reloadError) {
          console.error('Error reloading profile after save:', reloadError)
          console.log('User data preserved since API reload failed')
        }
      } else {
        error("Profile update failed - no data returned from server");
      }
    } catch (err) {
      console.error('Save error details:', err)
      error('Failed to save profile');
    } finally {
      setIsSaving(false)
    }
  };

  const handleConnectSocialProfile = async (platform) => {
    try {
      // Mock connect for now
      success(`${platform} connected successfully!`);
    } catch (err) {
      error(`Failed to connect ${platform}: ${err.message || err}`);
    }
  };

  const handleDisconnectSocialProfile = async (platformId) => {
    try {
      // Mock disconnect for now
      success("Social profile disconnected successfully!");
    } catch (err) {
      error(`Failed to disconnect social profile: ${err.message || err}`);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.preferences?.phone || profileData.phone || '',
        company: profileData.organization?.name || profileData.company || '',
        jobTitle: profileData.preferences?.jobTitle || profileData.jobTitle || '',
        location: profileData.preferences?.location || profileData.location || '',
        bio: profileData.preferences?.bio || profileData.bio || '',
        website: profileData.preferences?.website || profileData.website || '',
        timezone: profileData.preferences?.timezone || profileData.timezone || 'UTC'
      })
    }
    // Reset profile picture state
    setProfilePicture(null);
    setProfilePicturePreview(profileData?.profilePicture || profileData?.avatar || null);
    setFormErrors({}) // Clear all errors when canceling
    setIsEditing(false)
  }

  // Use features from API response instead of hardcoded values
  const subscriptionFeatures = subscriptionData?.features?.featureList ? 
    subscriptionData.features.featureList.map(feature => ({ name: feature, included: true })) :
    subscriptionData?.features ? [
      { name: 'AI Content Generation', included: subscriptionData.features.aiAgents || false },
      { name: 'Advanced Analytics', included: subscriptionData.features.analytics || false },
      { name: 'Multi-Platform Posting', included: subscriptionData.features.socialAccountsLimit > 0 },
      { name: 'Team Collaboration', included: subscriptionData.features.teamCollaboration || false },
      { name: 'White-label Reports', included: subscriptionData.features.whiteLabel || false },
      { name: 'Priority Support', included: subscriptionData.features.prioritySupport || false },
      { name: 'API Access', included: subscriptionData.features.apiAccess || false },
      { name: 'Custom Branding', included: subscriptionData.features.customBranding || false },
      { name: 'Advanced Analytics', included: subscriptionData.features.advancedAnalytics || false },
      { name: 'Multiple Workspaces', included: subscriptionData.features.multipleWorkspaces || false },
      { name: 'SSO Integration', included: subscriptionData.features.sso || false }
    ] : [
      { name: 'AI Content Generation', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Multi-Platform Posting', included: true },
      { name: 'Team Collaboration', included: subscriptionData.plan === 'Premium' },
      { name: 'White-label Reports', included: subscriptionData.plan === 'Premium' },
      { name: 'Priority Support', included: subscriptionData.plan === 'Premium' }
    ]

  // Mock data for other features
  const connectedAccounts = []
  const userUsageStats = {
    postsUsed: 0,
    postsLimit: 100,
    aiGenerationsUsed: 0,
    aiGenerationsLimit: 500
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 mx-auto">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Account Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your profile, preferences, and account settings
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge 
            variant={subscriptionData.plan === 'Premium' ? 'default' : 'secondary'}
            className={subscriptionData.plan === 'Premium' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : ''}
          >
            {subscriptionData.plan || ''}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="accounts">Social Accounts</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and profile information
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} size="sm" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Save
                          <Save className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profilePicturePreview || profileData.avatar} />
                    <AvatarFallback className="text-2xl">
                      {`${profileData.firstName?.[0] || ''}${profileData.lastName?.[0] || ''}` || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                        ref={(input) => {
                          if (input) {
                            input.setAttribute('style', 'display: none;');
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 cursor-pointer hover:bg-blue-600 bg-blue-500 hover:bg-blue-600 transition-colors"
                        disabled={isUploading}
                        title="Click to upload profile picture"
                        onClick={() => {
                          console.log('Camera icon clicked, opening file dialog...');
                          const fileInput = document.getElementById('avatar-upload');
                          if (fileInput) {
                            fileInput.click();
                          } else {
                            console.error('File input not found!');
                          }
                        }}
                      >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      </Button>
                      {(profileData.avatar || profilePicturePreview) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -bottom-2 left-0 rounded-full h-8 w-8 p-0"
                          onClick={handleAvatarDelete}
                          disabled={isDeletingAvatar}
                        >
                          {isDeletingAvatar ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{`${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'User'}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{profileData.email}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{profileData.organization?.name || 'No Company'}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={formErrors.firstName ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {formErrors.firstName && (
                    <div className="flex items-center space-x-1 mt-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-500 font-medium">{formErrors.firstName}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={formErrors.lastName ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {formErrors.lastName && (
                    <div className="flex items-center space-x-1 mt-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-500 font-medium">{formErrors.lastName}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 ${formErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                  </div>
                  {formErrors.email && (
                    <div className="flex items-center space-x-1 mt-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-500 font-medium">{formErrors.email}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Marketing Manager"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10"
                      placeholder="New York, NY"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 ${formErrors.website ? 'border-red-500 focus:border-red-500' : ''}`}
                      placeholder="https://example.com"
                    />
                  </div>
                  {formErrors.website && (
                    <div className="flex items-center space-x-1 mt-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-500 font-medium">{formErrors.website}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={formData.timezone} 
                    onValueChange={(value) => handleSelectChange('timezone', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                      <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                      <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="UTC+0">GMT (UTC+0)</SelectItem>
                      <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Connected Social Accounts
              </CardTitle>
              <CardDescription>
                Manage your connected social media platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedAccounts.length > 0 ? (
                  connectedAccounts.map((account) => (
                    <div key={account.platform} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                          {account.platform[0]}
                        </div>
                        <div>
                          <h4 className="font-medium">{account.platform}</h4>
                          {account.connected ? (
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-slate-600 dark:text-slate-400">{account.username}</p>
                              <Badge variant="secondary" className="text-xs">
                                {account.followers} followers
                              </Badge>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400">Not connected</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {account.connected ? (
                          <>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDisconnectSocialProfile(account.platformId)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleConnectSocialProfile(account.platform)}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400">No social accounts connected.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates and activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Receive email notifications for content and system updates</p>
                  </div>
                  <Switch
                    checked={notificationsState.email.contentApproval || notificationsState.email.publishingUpdates || notificationsState.email.analyticsReports || notificationsState.email.teamActivity || notificationsState.email.systemUpdates}
                    onCheckedChange={(checked) => {
                      const newEmailState = {
                        contentApproval: checked,
                        publishingUpdates: checked,
                        analyticsReports: checked,
                        teamActivity: checked,
                        systemUpdates: checked
                      }
                      handleNotificationChange('email', newEmailState)
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Browser push notifications for real-time updates</p>
                  </div>
                  <Switch
                    checked={notificationsState.push.contentApproval || notificationsState.push.publishingUpdates || notificationsState.push.analyticsReports || notificationsState.push.teamActivity || notificationsState.push.systemUpdates}
                    onCheckedChange={(checked) => {
                      const newPushState = {
                        contentApproval: checked,
                        publishingUpdates: checked,
                        analyticsReports: checked,
                        teamActivity: checked,
                        systemUpdates: checked
                      }
                      handleNotificationChange('push', newPushState)
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Alerts</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Text message alerts for critical notifications</p>
                  </div>
                  <Switch
                    checked={notificationsState.sms}
                    onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Emails</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Receive marketing emails and product updates</p>
                  </div>
                  <Switch
                    checked={notificationsState.marketing}
                    onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Weekly performance and analytics reports</p>
                  </div>
                  <Switch
                    checked={notificationsState.weeklyReports}
                    onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Performance Alerts</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Alerts when posts perform exceptionally well or poorly</p>
                  </div>
                  <Switch
                    checked={notificationsState.performanceAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('performanceAlerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  Your current subscription and usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center">
                      {subscriptionData.plan || 'Loading...'}
                      {subscriptionData.plan === 'Premium' && <Crown className="h-5 w-5 ml-2 text-yellow-500" />}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {subscriptionData.price || '$0/month'}
                    </p>
                  </div>
                  <Button variant="outline">
                    {subscriptionData.plan === 'Premium' ? 'Manage Plan' : 'Upgrade'}
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Posts this month</span>
                    <span>{userUsageStats.postsUsed || 0} / {userUsageStats.postsLimit || 100}</span>
                  </div>
                  <Progress value={(userUsageStats.postsUsed / userUsageStats.postsLimit) * 100 || 0} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>AI generations</span>
                    <span>{userUsageStats.aiGenerationsUsed || 0} / {userUsageStats.aiGenerationsLimit || 500}</span>
                  </div>
                  <Progress value={(userUsageStats.aiGenerationsUsed / userUsageStats.aiGenerationsLimit) * 100 || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle>Plan Features</CardTitle>
                <CardDescription>
                  What's included in your current plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subscriptionFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className={`h-5 w-5 ${feature.included ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={feature.included ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-slate-500">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-slate-500">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Login Sessions</h4>
                    <p className="text-sm text-slate-500">Manage active sessions</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserProfileSimple