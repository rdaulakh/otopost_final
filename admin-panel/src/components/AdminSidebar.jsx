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
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
    <div className="w-80 h-screen overflow-y-auto border-r bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700">
      {/* Admin Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Super Admin
            </h1>
            <p className="text-sm text-slate-400">AI Social Media Platform</p>
          </div>
        </div>

        {/* Admin User Info */}
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white">
              {adminUser.name || 'Admin User'}
            </p>
            <p className="text-xs truncate text-slate-400">
              {adminUser.role || 'Super Administrator'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Stats</h3>
        <div className="space-y-2">
          {quickStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
              <span className="text-xs text-slate-400">{stat.label}</span>
              <div className="text-right">
                <span className="text-sm font-medium text-white">{stat.value}</span>
                <span className={`text-xs ml-1 ${stat.color}`}>{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Administration</h3>
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
                    : 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'}`} />
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
                    <p className="text-xs text-slate-500 group-hover:text-slate-400 truncate">
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
      <div className="p-4 border-t border-slate-700 mt-auto">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-white">System Status</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">API Health</span>
                <span className="text-green-400">Operational</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Database</span>
                <span className="text-green-400">Connected</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">AI Agents</span>
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Toggle */}
        <Button
          onClick={onToggleTheme}
          variant="ghost"
          className="w-full mt-4 text-slate-400 hover:text-white hover:bg-slate-800/50"
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4 mr-2" />
          ) : (
            <Moon className="h-4 w-4 mr-2" />
          )}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>

        {/* Sign Out */}
        <Button
          onClick={onSignOut}
          variant="ghost"
          className="w-full mt-2 text-slate-400 hover:text-white hover:bg-slate-800/50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export default AdminSidebar

