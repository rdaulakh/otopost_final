import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Import content calendar hooks - using existing hooks
import { 
  useContentCalendar,
  useScheduledPosts,
  useCreatePost,
  useUpdatePost,
  useDeletePost
} from '../hooks/useCustomerApi.js'
import { 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Heart,
  MessageCircle,
  Share,
  TrendingUp,
  Image,
  Video,
  FileText,
  Layers,
  Play,
  Edit3,
  X,
  Check,
  RefreshCw,
  Sparkles,
  Target,
  BarChart3,
  Zap
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import PostEditor from './PostEditor.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'


const EnhancedContentCalendar = () => {
  const { isDarkMode } = useTheme()

  const [selectedTab, setSelectedTab] = useState('pending')
  const [posts, setPosts] = useState([])
  const [approvalStats, setApprovalStats] = useState({
    total: 14,
    approved: 0,
    pending: 14,
    avgConfidence: 88
  })
  const [selectedPost, setSelectedPost] = useState(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  // Enhanced post data with complete post information
  const enhancedPosts = [
    {
      id: 1,
      title: "5 Productivity Tips for 2024",
      type: "carousel",
      platform: "instagram",
      scheduledDate: "2024-01-15T09:00:00Z",
      status: "scheduled",
      content: {
        caption: "Boost your productivity with these 5 game-changing tips! 💪✨ #ProductivityTips #NewYearGoals",
        hashtags: ["#ProductivityTips", "#NewYearGoals", "#Motivation", "#Success"],
        visualDescription: "Modern carousel with 5 slides, each featuring a productivity tip with clean icons, gradient backgrounds, and consistent brand colors (blue/purple theme)"
      },
      aiInsights: {
        postTypeReasoning: "Carousel format chosen for maximum engagement - Instagram algorithm favors carousels with 40% higher reach than single images. Perfect for educational content that can be broken into digestible slides.",
        designReasoning: "Clean, modern design with consistent branding. Each slide uses icons and minimal text for mobile optimization. Gradient backgrounds create visual appeal while maintaining readability.",
        contentStrategy: "New Year timing capitalizes on productivity trend surge (+340% search volume). Educational value drives saves and shares, boosting algorithm performance.",
        confidence: 94
      },
      performance: {
        estimatedReach: "12,000-18,000",
        estimatedEngagement: "9.2%",
        expectedSaves: "450-650",
        expectedShares: "120-180"
      },
      agentContributions: {
        contentDirection: "Create educational carousel about productivity hacks for entrepreneurs, leveraging New Year motivation surge",
        postTypeSelector: "Carousel selected over single image (+40% engagement) and reel (+15% reach but lower educational retention)",
        completePostCreator: "Generated 5-slide carousel with cohesive design, optimized captions, and strategic hashtag mix"
      }
    },
    {
      id: 2,
      title: "SaaS Industry Trends Deep Dive",
      platform: "LinkedIn",
      postType: "text_with_image",
      scheduledTime: "Mon, Jan 15, 9:00 AM",
      status: "pending",
      content: {
        caption: "The SaaS landscape is evolving at breakneck speed. Here are 5 trends that will define our industry in 2024:\n\n🤖 1. AI-First Product Development\nCompanies integrating AI from day one, not as an afterthought. 73% of SaaS leaders plan major AI investments.\n\n📊 2. Vertical SaaS Specialization\nGeneral solutions losing ground to industry-specific platforms. Niche focus = premium pricing.\n\n💰 3. Usage-Based Pricing Revolution\nSubscription fatigue driving shift to consumption models. Align costs with customer value.\n\n🔒 4. Zero-Trust Security Architecture\nWith remote work permanent, security isn't optional—it's the product.\n\n🎯 5. Customer Success Automation\nAI-powered onboarding and support reducing churn by 35%.\n\nWhich trend will impact your business most? Let's discuss in the comments.\n\n#SaaS #TechTrends #AI #BusinessStrategy #Innovation",
        hashtags: ["#SaaS", "#TechTrends", "#AI", "#BusinessStrategy", "#Innovation"],
        visualDescription: "Professional infographic showing 5 trend icons with statistics, clean corporate design with company branding"
      },
      aiInsights: {
        postTypeReasoning: "Text with professional image chosen for LinkedIn's algorithm preference for native content. Long-form text performs 67% better than video on LinkedIn for B2B thought leadership.",
        designReasoning: "Professional infographic design builds authority. Statistics and data points increase credibility and shareability among decision-makers.",
        contentStrategy: "Industry insights position user as thought leader. Discussion-starting question drives comments, boosting LinkedIn algorithm ranking.",
        confidence: 91
      },
      performance: {
        estimatedReach: "8,500-12,000",
        estimatedEngagement: "6.8%",
        expectedComments: "45-65",
        expectedShares: "25-40"
      },
      agentContributions: {
        contentDirection: "Share authoritative industry insights about SaaS trends to establish thought leadership",
        postTypeSelector: "Text with image selected over video (lower B2B engagement) and carousel (less professional on LinkedIn)",
        completePostCreator: "Crafted authoritative post with statistics, professional tone, and discussion-driving CTA"
      }
    },
    {
      id: 3,
      title: "AI Assistant Product Demo",
      platform: "Instagram",
      postType: "reel",
      scheduledTime: "Wed, Jan 17, 1:00 PM",
      status: "pending",
      content: {
        caption: "🤖 Meet your new AI assistant! Watch how it transforms your workflow in just 30 seconds ✨\n\n⚡ Automates repetitive tasks\n🧠 Learns your preferences\n📈 Boosts productivity by 300%\n💡 Available 24/7\n\nReady to work smarter, not harder? Link in bio for free trial! 🚀\n\n#AIAssistant #ProductDemo #Innovation #TechMagic #Productivity #Automation #SaaS #FutureOfWork",
        hashtags: ["#AIAssistant", "#ProductDemo", "#Innovation", "#TechMagic", "#Productivity", "#Automation", "#SaaS", "#FutureOfWork"],
        visualDescription: "Dynamic 30-second reel showing screen recordings of AI assistant in action, smooth transitions, engaging text overlays, upbeat background music"
      },
      aiInsights: {
        postTypeReasoning: "Reel format chosen for maximum reach potential - Instagram Reels get 67% more reach than regular posts. Perfect for product demonstrations that benefit from motion and sound.",
        designReasoning: "Fast-paced editing keeps viewers engaged. Screen recordings show real product value. Text overlays ensure accessibility without sound.",
        contentStrategy: "Product demo content drives direct conversions. Strong CTA with free trial removes friction. Trending audio increases discoverability.",
        confidence: 96
      },
      performance: {
        estimatedReach: "25,000-35,000",
        estimatedEngagement: "12.4%",
        expectedSaves: "800-1200",
        expectedShares: "300-450"
      },
      agentContributions: {
        contentDirection: "Create engaging product demo showcasing AI assistant capabilities and driving trial signups",
        postTypeSelector: "Reel selected for maximum reach (+67% vs posts) and product demo effectiveness (+89% conversion rate)",
        completePostCreator: "Produced dynamic reel with screen recordings, engaging transitions, and conversion-focused copy"
      }
    }
  ]

  useEffect(() => {
    setPosts(enhancedPosts)
  }, [])

  const handleApproval = (postId, action) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        if (action === 'approve') {
          setApprovalStats(prev => ({
            ...prev,
            approved: prev.approved + 1,
            pending: prev.pending - 1
          }))
          return { ...post, status: 'approved' }
        } else if (action === 'reject') {
          return { ...post, status: 'rejected' }
        }
      }
      return post
    }))
  }

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'carousel': return Layers
      case 'reel': return Video
      case 'video': return Play
      case 'text_with_image': return Image
      case 'text': return FileText
      default: return Image
    }
  }

  const getPostTypeLabel = (type) => {
    switch (type) {
      case 'carousel': return 'Carousel'
      case 'reel': return 'Reel'
      case 'video': return 'Video'
      case 'text_with_image': return 'Image Post'
      case 'text': return 'Text Post'
      default: return 'Post'
    }
  }

  const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'linkedin': return 'bg-blue-600'
      case 'twitter': return 'bg-sky-500'
      case 'facebook': return 'bg-blue-700'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className={`p-6 space-y-6 bg-white min-h-screen ${isDarkMode ? 'dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Enhanced Content Calendar
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Review complete AI-generated posts with designs and reasoning
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className={`${isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            Week of January 15-21, 2024
          </Badge>
          <Badge variant="outline" className={`${isDarkMode ? 'bg-orange-900/30 text-orange-400 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
            <Clock className="h-3 w-3 mr-1" />
            Deadline: Sat, Jan 13, 11:59 PM
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{approvalStats.total}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Posts</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{approvalStats.approved}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{approvalStats.pending}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{approvalStats.avgConfidence}%</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Confidence</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className={`grid w-full grid-cols-3 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100'}`}>
          <TabsTrigger 
            value="pending" 
            className={`flex items-center ${isDarkMode ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50' : ''}`}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Pending Approval ({approvalStats.pending})
          </TabsTrigger>
          <TabsTrigger 
            value="scheduled" 
            className={`flex items-center ${isDarkMode ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50' : ''}`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled Posts ({approvalStats.approved})
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className={`flex items-center ${isDarkMode ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50' : ''}`}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6 pt-4">
          <div className="grid gap-6">
            {posts.filter(post => post.status === 'pending').map((post, index) => {
              const PostTypeIcon = getPostTypeIcon(post.postType)
              
              // Generate visual content based on post type
              const getVisualContent = (postType) => {
                const baseImages = [
                  "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop"
                ]
                
                if (postType === 'carousel') {
                  return {
                    type: 'carousel',
                    images: baseImages.slice(0, 3),
                    count: 5
                  }
                } else if (postType === 'video' || postType === 'reel') {
                  return {
                    type: 'video',
                    thumbnail: baseImages[0],
                    duration: postType === 'reel' ? '0:30' : '1:45'
                  }
                } else {
                  return {
                    type: 'image',
                    image: baseImages[0]
                  }
                }
              }

              const visualContent = getVisualContent(post.postType)

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm dark:bg-slate-800/95 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                    {/* Enhanced Visual Thumbnail Header */}
                    <div className="relative h-64 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 overflow-hidden">
                      {visualContent.type === 'carousel' && (
                        <div className="relative h-full">
                          <div className="flex h-full">
                            {visualContent.images.map((img, imgIndex) => (
                              <div key={imgIndex} className="flex-1 relative group/slide">
                                <img 
                                  src={img} 
                                  alt={`Slide ${imgIndex + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/slide:opacity-100 transition-opacity duration-300" />
                                {imgIndex < visualContent.images.length - 1 && (
                                  <div className="absolute right-0 top-0 h-full w-0.5 bg-white/60 shadow-sm" />
                                )}
                                {/* Slide Number Indicator */}
                                 <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm dark:bg-slate-800/95 text-gray-800 dark:text-slate-200 px-2 py-1 rounded-full text-xs font-semibold opacity-0 group-hover/slide:opacity-100 transition-opacity duration-300">
                                  {imgIndex + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Enhanced Carousel Indicators */}
                          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white dark:text-slate-100 px-3 py-2 rounded-full text-sm font-medium shadow-lg">
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4" />
                              <span>1/{visualContent.count}</span>
                            </div>
                          </div>
                          
                          {/* Carousel Navigation Dots */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {Array.from({ length: visualContent.count }).map((_, dotIndex) => (
                              <div 
                                key={dotIndex}
                                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                   dotIndex === 0 ? 'bg-white dark:bg-slate-200 shadow-lg' : 'bg-white/50 dark:bg-slate-400/50'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {visualContent.type === 'video' && (
                        <div className="relative h-full">
                          <img 
                            src={visualContent.thumbnail} 
                            alt="Video thumbnail"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                          
                          {/* Enhanced Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/95 backdrop-blur-sm dark:bg-slate-800/95 rounded-full p-4 shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white">
                              <Play className="h-8 w-8 ml-1" />
                            </div>
                          </div>
                          
                          {/* Video Duration Badge */}
                          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white dark:text-slate-100 px-3 py-2 rounded-full text-sm font-medium shadow-lg">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              <span>{visualContent.duration}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {visualContent.type === 'image' && (
                        <div className="relative h-full">
                          <img 
                            src={visualContent.image} 
                            alt="Post image"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Image Type Badge */}
                          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white dark:text-slate-100 px-3 py-2 rounded-full text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-2">
                              <Image className="h-4 w-4" />
                              <span>Image</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Platform and Status Overlay */}
                      <div className="absolute top-4 left-4 flex items-center space-x-3">
                        <div className={`p-3 rounded-full shadow-lg backdrop-blur-sm ${getPlatformColor(post.platform)} transition-transform duration-300 group-hover:scale-110`}>
                          <PostTypeIcon className="h-5 w-5 text-white dark:text-slate-100" />
                        </div>
                      </div>

                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className={`${isDarkMode ? 'bg-orange-900/30 text-orange-400 border-orange-500/30' : 'bg-orange-100/90 text-orange-800 border-orange-200'} backdrop-blur-sm shadow-lg font-medium px-3 py-1`}>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      
                      {/* AI Confidence Indicator */}
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm dark:bg-slate-800/95 rounded-full px-3 py-2 shadow-lg">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                           <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{post.aiInsights.confidence}% AI</span>
                        </div>
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                          <CardDescription className="flex items-center space-x-4 mt-1">
                            <span>{post.platform}</span>
                            <Badge variant="outline" className={`${isDarkMode ? 'bg-slate-700/50 text-slate-300 border-slate-600' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {getPostTypeLabel(post.postType)}
                            </Badge>
                            <span className="text-sm">{post.scheduledTime}</span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Content Preview */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Complete Post Content:</h4>
                          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                              {post.content.caption}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Visual Design:</h4>
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {post.content.visualDescription}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* AI Insights */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center">
                            <Target className="h-4 w-4 mr-2 text-cyan-600" />
                            Post Type Selection
                          </h4>
                          <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-3">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {post.aiInsights.postTypeReasoning}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                            Design Strategy
                          </h4>
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {post.aiInsights.designReasoning}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Performance Predictions */}
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <Eye className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                          <p className="text-sm font-medium">{post.performance.estimatedReach}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Est. Reach</p>
                        </div>
                        <div className="text-center">
                          <Heart className="h-5 w-5 mx-auto mb-1 text-pink-600" />
                          <p className="text-sm font-medium">{post.performance.estimatedEngagement}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Engagement</p>
                        </div>
                        <div className="text-center">
                          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-600" />
                          <p className="text-sm font-medium">{post.aiInsights.confidence}%</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">AI Confidence</p>
                        </div>
                        <div className="text-center">
                          <Zap className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                          <p className="text-sm font-medium">High</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Viral Potential</p>
                        </div>
                      </div>

                      {/* Agent Contributions */}
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">AI Agent Contributions:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <Badge variant="outline" className={`${isDarkMode ? 'bg-cyan-900/30 text-cyan-400 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200'} text-xs`}>Content Direction</Badge>
                            <p className="text-slate-700 dark:text-slate-300">{post.agentContributions.contentDirection}</p>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Badge variant="outline" className={`${isDarkMode ? 'bg-pink-900/30 text-pink-400 border-pink-500/30' : 'bg-pink-50 text-pink-700 border-pink-200'} text-xs`}>Post Type Selector</Badge>
                            <p className="text-slate-700 dark:text-slate-300">{post.agentContributions.postTypeSelector}</p>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Badge variant="outline" className={`${isDarkMode ? 'bg-purple-900/30 text-purple-400 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200'} text-xs`}>Complete Post Creator</Badge>
                            <p className="text-slate-700 dark:text-slate-300">{post.agentContributions.completePostCreator}</p>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex space-x-3">
                          <Button 
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            onClick={() => handleApprove(post.id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve & Schedule
                          </Button>
                          <Button 
                            variant="outline"
                            className={`border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-700/30 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:border-blue-600/50 shadow-sm hover:shadow-md transition-all duration-300`}
                            onClick={() => openEditor(post)}
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Request Changes
                          </Button>
                          <Button 
                            variant="outline" 
                            className={`border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-700/30 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-600/50 shadow-sm hover:shadow-md transition-all duration-300`}
                            onClick={() => handleReject(post.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className={`text-gray-600 dark:text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300`}
                            onClick={() => handleRegenerate(post.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Regenerate
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                            onClick={() => alert(`Preview post: ${post.title}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No Scheduled Posts Yet</h3>
              <p className="text-slate-600 dark:text-slate-400">Approved posts will appear here and be automatically scheduled</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="space-y-6">
            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reach</p>
                      <p className="text-2xl font-bold text-blue-600">125.4K</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +15.3% vs last month
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement</p>
                      <p className="text-2xl font-bold text-pink-600">8.9K</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +8.7% vs last month
                      </p>
                    </div>
                    <Heart className="h-8 w-8 text-pink-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Engagement Rate</p>
                      <p className="text-2xl font-bold text-green-600">7.2%</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +2.3% vs last month
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Posts Published</p>
                      <p className="text-2xl font-bold text-purple-600">156</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12.1% vs last month
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Performance */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Platform Performance</span>
                </CardTitle>
                <CardDescription>
                  Performance breakdown by social media platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Instagram</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">45 posts</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Reach: 45.2K</span>
                        <span className="text-green-600">+12%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                      <div className="flex justify-between text-xs">
                        <span>Engagement: 3.2K</span>
                        <span className="text-green-600">7.1%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                        <span className="text-sm font-medium">LinkedIn</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">38 posts</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Reach: 32.1K</span>
                        <span className="text-green-600">+8%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                      <div className="flex justify-between text-xs">
                        <span>Engagement: 2.1K</span>
                        <span className="text-green-600">6.5%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                        <span className="text-sm font-medium">Twitter</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">42 posts</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Reach: 28.7K</span>
                        <span className="text-green-600">+15%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                      <div className="flex justify-between text-xs">
                        <span>Engagement: 1.8K</span>
                        <span className="text-green-600">6.3%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <span className="text-sm font-medium">Facebook</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">31 posts</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Reach: 19.4K</span>
                        <span className="text-green-600">+5%</span>
                      </div>
                      <Progress value={58} className="h-2" />
                      <div className="flex justify-between text-xs">
                        <span>Engagement: 1.3K</span>
                        <span className="text-green-600">6.7%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Posts */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  <span>Top Performing Posts</span>
                </CardTitle>
                <CardDescription>
                  Your best performing content from the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <img 
                      src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=60&h=60&fit=crop" 
                      alt="Top post"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100">AI-Powered Social Media Strategy</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">LinkedIn • Published 3 days ago</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">12.5K reach</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">8.9% engagement</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-200 dark:border-pink-700/30">
                    <img 
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=60&h=60&fit=crop" 
                      alt="Top post"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100">5 Content Creation Tips</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Instagram • Published 5 days ago</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-pink-600">8.9K reach</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">7.8% engagement</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700/30">
                    <img 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=60&h=60&fit=crop" 
                      alt="Top post"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100">Weekly Marketing Insights</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Twitter • Published 1 week ago</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">15.6K reach</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">6.4% engagement</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Type Performance */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/95">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="h-5 w-5 text-purple-600" />
                  <span>Content Type Performance</span>
                </CardTitle>
                <CardDescription>
                  How different content types are performing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <Image className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                    <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Images</h4>
                    <p className="text-2xl font-bold text-blue-600 mb-1">7.2%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Engagement</p>
                    <p className="text-xs text-green-600 mt-2">+12% vs last month</p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700/30">
                    <Video className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                    <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Videos</h4>
                    <p className="text-2xl font-bold text-purple-600 mb-1">9.8%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Engagement</p>
                    <p className="text-xs text-green-600 mt-2">+18% vs last month</p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700/30">
                    <Layers className="h-8 w-8 mx-auto mb-3 text-green-600" />
                    <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Carousels</h4>
                    <p className="text-2xl font-bold text-green-600 mb-1">8.5%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Engagement</p>
                    <p className="text-xs text-green-600 mt-2">+15% vs last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Post Editor Modal */}
      <PostEditor
        post={selectedPost}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false)
          setSelectedPost(null)
        }}
        onSave={(editedPost) => {
          console.log('Saving edited post:', editedPost)
          // Here you would update the post in your state/database
          setIsEditorOpen(false)
          setSelectedPost(null)
          // Show success message
        }}
      />
    </div>
  )

  // Handler functions
  function openEditor(post) {
    setSelectedPost(post)
    setIsEditorOpen(true)
  }

  function handleApprove(postId) {
    console.log('Approving post:', postId)
    // Update post status to approved
    setApprovalStats(prev => ({
      ...prev,
      approved: prev.approved + 1,
      pending: prev.pending - 1
    }))
  }

  function handleReject(postId) {
    console.log('Rejecting post:', postId)
    // Handle post rejection
  }

  function handleRegenerate(postId) {
    console.log('Regenerating post:', postId)
    // Trigger AI to regenerate the post
  }
}

export default EnhancedContentCalendar

