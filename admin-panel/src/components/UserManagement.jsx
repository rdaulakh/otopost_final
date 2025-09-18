import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Activity,
  Ban,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button';
import Modal from './ui/Modal';
import AddUserForm from './AddUserForm';
import EditUserForm from './EditUserForm';
import ViewUser from './ViewUser';
import { format } from 'date-fns';
import { downloadCSV } from '../utils/csv';
// Import API hooks and UX components
import { 
  useUsersList,
  useUserAnalytics,
  useCreateUser,
  useUpdateUser,
  useDeleteUser
} from '../hooks/useAdminApi.js'
import { useNotifications } from './NotificationSystem.jsx'
import { TableSkeleton } from './LoadingSkeletons.jsx'

const UserManagement = ({ data = {}, onDataUpdate = () => {}, isDarkMode = false }) => {
  // UX hooks
  const { success, error, info } = useNotifications()

  // Component state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false)
  const [viewingUser, setViewingUser] = useState(null)
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Real API calls for user management data
  const { 
    data: userListData, 
    isLoading: userListLoading,
    error: userListError,
    refetch: refetchUsers 
  } = useUsersList({
    search: searchTerm,
    status: selectedFilter !== 'all' ? selectedFilter : undefined,
    plan: selectedFilter !== 'all' ? selectedFilter : undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: 10
  })
  
  const { 
    data: userStatsData, 
    isLoading: userStatsLoading 
  } = useUserAnalytics()
  
  const { 
    mutate: createUser,
    isLoading: isCreatingUser 
  } = useCreateUser()
  
  const { 
    mutate: updateUser,
    isLoading: isUpdatingUser 
  } = useUpdateUser()
  
  const { 
    mutate: deleteUser,
    isLoading: isDeletingUser 
  } = useDeleteUser()
  
  // Mock export functionality for now
  const handleExportUsers = () => {
    info('Preparing user export...')
    // Mock export - replace with real implementation
    setTimeout(() => {
      success('Users exported successfully!')
    }, 1000)
  }
  
  // Mock bulk actions functionality for now
  const handleBulkUserActions = (action, userIds) => {
    info(`Performing ${action} on ${userIds.length} users...`)
    // Mock bulk actions - replace with real implementation
    setTimeout(() => {
      success(`${action} completed successfully!`)
    }, 1000)
  }

  // Loading state
  const isLoading = userListLoading || userStatsLoading

  // Error handling
  const hasError = userListError

  // Use real API data with fallback to mock data
  const users = userListData?.users || []
  const userStats = userStatsData || {
    total: 0,
    active: 0,
    inactive: 0,
    trial: 0,
    premium: 0,
    pro: 0
  }
  const pagination = userListData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }

  // Handle user operations
  const handleExport = async () => {
    try {
      info('Preparing user export...')
      await exportUsers({
        format: 'csv',
        filters: {
          status: selectedFilter !== 'all' ? selectedFilter : undefined,
          search: searchTerm
        }
      })
      success('Users exported successfully!')
    } catch (err) {
      error('Failed to export users')
    }
  }

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData)
      success('User created successfully!')
      setIsAddUserModalOpen(false)
      await refetchUsers()
      if (onDataUpdate) {
        onDataUpdate({ action: 'user_created', user: userData })
      }
    } catch (err) {
      error('Failed to create user')
    }
  }

  const handleUpdateUser = async (userId, userData) => {
    try {
      await updateUser({ userId, userData })
      success('User updated successfully!')
      setIsEditUserModalOpen(false)
      setEditingUser(null)
      await refetchUsers()
      if (onDataUpdate) {
        onDataUpdate({ action: 'user_updated', userId, userData })
      }
    } catch (err) {
      error('Failed to update user')
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId)
      success('User deleted successfully!')
      setIsDeleteUserModalOpen(false)
      setDeletingUser(null)
      await refetchUsers()
      if (onDataUpdate) {
        onDataUpdate({ action: 'user_deleted', userId })
      }
    } catch (err) {
      error('Failed to delete user')
    }
  }

  const handleBulkAction = async (action, userIds) => {
    try {
      info(`Processing ${action} for ${userIds.length} users...`)
      await bulkUserActions({ action, userIds })
      success(`${action} completed successfully for ${userIds.length} users`)
      setSelectedUsers([])
      await refetchUsers()
      if (onDataUpdate) {
        onDataUpdate({ action: 'bulk_action', bulkAction: action, userIds })
      }
    } catch (err) {
      error(`Failed to ${action} users`)
    }
  }

  const handleRefresh = async () => {
    try {
      await refetchUsers()
      success('User data refreshed successfully')
    } catch (err) {
      error('Failed to refresh user data')
    }
  }

  // Show loading skeleton
  if (isLoading && !users.length) {
    return <TableSkeleton />
  }

  // Show error state
  if (hasError && !users.length) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Error loading user data. Please try refreshing.</span>
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

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
    setIsViewUserModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setDeletingUser(user);
    setIsDeleteUserModalOpen(true);
  };

  const confirmDeleteUser = () => {
    console.log("Deleting user:", deletingUser);
    // In a real implementation, you would call an API to delete the user
    // and then update the local state.
    setIsDeleteUserModalOpen(false);
    setDeletingUser(null);
  };

  const handleSaveUser = async (updatedUser) => {
    try {
      debugLog("Saving user:", updatedUser);
      await adminUserService.updateUserStatus(updatedUser.id, updatedUser.status);
      // Refresh the users list
      await fetchUsers();
      setIsEditUserModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      debugLog("Error saving user:", error);
      setError(error.message || 'Failed to save user');
    }
  };

  const handleAddUser = async (newUser) => {
    try {
      debugLog('Adding new user:', newUser);
      // Note: User creation would typically be handled by the organization
      // For now, we'll just refresh the list
      await fetchUsers();
      setIsAddUserModalOpen(false);
    } catch (error) {
      debugLog("Error adding user:", error);
      setError(error.message || 'Failed to add user');
    }
  };

  // Fetch users from API
  const fetchUsers = async (params = {}) => {
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

      debugLog('Fetching users with params:', queryParams);
      
      const response = await adminUserService.getUsers(queryParams);
      
      if (response) {
        setUsers(response.users || []);
        setPagination({
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 10,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0
        });
        debugLog('Users fetched successfully:', response);
      }
    } catch (error) {
      debugLog('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const stats = await adminUserService.getUserStats();
      setUserStats(stats);
      debugLog('User stats fetched:', stats);
    } catch (error) {
      debugLog('Error fetching user stats:', error);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [searchTerm, selectedFilter, sortBy, sortOrder, pagination.page]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchUsers({ page: 1 });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
    

  const subscriptionPlans = [
    { id: 'starter', name: 'Starter', color: 'bg-gray-100 text-gray-800', darkColor: 'bg-gray-800 text-gray-300' },
    { id: 'pro', name: 'Pro', color: 'bg-blue-100 text-blue-800', darkColor: 'bg-blue-900/30 text-blue-400' },
    { id: 'premium', name: 'Premium', color: 'bg-purple-100 text-purple-800', darkColor: 'bg-purple-900/30 text-purple-400' }
  ]

  const statusOptions = [
    { id: 'active', name: 'Active', color: 'bg-green-100 text-green-800', darkColor: 'bg-green-900/30 text-green-400', icon: CheckCircle },
    { id: 'trial', name: 'Trial', color: 'bg-yellow-100 text-yellow-800', darkColor: 'bg-yellow-900/30 text-yellow-400', icon: AlertCircle },
    { id: 'suspended', name: 'Suspended', color: 'bg-red-100 text-red-800', darkColor: 'bg-red-900/30 text-red-400', icon: Ban },
    { id: 'inactive', name: 'Inactive', color: 'bg-gray-100 text-gray-800', darkColor: 'bg-gray-800 text-gray-300', icon: Activity }
  ]

  const filterOptions = [
    { id: 'all', name: 'All Users', count: userStats.overview?.total || 0 },
    { id: 'active', name: 'Active', count: userStats.overview?.active || 0 },
    { id: 'trial', name: 'Trial', count: userStats.byRole?.trial || 0 },
    { id: 'premium', name: 'Premium', count: userStats.byPlan?.premium || 0 },
    { id: 'suspended', name: 'Suspended', count: userStats.overview?.inactive || 0 }
  ]

  // Map API user data to component format
  const mappedUsers = useMemo(() => {
    return users.map(user => ({
      id: user._id || user.id,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email,
      email: user.email,
      company: user.organizationId?.name || 'N/A',
      subscription: user.organizationId?.subscription?.planId || 'free',
      status: user.isActive ? 'active' : 'inactive',
      created_at: user.createdAt,
      last_active: user.activity?.lastActiveAt || user.updatedAt,
      posts_count: user.stats?.contentCount || 0,
      ai_usage: user.stats?.aiUsageCount || 0,
      revenue: user.stats?.revenue || 0,
      role: user.role || 'user',
      avatar: user.avatar || null,
      phone: user.phone || null,
      location: user.location || null
    }));
  }, [users]);

  // Filter and sort users (now using mapped data)
  const filteredUsers = useMemo(() => {
    let filtered = mappedUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.company.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = selectedFilter === 'all' || 
                           user.status === selectedFilter ||
                           user.subscription.toLowerCase() === selectedFilter
      
      return matchesSearch && matchesFilter
    })

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'created_at' || sortBy === 'last_active') {
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
  }, [mappedUsers, searchTerm, selectedFilter, sortBy, sortOrder])

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.id === status)
    const Icon = statusConfig?.icon || Activity
    
    return (
      <Badge className={isDarkMode ? (statusConfig?.darkColor || 'bg-gray-800 text-gray-300') : (statusConfig?.color || 'bg-gray-100 text-gray-800')}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig?.name || status}
      </Badge>
    )
  }

  const getSubscriptionBadge = (subscription) => {
    const plan = subscriptionPlans.find(p => p.name === subscription)
    return (
      <Badge className={isDarkMode ? (plan?.darkColor || 'bg-gray-800 text-gray-300') : (plan?.color || 'bg-gray-100 text-gray-800')}>
        {subscription}
      </Badge>
    )
  }

  const handleUserAction = (action, userId) => {
    console.log(`${action} user:`, userId)
    // In real implementation, this would call API
  }

  const handleBulkAction = (action) => {
    console.log(`${action} users:`, selectedUsers)
    // In real implementation, this would call API
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id))
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User Management</h1>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage customer accounts, subscriptions, and activity
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant='outline' 
                size='sm' 
                onClick={handleExport} 
                disabled={isExportingUsers}
                className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}
              >
                <Download className='h-4 w-4 mr-2' />
                {isExportingUsers ? 'Exporting...' : 'Export'}
              </Button>
              <Button size='sm' onClick={() => setIsAddUserModalOpen(true)} className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                <UserPlus className='h-4 w-4 mr-2' />
                Add User
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {filterOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedFilter === option.id 
                      ? (isDarkMode ? 'ring-2 ring-blue-500 bg-blue-900/20' : 'ring-2 ring-blue-500 bg-blue-50')
                      : (isDarkMode ? 'bg-slate-800 border-slate-700' : '')
                  }`}
                  onClick={() => setSelectedFilter(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${
                          selectedFilter === option.id 
                            ? (isDarkMode ? 'text-blue-300' : 'text-gray-600')
                            : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>{option.name}</p>
                        <p className={`text-2xl font-bold ${
                          selectedFilter === option.id 
                            ? (isDarkMode ? 'text-white' : 'text-gray-900')
                            : isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{option.count}</p>
                      </div>
                      <Users className={`h-8 w-8 ${
                        selectedFilter === option.id 
                          ? (isDarkMode ? 'text-blue-400' : 'text-gray-400')
                          : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Filters and Search */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Search users..."
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
                      value="created_at" 
                      style={isDarkMode ? { backgroundColor: '#334155', color: 'white' } : {}}
                    >
                      Sort by Created Date
                    </option>
                    <option 
                      value="last_active" 
                      style={isDarkMode ? { backgroundColor: '#334155', color: 'white' } : {}}
                    >
                      Sort by Last Active
                    </option>
                    <option 
                      value="name" 
                      style={isDarkMode ? { backgroundColor: '#334155', color: 'white' } : {}}
                    >
                      Sort by Name
                    </option>
                    <option 
                      value="revenue" 
                      style={isDarkMode ? { backgroundColor: '#334155', color: 'white' } : {}}
                    >
                      Sort by Revenue
                    </option>
                  </select>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
                
                {selectedUsers.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedUsers.length} selected
                    </span>
                    <Button variant='outline' size='sm' onClick={() => handleBulkAction('suspend')} className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
                      Suspend
                    </Button>
                    <Button variant='outline' size='sm' onClick={() => handleBulkAction('activate')} className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
                      Activate
                    </Button>
                    <Button variant='outline' size='sm' onClick={() => handleBulkAction('delete')} className={isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700' : ''}>
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Users ({filteredUsers.length})</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Manage and monitor all platform users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <th className="text-left p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={selectAllUsers}
                            className={`rounded ${isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-300'}`}
                        />
                      </th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User</th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subscription</th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Status</th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Activity</th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Revenue</th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Created</th>
                      <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                              Loading users...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                            <span className={isDarkMode ? 'text-red-400' : 'text-red-600'}>
                              {error}
                            </span>
                            <Button 
                              onClick={() => fetchUsers()} 
                              variant="outline" 
                              size="sm"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Retry
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Users className="h-8 w-8 text-gray-400" />
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                              No users found
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`border-b transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className={`rounded ${isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-300'}`}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{user.email}</p>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>{user.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {getSubscriptionBadge(user.subscription)}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.posts_count} posts</p>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{user.ai_usage} AI tokens</p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                              Last active: {format(new Date(user.last_active), 'MMM dd')}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${user.revenue}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Total revenue</p>
                        </td>
                        <td className="p-4">
                          <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {format(new Date(user.created_at), 'MMM dd, yyyy')}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleViewUser(user)}
                              className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleEditUser(user)}
                              className={isDarkMode ? 'text-slate-300 hover:bg-slate-700' : ''}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteUser(user)}
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
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUsers({ page: pagination.page - 1 })}
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
                      onClick={() => fetchUsers({ page: pagination.page + 1 })}
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
      <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="Add New User" isDarkMode={isDarkMode}>
        <AddUserForm onAdd={handleAddUser} onCancel={() => setIsAddUserModalOpen(false)} isDarkMode={isDarkMode} />
      </Modal>
      {editingUser && (
        <Modal isOpen={isEditUserModalOpen} onClose={() => setIsEditUserModalOpen(false)} title="Edit User" isDarkMode={isDarkMode}>
          <EditUserForm user={editingUser} onSave={handleSaveUser} onCancel={() => setIsEditUserModalOpen(false)} isDarkMode={isDarkMode} />
        </Modal>
      )}
      {viewingUser && (
        <Modal isOpen={isViewUserModalOpen} onClose={() => setIsViewUserModalOpen(false)} title="View User" isDarkMode={isDarkMode}>
          <ViewUser user={viewingUser} isDarkMode={isDarkMode} />
        </Modal>
      )}
      {deletingUser && (
        <Modal isOpen={isDeleteUserModalOpen} onClose={() => setIsDeleteUserModalOpen(false)} title="Delete User" isDarkMode={isDarkMode}>
          <div>
            <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>Are you sure you want to delete {deletingUser.name}?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setIsDeleteUserModalOpen(false)} className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
                isDarkMode 
                  ? 'text-gray-300 bg-slate-700 border border-slate-600 hover:bg-slate-600 focus:ring-indigo-500' 
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500'
              }`}>Cancel</button>
              <button onClick={confirmDeleteUser} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer">Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default UserManagement;


