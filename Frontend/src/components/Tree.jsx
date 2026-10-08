import React from "react";
import { motion } from "framer-motion";
import { useTree } from "../context/TreeContext";

const Tree = ({
  size = "large",
  className = "",
}) => {
  const {
    selectedTree,
    TREE_OPTIONS,
  } = useTree();

  const safeTreeOptions = Array.isArray(
    TREE_OPTIONS
  )
    ? TREE_OPTIONS
    : [];

  const treeData =
    safeTreeOptions.find(
      (tree) => tree?.id === selectedTree
    ) || safeTreeOptions[0];

  const sizeClasses = {
    small: "text-5xl",
    medium: "text-7xl",
    large: "text-9xl",
  };

  const sizeClass =
    sizeClasses[size] || sizeClasses.large;

  // Graceful fallback if tree configuration
  // is temporarily unavailable.
  if (!treeData) {
    return (
      <motion.div
        className={`flex items-center justify-center ${sizeClass} ${className}`}
        initial={{
          scale: 0.8,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        aria-label="Tree"
      >
        <span
          className="animate-soft-float"
          aria-hidden="true"
        >
          🌱
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`flex items-center justify-center ${sizeClass} ${className}`}
      initial={{
        scale: 0.8,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      aria-label={`${treeData.name || "Selected"} tree`}
    >
      <span
        className="animate-soft-float"
        aria-hidden="true"
      >
        {treeData.emoji}
      </span>
    </motion.div>
  );
};

export default Tree;