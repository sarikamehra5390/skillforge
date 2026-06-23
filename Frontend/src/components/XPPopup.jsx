import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const XPPopup = ({ xp, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: 1, y: -100, scale: 1.2 }}
      exit={{ opacity: 0, y: -200, scale: 0.5 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
    >
      <div className="text-5xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-warm-amber to-primary-400 drop-shadow-2xl">
        +{xp} XP ✨
      </div>
    </motion.div>
  );
};

export default XPPopup;
