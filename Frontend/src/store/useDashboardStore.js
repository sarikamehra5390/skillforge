import { create } from 'zustand';
import api from '../api/axios';
import useAuthStore from './useAuthStore';

const normalizeArray = (value) =>
  Array.isArray(value) ? value : [];

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.message ||
  fallbackMessage;

const getNumericValue = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const useDashboardStore = create((set, get) => ({
  stats: {
    totalSkills: 0,
    totalSessions: 0,
    totalDuration: 0,
    streak: 0,
    level: 1,
    xp: 0,
  },

  recentActivity: [],
  skills: [],
  sessions: [],

  loading: false,
  error: null,

  _fetchPromise: null,

  // =========================
  // Fetch Dashboard Data
  // =========================

  fetchDashboardData: async () => {
    const existingPromise = get()._fetchPromise;

    if (existingPromise) {
      return existingPromise;
    }

    const authState = useAuthStore.getState();

    if (!authState.user) {
      set({
        loading: false,
      });

      return null;
    }

    set({
      loading: true,
      error: null,
    });

    const promise = (async () => {
      try {
        const [skillsRes, sessionsRes] =
          await Promise.all([
            api.get('/skills'),
            api.get('/sessions'),
          ]);

        const skills = normalizeArray(skillsRes.data);
        const sessions = normalizeArray(sessionsRes.data);

        const totalDuration = sessions.reduce(
          (total, session) => {
            const duration = Number(session?.duration);

            return (
              total +
              (Number.isFinite(duration)
                ? duration
                : 0)
            );
          },
          0
        );

        // Always read the latest auth state after
        // the async requests have completed.
        const currentUser =
          useAuthStore.getState().user;

        const dashboardData = {
          stats: {
            totalSkills: skills.length,
            totalSessions: sessions.length,
            totalDuration,

            streak: getNumericValue(
              currentUser?.streak,
              0
            ),

            level: getNumericValue(
              currentUser?.level,
              1
            ),

            xp: getNumericValue(
              currentUser?.xp,
              0
            ),
          },

          recentActivity: sessions.slice(0, 5),
          skills,
          sessions,
        };

        set({
          ...dashboardData,
          loading: false,
          error: null,
        });

        return dashboardData;
      } catch (error) {
        const message = getErrorMessage(
          error,
          'Failed to fetch dashboard data'
        );

        set({
          error: message,
          loading: false,
        });

        throw error;
      } finally {
        set({
          _fetchPromise: null,
        });
      }
    })();

    set({
      _fetchPromise: promise,
    });

    return promise;
  },

  // =========================
  // Create Session
  // =========================

  createSession: async (sessionData) => {
    set({
      error: null,
    });

    try {
      const response = await api.post(
        '/sessions',
        sessionData
      );

      const data = response.data || {};

      /*
       * Prefer server-provided user totals.
       * Do not calculate XP locally when the backend
       * already provides the authoritative value.
       */
      const currentUser =
        useAuthStore.getState().user;

      const authUpdates = {};

      if (data.xp !== undefined) {
        authUpdates.xp = getNumericValue(
          data.xp,
          currentUser?.xp ?? 0
        );
      } else if (data.totalXp !== undefined) {
        authUpdates.xp = getNumericValue(
          data.totalXp,
          currentUser?.xp ?? 0
        );
      }

      if (data.level !== undefined) {
        authUpdates.level = getNumericValue(
          data.level,
          currentUser?.level ?? 1
        );
      } else if (data.newLevel !== undefined) {
        authUpdates.level = getNumericValue(
          data.newLevel,
          currentUser?.level ?? 1
        );
      }

      if (data.streak !== undefined) {
        authUpdates.streak = getNumericValue(
          data.streak,
          currentUser?.streak ?? 0
        );
      } else if (data.newStreak !== undefined) {
        authUpdates.streak = getNumericValue(
          data.newStreak,
          currentUser?.streak ?? 0
        );
      }

      if (
        currentUser &&
        Object.keys(authUpdates).length > 0
      ) {
        useAuthStore
          .getState()
          .updateUser(authUpdates);
      }

      await get().fetchDashboardData();

      return data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to create session'
      );

      set({
        error: message,
      });

      throw error;
    }
  },

  // =========================
  // Update Session
  // =========================

  updateSession: async (id, sessionData) => {
    if (!id) {
      throw new Error('Session ID is required.');
    }

    set({
      error: null,
    });

    try {
      const response = await api.put(
        `/sessions/${id}`,
        sessionData
      );

      const data = response.data || {};

      const currentUser =
        useAuthStore.getState().user;

      const authUpdates = {};

      if (data.xp !== undefined) {
        authUpdates.xp = getNumericValue(
          data.xp,
          currentUser?.xp ?? 0
        );
      }

      if (data.level !== undefined) {
        authUpdates.level = getNumericValue(
          data.level,
          currentUser?.level ?? 1
        );
      }

      if (
        currentUser &&
        Object.keys(authUpdates).length > 0
      ) {
        useAuthStore
          .getState()
          .updateUser(authUpdates);
      }

      await get().fetchDashboardData();

      return data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to update session'
      );

      set({
        error: message,
      });

      throw error;
    }
  },

  // =========================
  // Delete Session
  // =========================

  deleteSession: async (id) => {
    if (!id) {
      throw new Error('Session ID is required.');
    }

    set({
      error: null,
    });

    try {
      const response = await api.delete(
        `/sessions/${id}`
      );

      const data = response.data || {};

      const currentUser =
        useAuthStore.getState().user;

      const authUpdates = {};

      /*
       * Prefer the authoritative values returned
       * by the backend.
       */
      if (data.xp !== undefined) {
        authUpdates.xp = getNumericValue(
          data.xp,
          currentUser?.xp ?? 0
        );
      }

      if (data.level !== undefined) {
        authUpdates.level = getNumericValue(
          data.level,
          currentUser?.level ?? 1
        );
      }

      if (
        currentUser &&
        Object.keys(authUpdates).length > 0
      ) {
        useAuthStore
          .getState()
          .updateUser(authUpdates);
      }

      await get().fetchDashboardData();

      return data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to delete session'
      );

      set({
        error: message,
      });

      throw error;
    }
  },

  // =========================
  // Create Skill
  // =========================

  createSkill: async (skillData) => {
    set({
      error: null,
    });

    try {
      const response = await api.post(
        '/skills',
        skillData
      );

      await get().fetchDashboardData();

      return response.data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to create skill'
      );

      set({
        error: message,
      });

      throw error;
    }
  },

  // =========================
  // Update Skill
  // =========================

  updateSkill: async (id, skillData) => {
    if (!id) {
      throw new Error('Skill ID is required.');
    }

    set({
      error: null,
    });

    try {
      const response = await api.put(
        `/skills/${id}`,
        skillData
      );

      await get().fetchDashboardData();

      return response.data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to update skill'
      );

      set({
        error: message,
      });

      throw error;
    }
  },

  // =========================
  // Delete Skill
  // =========================

  deleteSkill: async (id) => {
    if (!id) {
      throw new Error('Skill ID is required.');
    }

    set({
      error: null,
    });

    try {
      const response = await api.delete(
        `/skills/${id}`
      );

      await get().fetchDashboardData();

      return response.data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to delete skill'
      );

      set({
        error: message,
      });

      throw error;
    }
  },
}));

export default useDashboardStore;