import React, { createContext, useContext, useState, useEffect } from "react";
import { TREE_OPTIONS } from "../utils/sanctuary";
import { toast } from "sonner";
import useSanctuaryStore from "../store/useSanctuaryStore";
import useAuthStore from "../store/useAuthStore";

const TreeContext = createContext();

export const TreeProvider = ({ children }) => {
  const { user } = useAuthStore();
  const { settings, updateSettings, fetchSettings } = useSanctuaryStore();
  const [selectedTree, setSelectedTreeState] = useState("sprout");

  // Unlocked trees: all trees with unlock level <= user's current level
  const unlockedTrees = TREE_OPTIONS.filter(
    (tree) => tree.unlockLevel <= (user?.level || 0)
  ).map((tree) => tree.id);

  // Check if any new trees were unlocked and show toast
  useEffect(() => {
    if (user && user.level) {
      const storedUnlocked = localStorage.getItem("skillForgeUnlockedTrees") || "[]";
      let storedArray;
      try {
        storedArray = JSON.parse(storedUnlocked);
      } catch {
        storedArray = [];
      }

      // Find new unlocked trees not in storage
      const newlyUnlocked = unlockedTrees.filter(
        (treeId) => !storedArray.includes(treeId)
      );

      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach((treeId) => {
          const treeData = TREE_OPTIONS.find((t) => t.id === treeId);
          if (treeData) {
            toast.success(`${treeData.emoji} ${treeData.name} Unlocked!`, {
              duration: 5000,
              position: "top-center",
            });
          }
        });

        // Update stored unlocked trees
        localStorage.setItem("skillForgeUnlockedTrees", JSON.stringify(unlockedTrees));
      }
    }
  }, [user?.level]);

  // Load selected tree from localStorage or settings
  useEffect(() => {
    // Try loading from settings first
    if (settings?.treeType) {
      setSelectedTreeState(settings.treeType);
    } else {
      // Fallback to localStorage
      const stored = localStorage.getItem("skillForgeSelectedTree");
      if (stored && unlockedTrees.includes(stored)) {
        setSelectedTreeState(stored);
      }
    }
  }, [settings]);

  const selectTree = async (treeId) => {
    // Check if tree is unlocked
    if (!unlockedTrees.includes(treeId)) {
      return;
    }

    setSelectedTreeState(treeId);

    // Save to localStorage
    localStorage.setItem("skillForgeSelectedTree", treeId);

    // Save to MongoDB
    await updateSettings({ treeType: treeId });
  };

  return (
    <TreeContext.Provider
      value={{
        selectedTree,
        setSelectedTree: selectTree,
        unlockedTrees,
        TREE_OPTIONS,
        userLevel: user?.level || 0,
      }}
    >
      {children}
    </TreeContext.Provider>
  );
};

export const useTree = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("useTree must be used within a TreeProvider");
  }
  return context;
};
