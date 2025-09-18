import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Search, 
  Filter, 
  MoreHorizontal,
  Plus,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Image as ImageIcon,
  Video,
  Type
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button';
import Modal from './ui/Modal';
import { format } from 'date-fns';
// Import API hooks and UX components
import { 
  useContentList,
  useContentStats,
  useContentApproval,
  useContentRejection,
  useDeleteContent,
  useContentExport,
  useBulkContentActions,
  useContentModeration
} from '../hooks/useApi.js'
import { useNotifications } from './NotificationSystem.jsx'
import { TableSkeleton } from './LoadingSkeletons.jsx'

const ContentManagement = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  // UX hooks
  const { success, error, info } = useNotifications()

  // Component state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedContent, setSelectedContent] = useState([])
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isViewContentModalOpen, setIsViewContentModalOpen] = useState(false)
  const [viewingContent, setViewingContent] = useState(null)
  const [isDeleteContentModalOpen, setIsDeleteContentModalOpen] = useState(false)
  const [deletingContent, setDeletingContent] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Real API calls for content management data
  const { 
    data: contentListData, 
    isLoading: contentListLoading,
    error: contentListError,
    refetch: refetchContent 
  } = useContentList({
    search: searchTerm,
    status: selectedFilter !== 'all' ? selectedFilter : undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: 10
  })
  
  const { 
    data: contentStatsData, 
    isLoading: contentStatsLoading 
  } = useContentStats()
  
  const { 
    mutate: approveContent,
    isLoading: isApprovingContent 
  } = useContentApproval()
  
  const { 
    mutate: rejectContent,
    isLoading: isRejectingContent 
  } = useContentRejection()
  
  const { 
    mutate: deleteContent,
    isLoading: isDeletingContent 
  } = useDeleteContent()
  
  const { 
    mutate: exportContent,
    isLoading: isExportingContent 
  } = useContentExport()
  
  const { 
    mutate: bulkContentActions,
    isLoading: isBulkActioning 
  } = useBulkContentActions()
  
  const { 
    mutate: moderateContent,
    isLoading: isModeratingContent 
  } = useContentModeration()

  // Loading state
  const isLoading = contentListLoading || contentStatsLoading

  // Error handling
  const hasError = contentListError

  // Use real API data with fallback to mock data
  const content = contentListData?.content || []
  const contentStats = contentStatsData || {
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
    rejected: 0,
    scheduled: 0
  }
  const pagination = contentListData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }

  // Handle content operations
  const handleExport = async () => {
    try {
      info('Preparing content export...')
      await exportContent({
        format: 'csv',
        filters: {
          status: selectedFilter !== 'all' ? selectedFilter : undefined,
          search: searchTerm
        }
      })
      success('Content exported successfully!')
    } catch (err) {
      error('Failed to export content')
    }
  }

  const handleApproveContent = async (contentId) => {
    try {
      await approveContent({ contentId, reason: 'Admin approval' })
      success('Content approved successfully!')
      await refetchContent()
      if (onDataUpdate) {
        onDataUpdate({ action: 'content_approved', contentId })
      }
    } catch (err) {
      error('Failed to approve content')
    }
  }

  const handleRejectContent = async (contentId, reason) => {
    try {
      await rejectContent({ contentId, reason })
      success('Content rejected successfully!')
      await refetchContent()
      if (onDataUpdate) {
        onDataUpdate({ action: 'content_rejected', contentId, reason })
      }
    } catch (err) {
      error('Failed to reject content')
    }
  }

  const handleDeleteContent = async (contentId) => {
    try {
      await deleteContent({ contentId, reason: 'Admin deletion' })
      success('Content deleted successfully!')
      setIsDeleteContentModalOpen(false)
      setDeletingContent(null)
      await refetchContent()
      if (onDataUpdate) {
        onDataUpdate({ action: 'content_deleted', contentId })
      }
    } catch (err) {
      error('Failed to delete content')
    }
  }

  const handleModerateContent = async (contentId, action, reason) => {
    try {
      await moderateContent({ contentId, action, reason })
      success(`Content ${action} successfully!`)
      await refetchContent()
      if (onDataUpdate) {
        onDataUpdate({ action: 'content_moderated', contentId, moderationAction: action })
      }
    } catch (err) {
      error(`Failed to ${action} content`)
    }
  }

  const handleBulkAction = async (action, contentIds) => {
    try {
      info(`Processing ${action} for ${contentIds.length} content items...`)
      await bulkContentActions({ action, contentIds })
      success(`${action} completed successfully for ${contentIds.length} items`)
      setSelectedContent([])
      await refetchContent()
      if (onDataUpdate) {
        onDataUpdate({ action: 'bulk_content_action', bulkAction: action, contentIds })
      }
    } catch (err) {
      error(`Failed to ${action} content`)
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

  const handleViewContent = (contentItem) => {
    setViewingContent(contentItem)
    setIsViewContentModalOpen(true)
  }

  const handleDeleteContentModal = (contentItem) => {
    setDeletingContent(contentItem)
    setIsDeleteContentModalOpen(true)
  }

  // Show loading skeleton
  if (isLoading && !content.length) {
    return <TableSkeleton />
  }

  // Show error state
  if (hasError && !content.length) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
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


  const handleUpdateContentStatus = async (contentId, status) => {
    try {
      await contentManagementService.updateContentStatus(contentId, status);
      await fetchContent();
    } catch (error) {
      debugLog('Error updating content status:', error);
      setError(error.message || 'Failed to update content status');
    }
  };

  // Fetch content from API
  const fetchContent = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: selectedFilter === 'all' ? '' : selectedFilter,
        sortBy,
        sortOrder,
        ...params
      };

      debugLog('Fetching content with params:', queryParams);
      
      const response = await contentManagementService.getContent(queryParams);
      
      if (response) {
        setContent(response.content || []);
        setPagination({
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 10,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0
        });
        debugLog('Content fetched successfully:', response);
      }
    } catch (error) {
      debugLog('Error fetching content:', error);
      setError(error.message || 'Failed to fetch content');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch content statistics
  const fetchContentStats = async () => {
    try {
      const stats = await contentManagementService.getContentStats();
      setContentStats(stats);
      debugLog('Content stats fetched:', stats);
    } catch (error) {
      debugLog('Error fetching content stats:', error);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchContent();
    fetchContentStats();
  }, [searchTerm, selectedFilter, sortBy, sortOrder, pagination.page]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchContent({ page: 1 });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const contentTypes = [
    { id: 'post', name: 'Post', icon: Type, color: 'bg-blue-100 text-blue-800', darkColor: 'bg-blue-900/30 text-blue-400' },
    { id: 'story', name: 'Story', icon: Clock, color: 'bg-purple-100 text-purple-800', darkColor: 'bg-purple-900/30 text-purple-400' },
    { id: 'reel', name: 'Reel', icon: Play, color: 'bg-pink-100 text-pink-800', darkColor: 'bg-pink-900/30 text-pink-400' },
    { id: 'video', name: 'Video', icon: Video, color: 'bg-red-100 text-red-800', darkColor: 'bg-red-900/30 text-red-400' },
    { id: 'image', name: 'Image', icon: ImageIcon, color: 'bg-green-100 text-green-800', darkColor: 'bg-green-900/30 text-green-400' },
    { id: 'carousel', name: 'Carousel', icon: FileText, color: 'bg-orange-100 text-orange-800', darkColor: 'bg-orange-900/30 text-orange-400' }
  ]

  const statusOptions = [
    { id: 'published', name: 'Published', color: 'bg-green-100 text-green-800', darkColor: 'bg-green-900/30 text-green-400', icon: CheckCircle },
    { id: 'draft', name: 'Draft', color: 'bg-yellow-100 text-yellow-800', darkColor: 'bg-yellow-900/30 text-yellow-400', icon: AlertCircle },
    { id: 'scheduled', name: 'Scheduled', color: 'bg-blue-100 text-blue-800', darkColor: 'bg-blue-900/30 text-blue-400', icon: Clock },
    { id: 'rejected', name: 'Rejected', color: 'bg-red-100 text-red-800', darkColor: 'bg-red-900/30 text-red-400', icon: XCircle }
  ]

  const filterOptions = [
    { id: 'all', name: 'All Content', count: contentStats.overview?.total || 0 },
    { id: 'published', name: 'Published', count: contentStats.overview?.published || 0 },
    { id: 'draft', name: 'Draft', count: contentStats.overview?.draft || 0 },
    { id: 'scheduled', name: 'Scheduled', count: contentStats.overview?.scheduled || 0 },
    { id: 'rejected', name: 'Rejected', count: contentStats.byStatus?.rejected || 0 }
  ]

  // Map API content data to component format
  const mappedContent = useMemo(() => {
    return content.map(item => ({
      id: item._id || item.id,
      title: item.title || 'Untitled',
      type: item.type || 'post',
      platform: item.platform || 'instagram',
      status: item.status || 'draft',
      author: item.authorId ? `${item.authorId.firstName || ''} ${item.authorId.lastName || ''}`.trim() || item.authorId.username || item.authorId.email : 'Unknown',
      organization: item.organizationId?.name || 'N/A',
      createdAt: item.createdAt,
      publishedAt: item.publishedAt,
      scheduledAt: item.scheduledAt,
      views: item.analytics?.views || 0,
      likes: item.analytics?.likes || 0,
      shares: item.analytics?.shares || 0,
      comments: item.analytics?.comments || 0,
      engagement: item.analytics?.totalEngagement || 0,
      impressions: item.analytics?.impressions || 0,
      content: item.content || '',
      tags: item.tags || [],
      media: item.media || []
    }));
  }, [content]);

  // Filter and sort content (now using mapped data)
  const filteredContent = useMemo(() => {
    let filtered = mappedContent.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesFilter = selectedFilter === 'all' || 
                           item.status === selectedFilter ||
                           item.type === selectedFilter
      
      return matchesSearch && matchesFilter
    })

    // Sort content
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'createdAt' || sortBy === 'publishedAt' || sortBy === 'scheduledAt') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [mappedContent, searchTerm, selectedFilter, sortBy, sortOrder])

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.id === status)
    const Icon = statusConfig?.icon || AlertCircle
    
    return (
      <Badge 
        className={`${isDarkMode ? statusConfig?.darkColor : statusConfig?.color} flex items-center space-x-1`}
      >
        <Icon className="h-3 w-3" />
        <span>{statusConfig?.name || status}</span>
      </Badge>
    )
  }

  const getTypeBadge = (type) => {
    const typeConfig = contentTypes.find(t => t.id === type)
    const Icon = typeConfig?.icon || FileText
    
    return (
      <Badge 
        className={`${isDarkMode ? typeConfig?.darkColor : typeConfig?.color} flex items-center space-x-1`}
      >
        <Icon className="h-3 w-3" />
        <span>{typeConfig?.name || type}</span>
      </Badge>
    )
  }

  const getPlatformBadge = (platform) => {
    const platformColors = {
      instagram: isDarkMode ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-100 text-pink-800',
      facebook: isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800',
      twitter: isDarkMode ? 'bg-sky-900/30 text-sky-400' : 'bg-sky-100 text-sky-800',
      linkedin: isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800',
      tiktok: isDarkMode ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-800',
      youtube: isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
    }
    
    return (
      <Badge className={platformColors[platform] || platformColors.instagram}>
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </Badge>
    )
  }

  const selectAllContent = () => {
    if (selectedContent.length === filteredContent.length) {
      setSelectedContent([])
    } else {
      setSelectedContent(filteredContent.map(c => c.id))
    }
  }

  return (
    <>
      <div className={`min-h-screen p-6 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
      }`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Content Management
              </h1>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage and moderate all content across the platform
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleExport}
                disabled={isExportingContent}
                variant="outline"
                className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExportingContent ? 'Exporting...' : 'Export'}
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Content
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {contentStats.overview?.total || 0}
                    </p>
                  </div>
                  <FileText className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Published
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {contentStats.overview?.published || 0}
                    </p>
                  </div>
                  <CheckCircle className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Drafts
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {contentStats.overview?.draft || 0}
                    </p>
                  </div>
                  <AlertCircle className={`h-8 w-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Scheduled
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {contentStats.overview?.scheduled || 0}
                    </p>
                  </div>
                  <Clock className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:bg-slate-600' 
                          : 'border border-gray-300 bg-white'
                      }`}
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' 
                        : 'border border-gray-300 bg-white'
                    }`}
                    style={isDarkMode ? { color: 'white' } : {}}
                  >
                    <option 
                      value="createdAt" 
                      style={isDarkMode ? { backgroundColor: '#334155', color: 'white' } : {}}
                    >
                      Sort by Created Date
                    </option>
                    <option 
                      value="publishedAt" 
                      style={isDarkMode ? { backgroundColor: '#334155', color: 'white' } : {}}
                    >
                      Sort by Published Date
                    </option>
                    <option 
                      value="title" 
                      style={isDarkMode ? { backgroundColor: '#334155', color: 'white' } : {}}
                    >
                      Sort by Title
                    </option>
                    <option 
                      value="engagement" 
                      style={isDarkMode ? { backgroundColor: '#334155', color: 'white' } : {}}
                    >
                      Sort by Engagement
                    </option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className={`px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' 
                        : 'border border-gray-300 bg-white'
                    }`}
                    style={isDarkMode ? { color: 'white' } : {}}
                  >
                    <option 
                      value="desc" 
                      style={isDarkMode ? { backgroundColor: '#334155', color: 'white' } : {}}
                    >
                      Descending
                    </option>
                    <option 
                      value="asc" 
                      style={isDarkMode ? { backgroundColor: '#334155', color: 'white' } : {}}
                    >
                      Ascending
                    </option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  {filterOptions.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedFilter === filter.id
                          ? isDarkMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-800'
                          : isDarkMode
                          ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {filter.name} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Table */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <th className="text-left p-4">
                        <input
                          type="checkbox"
                          checked={selectedContent.length === filteredContent.length && filteredContent.length > 0}
                          onChange={selectAllContent}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Content</th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Type</th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Platform</th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Status</th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Author</th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Engagement</th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Created</th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="9" className="p-8 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                              Loading content...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="9" className="p-8 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                            <span className={isDarkMode ? 'text-red-400' : 'text-red-600'}>
                              {error}
                            </span>
                            <Button 
                              onClick={() => fetchContent()} 
                              variant="outline" 
                              size="sm"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Retry
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : filteredContent.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="p-8 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <FileText className="h-8 w-8 text-gray-400" />
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                              No content found
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredContent.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`border-b transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedContent.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedContent([...selectedContent, item.id])
                              } else {
                                setSelectedContent(selectedContent.filter(id => id !== item.id))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {item.title}
                              </p>
                              <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {item.content.substring(0, 100)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {getTypeBadge(item.type)}
                        </td>
                        <td className="p-4">
                          {getPlatformBadge(item.platform)}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="p-4">
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.author}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.organization}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {item.engagement.toLocaleString()}
                            </span>
                            <BarChart3 className="h-4 w-4 text-gray-400" />
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleViewContent(item)}
                              className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            {item.status === 'draft' && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleUpdateContentStatus(item.id, 'published')}
                                className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}
                              >
                                <CheckCircle className='h-4 w-4 text-green-500' />
                              </Button>
                            )}
                            {item.status === 'published' && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleUpdateContentStatus(item.id, 'draft')}
                                className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}
                              >
                                <AlertCircle className='h-4 w-4 text-yellow-500' />
                              </Button>
                            )}
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteContent(item)}
                              className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}
                            >
                              <Trash2 className='h-4 w-4 text-red-500' />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} content
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchContent({ page: pagination.page - 1 })}
                      disabled={pagination.page <= 1 || isLoading}
                    >
                      Previous
                    </Button>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchContent({ page: pagination.page + 1 })}
                      disabled={pagination.page >= pagination.totalPages || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Content Modal */}
      <Modal isOpen={isViewContentModalOpen} onClose={() => setIsViewContentModalOpen(false)} title="View Content" isDarkMode={isDarkMode}>
        {viewingContent && (
          <div className="space-y-4">
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {viewingContent.title}
              </h3>
              <div className="flex items-center space-x-2 mt-2">
                {getTypeBadge(viewingContent.type)}
                {getPlatformBadge(viewingContent.platform)}
                {getStatusBadge(viewingContent.status)}
              </div>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {viewingContent.content}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Author</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{viewingContent.author}</p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Organization</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{viewingContent.organization}</p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Engagement</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{viewingContent.engagement.toLocaleString()}</p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Created</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {format(new Date(viewingContent.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Content Modal */}
      <Modal isOpen={isDeleteContentModalOpen} onClose={() => setIsDeleteContentModalOpen(false)} title="Delete Content" isDarkMode={isDarkMode}>
        <div className="space-y-4">
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Are you sure you want to delete this content? This action cannot be undone.
          </p>
          {deletingContent && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
                {deletingContent.title}
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteContentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteContent}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ContentManagement
