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
      set({ incomingRequests: res.data.incoming || [], outgoingRequests: res.data.outgoing || [] });
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
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      set({ searchResults: res.data });
    } catch (error) {
      console.error("Failed to search users:", error);
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
