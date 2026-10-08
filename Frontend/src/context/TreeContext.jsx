import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import { TREE_OPTIONS } from "../utils/sanctuary";
import {
  loadSanctuaryFromStorage,
} from "../utils/sanctuaryStorage";

import useSanctuaryStore from "../store/useSanctuaryStore";
import useAuthStore from "../store/useAuthStore";

const TreeContext = createContext(null);

const UNLOCKED_TREES_STORAGE_KEY =
  "skillForgeUnlockedTrees";

export const TreeProvider = ({
  children,
}) => {
  const user = useAuthStore(
    (state) => state.user
  );

  const settings = useSanctuaryStore(
    (state) => state.settings
  );

  const updateSettings = useSanctuaryStore(
    (state) => state.updateSettings
  );

  const [selectedTree, setSelectedTreeState] =
    useState("sprout");

  const userLevel =
    Number(user?.level) || 1;

  const unlockedTrees = useMemo(() => {
    return TREE_OPTIONS
      .filter(
        (tree) =>
          Number(tree?.unlockLevel) <=
          userLevel
      )
      .map((tree) => tree.id);
  }, [userLevel]);

  // Show notifications for newly unlocked trees
  useEffect(() => {
    if (
      !user ||
      typeof window === "undefined"
    ) {
      return;
    }

    let storedArray = [];

    try {
      const storedUnlocked =
        localStorage.getItem(
          UNLOCKED_TREES_STORAGE_KEY
        );

      if (storedUnlocked) {
        const parsed =
          JSON.parse(storedUnlocked);

        if (Array.isArray(parsed)) {
          storedArray = parsed;
        }
      }
    } catch (error) {
      console.warn(
        "Failed to read unlocked tree history:",
        error
      );
    }

    const newlyUnlocked =
      unlockedTrees.filter(
        (treeId) =>
          !storedArray.includes(treeId)
      );

    newlyUnlocked.forEach((treeId) => {
      const treeData =
        TREE_OPTIONS.find(
          (tree) => tree.id === treeId
        );

      if (!treeData) {
        return;
      }

      toast.success(
        `${treeData.emoji} ${treeData.name} Unlocked!`,
        {
          duration: 5000,
          position: "top-center",
        }
      );
    });

    try {
      localStorage.setItem(
        UNLOCKED_TREES_STORAGE_KEY,
        JSON.stringify(unlockedTrees)
      );
    } catch (error) {
      console.warn(
        "Failed to save unlocked tree history:",
        error
      );
    }
  }, [user, unlockedTrees]);

  // Restore selected tree from settings/storage
  useEffect(() => {
    const storedTree =
      typeof window !== "undefined"
        ? loadSanctuaryFromStorage()?.treeType
        : null;

    const treeType =
      settings?.treeType ||
      user?.sanctuarySettings?.treeType ||
      storedTree;

    if (
      treeType &&
      unlockedTrees.includes(treeType)
    ) {
      setSelectedTreeState(treeType);
      return;
    }

    // Fallback to the first unlocked tree
    if (unlockedTrees.length > 0) {
      setSelectedTreeState(
        unlockedTrees[0]
      );
    }
  }, [
    settings?.treeType,
    user?.sanctuarySettings?.treeType,
    unlockedTrees,
  ]);

  const selectTree = (treeId) => {
    if (
      !unlockedTrees.includes(treeId)
    ) {
      return;
    }

    setSelectedTreeState(treeId);

    updateSettings({
      treeType: treeId,
    });
  };

  return (
    <TreeContext.Provider
      value={{
        selectedTree,
        setSelectedTree: selectTree,
        unlockedTrees,
        TREE_OPTIONS,
        userLevel,
      }}
    >
      {children}
    </TreeContext.Provider>
  );
};

export const useTree = () => {
  const context =
    useContext(TreeContext);

  if (!context) {
    throw new Error(
      "useTree must be used within a TreeProvider"
    );
  }

  return context;
};

export default TreeContext;