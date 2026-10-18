import { create } from 'zustand';
import api from '../api/axios';
import { toast } from 'sonner';

const normalizeArray = (value) =>
  Array.isArray(value) ? value : [];

const dedupeUsers = (value) => {
  const seen = new Set();
  return normalizeArray(value).filter((person) => {
    const id = person?._id;
    if (id == null) return true;
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

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
  searchLoading: false,
  searchError: null,
  activityFeed: [],

  loading: false,

  _fetchFriendsPromise: null,
  _fetchPendingPromise: null,
  _friendsRequestId: 0,
  _pendingRequestId: 0,
  _fetchActivityPromise: null,
  _searchUsersPromise: null,
  _searchQuery: '',
  _searchRequestId: 0,

  // =========================
  // Friends
  // =========================

  fetchFriends: async () => {
    const existing =
      get()._fetchFriendsPromise;

    if (existing) {
      return existing;
    }

    const requestId = get()._friendsRequestId + 1;
    set({
      loading: true,
      _friendsRequestId: requestId,
    });

    const promise = (async () => {
      try {
        const res = await api.get('/friends');

        const friends = dedupeUsers(res.data);

        if (get()._friendsRequestId === requestId) {
          set({ friends, loading: false });
        }

        return friends;
      } catch (error) {
        console.error(
          'Failed to fetch friends:',
          error
        );

        if (get()._friendsRequestId === requestId) set({ loading: false });

        return [];
      } finally {
        if (get()._friendsRequestId === requestId) set({ _fetchFriendsPromise: null });
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

    const requestId = get()._pendingRequestId + 1;
    set({ _pendingRequestId: requestId });
    const promise = (async () => {
      try {
        const res = await api.get(
          '/friends/pending'
        );

        const incomingRequests = dedupeUsers(res.data?.incoming);

        const outgoingRequests = dedupeUsers(res.data?.outgoing);

        if (get()._pendingRequestId === requestId) {
          set({ incomingRequests, outgoingRequests });
        }

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
        if (get()._pendingRequestId === requestId) set({ _fetchPendingPromise: null });
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
        searchLoading: false,
        searchError: null,
        _searchQuery: '',
        _searchRequestId: get()._searchRequestId + 1,
      });

      return [];
    }

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
    const requestId = get()._searchRequestId + 1;
    set({
      _searchQuery: normalizedQuery,
      _searchRequestId: requestId,
      searchLoading: true,
      searchError: null,
      searchResults: [],
    });

    const promise = (async () => {
      try {
        const res = await api.get(
          `/users/search?q=${encodeURIComponent(
            normalizedQuery
          )}`
        );

        const results = dedupeUsers(res.data);

        /*
         * Only update results if this request is
         * still the latest search query.
         */
        if (get()._searchRequestId === requestId) {
          set({
            searchResults: results,
            searchLoading: false,
            searchError: null,
          });
        }

        return results;
      } catch (error) {
        console.error(
          'Failed to search users:',
          error
        );

        if (get()._searchRequestId === requestId) {
          set({
            searchResults: [],
            searchLoading: false,
            searchError: getErrorMessage(error, 'Search failed. Please try again.'),
          });
        }

        return { error };
      } finally {
        if (get()._searchRequestId === requestId) {
          set({
            _searchUsersPromise: null,
            searchLoading: false,
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

      const target = get().searchResults.find(
        (person) => String(person?._id) === String(friendId)
      );
      if (target) {
        set((state) => ({
          outgoingRequests: dedupeUsers([...state.outgoingRequests, target]),
        }));
      }

      toast.success(
        'Friend request sent!'
      );

      set({ _fetchPendingPromise: null });
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

      const target = get().incomingRequests.find(
        (person) => String(person?._id) === String(friendId)
      );
      set((state) => ({
        incomingRequests: state.incomingRequests.filter(
          (person) => String(person?._id) !== String(friendId)
        ),
        friends: target ? dedupeUsers([...state.friends, target]) : state.friends,
      }));

      toast.success(
        'Friend request accepted!'
      );

      await Promise.all([
        (set({ _fetchFriendsPromise: null }), get().fetchFriends()),
        (set({ _fetchPendingPromise: null }), get().fetchPendingRequests()),
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
