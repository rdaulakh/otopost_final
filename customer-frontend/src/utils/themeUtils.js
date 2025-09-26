// Theme utility functions for consistent dark mode styling
export const getThemeClasses = (isDarkMode) => ({
  // Background colors
  background: isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-white',
  cardBackground: isDarkMode ? 'bg-slate-800/80' : 'bg-white/80',
  cardBackgroundSolid: isDarkMode ? 'bg-slate-800' : 'bg-white',
  cardBackgroundHover: isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50',
  
  // Text colors
  textPrimary: isDarkMode ? 'text-slate-100' : 'text-slate-900',
  textSecondary: isDarkMode ? 'text-slate-400' : 'text-slate-600',
  textMuted: isDarkMode ? 'text-slate-500' : 'text-slate-500',
  
  // Border colors
  border: isDarkMode ? 'border-slate-600' : 'border-slate-200',
  borderHover: isDarkMode ? 'border-slate-500' : 'border-slate-300',
  
  // Status colors
  status: {
    excellent: isDarkMode ? 'text-green-400 bg-green-900/30 border-green-500/30' : 'text-green-600 bg-green-100',
    good: isDarkMode ? 'text-blue-400 bg-blue-900/30 border-blue-500/30' : 'text-blue-600 bg-blue-100',
    warning: isDarkMode ? 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30' : 'text-yellow-600 bg-yellow-100',
    poor: isDarkMode ? 'text-red-400 bg-red-900/30 border-red-500/30' : 'text-red-600 bg-red-100',
    default: isDarkMode ? 'text-gray-400 bg-gray-800/50 border-gray-600/30' : 'text-gray-600 bg-gray-100'
  },
  
  // Trend colors
  trend: {
    positive: isDarkMode ? 'text-green-400' : 'text-green-600',
    negative: isDarkMode ? 'text-red-400' : 'text-red-600'
  },
  
  // Button hover states
  buttonHover: {
    blue: isDarkMode ? 'hover:bg-blue-900/20 hover:border-blue-400' : 'hover:bg-blue-50 hover:border-blue-300',
    green: isDarkMode ? 'hover:bg-green-900/20 hover:border-green-400' : 'hover:bg-green-50 hover:border-green-300',
    purple: isDarkMode ? 'hover:bg-purple-900/20 hover:border-purple-400' : 'hover:bg-purple-50 hover:border-purple-300',
    orange: isDarkMode ? 'hover:bg-orange-900/20 hover:border-orange-400' : 'hover:bg-orange-50 hover:border-orange-300',
    red: isDarkMode ? 'hover:bg-red-900/20 hover:border-red-400' : 'hover:bg-red-50 hover:border-red-300'
  },
  
  // Input styles
  input: isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900',
  
  // Scrollbar styles
  scrollbar: isDarkMode 
    ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-500' 
    : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400'
})

// Get status color based on status and theme
export const getStatusColor = (status, isDarkMode) => {
  const classes = getThemeClasses(isDarkMode)
  return classes.status[status] || classes.status.default
}

// Get trend color based on trend value and theme
export const getTrendColor = (trend, isDarkMode) => {
  const classes = getThemeClasses(isDarkMode)
  return trend > 0 ? classes.trend.positive : classes.trend.negative
}

// Get button hover class based on color and theme
export const getButtonHoverClass = (color, isDarkMode) => {
  const classes = getThemeClasses(isDarkMode)
  return classes.buttonHover[color] || classes.buttonHover.blue
}
