import apiClient from './client';

export interface AttendancePayload {
  school_class_id: number;
  section_id: number;
  date: string;
  records: Array<{
    student_profile_id: number;
    status: 'present' | 'absent' | 'late' | 'excused';
    remarks?: string;
  }>;
}

export const attendanceService = {
  async getAttendance(params: { date?: string; class_id?: number | string; section_id?: number | string } = {}) {
    const response = await apiClient.get('/attendances', { params });
    return response.data.data;
  },

  async recordAttendance(payload: AttendancePayload) {
    const response = await apiClient.post('/attendances', payload);
    return response.data;
  },

  async getReport(params: { student_id?: number; class_id?: number; month?: string } = {}) {
    const response = await apiClient.get('/attendances/report', { params });
    return response.data.data;
  },
};

export default attendanceService;
