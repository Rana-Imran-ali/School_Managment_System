import apiClient from './client';

export const adminService = {
  async getDashboardStats() {
    const response = await apiClient.get('/admin/dashboard-stats');
    return response.data.data;
  },

  async getActivityLogs(params: { module?: string; search?: string; per_page?: number } = {}) {
    const response = await apiClient.get('/activity-logs', { params });
    return response.data.data;
  },
};

export default adminService;
