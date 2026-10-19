import apiClient from './client';

export const announcementService = {
  async getAnnouncements(params: { audience?: string } = {}) {
    const response = await apiClient.get('/announcements', { params });
    return response.data.data;
  },

  async createAnnouncement(data: {
    title: string;
    content: string;
    target_audience: 'all' | 'students' | 'teachers' | 'parents';
    publish_date?: string;
  }) {
    const response = await apiClient.post('/announcements', data);
    return response.data.data;
  },

  async deleteAnnouncement(id: number | string) {
    const response = await apiClient.delete(`/announcements/${id}`);
    return response.data;
  },
};

export default announcementService;
