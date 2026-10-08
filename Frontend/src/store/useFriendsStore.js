import { create } from "zustand";
import api from "../api/axios";
import { toast } from "sonner";

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

  fetchFriends: async () => {
    const existing = get()._fetchFriendsPromise;
    if (existing) {
      return existing;
    }
    set({ loading: true });
    const promise = (async () => {
      try {
        const res = await api.get("/friends");
        set({ friends: res.data, loading: false, _fetchFriendsPromise: null });
      } catch (error) {
        console.error("Failed to fetch friends:", error);
        set({ loading: false, _fetchFriendsPromise: null });
      }
    })();
    set({ _fetchFriendsPromise: promise });
    return promise;
  },

  fetchPendingRequests: async () => {
    const existing = get()._fetchPendingPromise;
    if (existing) {
      return existing;
    }
    const promise = (async () => {
      try {
        const res = await api.get("/friends/pending");
        set({ incomingRequests: res.data.incoming || [], outgoingRequests: res.data.outgoing || [], _fetchPendingPromise: null });
      } catch (error) {
        console.error("Failed to fetch pending requests:", error);
        set({ _fetchPendingPromise: null });
      }
    })();
    set({ _fetchPendingPromise: promise });
    return promise;
  },

  searchUsers: async (query) => {
    if (!query) {
      set({ searchResults: [] });
      return;
    }
    const existing = get()._searchUsersPromise;
    if (existing) {
      return existing;
    }
    const promise = (async () => {
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        set({ searchResults: res.data, _searchUsersPromise: null });
      } catch (error) {
        console.error("Failed to search users:", error);
        set({ _searchUsersPromise: null });
      }
    })();
    set({ _searchUsersPromise: promise });
    return promise;
  },

  fetchPublicProfile: async (userId) => {
    try {
      const res = await api.get(`/users/${userId}`);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch public profile:", error);
      throw error;
    }
  },

  fetchReactions: async (userId) => {
    try {
      const res = await api.get(`/reactions/${userId}`);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch reactions:", error);
      throw error;
    }
  },

  sendFriendRequest: async (friendId) => {
    try {
      await api.post("/friends/request", { friendId });
      toast.success("Friend request sent!");
      await get().fetchPendingRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send friend request");
      console.error("Failed to send friend request:", error);
    }
  },

  acceptFriendRequest: async (friendId) => {
    try {
      await api.post("/friends/accept", { friendId });
      toast.success("Friend request accepted!");
      await get().fetchFriends();
      await get().fetchPendingRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept friend request");
      console.error("Failed to accept friend request:", error);
    }
  },

  rejectFriendRequest: async (friendId) => {
    try {
      await api.post("/friends/reject", { friendId });
      toast.success("Friend request rejected");
      await get().fetchPendingRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject friend request");
      console.error("Failed to reject friend request:", error);
    }
  },

  cancelFriendRequest: async (friendId) => {
    try {
      await api.delete("/friends/cancel", { data: { friendId } });
      toast.success("Friend request cancelled");
      await get().fetchPendingRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel friend request");
      console.error("Failed to cancel friend request:", error);
    }
  },

  removeFriend: async (friendId) => {
    try {
      await api.delete("/friends/remove", { data: { friendId } });
      toast.success("Friend removed");
      await get().fetchFriends();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove friend");
      console.error("Failed to remove friend:", error);
    }
  },

  fetchActivityFeed: async () => {
    const existing = get()._fetchActivityPromise;
    if (existing) {
      return existing;
    }
    const promise = (async () => {
      try {
        const res = await api.get("/activity/feed");
        set({ activityFeed: res.data, _fetchActivityPromise: null });
      } catch (error) {
        console.error("Failed to fetch activity feed:", error);
        set({ _fetchActivityPromise: null });
      }
    })();
    set({ _fetchActivityPromise: promise });
    return promise;
  },

  sendReaction: async (toUserId, type) => {
    try {
      await api.post("/reactions", { toUserId, type });
    } catch (error) {
      console.error("Failed to send reaction:", error);
    }
  },
}));

export default useFriendsStore;
