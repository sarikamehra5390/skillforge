import { create } from "zustand";
import api from "../api/axios";

const useSanctuaryStore = create((set, get) => {
  let debounceTimer = null;

  return {
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
      // Update local state immediately
      set({
        settings: {
          ...get().settings,
          ...updates,
        },
      });

      // Debounce API call
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          const res = await api.put("/sanctuary", {
            ...get().settings,
          });
          set({ settings: res.data });
        } catch (err) {
          console.error("Failed to update sanctuary settings:", err);
        }
      }, 500);
    },
  };
});

export default useSanctuaryStore;
