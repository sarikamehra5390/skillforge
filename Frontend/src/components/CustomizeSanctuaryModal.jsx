import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./common/GlassCard";
import Button from "./common/Button";
import useSanctuaryStore from "../store/useSanctuaryStore";
import useAuthStore from "../store/useAuthStore";
import {
  TREE_OPTIONS,
  THEME_OPTIONS,
  COMPANION_OPTIONS,
  MUSIC_OPTIONS,
  DECORATION_OPTIONS,
  TITLE_OPTIONS,
  AVATAR_COLORS,
} from "../utils/sanctuary";
import { X } from "lucide-react";

const CustomizeSanctuaryModal = () => {
  const { isModalOpen, setIsModalOpen, activeTab, setActiveTab, settings, updateSettings } = useSanctuaryStore();
  const { user } = useAuthStore();

  const tabs = [
    { id: "tree", name: "Tree", emoji: "🌳" },
    { id: "theme", name: "Theme", emoji: "🌅" },
    { id: "companion", name: "Companion", emoji: "🐦" },
    { id: "music", name: "Ambience", emoji: "🎵" },
    { id: "decorations", name: "Decorations", emoji: "✨" },
    { id: "profile", name: "Profile", emoji: "👤" },
  ];

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
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-0 z-50 p-4 md:p-8 flex items-center justify-center"
          >
            <GlassCard className="w-full max-w-5xl h-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-3xl font-bold text-white italic tracking-tight">Customize Your Sanctuary</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
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
                    <ThemeTab key="theme" settings={settings} updateSettings={updateSettings} />
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
        </>
      )}
    </AnimatePresence>
  );
};

// Tab Components
const TreeTab = ({ settings, user, updateSettings }) => {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Choose Your Tree</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {TREE_OPTIONS.map((tree) => {
          const isUnlocked = (user?.level || 0) >= tree.unlockLevel;
          const isSelected = settings?.treeType === tree.id;
          return (
            <button
              key={tree.id}
              onClick={() => isUnlocked && updateSettings({ treeType: tree.id })}
              disabled={!isUnlocked}
              className={`p-6 rounded-2xl border-2 transition-all text-center ${
                isSelected ? "border-primary-400 bg-primary-400/10" : isUnlocked ? "border-white/10 bg-white/5 hover:border-primary-300/30" : "border-white/5 bg-white/2 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="text-4xl mb-3">{tree.emoji}</div>
              <h4 className="font-bold text-white">{tree.name}</h4>
              {!isUnlocked && <p className="text-xs text-slate-400 mt-1">Level {tree.unlockLevel} to unlock</p>}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

const ThemeTab = ({ settings, updateSettings }) => {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Choose Your Theme</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = settings?.theme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => updateSettings({ theme: theme.id })}
              className={`p-6 rounded-2xl border-2 transition-all text-center ${
                isSelected ? "border-primary-400 bg-primary-400/10" : "border-white/10 bg-white/5 hover:border-primary-300/30"
              }`}
            >
              <div className="text-4xl mb-3">{theme.emoji}</div>
              <h4 className="font-bold text-white">{theme.name}</h4>
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
      <h3 className="text-xl font-bold text-white mb-4">Choose Your Companion</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <h4 className="font-bold text-white">{companion.name}</h4>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

const MusicTab = ({ settings, updateSettings }) => {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Choose Ambience</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {MUSIC_OPTIONS.map((music) => {
          const isSelected = settings?.music === music.id;
          return (
            <button
              key={music.id}
              onClick={() => updateSettings({ music: music.id })}
              className={`p-6 rounded-2xl border-2 transition-all text-center ${
                isSelected ? "border-primary-400 bg-primary-400/10" : "border-white/10 bg-white/5 hover:border-primary-300/30"
              }`}
            >
              <div className="text-4xl mb-3">{music.emoji}</div>
              <h4 className="font-bold text-white">{music.name}</h4>
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
      <h3 className="text-xl font-bold text-white mb-4">Choose Decorations</h3>
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
              <h4 className="font-bold text-white">{decoration.name}</h4>
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
      {/* Avatar Colors */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Avatar Color</h3>
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

      {/* Titles */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Choose Your Title</h3>
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
                <h4 className="font-bold text-white">{title.name}</h4>
                {!isUnlocked && <p className="text-xs text-slate-400 mt-1">{title.unlockXP} XP to unlock</p>}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default CustomizeSanctuaryModal;