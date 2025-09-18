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
  Settings,
  Crown,
  CheckCircle,
  AlertCircle,
  Trash2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube
} from 'lucide-react'

const ProfileDemo = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('premium')
  const [brandColors, setBrandColors] = useState({
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    background: '#F8FAFC',
    text: '#1F2937'
  })
  const [brandAssets, setBrandAssets] = useState({
    logo: null,
    logoLight: null,
    favicon: null,
    watermark: null
  })
  const [user, setUser] = useState({
    name: 'Sarah Johnson',
    email: 'sarah@techstart.com',
    company: 'TechStart Solutions',
    industry: 'SaaS',
    subscription: 'Premium',
    avatar: '/api/placeholder/40/40',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+1 (555) 123-4567',
    jobTitle: 'Marketing Manager',
    location: 'New York, NY',
    website: 'https://techstart.com',
    bio: 'Passionate marketing professional focused on AI-driven social media strategies.',
    timezone: 'Eastern Time (UTC-5)'
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  const socialAccounts = [
    { platform: 'Instagram', handle: '@yourcompany', followers: '12.5K', connected: true, icon: Instagram, color: 'bg-pink-500' },
    { platform: 'Facebook', handle: 'Your Company', followers: '8.2K', connected: true, icon: Facebook, color: 'bg-blue-600' },
    { platform: 'LinkedIn', handle: 'Your Company', followers: '5.1K', connected: true, icon: Linkedin, color: 'bg-blue-700' },
    { platform: 'Twitter', handle: '', followers: '', connected: false, icon: Twitter, color: 'bg-sky-500' },
    { platform: 'TikTok', handle: '', followers: '', connected: false, icon: User, color: 'bg-black' },
    { platform: 'YouTube', handle: '', followers: '', connected: false, icon: Youtube, color: 'bg-red-600' }
  ]

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          <p className="text-sm text-gray-500">Update your personal details and profile information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-xl">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.firstName[0]}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
            <Camera className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div>
          <h4 className="text-xl font-semibold text-gray-900">{user.name}</h4>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500">{user.company}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            value={user.firstName}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            value={user.lastName}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={user.email}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={user.phone}
            disabled={!isEditing}
            placeholder="+1 (555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
          <input
            type="text"
            value={user.company}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
          <input
            type="text"
            value={user.jobTitle}
            disabled={!isEditing}
            placeholder="Marketing Manager"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={user.location}
            disabled={!isEditing}
            placeholder="New York, NY"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={user.website}
            disabled={!isEditing}
            placeholder="https://yourcompany.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <textarea
          value={user.bio}
          disabled={!isEditing}
          rows={4}
          placeholder="Tell us about yourself and your company..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <select
          value={user.timezone}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 cursor-pointer"
        >
          <option value="Eastern Time (UTC-5)">Eastern Time (UTC-5)</option>
          <option value="Central Time (UTC-6)">Central Time (UTC-6)</option>
          <option value="Mountain Time (UTC-7)">Mountain Time (UTC-7)</option>
          <option value="Pacific Time (UTC-8)">Pacific Time (UTC-8)</option>
        </select>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        <p className="text-sm text-gray-500">Choose how you want to be notified about updates and activities</p>
      </div>

      <div className="space-y-4">
        {[
          { title: 'Email Marketing', desc: 'Receive marketing emails and product updates', enabled: true },
          { title: 'System Updates', desc: 'Important system notifications and updates', enabled: true },
          { title: 'Push Notifications', desc: 'Browser push notifications for real-time updates', enabled: true },
          { title: 'SMS Alerts', desc: 'Text message alerts for critical notifications', enabled: false },
          { title: 'Weekly Reports', desc: 'Weekly performance and analytics reports', enabled: true },
          { title: 'Performance Alerts', desc: 'Alerts when posts perform exceptionally well or poorly', enabled: true }
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{item.title}</h4>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                item.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  item.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  const renderBillingTab = () => {
    const invoices = [
      { id: 'INV-2024-001', date: '2024-09-01', amount: '$49.00', status: 'Paid', plan: 'Premium' },
      { id: 'INV-2024-002', date: '2024-08-01', amount: '$49.00', status: 'Paid', plan: 'Premium' },
      { id: 'INV-2024-003', date: '2024-07-01', amount: '$49.00', status: 'Paid', plan: 'Premium' },
      { id: 'INV-2024-004', date: '2024-06-01', amount: '$29.00', status: 'Paid', plan: 'Pro' }
    ]

    const paymentMethods = [
      { id: 1, type: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
      { id: 2, type: 'Mastercard', last4: '8888', expiry: '09/25', isDefault: false }
    ]

    const plans = [
      {
        id: 'starter',
        name: 'Starter',
        price: '$19',
        period: '/month',
        features: ['5 Social Accounts', '50 Posts/month', 'Basic Analytics', 'Email Support'],
        popular: false
      },
      {
        id: 'pro',
        name: 'Pro',
        price: '$39',
        period: '/month',
        features: ['15 Social Accounts', '200 Posts/month', 'Advanced Analytics', 'Priority Support', 'Team Collaboration'],
        popular: false
      },
      {
        id: 'premium',
        name: 'Premium',
        price: '$49',
        period: '/month',
        features: ['Unlimited Accounts', 'Unlimited Posts', 'AI Content Generation', 'White-label Reports', 'Priority Support', 'Custom Integrations'],
        popular: true
      }
    ]

    return (
      <div className="space-y-8">
        {/* Current Plan Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900 flex items-center">
                  Premium <Crown className="h-5 w-5 text-yellow-500 ml-2" />
                </h4>
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Manage Plan
                </button>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-4">$49/month</p>
              <p className="text-sm text-gray-600 mb-4">Next billing: October 15, 2024</p>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Posts this month</span>
                    <span>24 / 100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>AI generations</span>
                    <span>156 / 500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '31%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
            <div className="space-y-3">
              {[
                'AI Content Generation',
                'Advanced Analytics',
                'Multi-Platform Posting',
                'Team Collaboration',
                'White-label Reports',
                'Priority Support'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
              Add Payment Method
            </button>
          </div>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    {method.type === 'Visa' ? 'VISA' : 'MC'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">•••• •••• •••• {method.last4}</p>
                    <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                  </div>
                  {method.isDefault && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">Edit</button>
                  <button className="text-red-600 hover:text-red-700 text-sm cursor-pointer">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.plan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <button className="hover:text-blue-700 cursor-pointer">Download PDF</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {plans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                      selectedPlan === plan.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-500">{plan.period}</span>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Selected: {plans.find(p => p.id === selectedPlan)?.name} Plan
                    </p>
                    <p className="text-gray-600">
                      {plans.find(p => p.id === selectedPlan)?.price}/month
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setShowPaymentModal(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                      Subscribe Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
        <p className="text-sm text-gray-500">Manage your account security and privacy settings</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Key className="h-5 w-5 text-gray-400" />
            <div>
              <h4 className="font-medium text-gray-900">Password</h4>
              <p className="text-sm text-gray-500">Last changed 3 months ago</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            Change Password
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-gray-400" />
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            Enable 2FA
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Monitor className="h-5 w-5 text-gray-400" />
            <div>
              <h4 className="font-medium text-gray-900">Active Sessions</h4>
              <p className="text-sm text-gray-500">Manage your active login sessions</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
            View Sessions
          </button>
        </div>

        <div className="border-t pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
            <p className="text-sm text-red-700 mb-4">Permanently delete your account and all data</p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'billing':
        return renderBillingTab()
      case 'security':
        return renderSecurityTab()
      default:
        return renderProfileTab()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile, preferences, and account settings</p>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mt-2">
            <Crown className="h-4 w-4 mr-1" />
            Premium
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileDemo

