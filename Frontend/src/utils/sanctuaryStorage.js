export const SANCTUARY_STORAGE_KEY =
  "skillforge_sanctuary";

export const DEFAULT_SANCTUARY_SETTINGS = {
  theme: "classic",
  treeType: "sprout",
  companion: null,
  music: ["fireflies"],
  decorations: [],
  displayName: "",
  avatar: "",
  bio: "",
  favoriteSkill: "",
  profileFrame: "none",
  avatarColor:
    "from-primary-400 to-secondary-400",
  title: "beginner",
};

const PERSISTABLE_FIELDS = [
  "theme",
  "treeType",
  "companion",
  "music",
  "decorations",
  "displayName",
  "avatar",
  "bio",
  "favoriteSkill",
  "profileFrame",
  "avatarColor",
  "title",
];

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const normalizeSettings = (settings = {}) => {
  const source = isObject(settings)
    ? settings
    : {};

  return {
    ...DEFAULT_SANCTUARY_SETTINGS,
    ...source,

    // These fields must always be arrays.
    music: Array.isArray(source.music)
      ? source.music
      : DEFAULT_SANCTUARY_SETTINGS.music,

    decorations: Array.isArray(
      source.decorations
    )
      ? source.decorations
      : DEFAULT_SANCTUARY_SETTINGS.decorations,
  };
};

export function pickPersistableFields(
  settings
) {
  if (!isObject(settings)) {
    return {
      ...DEFAULT_SANCTUARY_SETTINGS,
    };
  }

  const picked = {};

  for (const field of PERSISTABLE_FIELDS) {
    if (settings[field] !== undefined) {
      picked[field] = settings[field];
    }
  }

  return normalizeSettings(picked);
}

export function loadSanctuaryFromStorage() {
  try {
    const raw = localStorage.getItem(
      SANCTUARY_STORAGE_KEY
    );

    if (raw) {
      const parsed = JSON.parse(raw);

      if (isObject(parsed)) {
        return normalizeSettings(parsed);
      }
    }
  } catch (error) {
    console.warn(
      "Failed to load sanctuary settings:",
      error
    );
  }

  /*
   * Backward compatibility with the older
   * storage keys used by SkillForge.
   */
  try {
    const legacyTheme =
      localStorage.getItem(
        "skillforge_theme"
      );

    const legacyTree =
      localStorage.getItem(
        "skillForgeSelectedTree"
      );

    if (!legacyTheme && !legacyTree) {
      return null;
    }

    const migratedSettings =
      normalizeSettings({
        ...(legacyTheme
          ? { theme: legacyTheme }
          : {}),
        ...(legacyTree
          ? { treeType: legacyTree }
          : {}),
      });

    /*
     * Migrate the legacy values into the new
     * unified sanctuary storage format.
     */
    saveSanctuaryToStorage(
      migratedSettings
    );

    return migratedSettings;
  } catch (error) {
    console.warn(
      "Failed to load legacy sanctuary settings:",
      error
    );

    return null;
  }
}

export function saveSanctuaryToStorage(
  settings
) {
  try {
    const persistable =
      pickPersistableFields(settings);

    localStorage.setItem(
      SANCTUARY_STORAGE_KEY,
      JSON.stringify(persistable)
    );

    /*
     * Keep legacy keys synchronized for
     * backward compatibility with any older
     * components that may still read them.
     */
    if (persistable.theme) {
      localStorage.setItem(
        "skillforge_theme",
        persistable.theme
      );
    }

    if (persistable.treeType) {
      localStorage.setItem(
        "skillForgeSelectedTree",
        persistable.treeType
      );
    }

    return persistable;
  } catch (error) {
    console.warn(
      "Failed to save sanctuary settings:",
      error
    );

    return null;
  }
}