import { useId, useMemo, useState } from "react";
import {
  ACHIEVEMENTS,
  calculateTreeData,
  getEarnedFruits,
  getTreeStage,
} from "../utils/gamification";
import { useTree } from "../context/useTree";
import useSanctuaryStore from "../store/useSanctuaryStore";

const EMPTY_LIST = [];
const TREE_GLOW = {
  sprout: "#9de4b5",
  classic: "#9fd5b0",
  sakura: "#f3add0",
  autumn: "#efb26c",
  winter: "#a4deee",
  cosmic: "#b2a0f2",
  golden: "#f1d17b",
};
const SKILL_MARKERS = [
  [131, 167], [157, 143], [185, 126], [217, 140], [248, 164], [280, 184],
  [145, 215], [177, 196], [211, 190], [245, 207], [267, 233], [163, 248],
];

const LivingTree = ({ user, skills, sessions, isWatering }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const { selectedTree: selectedTreeType = "sprout", treeAura = "none" } = useTree();
  const settings = useSanctuaryStore((state) => state.settings);
  const ambientEffects = settings?.ambientEffects !== false;
  const reducedMotion = Boolean(settings?.reducedMotion);
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const plantGlow = TREE_GLOW[selectedTreeType] || TREE_GLOW.sprout;
  const xp = Number(user?.xp) || 0;
  const level = Number(user?.level) || 1;
  const safeSkills = Array.isArray(skills) ? skills : EMPTY_LIST;
  const safeSessions = Array.isArray(sessions) ? sessions : EMPTY_LIST;
  const treeStage = getTreeStage(xp);
  const stage = Math.min(7, Math.max(1, Number(treeStage?.stage) || 1));
  const stageScale = [0.66, 0.74, 0.82, 0.9, 0.96, 1, 1.04][stage - 1];
  const earnedFruits = getEarnedFruits(level);

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((achievement) => xp >= achievement.xpRequired),
    [xp],
  );
  const treeData = useMemo(
    () => calculateTreeData(safeSkills, safeSessions, unlockedAchievements),
    [safeSkills, safeSessions, unlockedAchievements],
  );

  const descriptionId = `living-plant-description-${instanceId}`;
  const handleBranchKeyDown = (event, branch) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedBranch(branch);
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center">
      <div
        className={`living-tree-stage living-plant-stage ${ambientEffects ? "living-tree-effects" : ""} ${reducedMotion ? "living-tree-reduced-motion" : ""} ${isWatering ? "living-tree-watering" : ""}`}
        data-tree-type={selectedTreeType}
        data-growth-stage={stage}
        style={{ "--plant-scale": stageScale, "--plant-glow": plantGlow }}
        aria-describedby={descriptionId}
      >
        <span className="living-tree-glow" aria-hidden="true" />
        {ambientEffects && treeAura !== "none" && (
          <div className={`tree-aura tree-aura-${treeAura}`} aria-hidden="true">
            {treeAura === "celestial-glow" && <><span className="tree-aura-star tree-aura-star-one" /><span className="tree-aura-star tree-aura-star-two" /><span className="tree-aura-star tree-aura-star-three" /></>}
          </div>
        )}

        <span id={descriptionId} className="sr-only">{`${selectedTreeType} sanctuary plant at ${treeStage?.name || "growing"} stage ${stage}. Its progress reflects ${treeData.branches.length} skills, ${treeData.leaves.length} practice sessions, and ${treeData.flowers.length} earned achievements.`}</span>

        <div className="living-plant-content">
          <img
            className="living-plant-image"
            src="/images/skillforge-magical-plant.png"
            alt="Magical SkillForge plant with emerald leaves and lavender, pink, and gold blossoms"
            width="1679"
            height="937"
            decoding="async"
            fetchPriority="high"
          />
          <svg className="living-plant-progress" viewBox="0 0 420 440" preserveAspectRatio="none" aria-labelledby={`${descriptionId}-markers`}>
            <title id={`${descriptionId}-markers`}>Progress details on the magical plant</title>
            <g className="living-plant-session-leaves" aria-hidden="true">
              {treeData.leaves.slice(0, 20).map((leaf, index) => {
                const x = 210 + leaf.x * 0.66;
                const y = 192 + (leaf.y + 100) * 0.24;
                const angle = (index * 37) % 64 - 32;
                return <path key={leaf.id} d="M0 8 C-5 4 -5 -3 0 -10 C5 -3 5 4 0 8Z" transform={`translate(${x} ${y}) rotate(${angle})`} fill={index % 2 ? "#b4e4ad" : "#d9edb4"} opacity=".88" />;
              })}
            </g>
            <g aria-hidden="true">{treeData.flowers.slice(0, 8).map((flower, index) => {
              const x = 210 + flower.x * 0.42;
              const y = 268 + flower.y * 0.22;
              return <g key={flower.id} className="living-plant-earned-blossom" transform={`translate(${x} ${y})`}><circle r="5" fill={plantGlow} opacity=".3" /><path d="M0 -4 C2 -7 4 -5 3 -2 C6 -1 5 2 3 2 C3 5 0 5 -1 3 C-4 4 -5 1 -3 -1 C-4 -3 -2 -5 0 -4Z" fill={index % 2 ? "#f7d2e6" : "#e3d5ff"} /><circle r="1" fill="#fff5cf" /></g>;
            })}</g>
            {SKILL_MARKERS.slice(0, Math.min(treeData.branches.length, SKILL_MARKERS.length)).map(([x, y], index) => {
              const branch = treeData.branches[index];
              return (
                <g key={branch.id} className="living-tree-skill-branch" role="button" tabIndex={0} aria-label={`View ${branch.name} skill details`} onClick={() => setSelectedBranch(branch)} onKeyDown={(event) => handleBranchKeyDown(event, branch)}>
                  <circle cx={x} cy={y} r="11" className="living-tree-branch-hit-area" />
                  <circle cx={x} cy={y} r="3.1" fill={plantGlow} />
                </g>
              );
            })}
          </svg>
        </div>

        {ambientEffects && <div className="living-plant-fireflies" aria-hidden="true">{[[15, 43], [83, 34], [91, 62], [12, 67]].map(([x, y], index) => <span key={`${x}-${y}`} className={`living-plant-firefly living-plant-firefly-${index % 3}`} style={{ left: `${x}%`, top: `${y}%`, "--firefly-delay": `${index * -1.1}s` }} />)}</div>}
        {isWatering && <span className="living-plant-water-glint" aria-hidden="true" />}
      </div>

      {selectedBranch && (
        <div className="relative z-20 mt-3 w-full max-w-sm rounded-2xl border border-white/20 bg-[#201b38]/95 p-4 text-center shadow-xl backdrop-blur-lg" role="dialog" aria-label={`${selectedBranch.name} skill details`}>
          <h3 className="mb-2 text-lg font-bold text-white">{selectedBranch.name}</h3>
          <p className="text-sm text-slate-300">Total Time: {Math.floor((Number(selectedBranch.totalMinutes) || 0) / 60)}h {(Number(selectedBranch.totalMinutes) || 0) % 60}m</p>
          <p className="text-sm text-slate-300">Sessions: {Number(selectedBranch.totalSessions) || 0}</p>
          <button type="button" onClick={() => setSelectedBranch(null)} className="mt-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20">Close</button>
        </div>
      )}

      <div className="mt-3 grid w-full max-w-lg grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3" aria-label="Tree progress statistics">
        {[[treeData.branches.length, "Branches"], [treeData.leaves.length, "Leaves"], [treeData.flowers.length, "Flowers"], [earnedFruits.length, "Fruits"]].map(([count, label]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.055] px-2 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md sm:px-3">
            <div className="text-xl font-bold text-white sm:text-2xl">{count}</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-300 sm:text-xs sm:tracking-wider">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LivingTree;
