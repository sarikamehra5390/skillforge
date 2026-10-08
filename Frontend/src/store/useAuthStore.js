import { create } from 'zustand';
import api from '../api/axios';
import { toast } from 'sonner';
import useSanctuaryStore from './useSanctuaryStore';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('skillforge_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveStoredUser = (user) => {
  if (user) {
    localStorage.setItem('skillforge_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('skillforge_user');
  }
};

const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  _checkAuthPromise: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/users/login', credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      saveStoredUser(user);
      set({ user, token, isAuthenticated: true, loading: false });
      if (user.sanctuarySettings) {
        useSanctuaryStore.getState().hydrateSettings(user.sanctuarySettings);
      }
      toast.success("Welcome back!");
      return true;
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Login failed';
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
      saveStoredUser(user);
      set({ user, token, isAuthenticated: true, loading: false });
      if (user.sanctuarySettings) {
        useSanctuaryStore.getState().hydrateSettings(user.sanctuarySettings);
      }
      toast.success("Welcome to SkillForge!");
      return true;
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Registration failed';
      set({ error: errMsg, loading: false });
      toast.error(errMsg);
      return false;
    }
  },

  logout: (redirect = true) => {
    localStorage.removeItem('token');
    saveStoredUser(null);
    set({ user: null, token: null, isAuthenticated: false, _checkAuthPromise: null });
    useSanctuaryStore.setState({ settings: null, loading: true });
    toast.success("Logged out successfully!");
    if (redirect && typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  },

  checkAuth: async () => {
    const existing = get()._checkAuthPromise;
    if (existing) {
      return existing;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      saveStoredUser(null);
      set({ isAuthenticated: false, loading: false, user: null });
      return;
    }

    set({ loading: true });
    const promise = (async () => {
      try {
        const response = await api.get('/users/profile');
        saveStoredUser(response.data);
        set({ user: response.data, isAuthenticated: true, loading: false, _checkAuthPromise: null });
        if (response.data.sanctuarySettings) {
          useSanctuaryStore.getState().hydrateSettings(response.data.sanctuarySettings);
        }
      } catch (error) {
        localStorage.removeItem('token');
        saveStoredUser(null);
        set({ user: null, token: null, isAuthenticated: false, loading: false, _checkAuthPromise: null });
      }
    })();
    set({ _checkAuthPromise: promise });
    return promise;
  },

  updateProfile: async (updates) => {
    set({ loading: true });
    try {
      const response = await api.put('/users/profile', updates);
      saveStoredUser(response.data);
      set({ user: response.data, loading: false });
      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to update profile';
      toast.error(errMsg);
      set({ loading: false });
      return false;
    }
  },

  updateUser: (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    saveStoredUser(updated);
    set({ user: updated });
  }
}));

export default useAuthStore;
