import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight,
  Sparkles,
  Brain,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'

const SignIn = ({ onSwitchToSignUp }) => {
  const { login, isLoading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: 'test@example.com', // Default credentials for demo
    password: 'password123'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const result = await login(formData.email, formData.password)
      
      if (!result.success) {
        setErrors({ 
          general: result.error || 'Login failed. Please check your credentials.' 
        })
      }
      // If successful, the AuthContext will handle the state update
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemoLogin = async () => {
    setFormData({
      email: 'test@example.com',
      password: 'password123'
    })
    
    // Auto-submit with demo credentials
    setIsSubmitting(true)
    try {
      const result = await login('test@example.com', 'password123')
      if (!result.success) {
        setErrors({ 
          general: result.error || 'Demo login failed. Please try again.' 
        })
      }
    } catch (error) {
      console.error('Demo login error:', error)
      setErrors({ 
        general: 'Demo login failed. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = authLoading || isSubmitting

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
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
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Social Media
                </h1>
                <p className="text-gray-600">Intelligent Content Management</p>
              </div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-700 leading-relaxed"
            >
              Transform your social media strategy with AI-powered content creation, 
              automated scheduling, and intelligent analytics.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { icon: Sparkles, title: 'AI Content', desc: 'Generate engaging posts automatically' },
              { icon: TrendingUp, title: 'Smart Analytics', desc: 'Track performance in real-time' },
              { icon: Users, title: 'Audience Insights', desc: 'Understand your followers better' },
              { icon: CheckCircle, title: 'Multi-Platform', desc: 'Manage all accounts in one place' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20"
              >
                <feature.icon className="h-6 w-6 text-blue-600 mb-2" />
                <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Sign In Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Sign in to your AI Social Media dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Demo Login Button */}
              <Button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Try Demo Login
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                </div>
              </div>

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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
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

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="text-center space-y-2">
                <button className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                  Forgot your password?
                </button>
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={onSwitchToSignUp}
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    disabled={isLoading}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Credentials Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <h4 className="font-medium text-blue-800 mb-2">Demo Credentials</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Email:</strong> test@example.com</p>
              <p><strong>Password:</strong> password123</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default SignIn
