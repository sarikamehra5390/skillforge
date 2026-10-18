export const SANCTUARY_STORAGE_KEY =
  "skillforge_sanctuary";

export const DEFAULT_SANCTUARY_SETTINGS = {
  theme: "classic",
  treeType: "sprout",
  companion: null,
  music: ["fireflies"],
  decorations: [],
  treeAura: "none",
  ambientEffects: false,
  reducedMotion: false,
  particleIntensity: "medium",
  glowIntensity: "balanced",
  backgroundAtmosphere: "clear",
  cardSpacing: "comfortable",
  audioTrack: "none",
  audioVolume: 0.3,
  audioMuted: false,
  audioLayers: [],
  masterVolume: 0.3,
  soundFavorites: [],
  soundRecents: [],
  savedSoundscapes: [],
  seasonalWorld: "",
  seasonalAuto: false,
  seasonalHemisphere: "north",
  ambienceIntensity: "balanced",
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
  "treeAura",
  "ambientEffects",
  "reducedMotion",
  "particleIntensity",
  "glowIntensity",
  "backgroundAtmosphere",
  "cardSpacing",
  "audioTrack",
  "audioVolume",
  "audioMuted",
  "audioLayers",
  "masterVolume",
  "soundFavorites",
  "soundRecents",
  "savedSoundscapes",
  "seasonalWorld",
  "seasonalAuto",
  "seasonalHemisphere",
  "ambienceIntensity",
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

  const allowedSoundIds = new Set(["rain", "wind", "birds", "nature", "ocean", "fireplace", "white-noise", "pink-noise", "brown-noise"]);
  const legacyLayer = allowedSoundIds.has(source.audioTrack) && source.audioTrack !== "none"
    ? [{ soundId: source.audioTrack, volume: 1, muted: false }]
    : [];
  const requestedLayers = Array.isArray(source.audioLayers) ? source.audioLayers : legacyLayer;
  const audioLayers = requestedLayers.filter((layer, index, all) =>
    layer && allowedSoundIds.has(layer.soundId) && all.findIndex((item) => item?.soundId === layer.soundId) === index
  ).slice(0, 8).map((layer) => ({
    soundId: layer.soundId,
    volume: Number.isFinite(layer.volume) ? Math.min(1, Math.max(0, layer.volume)) : 0.25,
    muted: layer.muted === true,
  }));

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
    treeAura: ["none", "soft-glow", "magical-glow", "celestial-glow"].includes(source.treeAura)
      ? source.treeAura
      : DEFAULT_SANCTUARY_SETTINGS.treeAura,
    ambientEffects: typeof source.ambientEffects === "boolean"
      ? source.ambientEffects
      : DEFAULT_SANCTUARY_SETTINGS.ambientEffects,
    reducedMotion: typeof source.reducedMotion === "boolean"
      ? source.reducedMotion
      : DEFAULT_SANCTUARY_SETTINGS.reducedMotion,
    particleIntensity: ["off", "low", "medium", "high"].includes(source.particleIntensity) ? source.particleIntensity : DEFAULT_SANCTUARY_SETTINGS.particleIntensity,
    glowIntensity: ["subtle", "balanced", "magical"].includes(source.glowIntensity) ? source.glowIntensity : DEFAULT_SANCTUARY_SETTINGS.glowIntensity,
    backgroundAtmosphere: ["clear", "misty", "starry", "rainy"].includes(source.backgroundAtmosphere) ? source.backgroundAtmosphere : DEFAULT_SANCTUARY_SETTINGS.backgroundAtmosphere,
    cardSpacing: ["compact", "comfortable"].includes(source.cardSpacing) ? source.cardSpacing : DEFAULT_SANCTUARY_SETTINGS.cardSpacing,
    audioTrack: ["none", "rain", "wind", "birds", "nature", "ocean", "fireplace", "white-noise", "pink-noise", "brown-noise"].includes(source.audioTrack) ? source.audioTrack : DEFAULT_SANCTUARY_SETTINGS.audioTrack,
    audioVolume: Number.isFinite(source.audioVolume) ? Math.min(1, Math.max(0, source.audioVolume)) : DEFAULT_SANCTUARY_SETTINGS.audioVolume,
    audioMuted: typeof source.audioMuted === "boolean" ? source.audioMuted : DEFAULT_SANCTUARY_SETTINGS.audioMuted,
    audioLayers,
    masterVolume: Number.isFinite(source.masterVolume) ? Math.min(1, Math.max(0, source.masterVolume)) : (Number.isFinite(source.audioVolume) ? Math.min(1, Math.max(0, source.audioVolume)) : DEFAULT_SANCTUARY_SETTINGS.masterVolume),
    soundFavorites: Array.isArray(source.soundFavorites) ? [...new Set(source.soundFavorites.filter((id) => allowedSoundIds.has(id)))].slice(0, 32) : [],
    soundRecents: Array.isArray(source.soundRecents) ? [...new Set(source.soundRecents.filter((id) => allowedSoundIds.has(id)))].slice(0, 12) : [],
    savedSoundscapes: Array.isArray(source.savedSoundscapes) ? source.savedSoundscapes.filter((mix) => mix && typeof mix.name === "string" && Array.isArray(mix.layers)).slice(0, 20).map((mix) => ({
      id: typeof mix.id === "string" ? mix.id.slice(0, 80) : `${mix.name}-${Date.now()}`,
      name: mix.name.trim().slice(0, 50),
      layers: mix.layers.filter((layer, index, all) => layer && allowedSoundIds.has(layer.soundId) && all.findIndex((item) => item?.soundId === layer.soundId) === index).slice(0, 8).map((layer) => ({ soundId: layer.soundId, volume: Number.isFinite(layer.volume) ? Math.min(1, Math.max(0, layer.volume)) : 0.25, muted: layer.muted === true })),
    })) : [],
    seasonalWorld: ["", "spring", "summer", "autumn", "winter"].includes(source.seasonalWorld) ? source.seasonalWorld : "",
    seasonalAuto: typeof source.seasonalAuto === "boolean" ? source.seasonalAuto : false,
    seasonalHemisphere: ["north", "south"].includes(source.seasonalHemisphere) ? source.seasonalHemisphere : "north",
    ambienceIntensity: ["minimal", "balanced", "immersive"].includes(source.ambienceIntensity) ? source.ambienceIntensity : "balanced",
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
