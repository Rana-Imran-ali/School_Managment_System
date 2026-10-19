import apiClient from './client';

export const timetableService = {
  async getTimetables(params: { class_id?: number; section_id?: number; teacher_id?: number; day?: string } = {}) {
    const response = await apiClient.get('/timetables', { params });
    return response.data.data;
  },

  async createTimetable(data: {
    school_class_id: number;
    section_id: number;
    subject_id: number;
    teacher_profile_id: number;
    period_id: number;
    day_of_week: string;
    room_number?: string;
  }) {
    const response = await apiClient.post('/timetables', data);
    return response.data.data;
  },

  async deleteTimetable(id: number | string) {
    const response = await apiClient.delete(`/timetables/${id}`);
    return response.data;
  },
};

export default timetableService;
