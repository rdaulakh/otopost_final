const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for team management endpoints
const teamManagementRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
  message: 'Too many team management requests from this IP'
});

router.use(teamManagementRateLimit);
router.use(auth);
router.use(adminAuth);

// Generate mock team members data
const generateMockTeamMembers = () => {
  const roles = [
    'Super Admin',
    'Admin', 
    'Support Manager',
    'Financial Manager',
    'Content Manager',
    'Marketing Manager',
    'Technical Lead',
    'Customer Success Manager',
    'Sales Manager',
    'Operations Manager'
  ];
  
  const statuses = ['Active', 'Inactive', 'Pending', 'Suspended'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'Support', 'Finance', 'Operations', 'HR'];
  
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Emma', 'Alex', 'Maria', 'Robert', 'Jennifer', 'William', 'Elizabeth', 'James'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore'];
  
  const teamMembers = [];
  
  for (let i = 1; i <= 25; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    
    const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const lastActive = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    teamMembers.push({
      id: `team_${i}`,
      name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@aisocialmedia.com`,
      role: role,
      status: status,
      department: department,
      created_at: createdAt.toISOString(),
      updated_at: new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_active: lastActive.toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
      
      // Contact information
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      extension: Math.floor(Math.random() * 9999) + 1000,
      emergency_contact: {
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        relationship: ['Spouse', 'Parent', 'Sibling', 'Friend'][Math.floor(Math.random() * 4)]
      },
      
      // Employment details
      employment: {
        employee_id: `EMP${String(i).padStart(4, '0')}`,
        hire_date: createdAt.toISOString(),
        employment_type: ['Full-time', 'Part-time', 'Contract', 'Intern'][Math.floor(Math.random() * 4)],
        salary: Math.floor(Math.random() * 100000) + 50000,
        manager_id: i > 1 ? `team_${Math.floor(Math.random() * (i - 1)) + 1}` : null,
        location: ['Remote', 'New York Office', 'San Francisco Office', 'London Office'][Math.floor(Math.random() * 4)],
        timezone: ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'America/Chicago'][Math.floor(Math.random() * 4)]
      },
      
      // Permissions and access
      permissions: {
        admin_panel: role.includes('Admin') || role.includes('Manager'),
        user_management: role === 'Super Admin' || role === 'Admin',
        financial_data: role === 'Super Admin' || role === 'Financial Manager',
        support_tickets: role.includes('Support') || role.includes('Admin'),
        content_management: role.includes('Content') || role.includes('Admin'),
        system_settings: role === 'Super Admin',
        analytics: role.includes('Manager') || role.includes('Admin'),
        billing: role === 'Super Admin' || role === 'Financial Manager'
      },
      
      // Performance and activity
      performance: {
        tasks_completed: Math.floor(Math.random() * 500),
        tickets_resolved: Math.floor(Math.random() * 200),
        projects_managed: Math.floor(Math.random() * 20),
        performance_rating: Math.random() * 2 + 3, // 3-5 rating
        last_review: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        next_review: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
      },
      
      // Security and access
      security: {
        two_factor_enabled: Math.random() > 0.3,
        last_login: lastActive.toISOString(),
        login_count: Math.floor(Math.random() * 1000),
        failed_login_attempts: Math.floor(Math.random() * 5),
        password_last_changed: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        active_sessions: Math.floor(Math.random() * 3) + 1,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      },
      
      // Personal information
      profile: {
        bio: `${firstName} is a dedicated ${role.toLowerCase()} with expertise in ${department.toLowerCase()}.`,
        skills: ['Leadership', 'Communication', 'Project Management', 'Analytics', 'Customer Service'].slice(0, Math.floor(Math.random() * 3) + 2),
        languages: ['English', 'Spanish', 'French', 'German'].slice(0, Math.floor(Math.random() * 2) + 1),
        certifications: ['PMP', 'Scrum Master', 'AWS Certified', 'Google Analytics'].slice(0, Math.floor(Math.random() * 2)),
        education: ['Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Certificate'][Math.floor(Math.random() * 4)]
      },
      
      // Team and collaboration
      team_info: {
        reports_count: role.includes('Manager') ? Math.floor(Math.random() * 10) + 1 : 0,
        teams: [department],
        projects: [`Project ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`, `Project ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`].slice(0, Math.floor(Math.random() * 2) + 1),
        collaboration_score: Math.random() * 2 + 3 // 3-5 rating
      }
    });
  }
  
  return teamMembers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

// @route   GET /api/team-management/members
// @desc    Get team members list with filtering and pagination
// @access  Admin
router.get('/members', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = 'all',
      status = 'all',
      department = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    let teamMembers = generateMockTeamMembers();

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      teamMembers = teamMembers.filter(member => 
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.role.toLowerCase().includes(searchLower) ||
        member.department.toLowerCase().includes(searchLower)
      );
    }
    
    if (role !== 'all') {
      teamMembers = teamMembers.filter(member => member.role === role);
    }
    
    if (status !== 'all') {
      teamMembers = teamMembers.filter(member => member.status === status);
    }
    
    if (department !== 'all') {
      teamMembers = teamMembers.filter(member => member.department === department);
    }

    // Sort team members
    teamMembers.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'updated_at' || sortBy === 'last_active') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMembers = teamMembers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        members: paginatedMembers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(teamMembers.length / limit),
          total: teamMembers.length,
          limit: parseInt(limit),
          has_next: endIndex < teamMembers.length,
          has_prev: startIndex > 0
        },
        filters: {
          search,
          role,
          status,
          department,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Team members list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members list',
      error: error.message
    });
  }
});

// @route   GET /api/team-management/members/:id
// @desc    Get team member details by ID
// @access  Admin
router.get('/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const teamMembers = generateMockTeamMembers();
    const member = teamMembers.find(m => m.id === id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      data: member
    });

  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team member details',
      error: error.message
    });
  }
});

// @route   POST /api/team-management/members/invite
// @desc    Invite new team member
// @access  Admin
router.post('/members/invite', async (req, res) => {
  try {
    const {
      email,
      name,
      first_name,
      last_name,
      role,
      department,
      send_invitation = true,
      custom_message = ''
    } = req.body;

    if (!email || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, and role are required'
      });
    }

    // Check if member already exists (mock check)
    const existingMembers = generateMockTeamMembers();
    const existingMember = existingMembers.find(m => m.email.toLowerCase() === email.toLowerCase());
    
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'Team member with this email already exists'
      });
    }

    const invitation = {
      id: `invite_${Date.now()}`,
      email: email.toLowerCase(),
      name,
      first_name: first_name || name.split(' ')[0],
      last_name: last_name || name.split(' ').slice(1).join(' '),
      role,
      department: department || 'General',
      status: 'Pending',
      invited_at: new Date().toISOString(),
      invited_by: req.user.email,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      invitation_token: `token_${Math.random().toString(36).substr(2, 9)}`,
      custom_message,
      send_invitation
    };

    res.status(201).json({
      success: true,
      message: 'Team member invitation sent successfully',
      data: invitation
    });

  } catch (error) {
    console.error('Invite team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to invite team member',
      error: error.message
    });
  }
});

// @route   PUT /api/team-management/members/:id
// @desc    Update team member
// @access  Admin
router.put('/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const teamMembers = generateMockTeamMembers();
    const memberIndex = teamMembers.findIndex(m => m.id === id);
    
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    const updatedMember = {
      ...teamMembers[memberIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: updatedMember
    });

  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team member',
      error: error.message
    });
  }
});

// @route   DELETE /api/team-management/members/:id
// @desc    Remove team member
// @access  Admin
router.delete('/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { transfer_responsibilities = true, replacement_id } = req.query;
    
    const teamMembers = generateMockTeamMembers();
    const member = teamMembers.find(m => m.id === id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      message: 'Team member removed successfully',
      data: {
        id,
        removed_at: new Date().toISOString(),
        transfer_responsibilities,
        replacement_id: replacement_id || null
      }
    });

  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove team member',
      error: error.message
    });
  }
});

// @route   GET /api/team-management/analytics
// @desc    Get team analytics and statistics
// @access  Admin
router.get('/analytics', async (req, res) => {
  try {
    const teamMembers = generateMockTeamMembers();
    
    const analytics = {
      summary: {
        total_members: teamMembers.length,
        active_members: teamMembers.filter(m => m.status === 'Active').length,
        inactive_members: teamMembers.filter(m => m.status === 'Inactive').length,
        pending_members: teamMembers.filter(m => m.status === 'Pending').length,
        suspended_members: teamMembers.filter(m => m.status === 'Suspended').length,
        avg_tenure: '2.3 years',
        turnover_rate: 8.5
      },
      
      role_distribution: [
        { role: 'Super Admin', count: teamMembers.filter(m => m.role === 'Super Admin').length, color: '#8b5cf6' },
        { role: 'Admin', count: teamMembers.filter(m => m.role === 'Admin').length, color: '#3b82f6' },
        { role: 'Manager', count: teamMembers.filter(m => m.role.includes('Manager')).length, color: '#10b981' },
        { role: 'Other', count: teamMembers.filter(m => !m.role.includes('Admin') && !m.role.includes('Manager')).length, color: '#f59e0b' }
      ],
      
      department_distribution: [
        { department: 'Engineering', count: teamMembers.filter(m => m.department === 'Engineering').length, color: '#3b82f6' },
        { department: 'Marketing', count: teamMembers.filter(m => m.department === 'Marketing').length, color: '#10b981' },
        { department: 'Sales', count: teamMembers.filter(m => m.department === 'Sales').length, color: '#f59e0b' },
        { department: 'Support', count: teamMembers.filter(m => m.department === 'Support').length, color: '#ef4444' },
        { department: 'Finance', count: teamMembers.filter(m => m.department === 'Finance').length, color: '#8b5cf6' },
        { department: 'Operations', count: teamMembers.filter(m => m.department === 'Operations').length, color: '#06b6d4' }
      ],
      
      performance_metrics: {
        avg_performance_rating: teamMembers.reduce((sum, m) => sum + m.performance.performance_rating, 0) / teamMembers.length,
        avg_tasks_completed: Math.floor(teamMembers.reduce((sum, m) => sum + m.performance.tasks_completed, 0) / teamMembers.length),
        avg_tickets_resolved: Math.floor(teamMembers.reduce((sum, m) => sum + m.performance.tickets_resolved, 0) / teamMembers.length),
        high_performers: teamMembers.filter(m => m.performance.performance_rating >= 4.5).length,
        needs_improvement: teamMembers.filter(m => m.performance.performance_rating < 3.5).length
      },
      
      security_metrics: {
        two_factor_enabled: teamMembers.filter(m => m.security.two_factor_enabled).length,
        recent_logins: teamMembers.filter(m => {
          const lastLogin = new Date(m.security.last_login);
          const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
          return lastLogin > threeDaysAgo;
        }).length,
        password_updates_needed: teamMembers.filter(m => {
          const lastChange = new Date(m.security.password_last_changed);
          const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          return lastChange < ninetyDaysAgo;
        }).length
      },
      
      recent_activities: [
        {
          id: 'activity_1',
          type: 'member_added',
          description: 'New team member John Doe added to Marketing department',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'Admin User'
        },
        {
          id: 'activity_2',
          type: 'role_updated',
          description: 'Jane Smith promoted to Senior Manager',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          user: 'Admin User'
        },
        {
          id: 'activity_3',
          type: 'member_removed',
          description: 'Former employee access revoked',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          user: 'Super Admin'
        }
      ],
      
      upcoming_reviews: teamMembers
        .filter(m => {
          const nextReview = new Date(m.performance.next_review);
          const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          return nextReview <= thirtyDaysFromNow;
        })
        .slice(0, 10)
        .map(m => ({
          id: m.id,
          name: m.name,
          role: m.role,
          next_review: m.performance.next_review,
          current_rating: m.performance.performance_rating
        })),
      
      last_updated: new Date()
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Team analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team analytics',
      error: error.message
    });
  }
});

// @route   GET /api/team-management/roles
// @desc    Get available roles and permissions
// @access  Admin
router.get('/roles', async (req, res) => {
  try {
    const roles = [
      {
        id: 'super_admin',
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        permissions: ['all'],
        level: 10,
        can_manage: ['all']
      },
      {
        id: 'admin',
        name: 'Admin',
        description: 'Administrative access with most permissions',
        permissions: ['user_management', 'content_management', 'analytics', 'support_tickets'],
        level: 8,
        can_manage: ['user', 'support_manager', 'content_manager']
      },
      {
        id: 'support_manager',
        name: 'Support Manager',
        description: 'Manage customer support and tickets',
        permissions: ['support_tickets', 'user_communication', 'analytics'],
        level: 6,
        can_manage: ['support_agent']
      },
      {
        id: 'financial_manager',
        name: 'Financial Manager',
        description: 'Access to financial data and billing',
        permissions: ['financial_data', 'billing', 'analytics'],
        level: 6,
        can_manage: []
      },
      {
        id: 'content_manager',
        name: 'Content Manager',
        description: 'Manage content and campaigns',
        permissions: ['content_management', 'campaign_management', 'analytics'],
        level: 5,
        can_manage: []
      },
      {
        id: 'marketing_manager',
        name: 'Marketing Manager',
        description: 'Manage marketing campaigns and analytics',
        permissions: ['campaign_management', 'analytics', 'content_management'],
        level: 5,
        can_manage: []
      }
    ];

    res.json({
      success: true,
      data: {
        roles,
        permissions: [
          'user_management',
          'content_management',
          'financial_data',
          'support_tickets',
          'analytics',
          'system_settings',
          'billing',
          'campaign_management',
          'user_communication'
        ]
      }
    });

  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: error.message
    });
  }
});

module.exports = router;
