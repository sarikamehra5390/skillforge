import { create } from "zustand";
import api from "../api/axios";
import {
  DEFAULT_SANCTUARY_SETTINGS,
  loadSanctuaryFromStorage,
  saveSanctuaryToStorage,
  pickPersistableFields,
} from "../utils/sanctuaryStorage";

const TEXT_FIELDS = [
  "displayName",
  "bio",
  "favoriteSkill",
];

const VALID_TABS = [
  "tree",
  "theme",
  "companion",
  "music",
  "decorations",
  "profile",
];

const initialLocalSettings =
  loadSanctuaryFromStorage();

const useSanctuaryStore = create((set, get) => {
  let debounceTimer = null;
  let persistVersion = 0;

  const mergeSettings = (settings = {}) => ({
    ...DEFAULT_SANCTUARY_SETTINGS,
    ...settings,
  });

  const applySettings = (settings = {}) => {
    const merged = mergeSettings(settings);

    set({
      settings: merged,
      loading: false,
    });

    saveSanctuaryToStorage(merged);

    return merged;
  };

  const persistToServer = async (settingsSnapshot, version) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return {
        success: false,
        skipped: true,
        settings: settingsSnapshot,
      };
    }

    set({
      saving: true,
    });

    try {
      const payload =
        pickPersistableFields(settingsSnapshot);

      const res = await api.put(
        "/sanctuary",
        payload
      );

      /*
       * If a newer update happened while this request
       * was in flight, do not overwrite the newer
       * client state with this older response.
       */
      if (version !== persistVersion) {
        return {
          success: true,
          stale: true,
          settings: get().settings,
        };
      }

      const latestResponse =
        res.data && typeof res.data === "object"
          ? res.data
          : {};

      const currentSettings =
        get().settings || DEFAULT_SANCTUARY_SETTINGS;

      const merged = mergeSettings({
        ...currentSettings,
        ...latestResponse,
      });

      set({
        settings: merged,
        saving: false,
      });

      saveSanctuaryToStorage(merged);

      return {
        success: true,
        settings: merged,
      };
    } catch (error) {
      console.error(
        "Failed to update sanctuary settings:",
        error
      );

      /*
       * Keep the local state. The user's changes should
       * not disappear just because the server request failed.
       */
      set({
        saving: false,
      });

      return {
        success: false,
        error,
        settings: get().settings,
      };
    } finally {
      /*
       * Only clear saving if this is still the latest
       * persistence operation.
       */
      if (version === persistVersion) {
        set({
          saving: false,
        });
      }
    }
  };

  return {
    settings: initialLocalSettings,
    loading: !initialLocalSettings,
    saving: false,

    isModalOpen: false,
    activeTab: "tree",

    // =========================
    // UI State
    // =========================

    setIsModalOpen: (isOpen) =>
      set({
        isModalOpen: Boolean(isOpen),
      }),

    setActiveTab: (tab) => {
      if (!VALID_TABS.includes(tab)) {
        return;
      }

      set({
        activeTab: tab,
      });
    },

    // =========================
    // Local Initialization
    // =========================

    initializeFromLocal: () => {
      const local =
        loadSanctuaryFromStorage();

      if (local) {
        return applySettings(local);
      }

      const defaults = applySettings(
        DEFAULT_SANCTUARY_SETTINGS
      );

      return defaults;
    },

    // =========================
    // Hydrate From Server
    // =========================

    hydrateSettings: (serverSettings = {}) => {
      const local =
        loadSanctuaryFromStorage();

      return applySettings({
        ...local,
        ...serverSettings,
      });
    },

    // =========================
    // Fetch Settings
    // =========================

    fetchSettings: async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        return get().initializeFromLocal();
      }

      set({
        loading: true,
      });

      try {
        const res = await api.get(
          "/sanctuary"
        );

        const serverSettings =
          res.data &&
          typeof res.data === "object"
            ? res.data
            : {};

        const settings =
          get().hydrateSettings(
            serverSettings
          );

        return settings;
      } catch (error) {
        console.error(
          "Failed to fetch sanctuary settings:",
          error
        );

        return get().initializeFromLocal();
      } finally {
        set({
          loading: false,
        });
      }
    },

    // =========================
    // Update Settings
    // =========================

    updateSettings: (updates = {}) => {
      if (
        !updates ||
        typeof updates !== "object"
      ) {
        return get().settings;
      }

      const current =
        get().settings ||
        loadSanctuaryFromStorage() ||
        DEFAULT_SANCTUARY_SETTINGS;

      const newSettings = mergeSettings({
        ...current,
        ...updates,
      });

      set({
        settings: newSettings,
      });

      saveSanctuaryToStorage(
        newSettings
      );

      /*
       * Every update receives a new version.
       * This lets us identify stale API responses.
       */
      persistVersion += 1;

      const currentVersion =
        persistVersion;

      const isTextUpdate =
        Object.keys(updates).some((key) =>
          TEXT_FIELDS.includes(key)
        );

      const delay = isTextUpdate
        ? 500
        : 150;

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        debounceTimer = null;

        const latestSettings =
          get().settings;

        persistToServer(
          latestSettings,
          currentVersion
        );
      }, delay);

      return newSettings;
    },

    // =========================
    // Public Sanctuary
    // =========================

    fetchPublicSanctuary: async (
      userId
    ) => {
      if (!userId) {
        throw new Error(
          "User ID is required."
        );
      }

      try {
        const res = await api.get(
          `/sanctuary/${userId}`
        );

        return res.data;
      } catch (error) {
        console.error(
          "Failed to fetch public sanctuary:",
          error
        );

        throw error;
      }
    },
  };
});

export default useSanctuaryStore;