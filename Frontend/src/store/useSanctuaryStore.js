import { create } from "zustand";
import api from "../api/axios";

const useSanctuaryStore = create((set, get) => ({
  settings: null,
  loading: true,
  isModalOpen: false,
  activeTab: "tree",

  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchSettings: async () => {
    try {
      const res = await api.get("/sanctuary");
      set({ settings: res.data, loading: false });
    } catch (err) {
      console.error("Failed to fetch sanctuary settings:", err);
      set({ loading: false });
    }
  },

  updateSettings: async (updates) => {
    try {
      const res = await api.put("/sanctuary", {
        ...get().settings,
        ...updates,
      });
      set({ settings: res.data });
    } catch (err) {
      console.error("Failed to update sanctuary settings:", err);
    }
  },
}));

export default useSanctuaryStore;