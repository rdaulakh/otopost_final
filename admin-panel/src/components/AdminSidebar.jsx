import React from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  MessageSquare,
  TrendingUp,
  Database,
  Bell,
  LogOut,
  Crown,
  Activity,
  DollarSign,
  UserCheck,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ThemeToggle from './ThemeToggle.jsx'

const AdminSidebar = ({ 
  currentView, 
  onViewChange, 
  adminUser = {}, 
  onSignOut = () => {},
  platformStats = {},
  isDarkMode = false,
  onToggleTheme = () => {}
}) => {
  const navigation = [
    { 
      id: 'dashboard', 
      label: 'Admin Dashboard', 
      icon: LayoutDashboard,
      description: 'Platform overview & metrics'
    },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: Users,
      description: 'Manage customer accounts',
      badge: platformStats.totalUsers || '0'
    },
    { 
      id: 'subscriptions', 
      label: 'Subscriptions', 
      icon: CreditCard,
      description: 'Billing & subscription plans',
      badge: platformStats.activeSubscriptions || '0'
    },
    { 
      id: 'revenue', 
      label: 'Revenue Dashboard', 
      icon: DollarSign,
      description: 'Financial metrics & reports'
    },
    { 
      id: 'system', 
      label: 'System Health', 
      icon: Activity,
      description: 'Platform monitoring & alerts',
      badge: platformStats.systemAlerts || '0',
      badgeVariant: platformStats.systemAlerts > 0 ? 'destructive' : 'secondary'
    },
    { 
      id: 'support', 
      label: 'Support Center', 
      icon: MessageSquare,
      description: 'Customer support & tickets',
      badge: platformStats.openTickets || '0',
      badgeVariant: platformStats.openTickets > 0 ? 'warning' : 'secondary'
    },
    { 
      id: 'compliance', 
      label: 'Compliance & Security', 
      icon: Shield,
      description: 'Security & audit logs'
    },
    { 
      id: 'analytics', 
      label: 'Advanced Analytics', 
      icon: BarChart3,
      description: 'Custom reports & insights'
    },
    { 
      id: 'configuration', 
      label: 'Platform Config', 
      icon: Settings,
      description: 'AI agents & system settings'
    },
    { 
      id: 'customer-success', 
      label: 'Customer Success', 
      icon: UserCheck,
      description: 'Health scores & onboarding'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell,
      description: 'Alerts & escalation rules'
    },
    { 
      id: 'multi-tenant', 
      label: 'Multi-Tenant', 
      icon: Database,
      description: 'White-label management'
    }
  ]

  const quickStats = [
    {
      label: 'Active Users',
      value: platformStats.activeUsers || '0',
      trend: '+12%',
      color: 'text-green-600'
    },
    {
      label: 'Monthly Revenue',
      value: `$${platformStats.monthlyRevenue || '0'}`,
      trend: '+8%',
      color: 'text-blue-600'
    },
    {
      label: 'System Uptime',
      value: platformStats.uptime || '99.9%',
      trend: 'Stable',
      color: 'text-green-600'
    }
  ]

  return (
    <div className={`w-80 h-screen overflow-y-auto border-r transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700' 
        : 'bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50 text-gray-900 border-gray-200'
    }`}>
      {/* Admin Header */}
      <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Super Admin
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>AI Social Media Platform</p>
            </div>
          </div>
          
          {/* Theme Toggle Button */}
          <ThemeToggle 
            isDarkMode={isDarkMode}
            onToggleTheme={onToggleTheme}
            size="small"
          />
        </div>

        {/* Admin User Info */}
        <div className={`flex items-center space-x-3 p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {adminUser.name || 'Admin User'}
            </p>
            <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              {adminUser.role || 'Super Administrator'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Quick Stats</h3>
        <div className="space-y-2">
          {quickStats.map((stat, index) => (
            <div key={index} className={`flex items-center justify-between p-2 rounded ${isDarkMode ? 'bg-slate-800/30' : 'bg-white/50'}`}>
              <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{stat.label}</span>
              <div className="text-right">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</span>
                <span className={`text-xs ml-1 ${stat.color}`}>{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Administration</h3>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = currentView === item.id
            const Icon = item.icon

            return (
              <motion.button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 group relative cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white'
                    : isDarkMode 
                      ? 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
                      : 'hover:bg-white/50 text-gray-700 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-purple-400' : isDarkMode ? 'text-slate-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{item.label}</span>
                      {item.badge && (
                        <Badge 
                          variant={item.badgeVariant || 'secondary'} 
                          className="ml-2 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-xs truncate ${isDarkMode ? 'text-slate-500 group-hover:text-slate-400' : 'text-gray-500 group-hover:text-gray-600'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
                
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r"
                    layoutId="activeIndicator"
                  />
                )}
              </motion.button>
            )
          })}
        </nav>
      </div>

      {/* System Status */}
      <div className={`p-4 border-t mt-auto ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-gray-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-green-400" />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Status</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>API Health</span>
                <span className="text-green-400">Operational</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Database</span>
                <span className="text-green-400">Connected</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>AI Agents</span>
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Sign Out */}
        <Button
          onClick={onSignOut}
          variant="ghost"
          className={`w-full mt-2 ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}`}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export default AdminSidebar

