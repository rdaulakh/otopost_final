import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false) // Simplified initialization
  const [isLoading, setIsLoading] = useState(true)

  // Apply theme to document and update localStorage
  useEffect(() => {
    const root = document.documentElement
    
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  // Set loading to false after initial render
  useEffect(() => {
    setIsLoading(false)
  }, [])

  // Listen for system theme changes - temporarily disabled to prevent constant refreshing
  // useEffect(() => {
  //   const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  //   
  //   const handleChange = (e) => {
  //     // Only update if no theme is saved in localStorage
  //     if (!localStorage.getItem('theme')) {
  //       setIsDarkMode(e.matches)
  //     }
  //   }

  //   mediaQuery.addEventListener('change', handleChange)
  //   return () => mediaQuery.removeEventListener('change', handleChange)
  // }, [])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  const setTheme = (theme) => {
    setIsDarkMode(theme === 'dark')
  }

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme,
    isLoading
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

