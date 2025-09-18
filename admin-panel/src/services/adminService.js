// Admin-specific API service
import apiService from './api.js';
import { endpoints } from '../config/api.js';

class AdminService {
  // Authentication
  async login(credentials) {
    try {
      const response = await apiService.post(endpoints.auth.login, credentials);
      return response;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async logout() {
    try {
      await apiService.post(endpoints.auth.logout);
      apiService.clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getProfile() {
    try {
      const response = await apiService.get(endpoints.auth.me);
      return response;
    } catch (error) {
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  }

  // User Management
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${endpoints.users.list}?${queryParams}` : endpoints.users.list;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  async getUser(userId) {
    try {
      const response = await apiService.get(endpoints.users.get(userId));
      return response;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  async createUser(userData) {
    try {
      const response = await apiService.post(endpoints.users.create, userData);
      return response;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await apiService.put(endpoints.users.update(userId), userData);
      return response;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async deleteUser(userId) {
    try {
      const response = await apiService.delete(endpoints.users.delete(userId));
      return response;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async activateUser(userId) {
    try {
      const response = await apiService.post(endpoints.users.activate(userId));
      return response;
    } catch (error) {
      throw new Error(`Failed to activate user: ${error.message}`);
    }
  }

  async deactivateUser(userId) {
    try {
      const response = await apiService.post(endpoints.users.deactivate(userId));
      return response;
    } catch (error) {
      throw new Error(`Failed to deactivate user: ${error.message}`);
    }
  }

  async exportUsers(format = 'csv') {
    try {
      const response = await apiService.get(`${endpoints.users.export}?format=${format}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to export users: ${error.message}`);
    }
  }

  async getUserStats() {
    try {
      const response = await apiService.get(endpoints.users.stats);
      return response;
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  }

  // Subscription Management
  async getSubscriptions(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${endpoints.subscriptions.list}?${queryParams}` : endpoints.subscriptions.list;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(`Failed to get subscriptions: ${error.message}`);
    }
  }

  async getSubscription(subscriptionId) {
    try {
      const response = await apiService.get(endpoints.subscriptions.get(subscriptionId));
      return response;
    } catch (error) {
      throw new Error(`Failed to get subscription: ${error.message}`);
    }
  }

  async createSubscription(subscriptionData) {
    try {
      const response = await apiService.post(endpoints.subscriptions.create, subscriptionData);
      return response;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async updateSubscription(subscriptionId, subscriptionData) {
    try {
      const response = await apiService.put(endpoints.subscriptions.update(subscriptionId), subscriptionData);
      return response;
    } catch (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  async deleteSubscription(subscriptionId) {
    try {
      const response = await apiService.delete(endpoints.subscriptions.delete(subscriptionId));
      return response;
    } catch (error) {
      throw new Error(`Failed to delete subscription: ${error.message}`);
    }
  }

  async getSubscriptionStats() {
    try {
      const response = await apiService.get(endpoints.subscriptions.stats);
      return response;
    } catch (error) {
      throw new Error(`Failed to get subscription stats: ${error.message}`);
    }
  }

  // Analytics
  async getDashboardAnalytics() {
    try {
      const response = await apiService.get(endpoints.analytics.dashboard);
      return response;
    } catch (error) {
      throw new Error(`Failed to get dashboard analytics: ${error.message}`);
    }
  }

  async getRevenueAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${endpoints.analytics.revenue}?${queryParams}` : endpoints.analytics.revenue;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(`Failed to get revenue analytics: ${error.message}`);
    }
  }

  async getUserAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${endpoints.analytics.users}?${queryParams}` : endpoints.analytics.users;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(`Failed to get user analytics: ${error.message}`);
    }
  }

  async getSystemAnalytics() {
    try {
      const response = await apiService.get(endpoints.analytics.system);
      return response;
    } catch (error) {
      throw new Error(`Failed to get system analytics: ${error.message}`);
    }
  }

  async getContentAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${endpoints.analytics.content}?${queryParams}` : endpoints.analytics.content;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(`Failed to get content analytics: ${error.message}`);
    }
  }

  async getCampaignAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${endpoints.analytics.campaigns}?${queryParams}` : endpoints.analytics.campaigns;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(`Failed to get campaign analytics: ${error.message}`);
    }
  }

  async getAIAgentAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${endpoints.analytics.aiAgents}?${queryParams}` : endpoints.analytics.aiAgents;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(`Failed to get AI agent analytics: ${error.message}`);
    }
  }

  // System Health
  async getSystemHealth() {
    try {
      const response = await apiService.get(endpoints.system.health);
      return response;
    } catch (error) {
      throw new Error(`Failed to get system health: ${error.message}`);
    }
  }

  async getSystemMetrics() {
    try {
      const response = await apiService.get(endpoints.system.metrics);
      return response;
    } catch (error) {
      throw new Error(`Failed to get system metrics: ${error.message}`);
    }
  }

  async getSystemAlerts() {
    try {
      const response = await apiService.get(endpoints.system.alerts);
      return response;
    } catch (error) {
      throw new Error(`Failed to get system alerts: ${error.message}`);
    }
  }

  // Content Management
  async getContent(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${endpoints.content.list}?${queryParams}` : endpoints.content.list;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(`Failed to get content: ${error.message}`);
    }
  }

  async getContentItem(contentId) {
    try {
      const response = await apiService.get(endpoints.content.get(contentId));
      return response;
    } catch (error) {
      throw new Error(`Failed to get content item: ${error.message}`);
    }
  }

  async publishContent(contentId) {
    try {
      const response = await apiService.post(endpoints.content.publish(contentId));
      return response;
    } catch (error) {
      throw new Error(`Failed to publish content: ${error.message}`);
    }
  }

  async scheduleContent(contentId, scheduleData) {
    try {
      const response = await apiService.post(endpoints.content.schedule(contentId), scheduleData);
      return response;
    } catch (error) {
      throw new Error(`Failed to schedule content: ${error.message}`);
    }
  }

  // Campaign Management
  async getCampaigns(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${endpoints.campaigns.list}?${queryParams}` : endpoints.campaigns.list;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(`Failed to get campaigns: ${error.message}`);
    }
  }

  async getCampaign(campaignId) {
    try {
      const response = await apiService.get(endpoints.campaigns.get(campaignId));
      return response;
    } catch (error) {
      throw new Error(`Failed to get campaign: ${error.message}`);
    }
  }

  async createCampaign(campaignData) {
    try {
      const response = await apiService.post(endpoints.campaigns.create, campaignData);
      return response;
    } catch (error) {
      throw new Error(`Failed to create campaign: ${error.message}`);
    }
  }

  async updateCampaign(campaignId, campaignData) {
    try {
      const response = await apiService.put(endpoints.campaigns.update(campaignId), campaignData);
      return response;
    } catch (error) {
      throw new Error(`Failed to update campaign: ${error.message}`);
    }
  }

  async deleteCampaign(campaignId) {
    try {
      const response = await apiService.delete(endpoints.campaigns.delete(campaignId));
      return response;
    } catch (error) {
      throw new Error(`Failed to delete campaign: ${error.message}`);
    }
  }

  async startCampaign(campaignId) {
    try {
      const response = await apiService.post(endpoints.campaigns.start(campaignId));
      return response;
    } catch (error) {
      throw new Error(`Failed to start campaign: ${error.message}`);
    }
  }

  async pauseCampaign(campaignId) {
    try {
      const response = await apiService.post(endpoints.campaigns.pause(campaignId));
      return response;
    } catch (error) {
      throw new Error(`Failed to pause campaign: ${error.message}`);
    }
  }

  async stopCampaign(campaignId) {
    try {
      const response = await apiService.post(endpoints.campaigns.stop(campaignId));
      return response;
    } catch (error) {
      throw new Error(`Failed to stop campaign: ${error.message}`);
    }
  }

  // Organization Management
  async getOrganizations(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${endpoints.organizations.list}?${queryParams}` : endpoints.organizations.list;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(`Failed to get organizations: ${error.message}`);
    }
  }

  async getOrganization(organizationId) {
    try {
      const response = await apiService.get(endpoints.organizations.get(organizationId));
      return response;
    } catch (error) {
      throw new Error(`Failed to get organization: ${error.message}`);
    }
  }

  async createOrganization(organizationData) {
    try {
      const response = await apiService.post(endpoints.organizations.create, organizationData);
      return response;
    } catch (error) {
      throw new Error(`Failed to create organization: ${error.message}`);
    }
  }

  async updateOrganization(organizationId, organizationData) {
    try {
      const response = await apiService.put(endpoints.organizations.update(organizationId), organizationData);
      return response;
    } catch (error) {
      throw new Error(`Failed to update organization: ${error.message}`);
    }
  }

  async deleteOrganization(organizationId) {
    try {
      const response = await apiService.delete(endpoints.organizations.delete(organizationId));
      return response;
    } catch (error) {
      throw new Error(`Failed to delete organization: ${error.message}`);
    }
  }

  async getOrganizationMembers(organizationId) {
    try {
      const response = await apiService.get(endpoints.organizations.members(organizationId));
      return response;
    } catch (error) {
      throw new Error(`Failed to get organization members: ${error.message}`);
    }
  }

  // AI Agents Management
  async getAIAgents() {
    try {
      const response = await apiService.get(endpoints.platform.agents);
      return response;
    } catch (error) {
      throw new Error(`Failed to get AI agents: ${error.message}`);
    }
  }

  async updateAIAgent(agentId, agentData) {
    try {
      const response = await apiService.put(`${endpoints.platform.agents}/${agentId}`, agentData);
      return response;
    } catch (error) {
      throw new Error(`Failed to update AI agent: ${error.message}`);
    }
  }

  // Platform Settings
  async getPlatformSettings() {
    try {
      const response = await apiService.get(endpoints.platform.settings);
      return response;
    } catch (error) {
      throw new Error(`Failed to get platform settings: ${error.message}`);
    }
  }

  async updatePlatformSettings(settings) {
    try {
      const response = await apiService.put(endpoints.platform.settings, settings);
      return response;
    } catch (error) {
      throw new Error(`Failed to update platform settings: ${error.message}`);
    }
  }

  // Support Center
  async getSupportTickets(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${endpoints.support.tickets}?${queryParams}` : endpoints.support.tickets;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(`Failed to get support tickets: ${error.message}`);
    }
  }

  async createSupportTicket(ticketData) {
    try {
      const response = await apiService.post(endpoints.support.create, ticketData);
      return response;
    } catch (error) {
      throw new Error(`Failed to create support ticket: ${error.message}`);
    }
  }

  async updateSupportTicket(ticketId, ticketData) {
    try {
      const response = await apiService.put(endpoints.support.update(ticketId), ticketData);
      return response;
    } catch (error) {
      throw new Error(`Failed to update support ticket: ${error.message}`);
    }
  }
}

// Create singleton instance
const adminService = new AdminService();

export default adminService;

