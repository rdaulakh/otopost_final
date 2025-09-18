// Support Ticket Management Service
import apiService from './api.js';
import { endpoints } from '../config/api.js';
import { PAGINATION } from '../config/constants.js';
import { debugLog } from '../config/environment.js';

class SupportService {
  // Get all support tickets
  async getTickets(params = {}) {
    try {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        search = '',
        status = '',
        priority = '',
        category = '',
        assignedTo = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);
      if (priority) queryParams.append('priority', priority);
      if (category) queryParams.append('category', category);
      if (assignedTo) queryParams.append('assignedTo', assignedTo);

      const response = await apiService.get(`${endpoints.support.tickets}?${queryParams}`);
      
      if (response.success) {
        debugLog('Support tickets fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch support tickets');
      }
    } catch (error) {
      debugLog('Get support tickets error:', error);
      throw error;
    }
  }

  // Get ticket by ID
  async getTicket(ticketId) {
    try {
      const response = await apiService.get(`/support/tickets/${ticketId}`);
      
      if (response.success) {
        debugLog('Support ticket fetched successfully:', response.data);
        return response.data.ticket;
      } else {
        throw new Error(response.message || 'Failed to fetch support ticket');
      }
    } catch (error) {
      debugLog('Get support ticket error:', error);
      throw error;
    }
  }

  // Create new ticket
  async createTicket(ticketData) {
    try {
      const response = await apiService.post(endpoints.support.create, ticketData);
      
      if (response.success) {
        debugLog('Support ticket created successfully:', response.data);
        return response.data.ticket;
      } else {
        throw new Error(response.message || 'Failed to create support ticket');
      }
    } catch (error) {
      debugLog('Create support ticket error:', error);
      throw error;
    }
  }

  // Update ticket
  async updateTicket(ticketId, ticketData) {
    try {
      const response = await apiService.put(endpoints.support.update(ticketId), ticketData);
      
      if (response.success) {
        debugLog('Support ticket updated successfully:', response.data);
        return response.data.ticket;
      } else {
        throw new Error(response.message || 'Failed to update support ticket');
      }
    } catch (error) {
      debugLog('Update support ticket error:', error);
      throw error;
    }
  }

  // Update ticket status
  async updateTicketStatus(ticketId, status, notes = '') {
    try {
      const response = await apiService.patch(`/support/tickets/${ticketId}/status`, {
        status,
        notes,
        updatedAt: new Date().toISOString(),
      });
      
      if (response.success) {
        debugLog('Ticket status updated successfully');
        return response.data.ticket;
      } else {
        throw new Error(response.message || 'Failed to update ticket status');
      }
    } catch (error) {
      debugLog('Update ticket status error:', error);
      throw error;
    }
  }

  // Assign ticket
  async assignTicket(ticketId, assigneeId, notes = '') {
    try {
      const response = await apiService.patch(`/support/tickets/${ticketId}/assign`, {
        assignedTo: assigneeId,
        notes,
        assignedAt: new Date().toISOString(),
      });
      
      if (response.success) {
        debugLog('Ticket assigned successfully');
        return response.data.ticket;
      } else {
        throw new Error(response.message || 'Failed to assign ticket');
      }
    } catch (error) {
      debugLog('Assign ticket error:', error);
      throw error;
    }
  }

  // Add ticket comment
  async addTicketComment(ticketId, comment, isInternal = false) {
    try {
      const response = await apiService.post(`/support/tickets/${ticketId}/comments`, {
        comment,
        isInternal,
        createdAt: new Date().toISOString(),
      });
      
      if (response.success) {
        debugLog('Ticket comment added successfully');
        return response.data.comment;
      } else {
        throw new Error(response.message || 'Failed to add ticket comment');
      }
    } catch (error) {
      debugLog('Add ticket comment error:', error);
      throw error;
    }
  }

  // Get ticket comments
  async getTicketComments(ticketId) {
    try {
      const response = await apiService.get(`/support/tickets/${ticketId}/comments`);
      
      if (response.success) {
        debugLog('Ticket comments fetched successfully:', response.data);
        return response.data.comments;
      } else {
        throw new Error(response.message || 'Failed to fetch ticket comments');
      }
    } catch (error) {
      debugLog('Get ticket comments error:', error);
      throw error;
    }
  }

  // Get support statistics
  async getSupportStats(params = {}) {
    try {
      const {
        period = '30d',
        groupBy = 'day',
      } = params;

      const queryParams = new URLSearchParams({
        period,
        groupBy,
      });

      const response = await apiService.get(`/support/stats?${queryParams}`);
      
      if (response.success) {
        debugLog('Support statistics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch support statistics');
      }
    } catch (error) {
      debugLog('Get support stats error:', error);
      throw error;
    }
  }

  // Get agent performance
  async getAgentPerformance(params = {}) {
    try {
      const {
        period = '30d',
        agentId = '',
      } = params;

      const queryParams = new URLSearchParams({ period });
      if (agentId) queryParams.append('agentId', agentId);

      const response = await apiService.get(`/support/agent-performance?${queryParams}`);
      
      if (response.success) {
        debugLog('Agent performance fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch agent performance');
      }
    } catch (error) {
      debugLog('Get agent performance error:', error);
      throw error;
    }
  }

  // Get support categories
  async getSupportCategories() {
    try {
      const response = await apiService.get('/support/categories');
      
      if (response.success) {
        debugLog('Support categories fetched successfully:', response.data);
        return response.data.categories;
      } else {
        throw new Error(response.message || 'Failed to fetch support categories');
      }
    } catch (error) {
      debugLog('Get support categories error:', error);
      throw error;
    }
  }

  // Create support category
  async createSupportCategory(categoryData) {
    try {
      const response = await apiService.post('/support/categories', categoryData);
      
      if (response.success) {
        debugLog('Support category created successfully:', response.data);
        return response.data.category;
      } else {
        throw new Error(response.message || 'Failed to create support category');
      }
    } catch (error) {
      debugLog('Create support category error:', error);
      throw error;
    }
  }

  // Get support agents
  async getSupportAgents() {
    try {
      const response = await apiService.get('/support/agents');
      
      if (response.success) {
        debugLog('Support agents fetched successfully:', response.data);
        return response.data.agents;
      } else {
        throw new Error(response.message || 'Failed to fetch support agents');
      }
    } catch (error) {
      debugLog('Get support agents error:', error);
      throw error;
    }
  }

  // Bulk update tickets
  async bulkUpdateTickets(ticketIds, updateData) {
    try {
      const response = await apiService.patch('/support/tickets/bulk-update', {
        ticketIds,
        updateData,
      });
      
      if (response.success) {
        debugLog('Tickets bulk updated successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to bulk update tickets');
      }
    } catch (error) {
      debugLog('Bulk update tickets error:', error);
      throw error;
    }
  }

  // Export tickets
  async exportTickets(params = {}) {
    try {
      const {
        format = 'csv',
        filters = {},
        fields = [],
      } = params;

      const queryParams = new URLSearchParams({
        format,
        ...filters,
      });

      if (fields.length > 0) {
        queryParams.append('fields', fields.join(','));
      }

      await apiService.downloadFile(
        `/support/tickets/export?${queryParams}`,
        `support_tickets_${new Date().toISOString().split('T')[0]}.${format}`
      );

      debugLog('Support tickets exported successfully');
      return true;
    } catch (error) {
      debugLog('Export support tickets error:', error);
      throw error;
    }
  }

  // Get ticket templates
  async getTicketTemplates() {
    try {
      const response = await apiService.get('/support/templates');
      
      if (response.success) {
        debugLog('Ticket templates fetched successfully:', response.data);
        return response.data.templates;
      } else {
        throw new Error(response.message || 'Failed to fetch ticket templates');
      }
    } catch (error) {
      debugLog('Get ticket templates error:', error);
      throw error;
    }
  }

  // Create ticket template
  async createTicketTemplate(templateData) {
    try {
      const response = await apiService.post('/support/templates', templateData);
      
      if (response.success) {
        debugLog('Ticket template created successfully:', response.data);
        return response.data.template;
      } else {
        throw new Error(response.message || 'Failed to create ticket template');
      }
    } catch (error) {
      debugLog('Create ticket template error:', error);
      throw error;
    }
  }

  // Get SLA metrics
  async getSLAMetrics(params = {}) {
    try {
      const {
        period = '30d',
        category = '',
      } = params;

      const queryParams = new URLSearchParams({ period });
      if (category) queryParams.append('category', category);

      const response = await apiService.get(`/support/sla-metrics?${queryParams}`);
      
      if (response.success) {
        debugLog('SLA metrics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch SLA metrics');
      }
    } catch (error) {
      debugLog('Get SLA metrics error:', error);
      throw error;
    }
  }

  // Get customer satisfaction
  async getCustomerSatisfaction(params = {}) {
    try {
      const {
        period = '30d',
        agentId = '',
      } = params;

      const queryParams = new URLSearchParams({ period });
      if (agentId) queryParams.append('agentId', agentId);

      const response = await apiService.get(`/support/satisfaction?${queryParams}`);
      
      if (response.success) {
        debugLog('Customer satisfaction fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch customer satisfaction');
      }
    } catch (error) {
      debugLog('Get customer satisfaction error:', error);
      throw error;
    }
  }

  // Send satisfaction survey
  async sendSatisfactionSurvey(ticketId) {
    try {
      const response = await apiService.post(`/support/tickets/${ticketId}/satisfaction-survey`);
      
      if (response.success) {
        debugLog('Satisfaction survey sent successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to send satisfaction survey');
      }
    } catch (error) {
      debugLog('Send satisfaction survey error:', error);
      throw error;
    }
  }

  // Get escalation rules
  async getEscalationRules() {
    try {
      const response = await apiService.get('/support/escalation-rules');
      
      if (response.success) {
        debugLog('Escalation rules fetched successfully:', response.data);
        return response.data.rules;
      } else {
        throw new Error(response.message || 'Failed to fetch escalation rules');
      }
    } catch (error) {
      debugLog('Get escalation rules error:', error);
      throw error;
    }
  }

  // Create escalation rule
  async createEscalationRule(ruleData) {
    try {
      const response = await apiService.post('/support/escalation-rules', ruleData);
      
      if (response.success) {
        debugLog('Escalation rule created successfully:', response.data);
        return response.data.rule;
      } else {
        throw new Error(response.message || 'Failed to create escalation rule');
      }
    } catch (error) {
      debugLog('Create escalation rule error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const supportService = new SupportService();

export default supportService;

