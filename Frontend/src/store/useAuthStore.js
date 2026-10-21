import { create } from 'zustand';
import api from '../api/axios.js';
import { toast } from 'sonner';
import useSanctuaryStore from './useSanctuaryStore.js';

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
  error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT'
    ? 'The server took too long to respond. Please try again.'
    : !error?.response && error?.code
      ? 'Unable to reach the server. Check your connection and try again.'
      : error?.response?.data?.message ||
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
  authChecked: !localStorage.getItem('token'),
  authChecking: false,
  loginLoading: false,
  registerLoading: false,
  profileUpdating: false,
  error: null,

  _checkAuthPromise: null,
  _authRevision: 0,

  // =========================
  // Login
  // =========================

  login: async (credentials) => {
    set({
      loginLoading: true,
      error: null,
    });

    const requestRevision = get()._authRevision;

    try {
      const response = await api.post('/users/login', credentials, {
        skipAuthSideEffects: true,
        skipAuthHeader: true,
      });

      const { token, user } = response.data || {};

      if (!token || !user) {
        throw new Error('Invalid login response from server.');
      }

      if (get()._authRevision !== requestRevision) return false;

      const revision = requestRevision + 1;
      set({ _authRevision: revision, authChecking: false });

      localStorage.setItem('token', token);
      saveStoredUser(user);

      set({
        user,
        token,
        isAuthenticated: true,
        authChecked: true,
        error: null,
        _checkAuthPromise: null,
      });

      hydrateSanctuary(user);

      toast.success('Welcome back!');

      return true;
    } catch (error) {
      if (get()._authRevision !== requestRevision) return false;

      const errMsg = getErrorMessage(
        error,
        'Login failed'
      );

      set({
        error: errMsg,
      });

      toast.error(errMsg);

      return false;
    } finally {
      set({ loginLoading: false });
    }
  },

  // =========================
  // Register
  // =========================

  register: async (userData) => {
    set({
      registerLoading: true,
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
        authChecked: true,
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
      });

      toast.error(errMsg);

      return false;
    } finally {
      set({ registerLoading: false });
    }
  },

  // =========================
  // Logout
  // =========================

  logout: async (redirect = true) => {
    set({ _authRevision: get()._authRevision + 1 });
    const sanctuaryStore = useSanctuaryStore.getState();
    let saveResult = null;

    // Preserve the final debounced edit before removing the bearer token.
    // A 401-triggered logout cannot save with an invalid token, so it only
    // cancels pending work and leaves the account-scoped dirty cache intact.
    if (redirect) {
      saveResult = await sanctuaryStore.flushSettings();
    } else {
      sanctuaryStore.cancelPendingPersistence();
    }

    localStorage.removeItem('token');
    saveStoredUser(null);

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      authChecked: true,
      authChecking: false,
      loginLoading: false,
      registerLoading: false,
      profileUpdating: false,
      error: null,
      _checkAuthPromise: null,
    });

    useSanctuaryStore.setState({
      settings: null,
      loading: false,
      saving: false,
    });

    if (saveResult?.success === false) {
      toast.error('Some sanctuary changes could not be saved. They are kept on this device and will retry after you sign in again.');
    }

    // Only show the toast for an intentional logout.
    // The Axios interceptor uses logout(false).
    if (redirect) {
      toast.success('Logged out successfully!');
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
        authChecking: false,
        authChecked: true,
        error: null,
        _checkAuthPromise: null,
      });

      return false;
    }

    set({
      authChecking: true,
      error: null,
    });

    const revision = get()._authRevision;

    const promise = (async () => {
      try {
        const response = await api.get(
          '/users/profile',
          { skipAuthSideEffects: true }
        );

        const user = response.data;

        if (!user) {
          throw new Error(
            'Invalid profile response from server.'
          );
        }

        if (get()._authRevision !== revision || localStorage.getItem('token') !== token) {
          return false;
        }

        saveStoredUser(user);

        set({
          user,
          token,
          isAuthenticated: true,
          authChecking: false,
          authChecked: true,
          error: null,
        });

        hydrateSanctuary(user);

        return true;
      } catch (error) {
        if (get()._authRevision === revision && localStorage.getItem('token') === token) {
          if (error?.response?.status === 401) {
            localStorage.removeItem('token');
            saveStoredUser(null);
            useSanctuaryStore.setState({ settings: null, loading: false });
          }

          set({
            user: error?.response?.status === 401 ? null : get().user,
            token: error?.response?.status === 401 ? null : token,
            isAuthenticated: false,
            authChecking: false,
            authChecked: true,
            error: null,
          });
        }

        return false;
      } finally {
        if (get()._authRevision !== revision) {
          set({ authChecking: false });
        }
        if (get()._checkAuthPromise === promise) {
          set({ _checkAuthPromise: null });
        }
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
      profileUpdating: true,
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
        profileUpdating: false,
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
        profileUpdating: false,
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

    // XP, streak, and other profile counters are refreshed frequently (for
    // example after saving a ritual). They do not represent a settings
    // refresh, so replaying the user's possibly stale sanctuarySettings here
    // could undo a newer theme selection in the sanctuary store.
    if (Object.prototype.hasOwnProperty.call(updates || {}, 'sanctuarySettings')) {
      hydrateSanctuary(updatedUser);
    }
  },
}));

export default useAuthStore;
