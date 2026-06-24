import { create } from "zustand";
import api from "../api/axios";

const useFriendsStore = create((set, get) => ({
  friends: [],
  pendingRequests: [],
  searchResults: [],
  activityFeed: [],
  loading: false,

  fetchFriends: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/friends");
      set({ friends: res.data, loading: false });
    } catch (error) {
      console.error("Failed to fetch friends:", error);
      set({ loading: false });
    }
  },

  fetchPendingRequests: async () => {
    try {
      const res = await api.get("/friends/pending");
      set({ pendingRequests: res.data });
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
    }
  },

  searchUsers: async (query) => {
    if (!query) {
      set({ searchResults: [] });
      return;
    }
    try {
      const res = await api.get(`/users/search?query=${query}`);
      set({ searchResults: res.data });
    } catch (error) {
      console.error("Failed to search users:", error);
    }
  },

  sendFriendRequest: async (friendId) => {
    try {
      await api.post("/friends/request", { friendId });
      await get().fetchFriends();
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  },

  acceptFriendRequest: async (friendId) => {
    try {
      await api.post("/friends/accept", { friendId });
      await get().fetchFriends();
      await get().fetchPendingRequests();
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  },

  rejectFriendRequest: async (friendId) => {
    try {
      await api.post("/friends/reject", { friendId });
      await get().fetchPendingRequests();
    } catch (error) {
      console.error("Failed to reject friend request:", error);
    }
  },

  removeFriend: async (friendId) => {
    try {
      await api.delete("/friends/remove", { data: { friendId } });
      await get().fetchFriends();
    } catch (error) {
      console.error("Failed to remove friend:", error);
    }
  },

  fetchActivityFeed: async () => {
    try {
      const res = await api.get("/activity/feed");
      set({ activityFeed: res.data });
    } catch (error) {
      console.error("Failed to fetch activity feed:", error);
    }
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
