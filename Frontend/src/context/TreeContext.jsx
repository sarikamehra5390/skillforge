import {
  useEffect,
  useMemo,
} from "react";
import { toast } from "sonner";

import { TREE_OPTIONS } from "../utils/sanctuary";
import useSanctuaryStore from "../store/useSanctuaryStore";
import useAuthStore from "../store/useAuthStore";
import TreeContext from "./TreeContextValue";

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

  const configuredTree =
    settings?.treeType ||
    user?.sanctuarySettings?.treeType;
  const selectedTree = unlockedTrees.includes(configuredTree)
    ? configuredTree
    : unlockedTrees[0] || "sprout";

  const selectTree = (treeId) => {
    if (
      !unlockedTrees.includes(treeId)
    ) {
      return;
    }

    updateSettings({
      treeType: treeId,
    });
  };

  return (
    <TreeContext.Provider
      value={{
        selectedTree,
        treeAura: settings?.treeAura || "none",
        setSelectedTree: selectTree,
        setTreeAura: (treeAura) => {
          if (["none", "soft-glow", "magical-glow", "celestial-glow"].includes(treeAura)) {
            updateSettings({ treeAura });
          }
        },
        unlockedTrees,
        TREE_OPTIONS,
        userLevel,
      }}
    >
      {children}
    </TreeContext.Provider>
  );
};
