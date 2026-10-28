import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  phone?: string;
  status: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'teacher' | 'student' | 'parent';
  phone?: string;
  gender?: 'male' | 'female' | 'other';
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const payload = {
      email: credentials.email,
      password: credentials.password,
    };
    const response = await apiClient.post('/auth/login', payload);
    const { token, user } = response.data.data;
    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('active_user', JSON.stringify(user));
    }
    return { token, user };
  },

  async register(payload: RegisterPayload) {
    const response = await apiClient.post('/auth/register', payload);
    const user = response.data.data?.user || response.data.data;
    return { user };
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('active_user');
    }
  },
};

export default authService;
