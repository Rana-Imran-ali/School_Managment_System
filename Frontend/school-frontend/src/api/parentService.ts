import apiClient from './client';

export interface ParentPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  occupation?: string;
  relationship?: string;
  address?: string;
}

export interface UpdateParentPayload {
  name?: string;
  phone?: string;
  occupation?: string;
  relationship?: string;
  address?: string;
}

export const parentService = {
  async getParents(params: { search?: string; per_page?: number } = {}) {
    const response = await apiClient.get('/parents', { params });
    return response.data.data;
  },

  async getParent(id: number) {
    const response = await apiClient.get(`/parents/${id}`);
    return response.data.data;
  },

  async createParent(payload: ParentPayload) {
    const response = await apiClient.post('/parents', payload);
    return response.data.data;
  },

  async updateParent(id: number, payload: UpdateParentPayload) {
    const response = await apiClient.put(`/parents/${id}`, payload);
    return response.data.data;
  },

  async deleteParent(id: number) {
    const response = await apiClient.delete(`/parents/${id}`);
    return response.data.data;
  },

  async getChildren(id: number) {
    const response = await apiClient.get(`/parents/${id}/children`);
    return response.data.data;
  },
};

export default parentService;

