import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

// Import API hooks and UX components
import { 
  useContentList,
  useDeleteContent,
  useContentAnalytics
} from '../hooks/useCustomerApi.js'
import { useNotificationSystem } from './NotificationSystem.jsx'
import { TableSkeleton } from './LoadingSkeletons.jsx'
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  BarChart3,
  Search,
  Download,
  Calendar,
  List,
  Grid3X3,
  Eye,
  Edit,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share,
  ExternalLink,
  Filter,
  SortAsc
} from 'lucide-react'

const PostHistory = () => {
  const { isDarkMode } = useTheme()

  // UX hooks
  const { success, error, info } = useNotificationSystem()

  // Component state
  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  // Real API calls for content data
  const { 
    data: contentData, 
    isLoading: contentLoading,
    error: contentError,
    refetch: refetchContent 
  } = useContentList({
    search: searchTerm,
    platform: selectedPlatform !== 'all' ? selectedPlatform : undefined,
    type: selectedType !== 'all' ? selectedType : undefined,
    sortBy,
    sortOrder
  })
  
  const { 
    mutate: deleteContent,
    isLoading: isDeleting 
  } = useDeleteContent()
  
  const { 
    data: analyticsData,
    isLoading: analyticsLoading 
  } = useContentAnalytics()
  
  // Mock export functionality for now
  const handleExportContent = () => {
    info('Preparing content export...')
    // Mock export - replace with real implementation
    setTimeout(() => {
      success('Content exported successfully!')
    }, 1000)
  }

  // Loading state
  const isLoading = contentLoading || analyticsLoading

  // Error handling
  const hasError = contentError

  const fallbackPosts = [
    {
      id: 1,
      title: "Behind the Scenes: Our AI Development Process",
      content: "Take a look at how we develop our AI-powered features...",
      platform: "Facebook",
      type: "Video",
      status: "scheduled",
      date: "Sep 16, 2024",
      time: "02:00 PM",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop",
      performance: {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        engagement: "No data yet"
      }
    },
    {
      id: 2,
      title: "AI-Powered Social Media Strategy: The Future is Here",
      content: "Discover how artificial intelligence is revolutionizing social media management...",
      platform: "LinkedIn",
      type: "Article",
      status: "published",
      date: "Sep 14, 2024",
      time: "10:30 AM",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop",
      performance: {
        views: 12500,
        likes: 245,
        comments: 32,
        shares: 18,
        engagement: "4.2%"
      }
    },
    {
      id: 3,
      title: "5 Content Creation Tips That Actually Work",
      content: "Stop struggling with content creation. Here are proven strategies...",
      platform: "Instagram",
      type: "Carousel",
      status: "published",
      date: "Sep 13, 2024",
      time: "09:15 PM",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop",
      performance: {
        views: 8900,
        likes: 567,
        comments: 89,
        shares: 23,
        engagement: "7.8%"
      }
    },
    {
      id: 4,
      title: "Weekly Marketing Insights",
      content: "This week's top marketing trends and insights you need to know...",
      platform: "Twitter",
      type: "Thread",
      status: "published",
      date: "Sep 12, 2024",
      time: "03:45 PM",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop",
      performance: {
        views: 15600,
        likes: 892,
        comments: 156,
        shares: 67,
        engagement: "6.4%"
      }
    },
    {
      id: 5,
      title: "Customer Success Story: 300% Growth",
      content: "Learn how our client achieved remarkable growth using AI-powered strategies...",
      platform: "LinkedIn",
      type: "Article",
      status: "published",
      date: "Sep 10, 2024",
      time: "11:00 AM",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop",
      performance: {
        views: 9800,
        likes: 423,
        comments: 78,
        shares: 34,
        engagement: "5.9%"
      }
    }
  ]

  const posts = contentData?.posts || fallbackPosts
  const stats = analyticsData?.stats || [
    {
      title: "Total Posts",
      value: posts.length.toString(),
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Published",
      value: posts.filter(p => p.status === 'published').length.toString(),
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Scheduled",
      value: posts.filter(p => p.status === 'scheduled').length.toString(),
      icon: Clock,
      color: "text-blue-600"
    },
    {
      title: "Avg. Engagement",
      value: performanceData?.averageEngagement || "6.1%",
      icon: BarChart3,
      color: "text-purple-600"
    }
  ]

  // Handle content operations
  const handleDeleteContent = async (contentId) => {
    try {
      await deleteContent(contentId)
      success('Content deleted successfully!')
      await refetchContent()
    } catch (err) {
      error('Failed to delete content')
    }
  }

  const handleExportData = async () => {
    try {
      info('Preparing export...')
      await exportContent({
        platform: selectedPlatform !== 'all' ? selectedPlatform : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        dateRange: 'all'
      })
      success('Content exported successfully!')
    } catch (err) {
      error('Failed to export content')
    }
  }

  const handleRefresh = async () => {
    try {
      await refetchContent()
      success('Content data refreshed successfully')
    } catch (err) {
      error('Failed to refresh content data')
    }
  }

  // Show loading skeleton
  if (isLoading && !fallbackPosts.length) {
    return <TableSkeleton />
  }

  // Show error state
  if (hasError && !fallbackPosts.length) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <FileText className="h-5 w-5" />
              <span>Error loading content data. Please try refreshing.</span>
            </div>
            <Button 
              onClick={handleRefresh} 
              className="mt-4 bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = selectedPlatform === 'all' || post.platform === selectedPlatform
    const matchesType = selectedType === 'all' || post.type === selectedType
    
    return matchesSearch && matchesPlatform && matchesType
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPlatformIcon = (platform) => {
    const icons = {
      'Facebook': '📘',
      'Instagram': '📷',
      'LinkedIn': '💼',
      'Twitter': '🐦',
      'YouTube': '📺'
    }
    return icons[platform] || '📱'
  }

  

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Post History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and analyze your published content</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleExportData}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            <Calendar className="h-4 w-4" />
            Schedule New
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="h-11 px-3 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Platforms</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Twitter">Twitter</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="YouTube">YouTube</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-11 px-3 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Image">Image</option>
                <option value="Video">Video</option>
                <option value="Carousel">Carousel</option>
                <option value="Article">Article</option>
                <option value="Thread">Thread</option>
              </select>

              <div className="flex items-center border border-gray-200 rounded-md bg-white">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-11 px-3 rounded-r-none border-r"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-11 px-3 rounded-l-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Posts Content */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Posts ({filteredPosts.length})</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">Showing {filteredPosts.length} of {posts.length} posts</p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Post</th>
                    <th className="text-left p-4 font-medium text-gray-700">Platform</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Date</th>
                    <th className="text-left p-4 font-medium text-gray-700">Performance</th>
                    <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post, index) => (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 truncate">{post.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{post.content}</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="text-xs">
                                {post.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                          <span className="font-medium text-gray-900">{post.platform}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{post.date}</p>
                          <p className="text-gray-600 dark:text-gray-400">{post.time}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {post.status === 'published' ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {post.performance.views.toLocaleString()}
                              </span>
                              <span className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                {post.performance.likes}
                              </span>
                              <span className="flex items-center">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                {post.performance.comments}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-green-600">{post.performance.engagement} engagement</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No data yet</p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="h-8 px-3">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 px-3">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 px-2">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                          <span className="text-sm">{getPlatformIcon(post.platform)}</span>
                          <span className="text-xs font-medium">{post.platform}</span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 line-clamp-2">{post.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{post.content}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline">{post.type}</Badge>
                          <span className="text-gray-500 dark:text-gray-400">{post.date}</span>
                        </div>

                        {post.status === 'published' && (
                          <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {post.performance.views.toLocaleString()}
                              </span>
                              <span className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                {post.performance.likes}
                              </span>
                            </div>
                            <span className="font-medium text-green-600">{post.performance.engagement}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PostHistory

