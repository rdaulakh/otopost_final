const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Rate limiting for support endpoints
const supportRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per 5 minutes
  message: 'Too many support requests from this IP'
});

router.use(supportRateLimit);
router.use(auth);
router.use(adminAuth);

// Mock support data - in production, this would come from a support ticket system
const generateMockTickets = () => {
  const statuses = ['open', 'in_progress', 'pending', 'resolved', 'closed'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const categories = ['technical', 'billing', 'feature_request', 'account', 'other'];
  const plans = ['Starter', 'Pro', 'Premium'];
  
  const subjects = [
    'Unable to connect Instagram account',
    'Billing question about Pro plan upgrade',
    'Feature request: Bulk post scheduling',
    'AI content generation not working',
    'Account deletion request',
    'Login issues with Google SSO',
    'Analytics data not updating',
    'Social media posting failed',
    'API rate limit exceeded',
    'Password reset not working',
    'Team member access issues',
    'Content calendar sync problems',
    'Mobile app crashes on startup',
    'Export functionality broken',
    'Custom branding options'
  ];

  const customers = [
    { name: 'Sarah Johnson', email: 'sarah@techstart.com', plan: 'Premium' },
    { name: 'Michael Chen', email: 'michael@growthco.io', plan: 'Pro' },
    { name: 'Emily Rodriguez', email: 'emily@digitalagency.com', plan: 'Premium' },
    { name: 'James Wilson', email: 'james@consulting.biz', plan: 'Pro' },
    { name: 'Lisa Wang', email: 'lisa@ecommerce.shop', plan: 'Starter' },
    { name: 'David Kim', email: 'david@startup.tech', plan: 'Pro' },
    { name: 'Anna Martinez', email: 'anna@marketing.co', plan: 'Premium' },
    { name: 'Robert Taylor', email: 'robert@agency.com', plan: 'Pro' }
  ];

  const assignees = ['John Smith', 'Lisa Wang', 'David Kim', 'Sarah Connor', 'Mike Johnson'];

  const tickets = [];
  for (let i = 1; i <= 50; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000);
    
    tickets.push({
      id: `TKT-${String(i).padStart(3, '0')}`,
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      customer: {
        ...customer,
        avatar: `/api/placeholder/40/40`
      },
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      assignee: assignees[Math.floor(Math.random() * assignees.length)],
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
      messages: Math.floor(Math.random() * 15) + 1,
      tags: ['support', 'customer-issue'],
      satisfaction: Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : null,
      description: 'Customer is experiencing issues with the platform functionality. Detailed investigation required.'
    });
  }
  
  return tickets;
};

const generateSupportTeam = () => {
  return [
    {
      id: 1,
      name: 'John Smith',
      role: 'Senior Support Engineer',
      email: 'john.smith@company.com',
      avatar: '/api/placeholder/40/40',
      activeTickets: 8,
      resolvedToday: 12,
      avgRating: 4.8,
      status: 'online',
      joinedAt: '2023-01-15',
      specialties: ['technical', 'api']
    },
    {
      id: 2,
      name: 'Lisa Wang',
      role: 'Support Specialist',
      email: 'lisa.wang@company.com',
      avatar: '/api/placeholder/40/40',
      activeTickets: 5,
      resolvedToday: 9,
      avgRating: 4.6,
      status: 'online',
      joinedAt: '2023-03-20',
      specialties: ['billing', 'account']
    },
    {
      id: 3,
      name: 'David Kim',
      role: 'Technical Support',
      email: 'david.kim@company.com',
      avatar: '/api/placeholder/40/40',
      activeTickets: 3,
      resolvedToday: 7,
      avgRating: 4.9,
      status: 'away',
      joinedAt: '2023-02-10',
      specialties: ['technical', 'integrations']
    },
    {
      id: 4,
      name: 'Sarah Connor',
      role: 'Support Manager',
      email: 'sarah.connor@company.com',
      avatar: '/api/placeholder/40/40',
      activeTickets: 2,
      resolvedToday: 5,
      avgRating: 4.7,
      status: 'online',
      joinedAt: '2022-11-05',
      specialties: ['management', 'escalation']
    }
  ];
};

// @route   GET /api/support/metrics
// @desc    Get support center metrics and KPIs
// @access  Admin
router.get('/metrics', async (req, res) => {
  try {
    const tickets = generateMockTickets();
    const team = generateSupportTeam();
    
    // Calculate metrics
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const resolvedToday = tickets.filter(t => {
      const today = new Date();
      const ticketDate = new Date(t.updated_at);
      return t.status === 'resolved' && 
             ticketDate.toDateString() === today.toDateString();
    }).length;
    
    const avgResponseTime = '2.3 hours'; // Mock calculation
    const avgResolutionTime = '18.5 hours'; // Mock calculation
    const customerSatisfaction = 4.7;
    const firstResponseRate = 94.2;
    const resolutionRate = 87.5;
    
    // Team metrics
    const totalActiveTickets = team.reduce((sum, member) => sum + member.activeTickets, 0);
    const totalResolvedToday = team.reduce((sum, member) => sum + member.resolvedToday, 0);
    const avgTeamRating = team.reduce((sum, member) => sum + member.avgRating, 0) / team.length;

    const metrics = {
      tickets: {
        totalTickets,
        openTickets,
        resolvedToday,
        pendingTickets: tickets.filter(t => t.status === 'pending').length,
        inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
        closedTickets: tickets.filter(t => t.status === 'closed').length
      },
      performance: {
        avgResponseTime,
        avgResolutionTime,
        customerSatisfaction,
        firstResponseRate,
        resolutionRate
      },
      team: {
        totalMembers: team.length,
        onlineMembers: team.filter(m => m.status === 'online').length,
        totalActiveTickets,
        totalResolvedToday,
        avgTeamRating: Math.round(avgTeamRating * 10) / 10
      },
      trends: {
        ticketGrowth: 12.5, // Mock percentage
        resolutionImprovement: 8.3, // Mock percentage
        satisfactionTrend: 2.1 // Mock percentage
      },
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Support metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support metrics',
      error: error.message
    });
  }
});

// @route   GET /api/support/tickets
// @desc    Get support tickets with filtering and pagination
// @access  Admin
router.get('/tickets', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      priority = 'all',
      category = 'all',
      assignee = 'all',
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    let tickets = generateMockTickets();

    // Apply filters
    if (status !== 'all') {
      tickets = tickets.filter(ticket => ticket.status === status);
    }
    
    if (priority !== 'all') {
      tickets = tickets.filter(ticket => ticket.priority === priority);
    }
    
    if (category !== 'all') {
      tickets = tickets.filter(ticket => ticket.category === category);
    }
    
    if (assignee !== 'all') {
      tickets = tickets.filter(ticket => ticket.assignee === assignee);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      tickets = tickets.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.customer.name.toLowerCase().includes(searchLower) ||
        ticket.customer.email.toLowerCase().includes(searchLower) ||
        ticket.id.toLowerCase().includes(searchLower)
      );
    }

    // Sort tickets
    tickets.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
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
    const paginatedTickets = tickets.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        tickets: paginatedTickets,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(tickets.length / limit),
          total: tickets.length,
          limit: parseInt(limit)
        },
        filters: {
          status,
          priority,
          category,
          assignee,
          search,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Support tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support tickets',
      error: error.message
    });
  }
});

// @route   GET /api/support/tickets/:id
// @desc    Get specific support ticket details
// @access  Admin
router.get('/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tickets = generateMockTickets();
    const ticket = tickets.find(t => t.id === id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Add mock conversation history
    ticket.conversation = [
      {
        id: 1,
        author: ticket.customer.name,
        authorType: 'customer',
        message: `Hi, I'm having trouble with ${ticket.subject.toLowerCase()}. Can you please help me resolve this issue?`,
        timestamp: ticket.created_at,
        attachments: []
      },
      {
        id: 2,
        author: ticket.assignee,
        authorType: 'agent',
        message: 'Hello! Thank you for contacting support. I\'ll be happy to help you with this issue. Let me investigate and get back to you shortly.',
        timestamp: new Date(new Date(ticket.created_at).getTime() + 30 * 60 * 1000).toISOString(),
        attachments: []
      }
    ];

    res.json({
      success: true,
      data: ticket
    });

  } catch (error) {
    console.error('Support ticket details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket details',
      error: error.message
    });
  }
});

// @route   GET /api/support/team
// @desc    Get support team members and their metrics
// @access  Admin
router.get('/team', async (req, res) => {
  try {
    const team = generateSupportTeam();

    res.json({
      success: true,
      data: {
        team,
        summary: {
          totalMembers: team.length,
          onlineMembers: team.filter(m => m.status === 'online').length,
          avgRating: team.reduce((sum, m) => sum + m.avgRating, 0) / team.length,
          totalActiveTickets: team.reduce((sum, m) => sum + m.activeTickets, 0),
          totalResolvedToday: team.reduce((sum, m) => sum + m.resolvedToday, 0)
        },
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Support team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support team',
      error: error.message
    });
  }
});

// @route   GET /api/support/analytics
// @desc    Get support analytics data
// @access  Admin
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Generate mock analytics data
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 7;
    
    // Ticket volume data
    const ticketVolumeData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      ticketVolumeData.push({
        date: date.toISOString().split('T')[0],
        tickets: Math.floor(Math.random() * 30) + 20,
        resolved: Math.floor(Math.random() * 25) + 15
      });
    }

    // Category distribution
    const categoryDistribution = [
      { name: 'Technical', value: 45, color: '#3B82F6' },
      { name: 'Billing', value: 25, color: '#10B981' },
      { name: 'Feature Request', value: 15, color: '#8B5CF6' },
      { name: 'Account', value: 10, color: '#F59E0B' },
      { name: 'Other', value: 5, color: '#6B7280' }
    ];

    // Response time data
    const responseTimeData = [];
    for (let hour = 0; hour < 24; hour += 4) {
      responseTimeData.push({
        hour: `${String(hour).padStart(2, '0')}:00`,
        avgTime: Math.random() * 2 + 1.5 // 1.5 to 3.5 hours
      });
    }

    // Satisfaction trends
    const satisfactionTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      satisfactionTrends.push({
        date: date.toISOString().split('T')[0],
        rating: Math.random() * 1 + 4 // 4.0 to 5.0
      });
    }

    const analytics = {
      ticketVolume: ticketVolumeData,
      categoryDistribution,
      responseTime: responseTimeData,
      satisfactionTrends,
      timeRange,
      summary: {
        totalTicketsInPeriod: ticketVolumeData.reduce((sum, day) => sum + day.tickets, 0),
        totalResolvedInPeriod: ticketVolumeData.reduce((sum, day) => sum + day.resolved, 0),
        avgResponseTime: responseTimeData.reduce((sum, hour) => sum + hour.avgTime, 0) / responseTimeData.length,
        avgSatisfaction: satisfactionTrends.reduce((sum, day) => sum + day.rating, 0) / satisfactionTrends.length
      },
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Support analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support analytics',
      error: error.message
    });
  }
});

// @route   PUT /api/support/tickets/:id
// @desc    Update support ticket
// @access  Admin
router.put('/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // In production, this would update the ticket in the database
    // For now, we'll just return a success response
    
    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: {
        id,
        ...updates,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket',
      error: error.message
    });
  }
});

// @route   POST /api/support/tickets/:id/messages
// @desc    Add message to support ticket
// @access  Admin
router.post('/tickets/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, attachments = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // In production, this would add the message to the ticket
    const newMessage = {
      id: Date.now(),
      author: req.user.name || 'Support Agent',
      authorType: 'agent',
      message,
      timestamp: new Date().toISOString(),
      attachments
    };

    res.json({
      success: true,
      message: 'Message added successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add message',
      error: error.message
    });
  }
});

module.exports = router;
