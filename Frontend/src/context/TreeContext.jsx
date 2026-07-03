import React, { createContext, useContext, useState, useEffect } from "react";
import { TREE_OPTIONS } from "../utils/sanctuary";
import { loadSanctuaryFromStorage } from "../utils/sanctuaryStorage";
import { toast } from "sonner";
import useSanctuaryStore from "../store/useSanctuaryStore";
import useAuthStore from "../store/useAuthStore";

const TreeContext = createContext();

export const TreeProvider = ({ children }) => {
  const { user } = useAuthStore();
  const { settings, updateSettings } = useSanctuaryStore();
  const [selectedTree, setSelectedTreeState] = useState("sprout");

  const unlockedTrees = TREE_OPTIONS.filter(
    (tree) => tree.unlockLevel <= (user?.level || 0)
  ).map((tree) => tree.id);

  useEffect(() => {
    if (user && user.level) {
      const storedUnlocked = localStorage.getItem("skillForgeUnlockedTrees") || "[]";
      let storedArray;
      try {
        storedArray = JSON.parse(storedUnlocked);
      } catch {
        storedArray = [];
      }

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

        localStorage.setItem("skillForgeUnlockedTrees", JSON.stringify(unlockedTrees));
      }
    }
  }, [user?.level]);

  useEffect(() => {
    const treeType =
      settings?.treeType ||
      user?.sanctuarySettings?.treeType ||
      loadSanctuaryFromStorage()?.treeType;

    if (treeType && unlockedTrees.includes(treeType)) {
      setSelectedTreeState(treeType);
    }
  }, [settings?.treeType, user?.sanctuarySettings?.treeType, unlockedTrees]);

  const selectTree = (treeId) => {
    if (!unlockedTrees.includes(treeId)) {
      return;
    }

    setSelectedTreeState(treeId);
    updateSettings({ treeType: treeId });
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
