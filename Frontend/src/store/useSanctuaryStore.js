import { create } from "zustand";
import { toast } from "sonner";
import api from "../api/axios.js";
import {
  DEFAULT_SANCTUARY_SETTINGS,
  loadSanctuaryFromStorage,
  saveSanctuaryToStorage,
  pickPersistableFields,
  hasPendingSanctuaryChanges,
  markSanctuaryChangesPending,
  clearPendingSanctuaryChanges,
} from "../utils/sanctuaryStorage.js";

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
  "presets",
  "profile",
];

const initialLocalSettings =
  loadSanctuaryFromStorage();

const useSanctuaryStore = create((set, get) => {
  let debounceTimer = null;
  let persistVersion = 0;
  let persistedVersion = 0;
  let persistenceQueue = Promise.resolve({ success: true });
  let settingsFetchId = 0;

  const mergeSettings = (settings = {}) => ({
    ...DEFAULT_SANCTUARY_SETTINGS,
    ...settings,
    audioLayers: Array.isArray(settings.audioLayers)
      ? settings.audioLayers
      : settings.audioTrack && settings.audioTrack !== "none"
        ? [{ soundId: settings.audioTrack, volume: 1, muted: false }]
        : [],
    masterVolume: Number.isFinite(settings.masterVolume) ? settings.masterVolume : (Number.isFinite(settings.audioVolume) ? settings.audioVolume : DEFAULT_SANCTUARY_SETTINGS.masterVolume),
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

      if (token !== localStorage.getItem("token")) {
        return { success: true, stale: true, settings: get().settings };
      }

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

      persistedVersion = version;
      clearPendingSanctuaryChanges();

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
      toast.error("Your sanctuary changes could not be saved. They are kept on this device and will retry after you sign in again.");

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

  const enqueuePersistence = (settingsSnapshot, version) => {
    const request = persistenceQueue.then(() => {
      if (version !== persistVersion) {
        return { success: true, stale: true, settings: get().settings };
      }
      return persistToServer(settingsSnapshot, version);
    });
    persistenceQueue = request.catch((error) => ({ success: false, error }));
    return request;
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

    flushSettings: async () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }

      const token = localStorage.getItem("token");
      const settings = get().settings;
      if (!token || !settings || persistedVersion === persistVersion) {
        const previousResult = await persistenceQueue;
        return previousResult?.success === false
          ? { ...previousResult, settings }
          : { success: Boolean(token), skipped: !token, settings };
      }

      return enqueuePersistence(settings, persistVersion);
    },

    cancelPendingPersistence: () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      settingsFetchId += 1;
      set({ loading: false, saving: false });
    },

    // =========================
    // Hydrate From Server
    // =========================

    hydrateSettings: (serverSettings = {}) => {
      const local =
        loadSanctuaryFromStorage();
      const hasPendingChanges = hasPendingSanctuaryChanges();
      const hydrated = applySettings(hasPendingChanges
        ? { ...serverSettings, ...local }
        : { ...local, ...serverSettings });

      if (hasPendingChanges && localStorage.getItem("token")) {
        enqueuePersistence(hydrated, persistVersion);
      }

      return hydrated;
    },

    // =========================
    // Fetch Settings
    // =========================

    fetchSettings: async () => {
      const fetchId = ++settingsFetchId;
      const token =
        localStorage.getItem("token");

      if (!token) {
        return get().settings || get().initializeFromLocal();
      }

      set({
        loading: true,
      });
      const requestVersion = persistVersion;

      try {
        const res = await api.get(
          "/sanctuary"
        );

        const serverSettings =
          res.data &&
          typeof res.data === "object"
            ? res.data
            : {};

        // A response from an older request, a prior account, or a request
        // started before a local edit must not restore stale ambience.
        if (
          fetchId !== settingsFetchId ||
          token !== localStorage.getItem("token") ||
          requestVersion !== persistVersion
        ) {
          return get().settings;
        }

        const settings =
          get().hydrateSettings(
            serverSettings
          );

        return settings;
      } catch (error) {
        if (
          fetchId !== settingsFetchId ||
          token !== localStorage.getItem("token") ||
          requestVersion !== persistVersion
        ) {
          return get().settings;
        }

        console.error(
          "Failed to fetch sanctuary settings:",
          error
        );

        // The login/profile response already contains the persisted settings.
        // A failed refresh must not replace those values with local defaults.
        return get().settings || loadSanctuaryFromStorage() || null;
      } finally {
        if (fetchId === settingsFetchId && token === localStorage.getItem("token")) {
          set({
            loading: false,
          });
        }
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

      const normalizedUpdates = { ...updates };
      if (Array.isArray(normalizedUpdates.audioLayers)) {
        normalizedUpdates.audioTrack = normalizedUpdates.audioLayers[0]?.soundId || "none";
      }
      if (Number.isFinite(normalizedUpdates.masterVolume)) {
        normalizedUpdates.audioVolume = normalizedUpdates.masterVolume;
      } else if (Number.isFinite(normalizedUpdates.audioVolume)) {
        normalizedUpdates.masterVolume = normalizedUpdates.audioVolume;
      }
      if (normalizedUpdates.audioTrack && !Array.isArray(normalizedUpdates.audioLayers)) {
        normalizedUpdates.audioLayers = normalizedUpdates.audioTrack === "none"
          ? []
          : [{ soundId: normalizedUpdates.audioTrack, volume: 1, muted: false }];
      }

      const newSettings = mergeSettings({
        ...current,
        ...normalizedUpdates,
      });

      set({
        settings: newSettings,
      });

      saveSanctuaryToStorage(
        newSettings
      );
      if (localStorage.getItem("token")) {
        markSanctuaryChangesPending();
      }

      /*
       * Every update receives a new version.
       * This lets us identify stale API responses.
       */
      persistVersion += 1;

      const currentVersion =
        persistVersion;

      const isTextUpdate =
        Object.keys(normalizedUpdates).some((key) =>
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

        enqueuePersistence(
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
