import apiClient from './client';

export const teacherService = {
  async getTeachers(params: { search?: string; per_page?: number } = {}) {
    const response = await apiClient.get('/teachers', { params });
    return response.data.data;
  },

  async getTeacher(id: number | string) {
    const response = await apiClient.get(`/teachers/${id}`);
    return response.data.data;
  },

  async createTeacher(data: any) {
    const response = await apiClient.post('/teachers', data);
    return response.data.data;
  },

  async updateTeacher(id: number | string, data: any) {
    const response = await apiClient.put(`/teachers/${id}`, data);
    return response.data.data;
  },

  async deleteTeacher(id: number | string) {
    const response = await apiClient.delete(`/teachers/${id}`);
    return response.data;
  },
};

export default teacherService;
