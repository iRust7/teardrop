import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://teardrop-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add session token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    if (response.data.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
    return response.data.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
    return response.data.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    return response.data;
  },

  getSession: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    try {
      const response = await api.get('/auth/profile');
      return response.data.data;
    } catch (error) {
      localStorage.removeItem('auth_token');
      return null;
    }
  },
};

// Users API
export const usersAPI = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data.data; // Unwrap { success, data, message } format
  },

  updateStatus: async (status: 'online' | 'offline' | 'away') => {
    const response = await api.put('/users/status', { status });
    return response.data.data; // Unwrap { success, data, message } format
  },
};

// Messages API
export const messagesAPI = {
  getMessages: async (userId?: string) => {
    const response = await api.get('/messages', {
      params: userId ? { userId } : undefined,
    });
    return response.data.data; // Unwrap { success, data, message } format
  },

  createMessage: async (message: { content: string; sender_id: string; receiver_id: string }) => {
    const response = await api.post('/messages', message);
    return response.data.data; // Unwrap { success, data, message } format
  },
};

export default api;
