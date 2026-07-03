import { create } from 'zustand';
import api from '../api/axios';
import { toast } from 'sonner';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/users/login', credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, loading: false });
      toast.success("Welcome back!");
      return true;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed';
      set({ error: errMsg, loading: false });
      toast.error(errMsg);
      return false;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/users/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, loading: false });
      toast.success("Welcome to SkillForge!");
      return true;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed';
      set({ error: errMsg, loading: false });
      toast.error(errMsg);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
    toast.success("Logged out successfully!");
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, loading: false });
      return;
    }

    set({ loading: true });
    try {
      const response = await api.get('/users/profile');
      set({ user: response.data, isAuthenticated: true, loading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },

  updateProfile: async (updates) => {
    set({ loading: true });
    try {
      const response = await api.put('/users/profile', updates);
      set({ user: response.data, loading: false });
      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update profile';
      toast.error(errMsg);
      set({ loading: false });
      return false;
    }
  },

  updateUser: (updates) => {
    const user = get().user;
    set({ user: { ...user, ...updates } });
  }
}));

export default useAuthStore;
