import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./common/GlassCard";
import useSanctuaryStore from "../store/useSanctuaryStore";
import useAuthStore from "../store/useAuthStore";
import { useTheme } from "../context/useTheme";
import { useTree } from "../context/useTree";
import { DEFAULT_SANCTUARY_SETTINGS } from "../utils/sanctuaryStorage";
import {
  TREE_OPTIONS,
  THEME_OPTIONS,
  COMPANION_OPTIONS,
  TITLE_OPTIONS,
  AVATAR_COLORS,
  MUSIC_OPTIONS,
  DECORATION_OPTIONS,
  PROFILE_FRAMES,
  TREE_AURA_OPTIONS,
  SANCTUARY_PRESETS,
} from "../utils/sanctuary";
import { X, Lock } from "lucide-react";
import SoundSanctuaryStudio from "./SoundSanctuaryStudio";

const CustomizeSanctuaryModal = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    activeTab,
    setActiveTab,
    settings,
    updateSettings,
  } = useSanctuaryStore();

  const { user } = useAuthStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [presetBackup, setPresetBackup] = useState(null);

  const handleClose = () => {
    setShowConfirmDialog(false);
    setIsModalOpen(false);
  };

  const tabs = [
    { id: "tree", name: "Tree", emoji: "🌳" },
    { id: "theme", name: "Theme", emoji: "🌅" },
    { id: "companion", name: "Companion", emoji: "🐦" },
    { id: "music", name: "Ambience", emoji: "🎵" },
    { id: "decorations", name: "Decorations", emoji: "✨" },
    { id: "presets", name: "Presets", emoji: "🪄" },
    { id: "profile", name: "Profile", emoji: "👤" },
  ];

  useEffect(() => {
    if (!isModalOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (showConfirmDialog) {
          setShowConfirmDialog(false);
        } else {
          setShowConfirmDialog(false);
          setIsModalOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, showConfirmDialog, setIsModalOpen]);

  const handleRestoreDefaults = () => {
    updateSettings({ ...DEFAULT_SANCTUARY_SETTINGS });
    setShowConfirmDialog(false);
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sanctuary-modal-title"
          >
            <GlassCard className="pointer-events-auto flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <h2
                  id="sanctuary-modal-title"
                  className="text-3xl font-bold italic tracking-tight"
                  style={{ color: "var(--text)" }}
                >
                  Customize Your Sanctuary
                </h2>

                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full p-2 transition-colors hover:bg-white/10"
                  aria-label="Close sanctuary customization"
                >
                  <X
                    className="h-6 w-6"
                    style={{ color: "var(--text)" }}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto border-b border-white/10 p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 font-medium transition-all ${
                      activeTab === tab.id
                        ? "border border-primary-500/30 bg-primary-500/20 text-primary-300"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                    aria-current={
                      activeTab === tab.id ? "page" : undefined
                    }
                  >
                    <span className="text-lg" aria-hidden="true">
                      {tab.emoji}
                    </span>
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "tree" && (
                    <TreeTab key="tree" />
                  )}

                  {activeTab === "theme" && (
                    <ThemeTab
                      key="theme"
                      onRestoreDefaults={() =>
                        setShowConfirmDialog(true)
                      }
                    />
                  )}

                  {activeTab === "companion" && (
                    <CompanionTab
                      key="companion"
                      settings={settings}
                      updateSettings={updateSettings}
                    />
                  )}

                  {activeTab === "music" && (
                    <MusicTab
                      key="music"
                      settings={settings}
                      updateSettings={updateSettings}
                    />
                  )}

                  {activeTab === "decorations" && (
                    <DecorationsTab
                      key="decorations"
                      settings={settings}
                      updateSettings={updateSettings}
                    />
                  )}

                  {activeTab === "profile" && (
                    <ProfileTab
                      key="profile"
                      settings={settings}
                      user={user}
                      updateSettings={updateSettings}
                    />
                  )}

                  {activeTab === "presets" && (
                    <PresetsTab
                      key="presets"
                      settings={settings}
                      updateSettings={updateSettings}
                      backup={presetBackup}
                      setBackup={setPresetBackup}
                    />
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
          </motion.div>

          {/* Confirmation Dialog */}
          <AnimatePresence>
            {showConfirmDialog && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
                  onClick={() => setShowConfirmDialog(false)}
                  aria-hidden="true"
                />

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    y: 20,
                  }}
                  className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="restore-dialog-title"
                >
                  <div
                    className="mx-4 w-full max-w-md rounded-3xl p-8"
                    onClick={(event) => event.stopPropagation()}
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      backdropFilter: "blur(24px)",
                    }}
                  >
                    <h3
                      id="restore-dialog-title"
                      className="mb-4 text-2xl font-bold"
                      style={{ color: "var(--text)" }}
                    >
                      Restore your sanctuary to its original appearance?
                    </h3>

                    <p
                      className="mb-8 opacity-80"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      This will reset your theme, tree, companion,
                      decorations, ambience, and profile color.
                    </p>

                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmDialog(false)
                        }
                        className="rounded-xl px-6 py-3 font-medium transition-all"
                        style={{
                          color: "var(--text-secondary)",
                          background: "transparent",
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleRestoreDefaults}
                        className="rounded-xl px-6 py-3 font-semibold transition-all"
                        style={{
                          background: "var(--button)",
                          color: "white",
                          boxShadow: "0 0 20px var(--shadow)",
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.background =
                            "var(--button-hover)";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background =
                            "var(--button)";
                        }}
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

/* -------------------------------------------------------------------------- */
/* Tree Tab                                                                    */
/* -------------------------------------------------------------------------- */

const TreeTab = () => {
  const {
    setSelectedTree,
    selectedTree,
    unlockedTrees,
    treeAura,
    setTreeAura,
  } = useTree();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h3
        className="mb-4 text-xl font-bold"
        style={{ color: "var(--text)" }}
      >
        Choose Your Tree
      </h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {TREE_OPTIONS.map((tree) => {
          const isUnlocked = unlockedTrees.includes(tree.id);
          const isSelected = selectedTree === tree.id;

          return (
            <button
              key={tree.id}
              type="button"
              onClick={() =>
                isUnlocked && setSelectedTree(tree.id)
              }
              disabled={!isUnlocked}
              className={`relative rounded-2xl border-2 p-6 text-center transition-all ${
                isSelected
                  ? "border-primary-400 bg-primary-400/10"
                  : isUnlocked
                    ? "border-white/10 bg-white/5 hover:border-primary-300/30"
                    : "cursor-not-allowed border-white/5 bg-white/5 opacity-60"
              }`}
            >
              <div
                className="mb-3 text-4xl"
                aria-hidden="true"
              >
                {tree.emoji}
              </div>

              <h4
                className="font-bold"
                style={{ color: "var(--text)" }}
              >
                {tree.name}
              </h4>

              {!isUnlocked && (
                <>
                  <p
                    className="mt-1 text-xs"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    Reach Level {tree.unlockLevel} to Unlock
                  </p>

                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                    <Lock
                      size={32}
                      style={{
                        color: "var(--text-secondary)",
                      }}
                      aria-hidden="true"
                    />
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      <section aria-labelledby="tree-aura-heading" className="space-y-4">
        <div>
          <h4 id="tree-aura-heading" className="text-lg font-bold" style={{ color: "var(--text)" }}>Tree Aura</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Choose a cosmetic glow. Tree growth and unlocks still come from your real progress.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TREE_AURA_OPTIONS.map((aura) => (
            <button key={aura.id} type="button" onClick={() => setTreeAura(aura.id)} aria-pressed={treeAura === aura.id}
              className={`rounded-2xl border-2 p-4 text-left transition-colors ${treeAura === aura.id ? "border-primary-400 bg-primary-400/10" : "border-white/10 bg-white/5 hover:border-primary-300/30"}`}>
              <span className="block font-bold" style={{ color: "var(--text)" }}>{aura.name}</span>
              <span className="mt-1 block text-xs" style={{ color: "var(--text-secondary)" }}>{aura.description}</span>
            </button>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

const PRESET_FIELDS = ["theme", "treeAura", "music", "ambientEffects", "reducedMotion", "particleIntensity", "glowIntensity", "backgroundAtmosphere", "cardSpacing"];

const PresetsTab = ({ settings, updateSettings, backup, setBackup }) => {
  const applyPreset = (preset) => {
    if (!backup) {
      const previous = {};
      for (const field of PRESET_FIELDS) {
        const value = settings?.[field];
        previous[field] = Array.isArray(value) ? [...value] : value;
      }
      setBackup(previous);
    }
    updateSettings(preset.settings);
  };

  const restorePrevious = () => {
    if (!backup) return;
    updateSettings(backup);
    setBackup(null);
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold" style={{ color: "var(--text)" }}>Sanctuary Presets</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Apply a starting atmosphere, then adjust any setting in the other tabs.</p>
        </div>
        {backup && <button type="button" onClick={restorePrevious} className="rounded-xl border px-4 py-2 text-sm font-semibold" style={{ color: "var(--text)", borderColor: "var(--border)" }}>Restore previous choices</button>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SANCTUARY_PRESETS.map((preset) => (
          <button key={preset.id} type="button" onClick={() => applyPreset(preset)} className="companion-card rounded-2xl p-5 text-left" aria-label={`Apply ${preset.name} preset`}>
            <span className="text-3xl" aria-hidden="true">{preset.emoji}</span>
            <span className="mt-3 block font-bold" style={{ color: "var(--text)" }}>{preset.name}</span>
            <span className="mt-1 block text-sm" style={{ color: "var(--text-secondary)" }}>{preset.description}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* Theme Tab                                                                   */
/* -------------------------------------------------------------------------- */

const ThemeTab = ({ onRestoreDefaults }) => {
  const { changeTheme, currentTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="text-xl font-bold"
          style={{ color: "var(--text)" }}
        >
          Choose Your Theme
        </h3>

        <button
          type="button"
          onClick={onRestoreDefaults}
          className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:bg-white/10"
          style={{
            color: "var(--text)",
            borderColor: "var(--border)",
          }}
        >
          ↺ Restore Default Sanctuary
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = currentTheme === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => changeTheme(theme.id)}
              aria-pressed={isSelected}
              className={`rounded-2xl border-2 p-6 text-center transition-all ${
                isSelected
                  ? "border-primary-400 bg-primary-400/10"
                  : "border-white/10 bg-white/5 hover:border-primary-300/30"
              }`}
            >
              {theme.preview && (
                <span
                  className="mb-4 block h-12 rounded-xl border border-white/15 shadow-inner"
                  style={{ background: theme.preview }}
                  aria-hidden="true"
                />
              )}
              <div
                className="mb-3 text-4xl"
                aria-hidden="true"
              >
                {theme.emoji}
              </div>

              <h4
                className="font-bold"
                style={{ color: "var(--text)" }}
              >
                {theme.name}
              </h4>

              {theme.description && (
                <p
                  className="mt-1 text-xs"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  {theme.description}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* Companion Tab                                                               */
/* -------------------------------------------------------------------------- */

const CompanionTab = ({ settings, updateSettings }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h3
        className="mb-4 text-xl font-bold"
        style={{ color: "var(--text)" }}
      >
        Choose Your Companion
      </h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {/* None option */}
        <button
          type="button"
          onClick={() => updateSettings({ companion: null })}
          className={`rounded-2xl border-2 p-6 text-center transition-all ${
            settings?.companion === null
              ? "border-primary-400 bg-primary-400/10"
              : "border-white/10 bg-white/5 hover:border-primary-300/30"
          }`}
        >
          <div
            className="mb-3 text-4xl"
            aria-hidden="true"
          >
            ❌
          </div>

          <h4
            className="font-bold"
            style={{ color: "var(--text)" }}
          >
            None
          </h4>
        </button>

        {COMPANION_OPTIONS.map((companion) => {
          const isSelected =
            settings?.companion === companion.id;

          return (
            <button
              key={companion.id}
              type="button"
              onClick={() =>
                updateSettings({
                  companion: companion.id,
                })
              }
              className={`rounded-2xl border-2 p-6 text-center transition-all ${
                isSelected
                  ? "border-primary-400 bg-primary-400/10"
                  : "border-white/10 bg-white/5 hover:border-primary-300/30"
              }`}
            >
              <div
                className="mb-3 text-4xl"
                aria-hidden="true"
              >
                {companion.emoji}
              </div>

              <h4
                className="font-bold"
                style={{ color: "var(--text)" }}
              >
                {companion.name}
              </h4>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* Music / Ambience Tab                                                        */
/* -------------------------------------------------------------------------- */

const MusicTab = ({ settings, updateSettings }) => {
  const currentMusic = Array.isArray(settings?.music)
    ? settings.music
    : [];

  const toggleAmbience = (id) => {
    const newAmbience = currentMusic.includes(id)
      ? currentMusic.filter((item) => item !== id)
      : [...currentMusic, id];

    const updates = { music: newAmbience };
    const currentLayers = Array.isArray(settings?.audioLayers) ? settings.audioLayers : [];
    const audioTrackByAmbience = {
      rain: "rain", "rain-sounds": "rain",
      wind: "wind", "wind-sounds": "wind",
      birds: "birds", "bird-sounds": "birds",
      "nature-sounds": "nature",
    };
    const audioTrack = audioTrackByAmbience[id];
    if (audioTrack) {
      const isActive = currentLayers.some((layer) => layer.soundId === audioTrack);
      const audioLayers = isActive
        ? currentLayers.filter((layer) => layer.soundId !== audioTrack)
        : [...currentLayers, { soundId: audioTrack, volume: 0.25, muted: false }];
      updates.audioLayers = audioLayers;
      updates.audioTrack = audioLayers[0]?.soundId || "none";
    }
    updateSettings(updates);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h3
        className="mb-4 text-xl font-bold"
        style={{ color: "var(--text)" }}
      >
        Choose Ambience
      </h3>

      <SoundSanctuaryStudio />

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--glass)" }}>
          <input type="checkbox" checked={settings?.ambientEffects === true} onChange={(event) => updateSettings({ ambientEffects: event.target.checked })} className="mt-1 accent-violet-400" />
          <span><span className="block font-semibold" style={{ color: "var(--text)" }}>Ambient visual effects</span><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Show selected fireflies, stars, rain, mist, and tree aura effects.</span></span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--glass)" }}>
          <input type="checkbox" checked={settings?.reducedMotion === true} onChange={(event) => updateSettings({ reducedMotion: event.target.checked })} className="mt-1 accent-violet-400" />
          <span><span className="block font-semibold" style={{ color: "var(--text)" }}>Reduce motion</span><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Reduce animated movement throughout the app.</span></span>
        </label>
      </div>

      <section className="grid gap-4 rounded-2xl border p-4 sm:grid-cols-2" style={{ borderColor: "var(--border)", backgroundColor: "var(--glass)" }} aria-label="Appearance controls">
        <label className="space-y-1.5 text-sm font-medium" style={{ color: "var(--text)" }}>Ambient particle intensity
          <select value={settings?.particleIntensity || "medium"} onChange={(event) => updateSettings({ particleIntensity: event.target.value })} className="glass-input w-full rounded-xl px-3 py-2.5"><option value="off">Off</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
        </label>
        <label className="space-y-1.5 text-sm font-medium" style={{ color: "var(--text)" }}>Glow intensity
          <select value={settings?.glowIntensity || "balanced"} onChange={(event) => updateSettings({ glowIntensity: event.target.value })} className="glass-input w-full rounded-xl px-3 py-2.5"><option value="subtle">Subtle</option><option value="balanced">Balanced</option><option value="magical">Magical</option></select>
        </label>
        <label className="space-y-1.5 text-sm font-medium" style={{ color: "var(--text)" }}>Background atmosphere
          <select value={settings?.backgroundAtmosphere || "clear"} onChange={(event) => updateSettings({ backgroundAtmosphere: event.target.value })} className="glass-input w-full rounded-xl px-3 py-2.5"><option value="clear">Clear</option><option value="misty">Misty</option><option value="starry">Starry</option><option value="rainy">Rainy</option></select>
        </label>
        <label className="space-y-1.5 text-sm font-medium" style={{ color: "var(--text)" }}>Card spacing
          <select value={settings?.cardSpacing || "comfortable"} onChange={(event) => updateSettings({ cardSpacing: event.target.value })} className="glass-input w-full rounded-xl px-3 py-2.5"><option value="compact">Compact</option><option value="comfortable">Comfortable</option></select>
        </label>
      </section>

      <h4 className="font-semibold" style={{ color: "var(--text)" }}>Visual ambience effects</h4>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {MUSIC_OPTIONS.map((music) => {
          const isSelected = currentMusic.includes(
            music.id
          );

          return (
            <button
              key={music.id}
              type="button"
              onClick={() => toggleAmbience(music.id)}
              className={`rounded-2xl border-2 p-6 text-center transition-all ${
                isSelected
                  ? "border-primary-400 bg-primary-400/10"
                  : "border-white/10 bg-white/5 hover:border-primary-300/30"
              }`}
            >
              <div
                className="mb-3 text-4xl"
                aria-hidden="true"
              >
                {music.emoji}
              </div>

              <h4
                className="font-bold"
                style={{ color: "var(--text)" }}
              >
                {music.name}
              </h4>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* Decorations Tab                                                             */
/* -------------------------------------------------------------------------- */

const DecorationsTab = ({
  settings,
  updateSettings,
}) => {
  const currentDecorations = Array.isArray(
    settings?.decorations
  )
    ? settings.decorations
    : [];

  const toggleDecoration = (id) => {
    const newDecorations = currentDecorations.includes(id)
      ? currentDecorations.filter((item) => item !== id)
      : [...currentDecorations, id];

    updateSettings({
      decorations: newDecorations,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h3
        className="mb-4 text-xl font-bold"
        style={{ color: "var(--text)" }}
      >
        Choose Decorations
      </h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {DECORATION_OPTIONS.map((decoration) => {
          const isSelected =
            currentDecorations.includes(
              decoration.id
            );

          return (
            <button
              key={decoration.id}
              type="button"
              onClick={() =>
                toggleDecoration(decoration.id)
              }
              className={`rounded-2xl border-2 p-6 text-center transition-all ${
                isSelected
                  ? "border-primary-400 bg-primary-400/10"
                  : "border-white/10 bg-white/5 hover:border-primary-300/30"
              }`}
            >
              <div
                className="mb-3 text-4xl"
                aria-hidden="true"
              >
                {decoration.emoji}
              </div>

              <h4
                className="font-bold"
                style={{ color: "var(--text)" }}
              >
                {decoration.name}
              </h4>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* Profile Tab                                                                 */
/* -------------------------------------------------------------------------- */

const ProfileTab = ({
  settings,
  user,
  updateSettings,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      {/* Display Name */}
      <div>
        <h3
          className="mb-4 text-xl font-bold"
          style={{ color: "var(--text)" }}
        >
          Display Name
        </h3>

        <input
          type="text"
          value={
            settings?.displayName ||
            user?.username ||
            ""
          }
          onChange={(event) =>
            updateSettings({
              displayName: event.target.value,
            })
          }
          className="w-full rounded-2xl px-4 py-3 text-sm transition-all focus:outline-none"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
          maxLength={50}
          aria-label="Display name"
        />
      </div>

      {/* Bio */}
      <div>
        <h3
          className="mb-4 text-xl font-bold"
          style={{ color: "var(--text)" }}
        >
          Bio
        </h3>

        <textarea
          value={settings?.bio || ""}
          onChange={(event) =>
            updateSettings({
              bio: event.target.value,
            })
          }
          rows={3}
          className="w-full resize-none rounded-2xl px-4 py-3 text-sm transition-all focus:outline-none"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
          maxLength={250}
          aria-label="Bio"
        />
      </div>

      {/* Favorite Skill */}
      <div>
        <h3
          className="mb-4 text-xl font-bold"
          style={{ color: "var(--text)" }}
        >
          Favorite Skill
        </h3>

        <input
          type="text"
          value={settings?.favoriteSkill || ""}
          onChange={(event) =>
            updateSettings({
              favoriteSkill: event.target.value,
            })
          }
          className="w-full rounded-2xl px-4 py-3 text-sm transition-all focus:outline-none"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
          maxLength={100}
          aria-label="Favorite skill"
        />
      </div>

      {/* Avatar Colors */}
      <div>
        <h3
          className="mb-4 text-xl font-bold"
          style={{ color: "var(--text)" }}
        >
          Avatar Color
        </h3>

        <div className="flex flex-wrap gap-4">
          {AVATAR_COLORS.map((color) => {
            const isSelected =
              settings?.avatarColor === color;

            return (
              <button
                key={color}
                type="button"
                onClick={() =>
                  updateSettings({
                    avatarColor: color,
                  })
                }
                className={`h-16 w-16 rounded-2xl border-2 bg-gradient-to-br ${color} transition-all ${
                  isSelected
                    ? "scale-110 border-white"
                    : "border-transparent hover:scale-105"
                }`}
                aria-label={`Select avatar color ${color}`}
                aria-pressed={isSelected}
              />
            );
          })}
        </div>
      </div>

      {/* Profile Frames */}
      <div>
        <h3
          className="mb-4 text-xl font-bold"
          style={{ color: "var(--text)" }}
        >
          Profile Frame
        </h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {PROFILE_FRAMES.map((frame) => {
            const isSelected =
              settings?.profileFrame === frame.id;

            return (
              <button
                key={frame.id}
                type="button"
                onClick={() =>
                  updateSettings({
                    profileFrame: frame.id,
                  })
                }
                className={`rounded-2xl border-2 p-6 text-center transition-all ${
                  isSelected
                    ? "border-primary-400 bg-primary-400/10"
                    : "border-white/10 bg-white/5 hover:border-primary-300/30"
                }`}
              >
                <div
                  className="mb-3 text-4xl"
                  aria-hidden="true"
                >
                  {frame.emoji}
                </div>

                <h4
                  className="font-bold"
                  style={{ color: "var(--text)" }}
                >
                  {frame.name}
                </h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Titles */}
      <div>
        <h3
          className="mb-4 text-xl font-bold"
          style={{ color: "var(--text)" }}
        >
          Choose Your Title
        </h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {TITLE_OPTIONS.map((title) => {
            const isUnlocked =
              (user?.xp || 0) >= title.unlockXP;

            const isSelected =
              settings?.title === title.id;

            return (
              <button
                key={title.id}
                type="button"
                onClick={() =>
                  isUnlocked &&
                  updateSettings({
                    title: title.id,
                  })
                }
                disabled={!isUnlocked}
                className={`rounded-2xl border-2 p-6 text-center transition-all ${
                  isSelected
                    ? "border-primary-400 bg-primary-400/10"
                    : isUnlocked
                      ? "border-white/10 bg-white/5 hover:border-primary-300/30"
                      : "cursor-not-allowed border-white/5 bg-white/5 opacity-50"
                }`}
              >
                <div
                  className="mb-3 text-4xl"
                  aria-hidden="true"
                >
                  {title.emoji}
                </div>

                <h4
                  className="font-bold"
                  style={{ color: "var(--text)" }}
                >
                  {title.name}
                </h4>

                {!isUnlocked && (
                  <p
                    className="mt-1 text-xs"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    {title.unlockXP} XP to unlock
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default CustomizeSanctuaryModal;
