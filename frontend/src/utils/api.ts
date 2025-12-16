import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://teardrop-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

// Retry logic for network errors
const retryRequest = async (fn: () => Promise<any>, retries = 2, delay = 1000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0 || (error.response && error.response.status !== 0)) {
      throw error;
    }
    console.log(`[API] Retrying request... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

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
  register: async (username: string, email: string, password: string, turnstileToken?: string) => {
    const response = await api.post('/auth/register', { username, email, password, turnstileToken });
    // Register now returns needsVerification flag instead of token
    return response.data.data || { needsVerification: true, email };
  },

  login: async (email: string, password: string, turnstileToken?: string) => {
    const response = await api.post('/auth/login', { email, password, turnstileToken });
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

  googleCallback: async (email: string, name: string, google_id: string, avatar_url: string) => {
    const response = await api.post('/auth/google/callback', { email, name, google_id, avatar_url });
    if (response.data.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
    return response.data.data;
  },

  resendOTP: async (email: string) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  verifyRegistrationOTP: async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    if (response.data.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
    return response.data.data;
  },

  getSession: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('[AUTH] No token found in localStorage');
      return null;
    }
    
    try {
      console.log('[AUTH] Validating token...');
      const response = await api.get('/auth/profile');
      console.log('[AUTH] Session valid:', response.data);
      // Return in same format as login/register
      return { user: response.data.data };
    } catch (error: any) {
      console.error('[AUTH] Session validation failed:', error);
      // Only clear token if it's an auth error (401/403)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('auth_token');
      }
      throw error;
    }
  },
};

// Users API
export const usersAPI = {
  getAllUsers: async () => {
    return retryRequest(async () => {
      const response = await api.get('/users');
      return response.data.data; // Unwrap { success, data, message } format
    });
  },

  updateStatus: async (status: 'online' | 'offline' | 'away') => {
    const response = await api.put('/users/status', { status });
    return response.data.data; // Unwrap { success, data, message } format
  },
};

// Messages API
export const messagesAPI = {
  getMessages: async (userId?: string) => {
    return retryRequest(async () => {
      const response = await api.get('/messages', {
        params: userId ? { userId } : undefined,
      });
      return response.data.data; // Unwrap { success, data, message } format
    });
  },

  createMessage: async (message: { content: string; receiver_id: string }) => {
    console.log('[MESSAGE] Sending message:', message);
    const response = await api.post('/messages', message);
    console.log('[MESSAGE] Message sent response:', response.data);
    return response.data.data; // Unwrap { success, data, message } format
  },

  sendFile: async (file: File, receiverId: string, caption?: string, fileHash?: string) => {
    console.log('[FILE] Uploading file:', file.name, 'to receiver:', receiverId, 'hash:', fileHash?.substring(0, 16));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('receiver_id', receiverId);
    if (caption) formData.append('caption', caption);
    if (fileHash) formData.append('file_hash', fileHash);

    const response = await api.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('[FILE] File uploaded:', response.data);
    return response.data.data;
  },
};

export default api;
