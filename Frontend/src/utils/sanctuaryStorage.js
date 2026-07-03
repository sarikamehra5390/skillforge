export const SANCTUARY_STORAGE_KEY = "skillforge_sanctuary";

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
  avatarColor: "from-primary-400 to-secondary-400",
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

export function pickPersistableFields(settings) {
  if (!settings) return { ...DEFAULT_SANCTUARY_SETTINGS };
  const picked = {};
  for (const field of PERSISTABLE_FIELDS) {
    if (settings[field] !== undefined) {
      picked[field] = settings[field];
    }
  }
  return { ...DEFAULT_SANCTUARY_SETTINGS, ...picked };
}

export function loadSanctuaryFromStorage() {
  try {
    const raw = localStorage.getItem(SANCTUARY_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SANCTUARY_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fall through to legacy keys
  }

  const legacyTheme = localStorage.getItem("skillforge_theme");
  const legacyTree = localStorage.getItem("skillForgeSelectedTree");
  if (!legacyTheme && !legacyTree) return null;

  return {
    ...DEFAULT_SANCTUARY_SETTINGS,
    ...(legacyTheme ? { theme: legacyTheme } : {}),
    ...(legacyTree ? { treeType: legacyTree } : {}),
  };
}

export function saveSanctuaryToStorage(settings) {
  const persistable = pickPersistableFields(settings);
  localStorage.setItem(SANCTUARY_STORAGE_KEY, JSON.stringify(persistable));

  if (persistable.theme) {
    localStorage.setItem("skillforge_theme", persistable.theme);
  }
  if (persistable.treeType) {
    localStorage.setItem("skillForgeSelectedTree", persistable.treeType);
  }
}
