import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { TREE_OPTIONS } from "../utils/sanctuary";
import { loadSanctuaryFromStorage } from "../utils/sanctuaryStorage";
import { toast } from "sonner";
import useSanctuaryStore from "../store/useSanctuaryStore";
import useAuthStore from "../store/useAuthStore";

const TreeContext = createContext(null);

export const TreeProvider = ({ children }) => {
  const { user } = useAuthStore();
  const { settings, updateSettings } = useSanctuaryStore();

  const [selectedTree, setSelectedTreeState] = useState("sprout");

  const userLevel = user?.level || 0;

  const unlockedTrees = useMemo(
    () =>
      TREE_OPTIONS
        .filter((tree) => tree.unlockLevel <= userLevel)
        .map((tree) => tree.id),
    [userLevel]
  );

  // Show notifications for newly unlocked trees
  useEffect(() => {
    if (!user) return;

    const storedUnlocked =
      localStorage.getItem("skillForgeUnlockedTrees") || "[]";

    let storedArray;

    try {
      storedArray = JSON.parse(storedUnlocked);

      if (!Array.isArray(storedArray)) {
        storedArray = [];
      }
    } catch {
      storedArray = [];
    }

    const newlyUnlocked = unlockedTrees.filter(
      (treeId) => !storedArray.includes(treeId)
    );

    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach((treeId) => {
        const treeData = TREE_OPTIONS.find(
          (tree) => tree.id === treeId
        );

        if (treeData) {
          toast.success(
            `${treeData.emoji} ${treeData.name} Unlocked!`,
            {
              duration: 5000,
              position: "top-center",
            }
          );
        }
      });
    }

    // Keep localStorage synchronized with currently unlocked trees
    localStorage.setItem(
      "skillForgeUnlockedTrees",
      JSON.stringify(unlockedTrees)
    );
  }, [user, unlockedTrees]);

  // Restore selected tree from settings/storage
  useEffect(() => {
    const storedTree = loadSanctuaryFromStorage()?.treeType;

    const treeType =
      settings?.treeType ||
      user?.sanctuarySettings?.treeType ||
      storedTree;

    if (treeType && unlockedTrees.includes(treeType)) {
      setSelectedTreeState(treeType);
      return;
    }

    // Fallback to the first unlocked tree
    if (unlockedTrees.length > 0) {
      setSelectedTreeState(unlockedTrees[0]);
    }
  }, [
    settings?.treeType,
    user?.sanctuarySettings?.treeType,
    unlockedTrees,
  ]);

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
        userLevel,
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

export default TreeContext;