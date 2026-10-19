import apiClient from './client';

export const academicService = {
  // Classes
  async getClasses() {
    const response = await apiClient.get('/classes');
    return response.data.data;
  },

  async createClass(data: { name: string; numeric_value?: number; numeric_name?: number; description?: string }) {
    const response = await apiClient.post('/classes', data);
    return response.data.data;
  },

  async updateClass(id: number | string, data: any) {
    const response = await apiClient.put(`/classes/${id}`, data);
    return response.data.data;
  },

  async deleteClass(id: number | string) {
    const response = await apiClient.delete(`/classes/${id}`);
    return response.data;
  },

  // Sections
  async getSections(classId?: number | string) {
    const params = classId ? { class_id: classId } : {};
    const response = await apiClient.get('/sections', { params });
    return response.data.data;
  },

  async createSection(data: { school_class_id: number; name: string; capacity?: number }) {
    const response = await apiClient.post('/sections', data);
    return response.data.data;
  },

  async deleteSection(id: number | string) {
    const response = await apiClient.delete(`/sections/${id}`);
    return response.data;
  },

  // Subjects
  async getSubjects() {
    const response = await apiClient.get('/subjects');
    return response.data.data;
  },

  async createSubject(data: { name: string; code: string; type: string; school_class_id?: number }) {
    const response = await apiClient.post('/subjects', data);
    return response.data.data;
  },

  async deleteSubject(id: number | string) {
    const response = await apiClient.delete(`/subjects/${id}`);
    return response.data;
  },

  // Academic Years
  async getAcademicYears() {
    const response = await apiClient.get('/academic-years');
    return response.data.data;
  },

  async createAcademicYear(data: any) {
    const response = await apiClient.post('/academic-years', data);
    return response.data.data;
  },

  async setActiveAcademicYear(id: number | string) {
    const response = await apiClient.post(`/academic-years/${id}/set-current`);
    return response.data.data;
  },

  // Periods
  async getPeriods() {
    const response = await apiClient.get('/periods');
    return response.data.data;
  },

  async createPeriod(data: any) {
    const response = await apiClient.post('/periods', data);
    return response.data.data;
  },

  // Teacher Assignments
  async getTeacherAssignments(params?: { teacher_id?: number; class_id?: number }) {
    const response = await apiClient.get('/teacher-assignments', { params });
    return response.data.data;
  },

  async createTeacherAssignment(data: any) {
    const response = await apiClient.post('/teacher-assignments', data);
    return response.data.data;
  },

  async deleteTeacherAssignment(id: number | string) {
    const response = await apiClient.delete(`/teacher-assignments/${id}`);
    return response.data;
  },
};

export default academicService;
