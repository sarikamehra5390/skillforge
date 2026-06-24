import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  getTreeStage, 
  calculateTreeData, 
  getCurrentSeason, 
  getEarnedFruits, 
  ACHIEVEMENTS 
} from '../utils/gamification';
import useSanctuaryStore from '../store/useSanctuaryStore';

const LivingTree = ({ user, skills, sessions, isWatering }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const { settings } = useSanctuaryStore();
  const treeStage = getTreeStage(user?.xp || 0);
  const season = getCurrentSeason();
  const level = user?.level || 1;
  const earnedFruits = getEarnedFruits(level);
  const unlockedAchievements = ACHIEVEMENTS.filter(a => (user?.xp || 0) >= a.xpRequired);
  const treeData = calculateTreeData(skills || [], sessions || [], unlockedAchievements);

  // Get tree type from sanctuary settings
  const selectedTreeType = settings?.treeType || 'sprout';
  const treeEmojis = {
    sprout: '🌱',
    classic: '🌳',
    sakura: '🌸',
    autumn: '🍁',
    winter: '❄️',
    cosmic: '🌌',
    golden: '✨'
  };

  return (
    <div className="relative w-full h-96 flex flex-col items-center justify-center">
      {/* Tree trunk and main structure */}
      <div className="relative">
        {/* Trunk */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1 }}
          className="w-8 bg-gradient-to-t from-amber-800 to-amber-600 rounded-full mx-auto"
          style={{ height: Math.max(60, treeStage.stage * 20) }}
        />

        {/* Tree crown based on stage */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute -top-24 left-1/2 -translate-x-1/2 flex flex-col items-center"
        >
          {/* Main tree emoji/visual */}
          <div className="text-8xl mb-4">
            {treeEmojis[selectedTreeType] || treeStage.emoji}
          </div>

          {/* Branches (skills) */}
          <div className="relative w-80 h-40">
            {treeData.branches.map((branch, index) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                style={{
                  position: 'absolute',
                  bottom: '50%',
                  left: '50%',
                  transformOrigin: 'bottom center',
                  transform: `rotate(${branch.angle}deg) translateX(-50%)`,
                  width: branch.branchLength,
                  height: 8
                }}
                className="bg-gradient-to-r from-amber-700 to-amber-500 rounded-full cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setSelectedBranch(branch)}
              />
            ))}
          </div>

          {/* Leaves (sessions) */}
          <div className="absolute inset-0">
            {treeData.leaves.slice(0, 100).map((leaf, index) => (
              <motion.div
                key={leaf.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.01 }}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${leaf.x}px)`,
                  top: `calc(50% + ${leaf.y}px)`
                }}
                className="text-xl"
              >
                {season.id === 'winter' ? '❄️' : '🍃'}
              </motion.div>
            ))}
          </div>

          {/* Flowers (achievements) */}
          <div className="absolute inset-0">
            {treeData.flowers.slice(0, 30).map((flower, index) => (
              <motion.div
                key={flower.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${flower.x}px)`,
                  top: `calc(50% + ${flower.y}px)`
                }}
                className="text-2xl"
              >
                🌸
              </motion.div>
            ))}
          </div>

          {/* Fruits (level milestones) */}
          <div className="absolute -top-12 flex gap-4">
            {earnedFruits.map((milestone, index) => (
              <motion.div
                key={milestone.level}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                className="text-2xl"
              >
                {milestone.fruit}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Watering animation */}
        {isWatering && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: [0, 1, 0], y: [-50, 20] }}
            transition={{ duration: 1, repeat: 2 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl"
          >
            💧
          </motion.div>
        )}

        {/* Tree glow */}
        <motion.div
          animate={{
            boxShadow: isWatering
              ? '0 0 60px 20px rgba(168, 85, 247, 0.4)'
              : '0 0 30px 10px rgba(168, 85, 247, 0.2)'
          }}
          transition={{ duration: 0.5 }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full"
        />
      </div>

      {/* Branch tooltip */}
      {selectedBranch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center"
        >
          <h3 className="text-lg font-bold text-white mb-2">{selectedBranch.name}</h3>
          <p className="text-sm text-slate-300">
            Total Time: {Math.floor(selectedBranch.totalMinutes / 60)}h {selectedBranch.totalMinutes % 60}m
          </p>
          <p className="text-sm text-slate-300">
            Sessions: {selectedBranch.totalSessions}
          </p>
          <button
            onClick={() => setSelectedBranch(null)}
            className="mt-2 px-3 py-1 bg-white/10 rounded-full text-sm text-white hover:bg-white/20"
          >
            Close
          </button>
        </motion.div>
      )}

      {/* Tree statistics */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-lg">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{treeData.branches.length}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Branches</div>
        </div>
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{treeData.leaves.length}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Leaves</div>
        </div>
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{treeData.flowers.length}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Flowers</div>
        </div>
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{earnedFruits.length}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Fruits</div>
        </div>
      </div>
    </div>
  );
};

export default LivingTree;