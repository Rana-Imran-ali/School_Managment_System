import apiClient from './client';

export interface StudentFilters {
  search?: string;
  class_id?: number | string;
  section_id?: number | string;
  per_page?: number;
}

export const studentService = {
  async getStudents(filters: StudentFilters = {}) {
    const response = await apiClient.get('/students', { params: filters });
    return response.data.data; // { items: [...], pagination: {...} }
  },

  async getStudent(id: number | string) {
    const response = await apiClient.get(`/students/${id}`);
    return response.data.data;
  },

  async createStudent(data: any) {
    const response = await apiClient.post('/students', data);
    return response.data.data;
  },

  async updateStudent(id: number | string, data: any) {
    const response = await apiClient.put(`/students/${id}`, data);
    return response.data.data;
  },

  async deleteStudent(id: number | string) {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },
};

export default studentService;
