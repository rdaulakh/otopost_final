import React, { useState } from 'react';
import { 
  Plus, Target, TrendingUp, DollarSign, Users, 
  Play, Pause, Edit, BarChart3, AlertCircle,
  Calendar, Globe, Zap, Brain, ChevronRight,
  Search, Eye, ShoppingCart, Download, Video, Heart
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx'
// Import API hooks and UX components
import { 
  useCampaignList,
  useCampaignStats,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useCampaignAnalytics,
  useAIRecommendations,
  useCampaignOptimization
} from '../hooks/useCustomerApi.js'
import { useNotificationSystem } from './NotificationSystem.jsx'
import { TableSkeleton } from './LoadingSkeletons.jsx'

const CampaignManager = () => {
  const { isDarkMode } = useTheme()
  
  // UX hooks
  const { success, error, info } = useNotificationSystem()

  // Component state
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Real API calls for campaign management data
  const { 
    data: campaignListData, 
    isLoading: campaignListLoading,
    error: campaignListError,
    refetch: refetchCampaigns 
  } = useCampaignList({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined
  })
  
  const { 
    data: campaignStatsData, 
    isLoading: campaignStatsLoading 
  } = useCampaignStats()
  
  const { 
    data: aiRecommendationsData, 
    isLoading: aiRecommendationsLoading 
  } = useAIRecommendations({ type: 'campaigns' })
  
  const { 
    mutate: createCampaign,
    isLoading: isCreatingCampaign 
  } = useCreateCampaign()
  
  const { 
    mutate: updateCampaign,
    isLoading: isUpdatingCampaign 
  } = useUpdateCampaign()
  
  const { 
    mutate: deleteCampaign,
    isLoading: isDeletingCampaign 
  } = useDeleteCampaign()
  
  const { 
    mutate: optimizeCampaign,
    isLoading: isOptimizingCampaign 
  } = useCampaignOptimization()

  // Loading state
  const isLoading = campaignListLoading || campaignStatsLoading || aiRecommendationsLoading

  // Error handling
  const hasError = campaignListError

  // Use real API data only - no mock fallbacks
  const campaigns = campaignListData?.campaigns || []

  const campaignStats = {
    totalSpend: campaignStatsData?.totalSpend ?? 0,
    totalConversions: campaignStatsData?.totalConversions ?? 0,
    averageROAS: campaignStatsData?.averageROAS ?? 0,
    activeCampaigns: campaignStatsData?.activeCampaigns ?? 0
  }

  const aiRecommendations = aiRecommendationsData?.recommendations || []

  // Handle campaign operations
  const handleCreateCampaign = async (campaignData) => {
    try {
      await createCampaign(campaignData)
      success('Campaign created successfully!')
      setShowCreateCampaign(false)
      await refetchCampaigns()
    } catch (err) {
      error('Failed to create campaign')
    }
  }

  const handleUpdateCampaign = async (campaignId, updates) => {
    try {
      await updateCampaign({ campaignId, updates })
      success('Campaign updated successfully!')
      await refetchCampaigns()
    } catch (err) {
      error('Failed to update campaign')
    }
  }

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await deleteCampaign(campaignId)
      success('Campaign deleted successfully!')
      await refetchCampaigns()
    } catch (err) {
      error('Failed to delete campaign')
    }
  }

  const handleOptimizeCampaign = async (campaignId, optimizationType) => {
    try {
      info(`Optimizing campaign with AI...`)
      await optimizeCampaign({ campaignId, type: optimizationType })
      success('Campaign optimized successfully!')
      await refetchCampaigns()
    } catch (err) {
      error('Failed to optimize campaign')
    }
  }

  const handleRefresh = async () => {
    try {
      await refetchCampaigns()
      success('Campaign data refreshed successfully')
    } catch (err) {
      error('Failed to refresh campaign data')
    }
  }

  // Show loading skeleton
  if (isLoading && !campaigns.length) {
    return <TableSkeleton />
  }

  // Show error state
  if (hasError && !campaigns.length) {
    return (
      <div className="p-6">
        <div className="border border-red-200 bg-red-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading campaign data. Please try refreshing.</span>
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
      case 'Google': return <Search className="w-4 h-4 text-gray-600 dark:text-slate-400" />;
      case 'Meta': return <Globe className="w-4 h-4 text-gray-600 dark:text-slate-400" />;
      case 'LinkedIn': return <Users className="w-4 h-4 text-gray-600 dark:text-slate-400" />;
      default: return <Globe className="w-4 h-4 text-gray-600 dark:text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600 dark:text-green-400 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'Paused': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'Completed': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      default: return 'text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-700';
    }
  };

  const getObjectiveIcon = (objective) => {
    switch (objective) {
      case 'Lead Generation': return <Target className="w-4 h-4 text-gray-600 dark:text-slate-400" />;
      case 'Brand Awareness': return <Eye className="w-4 h-4 text-gray-600 dark:text-slate-400" />;
      case 'App Downloads': return <Download className="w-4 h-4 text-gray-600 dark:text-slate-400" />;
      case 'Video Views': return <Video className="w-4 h-4 text-gray-600 dark:text-slate-400" />;
      case 'Sales': return <ShoppingCart className="w-4 h-4 text-gray-600 dark:text-slate-400" />;
      case 'Engagement': return <Heart className="w-4 h-4 text-gray-600 dark:text-slate-400" />;
      default: return <Target className="w-4 h-4 text-gray-600 dark:text-slate-400" />;
    }
  };

  const totalSpend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
  const avgRoas = campaigns.reduce((sum, campaign) => sum + campaign.roas, 0) / campaigns.length;
  const totalConversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;

  if (showCreateCampaign) {
    return <CampaignCreationWizard onClose={() => setShowCreateCampaign(false)} />;
  }

  return (
    <div className={`p-6 mx-auto min-h-screen ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-white'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-slate-100' : 'text-gray-900'
          }`}>
            Campaign Manager
          </h1>
          <p className={`${
            isDarkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Manage your paid campaigns across all platforms
          </p>
        </div>
        <div className="flex gap-3">
          <button className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
            isDarkMode 
              ? 'border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}>
            <Download className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`} />
            Import
          </button>
          <button 
            onClick={() => setShowCreateCampaign(true)}
            disabled={isCreatingCampaign}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4 text-white" />
            {isCreatingCampaign ? 'Creating...' : 'New Campaign'}
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className={`p-6 rounded-lg border hover:shadow-lg transition-shadow ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Active Campaigns
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {campaignStats.activeCampaigns}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'
            }`}>
              <Target className={`w-6 h-6 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border hover:shadow-lg transition-shadow ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Total Spend
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ${(campaignStats.totalSpend || 0).toLocaleString()}
              </p>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                this month
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-green-600/20' : 'bg-green-100'
            }`}>
              <DollarSign className={`w-6 h-6 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border hover:shadow-lg transition-shadow ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Avg. ROAS
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {(campaignStats.averageROAS || 0).toFixed(1)}x
              </p>
              <p className={`text-sm flex items-center gap-1 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                <TrendingUp className="w-3 h-3" />
                +12%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-purple-600/20' : 'bg-purple-100'
            }`}>
              <TrendingUp className={`w-6 h-6 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border hover:shadow-lg transition-shadow ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Conversions
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {campaignStats.totalConversions}
              </p>
              <p className={`text-sm flex items-center gap-1 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                <TrendingUp className="w-3 h-3" />
                +23%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-orange-600/20' : 'bg-orange-100'
            }`}>
              <Users className={`w-6 h-6 ${
                isDarkMode ? 'text-orange-400' : 'text-orange-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className={`rounded-lg p-6 mb-6 border hover:shadow-lg transition-shadow ${
        isDarkMode 
          ? 'bg-slate-800/95 border-slate-700' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            AI Recommendations
          </h3>
        </div>
        <div className="space-y-3">
          {(aiRecommendations || []).map((rec) => (
            <div key={rec.id} className={`flex items-center justify-between p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' 
                : 'bg-white border-blue-100 hover:bg-blue-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  rec.priority === 'high' 
                    ? (isDarkMode ? 'bg-yellow-400' : 'bg-red-500') 
                    : (isDarkMode ? 'bg-yellow-400' : 'bg-yellow-500')
                }`}></div>
                <span className={`${
                  isDarkMode ? 'text-slate-200' : 'text-gray-700'
                }`}>
                  {rec.message}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  {rec.priority}
                </span>
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    isDarkMode ? 'translate-x-1' : 'translate-x-1'
                  }`}></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Filters */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'overview' 
              ? (isDarkMode 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                  : 'bg-blue-600 text-white')
              : (isDarkMode 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
          }`}
        >
          All Campaigns
        </button>
        <button 
          onClick={() => setActiveTab('google')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            activeTab === 'google' 
              ? (isDarkMode 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                  : 'bg-blue-600 text-white')
              : (isDarkMode 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
          }`}
        >
          <Search className="w-4 h-4" />
          Google Ads
        </button>
        <button 
          onClick={() => setActiveTab('meta')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            activeTab === 'meta' 
              ? (isDarkMode 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                  : 'bg-blue-600 text-white')
              : (isDarkMode 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
          }`}
        >
          <Globe className="w-4 h-4" />
          Meta Ads
        </button>
        <button 
          onClick={() => setActiveTab('linkedin')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            activeTab === 'linkedin' 
              ? (isDarkMode 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                  : 'bg-blue-600 text-white')
              : (isDarkMode 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
          }`}
        >
          <Users className="w-4 h-4" />
          LinkedIn Ads
        </button>
        <button 
          onClick={() => setActiveTab('boosted')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'boosted' 
              ? (isDarkMode 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                  : 'bg-blue-600 text-white')
              : (isDarkMode 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
          }`}
        >
          Boosted Posts
        </button>
      </div>

      {/* Campaigns Table */}
      <div className={`rounded-lg border overflow-hidden hover:shadow-lg transition-shadow ${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-500'
                }`}>
                  Campaign Name
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-500'
                }`}>
                  Platform
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-500'
                }`}>
                  Spend
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-500'
                }`}>
                  ROAS
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-500'
                }`}>
                  Conversions
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode 
                ? 'bg-slate-800 divide-slate-700' 
                : 'bg-white divide-gray-200'
            }`}>
              {(campaigns || []).map((campaign) => (
                <tr key={campaign.id} className={`${
                  isDarkMode 
                    ? 'hover:bg-slate-700' 
                    : 'hover:bg-gray-50'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
                      }`}>
                        {getObjectiveIcon(campaign.objective)}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {campaign.name}
                        </div>
                        <div className={`text-sm ${
                          isDarkMode ? 'text-slate-300' : 'text-gray-500'
                        }`}>
                          {campaign.objective}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(campaign.platform)}
                      <span className={`text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {campaign.platform}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    ${campaign.spend}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {campaign.roas}x
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {campaign.conversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {campaign.status === 'Active' ? (
                        <button 
                          onClick={() => {
                            setCampaigns(prev => prev.map(c => 
                              c.id === campaign.id ? {...c, status: 'Paused'} : c
                            ));
                          }}
                          className={`${
                            isDarkMode 
                              ? 'text-yellow-400 hover:text-yellow-300' 
                              : 'text-yellow-600 hover:text-yellow-900'
                          }`}
                          title="Pause Campaign"
                        >
                          <Pause className={`w-4 h-4 ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-600'
                          }`} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setCampaigns(prev => prev.map(c => 
                              c.id === campaign.id ? {...c, status: 'Active'} : c
                            ));
                          }}
                          className={`${
                            isDarkMode 
                              ? 'text-green-400 hover:text-green-300' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title="Resume Campaign"
                        >
                          <Play className={`w-4 h-4 ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-600'
                          }`} />
                        </button>
                      )}
                      <button 
                        onClick={() => alert(`Edit campaign: ${campaign.name}`)}
                        className={`${
                          isDarkMode 
                            ? 'text-blue-400 hover:text-blue-300' 
                            : 'text-blue-600 hover:text-blue-900'
                        }`}
                        title="Edit Campaign"
                      >
                        <Edit className={`w-4 h-4 ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`} />
                      </button>
                      <button 
                        onClick={() => alert(`View analytics for: ${campaign.name}`)}
                        className={`${
                          isDarkMode 
                            ? 'text-slate-400 hover:text-slate-300' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        title="View Analytics"
                      >
                        <BarChart3 className={`w-4 h-4 ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Campaign Creation Wizard Component
const CampaignCreationWizard = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    objective: '',
    platforms: [],
    audience: {},
    budget: {},
    creative: {}
  });

  const objectives = [
    { id: 'lead_generation', name: 'Lead Generation', icon: Target, description: 'Generate qualified leads for your business' },
    { id: 'sales', name: 'Sales & Conversions', icon: ShoppingCart, description: 'Drive sales and conversions' },
    { id: 'brand_awareness', name: 'Brand Awareness', icon: Eye, description: 'Increase brand visibility and recognition' },
    { id: 'app_downloads', name: 'App Downloads', icon: Download, description: 'Promote app installations' },
    { id: 'video_views', name: 'Video Views', icon: Video, description: 'Increase video engagement' },
    { id: 'engagement', name: 'Engagement & Followers', icon: Heart, description: 'Build community and engagement' }
  ];

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn Ads', icon: Users, recommended: true, description: 'Recommended for B2B lead generation' },
    { id: 'meta', name: 'Meta Ads', icon: Globe, recommended: false, description: 'Good for retargeting website visitors' },
    { id: 'google', name: 'Google Ads', icon: Search, recommended: false, description: 'Consider for search intent campaigns' }
  ];

  const handleObjectiveSelect = (objective) => {
    setCampaignData(prev => ({ ...prev, objective }));
  };

  const handlePlatformToggle = (platformId) => {
    setCampaignData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">What's your campaign objective?</h3>
        <p className="text-gray-600 dark:text-slate-300 mb-6">Choose the primary goal for your campaign</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {objectives.map((obj) => (
          <button
            key={obj.id}
            onClick={() => handleObjectiveSelect(obj.id)}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              campaignData.objective === obj.id
                ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 dark:bg-slate-700/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <obj.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">{obj.name}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300">{obj.description}</p>
          </button>
        ))}
      </div>

      {campaignData.objective === 'lead_generation' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-900 dark:text-blue-300">AI Recommendation</span>
          </div>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Based on your SaaS business profile and recent organic performance,
            Lead Generation campaigns typically achieve 4.2x ROAS in your industry.
          </p>
        </div>
      )}

      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Which platforms do you want to advertise on?</h4>
        <div className="space-y-3">
          {platforms.map((platform) => (
            <label key={platform.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600/50 dark:bg-slate-700/50 cursor-pointer">
              <input
                type="checkbox"
                checked={campaignData.platforms.includes(platform.id)}
                onChange={() => handlePlatformToggle(platform.id)}
                className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:bg-slate-700"
              />
              <platform.icon className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{platform.name}</span>
                  {platform.recommended && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300">{platform.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Generated Audience Recommendations</h3>
        <p className="text-gray-600 dark:text-slate-300 mb-6">Based on your organic audience and industry data</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-blue-900 dark:text-blue-300">AI-Generated Audience Recommendations</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-blue-100 dark:border-blue-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">Primary Audience</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">SaaS Decision Makers</p>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">25-45, B2B</p>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">1.2M reach</p>
            <button className="w-full px-3 py-1 bg-blue-600 dark:bg-blue-600 text-white text-sm rounded-lg">
              ✓ Selected
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-600 dark:text-slate-400" />
              <span className="font-medium text-gray-900 dark:text-white">Lookalike Audience</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">Similar to your best customers</p>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">2.1M reach</p>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">94% match</p>
            <button className="w-full px-3 py-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-800">
              Add
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-gray-600 dark:text-slate-400" />
              <span className="font-medium text-gray-900 dark:text-white">Interest Targeting</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">Business Tools, Productivity</p>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">1.8M reach</p>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">87% relevance</p>
            <button className="w-full px-3 py-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-800">
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Custom Audience Refinement</h4>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Demographics</label>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-slate-400 mb-1">Age Range</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="18" max="65" defaultValue="25" className="flex-1" />
                  <span className="text-sm text-gray-600 dark:text-slate-400">25 - 45</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-slate-400 mb-1">Location</label>
                <select className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100">
                  <option>United States, Canada, UK</option>
                  <option>North America</option>
                  <option>Global</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Interests & Behaviors</label>
            <div className="grid grid-cols-2 gap-2">
              {['Business Software', 'SaaS Tools', 'Digital Marketing', 'Startup Founders'].map((interest) => (
                <label key={interest} className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-700 dark:text-slate-300">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Estimated Audience Size</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">1.2M people</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-slate-400">Estimated Daily Reach</span>
              <span className="text-sm text-gray-900 dark:text-white">2,400-6,800 people</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Budget Optimization</h3>
        <p className="text-gray-600 dark:text-slate-300 mb-6">Let AI optimize your budget allocation for maximum ROI</p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="font-medium text-green-900 dark:text-green-300">AI Budget Recommendations</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-300 mb-1">$500/month</div>
            <p className="text-green-800 dark:text-green-400 text-sm mb-4">Recommended Budget</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-700 dark:text-green-400">Expected Results:</span>
                <span className="text-green-900 dark:text-green-300 font-medium">25-35 leads</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-700 dark:text-green-400">Expected ROAS:</span>
                <span className="text-green-900 dark:text-green-300 font-medium">4.2x</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-green-900 dark:text-green-300 mb-3">Platform Allocation:</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700 dark:text-green-400">LinkedIn: $350 (70%)</span>
                <span className="text-xs text-green-600 dark:text-green-400">Higher conversion rate for B2B</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700 dark:text-green-400">Meta: $150 (30%)</span>
                <span className="text-xs text-green-600 dark:text-green-400">Lower cost, good for retargeting</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Budget Settings</h4>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Campaign Budget</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="budgetType" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-slate-300">Daily Budget</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="budgetType" defaultChecked className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-slate-300">Monthly Budget</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Monthly Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400">$</span>
              <input 
                type="number" 
                defaultValue="500" 
                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Budget Allocation by Platform</h5>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">LinkedIn Ads</span>
                  <span className="text-sm text-gray-900 dark:text-slate-100">70%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 mt-1">
                  <span>$350/month</span>
                  <span>Expected: 18-25 leads</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Meta Ads</span>
                  <span className="text-sm text-gray-900 dark:text-slate-100">30%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 mt-1">
                  <span>$150/month</span>
                  <span>Expected: 7-10 leads</span>
                </div>
              </div>
            </div>
            <button className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700">
              Adjust Allocation
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Bidding Strategy</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="bidding" defaultChecked className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-slate-300">AI-Optimized Bidding (Recommended)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="bidding" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-slate-300">Manual CPC</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="bidding" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-slate-300">Target CPA: $20</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Campaign - Step {currentStep} of 5</h2>
              <p className="text-gray-600 dark:text-slate-300">Set up your AI-optimized advertising campaign</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-slate-300 mb-2">
              <span>Objective</span>
              <span>Audience</span>
              <span>Budget</span>
              <span>Creative</span>
              <span>Review</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25" 
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && <div className="text-center py-12 text-gray-500 dark:text-slate-400">Creative generation step coming soon...</div>}
          {currentStep === 5 && <div className="text-center py-12 text-gray-500 dark:text-slate-400">Review step coming soon...</div>}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-between">
          <button 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button 
            onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
            disabled={currentStep === 5}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/25"
          >
            Continue to {currentStep === 1 ? 'Audience' : currentStep === 2 ? 'Budget' : currentStep === 3 ? 'Creative' : 'Review'} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignManager;

