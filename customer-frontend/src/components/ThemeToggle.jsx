import React from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggle = ({ className = '', size = 'default' }) => {
  const { isDarkMode, toggleTheme } = useTheme()

  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12'
  }

  const iconSizes = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6'
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative overflow-hidden rounded-full p-2 transition-all duration-300
        ${isDarkMode 
          ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
        }
        ${sizeClasses[size]}
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        initial={false}
        animate={{ rotate: isDarkMode ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isDarkMode ? (
          <Moon className={`${iconSizes[size]} text-yellow-400`} />
        ) : (
          <Sun className={`${iconSizes[size]} text-slate-700`} />
        )}
      </motion.div>
      
      {/* Animated background circle */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0"
        animate={{ 
          opacity: isDarkMode ? 0.1 : 0,
          scale: isDarkMode ? 1 : 0.8
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}

export default ThemeToggle

