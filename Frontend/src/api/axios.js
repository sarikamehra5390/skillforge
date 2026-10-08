import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isLoggingOut = false;

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
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

    // Handle expired/invalid authentication
    if (status === 401 && !isLoggingOut) {
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

        // Redirect only if the user isn't already on an auth page
        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register'
        ) {
          const currentPath =
            window.location.pathname + window.location.search;

          const redirectPath = encodeURIComponent(currentPath);

          window.location.replace(
            `/login?redirect=${redirectPath}`
          );
        }
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
      error.message =
        'Network error - please check your connection';

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