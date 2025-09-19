
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
// Import API hooks and UX components
import { 
  useUserProfile,
  useUpdateProfile,
  useUploadAvatar,
  useDeleteAvatar,
  useSocialProfiles,
  useConnectSocialProfile,
  useDisconnectSocialProfile,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useAccountSecurity,
  useUpdatePassword,
  useDeleteAccount,
  useUserSubscription,
  useUserUsageStats
} from '../hooks/useApi.js'
import { useNotifications } from './NotificationSystem.jsx'
import { ProfileSkeleton } from './LoadingSkeletons.jsx'


const UserProfile = () => {
  const { isDarkMode } = useTheme()
  
  // UX hooks
  const { success, error, info } = useNotifications()

  // Component state
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [isUploading, setIsUploading] = useState(false)

  // Real API calls for profile data
  const { 
    data: userProfileData, 
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile 
  } = useUserProfile()
  
  const { 
    data: socialProfilesData, 
    isLoading: socialProfilesLoading,
    error: socialProfilesError,
    refetch: refetchSocialProfiles
  } = useSocialProfiles()
  
  const { 
    data: notificationSettingsData, 
    isLoading: notificationSettingsLoading,
    error: notificationSettingsError,
    refetch: refetchNotificationSettings
  } = useNotificationSettings()
  
  const { 
    data: accountSecurityData, 
    isLoading: securityLoading,
    error: securityError,
    refetch: refetchAccountSecurity
  } = useAccountSecurity()

  const { 
    data: userSubscriptionData, 
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchSubscription
  } = useUserSubscription()

  const { 
    data: userUsageStatsData, 
    isLoading: usageStatsLoading,
    error: usageStatsError,
    refetch: refetchUsageStats
  } = useUserUsageStats()
  
  const { 
    mutate: updateProfile,
    isLoading: isUpdatingProfile 
  } = useUpdateProfile()
  
  const { 
    mutate: uploadAvatar,
    isLoading: isUploadingAvatar 
  } = useUploadAvatar()
  
  const { 
    mutate: deleteAvatar,
    isLoading: isDeletingAvatar 
  } = useDeleteAvatar()
  
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
    mutate: updatePassword,
    isLoading: isUpdatingPassword 
  } = useUpdatePassword()
  
  const { 
    mutate: deleteAccount,
    isLoading: isDeletingAccount 
  } = useDeleteAccount()

  // Loading state
  const isLoading = profileLoading || socialProfilesLoading || notificationSettingsLoading || securityLoading || subscriptionLoading || usageStatsLoading

  // Error handling
  const hasError = profileError || socialProfilesError || notificationSettingsError || securityError || subscriptionError || usageStatsError

  const profileData = userProfileData || {}
  const notifications = notificationSettingsData || {}
  const connectedAccounts = socialProfilesData?.profiles || []
  const userSubscription = userSubscriptionData || {}
  const userUsageStats = userUsageStatsData || {}

  const [formData, setFormData] = useState({
    firstName: profileData.name?.split(' ')[0] || '',
    lastName: profileData.name?.split(' ')[1] || '',
    email: profileData.email || '',
    phone: profileData.phone || '',
    company: profileData.company || '',
    jobTitle: profileData.jobTitle || '',
    location: profileData.location || '',
    bio: profileData.bio || '',
    website: profileData.website || '',
    timezone: profileData.timezone || 'UTC-5'
  })
  
  const [notificationsState, setNotifications] = useState(notifications)

  useEffect(() => {
    if (userProfileData) {
      setFormData({
        firstName: userProfileData.name?.split(' ')[0] || '',
        lastName: userProfileData.name?.split(' ')[1] || '',
        email: userProfileData.email || '',
        phone: userProfileData.phone || '',
        company: userProfileData.company || '',
        jobTitle: userProfileData.jobTitle || '',
        location: userProfileData.location || '',
        bio: userProfileData.bio || '',
        website: userProfileData.website || '',
        timezone: userProfileData.timezone || 'UTC-5'
      })
    }
  }, [userProfileData])

  useEffect(() => {
    if (notificationSettingsData) {
      setNotifications(notificationSettingsData)
    }
  }, [notificationSettingsData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
      await updateNotificationSettings(updatedNotifications)
      success("Notification settings updated successfully!")
      refetchNotificationSettings()
    } catch (err) {
      error("Failed to update notification settings.")
      setNotifications(notifications) // Rollback on error
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await uploadAvatar({ file });
      success("Avatar updated successfully!");
      refetchProfile();
    } catch (err) {
      error("Failed to upload avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      await deleteAvatar();
      success("Avatar removed successfully!");
      refetchProfile();
    } catch (err) {
      error("Failed to remove avatar.");
    }
  };

  const handleSave = async () => {
    // Basic form validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      error("First Name, Last Name, and Email are required.");
      return;
    }

    try {
      await updateProfile({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        jobTitle: formData.jobTitle,
        location: formData.location,
        bio: formData.bio,
        website: formData.website,
        timezone: formData.timezone
      });
      success("Profile updated successfully!");
      setIsEditing(false);
      refetchProfile();
    } catch (err) {
      error(`Failed to update profile: ${err.message || err}`);
    }
  };

  const handleConnectSocialProfile = async (platform) => {
    try {
      await connectSocialProfile({ platform });
      success(`${platform} connected successfully!`);
      refetchSocialProfiles();
    } catch (err) {
      error(`Failed to connect ${platform}: ${err.message || err}`);
    }
  };

  const handleDisconnectSocialProfile = async (platformId) => {
    try {
      await disconnectSocialProfile(platformId);
      success("Social profile disconnected successfully!");
      refetchSocialProfiles();
    } catch (err) {
      error(`Failed to disconnect social profile: ${err.message || err}`);
    }
  };

  const handleCancel = () => {
    if (userProfileData) {
      setFormData({
        firstName: userProfileData.name?.split(' ')[0] || '',
        lastName: userProfileData.name?.split(' ')[1] || '',
        email: userProfileData.email || '',
        phone: userProfileData.phone || '',
        company: userProfileData.company || '',
        jobTitle: userProfileData.jobTitle || '',
        location: userProfileData.location || '',
        bio: userProfileData.bio || '',
        website: userProfileData.website || '',
        timezone: userProfileData.timezone || 'UTC-5'
      })
    }
    setIsEditing(false)
  }

  const subscriptionFeatures = [
    { name: 'AI Content Generation', included: true },
    { name: 'Advanced Analytics', included: true },
    { name: 'Multi-Platform Posting', included: true },
    { name: 'Team Collaboration', included: userSubscription.plan === 'Premium' },
    { name: 'White-label Reports', included: userSubscription.plan === 'Premium' },
    { name: 'Priority Support', included: userSubscription.plan === 'Premium' }
  ]

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (hasError) {
    return (
      <div className="p-6 text-center text-red-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Error loading profile data.</h2>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
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
            variant={userSubscription.plan === 'Premium' ? 'default' : 'secondary'}
            className={userSubscription.plan === 'Premium' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : ''}
          >
            {userSubscription.plan || 'Free Trial'}
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
                    <Button onClick={handleSave} size="sm" disabled={isUpdatingProfile}>
                      {isUpdatingProfile ? 'Saving...' : 'Save'}
                      <Save className="h-4 w-4 ml-2" />
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" disabled={isUpdatingProfile}>
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
                    <AvatarImage src={profileData.avatar} />
                    <AvatarFallback className="text-2xl">
                      {profileData.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label htmlFor="avatar-upload">
                        <Button
                          as="span"
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                          disabled={isUploadingAvatar}
                        >
                          {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                        </Button>
                      </label>
                      {profileData.avatar && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -bottom-2 left-0 rounded-full h-8 w-8 p-0"
                          onClick={handleAvatarDelete}
                          disabled={isDeletingAvatar}
                        >
                          {isDeletingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{profileData.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{profileData.email}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{profileData.company}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing || isUpdatingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing || isUpdatingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing || isUpdatingProfile}
                      className="pl-10"
                    />
                  </div>
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
                      disabled={!isEditing || isUpdatingProfile}
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
                      disabled={!isEditing || isUpdatingProfile}
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
                    disabled={!isEditing || isUpdatingProfile}
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
                      disabled={!isEditing || isUpdatingProfile}
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
                      disabled={!isEditing || isUpdatingProfile}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing || isUpdatingProfile}
                    rows={4}
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={formData.timezone} 
                    onValueChange={(value) => handleSelectChange('timezone', value)}
                    disabled={!isEditing || isUpdatingProfile}
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
                              onClick={() => handleDisconnectSocialProfile(account.platformId)} // Assuming platformId for disconnect
                              disabled={isDisconnectingSocial}
                            >
                              {isDisconnectingSocial ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleConnectSocialProfile(account.platform)} // Assuming platform for connect
                            disabled={isConnectingSocial}
                          >
                            {isConnectingSocial ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Connect
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
                    <h4 className="font-medium">Email Marketing</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Receive marketing emails and product updates</p>
                  </div>
                  <Switch
                    checked={notificationsState.emailMarketing}
                    onCheckedChange={(checked) => handleNotificationChange('emailMarketing', checked)}
                    disabled={isUpdatingNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">System Updates</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Important system notifications and updates</p>
                  </div>
                  <Switch
                    checked={notificationsState.emailUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('emailUpdates', checked)}
                    disabled={isUpdatingNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Browser push notifications for real-time updates</p>
                  </div>
                  <Switch
                    checked={notificationsState.pushNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                    disabled={isUpdatingNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Alerts</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Text message alerts for critical notifications</p>
                  </div>
                  <Switch
                    checked={notificationsState.smsAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('smsAlerts', checked)}
                    disabled={isUpdatingNotifications}
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
                    disabled={isUpdatingNotifications}
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
                    disabled={isUpdatingNotifications}
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
                      {userSubscription.plan || 'Free Trial'}
                      {userSubscription.plan === 'Premium' && <Crown className="h-5 w-5 ml-2 text-yellow-500" />}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {userSubscription.price || '$0/month'}
                    </p>
                  </div>
                  <Button variant="outline">
                    {userSubscription.plan === 'Premium' ? 'Manage Plan' : 'Upgrade'}
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
                  {subscriptionFeatures.map((feature) => (
                    <div key={feature.name} className="flex items-center space-x-3">
                      {feature.included ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-slate-400" />
                      )}
                      <span className={feature.included ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}>
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
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Last changed {accountSecurityData?.passwordLastChanged || 'N/A'}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => info("Password change functionality not yet implemented.")}>Change Password</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{accountSecurityData?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => info("2FA functionality not yet implemented.")}>{accountSecurityData?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Monitor className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <h4 className="font-medium">Active Sessions</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Manage your active login sessions</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => info("View sessions functionality not yet implemented.")}>View Sessions</Button>
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-600">Delete Account</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Permanently delete your account and all data</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => deleteAccount()} // Assuming no confirmation for now
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                    <Trash2 className="h-4 w-4 ml-2" />
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

export default UserProfile


