import api from './api';

const planService = {
  // Get all plans
  getPlans: async (params = {}) => {
    try {
      const response = await api.get('/plans', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  },

  // Get plan by ID
  getPlan: async (id) => {
    try {
      const response = await api.get(`/plans/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw error;
    }
  },

  // Create new plan
  createPlan: async (planData) => {
    try {
      const response = await api.post('/plans', planData);
      return response.data;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  },

  // Update plan
  updatePlan: async (id, planData) => {
    try {
      const response = await api.put(`/plans/${id}`, planData);
      return response.data;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  },

  // Delete plan
  deletePlan: async (id) => {
    try {
      const response = await api.delete(`/plans/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  },

  // Toggle plan status
  togglePlanStatus: async (id) => {
    try {
      const response = await api.patch(`/plans/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling plan status:', error);
      throw error;
    }
  }
};

export default planService;

