import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Building,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Shield,
  Zap,
  BarChart3,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'

const SignUp = ({ onSwitchToSignIn }) => {
  const { register, isLoading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    industry: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const industries = [
    'Technology/SaaS',
    'E-commerce',
    'Healthcare',
    'Finance',
    'Education',
    'Real Estate',
    'Food & Beverage',
    'Fashion & Beauty',
    'Travel & Tourism',
    'Marketing & Advertising',
    'Consulting',
    'Non-profit',
    'Entertainment',
    'Sports & Fitness',
    'Other'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
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
    // Clear error when user selects
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required'
    }
    
    if (!formData.industry) {
      newErrors.industry = 'Please select an industry'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(1)
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep2()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // Prepare user data for registration
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        company: formData.company,
        industry: formData.industry,
        firstName: formData.firstName,
        lastName: formData.lastName,
      }

      const result = await register(userData)
      
      if (!result.success) {
        setErrors({ 
          general: result.error || 'Registration failed. Please try again.' 
        })
      }
      // If successful, the AuthContext will handle the state update
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = authLoading || isSubmitting

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Join AI Social Media
                </h1>
                <p className="text-gray-600">Start your intelligent journey</p>
              </div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-700 leading-relaxed"
            >
              Join thousands of businesses using AI to transform their social media presence. 
              Get started in minutes and see results immediately.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            {[
              { 
                icon: Zap, 
                title: 'Instant Setup', 
                desc: 'Get up and running in under 5 minutes with our guided onboarding',
                color: 'from-yellow-500 to-orange-500'
              },
              { 
                icon: BarChart3, 
                title: 'Advanced Analytics', 
                desc: 'Track performance across all platforms with detailed insights',
                color: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: Shield, 
                title: 'Enterprise Security', 
                desc: 'Bank-level security with SOC 2 compliance and data encryption',
                color: 'from-green-500 to-emerald-500'
              },
              { 
                icon: CheckCircle, 
                title: '24/7 Support', 
                desc: 'Get help whenever you need it with our dedicated support team',
                color: 'from-purple-500 to-pink-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20"
              >
                <div className={`p-2 bg-gradient-to-r ${feature.color} rounded-lg`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Sign Up Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Step {currentStep} of 2
                </Badge>
              </div>
              <CardDescription className="text-gray-600">
                {currentStep === 1 
                  ? "Let's start with your basic information"
                  : "Complete your profile and set up security"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Message */}
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
                >
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">{errors.general}</span>
                </motion.div>
              )}

              <form onSubmit={currentStep === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit} className="space-y-4">
                {currentStep === 1 ? (
                  // Step 1: Basic Information
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                            disabled={isLoading}
                          />
                        </div>
                        {errors.firstName && (
                          <p className="text-sm text-red-600">{errors.firstName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={errors.lastName ? 'border-red-500' : ''}
                          disabled={isLoading}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-600">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@company.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Continue
                    </Button>
                  </motion.div>
                ) : (
                  // Step 2: Company & Security
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm font-medium">Company Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          placeholder="Your Company Inc."
                          value={formData.company}
                          onChange={handleInputChange}
                          className={`pl-10 ${errors.company ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.company && (
                        <p className="text-sm text-red-600">{errors.company}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                      <Select 
                        value={formData.industry} 
                        onValueChange={(value) => handleSelectChange('industry', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.industry && (
                        <p className="text-sm text-red-600">{errors.industry}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        onClick={handlePrevStep}
                        variant="outline"
                        disabled={isLoading}
                        className="flex-1"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={onSwitchToSignIn}
                    className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
                    disabled={isLoading}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default SignUp
