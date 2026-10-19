import apiClient from './client';

export const feeService = {
  async getFeePayments(params: { student_id?: number; status?: string; search?: string; per_page?: number } = {}) {
    const response = await apiClient.get('/fee-payments', { params });
    return response.data.data;
  },

  async recordPayment(data: {
    student_profile_id: number;
    fee_type_id?: number;
    fee_structure_id?: number;
    amount_paid: number;
    payment_date: string;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'online';
    transaction_id?: string;
    status: 'paid' | 'partial' | 'pending';
    remarks?: string;
  }) {
    const response = await apiClient.post('/fee-payments', data);
    return response.data.data;
  },

  async getFeeStructures(params: { class_id?: number; academic_year_id?: number } = {}) {
    const response = await apiClient.get('/fee-structures', { params });
    return response.data.data;
  },

  async createFeeStructure(data: {
    fee_type_id: number;
    school_class_id: number;
    academic_year_id: number;
    amount: number;
    due_date: string;
  }) {
    const response = await apiClient.post('/fee-structures', data);
    return response.data.data;
  },

  async getFeeTypes() {
    const response = await apiClient.get('/fee-types');
    return response.data.data;
  },

  async createFeeType(data: { name: string; description?: string }) {
    const response = await apiClient.post('/fee-types', data);
    return response.data.data;
  },
};

export default feeService;
