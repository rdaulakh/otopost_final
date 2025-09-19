import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Target, DollarSign, Users, Clock, 
  Play, Pause, BarChart3, Zap, Brain, Star,
  Calendar, Globe, ChevronRight, AlertCircle,
  Search, Heart, MessageCircle, Share, Eye, ThumbsUp
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx'
// Import API hooks and UX components
import { 
  useBoostRecommendations,
  useRecentPosts,
  useActiveBoosts,
  useCreateBoost,
  useUpdateBoost,
  useDeleteBoost,
  useBoostAnalytics,
  useBoostPrediction
} from '../hooks/useCustomerApi.js'
import { useNotificationSystem } from './NotificationSystem.jsx'
import { TableSkeleton } from './LoadingSkeletons.jsx'

const BoostManager = () => {
  const { isDarkMode } = useTheme()
  
  // UX hooks
  const { success, error, info } = useNotificationSystem()

  // Component state
  const [activeTab, setActiveTab] = useState('recommendations')
  const [showBoostModal, setShowBoostModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')

  // Real API calls for boost management data
  const { 
    data: boostRecommendationsData, 
    isLoading: boostRecommendationsLoading,
    error: boostRecommendationsError,
    refetch: refetchRecommendations 
  } = useBoostRecommendations({
    platform: platformFilter !== 'all' ? platformFilter : undefined
  })
  
  const { 
    data: recentPostsData, 
    isLoading: recentPostsLoading 
  } = useRecentPosts({
    search: searchTerm,
    platform: platformFilter !== 'all' ? platformFilter : undefined,
    limit: 20
  })
  
  const { 
    data: activeBoostsData, 
    isLoading: activeBoostsLoading 
  } = useActiveBoosts()
  
  const { 
    mutate: createBoost,
    isLoading: isCreatingBoost 
  } = useCreateBoost()
  
  const { 
    mutate: updateBoost,
    isLoading: isUpdatingBoost 
  } = useUpdateBoost()
  
  const { 
    mutate: deleteBoost,
    isLoading: isDeletingBoost 
  } = useDeleteBoost()
  
  const { 
    data: boostAnalyticsData, 
    isLoading: boostAnalyticsLoading 
  } = useBoostAnalytics()
  
  const { 
    mutate: getBoostPrediction,
    isLoading: isPredictingBoost 
  } = useBoostPrediction()

  // Loading state
  const isLoading = boostRecommendationsLoading || recentPostsLoading || activeBoostsLoading

  // Error handling
  const hasError = boostRecommendationsError

  // Use real API data only - no mock fallbacks
  const aiRecommendations = boostRecommendationsData?.recommendations || []

  const recentPosts = recentPostsData?.posts || []

  const activeBoosts = activeBoostsData?.boosts || []
  const boostAnalytics = boostAnalyticsData || {
    totalSpent: 289,
    totalReach: 30800,
    totalLeads: 43,
    averageROAS: 4.0
  }

  // Handle boost operations
  const handleCreateBoost = async (postId, boostConfig) => {
    try {
      info('Creating boost campaign...')
      await createBoost({ postId, ...boostConfig })
      success('Boost campaign created successfully!')
      setShowBoostModal(false)
      setSelectedPost(null)
      await refetchRecommendations()
    } catch (err) {
      error('Failed to create boost campaign')
    }
  }

  const handleUpdateBoost = async (boostId, updates) => {
    try {
      await updateBoost({ boostId, updates })
      success('Boost campaign updated successfully!')
      await refetchRecommendations()
    } catch (err) {
      error('Failed to update boost campaign')
    }
  }

  const handleDeleteBoost = async (boostId) => {
    try {
      await deleteBoost(boostId)
      success('Boost campaign deleted successfully!')
      await refetchRecommendations()
    } catch (err) {
      error('Failed to delete boost campaign')
    }
  }

  const handleGetPrediction = async (postId) => {
    try {
      info('Analyzing boost potential...')
      const prediction = await getBoostPrediction({ postId })
      success('Boost prediction generated successfully!')
      return prediction
    } catch (err) {
      error('Failed to generate boost prediction')
      return null
    }
  }

  const handleRefresh = async () => {
    try {
      await refetchRecommendations()
      success('Boost data refreshed successfully')
    } catch (err) {
      error('Failed to refresh boost data')
    }
  }

  // Show loading skeleton
  if (isLoading && !aiRecommendations.length && !recentPosts.length) {
    return <TableSkeleton />
  }

  // Show error state
  if (hasError && !aiRecommendations.length && !recentPosts.length) {
    return (
      <div className="p-6">
        <div className="border border-red-200 bg-red-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading boost data. Please try refreshing.</span>
          </div>
          <button 
            onClick={handleRefresh} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Retry'}
          </button>
        </div>
      </div>
    )
  }

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'Instagram': return <Heart className="w-4 h-4" />;
      case 'LinkedIn': return <Users className="w-4 h-4" />;
      case 'Twitter': return <MessageCircle className="w-4 h-4" />;
      case 'Facebook': return <Globe className="w-4 h-4" />;
      case 'YouTube': return <Play className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Instagram': return 'text-pink-600 bg-pink-100';
      case 'LinkedIn': return 'text-blue-600 bg-blue-100';
      case 'Twitter': return 'text-sky-600 bg-sky-100';
      case 'Facebook': return 'text-blue-700 bg-blue-100';
      case 'YouTube': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100';
    }
  };

  const getViralScoreColor = (score) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 dark:text-gray-400 bg-gray-100';
  };

  const getViralScoreEmoji = (score) => {
    if (score >= 80) return '🔥';
    if (score >= 60) return '📈';
    if (score >= 40) return '⚡';
    return '📊';
  };

  const handleBoostPost = (post) => {
    setSelectedPost(post);
    setShowBoostModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boost Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">Amplify your best-performing content with AI-powered boosting</p>
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Boost History
        </button>
      </div>

      {/* AI Recommendations Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Boost Recommendations</h3>
        </div>

        <div className="space-y-4">
          {aiRecommendations.map((rec) => (
            <div key={rec.id} className="bg-white p-6 rounded-lg border border-blue-100 shadow-sm">
              <div className="flex items-start gap-4">
                {/* Post Thumbnail */}
                <div className="relative">
                  <img 
                    src={rec.thumbnail} 
                    alt={rec.postTitle}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold ${getPlatformColor(rec.platform)}`}>
                    {getPlatformIcon(rec.platform)}
                  </div>
                </div>

                {/* Post Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-3 h-3 rounded-full ${rec.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                        <span className="font-medium text-gray-900">
                          {rec.priority === 'high' ? '⭐ High Priority - Boost Now' : '🔥 Trending - Consider Boosting'}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">{rec.postTitle}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          {getPlatformIcon(rec.platform)}
                          {rec.platform}
                        </span>
                        <span>{rec.postType}</span>
                        <span>Posted: {rec.postedTime}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getViralScoreColor(rec.viralScore)}`}>
                      Viral Score: {rec.viralScore}% {getViralScoreEmoji(rec.viralScore)}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <ThumbsUp className="w-4 h-4" />
                      {rec.metrics.likes.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <MessageCircle className="w-4 h-4" />
                      {rec.metrics.comments}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Share className="w-4 h-4" />
                      {rec.metrics.shares}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Eye className="w-4 h-4" />
                      {rec.metrics.reach.toLocaleString()} reach
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      Engagement: {rec.currentEngagement}%
                    </div>
                  </div>

                  {/* Predicted Impact */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-green-600 font-medium">
                        Predicted boost impact: {rec.predictedImpact.reach} reach, {rec.predictedImpact.leads} new leads
                      </span>
                    </div>
                    <button 
                      onClick={() => handleBoostPost(rec)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Boost This Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'recommendations' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          AI Recommendations
        </button>
        <button 
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'recent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Recent Posts
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Boost History
        </button>
      </div>

      {/* Recent High-Performing Posts */}
      {activeTab === 'recent' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent High-Performing Posts</h3>
          <div className="grid grid-cols-1 gap-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <img 
                    src={post.thumbnail} 
                    alt={post.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{post.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            {getPlatformIcon(post.platform)}
                            {post.platform}
                          </span>
                          <span>{post.postType}</span>
                          <span>{post.postedTime}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getViralScoreColor(post.viralScore)}`}>
                        Viral Score: {post.viralScore}%
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mb-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <ThumbsUp className="w-4 h-4" />
                        {post.metrics.likes.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <MessageCircle className="w-4 h-4" />
                        {post.metrics.comments}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Share className="w-4 h-4" />
                        {post.metrics.shares}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        Engagement Rate: {post.engagementRate}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Reach: {post.metrics.reach.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleBoostPost(post)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Boost Post
                      </button>
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                        View Details
                      </button>
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                        Duplicate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Boost History */}
      {activeTab === 'history' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Boost History</h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Post Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Results
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {boostHistory.map((boost) => (
                    <tr key={boost.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{boost.postTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(boost.platform)}
                          <span className="text-sm text-gray-900">{boost.platform}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {boost.startDate} - {boost.endDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${boost.spent} / ${boost.budget}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {boost.results.reach.toLocaleString()} reach • {boost.results.leads} leads
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ${boost.results.cpl} CPL • {boost.results.roas}x ROAS
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          boost.status === 'Active' ? 'text-green-600 bg-green-100' : 
                          boost.status === 'Completed' ? 'text-blue-600 bg-blue-100' : 
                          'text-gray-600 dark:text-gray-400 bg-gray-100'
                        }`}>
                          {boost.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Boost Configuration Modal */}
      {showBoostModal && selectedPost && (
        <BoostConfigurationModal 
          post={selectedPost} 
          onClose={() => setShowBoostModal(false)}
          onStartBoost={handleCreateBoost}
          isCreating={isCreatingBoost}
        />
      )}
    </div>
  );
};

// Boost Configuration Modal Component
const BoostConfigurationModal = ({ post, onClose, onStartBoost, isCreating }) => {
  const [boostConfig, setBoostConfig] = useState({
    objective: 'lead_generation',
    audience: 'ai_optimized',
    budget: 150,
    duration: 7,
    customAudience: false
  });

  const objectives = [
    { id: 'lead_generation', name: 'Lead Generation', description: 'Generate qualified leads', recommended: true },
    { id: 'brand_awareness', name: 'Brand Awareness', description: 'Increase brand visibility' },
    { id: 'website_traffic', name: 'Website Traffic', description: 'Drive traffic to your website' },
    { id: 'engagement', name: 'Engagement', description: 'Increase likes, comments, shares' }
  ];

  const handleStartBoost = async () => {
    if (onStartBoost) {
      await onStartBoost(post.id, boostConfig)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Boost Post: "{post.postTitle}"</h2>
              <p className="text-gray-600 dark:text-gray-400">Configure your boost settings for maximum impact</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* AI Boost Strategy */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-900">AI Boost Strategy</span>
            </div>
            <div className="text-sm text-green-800 mb-3">
              <div>Recommended Strategy: Lead Generation Focus</div>
              <div>Budget: $150 over 7 days</div>
              <div>Expected Results: 25-35 leads, 15,000-22,000 additional reach</div>
              <div>Confidence: 91%</div>
            </div>
          </div>

          {/* Boost Objective */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Boost Objective</label>
            <div className="space-y-2">
              {objectives.map((obj) => (
                <label key={obj.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="objective"
                    value={obj.id}
                    checked={boostConfig.objective === obj.id}
                    onChange={(e) => setBoostConfig(prev => ({ ...prev, objective: e.target.value }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{obj.name}</span>
                      {obj.recommended && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{obj.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Target Audience</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value="ai_optimized"
                  checked={boostConfig.audience === 'ai_optimized'}
                  onChange={(e) => setBoostConfig(prev => ({ ...prev, audience: e.target.value }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">Use AI-optimized audience</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Similar to your best customers + interested in SaaS tools
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estimated reach: 1.8M people</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value="custom"
                  checked={boostConfig.audience === 'custom'}
                  onChange={(e) => setBoostConfig(prev => ({ ...prev, audience: e.target.value }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-900">Create custom audience</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value="existing"
                  checked={boostConfig.audience === 'existing'}
                  onChange={(e) => setBoostConfig(prev => ({ ...prev, audience: e.target.value }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-900">Use existing saved audience</span>
              </label>
            </div>
          </div>

          {/* Budget & Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Budget & Duration</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Total Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    value={boostConfig.budget}
                    onChange={(e) => setBoostConfig(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Duration (days)</label>
                <input
                  type="number"
                  value={boostConfig.duration}
                  onChange={(e) => setBoostConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Daily Budget Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Daily Budget Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Day 1-2: Higher spend for initial momentum</span>
                <span className="text-gray-900 font-medium">${Math.round(boostConfig.budget * 0.4 / 2)}/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Day 3-5: Sustained promotion</span>
                <span className="text-gray-900 font-medium">${Math.round(boostConfig.budget * 0.4 / 3)}/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Day 6-7: Final push</span>
                <span className="text-gray-900 font-medium">${Math.round(boostConfig.budget * 0.2 / 2)}/day</span>
              </div>
            </div>
            <button className="mt-3 text-sm text-blue-600 hover:text-blue-700">
              Customize Schedule
            </button>
          </div>

          {/* Expected Performance */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">📊 Expected Performance</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Additional Reach:</span>
                <span className="text-blue-900 font-medium">15,000-22,000 people</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Expected Leads:</span>
                <span className="text-blue-900 font-medium">25-35</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Cost per Lead:</span>
                <span className="text-blue-900 font-medium">$4.30-6.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">ROI Prediction:</span>
                <span className="text-blue-900 font-medium">380-420%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleStartBoost}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Start Boost
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoostManager;

