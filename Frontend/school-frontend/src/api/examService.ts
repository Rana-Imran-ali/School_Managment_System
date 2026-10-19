import apiClient from './client';

export const examService = {
  async getExams(params: { academic_year_id?: number } = {}) {
    const response = await apiClient.get('/exams', { params });
    return response.data.data;
  },

  async createExam(data: { name: string; academic_year_id: number; start_date: string; end_date: string; term?: string }) {
    const response = await apiClient.post('/exams', data);
    return response.data.data;
  },

  async getGrades() {
    const response = await apiClient.get('/grades');
    return response.data.data;
  },

  async getResults(params: { exam_id?: number; student_id?: number; subject_id?: number } = {}) {
    const response = await apiClient.get('/exam-results', { params });
    return response.data.data;
  },

  async recordResults(data: {
    exam_id: number;
    subject_id: number;
    results: Array<{
      student_profile_id: number;
      marks_obtained: number;
      total_marks?: number;
      remarks?: string;
    }>;
  }) {
    const response = await apiClient.post('/exam-results', data);
    return response.data;
  },

  async getStudentReportCard(studentId: number | string, examId?: number | string) {
    const params = examId ? { exam_id: examId } : {};
    const response = await apiClient.get(`/students/${studentId}/report-card`, { params });
    return response.data.data;
  },
};

export default examService;
