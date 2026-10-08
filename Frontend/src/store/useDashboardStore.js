import { create } from 'zustand';
import api from '../api/axios';
import useAuthStore from './useAuthStore';

const useDashboardStore = create((set, get) => ({
  stats: {
    totalSkills: 0,
    totalSessions: 0,
    totalDuration: 0,
    streak: 0,
    level: 1,
    xp: 0
  },
  recentActivity: [],
  skills: [],
  sessions: [],
  loading: false,
  error: null,
  _fetchPromise: null,

  fetchDashboardData: async () => {
    if (get()._fetchPromise) {
      return get()._fetchPromise;
    }
    const authState = useAuthStore.getState();
    if (!authState.user) {
      return;
    }
    set({ loading: true, error: null });
    const promise = (async () => {
      try {
        const [skillsRes, sessionsRes] = await Promise.all([
          api.get('/skills'),
          api.get('/sessions'),
        ]);

        const authUser = authState.user;

        const totalDuration = sessionsRes.data.reduce((acc, session) => acc + (typeof session.duration === 'number' ? session.duration : 0), 0);

        set({
          stats: {
            totalSkills: skillsRes.data.length,
            totalSessions: sessionsRes.data.length,
            totalDuration,
            streak: authUser?.streak ?? 0,
            level: authUser?.level ?? 1,
            xp: authUser?.xp ?? 0
          },
          recentActivity: sessionsRes.data.slice(0, 5),
          skills: skillsRes.data,
          sessions: sessionsRes.data,
          loading: false,
          _fetchPromise: null,
        });
      } catch (error) {
        set({ error: error.message || 'Failed to fetch dashboard data', loading: false, _fetchPromise: null });
      }
    })();
    set({ _fetchPromise: promise });
    return promise;
  },

  createSession: async (sessionData) => {
    try {
      const response = await api.post('/sessions', sessionData);
      const authState = useAuthStore.getState();
      const { xp, level, streak, totalXp, xpDelta, levelDelta, streakDelta, newLevel, newStreak, xpGained, session } = response.data || {};
      const authUpdates = {};
      const currentUser = authState.user;
      if (xp !== undefined) authUpdates.xp = xp;
      if (level !== undefined) authUpdates.level = level;
      if (streak !== undefined) authUpdates.streak = streak;
      if (totalXp !== undefined) authUpdates.xp = totalXp;
      if (newLevel !== undefined) authUpdates.level = newLevel;
      if (newStreak !== undefined) authUpdates.streak = newStreak;
      if (currentUser) {
        const directXpGain = session?.xpGained || xpGained;
        if (directXpGain !== undefined) authUpdates.xp = (currentUser.xp || 0) + directXpGain;
        if (xpDelta !== undefined) authUpdates.xp = (currentUser.xp || 0) + xpDelta;
        if (levelDelta !== undefined) authUpdates.level = (currentUser.level || 1) + levelDelta;
        if (streakDelta !== undefined) authUpdates.streak = (currentUser.streak || 0) + streakDelta;
      }
      if (Object.keys(authUpdates).length > 0) {
        authState.updateUser(authUpdates);
      }
      await get().fetchDashboardData();
      return response.data;
    } catch (error) {
      set({ error: error.message || 'Failed to create session' });
      throw error;
    }
  },

  updateSession: async (id, sessionData) => {
    try {
      const res = await api.put(`/sessions/${id}`, sessionData);
      const { xpDelta, levelDelta, xp, level } = res.data || {};
      const currentUser = useAuthStore.getState().user;
      const authUpdates = {};
      if (xp !== undefined) authUpdates.xp = xp;
      if (level !== undefined) authUpdates.level = level;
      if (currentUser && (xpDelta !== undefined || levelDelta !== undefined)) {
        if (xpDelta !== undefined) authUpdates.xp = (currentUser.xp || 0) + xpDelta;
        if (levelDelta !== undefined) authUpdates.level = (currentUser.level || 1) + levelDelta;
      }
      if (Object.keys(authUpdates).length > 0) {
        useAuthStore.getState().updateUser(authUpdates);
      }
      await get().fetchDashboardData();
      return res.data;
    } catch (error) {
      set({ error: error.message || 'Failed to update session' });
      throw error;
    }
  },

  deleteSession: async (id) => {
    try {
      const res = await api.delete(`/sessions/${id}`);
      const { xpDeducted, oldXp, xp, level } = res.data || {};
      const currentUser = useAuthStore.getState().user;
      const authUpdates = {};
      if (xp !== undefined) authUpdates.xp = xp;
      if (level !== undefined) authUpdates.level = level;
      if (currentUser && (xpDeducted !== undefined || oldXp !== undefined)) {
        const deduct = xpDeducted !== undefined ? xpDeducted : (oldXp !== undefined ? (currentUser.xp || 0) - oldXp : 0);
        authUpdates.xp = Math.max(0, (currentUser.xp || 0) - deduct);
      }
      if (Object.keys(authUpdates).length > 0) {
        useAuthStore.getState().updateUser(authUpdates);
      }
      await get().fetchDashboardData();
      return true;
    } catch (error) {
      set({ error: error.message || 'Failed to delete session' });
      throw error;
    }
  },

  createSkill: async (skillData) => {
    try {
      const res = await api.post('/skills', skillData);
      await get().fetchDashboardData();
      return res.data;
    } catch (error) {
      set({ error: error.message || 'Failed to create skill' });
      throw error;
    }
  },

  updateSkill: async (id, skillData) => {
    try {
      const res = await api.put(`/skills/${id}`, skillData);
      await get().fetchDashboardData();
      return res.data;
    } catch (error) {
      set({ error: error.message || 'Failed to update skill' });
      throw error;
    }
  },

  deleteSkill: async (id) => {
    try {
      const res = await api.delete(`/skills/${id}`);
      await get().fetchDashboardData();
      return res.data;
    } catch (error) {
      set({ error: error.message || 'Failed to delete skill' });
      throw error;
    }
  },
}));

export default useDashboardStore;
