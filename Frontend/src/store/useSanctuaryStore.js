import { create } from "zustand";
import api from "../api/axios";
import {
  DEFAULT_SANCTUARY_SETTINGS,
  loadSanctuaryFromStorage,
  saveSanctuaryToStorage,
  pickPersistableFields,
} from "../utils/sanctuaryStorage";

const syncAuthSanctuarySettings = async (settings) => {
  const { default: useAuthStore } = await import("./useAuthStore");
  useAuthStore.getState().updateUser({ sanctuarySettings: settings });
};

const TEXT_FIELDS = ["displayName", "bio", "favoriteSkill"];

const initialLocalSettings = loadSanctuaryFromStorage();

const useSanctuaryStore = create((set, get) => {
  let debounceTimer = null;

  const applySettings = (settings) => {
    const merged = { ...DEFAULT_SANCTUARY_SETTINGS, ...settings };
    set({ settings: merged, loading: false });
    saveSanctuaryToStorage(merged);
    return merged;
  };

  const persistToServer = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await api.put("/sanctuary", pickPersistableFields(get().settings));
      set({ settings: res.data });
      saveSanctuaryToStorage(res.data);
      syncAuthSanctuarySettings(res.data);
    } catch (err) {
      console.error("Failed to update sanctuary settings:", err);
    }
  };

  return {
    settings: initialLocalSettings,
    loading: !initialLocalSettings,
    isModalOpen: false,
    activeTab: "tree",

    setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
    setActiveTab: (tab) => set({ activeTab: tab }),

    initializeFromLocal: () => {
      const local = loadSanctuaryFromStorage();
      if (local) {
        applySettings(local);
      } else {
        set({ loading: false });
      }
    },

    hydrateSettings: (serverSettings) => {
      const local = loadSanctuaryFromStorage();
      return applySettings({ ...local, ...serverSettings });
    },

    fetchSettings: async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        get().initializeFromLocal();
        return;
      }

      try {
        const res = await api.get("/sanctuary");
        get().hydrateSettings(res.data);
        syncAuthSanctuarySettings(res.data);
      } catch (err) {
        console.error("Failed to fetch sanctuary settings:", err);
        get().initializeFromLocal();
      }
    },

    updateSettings: (updates) => {
      const current = get().settings || loadSanctuaryFromStorage() || DEFAULT_SANCTUARY_SETTINGS;
      const newSettings = { ...current, ...updates };

      set({ settings: newSettings });
      saveSanctuaryToStorage(newSettings);

      const isTextUpdate = Object.keys(updates).some((key) => TEXT_FIELDS.includes(key));
      const delay = isTextUpdate ? 500 : 0;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(persistToServer, delay);
    },
  };
});

export default useSanctuaryStore;
