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

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.message ||
  fallbackMessage;

const hydrateSanctuary = (user) => {
  if (user?.sanctuarySettings) {
    useSanctuaryStore
      .getState()
      .hydrateSettings(user.sanctuarySettings);
  }
};

const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: Boolean(localStorage.getItem('token')),
  loading: false,
  error: null,

  _checkAuthPromise: null,

  // =========================
  // Login
  // =========================

  login: async (credentials) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const response = await api.post('/users/login', credentials);

      const { token, user } = response.data || {};

      if (!token || !user) {
        throw new Error('Invalid login response from server.');
      }

      localStorage.setItem('token', token);
      saveStoredUser(user);

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      hydrateSanctuary(user);

      toast.success('Welcome back!');

      return true;
    } catch (error) {
      const errMsg = getErrorMessage(
        error,
        'Login failed'
      );

      set({
        error: errMsg,
        loading: false,
        isAuthenticated: false,
      });

      toast.error(errMsg);

      return false;
    }
  },

  // =========================
  // Register
  // =========================

  register: async (userData) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const response = await api.post(
        '/users/register',
        userData
      );

      const { token, user } = response.data || {};

      if (!token || !user) {
        throw new Error(
          'Invalid registration response from server.'
        );
      }

      localStorage.setItem('token', token);
      saveStoredUser(user);

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      hydrateSanctuary(user);

      toast.success('Welcome to SkillForge!');

      return true;
    } catch (error) {
      const errMsg = getErrorMessage(
        error,
        'Registration failed'
      );

      set({
        error: errMsg,
        loading: false,
        isAuthenticated: false,
      });

      toast.error(errMsg);

      return false;
    }
  },

  // =========================
  // Logout
  // =========================

  logout: (redirect = true) => {
    localStorage.removeItem('token');
    saveStoredUser(null);

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      _checkAuthPromise: null,
    });

    useSanctuaryStore.getState().clearLocalAudioPreferences();

    useSanctuaryStore.setState({
      settings: null,
      loading: false,
    });

    // Only show the toast for an intentional logout.
    // The Axios interceptor uses logout(false).
    if (redirect) {
      toast.success('Logged out successfully!');
    }

    if (
      redirect &&
      typeof window !== 'undefined'
    ) {
      window.location.replace('/login');
    }
  },

  // =========================
  // Check Authentication
  // =========================

  checkAuth: async () => {
    const existingPromise = get()._checkAuthPromise;

    if (existingPromise) {
      return existingPromise;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      saveStoredUser(null);

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        _checkAuthPromise: null,
      });

      return false;
    }

    set({
      loading: true,
      error: null,
    });

    const promise = (async () => {
      try {
        const response = await api.get(
          '/users/profile'
        );

        const user = response.data;

        if (!user) {
          throw new Error(
            'Invalid profile response from server.'
          );
        }

        saveStoredUser(user);

        set({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        hydrateSanctuary(user);

        return true;
      } catch {
        // The Axios interceptor may already have
        // handled an unauthorized response.
        localStorage.removeItem('token');
        saveStoredUser(null);

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });

        useSanctuaryStore.setState({
          settings: null,
          loading: false,
        });

        return false;
      } finally {
        set({
          _checkAuthPromise: null,
        });
      }
    })();

    set({
      _checkAuthPromise: promise,
    });

    return promise;
  },

  // =========================
  // Update Profile
  // =========================

  updateProfile: async (updates) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const response = await api.put(
        '/users/profile',
        updates
      );

      const updatedUser = response.data;

      if (!updatedUser) {
        throw new Error(
          'Invalid profile response from server.'
        );
      }

      saveStoredUser(updatedUser);

      set({
        user: updatedUser,
        loading: false,
        error: null,
      });

      hydrateSanctuary(updatedUser);

      toast.success(
        'Profile updated successfully!'
      );

      return true;
    } catch (error) {
      const errMsg = getErrorMessage(
        error,
        'Failed to update profile'
      );

      set({
        loading: false,
        error: errMsg,
      });

      toast.error(errMsg);

      return false;
    }
  },

  // =========================
  // Local User Update
  // =========================

  updateUser: (updates) => {
    const currentUser = get().user;

    if (!currentUser) {
      return;
    }

    const updatedUser = {
      ...currentUser,
      ...updates,
    };

    saveStoredUser(updatedUser);

    set({
      user: updatedUser,
    });

    hydrateSanctuary(updatedUser);
  },
}));

export default useAuthStore;
