import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../config/api.js'

// Generic error handler
const handleApiError = (error) => {
  console.error('AI Agents API Error:', error)
  throw new Error(
    error.response?.data?.message || 
    error.message || 
    'An unexpected error occurred with AI agents'
  )
}

// ============================================================================
// AI AGENTS STATUS HOOKS
// ============================================================================

// Get all AI agents status
export const useAIAgentsStatus = (queryOptions = {}) => {
  return useQuery({
    queryKey: ['aiAgentsStatus'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/content/agents/status')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
    ...queryOptions
  })
}

// ============================================================================
// CONTENT GENERATION HOOKS
// ============================================================================

// Generate content using AI agents
export const useGenerateContent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (options = {}) => {
      try {
        const response = await apiClient.post('/content/generate', { options })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries(['workflowHistory'])
      queryClient.invalidateQueries(['userStats'])
      queryClient.invalidateQueries(['aiAgentsStatus'])
    },
    onError: (error) => {
      console.error('Content generation failed:', error)
    }
  })
}

// Generate strategy using AI agents
export const useGenerateStrategy = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (options = {}) => {
      try {
        const response = await apiClient.post('/content/strategy', { options })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['workflowHistory'])
      queryClient.invalidateQueries(['userStats'])
      queryClient.invalidateQueries(['aiAgentsStatus'])
    },
    onError: (error) => {
      console.error('Strategy generation failed:', error)
    }
  })
}

// Analyze performance using AI agents
export const useAnalyzePerformance = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ performanceData, options = {} }) => {
      try {
        const response = await apiClient.post('/content/analyze', { 
          performanceData, 
          options 
        })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['workflowHistory'])
      queryClient.invalidateQueries(['userStats'])
      queryClient.invalidateQueries(['aiAgentsStatus'])
    },
    onError: (error) => {
      console.error('Performance analysis failed:', error)
    }
  })
}

// ============================================================================
// WORKFLOW MANAGEMENT HOOKS
// ============================================================================

// Get workflow history
export const useWorkflowHistory = (limit = 10, queryOptions = {}) => {
  return useQuery({
    queryKey: ['workflowHistory', limit],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/content/workflows/history?limit=${limit}`)
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    ...queryOptions
  })
}

// Get specific workflow status
export const useWorkflowStatus = (workflowId, queryOptions = {}) => {
  return useQuery({
    queryKey: ['workflowStatus', workflowId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/content/workflows/${workflowId}/status`)
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: !!workflowId,
    staleTime: 10 * 1000, // 10 seconds
    cacheTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 1000, // Refresh every 5 seconds for active workflows
    retry: 2,
    ...queryOptions
  })
}

// Get user workflow statistics
export const useUserWorkflowStats = (queryOptions = {}) => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/content/user/stats')
        return response.data.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    ...queryOptions
  })
}

// Cancel workflow
export const useCancelWorkflow = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (workflowId) => {
      try {
        const response = await apiClient.post(`/content/workflows/${workflowId}/cancel`)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: (data, workflowId) => {
      // Invalidate related queries
      queryClient.invalidateQueries(['workflowHistory'])
      queryClient.invalidateQueries(['workflowStatus', workflowId])
      queryClient.invalidateQueries(['userStats'])
      queryClient.invalidateQueries(['aiAgentsStatus'])
    },
    onError: (error) => {
      console.error('Workflow cancellation failed:', error)
    }
  })
}

// ============================================================================
// REAL-TIME WORKFLOW TRACKING HOOK
// ============================================================================

// Custom hook for real-time workflow tracking
export const useWorkflowTracker = (workflowId) => {
  const [isTracking, setIsTracking] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [error, setError] = useState(null)
  
  const { data: workflowStatus, isLoading } = useWorkflowStatus(
    workflowId, 
    { 
      enabled: !!workflowId && isTracking,
      refetchInterval: isTracking ? 2000 : false // Poll every 2 seconds when tracking
    }
  )

  useEffect(() => {
    if (workflowStatus) {
      setProgress(workflowStatus.progress?.percentage || 0)
      setCurrentStep(workflowStatus.progress?.currentStep || '')
      
      // Stop tracking if workflow is completed or failed
      if (workflowStatus.status === 'completed' || workflowStatus.status === 'failed') {
        setIsTracking(false)
        if (workflowStatus.status === 'failed') {
          setError(workflowStatus.error?.message || 'Workflow failed')
        }
      }
    }
  }, [workflowStatus])

  const startTracking = () => {
    setIsTracking(true)
    setError(null)
  }

  const stopTracking = () => {
    setIsTracking(false)
  }

  return {
    isTracking,
    progress,
    currentStep,
    error,
    workflowStatus,
    isLoading,
    startTracking,
    stopTracking
  }
}

// ============================================================================
// AI AGENTS DASHBOARD DATA HOOK
// ============================================================================

// Combined hook for AI agents dashboard
export const useAIAgentsDashboard = () => {
  const agentsStatus = useAIAgentsStatus()
  const workflowHistory = useWorkflowHistory(5)
  const userStats = useUserWorkflowStats()

  return {
    agentsStatus: agentsStatus.data,
    workflowHistory: workflowHistory.data,
    userStats: userStats.data,
    isLoading: agentsStatus.isLoading || workflowHistory.isLoading || userStats.isLoading,
    error: agentsStatus.error || workflowHistory.error || userStats.error,
    refetch: () => {
      agentsStatus.refetch()
      workflowHistory.refetch()
      userStats.refetch()
    }
  }
}
