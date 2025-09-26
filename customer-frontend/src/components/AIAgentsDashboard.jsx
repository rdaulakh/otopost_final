import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Target, 
  Sparkles, 
  Play, 
  BarChart3, 
  MessageCircle, 
  Activity,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  Users,
  Eye,
  Settings,
  Loader2,
  PlayCircle,
  StopCircle,
  History,
  Award,
  Cpu,
  Database,
  Signal
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'

import { 
  useAIAgentsDashboard,
  useGenerateContent,
  useGenerateStrategy,
  useAnalyzePerformance,
  useWorkflowTracker,
  useCancelWorkflow
} from '../hooks/useAIAgents.js'

const AIAgentsDashboard = () => {
  const [activeWorkflow, setActiveWorkflow] = useState(null)
  const { agentsStatus, workflowHistory, userStats, isLoading, error, refetch } = useAIAgentsDashboard()
  
  // Mutations
  const generateContent = useGenerateContent()
  const generateStrategy = useGenerateStrategy()
  const analyzePerformance = useAnalyzePerformance()
  const cancelWorkflow = useCancelWorkflow()
  
  // Workflow tracker
  const workflowTracker = useWorkflowTracker(activeWorkflow)

  // Agent configurations
  const agentConfigs = {
    intelligence: {
      name: 'Intelligence Agent',
      icon: Brain,
      color: 'bg-blue-500',
      description: 'Data analysis and market insights'
    },
    strategy: {
      name: 'Strategy Agent',
      icon: Target,
      color: 'bg-green-500',
      description: 'Content strategy planning'
    },
    content: {
      name: 'Content Agent',
      icon: Sparkles,
      color: 'bg-purple-500',
      description: 'Content creation and optimization'
    },
    execution: {
      name: 'Execution Agent',
      icon: Play,
      color: 'bg-orange-500',
      description: 'Publishing and scheduling'
    },
    learning: {
      name: 'Learning Agent',
      icon: BarChart3,
      color: 'bg-indigo-500',
      description: 'Performance analysis and improvement'
    },
    engagement: {
      name: 'Engagement Agent',
      icon: MessageCircle,
      color: 'bg-pink-500',
      description: 'Community management'
    },
    analytics: {
      name: 'Analytics Agent',
      icon: Activity,
      color: 'bg-teal-500',
      description: 'Advanced reporting and metrics'
    }
  }

  const handleGenerateContent = async () => {
    try {
      const result = await generateContent.mutateAsync()
      if (result.data.workflowId) {
        setActiveWorkflow(result.data.workflowId)
        workflowTracker.startTracking()
      }
    } catch (error) {
      console.error('Failed to start content generation:', error)
    }
  }

  const handleGenerateStrategy = async () => {
    try {
      const result = await generateStrategy.mutateAsync()
      if (result.data.workflowId) {
        setActiveWorkflow(result.data.workflowId)
        workflowTracker.startTracking()
      }
    } catch (error) {
      console.error('Failed to start strategy generation:', error)
    }
  }

  const handleAnalyzePerformance = async () => {
    try {
      // Mock performance data for demo
      const mockPerformanceData = {
        posts: [
          { id: 1, engagement: 150, reach: 1000, likes: 80, comments: 15, shares: 5 },
          { id: 2, engagement: 200, reach: 1500, likes: 120, comments: 25, shares: 10 }
        ],
        totalReach: 2500,
        totalEngagement: 350,
        avgEngagementRate: 14
      }
      
      const result = await analyzePerformance.mutateAsync({ 
        performanceData: mockPerformanceData 
      })
      if (result.data.workflowId) {
        setActiveWorkflow(result.data.workflowId)
        workflowTracker.startTracking()
      }
    } catch (error) {
      console.error('Failed to start performance analysis:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'working': return 'text-yellow-500'
      case 'idle': return 'text-green-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'working': return <Loader2 className="h-4 w-4 animate-spin" />
      case 'idle': return <CheckCircle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading AI Agents Dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">Failed to load AI agents data</span>
        <Button onClick={refetch} variant="outline" className="ml-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and control your 7 specialized AI agents
          </p>
        </div>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Active Workflow Tracker */}
      {workflowTracker.isTracking && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Active Workflow: {activeWorkflow}
            </CardTitle>
            <CardDescription>
              Current Step: {workflowTracker.currentStep}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(workflowTracker.progress)}%</span>
              </div>
              <Progress value={workflowTracker.progress} className="w-full" />
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    cancelWorkflow.mutate(activeWorkflow)
                    workflowTracker.stopTracking()
                    setActiveWorkflow(null)
                  }}
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* AI Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentsStatus?.agents && Object.entries(agentsStatus.agents).map(([key, agent]) => {
              const config = agentConfigs[key]
              if (!config) return null

              const IconComponent = config.icon

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${config.color}`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{config.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {config.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className={`flex items-center ${getStatusColor(agent.status)}`}>
                          {getStatusIcon(agent.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Efficiency</span>
                          <span className="font-medium">{agent.efficiency}%</span>
                        </div>
                        <Progress value={agent.efficiency} className="w-full" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Tasks</span>
                            <p className="font-medium">{agent.tasksCompleted}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Errors</span>
                            <p className="font-medium">{agent.errors}</p>
                          </div>
                        </div>
                        {agent.lastActivity && (
                          <div className="text-xs text-muted-foreground">
                            Last active: {new Date(agent.lastActivity).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleGenerateContent}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                  Generate Content
                </CardTitle>
                <CardDescription>
                  Create social media posts using all 7 AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  disabled={generateContent.isPending || workflowTracker.isTracking}
                >
                  {generateContent.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <PlayCircle className="h-4 w-4 mr-2" />
                  )}
                  Start Workflow
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleGenerateStrategy}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-500" />
                  Generate Strategy
                </CardTitle>
                <CardDescription>
                  Create comprehensive content strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  disabled={generateStrategy.isPending || workflowTracker.isTracking}
                >
                  {generateStrategy.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <PlayCircle className="h-4 w-4 mr-2" />
                  )}
                  Start Workflow
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleAnalyzePerformance}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                  Analyze Performance
                </CardTitle>
                <CardDescription>
                  Get AI-powered performance insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  disabled={analyzePerformance.isPending || workflowTracker.isTracking}
                >
                  {analyzePerformance.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <PlayCircle className="h-4 w-4 mr-2" />
                  )}
                  Start Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Recent Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workflowHistory && workflowHistory.length > 0 ? (
                <div className="space-y-3">
                  {workflowHistory.map((workflow) => (
                    <div key={workflow.workflowId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={workflow.status === 'completed' ? 'default' : 'destructive'}>
                          {workflow.status}
                        </Badge>
                        <div>
                          <p className="font-medium">{workflow.type.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(workflow.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {workflow.summary?.postsGenerated || 0} posts
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {workflow.metrics?.totalDuration ? 
                            `${Math.round(workflow.metrics.totalDuration / 1000)}s` : 
                            'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No workflows found. Start your first AI workflow above!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  Total Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {userStats?.totalWorkflows || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  All time workflows executed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-blue-500" />
                  Active Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {agentsStatus?.orchestrator?.activeWorkflows || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Currently processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Signal className="h-5 w-5 mr-2 text-green-500" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  Online
                </div>
                <p className="text-sm text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AIAgentsDashboard
