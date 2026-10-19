import apiClient from './client';

export const messageService = {
  async getInbox(params: { per_page?: number } = {}) {
    const response = await apiClient.get('/messages/inbox', { params });
    return response.data.data;
  },

  async getSent(params: { per_page?: number } = {}) {
    const response = await apiClient.get('/messages/sent', { params });
    return response.data.data;
  },

  async getConversation(contactId: number | string) {
    const response = await apiClient.get(`/messages/conversation/${contactId}`);
    return response.data.data;
  },

  async sendMessage(data: { receiver_id: number; subject?: string; message: string }) {
    const response = await apiClient.post('/messages', data);
    return response.data.data;
  },
};

export default messageService;
