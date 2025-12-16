import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
    const session = localStorage.getItem('supabase.auth.token');
    if (session) {
      const { access_token } = JSON.parse(session);
      if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`;
      }
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
    if (response.data.session) {
      localStorage.setItem('supabase.auth.token', JSON.stringify(response.data.session));
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.session) {
      localStorage.setItem('supabase.auth.token', JSON.stringify(response.data.session));
    }
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('supabase.auth.token');
    return response.data;
  },

  getSession: async () => {
    const session = localStorage.getItem('supabase.auth.token');
    return session ? JSON.parse(session) : null;
  },
};

// Users API
export const usersAPI = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
};

// Messages API
export const messagesAPI = {
  getMessages: async (userId?: string) => {
    const response = await api.get('/messages', {
      params: userId ? { userId } : undefined,
    });
    return response.data;
  },

  createMessage: async (message: { content: string; sender_id: string; receiver_id: string }) => {
    const response = await api.post('/messages', message);
    return response.data;
  },
};

export default api;
