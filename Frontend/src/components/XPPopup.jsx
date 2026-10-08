import React, { useEffect } from "react";
import { motion } from "framer-motion";

const XPPopup = ({
  xp,
  onComplete,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete]);

  const displayXP = Number(xp) || 0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 0,
        scale: 0.5,
      }}
      animate={{
        opacity: 1,
        y: -100,
        scale: 1.2,
      }}
      exit={{
        opacity: 0,
        y: -200,
        scale: 0.5,
      }}
      transition={{
        duration: 1.5,
        ease: "easeOut",
      }}
      className="pointer-events-none fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform"
      role="status"
      aria-live="polite"
    >
      <div className="bg-gradient-to-r from-warm-amber to-primary-400 bg-clip-text text-5xl font-bold italic text-transparent drop-shadow-2xl">
        +{displayXP} XP ✨
      </div>
    </motion.div>
  );
};

export default XPPopup;