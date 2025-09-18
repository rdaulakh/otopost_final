import { useState } from 'react'
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
  Trash2
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
  useDeleteAccount
} from '../hooks/useApi.js'
import { useNotifications } from './NotificationSystem.jsx'
import { ProfileSkeleton } from './LoadingSkeletons.jsx'


const UserProfile = ({ user, onUpdateUser }) => {
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
    isLoading: socialProfilesLoading 
  } = useSocialProfiles()
  
  const { 
    data: notificationSettingsData, 
    isLoading: notificationSettingsLoading 
  } = useNotificationSettings()
  
  const { 
    data: accountSecurityData, 
    isLoading: securityLoading 
  } = useAccountSecurity()
  
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
  const isLoading = profileLoading || socialProfilesLoading || notificationSettingsLoading || securityLoading

  // Error handling
  const hasError = profileError

  // Use real API data with fallback to mock data
  const profileData = userProfileData || user || {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Solutions',
    jobTitle: 'Marketing Manager',
    location: 'San Francisco, CA',
    bio: 'Passionate about digital marketing and social media strategy.',
    website: 'https://johndoe.com',
    timezone: 'UTC-8',
    avatar: null,
    joinDate: '2024-01-15'
  }

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
  
  // Notification settings from API
  const notifications = notificationSettingsData || {
    emailMarketing: true,
    emailUpdates: true,
    pushNotifications: true,
    smsAlerts: false,
    weeklyReports: true,
    performanceAlerts: true
  }

  const [notificationsState, setNotifications] = useState(notifications)

  // Connected accounts from API
  const connectedAccounts = socialProfilesData?.profiles || [
    { platform: 'Instagram', connected: true, username: '@yourcompany', followers: '12.5K' },
    { platform: 'Facebook', connected: true, username: 'Your Company', followers: '8.2K' },
    { platform: 'LinkedIn', connected: true, username: 'Your Company', followers: '5.1K' },
    { platform: 'Twitter', connected: false, username: '', followers: '' },
    { platform: 'TikTok', connected: false, username: '', followers: '' },
    { platform: 'YouTube', connected: false, username: '', followers: '' }
  ]

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

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }))
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
    try {
      await updateProfile({
        name: `${formData.firstName} ${formData.lastName}`,
        company: formData.company,
        // Add other fields from formData as needed by the API
      });
      success("Profile updated successfully!");
      setIsEditing(false);
      refetchProfile();
    } catch (err) {
      error("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ')[1] || '',
      email: user.email || '',
      phone: user.phone || '',
      company: user.company || '',
      jobTitle: user.jobTitle || '',
      location: user.location || '',
      bio: user.bio || '',
      website: user.website || '',
      timezone: user.timezone || 'UTC-5'
    })
    setIsEditing(false)
  }

  const subscriptionFeatures = [
    { name: 'AI Content Generation', included: true },
    { name: 'Advanced Analytics', included: true },
    { name: 'Multi-Platform Posting', included: true },
    { name: 'Team Collaboration', included: user.subscription === 'Premium' },
    { name: 'White-label Reports', included: user.subscription === 'Premium' },
    { name: 'Priority Support', included: user.subscription === 'Premium' }
  ]

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
            variant={user.subscription === 'Premium' ? 'default' : 'secondary'}
            className={user.subscription === 'Premium' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : ''}
          >
            {user.subscription === 'Premium' && <Crown className="h-3 w-3 mr-1" />}
            {user.subscription || 'Free Trial'}
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
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
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
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">
                      {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
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
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </label>
                    </>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user.company}</p>
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
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
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
                      disabled={!isEditing}
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
                      className="pl-10"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself and your company..."
                  rows={4}
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
                {connectedAccounts.map((account) => (
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
                          <Button variant="outline" size="sm">
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button size="sm">
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
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
                    checked={notifications.emailMarketing}
                    onCheckedChange={(checked) => handleNotificationChange('emailMarketing', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">System Updates</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Important system notifications and updates</p>
                  </div>
                  <Switch
                    checked={notifications.emailUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('emailUpdates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Browser push notifications for real-time updates</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Alerts</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Text message alerts for critical notifications</p>
                  </div>
                  <Switch
                    checked={notifications.smsAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('smsAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Weekly performance and analytics reports</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Performance Alerts</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Alerts when posts perform exceptionally well or poorly</p>
                  </div>
                  <Switch
                    checked={notifications.performanceAlerts}
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
                      {user.subscription || 'Free Trial'}
                      {user.subscription === 'Premium' && <Crown className="h-5 w-5 ml-2 text-yellow-500" />}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {user.subscription === 'Premium' ? '$49/month' : '$0/month'}
                    </p>
                  </div>
                  <Button variant="outline">
                    {user.subscription === 'Premium' ? 'Manage Plan' : 'Upgrade'}
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Posts this month</span>
                    <span>24 / 100</span>
                  </div>
                  <Progress value={24} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>AI generations</span>
                    <span>156 / 500</span>
                  </div>
                  <Progress value={31.2} className="h-2" />
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
                      <p className="text-sm text-slate-600 dark:text-slate-400">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Monitor className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <h4 className="font-medium">Active Sessions</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Manage your active login sessions</p>
                    </div>
                  </div>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-600">Delete Account</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
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

