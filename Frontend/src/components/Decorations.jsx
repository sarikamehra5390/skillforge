import React from "react";
import { motion } from "framer-motion";
import useSanctuaryStore from "../store/useSanctuaryStore";

const Decorations = () => {
  const { settings } = useSanctuaryStore();
  const activeDecorations = settings?.decorations || [];

  // Define decoration positions
  const decorationConfig = {
    lanterns: {
      emoji: "🏮",
      position: "top-20 left-20",
      animation: { y: [0, -5, 0], rotate: [0, 3, 0, -3, 0] },
      duration: 2,
    },
    flowers: {
      emoji: "🌸",
      position: "bottom-20 left-1/4",
      animation: { y: [0, -3, 0] },
      duration: 1.5,
    },
    butterflies: {
      emoji: "🦋",
      position: "top-1/4 right-20",
      animation: { y: [0, -15, 0], x: [0, 20, 0], rotate: [0, 5, 0, -5, 0] },
      duration: 3,
    },
    bridge: {
      emoji: "🌉",
      position: "bottom-32 right-1/4",
      animation: {},
    },
    campfire: {
      emoji: "🔥",
      position: "bottom-24 left-1/3",
      animation: { scale: [1, 1.1, 1] },
      duration: 0.8,
    },
    bench: {
      emoji: "🪑",
      position: "bottom-28 right-1/3",
      animation: {},
    },
    crystals: {
      emoji: "💎",
      position: "top-32 left-1/3",
      animation: { scale: [1, 1.05, 1], rotate: [0, 2, 0, -2, 0] },
      duration: 2.5,
    },
    "wind-chimes": {
      emoji: "🎐",
      position: "top-16 right-1/3",
      animation: { rotate: [0, 10, 0, -10, 0] },
      duration: 1.8,
    },
    waterfall: {
      emoji: "💧",
      position: "top-1/3 left-20",
      animation: { y: [0, 30, 0] },
      duration: 1.2,
    },
    "stone-path": {
      emoji: "🪨",
      position: "bottom-16 left-1/2 -translate-x-1/2",
      animation: {},
    },
  };

  return (
    <>
      {activeDecorations.map((decorationId) => {
        const config = decorationConfig[decorationId];
        if (!config) return null;

        return (
          <motion.div
            key={decorationId}
            className={`fixed text-5xl z-30 ${config.position}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              ...config.animation,
            }}
            transition={{
              duration: 0.3,
              ...(config.duration && {
                ...Object.keys(config.animation).reduce((acc, key) => {
                  acc[key] = {
                    duration: config.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  };
                  return acc;
                }, {}),
              }),
            }}
          >
            {config.emoji}
          </motion.div>
        );
      })}
    </>
  );
};

export default Decorations;
