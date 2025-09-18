import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Eye, 
  Check, 
  X, 
  Edit3, 
  Image, 
  Video, 
  FileText,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Zap,
  TrendingUp,
  MoreHorizontal,
  Play
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import PlatformPreview from './previews/PlatformPreview.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'


const ContentCalendar = ({ data, onDataUpdate }) => {
  const { isDarkMode } = useTheme()

  const [activeView, setActiveView] = useState('approval')
  const [selectedPost, setSelectedPost] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionStatus, setActionStatus] = useState(null)

  // Mock content batch data
  const [contentBatch, setContentBatch] = useState({
    weekOf: 'January 15-21, 2024',
    status: 'pending_approval',
    deadline: '2024-01-13T23:59:59',
    totalPosts: 14,
    approvedPosts: 0,
    rejectedPosts: 0,
    posts: [
      {
        id: 1,
        platform: 'instagram',
        type: 'carousel',
        title: 'New Year Productivity Tips',
        caption: '🚀 Start 2024 with these game-changing productivity hacks! Swipe to see how successful entrepreneurs maximize their time...',
        hashtags: ['#productivity', '#entrepreneur', '#newyear', '#success', '#tips'],
        scheduledTime: '2024-01-15T14:00:00',
        estimatedReach: '8,500-12,000',
        confidenceScore: 92,
        status: 'pending',
        designBrief: 'Modern carousel with 5 slides, each featuring a productivity tip with clean icons and brand colors',
        aiReasoning: 'High engagement expected due to New Year timing and actionable content format'
      },
      {
        id: 2,
        platform: 'linkedin',
        type: 'text_post',
        title: 'Industry Insights: SaaS Trends 2024',
        caption: 'The SaaS landscape is evolving rapidly. Here are 5 key trends that will shape our industry in 2024:\n\n1. AI-First Product Development\n2. Vertical SaaS Specialization\n3. Usage-Based Pricing Models\n4. Enhanced Security Focus\n5. Customer Success Automation\n\nWhich trend do you think will have the biggest impact? 💭',
        hashtags: ['#SaaS', '#TechTrends', '#AI', '#Innovation', '#B2B'],
        scheduledTime: '2024-01-15T09:00:00',
        estimatedReach: '3,200-4,800',
        confidenceScore: 88,
        status: 'pending',
        designBrief: 'Professional text post with subtle background pattern and company logo',
        aiReasoning: 'LinkedIn audience responds well to industry insights and discussion-starting questions'
      },
      {
        id: 3,
        platform: 'twitter',
        type: 'image',
        title: 'Quick Tip Tuesday',
        caption: '💡 Quick Tip Tuesday: Use the 2-minute rule for better productivity!\n\nIf a task takes less than 2 minutes, do it immediately instead of adding it to your to-do list.\n\nSimple but effective! 🎯\n\n#ProductivityTip #TuesdayTip #TimeManagement',
        hashtags: ['#ProductivityTip', '#TuesdayTip', '#TimeManagement'],
        scheduledTime: '2024-01-16T11:30:00',
        estimatedReach: '2,100-3,500',
        confidenceScore: 85,
        status: 'pending',
        designBrief: 'Eye-catching graphic with timer icon and bold typography on gradient background',
        aiReasoning: 'Twitter users engage well with quick, actionable tips and consistent series branding'
      },
      {
        id: 4,
        platform: 'facebook',
        type: 'video',
        title: 'Behind the Scenes: Team Meeting',
        caption: 'Ever wondered how we plan our product roadmap? 🤔\n\nTake a peek behind the scenes at our weekly strategy meeting! Our team is passionate about building tools that make your work life easier.\n\n#BehindTheScenes #TeamWork #ProductDevelopment #Company Culture',
        hashtags: ['#BehindTheScenes', '#TeamWork', '#ProductDevelopment'],
        scheduledTime: '2024-01-16T16:00:00',
        estimatedReach: '5,800-8,200',
        confidenceScore: 79,
        status: 'pending',
        designBrief: '60-second video montage with upbeat music, showing team collaboration and office environment',
        aiReasoning: 'Facebook users appreciate authentic behind-the-scenes content that humanizes the brand'
      },
      {
        id: 5,
        platform: 'instagram',
        type: 'reel',
        title: 'Feature Spotlight: AI Assistant',
        caption: '🤖 Meet your new AI assistant! Watch how it transforms your workflow in just 30 seconds ✨\n\n#AIAssistant #ProductDemo #Innovation #TechMagic #Productivity',
        hashtags: ['#AIAssistant', '#ProductDemo', '#Innovation', '#TechMagic'],
        scheduledTime: '2024-01-17T13:00:00',
        estimatedReach: '12,000-18,000',
        confidenceScore: 94,
        status: 'pending',
        designBrief: 'Dynamic reel with screen recordings, smooth transitions, and engaging text overlays',
        aiReasoning: 'Reels have highest reach potential, and product demos perform exceptionally well'
      }
    ]
  })

  const platformIcons = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube
  }

  const contentTypeIcons = {
    image: Image,
    video: Video,
    carousel: Image,
    reel: Video,
    text_post: FileText
  }

  const handlePostAction = async (postId, action, feedback = null) => {
    setIsProcessing(true)
    setActionStatus(null)

    // Simulate API call
    setTimeout(() => {
      setContentBatch(prev => ({
        ...prev,
        posts: prev.posts.map(post => 
          post.id === postId 
            ? { ...post, status: action, feedback }
            : post
        ),
        approvedPosts: action === 'approved' ? prev.approvedPosts + 1 : prev.approvedPosts,
        rejectedPosts: action === 'rejected' ? prev.rejectedPosts + 1 : prev.rejectedPosts
      }))

      setIsProcessing(false)
      setActionStatus({
        type: 'success',
        message: action === 'approved' 
          ? 'Post approved! AI will schedule it automatically.' 
          : action === 'rejected'
          ? 'Post rejected. AI is creating a replacement...'
          : 'Changes requested. AI is updating the content...'
      })

      // If rejected, simulate AI creating replacement
      if (action === 'rejected') {
        setTimeout(() => {
          setContentBatch(prev => ({
            ...prev,
            posts: prev.posts.map(post => 
              post.id === postId 
                ? { 
                    ...post, 
                    status: 'pending',
                    title: post.title + ' (Revised)',
                    confidenceScore: Math.min(95, post.confidenceScore + 5),
                    aiReasoning: 'Revised based on user feedback with improved targeting and messaging'
                  }
                : post
            )
          }))
          setActionStatus({
            type: 'info',
            message: 'New version ready for review! AI has incorporated your feedback.'
          })
        }, 3000)
      }

      setTimeout(() => setActionStatus(null), 5000)
    }, 1500)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-700 border-green-200'
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200'
      case 'needs_changes': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default: return 'bg-blue-50 text-blue-700 border-blue-200'
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const PostCard = ({ post }) => {
    const PlatformIcon = platformIcons[post.platform]
    const TypeIcon = contentTypeIcons[post.type]
    const [showFullPreview, setShowFullPreview] = useState(false)

    // Generate visual content based on post type
    const getVisualContent = () => {
      const baseImages = [
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop"
      ]
      
      if (post.type === 'carousel') {
        return {
          type: 'carousel',
          images: baseImages.slice(0, 3),
          count: 5
        }
      } else if (post.type === 'video' || post.type === 'reel') {
        return {
          type: 'video',
          thumbnail: baseImages[0],
          duration: post.type === 'reel' ? '0:30' : '1:45'
        }
      } else {
        return {
          type: 'image',
          image: baseImages[0]
        }
      }
    }

    const visualContent = getVisualContent()

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300"
      >
        {/* Visual Thumbnail Header */}
        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
          {visualContent.type === 'carousel' && (
            <div className="relative h-full">
              <div className="flex h-full">
                {visualContent.images.map((img, index) => (
                  <div key={index} className="flex-1 relative">
                    <img 
                      src={img} 
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index < visualContent.images.length - 1 && (
                      <div className="absolute right-0 top-0 h-full w-px bg-white/50" />
                    )}
                  </div>
                ))}
              </div>
              <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                1/{visualContent.count}
              </div>
              <div className="absolute bottom-3 right-3 bg-black/70 text-white p-1.5 rounded-full">
                <MoreHorizontal className="h-3 w-3" />
              </div>
            </div>
          )}
          
          {visualContent.type === 'video' && (
            <div className="relative h-full">
              <img 
                src={visualContent.thumbnail} 
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-3">
                  <Play className="h-6 w-6 text-slate-800 ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                {visualContent.duration}
              </div>
            </div>
          )}
          
          {visualContent.type === 'image' && (
            <div className="relative h-full">
              <img 
                src={visualContent.image} 
                alt="Post image"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Platform and Type Indicators */}
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5">
              <PlatformIcon className="h-4 w-4 text-slate-700" />
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5">
              <TypeIcon className="h-3 w-3 text-slate-600 dark:text-slate-400" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={`${getStatusColor(post.status)} border backdrop-blur-sm`}>
              {post.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">{post.title}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{formatTime(post.scheduledTime)}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullPreview(!showFullPreview)}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              {showFullPreview ? 'Hide' : 'Full Preview'}
            </Button>
          </div>

          {/* Full Platform Preview */}
          {showFullPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-slate-900">Platform Preview</h5>
                <Badge variant="outline" className="text-xs">
                  {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-center">
                <PlatformPreview 
                  post={{
                    ...post,
                    content: {
                      caption: post.caption,
                      hashtags: post.hashtags
                    },
                    estimatedLikes: Math.floor(Math.random() * 1000) + 100,
                    estimatedComments: Math.floor(Math.random() * 50) + 5,
                    estimatedShares: Math.floor(Math.random() * 20) + 2,
                    estimatedRetweets: Math.floor(Math.random() * 30) + 5,
                    estimatedViews: Math.floor(Math.random() * 5000) + 500,
                    image: visualContent.type === 'image' ? visualContent.image : visualContent.images?.[0] || visualContent.thumbnail,
                    media: visualContent.type === 'carousel' ? visualContent.images.map(url => ({ url })) : undefined,
                    thumbnail: visualContent.type === 'video' ? visualContent.thumbnail : undefined
                  }}
                  platform={post.platform}
                  size="small"
                />
              </div>
            </motion.div>
          )}

        {/* Content Preview */}
        <div className="mb-4">
          <p className="text-slate-700 text-sm leading-relaxed line-clamp-3">
            {post.caption}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {post.hashtags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {post.hashtags.length > 3 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">+{post.hashtags.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Estimated Reach</p>
            <p className="font-semibold text-slate-900">{post.estimatedReach}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI Confidence</p>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-slate-900">{post.confidenceScore}%</p>
              <div className="flex-1 h-2 bg-slate-200 rounded-full">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${post.confidenceScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-start space-x-2">
            <Zap className="h-4 w-4 text-purple-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-purple-800">AI Reasoning</p>
              <p className="text-sm text-purple-700">{post.aiReasoning}</p>
            </div>
          </div>
        </div>

        {/* Design Brief */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Image className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-800">Design Brief</p>
              <p className="text-sm text-blue-700">{post.designBrief}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {post.status === 'pending' && (
          <div className="flex space-x-2">
            <Button
              onClick={() => handlePostAction(post.id, 'approved')}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => setSelectedPost(post)}
              disabled={isProcessing}
              variant="outline"
              className="flex-1"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Request Changes
            </Button>
            <Button
              onClick={() => handlePostAction(post.id, 'rejected')}
              disabled={isProcessing}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {post.status === 'approved' && (
          <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">Approved & Scheduled</span>
          </div>
        )}

        {post.status === 'rejected' && (
          <div className="flex items-center justify-center p-3 bg-orange-50 rounded-lg">
            <RefreshCw className="h-5 w-5 text-orange-600 mr-2 animate-spin" />
            <span className="text-orange-800 font-medium">AI Creating Replacement...</span>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Content Calendar
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Review and approve your AI-generated content
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Week of {contentBatch.weekOf}
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            Deadline: {formatTime(contentBatch.deadline)}
          </Badge>
        </div>
      </div>

      {/* Action Status */}
      <AnimatePresence>
        {actionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center p-4 rounded-lg ${
              actionStatus.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : actionStatus.type === 'info'
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {actionStatus.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-3" />
            ) : actionStatus.type === 'info' ? (
              <AlertCircle className="h-5 w-5 mr-3" />
            ) : (
              <X className="h-5 w-5 mr-3" />
            )}
            {actionStatus.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Posts</p>
                <p className="text-2xl font-bold text-slate-900">{contentBatch.totalPosts}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
                <p className="text-2xl font-bold text-green-600">{contentBatch.approvedPosts}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">
                  {contentBatch.totalPosts - contentBatch.approvedPosts - contentBatch.rejectedPosts}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Confidence</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(contentBatch.posts.reduce((acc, post) => acc + post.confidenceScore, 0) / contentBatch.posts.length)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="approval">Pending Approval</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Posts</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
        </TabsList>

        {/* Pending Approval Tab */}
        <TabsContent value="approval" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contentBatch.posts
              .filter(post => post.status === 'pending')
              .map(post => (
                <PostCard key={post.id} post={post} />
              ))}
          </div>
          
          {contentBatch.posts.filter(post => post.status === 'pending').length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">All Posts Reviewed!</h3>
              <p className="text-slate-600 dark:text-slate-400">Great job! All content has been approved and scheduled.</p>
            </div>
          )}
        </TabsContent>

        {/* Scheduled Posts Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contentBatch.posts
              .filter(post => post.status === 'approved')
              .map(post => (
                <PostCard key={post.id} post={post} />
              ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Content Performance Insights</CardTitle>
              <CardDescription>AI predictions vs actual performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Analytics Coming Soon</h3>
                <p className="text-slate-600 dark:text-slate-400">Performance data will be available after posts go live.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ContentCalendar

