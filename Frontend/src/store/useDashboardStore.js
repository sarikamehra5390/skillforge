import { create } from 'zustand';
import api from '../api/axios';

const useDashboardStore = create((set) => ({
  stats: {
    totalSkills: 0,
    totalSessions: 0,
    totalDuration: 0,
    streak: 0,
    level: 1,
    xp: 0
  },
  recentActivity: [],
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const [skillsRes, sessionsRes, userRes] = await Promise.all([
        api.get('/skills'),
        api.get('/sessions'),
        api.get('/users/profile')
      ]);

      const totalDuration = sessionsRes.data.reduce((acc, session) => acc + session.duration, 0);

      set({
        stats: {
          totalSkills: skillsRes.data.length,
          totalSessions: sessionsRes.data.length,
          totalDuration,
          streak: userRes.data.streak,
          level: userRes.data.level,
          xp: userRes.data.xp
        },
        recentActivity: sessionsRes.data.slice(0, 5),
        loading: false
      });
    } catch (error) {
      set({ error: 'Failed to fetch dashboard data', loading: false });
    }
  }
}));

export default useDashboardStore;
