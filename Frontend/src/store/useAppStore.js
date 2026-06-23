import { create } from 'zustand';
import api from '../api/axios';

const useAppStore = create((set, get) => ({
  notifications: [],
  moods: [],
  dailyMissions: [],
  showCheckInModal: false,
  
  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      set({ notifications: res.data });
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
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
  
  fetchMoodHistory: async () => {
    try {
      const res = await api.get('/moods/history');
      set({ moods: res.data });
    } catch (err) {
      console.error("Failed to fetch mood history:", err);
    }
  },
  
  checkMoodToday: async () => {
    try {
      const res = await api.get('/moods/check');
      return res.data;
    } catch (err) {
      console.error("Failed to check mood today:", err);
      return { hasCheckedInToday: false };
    }
  },
  
  saveMood: async (mood) => {
    try {
      const res = await api.post('/moods', { mood });
      set((state) => ({
        moods: [res.data, ...state.moods],
        showCheckInModal: false
      }));
    } catch (err) {
      console.error("Failed to save mood:", err);
    }
  },
  
  setShowCheckInModal: (val) => set({ showCheckInModal: val })
}));

export default useAppStore;
