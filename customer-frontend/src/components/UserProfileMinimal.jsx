import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Building, 
  Phone, 
  MapPin,
  Edit3,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

const UserProfileMinimal = () => {
  const { isDarkMode } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userData, setUserData] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    location: '',
    website: ''
  })

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('authToken')
        console.log('Auth token check:', { 
          hasToken: !!token, 
          tokenPreview: token ? token.substring(0, 20) + '...' : null,
          allKeys: Object.keys(localStorage)
        })
        
        if (!token) {
          setError('No authentication token found. Please log in first.')
          return
        }

        const response = await fetch('https://digiads.digiaeon.com/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('User data fetched:', result)
        setUserData(result)
        
        // Update form data
        if (result?.data?.user) {
          const user = result.data.user
          setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            company: user.organization?.name || '',
            jobTitle: user.jobTitle || '',
            location: user.location || '',
            website: user.website || ''
          })
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('authToken')
      
      // Separate user data from organization data and fix field names
      const { company, phone, ...userData } = formData
      userData.phoneNumber = phone // API expects phoneNumber, not phone
      
      // Update user profile
      const userResponse = await fetch('https://digiads.digiaeon.com/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`)
      }

      const userResult = await userResponse.json()
      console.log('User profile updated:', userResult)
      
      // Update organization profile if company name is provided
      if (company) {
        const orgResponse = await fetch('https://digiads.digiaeon.com/api/users/organization/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: company })
        })

        if (!orgResponse.ok) {
          console.warn('Failed to update organization profile:', orgResponse.status)
        } else {
          const orgResult = await orgResponse.json()
          console.log('Organization profile updated:', orgResult)
        }
      }
      
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.message)
    }
  }

  const handleCancel = () => {
    // Reset form data to original values
    if (userData?.data?.user) {
      const user = userData.data.user
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.organization?.name || '',
        jobTitle: user.jobTitle || '',
        location: user.location || '',
        website: user.website || ''
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            {error.includes('authentication token') && (
              <Button onClick={() => window.location.href = '/login'} variant="outline">
                Go to Login
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const user = userData?.data?.user

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
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
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 ml-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
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
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="text-2xl">
                      {`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}` || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">{user?.email}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {user?.organization?.name || 'No Company'}
                  </p>
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
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Debug Info */}
              <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">Debug Information:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify({ userData, formData }, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default UserProfileMinimal
