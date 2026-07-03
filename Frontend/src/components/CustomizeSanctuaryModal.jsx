import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./common/GlassCard";
import Button from "./common/Button";
import useSanctuaryStore from "../store/useSanctuaryStore";
import useAuthStore from "../store/useAuthStore";
import { useTheme } from "../context/ThemeContext";
import { useTree } from "../context/TreeContext";
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
} from "../utils/sanctuary";
import { X, Lock } from "lucide-react";

const CustomizeSanctuaryModal = () => {
  const { isModalOpen, setIsModalOpen, activeTab, setActiveTab, settings, updateSettings } = useSanctuaryStore();
  const { user } = useAuthStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const tabs = [
    { id: "tree", name: "Tree", emoji: "🌳" },
    { id: "theme", name: "Theme", emoji: "🌅" },
    { id: "companion", name: "Companion", emoji: "🐦" },
    { id: "music", name: "Ambience", emoji: "🎵" },
    { id: "decorations", name: "Decorations", emoji: "✨" },
    { id: "profile", name: "Profile", emoji: "👤" },
  ];

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
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-0 z-50 p-4 md:p-8 flex items-center justify-center pointer-events-none"
          >
            <GlassCard className="w-full max-w-5xl h-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-3xl font-bold italic tracking-tight" style={{ color: 'var(--text)' }}>Customize Your Sanctuary</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6" style={{ color: 'var(--text)' }} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-4 border-b border-white/10 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.id ? "bg-primary-500/20 text-primary-300 border border-primary-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="text-lg">{tab.emoji}</span>
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "tree" && (
                    <TreeTab key="tree" settings={settings} user={user} updateSettings={updateSettings} />
                  )}
                  {activeTab === "theme" && (
                    <ThemeTab 
                      key="theme" 
                      settings={settings} 
                      updateSettings={updateSettings} 
                      onRestoreDefaults={() => setShowConfirmDialog(true)} 
                    />
                  )}
                  {activeTab === "companion" && (
                    <CompanionTab key="companion" settings={settings} updateSettings={updateSettings} />
                  )}
                  {activeTab === "music" && (
                    <MusicTab key="music" settings={settings} updateSettings={updateSettings} />
                  )}
                  {activeTab === "decorations" && (
                    <DecorationsTab key="decorations" settings={settings} updateSettings={updateSettings} />
                  )}
                  {activeTab === "profile" && (
                    <ProfileTab key="profile" settings={settings} user={user} updateSettings={updateSettings} />
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
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
                  onClick={() => setShowConfirmDialog(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                >
                  <div 
                    className="p-8 rounded-3xl max-w-md w-full mx-4"
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      background: 'var(--card)', 
                      border: '1px solid var(--border)',
                      backdropFilter: 'blur(24px)'
                    }}
                  >
                    <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>
                      Restore your sanctuary to its original appearance?
                    </h3>
                    <p className="mb-8 opacity-80" style={{ color: 'var(--text-secondary)' }}>
                      This will reset your theme, tree, companion, decorations, ambience, and profile color.
                    </p>
                    <div className="flex gap-4 justify-end">
                      <button 
                        onClick={() => setShowConfirmDialog(false)}
                        className="px-6 py-3 rounded-xl font-medium transition-all"
                        style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleRestoreDefaults}
                        className="px-6 py-3 rounded-xl font-semibold transition-all"
                        style={{ 
                          background: 'var(--button)', 
                          color: 'white',
                          boxShadow: '0 0 20px var(--shadow)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--button-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--button)'}
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

// Tab Components
const TreeTab = ({ settings, user, updateSettings }) => {
  const { setSelectedTree, selectedTree, unlockedTrees, userLevel } = useTree();
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Choose Your Tree</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {TREE_OPTIONS.map((tree) => {
          const isUnlocked = unlockedTrees.includes(tree.id);
          const isSelected = selectedTree === tree.id;
          return (
            <button
              key={tree.id}
              onClick={() => isUnlocked && setSelectedTree(tree.id)}
              disabled={!isUnlocked}
              className={`p-6 rounded-2xl border-2 transition-all text-center relative ${
                isSelected ? "border-primary-400 bg-primary-400/10" : isUnlocked ? "border-white/10 bg-white/5 hover:border-primary-300/30" : "border-white/5 bg-white/2 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="text-4xl mb-3">{tree.emoji}</div>
              <h4 className="font-bold" style={{ color: 'var(--text)' }}>{tree.name}</h4>
              {!isUnlocked && (
                <>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Reach Level {tree.unlockLevel} to Unlock</p>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                    <Lock size={32} style={{ color: 'var(--text-secondary)' }} />
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

const ThemeTab = ({ settings, updateSettings, onRestoreDefaults }) => {
  const { changeTheme, currentTheme } = useTheme();
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Choose Your Theme</h3>
        <button
          onClick={onRestoreDefaults}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10 flex items-center gap-2"
          style={{ color: 'var(--text)', border: '1px solid var(--border)' }}
        >
          ↺ Restore Default Sanctuary
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => changeTheme(theme.id)}
              className={`p-6 rounded-2xl border-2 transition-all text-center ${
                isSelected ? "border-primary-400 bg-primary-400/10" : "border-white/10 bg-white/5 hover:border-primary-300/30"
              }`}
            >
              <div className="text-4xl mb-3">{theme.emoji}</div>
              <h4 className="font-bold" style={{ color: 'var(--text)' }}>{theme.name}</h4>
              {theme.description && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{theme.description}</p>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

const CompanionTab = ({ settings, updateSettings }) => {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Choose Your Companion</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* None option */}
        <button
          key="none"
          onClick={() => updateSettings({ companion: null })}
          className={`p-6 rounded-2xl border-2 transition-all text-center ${
            settings?.companion === null ? "border-primary-400 bg-primary-400/10" : "border-white/10 bg-white/5 hover:border-primary-300/30"
          }`}
        >
          <div className="text-4xl mb-3">❌</div>
          <h4 className="font-bold" style={{ color: 'var(--text)' }}>None</h4>
        </button>
        
        {COMPANION_OPTIONS.map((companion) => {
          const isSelected = settings?.companion === companion.id;
          return (
            <button
              key={companion.id}
              onClick={() => updateSettings({ companion: companion.id })}
              className={`p-6 rounded-2xl border-2 transition-all text-center ${
                isSelected ? "border-primary-400 bg-primary-400/10" : "border-white/10 bg-white/5 hover:border-primary-300/30"
              }`}
            >
              <div className="text-4xl mb-3">{companion.emoji}</div>
              <h4 className="font-bold" style={{ color: 'var(--text)' }}>{companion.name}</h4>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

const MusicTab = ({ settings, updateSettings }) => {
  const toggleAmbience = (id) => {
    const current = settings?.music || [];
    const newAmbience = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    updateSettings({ music: newAmbience });
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Choose Ambience</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {MUSIC_OPTIONS.map((music) => {
          const isSelected = (settings?.music || []).includes(music.id);
          return (
            <button
              key={music.id}
              onClick={() => toggleAmbience(music.id)}
              className={`p-6 rounded-2xl border-2 transition-all text-center ${
                isSelected ? "border-primary-400 bg-primary-400/10" : "border-white/10 bg-white/5 hover:border-primary-300/30"
              }`}
            >
              <div className="text-4xl mb-3">{music.emoji}</div>
              <h4 className="font-bold" style={{ color: 'var(--text)' }}>{music.name}</h4>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

const DecorationsTab = ({ settings, updateSettings }) => {
  const toggleDecoration = (id) => {
    const currentDecorations = settings?.decorations || [];
    const newDecorations = currentDecorations.includes(id)
      ? currentDecorations.filter((d) => d !== id)
      : [...currentDecorations, id];
    updateSettings({ decorations: newDecorations });
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Choose Decorations</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {DECORATION_OPTIONS.map((decoration) => {
          const isSelected = (settings?.decorations || []).includes(decoration.id);
          return (
            <button
              key={decoration.id}
              onClick={() => toggleDecoration(decoration.id)}
              className={`p-6 rounded-2xl border-2 transition-all text-center ${
                isSelected ? "border-primary-400 bg-primary-400/10" : "border-white/10 bg-white/5 hover:border-primary-300/30"
              }`}
            >
              <div className="text-4xl mb-3">{decoration.emoji}</div>
              <h4 className="font-bold" style={{ color: 'var(--text)' }}>{decoration.name}</h4>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

const ProfileTab = ({ settings, user, updateSettings }) => {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      {/* Display Name */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Display Name</h3>
        <input
          type="text"
          value={settings?.displayName || user?.username || ""}
          onChange={(e) => updateSettings({ displayName: e.target.value })}
          className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Bio */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Bio</h3>
        <textarea
          value={settings?.bio || ""}
          onChange={(e) => updateSettings({ bio: e.target.value })}
          rows={3}
          className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all resize-none"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Favorite Skill */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Favorite Skill</h3>
        <input
          type="text"
          value={settings?.favoriteSkill || ""}
          onChange={(e) => updateSettings({ favoriteSkill: e.target.value })}
          className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Avatar Colors */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Avatar Color</h3>
        <div className="flex flex-wrap gap-4">
          {AVATAR_COLORS.map((color) => {
            const isSelected = settings?.avatarColor === color;
            return (
              <button
                key={color}
                onClick={() => updateSettings({ avatarColor: color })}
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} border-2 transition-all ${
                  isSelected ? "border-white scale-110" : "border-transparent hover:scale-105"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Profile Frames */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Profile Frame</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PROFILE_FRAMES.map((frame) => {
            const isSelected = settings?.profileFrame === frame.id;
            return (
              <button
                key={frame.id}
                onClick={() => updateSettings({ profileFrame: frame.id })}
                className={`p-6 rounded-2xl border-2 transition-all text-center ${
                  isSelected ? "border-primary-400 bg-primary-400/10" : "border-white/10 bg-white/5 hover:border-primary-300/30"
                }`}
              >
                <div className="text-4xl mb-3">{frame.emoji}</div>
                <h4 className="font-bold" style={{ color: 'var(--text)' }}>{frame.name}</h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Titles */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Choose Your Title</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {TITLE_OPTIONS.map((title) => {
            const isUnlocked = (user?.xp || 0) >= title.unlockXP;
            const isSelected = settings?.title === title.id;
            return (
              <button
                key={title.id}
                onClick={() => isUnlocked && updateSettings({ title: title.id })}
                disabled={!isUnlocked}
                className={`p-6 rounded-2xl border-2 transition-all text-center ${
                  isSelected ? "border-primary-400 bg-primary-400/10" : isUnlocked ? "border-white/10 bg-white/5 hover:border-primary-300/30" : "border-white/5 bg-white/2 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="text-4xl mb-3">{title.emoji}</div>
                <h4 className="font-bold" style={{ color: 'var(--text)' }}>{title.name}</h4>
                {!isUnlocked && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{title.unlockXP} XP to unlock</p>}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default CustomizeSanctuaryModal;