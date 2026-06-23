import React from "react";
import { motion } from "framer-motion";
import useSanctuaryStore from "../store/useSanctuaryStore";
import { COMPANION_OPTIONS } from "../utils/sanctuary";

const Companion = () => {
  const { settings } = useSanctuaryStore();
  const companionData = COMPANION_OPTIONS.find((c) => c.id === settings?.companion);

  if (!companionData) return null;

  return (
    <motion.div
      className="fixed bottom-10 right-10 text-6xl z-40"
      animate={{
        y: [0, -10, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {companionData.emoji}
    </motion.div>
  );
};

export default Companion;