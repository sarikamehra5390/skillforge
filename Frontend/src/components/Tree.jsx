import React from "react";
import { motion } from "framer-motion";
import { useTree } from "../context/TreeContext";

const Tree = ({ size = "large", className = "" }) => {
  const { selectedTree, TREE_OPTIONS } = useTree();
  const treeData = TREE_OPTIONS.find((tree) => tree.id === selectedTree) || TREE_OPTIONS[0];

  // Size classes
  const sizeClasses = {
    small: "text-5xl",
    medium: "text-7xl",
    large: "text-9xl",
  };

  return (
    <motion.div
      className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <span className="animate-soft-float">{treeData.emoji}</span>
    </motion.div>
  );
};

export default Tree;
