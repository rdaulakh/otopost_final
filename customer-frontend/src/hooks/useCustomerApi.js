import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '../config/api.js'

// Import the configured API client
import apiClient from '../config/api.js'

// Get API_BASE_URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Use the configured API client
const api = apiClient

// Note: API client already has request/response interceptors configured

// Generic error handler
const handleApiError = (error) => {
  console.error('API Error:', error)
  throw new Error(
    error.response?.data?.message || 
    error.message || 
    'An unexpected error occurred'
  )
}

// Helper function to safely handle options parameter
const safeOptions = (options) => {
  return options && typeof options === 'object' ? options : {}
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

// Analytics Overview
export const useAnalyticsOverview = (options = {}, queryOptions = {}) => {
  return useQuery({
    queryKey: ['analyticsOverview', options],
    queryFn: async () => {
      try {
        const response = await api.get('/analytics/dashboard', { params: safeOptions(options) })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    ...queryOptions
  })
}

// Performance Analytics
export const useAnalyticsPerformance = (options = {}) => {
  return useQuery({
    queryKey: ['analyticsPerformance', options],
    queryFn: async () => {
      try {
        const response = await api.get('/analytics/content-performance', { params: safeOptions(options) })
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

// Engagement Analytics
export const useAnalyticsEngagement = (options = {}) => {
  return useQuery({
    queryKey: ['analyticsEngagement', options],
    queryFn: async () => {
      try {
        const response = await api.get('/analytics/platform', { params: safeOptions(options) })
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

// Audience Analytics
export const useAnalyticsAudience = (options = {}) => {
  return useQuery({
    queryKey: ['analyticsAudience', options],
    queryFn: async () => {
      try {
        const response = await api.get('/analytics/audience', { params: safeOptions(options) })
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

// Content Analytics
export const useContentAnalytics = (options = {}) => {
  return useQuery({
    queryKey: ['contentAnalytics', options],
    queryFn: async () => {
      try {
        const response = await api.get('/analytics/content-performance', { params: safeOptions(options) })
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

// Performance Analytics (alias for backward compatibility)
export const usePerformanceAnalytics = (options = {}) => {
  return useAnalyticsPerformance(options)
}

// ============================================================================
// CONTENT MANAGEMENT HOOKS
// ============================================================================

// Get Content List
export const useContentList = (options = {}, queryOptions = {}) => {
  return useQuery({
    queryKey: ['contentList', options],
    queryFn: async () => {
      try {
        const response = await api.get('/content', { params: safeOptions(options) })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    retry: 2,
    ...queryOptions
  })
}

// Create Content
export const useCreateContent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (contentData) => {
      try {
        const response = await api.post('/content', contentData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contentList'])
      queryClient.invalidateQueries(['contentAnalytics'])
      queryClient.invalidateQueries(['analyticsOverview'])
    }
  })
}

// Update Content
export const useUpdateContent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...contentData }) => {
      try {
        const response = await api.put(API_ENDPOINTS.CONTENT.UPDATE(id), contentData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contentList'])
      queryClient.invalidateQueries(['contentAnalytics'])
      queryClient.invalidateQueries(['analyticsOverview'])
    }
  })
}

// Delete Content
export const useDeleteContent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (contentId) => {
      try {
        const response = await api.delete(API_ENDPOINTS.CONTENT.DELETE(contentId))
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contentList'])
      queryClient.invalidateQueries(['contentAnalytics'])
      queryClient.invalidateQueries(['analyticsOverview'])
    }
  })
}

// Get Content Batch (for calendar view)
export const useContentBatch = (options = {}) => {
  return useQuery({
    queryKey: ['contentBatch', options],
    queryFn: async () => {
      try {
        const response = await api.get('/content/batch', { params: safeOptions(options) })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })
}

// Approve Content
export const useContentApprove = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ contentId, feedback }) => {
      try {
        const response = await api.post(`${API_ENDPOINTS.CONTENT.UPDATE(contentId)}/approve`, { feedback })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contentList'])
      queryClient.invalidateQueries(['contentBatch'])
      queryClient.invalidateQueries(['analyticsOverview'])
    }
  })
}

// Reject Content
export const useContentReject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ contentId, feedback }) => {
      try {
        const response = await api.post(`${API_ENDPOINTS.CONTENT.UPDATE(contentId)}/reject`, { feedback })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contentList'])
      queryClient.invalidateQueries(['contentBatch'])
    }
  })
}

// Schedule Content
export const useContentSchedule = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ contentId, scheduledTime, platforms }) => {
      try {
        const response = await api.post(API_ENDPOINTS.CONTENT.SCHEDULE(contentId), { 
          scheduledTime, 
          platforms 
        })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contentList'])
      queryClient.invalidateQueries(['contentBatch'])
      queryClient.invalidateQueries(['scheduledPosts'])
    }
  })
}

// ============================================================================
// CONTENT CALENDAR HOOKS
// ============================================================================

// Content Calendar Hook
export const useContentCalendar = (options = {}) => {
  return useQuery({
    queryKey: ['contentCalendar', options],
    queryFn: async () => {
      try {
        const response = await api.get('/content/calendar', { params: safeOptions(options) })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })
}

// Create Post Hook
export const useCreatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (postData) => {
      try {
        const response = await api.post('/content/posts', postData)
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentCalendar'] })
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] })
      queryClient.invalidateQueries({ queryKey: ['contentList'] })
    }
  })
}

// Update Post Hook
export const useUpdatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ postId, updates }) => {
      try {
        const response = await api.put(API_ENDPOINTS.CONTENT.UPDATE(postId), updates)
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentCalendar'] })
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] })
      queryClient.invalidateQueries({ queryKey: ['contentList'] })
    }
  })
}

// Delete Post Hook
export const useDeletePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (postId) => {
      try {
        const response = await api.delete(API_ENDPOINTS.CONTENT.DELETE(postId))
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentCalendar'] })
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] })
      queryClient.invalidateQueries({ queryKey: ['contentList'] })
    }
  })
}

// ============================================================================
// AI HOOKS
// ============================================================================

// Generate Content with AI
export const useAIContentGeneration = () => {
  return useMutation({
    mutationFn: async (contentData) => {
      try {
        const response = await api.post('/ai-content/generate', contentData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    }
  })
}

// Improve Content with AI
export const useAIContentImprovement = () => {
  return useMutation({
    mutationFn: async (improvementData) => {
      try {
        const response = await api.post('/ai-content/improve', improvementData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    }
  })
}

// Generate Hashtags with AI
export const useAIHashtagGeneration = () => {
  return useMutation({
    mutationFn: async (hashtagData) => {
      try {
        const response = await api.post('/ai-content/hashtags', hashtagData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    }
  })
}

// Analyze Content with AI
export const useAIContentAnalysis = () => {
  return useMutation({
    mutationFn: async (analysisData) => {
      try {
        const response = await api.post('/ai-content/analyze', analysisData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    }
  })
}

// Generate Strategy with AI
export const useGenerateStrategy = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (strategyData) => {
      try {
        const response = await api.post('/ai-strategy/generate', strategyData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategies'])
    }
  })
}

// Get AI Strategies
export const useStrategies = (options = {}) => {
  return useQuery({
    queryKey: ['strategies', options],
    queryFn: async () => {
      try {
        const response = await api.get('/ai-strategy/strategies', { params: safeOptions(options) })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 2
  })
}

// AI Analysis
export const useAIAnalysis = () => {
  return useMutation({
    mutationFn: async (analysisData) => {
      try {
        const response = await api.post('/ai-strategy/analyze', analysisData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    }
  })
}

// Update Strategy
export const useUpdateStrategy = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...strategyData }) => {
      try {
        const response = await api.put(`/ai-strategy/${id}`, strategyData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategies'])
    }
  })
}

// Strategy Performance
export const useStrategyPerformance = (options = {}) => {
  return useQuery({
    queryKey: ['strategyPerformance', options],
    queryFn: async () => {
      try {
        const response = await api.get('/ai-strategy/performance', { params: safeOptions(options) })
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

// ============================================================================
// MEDIA HOOKS
// ============================================================================

// Upload Media
export const useUploadMedia = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (formData) => {
      try {
        const response = await api.post('/media/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mediaList'])
    }
  })
}

// Get Media List
export const useMediaList = (options = {}) => {
  return useQuery({
    queryKey: ['mediaList', options],
    queryFn: async () => {
      try {
        const response = await api.get('/media', { params: safeOptions(options) })
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

// ============================================================================
// SOCIAL PROFILES HOOKS
// ============================================================================

// Get Social Profiles
export const useSocialProfiles = (queryOptions = {}) => {
  return useQuery({
    queryKey: ['socialProfiles'],
    queryFn: async () => {
      try {
        const response = await api.get('/social-accounts')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    ...queryOptions
  })
}

// Connect Social Profile
export const useConnectSocialProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (profileData) => {
      try {
        const response = await api.post(API_ENDPOINTS.SOCIAL_PROFILES.CONNECT, profileData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['socialProfiles'])
    }
  })
}

// Disconnect Social Profile
export const useDisconnectSocialProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (profileId) => {
      try {
        const response = await api.delete(API_ENDPOINTS.SOCIAL_PROFILES.DISCONNECT(profileId))
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['socialProfiles'])
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

// Register
export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData) => {
      try {
        const response = await api.post('/auth/register', userData)
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
      localStorage.removeItem('authToken')
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
        const response = await api.get('/users/profile')
        return response.data.data.user
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    enabled: !!localStorage.getItem('authToken')
  })
}

// ============================================================================
// CAMPAIGN MANAGEMENT HOOKS
// ============================================================================

// Get Campaigns List
export const useCampaignList = (options = {}) => {
  return useQuery({
    queryKey: ['campaignList', options],
    queryFn: async () => {
      try {
        const response = await api.get(API_ENDPOINTS.CAMPAIGNS.LIST, { params: safeOptions(options) })
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

// Get Campaign Statistics
export const useCampaignStats = (options = {}) => {
  return useQuery({
    queryKey: ['campaignStats', options],
    queryFn: async () => {
      try {
        const response = await api.get(`${API_ENDPOINTS.CAMPAIGNS.LIST}/stats`, { params: safeOptions(options) })
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

// Create Campaign
export const useCreateCampaign = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (campaignData) => {
      try {
        const response = await api.post(API_ENDPOINTS.CAMPAIGNS.CREATE, campaignData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaignList'])
      queryClient.invalidateQueries(['campaignStats'])
    }
  })
}

// Update Campaign
export const useUpdateCampaign = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...campaignData }) => {
      try {
        const response = await api.put(API_ENDPOINTS.CAMPAIGNS.UPDATE(id), campaignData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaignList'])
      queryClient.invalidateQueries(['campaignStats'])
    }
  })
}

// Delete Campaign
export const useDeleteCampaign = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (campaignId) => {
      try {
        const response = await api.delete(API_ENDPOINTS.CAMPAIGNS.DELETE(campaignId))
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaignList'])
      queryClient.invalidateQueries(['campaignStats'])
    }
  })
}

// Get Campaign Analytics
export const useCampaignAnalytics = (campaignId, options = {}) => {
  return useQuery({
    queryKey: ['campaignAnalytics', campaignId, options],
    queryFn: async () => {
      try {
        const response = await api.get(API_ENDPOINTS.CAMPAIGNS.ANALYTICS(campaignId), { params: safeOptions(options) })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    enabled: !!campaignId
  })
}

// Campaign Optimization
export const useCampaignOptimization = () => {
  return useMutation({
    mutationFn: async (campaignId) => {
      try {
        const response = await api.post(API_ENDPOINTS.CAMPAIGNS.OPTIMIZE(campaignId))
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    }
  })
}

// AI Recommendations for Campaigns
export const useAIRecommendations = (options = {}) => {
  return useQuery({
    queryKey: ['aiRecommendations', options],
    queryFn: async () => {
      try {
        // Mock AI recommendations for now
        return {
          recommendations: [
            {
              type: 'budget',
              title: 'Optimize Budget Allocation',
              description: 'Reallocate 20% of budget from underperforming campaigns to high-ROAS campaigns',
              impact: 'high',
              estimatedImprovement: '+15% ROAS'
            },
            {
              type: 'targeting',
              title: 'Expand Successful Audiences',
              description: 'Create lookalike audiences based on your best converting segments',
              impact: 'medium',
              estimatedImprovement: '+25% reach'
            }
          ],
          lastUpdated: new Date()
        }
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 2
  })
}

// ============================================================================
// BOOST MANAGEMENT HOOKS
// ============================================================================

// Get Boost Recommendations
export const useBoostRecommendations = (options = {}) => {
  return useQuery({
    queryKey: ['boostRecommendations', options],
    queryFn: async () => {
      try {
        const response = await api.get('/boosts/recommendations', { params: safeOptions(options) })
        return response.data.data
      } catch (error) {
        console.error('Boost recommendations error:', error)
        return [] // Return empty array instead of throwing
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  })
}

// Get Recent Posts for Boosting
export const useRecentPosts = (options = {}) => {
  return useQuery({
    queryKey: ['recentPosts', options],
    queryFn: async () => {
      try {
        const response = await api.get('/boosts/recent-posts', { params: safeOptions(options) })
        return response.data.data
      } catch (error) {
        console.error('Recent posts error:', error)
        return { posts: [] } // Return empty object with posts array
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    retry: 2
  })
}

// Get Active Boosts
export const useActiveBoosts = () => {
  return useQuery({
    queryKey: ['activeBoosts'],
    queryFn: async () => {
      try {
        const response = await api.get('/boosts/active')
        return response.data.data
      } catch (error) {
        console.error('Active boosts error:', error)
        return [] // Return empty array instead of throwing
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for active boosts
    retry: 2
  })
}

// Create Boost
export const useCreateBoost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (boostData) => {
      try {
        const response = await api.post('/boosts', boostData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeBoosts'])
      queryClient.invalidateQueries(['boostRecommendations'])
      queryClient.invalidateQueries(['boostAnalytics'])
    }
  })
}

// Update Boost
export const useUpdateBoost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...boostData }) => {
      try {
        const response = await api.put(API_ENDPOINTS.BOOSTS.UPDATE(id), boostData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeBoosts'])
      queryClient.invalidateQueries(['boostAnalytics'])
    }
  })
}

// Delete/Stop Boost
export const useDeleteBoost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (boostId) => {
      try {
        const response = await api.delete(API_ENDPOINTS.BOOSTS.DELETE(boostId))
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeBoosts'])
      queryClient.invalidateQueries(['boostAnalytics'])
    }
  })
}

// Get Boost Analytics
export const useBoostAnalytics = (options = {}) => {
  return useQuery({
    queryKey: ['boostAnalytics', options],
    queryFn: async () => {
      try {
        const response = await api.get('/boosts/analytics', { params: safeOptions(options) })
        return response.data.data
      } catch (error) {
        console.error('Boost analytics error:', error)
        return {} // Return empty object instead of throwing
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  })
}

// Boost Prediction
export const useBoostPrediction = () => {
  return useMutation({
    mutationFn: async (predictionData) => {
      try {
        const response = await api.post('/boosts/predict', predictionData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    }
  })
}

// ============================================================================
// SOCIAL PUBLISHING HOOKS
// ============================================================================

// Publish Content to Social Media
export const usePublishContent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (publishData) => {
      try {
        const response = await api.post('/social-publishing/publish', publishData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contentList'])
      queryClient.invalidateQueries(['scheduledPosts'])
      queryClient.invalidateQueries(['analyticsOverview'])
    }
  })
}

// Get Post Analytics
export const usePostAnalytics = (platform, postId) => {
  return useQuery({
    queryKey: ['postAnalytics', platform, postId],
    queryFn: async () => {
      try {
        const response = await api.get(API_ENDPOINTS.SOCIAL_PUBLISHING.ANALYTICS(platform, postId))
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: !!(platform && postId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  })
}

// Get Scheduled Posts
export const useScheduledPosts = (options = {}) => {
  return useQuery({
    queryKey: ['scheduledPosts', options],
    queryFn: async () => {
      try {
        const response = await api.get('/social-publishing/scheduled', { params: safeOptions(options) })
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

// Update Scheduled Post
export const useUpdateScheduledPost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      try {
        const response = await api.put(API_ENDPOINTS.SOCIAL_PUBLISHING.SCHEDULED_UPDATE(id), updateData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduledPosts'])
    }
  })
}

// Cancel Scheduled Post
export const useCancelScheduledPost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (postId) => {
      try {
        const response = await api.delete(API_ENDPOINTS.SOCIAL_PUBLISHING.SCHEDULED_DELETE(postId))
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduledPosts'])
    }
  })
}

// Test Social Media Connection
export const useTestConnection = () => {
  return useMutation({
    mutationFn: async (platform) => {
      try {
        const response = await api.post(API_ENDPOINTS.SOCIAL_PUBLISHING.TEST_CONNECTION(platform))
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    }
  })
}

// ============================================================================
// AI AGENTS HOOKS
// ============================================================================

// Get AI Agents Status
export const useAIAgents = (queryOptions = {}) => {
  return useQuery({
    queryKey: ['aiAgents'],
    queryFn: async () => {
      try {
        console.log('Fetching AI agents from:', api.defaults.baseURL + '/ai-agents')
        const response = await api.get('/ai-agents')
        console.log('AI agents response:', response.data)
        return response.data.data
      } catch (error) {
        console.error('Error fetching AI agents:', error)
        console.error('Error details:', error.response?.data)
        // Return empty data structure if server is not available
        return {
          agents: [],
          summary: {
            totalAgents: 0,
            activeAgents: 0,
            avgEfficiency: 0,
            totalTasksCompleted: 0,
            totalTasksInProgress: 0,
            systemStatus: 'needs_attention'
          }
        }
      }
    },
    staleTime: 30 * 1000, // 30 seconds - AI agents data should be fresh
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
    ...queryOptions
  })
}

// Get Specific AI Agent Details
export const useAIAgentDetails = (agentId) => {
  return useQuery({
    queryKey: ['aiAgentDetails', agentId],
    queryFn: async () => {
      try {
        const response = await api.get(`/ai-agents/${agentId}`)
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: !!agentId,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    retry: 2
  })
}

// Restart AI Agent
export const useRestartAIAgent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (agentId) => {
      try {
        const response = await api.post(`/ai-agents/${agentId}/restart`)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['aiAgents'])
      queryClient.invalidateQueries(['aiAgentDetails'])
    }
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
      queryClient.invalidateQueries(['analyticsOverview'])
      queryClient.invalidateQueries(['analyticsPerformance'])
      queryClient.invalidateQueries(['analyticsEngagement'])
      queryClient.invalidateQueries(['analyticsAudience'])
      queryClient.invalidateQueries(['contentAnalytics'])
      queryClient.invalidateQueries(['contentList'])
      queryClient.invalidateQueries(['strategies'])
      queryClient.invalidateQueries(['socialProfiles'])
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

// ============================================================================
// CUSTOMER DASHBOARD HOOKS
// ============================================================================

// Dashboard Overview
export const useDashboardOverview = (timeRange = '7d') => {
  return useQuery({
    queryKey: ['dashboardOverview', timeRange],
    queryFn: async () => {
      try {
        const response = await api.get('/analytics/overview', { params: { timeRange } })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2
  })
}

// Analytics Overview (Customer Dashboard)
export const useCustomerAnalyticsOverview = (timeRange = '7d') => {
  return useQuery({
    queryKey: ['customerAnalyticsOverview', timeRange],
    queryFn: async () => {
      try {
        const response = await api.get('/analytics/performance', { params: { timeRange } })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 8 * 60 * 1000, // 8 minutes
    retry: 2
  })
}

// Content List (Customer Dashboard)
export const useCustomerContentList = (options = {}) => {
  return useQuery({
    queryKey: ['customerContentList', options],
    queryFn: async () => {
      try {
        const response = await api.get('/content', { params: safeOptions(options) })
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 3 * 60 * 1000, // 3 minutes
    keepPreviousData: true,
    retry: 2
  })
}

// AI Agents Status
export const useCustomerAIAgents = () => {
  return useQuery({
    queryKey: ['customerAIAgents'],
    queryFn: async () => {
      try {
        const response = await api.get('/ai-agents')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
    retry: 2
  })
}

// Usage Statistics
export const useCustomerUsageStats = (queryOptions = {}) => {
  return useQuery({
    queryKey: ['customerUsageStats'],
    queryFn: async () => {
      try {
        const response = await api.get('/users/profile')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions
  })
}

// Social Profiles
export const useCustomerSocialProfiles = () => {
  return useQuery({
    queryKey: ['customerSocialProfiles'],
    queryFn: async () => {
      try {
        const response = await api.get('/social-profiles')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
    retry: 2
  })
}

// User Subscription
export const useCustomerSubscription = (queryOptions = {}) => {
  return useQuery({
    queryKey: ['customerSubscription'],
    queryFn: async () => {
      try {
        const response = await api.get('/users/subscription')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...queryOptions
  })
}

// ============================================================================
// PERFORMANCE ANALYTICS HOOKS - REMOVED DUPLICATES
// ============================================================================
// Note: These functions are already defined earlier in the file

// ============================================================================
// STRATEGY PLANNER HOOKS - REMOVED DUPLICATES
// ============================================================================
// Note: These functions are already defined earlier in the file

// ============================================================================
// AI PERFORMANCE LEARNING HOOKS
// ============================================================================

// AI Learning Insights
export const useAILearningInsights = () => {
  return useQuery({
    queryKey: ['aiLearningInsights'],
    queryFn: async () => {
      try {
        const response = await api.get('/ai-strategy/learning-insights')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 2
  })
}

// AI Agent Performance
export const useAIAgentPerformance = () => {
  return useQuery({
    queryKey: ['aiAgentPerformance'],
    queryFn: async () => {
      try {
        const response = await api.get('/ai-strategy/agent-performance')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  })
}

// AI Learning Progress
export const useAILearningProgress = () => {
  return useQuery({
    queryKey: ['aiLearningProgress'],
    queryFn: async () => {
      try {
        const response = await api.get('/ai-strategy/learning-progress')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 8 * 60 * 1000, // 8 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
    retry: 2
  })
}

