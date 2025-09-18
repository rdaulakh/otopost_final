import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Generic error handler
const handleApiError = (error) => {
  console.error('API Error:', error)
  throw new Error(
    error.response?.data?.message || 
    error.message || 
    'An unexpected error occurred'
  )
}

// ============================================================================
// ADMIN DASHBOARD HOOKS
// ============================================================================

// Admin Dashboard Overview
export const useAdminDashboard = (options = {}) => {
  return useQuery({
    queryKey: ['adminDashboard', options],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/dashboard', { params: options })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  })
}

// System Health
export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/system-health')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 2
  })
}

// User Analytics
export const useUserAnalytics = (options = {}) => {
  return useQuery({
    queryKey: ['userAnalytics', options],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/user-analytics', { params: options })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  })
}

// Revenue Analytics
export const useRevenueAnalytics = (options = {}) => {
  return useQuery({
    queryKey: ['revenueAnalytics', options],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/revenue-analytics', { params: options })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  })
}

// Platform Stats
export const usePlatformStats = () => {
  return useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/platform-stats')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  })
}

// Admin Alerts
export const useAdminAlerts = () => {
  return useQuery({
    queryKey: ['adminAlerts'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/alerts')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60000, // Refresh every minute
    retry: 2
  })
}

// ============================================================================
// USER MANAGEMENT HOOKS
// ============================================================================

// Users List
export const useUsersList = (options = {}) => {
  return useQuery({
    queryKey: ['usersList', options],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/users', { params: options })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    retry: 2
  })
}

// Create User
export const useCreateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userData) => {
      try {
        const response = await api.post('/admin/users', userData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['usersList'])
      queryClient.invalidateQueries(['adminDashboard'])
      queryClient.invalidateQueries(['userAnalytics'])
    }
  })
}

// Update User
export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...userData }) => {
      try {
        const response = await api.put(`/admin/users/${id}`, userData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['usersList'])
      queryClient.invalidateQueries(['adminDashboard'])
      queryClient.invalidateQueries(['userAnalytics'])
    }
  })
}

// Delete User
export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userId) => {
      try {
        const response = await api.delete(`/admin/users/${userId}`)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['usersList'])
      queryClient.invalidateQueries(['adminDashboard'])
      queryClient.invalidateQueries(['userAnalytics'])
    }
  })
}

// ============================================================================
// CONTENT MANAGEMENT HOOKS
// ============================================================================

// Content List (Admin)
export const useAdminContentList = (options = {}) => {
  return useQuery({
    queryKey: ['adminContentList', options],
    queryFn: async () => {
      try {
        const response = await api.get('/content', { params: { ...options, admin: true } })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    retry: 2
  })
}

// Content Analytics (Admin)
export const useAdminContentAnalytics = (options = {}) => {
  return useQuery({
    queryKey: ['adminContentAnalytics', options],
    queryFn: async () => {
      try {
        const response = await api.get('/analytics/content', { params: { ...options, admin: true } })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  })
}

// Delete Content (Admin)
export const useAdminDeleteContent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (contentId) => {
      try {
        const response = await api.delete(`/content/${contentId}`)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminContentList'])
      queryClient.invalidateQueries(['adminContentAnalytics'])
      queryClient.invalidateQueries(['adminDashboard'])
    }
  })
}

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

// Login
export const useLogin = () => {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      try {
        const response = await api.post('/auth/login', { email, password })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    }
  })
}

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        // Continue with logout even if API call fails
        console.warn('Logout API call failed:', error)
      }
    },
    onSuccess: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      queryClient.clear()
    }
  })
}

// Get Current User
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    enabled: !!localStorage.getItem('token')
  })
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Refresh All Data
export const useRefreshAllData = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      // This doesn't make an API call, just refreshes cached data
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminDashboard'])
      queryClient.invalidateQueries(['systemHealth'])
      queryClient.invalidateQueries(['userAnalytics'])
      queryClient.invalidateQueries(['revenueAnalytics'])
      queryClient.invalidateQueries(['platformStats'])
      queryClient.invalidateQueries(['adminAlerts'])
      queryClient.invalidateQueries(['usersList'])
      queryClient.invalidateQueries(['adminContentList'])
    }
  })
}

// Export API instance for direct use if needed
export { api }

// Export default configuration
export default {
  api,
  API_BASE_URL
}
