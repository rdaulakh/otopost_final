import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Target, 
  BarChart3, 
  PlayCircle, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Share2
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'

import { 
  useGenerateContent,
  useGenerateStrategy,
  useAnalyzePerformance,
  useWorkflowTracker
} from '../hooks/useAIAgents.js'

const ContentGenerator = () => {
  const [activeWorkflow, setActiveWorkflow] = useState(null)
  const [generatedContent, setGeneratedContent] = useState(null)
  
  // Mutations
  const generateContent = useGenerateContent()
  const generateStrategy = useGenerateStrategy()
  const analyzePerformance = useAnalyzePerformance()
  
  // Workflow tracker
  const workflowTracker = useWorkflowTracker(activeWorkflow)

  const handleGenerateContent = async () => {
    try {
      const result = await generateContent.mutateAsync({
        platforms: ['instagram', 'linkedin'],
        contentTypes: ['carousel', 'single_image', 'video'],
        tone: 'professional',
        industry: 'technology'
      })
      
      if (result.data.workflowId) {
        setActiveWorkflow(result.data.workflowId)
        workflowTracker.startTracking()
      }
      
      if (result.data.result) {
        setGeneratedContent(result.data.result)
      }
    } catch (error) {
      console.error('Failed to generate content:', error)
    }
  }

  const handleGenerateStrategy = async () => {
    try {
      const result = await generateStrategy.mutateAsync({
        timeframe: '30d',
        goals: ['brand_awareness', 'lead_generation'],
        platforms: ['instagram', 'linkedin', 'twitter']
      })
      
      if (result.data.workflowId) {
        setActiveWorkflow(result.data.workflowId)
        workflowTracker.startTracking()
      }
      
      if (result.data.result) {
        setGeneratedContent(result.data.result)
      }
    } catch (error) {
      console.error('Failed to generate strategy:', error)
    }
  }

  const handleAnalyzePerformance = async () => {
    try {
      // Mock performance data
      const mockData = {
        posts: [
          { id: 1, platform: 'instagram', engagement: 150, reach: 1000, likes: 80 },
          { id: 2, platform: 'linkedin', engagement: 200, reach: 1500, likes: 120 }
        ],
        totalReach: 2500,
        totalEngagement: 350,
        avgEngagementRate: 14
      }
      
      const result = await analyzePerformance.mutateAsync({ 
        performanceData: mockData 
      })
      
      if (result.data.workflowId) {
        setActiveWorkflow(result.data.workflowId)
        workflowTracker.startTracking()
      }
      
      if (result.data.result) {
        setGeneratedContent(result.data.result)
      }
    } catch (error) {
      console.error('Failed to analyze performance:', error)
    }
  }

  const renderGeneratedContent = () => {
    if (!generatedContent) return null

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Generated Results
          </CardTitle>
          <CardDescription>
            AI workflow completed successfully
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Generated Posts */}
            {generatedContent.generatedPosts && (
              <div>
                <h4 className="font-semibold mb-3">Generated Posts ({generatedContent.generatedPosts.length})</h4>
                <div className="grid gap-4">
                  {generatedContent.generatedPosts.map((post, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{post.idea}</Badge>
                            <Badge>{post.targetAudience}</Badge>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Caption:</h5>
                            <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                              {post.caption}
                            </p>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Hashtags:</h5>
                            <p className="text-sm text-blue-600">{post.hashtags}</p>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Visual Suggestion:</h5>
                            <p className="text-sm text-muted-foreground">{post.visualSuggestion}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share2 className="h-4 w-4 mr-2" />
                              Schedule
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Strategy Results */}
            {generatedContent.contentStrategy && (
              <div>
                <h4 className="font-semibold mb-3">Content Strategy</h4>
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium">Brand Voice:</h5>
                        <p className="text-sm text-muted-foreground">
                          {JSON.stringify(generatedContent.brandVoice, null, 2)}
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium">Content Pillars:</h5>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {generatedContent.contentPillars?.pillars?.map((pillar, index) => (
                            <Badge key={index} variant="secondary">
                              {pillar.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Performance Analysis */}
            {generatedContent.performanceAnalysis && (
              <div>
                <h4 className="font-semibold mb-3">Performance Analysis</h4>
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium">Key Insights:</h5>
                        <p className="text-sm text-muted-foreground">
                          {JSON.stringify(generatedContent.performanceAnalysis, null, 2)}
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium">ROI Analysis:</h5>
                        <p className="text-sm text-muted-foreground">
                          {JSON.stringify(generatedContent.roiAnalysis, null, 2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Summary */}
            {generatedContent.summary && (
              <div>
                <h4 className="font-semibold mb-3">Summary</h4>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {generatedContent.summary.postsGenerated || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Posts Generated</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {generatedContent.summary.contentPillars || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Content Pillars</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {generatedContent.summary.platforms?.length || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Platforms</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {generatedContent.summary.estimatedReach || 'TBD'}
                        </p>
                        <p className="text-sm text-muted-foreground">Est. Reach</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">AI Content Generator</h1>
        <p className="text-muted-foreground">
          Generate content, strategies, and insights using our 7 AI agents
        </p>
      </div>

      {/* Active Workflow Tracker */}
      {workflowTracker.isTracking && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              AI Workflow in Progress
            </CardTitle>
            <CardDescription>
              {workflowTracker.currentStep || 'Processing...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(workflowTracker.progress)}%</span>
              </div>
              <Progress value={workflowTracker.progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
              Generate Content
            </CardTitle>
            <CardDescription>
              Create social media posts using all 7 AI agents working together
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={handleGenerateContent}
              disabled={generateContent.isPending || workflowTracker.isTracking}
            >
              {generateContent.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-2" />
              )}
              Generate Posts
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-500" />
              Generate Strategy
            </CardTitle>
            <CardDescription>
              Create comprehensive content strategy with market insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={handleGenerateStrategy}
              disabled={generateStrategy.isPending || workflowTracker.isTracking}
            >
              {generateStrategy.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-2" />
              )}
              Generate Strategy
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Analyze Performance
            </CardTitle>
            <CardDescription>
              Get AI-powered insights and optimization recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={handleAnalyzePerformance}
              disabled={analyzePerformance.isPending || workflowTracker.isTracking}
            >
              {analyzePerformance.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-2" />
              )}
              Analyze Performance
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Generated Content Display */}
      {renderGeneratedContent()}

      {/* Error Display */}
      {(generateContent.error || generateStrategy.error || analyzePerformance.error) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              {generateContent.error?.message || 
               generateStrategy.error?.message || 
               analyzePerformance.error?.message}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ContentGenerator
