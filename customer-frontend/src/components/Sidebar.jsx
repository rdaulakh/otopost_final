import React from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { 
  Sparkles, 
  ChevronRight,
  Crown,
  Zap,
  LogOut
} from 'lucide-react'

const Sidebar = ({ navigation, currentView, onViewChange, user, onSignOut, isDarkMode }) => {
  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-xl h-full flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Social
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Intelligent Manager
              </p>
            </div>
          </div>
          <ThemeToggle size="small" />
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200"
          >
            <Crown className="h-3 w-3 mr-1" />
            {user?.subscription || 'Premium'}
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          
          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-11 ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                )}
              </Button>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 space-y-4 border-t border-slate-200/50 dark:border-slate-700/50">
        {/* Sign Out Button */}
        <Button 
          onClick={onSignOut}
          variant="outline" 
          className={`w-full justify-start h-11 transition-colors ${
            isDarkMode 
              ? 'hover:bg-red-900/20 hover:border-red-700 hover:text-red-400 border-slate-700' 
              : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
          }`}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="font-medium">Sign Out</span>
        </Button>

        {/* AI Status */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200/50 dark:border-green-700/50">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
            </motion.div>
            <div>
              <p className="text-xs font-medium text-green-800 dark:text-green-200">
                All AI Agents Active
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Optimizing performance
              </p>
            </div>
          </div>
        </div>
        
        {/* Version Info */}
        <div className="text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Powered by Advanced AI
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            v2.1.0
          </p>
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar

