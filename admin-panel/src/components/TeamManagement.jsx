import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Eye,
  Filter,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  UserX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Modal from './ui/Modal';
import InviteMemberForm from './InviteMemberForm';
import { useTeamManagement } from '../hooks/useTeamManagement';
import { format } from 'date-fns';

const TeamManagement = ({ isDarkMode = false }) => {
  // Team management hook
  const {
    teamMembers,
    teamAnalytics,
    availableRoles,
    selectedMember,
    derivedMetrics,
    loading,
    error,
    fetchTeamMembers,
    fetchTeamAnalytics,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
    getTeamMemberDetails,
    refreshAllData
  } = useTeamManagement();

  // Component state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize data on component mount
  useEffect(() => {
    refreshAllData({
      search: searchTerm,
      role: selectedRole !== 'all' ? selectedRole : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: 10
    });
  }, [refreshAllData, searchTerm, selectedRole, selectedStatus, selectedDepartment, sortBy, sortOrder, currentPage]);

  // Handle team member operations
  const handleInviteMember = async (invitationData) => {
    try {
      await inviteTeamMember(invitationData);
      setIsInviteModalOpen(false);
      // Show success notification
    } catch (error) {
      console.error('Failed to invite team member:', error);
      // Show error notification
    }
  };

  const handleEditMember = async (memberData) => {
    try {
      await updateTeamMember(editingMember.id, memberData);
      setIsEditModalOpen(false);
      setEditingMember(null);
      // Show success notification
    } catch (error) {
      console.error('Failed to update team member:', error);
      // Show error notification
    }
  };

  const handleDeleteMember = async () => {
    try {
      await removeTeamMember(deletingMember.id);
      setIsDeleteModalOpen(false);
      setDeletingMember(null);
      // Show success notification
    } catch (error) {
      console.error('Failed to remove team member:', error);
      // Show error notification
    }
  };

  const handleViewMember = async (member) => {
    try {
      const memberDetails = await getTeamMemberDetails(member.id);
      setViewingMember(memberDetails);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch member details:', error);
      // Fallback to basic member data
      setViewingMember(member);
      setIsViewModalOpen(true);
    }
  };

  const handleRefresh = async () => {
    await refreshAllData({
      search: searchTerm,
      role: selectedRole !== 'all' ? selectedRole : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: 10
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      'Super Admin': isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800',
      'Admin': isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800',
      'Support Manager': isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800',
      'Financial Manager': isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800',
      'Content Manager': isDarkMode ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-800',
      'Marketing Manager': isDarkMode ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800',
    };
    return colors[role] || (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800');
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800',
      'Inactive': isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800',
      'Pending': isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800',
      'Suspended': isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800',
    };
    return colors[status] || (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-3 w-3" />;
      case 'Pending':
        return <Clock className="h-3 w-3" />;
      case 'Suspended':
        return <UserX className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const formatLastActive = (lastActive) => {
    try {
      const date = new Date(lastActive);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} days ago`;
      
      const diffInWeeks = Math.floor(diffInDays / 7);
      if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
      
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Unknown';
    }
  };

  if (loading && teamMembers.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className={`h-8 w-8 animate-spin mx-auto mb-4 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
            <p className={isDarkMode ? 'text-white' : 'text-gray-600'}>Loading team members...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Team Management
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage your team members, roles, and permissions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
              className={isDarkMode ? 'border-slate-600 text-white hover:bg-slate-700' : ''}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => setIsInviteModalOpen(true)} 
              className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <UserPlus className="mr-2 h-4 w-4" /> 
              Invite Team Member
            </Button>
          </div>
        </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Total Members
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {teamAnalytics.summary.total_members}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Active Members
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {teamAnalytics.summary.active_members}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className={`h-8 w-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Pending Invites
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {teamAnalytics.summary.pending_members}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className={`h-8 w-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Avg Tenure
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {teamAnalytics.summary.avg_tenure}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className={`mb-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Roles</option>
                  {availableRoles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members Table */}
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              Team Members ({teamMembers.length})
            </CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Manage your team members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center">
                  <AlertCircle className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Member
                    </th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Role
                    </th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Status
                    </th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Department
                    </th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Last Active
                    </th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <motion.tr 
                      key={member.id} 
                      className={`border-b transition-colors ${
                        isDarkMode 
                          ? 'hover:bg-slate-800/50' 
                          : 'hover:bg-gray-50'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <img
                            src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                            alt={member.name}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {member.name}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getRoleColor(member.role)}>
                          <Shield className="mr-1 h-3 w-3" />
                          {member.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(member.status)}>
                          {getStatusIcon(member.status)}
                          <span className="ml-1">{member.status}</span>
                        </Badge>
                      </td>
                      <td className={`p-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {member.department || 'N/A'}
                      </td>
                      <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatLastActive(member.last_active)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewMember(member)}
                            className={isDarkMode ? 'hover:bg-slate-700' : ''}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingMember(member);
                              setIsEditModalOpen(true);
                            }}
                            className={isDarkMode ? 'hover:bg-slate-700' : ''}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setDeletingMember(member);
                              setIsDeleteModalOpen(true);
                            }}
                            className={`${isDarkMode ? 'hover:bg-slate-700' : ''} text-red-500 hover:text-red-700`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {teamMembers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Users className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`} />
                  <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    No team members found
                  </p>
                  <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Try adjusting your search criteria or invite new team members.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Member Modal */}
      <Modal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        title="Invite New Team Member" 
        isDarkMode={isDarkMode}
      >
        <InviteMemberForm 
          onInvite={handleInviteMember} 
          onCancel={() => setIsInviteModalOpen(false)} 
          isDarkMode={isDarkMode}
          availableRoles={availableRoles}
        />
      </Modal>

      {/* View Member Modal */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        title="Team Member Details" 
        isDarkMode={isDarkMode}
      >
        {viewingMember && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={viewingMember.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingMember.name}`}
                alt={viewingMember.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {viewingMember.name}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {viewingMember.email}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={getRoleColor(viewingMember.role)}>
                    {viewingMember.role}
                  </Badge>
                  <Badge className={getStatusColor(viewingMember.status)}>
                    {viewingMember.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Department
                </label>
                <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {viewingMember.department || 'N/A'}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Last Active
                </label>
                <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatLastActive(viewingMember.last_active)}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Joined
                </label>
                <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {format(new Date(viewingMember.created_at), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone
                </label>
                <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {viewingMember.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Remove Team Member" 
        isDarkMode={isDarkMode}
      >
        {deletingMember && (
          <div className="space-y-4">
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to remove <strong>{deletingMember.name}</strong> from the team? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteModalOpen(false)}
                className={isDarkMode ? 'border-slate-600 text-white hover:bg-slate-700' : ''}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteMember}
                disabled={loading}
              >
                {loading ? 'Removing...' : 'Remove Member'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default TeamManagement;
