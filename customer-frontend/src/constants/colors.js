// Color constants for consistent theming across the application

export const colors = {
  light: {
    // Primary colors
    primary: {
      bg: 'bg-blue-600',
      text: 'text-blue-600',
      border: 'border-blue-600',
      hover: 'hover:bg-blue-700'
    },
    
    // Status colors
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      dot: 'bg-green-500'
    },
    
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      dot: 'bg-yellow-500'
    },
    
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      dot: 'bg-red-500'
    },
    
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-500'
    },
    
    // Priority colors
    high: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    },
    
    medium: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    
    low: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200'
    },
    
    // Background colors
    background: {
      primary: 'bg-white',
      secondary: 'bg-slate-50',
      card: 'bg-white/80',
      sidebar: 'bg-white/80'
    },
    
    // Text colors
    text: {
      primary: 'text-slate-900',
      secondary: 'text-slate-600',
      muted: 'text-slate-500',
      inverse: 'text-white'
    }
  },
  
  dark: {
    // Primary colors
    primary: {
      bg: 'bg-blue-500',
      text: 'text-blue-400',
      border: 'border-blue-500',
      hover: 'hover:bg-blue-600'
    },
    
    // Status colors
    success: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      dot: 'bg-emerald-400'
    },
    
    warning: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
      dot: 'bg-amber-400'
    },
    
    error: {
      bg: 'bg-red-500/20',
      text: 'text-red-300',
      border: 'border-red-500/40',
      dot: 'bg-red-400'
    },
    
    info: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-300',
      border: 'border-blue-500/40',
      dot: 'bg-blue-400'
    },
    
    // Priority colors
    high: {
      bg: 'bg-red-500/20',
      text: 'text-red-300',
      border: 'border-red-500/40'
    },
    
    medium: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-300',
      border: 'border-amber-500/40'
    },
    
    low: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40'
    },
    
    // Background colors
    background: {
      primary: 'bg-slate-900',
      secondary: 'bg-slate-800',
      card: 'bg-slate-800/90',
      sidebar: 'bg-slate-900/90',
      strategy: 'bg-slate-800/95'
    },
    
    // Text colors
    text: {
      primary: 'text-slate-100',
      secondary: 'text-slate-400',
      muted: 'text-slate-500',
      inverse: 'text-slate-900'
    },
    
    // Special colors
    confidence: {
      bg: 'bg-purple-600',
      text: 'text-white'
    },
    
    status: {
      onTrack: {
        bg: 'bg-green-500',
        text: 'text-white'
      },
      ahead: {
        bg: 'bg-green-500',
        text: 'text-white'
      }
    },
    
    // Agent dot colors
    agentDots: {
      intelligence: 'bg-blue-500',
      strategy: 'bg-green-500',
      content: 'bg-purple-500',
      execution: 'bg-orange-500',
      learning: 'bg-indigo-500',
      engagement: 'bg-pink-500',
      analytics: 'bg-teal-500'
    }
  }
}

// Helper function to get theme-aware colors
export const getThemeColors = (isDarkMode) => {
  return isDarkMode ? colors.dark : colors.light
}

// Helper function to get specific color classes
export const getColorClasses = (isDarkMode, colorType, variant = 'bg') => {
  const themeColors = getThemeColors(isDarkMode)
  const colorGroup = themeColors[colorType]
  
  if (typeof colorGroup === 'string') {
    return colorGroup
  }
  
  return colorGroup[variant] || colorGroup.bg
}

// Helper function to get badge classes
export const getBadgeClasses = (isDarkMode, colorType) => {
  const themeColors = getThemeColors(isDarkMode)
  const colorGroup = themeColors[colorType]
  
  return `${colorGroup.bg} ${colorGroup.text} ${colorGroup.border}`
}
