import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  getTreeStage,
  calculateTreeData,
  getCurrentSeason,
  getEarnedFruits,
  ACHIEVEMENTS,
} from "../utils/gamification";
import { useTree } from "../context/TreeContext";

const TREE_EMOJIS = {
  sprout: "🌱",
  classic: "🌳",
  sakura: "🌸",
  autumn: "🍁",
  winter: "❄️",
  cosmic: "🌌",
  golden: "✨",
};

const LivingTree = ({
  user,
  skills,
  sessions,
  isWatering,
}) => {
  const [selectedBranch, setSelectedBranch] =
    useState(null);

  const { selectedTree: selectedTreeType } = useTree();

  const xp = Number(user?.xp) || 0;
  const level = Number(user?.level) || 1;

  const safeSkills = Array.isArray(skills)
    ? skills
    : [];

  const safeSessions = Array.isArray(sessions)
    ? sessions
    : [];

  const treeStage = getTreeStage(xp);
  const season = getCurrentSeason();
  const earnedFruits = getEarnedFruits(level);

  const unlockedAchievements = useMemo(
    () =>
      ACHIEVEMENTS.filter(
        (achievement) =>
          xp >= achievement.xpRequired
      ),
    [xp]
  );

  const treeData = useMemo(
    () =>
      calculateTreeData(
        safeSkills,
        safeSessions,
        unlockedAchievements
      ),
    [safeSkills, safeSessions, unlockedAchievements]
  );

  const treeHeight = Math.max(
    60,
    Number(treeStage?.stage) * 20 || 60
  );

  const treeEmoji =
    TREE_EMOJIS[selectedTreeType] ||
    treeStage?.emoji ||
    TREE_EMOJIS.sprout;

  return (
    <div className="relative flex h-96 w-full flex-col items-center justify-center">
      {/* Tree trunk and main structure */}
      <div className="relative">
        {/* Trunk */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1 }}
          className="mx-auto w-8 rounded-full bg-gradient-to-t from-amber-800 to-amber-600"
          style={{
            height: treeHeight,
            transformOrigin: "bottom",
          }}
          aria-hidden="true"
        />

        {/* Tree crown based on stage */}
        <motion.div
          initial={{
            scale: 0,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            delay: 0.3,
          }}
          className="absolute -top-24 left-1/2 flex -translate-x-1/2 flex-col items-center"
        >
          {/* Main tree emoji / visual */}
          <div
            className="mb-4 text-8xl"
            role="img"
            aria-label={`${
              selectedTreeType || "current"
            } tree`}
          >
            {treeEmoji}
          </div>

          {/* Branches */}
          <div className="relative h-40 w-80">
            {treeData.branches.map(
              (branch, index) => (
                <motion.div
                  key={branch.id}
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: branch.angle,
                    x: "-50%",
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.5 + index * 0.1,
                  }}
                  style={{
                    position: "absolute",
                    bottom: "50%",
                    left: "50%",
                    transformOrigin:
                      "bottom center",
                    width: branch.branchLength,
                    height: 8,
                  }}
                  className="cursor-pointer rounded-full bg-gradient-to-r from-amber-700 to-amber-500 transition-transform hover:scale-110"
                  onClick={() =>
                    setSelectedBranch(branch)
                  }
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${branch.name} skill details`}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      setSelectedBranch(branch);
                    }
                  }}
                />
              )
            )}
          </div>

          {/* Leaves */}
          <div className="absolute inset-0">
            {treeData.leaves
              .slice(0, 100)
              .map((leaf, index) => (
                <motion.div
                  key={leaf.id}
                  initial={{
                    opacity: 0,
                    y: -20,
                  }}
                  animate={{
                    opacity: 0.8,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.8 + index * 0.01,
                  }}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${leaf.x}px)`,
                    top: `calc(50% + ${leaf.y}px)`,
                  }}
                  className="text-xl"
                  aria-hidden="true"
                >
                  {season?.id === "winter"
                    ? "❄️"
                    : "🍃"}
                </motion.div>
              ))}
          </div>

          {/* Flowers */}
          <div className="absolute inset-0">
            {treeData.flowers
              .slice(0, 30)
              .map((flower, index) => (
                <motion.div
                  key={flower.id}
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 1 + index * 0.1,
                  }}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${flower.x}px)`,
                    top: `calc(50% + ${flower.y}px)`,
                  }}
                  className="text-2xl"
                  aria-hidden="true"
                >
                  🌸
                </motion.div>
              ))}
          </div>

          {/* Fruits */}
          <div
            className="absolute -top-12 flex gap-4"
            aria-label={`${earnedFruits.length} earned fruits`}
          >
            {earnedFruits.map(
              (milestone, index) => (
                <motion.div
                  key={milestone.level}
                  initial={{
                    opacity: 0,
                    y: -20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 1.2 + index * 0.1,
                  }}
                  className="text-2xl"
                  role="img"
                  aria-label={`Fruit earned at level ${milestone.level}`}
                >
                  {milestone.fruit}
                </motion.div>
              )
            )}
          </div>
        </motion.div>

        {/* Watering animation */}
        {isWatering && (
          <motion.div
            initial={{
              opacity: 0,
              y: -50,
            }}
            animate={{
              opacity: [0, 1, 0],
              y: [-50, 20],
            }}
            transition={{
              duration: 1,
              repeat: 2,
            }}
            className="absolute left-1/2 top-0 -translate-x-1/2 text-4xl"
            aria-hidden="true"
          >
            💧
          </motion.div>
        )}

        {/* Tree glow */}
        <motion.div
          animate={{
            boxShadow: isWatering
              ? "0 0 60px 20px rgba(168, 85, 247, 0.4)"
              : "0 0 30px 10px rgba(168, 85, 247, 0.2)",
          }}
          transition={{ duration: 0.5 }}
          className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full"
          aria-hidden="true"
        />
      </div>

      {/* Branch tooltip */}
      {selectedBranch && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="absolute bottom-0 left-1/2 max-w-[90%] -translate-x-1/2 rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-lg"
          role="dialog"
          aria-label={`${selectedBranch.name} skill details`}
        >
          <h3 className="mb-2 text-lg font-bold text-white">
            {selectedBranch.name}
          </h3>

          <p className="text-sm text-slate-300">
            Total Time:{" "}
            {Math.floor(
              (Number(
                selectedBranch.totalMinutes
              ) || 0) / 60
            )}
            h{" "}
            {(Number(
              selectedBranch.totalMinutes
            ) || 0) % 60}
            m
          </p>

          <p className="text-sm text-slate-300">
            Sessions:{" "}
            {Number(
              selectedBranch.totalSessions
            ) || 0}
          </p>

          <button
            type="button"
            onClick={() => setSelectedBranch(null)}
            className="mt-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
          >
            Close
          </button>
        </motion.div>
      )}

      {/* Tree statistics */}
      <div className="mt-8 grid w-full max-w-lg grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur">
          <div className="text-2xl font-bold text-white">
            {treeData.branches.length}
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-400">
            Branches
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur">
          <div className="text-2xl font-bold text-white">
            {treeData.leaves.length}
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-400">
            Leaves
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur">
          <div className="text-2xl font-bold text-white">
            {treeData.flowers.length}
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-400">
            Flowers
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur">
          <div className="text-2xl font-bold text-white">
            {earnedFruits.length}
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-400">
            Fruits
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivingTree;