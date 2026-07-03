import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useSanctuaryStore from "../store/useSanctuaryStore";
import { COMPANION_OPTIONS } from "../utils/sanctuary";

const Companion = () => {
  const { settings } = useSanctuaryStore();
  const [isBlinking, setIsBlinking] = useState(false);
  const [position, setPosition] = useState({ x: -10, y: 0 });
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  const companionData = COMPANION_OPTIONS.find((c) => c.id === settings?.companion);

  // Blink animation trigger
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3000 + Math.random() * 2000); // Random interval 3-5s
    return () => clearInterval(blinkInterval);
  }, []);

  // Walking animation
  useEffect(() => {
    const walkInterval = setInterval(() => {
      setPosition((prev) => {
        let newX = prev.x + direction * 5;
        let newDir = direction;
        
        // Boundary check (keep within ~200px range)
        if (newX > 190) {
          newX = 190;
          newDir = -1;
        } else if (newX < -190) {
          newX = -190;
          newDir = 1;
        }
        
        setDirection(newDir);
        return { x: newX, y: 0 };
      });
    }, 100);
    return () => clearInterval(walkInterval);
  }, [direction]);

  if (!companionData) return null;

  return (
    <motion.div
      className="fixed bottom-10 left-1/2 -translate-x-1/2 text-6xl z-40"
      style={{ x: position.x }}
      animate={{
        y: [0, -5, 0], // Floating animation
        rotate: [0, 2, 0, -2, 0], // Idle swaying
        scale: isBlinking ? 0.95 : 1,
      }}
      transition={{
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
        scale: {
          duration: 0.1,
        },
      }}
    >
      <span style={{ transform: direction === -1 ? "scaleX(-1)" : "none", display: "inline-block" }}>
        {companionData.emoji}
      </span>
    </motion.div>
  );
};

export default Companion;