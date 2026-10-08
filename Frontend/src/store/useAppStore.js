import { create } from 'zustand';
import api from '../api/axios';

const useAppStore = create((set, get) => ({
  notifications: [],
  moods: [],
  dailyMissions: [],
  showCheckInModal: false,
  _checkMoodPromise: null,
  _fetchNotificationsPromise: null,
  _fetchMoodHistoryPromise: null,

  fetchNotifications: async () => {
    if (get()._fetchNotificationsPromise) {
      return get()._fetchNotificationsPromise;
    }
    const promise = (async () => {
      try {
        const res = await api.get('/notifications');
        set({ notifications: res.data, _fetchNotificationsPromise: null });
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        set({ _fetchNotificationsPromise: null });
      }
    })();
    set({ _fetchNotificationsPromise: promise });
    return promise;
  },

  markNotificationRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map(n =>
          n._id === id ? { ...n, read: true } : n
        )
      }));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  },

  markAllRead: async () => {
    try {
      await api.put('/notifications/mark-all-read');
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      }));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      set((state) => ({
        notifications: state.notifications.filter(n => n._id !== id)
      }));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  },

  fetchMoodHistory: async () => {
    if (get()._fetchMoodHistoryPromise) {
      return get()._fetchMoodHistoryPromise;
    }
    const promise = (async () => {
      try {
        const res = await api.get('/moods/history');
        set({ moods: res.data, _fetchMoodHistoryPromise: null });
      } catch (err) {
        console.error("Failed to fetch mood history:", err);
        set({ _fetchMoodHistoryPromise: null });
      }
    })();
    set({ _fetchMoodHistoryPromise: promise });
    return promise;
  },

  checkMoodToday: async () => {
    const existing = get()._checkMoodPromise;
    if (existing) {
      return existing;
    }
    const promise = (async () => {
      try {
        const res = await api.get('/moods/check');
        set({ _checkMoodPromise: null });
        return res.data;
      } catch (err) {
        console.error("Failed to check mood today:", err);
        set({ _checkMoodPromise: null });
        return { hasCheckedInToday: false };
      }
    })();
    set({ _checkMoodPromise: promise });
    return promise;
  },

  saveMood: async (mood) => {
    try {
      const res = await api.post('/moods', { mood });
      set((state) => ({
        moods: [res.data, ...state.moods],
        showCheckInModal: false,
        _checkMoodPromise: null
      }));
    } catch (err) {
      console.error("Failed to save mood:", err);
    }
  },

  setShowCheckInModal: (val) => set({ showCheckInModal: val })
}));

export default useAppStore;
