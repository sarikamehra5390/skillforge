import { create } from 'zustand';
import api from '../api/axios';

const useAppStore = create((set, get) => ({
  notifications: [],
  moods: [],
  dailyMissions: [],

  showCheckInModal: false,

  // Prevent duplicate simultaneous requests
  _checkMoodPromise: null,
  _fetchNotificationsPromise: null,
  _fetchMoodHistoryPromise: null,

  // =========================
  // Notifications
  // =========================

  fetchNotifications: async () => {
    const existingPromise = get()._fetchNotificationsPromise;

    if (existingPromise) {
      return existingPromise;
    }

    const promise = (async () => {
      try {
        const res = await api.get('/notifications');

        const notifications = Array.isArray(res.data)
          ? res.data
          : [];

        set({
          notifications,
        });

        return notifications;
      } catch (err) {
        console.error('Failed to fetch notifications:', err);

        return [];
      } finally {
        set({
          _fetchNotificationsPromise: null,
        });
      }
    })();

    set({
      _fetchNotificationsPromise: promise,
    });

    return promise;
  },

  markNotificationRead: async (id) => {
    if (!id) {
      return { success: false };
    }

    const notification = get().notifications.find(
      (item) => item._id === id
    );

    // Already read — no need to make another request
    if (notification?.read) {
      return { success: true };
    }

    try {
      await api.put(`/notifications/${id}/read`);

      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        ),
      }));

      return { success: true };
    } catch (err) {
      console.error('Failed to mark notification as read:', err);

      return {
        success: false,
        error: err,
      };
    }
  },

  markAllRead: async () => {
    try {
      await api.put('/notifications/mark-all-read');

      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
      }));

      return { success: true };
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);

      return {
        success: false,
        error: err,
      };
    }
  },

  deleteNotification: async (id) => {
    if (!id) {
      return { success: false };
    }

    try {
      await api.delete(`/notifications/${id}`);

      set((state) => ({
        notifications: state.notifications.filter(
          (notification) => notification._id !== id
        ),
      }));

      return { success: true };
    } catch (err) {
      console.error('Failed to delete notification:', err);

      return {
        success: false,
        error: err,
      };
    }
  },

  // =========================
  // Mood History
  // =========================

  fetchMoodHistory: async () => {
    const existingPromise = get()._fetchMoodHistoryPromise;

    if (existingPromise) {
      return existingPromise;
    }

    const promise = (async () => {
      try {
        const res = await api.get('/moods/history');

        const moods = Array.isArray(res.data)
          ? res.data
          : [];

        set({
          moods,
        });

        return moods;
      } catch (err) {
        console.error('Failed to fetch mood history:', err);

        return [];
      } finally {
        set({
          _fetchMoodHistoryPromise: null,
        });
      }
    })();

    set({
      _fetchMoodHistoryPromise: promise,
    });

    return promise;
  },

  // =========================
  // Check-in
  // =========================

  checkMoodToday: async () => {
    const existingPromise = get()._checkMoodPromise;

    if (existingPromise) {
      return existingPromise;
    }

    const promise = (async () => {
      try {
        const res = await api.get('/moods/check');

        return {
          hasCheckedInToday:
            Boolean(res.data?.hasCheckedInToday),
        };
      } catch (err) {
        console.error('Failed to check mood today:', err);

        return {
          hasCheckedInToday: false,
          error: err,
        };
      } finally {
        set({
          _checkMoodPromise: null,
        });
      }
    })();

    set({
      _checkMoodPromise: promise,
    });

    return promise;
  },

  // =========================
  // Save Mood
  // =========================

  saveMood: async (mood) => {
    const normalizedMood =
      typeof mood === 'string'
        ? mood.trim()
        : '';

    if (!normalizedMood) {
      return {
        success: false,
        error: new Error('Mood is required.'),
      };
    }

    try {
      const res = await api.post('/moods', {
        mood: normalizedMood,
      });

      const savedMood = res.data;

      set((state) => ({
        moods: savedMood
          ? [savedMood, ...state.moods]
          : state.moods,

        showCheckInModal: false,

        _checkMoodPromise: null,
      }));

      return {
        success: true,
        data: savedMood,
      };
    } catch (err) {
      console.error('Failed to save mood:', err);

      return {
        success: false,
        error: err,
      };
    }
  },

  // =========================
  // UI
  // =========================

  setShowCheckInModal: (value) => {
    set({
      showCheckInModal: Boolean(value),
    });
  },
}));

export default useAppStore;