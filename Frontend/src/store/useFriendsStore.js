import { create } from 'zustand';
import api from '../api/axios';
import { toast } from 'sonner';

const normalizeArray = (value) =>
  Array.isArray(value) ? value : [];

const getErrorMessage = (
  error,
  fallbackMessage
) =>
  error?.response?.data?.message ||
  error?.message ||
  fallbackMessage;

const useFriendsStore = create((set, get) => ({
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  searchResults: [],
  activityFeed: [],

  loading: false,

  _fetchFriendsPromise: null,
  _fetchPendingPromise: null,
  _fetchActivityPromise: null,
  _searchUsersPromise: null,
  _searchQuery: '',

  // =========================
  // Friends
  // =========================

  fetchFriends: async () => {
    const existing =
      get()._fetchFriendsPromise;

    if (existing) {
      return existing;
    }

    set({
      loading: true,
    });

    const promise = (async () => {
      try {
        const res = await api.get('/friends');

        const friends = normalizeArray(
          res.data
        );

        set({
          friends,
          loading: false,
        });

        return friends;
      } catch (error) {
        console.error(
          'Failed to fetch friends:',
          error
        );

        set({
          loading: false,
        });

        return [];
      } finally {
        set({
          _fetchFriendsPromise: null,
        });
      }
    })();

    set({
      _fetchFriendsPromise: promise,
    });

    return promise;
  },

  // =========================
  // Pending Requests
  // =========================

  fetchPendingRequests: async () => {
    const existing =
      get()._fetchPendingPromise;

    if (existing) {
      return existing;
    }

    const promise = (async () => {
      try {
        const res = await api.get(
          '/friends/pending'
        );

        const incomingRequests =
          normalizeArray(
            res.data?.incoming
          );

        const outgoingRequests =
          normalizeArray(
            res.data?.outgoing
          );

        set({
          incomingRequests,
          outgoingRequests,
        });

        return {
          incoming: incomingRequests,
          outgoing: outgoingRequests,
        };
      } catch (error) {
        console.error(
          'Failed to fetch pending requests:',
          error
        );

        return {
          incoming: [],
          outgoing: [],
        };
      } finally {
        set({
          _fetchPendingPromise: null,
        });
      }
    })();

    set({
      _fetchPendingPromise: promise,
    });

    return promise;
  },

  // =========================
  // User Search
  // =========================

  searchUsers: async (query) => {
    const normalizedQuery =
      typeof query === 'string'
        ? query.trim()
        : '';

    if (!normalizedQuery) {
      set({
        searchResults: [],
        _searchQuery: '',
      });

      return [];
    }

    /*
     * If the exact same query is already being
     * requested, reuse that request.
     */
    if (
      get()._searchUsersPromise &&
      get()._searchQuery === normalizedQuery
    ) {
      return get()._searchUsersPromise;
    }

    /*
     * Store the query associated with the active
     * request. This prevents "sar" and "sarika"
     * from incorrectly sharing the same promise.
     */
    set({
      _searchQuery: normalizedQuery,
    });

    const promise = (async () => {
      try {
        const res = await api.get(
          `/users/search?q=${encodeURIComponent(
            normalizedQuery
          )}`
        );

        const results = normalizeArray(
          res.data
        );

        /*
         * Only update results if this request is
         * still the latest search query.
         */
        if (
          get()._searchQuery === normalizedQuery
        ) {
          set({
            searchResults: results,
          });
        }

        return results;
      } catch (error) {
        console.error(
          'Failed to search users:',
          error
        );

        if (
          get()._searchQuery === normalizedQuery
        ) {
          set({
            searchResults: [],
          });
        }

        return [];
      } finally {
        if (
          get()._searchQuery === normalizedQuery
        ) {
          set({
            _searchUsersPromise: null,
          });
        }
      }
    })();

    set({
      _searchUsersPromise: promise,
    });

    return promise;
  },

  // =========================
  // Public Profile
  // =========================

  fetchPublicProfile: async (userId) => {
    if (!userId) {
      throw new Error(
        'User ID is required.'
      );
    }

    try {
      const res = await api.get(
        `/users/${userId}`
      );

      return res.data;
    } catch (error) {
      console.error(
        'Failed to fetch public profile:',
        error
      );

      throw error;
    }
  },

  // =========================
  // Reactions
  // =========================

  fetchReactions: async (userId) => {
    if (!userId) {
      throw new Error(
        'User ID is required.'
      );
    }

    try {
      const res = await api.get(
        `/reactions/${userId}`
      );

      return res.data;
    } catch (error) {
      console.error(
        'Failed to fetch reactions:',
        error
      );

      throw error;
    }
  },

  // =========================
  // Send Friend Request
  // =========================

  sendFriendRequest: async (friendId) => {
    if (!friendId) {
      return {
        success: false,
        error: new Error(
          'Friend ID is required.'
        ),
      };
    }

    try {
      await api.post(
        '/friends/request',
        { friendId }
      );

      toast.success(
        'Friend request sent!'
      );

      await get().fetchPendingRequests();

      return {
        success: true,
      };
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to send friend request'
      );

      toast.error(message);

      console.error(
        'Failed to send friend request:',
        error
      );

      return {
        success: false,
        error,
      };
    }
  },

  // =========================
  // Accept Friend Request
  // =========================

  acceptFriendRequest: async (friendId) => {
    if (!friendId) {
      return {
        success: false,
        error: new Error(
          'Friend ID is required.'
        ),
      };
    }

    try {
      await api.post(
        '/friends/accept',
        { friendId }
      );

      toast.success(
        'Friend request accepted!'
      );

      await Promise.all([
        get().fetchFriends(),
        get().fetchPendingRequests(),
      ]);

      return {
        success: true,
      };
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to accept friend request'
      );

      toast.error(message);

      console.error(
        'Failed to accept friend request:',
        error
      );

      return {
        success: false,
        error,
      };
    }
  },

  // =========================
  // Reject Friend Request
  // =========================

  rejectFriendRequest: async (friendId) => {
    if (!friendId) {
      return {
        success: false,
        error: new Error(
          'Friend ID is required.'
        ),
      };
    }

    try {
      await api.post(
        '/friends/reject',
        { friendId }
      );

      toast.success(
        'Friend request rejected'
      );

      await get().fetchPendingRequests();

      return {
        success: true,
      };
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to reject friend request'
      );

      toast.error(message);

      console.error(
        'Failed to reject friend request:',
        error
      );

      return {
        success: false,
        error,
      };
    }
  },

  // =========================
  // Cancel Friend Request
  // =========================

  cancelFriendRequest: async (friendId) => {
    if (!friendId) {
      return {
        success: false,
        error: new Error(
          'Friend ID is required.'
        ),
      };
    }

    try {
      await api.delete(
        '/friends/cancel',
        {
          data: { friendId },
        }
      );

      toast.success(
        'Friend request cancelled'
      );

      await get().fetchPendingRequests();

      return {
        success: true,
      };
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to cancel friend request'
      );

      toast.error(message);

      console.error(
        'Failed to cancel friend request:',
        error
      );

      return {
        success: false,
        error,
      };
    }
  },

  // =========================
  // Remove Friend
  // =========================

  removeFriend: async (friendId) => {
    if (!friendId) {
      return {
        success: false,
        error: new Error(
          'Friend ID is required.'
        ),
      };
    }

    try {
      await api.delete(
        '/friends/remove',
        {
          data: { friendId },
        }
      );

      toast.success(
        'Friend removed'
      );

      await get().fetchFriends();

      return {
        success: true,
      };
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to remove friend'
      );

      toast.error(message);

      console.error(
        'Failed to remove friend:',
        error
      );

      return {
        success: false,
        error,
      };
    }
  },

  // =========================
  // Activity Feed
  // =========================

  fetchActivityFeed: async () => {
    const existing =
      get()._fetchActivityPromise;

    if (existing) {
      return existing;
    }

    const promise = (async () => {
      try {
        const res = await api.get(
          '/activity/feed'
        );

        const activityFeed =
          normalizeArray(res.data);

        set({
          activityFeed,
        });

        return activityFeed;
      } catch (error) {
        console.error(
          'Failed to fetch activity feed:',
          error
        );

        return [];
      } finally {
        set({
          _fetchActivityPromise: null,
        });
      }
    })();

    set({
      _fetchActivityPromise: promise,
    });

    return promise;
  },

  // =========================
  // Send Reaction
  // =========================

  sendReaction: async (
    toUserId,
    type
  ) => {
    if (!toUserId || !type) {
      return {
        success: false,
        error: new Error(
          'User ID and reaction type are required.'
        ),
      };
    }

    try {
      const response = await api.post(
        '/reactions',
        {
          toUserId,
          type,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to send reaction'
      );

      console.error(
        'Failed to send reaction:',
        error
      );

      return {
        success: false,
        error,
        message,
      };
    }
  },
}));

export default useFriendsStore;