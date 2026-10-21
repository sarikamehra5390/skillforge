import axios from 'axios';

const DEFAULT_API_TIMEOUT_MS = 20000;
const DEFAULT_AUTH_TIMEOUT_MS = 75000;
const configuredTimeout = Number(import.meta.env?.VITE_API_TIMEOUT_MS);
const configuredAuthTimeout = Number(import.meta.env?.VITE_AUTH_TIMEOUT_MS);
export const API_TIMEOUT_MS = Number.isFinite(configuredTimeout) && configuredTimeout > 0
  ? configuredTimeout
  : DEFAULT_API_TIMEOUT_MS;
export const AUTH_REQUEST_TIMEOUT_MS = Number.isFinite(configuredAuthTimeout) && configuredAuthTimeout > 0
  ? configuredAuthTimeout
  : DEFAULT_AUTH_TIMEOUT_MS;

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isLoggingOut = false;

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token && !config.skipAuthHeader) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global response/error handling
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error?.response?.status;
    const skipAuthSideEffects = error?.config?.skipAuthSideEffects;

    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      error.message = 'The server took too long to respond. Please try again.';
      return Promise.reject(error);
    }

    if (error?.code === 'ERR_CANCELED') {
      error.message = 'The request was cancelled. Please try again.';
      return Promise.reject(error);
    }

    if (!error.response && !error.code) {
      error.message = 'Unable to reach the server. Check your connection and try again.';
      return Promise.reject(error);
    }

    // Handle expired/invalid authentication
    if (status === 401 && !skipAuthSideEffects && !isLoggingOut) {
      isLoggingOut = true;

      try {
        localStorage.removeItem('token');

        // Dynamically import to avoid circular dependency
        const { default: useAuthStore } = await import(
          '../store/useAuthStore'
        );

        const authStore = useAuthStore?.getState?.();

        if (authStore && typeof authStore.logout === 'function') {
          // Do not redirect from inside the store.
          await authStore.logout(false);
        }

        // ProtectedRoute observes the cleared auth state and performs the
        // single client-side redirect to the existing /login route.
      } catch (logoutError) {
        console.error('Logout after 401 failed:', logoutError);
      } finally {
        // Prevent multiple simultaneous logout attempts
        setTimeout(() => {
          isLoggingOut = false;
        }, 500);
      }

      error.message =
        error.response?.data?.message || 'Unauthorized';

      return Promise.reject(error);
    }

    // Forbidden
    if (status === 403) {
      error.message =
        error.response?.data?.message || 'Action not permitted';

      return Promise.reject(error);
    }

    // Server unreachable / network error
    if (!error.response) {
      error.message = 'Unable to reach the server. Check your connection and try again.';

      return Promise.reject(error);
    }

    // All other API errors
    error.message =
      error.response?.data?.message ||
      error.message ||
      'Request failed';

    return Promise.reject(error);
  }
);

export default api;
