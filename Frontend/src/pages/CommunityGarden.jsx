import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sprout, Trees, Leaf, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useFriendsStore from "../store/useFriendsStore";
import useAuthStore from "../store/useAuthStore";

import GlassCard from "../components/common/GlassCard";
import Badge from "../components/common/Badge";

const GARDEN_STAGES = [
  { level: 1, name: "Tiny Garden", emoji: "🌱" },
  { level: 2, name: "Flower Field", emoji: "🌸" },
  { level: 3, name: "Sacred Grove", emoji: "🌲" },
  { level: 4, name: "Ancient Forest", emoji: "🌳" },
  { level: 5, name: "World Garden", emoji: "🌍" },
];

const XP_PER_LEVEL = 10000;

const CommunityGarden = () => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const friends = useFriendsStore((state) => state.friends);
  const fetchFriends = useFriendsStore(
    (state) => state.fetchFriends
  );

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const safeFriends = Array.isArray(friends) ? friends : [];

  // ---------------------------------------------------------
  // Calculate Community Garden XP
  // ---------------------------------------------------------

  const userXP = Number(user?.xp) || 0;

  const friendsXP = safeFriends.reduce(
    (total, friend) => {
      return total + (Number(friend?.xp) || 0);
    },
    0
  );

  const gardenXP = userXP + friendsXP;

  // ---------------------------------------------------------
  // Calculate Garden Level
  // ---------------------------------------------------------

  const gardenLevel = Math.min(
    Math.floor(gardenXP / XP_PER_LEVEL) + 1,
    GARDEN_STAGES.length
  );

  const currentStage =
    GARDEN_STAGES[gardenLevel - 1] ||
    GARDEN_STAGES[0];

  const isMaxLevel =
    gardenLevel === GARDEN_STAGES.length;

  const nextStage = isMaxLevel
    ? null
    : GARDEN_STAGES[gardenLevel];

  // ---------------------------------------------------------
  // Progress
  // ---------------------------------------------------------

  const xpInCurrentLevel = isMaxLevel
    ? XP_PER_LEVEL
    : gardenXP - (gardenLevel - 1) * XP_PER_LEVEL;

  const gardenProgress = isMaxLevel
    ? 100
    : Math.min(
        Math.max(
          (xpInCurrentLevel / XP_PER_LEVEL) * 100,
          0
        ),
        100
      );

  const xpNeededForNextStage =
    gardenLevel * XP_PER_LEVEL;

  const xpRemaining = Math.max(
    xpNeededForNextStage - gardenXP,
    0
  );

  // ---------------------------------------------------------
  // Empty State
  // ---------------------------------------------------------

  if (safeFriends.length === 0) {
    return (
      <div className="space-y-8 pb-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white italic mb-2">
            Community Garden
          </h1>

          <p className="text-slate-400">
            Grow together with your friends
          </p>
        </div>

        <GlassCard className="p-12 text-center">
          <Sprout
            size={64}
            className="mx-auto text-slate-500 mb-4"
            aria-hidden="true"
          />

          <h3 className="text-xl font-bold text-white mb-2">
            Invite your first friend
          </h3>

          <p className="text-slate-400 mb-6">
            Start growing your community garden together!
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => navigate("/friends")}
              className="px-6 py-3 bg-primary-500/20 text-primary-300 rounded-xl font-medium hover:bg-primary-500/30 transition-colors"
            >
              Find Friends
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white italic mb-2">
          Community Garden
        </h1>

        <p className="text-slate-400">
          Grow together with your friends
        </p>
      </div>

      {/* Garden Stage Display */}
      <GlassCard className="p-12 text-center">
        <motion.div
          key={gardenLevel}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="text-9xl mb-6"
            role="img"
            aria-label={currentStage.name}
          >
            {currentStage.emoji}
          </div>

          <h2 className="text-3xl font-bold text-white italic mb-2">
            {currentStage.name}
          </h2>

          <p className="text-slate-400 mb-8">
            Level {gardenLevel}
          </p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-4">
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>
                {gardenXP.toLocaleString()} XP
              </span>

              <span>
                {isMaxLevel
                  ? "MAX"
                  : `${xpNeededForNextStage.toLocaleString()} XP`}
              </span>
            </div>

            <div className="h-4 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${gardenProgress}%`,
                }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          <p className="text-sm text-slate-500">
            {isMaxLevel ? (
              "Maximum garden level reached 🌍"
            ) : (
              <>
                {xpRemaining.toLocaleString()} XP to{" "}
                {nextStage?.name}
              </>
            )}
          </p>
        </motion.div>
      </GlassCard>

      {/* Garden Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Gardeners */}
        <GlassCard className="p-6 text-center">
          <Users
            size={32}
            className="mx-auto text-primary-400 mb-2"
            aria-hidden="true"
          />

          <p className="text-2xl font-bold text-white">
            {safeFriends.length + 1}
          </p>

          <p className="text-sm text-slate-400 uppercase tracking-wide">
            Gardeners
          </p>
        </GlassCard>

        {/* Garden Level */}
        <GlassCard className="p-6 text-center">
          <Sprout
            size={32}
            className="mx-auto text-green-400 mb-2"
            aria-hidden="true"
          />

          <p className="text-2xl font-bold text-white">
            {gardenLevel}
          </p>

          <p className="text-sm text-slate-400 uppercase tracking-wide">
            Garden Level
          </p>
        </GlassCard>

        {/* Total XP */}
        <GlassCard className="p-6 text-center">
          <Trees
            size={32}
            className="mx-auto text-amber-400 mb-2"
            aria-hidden="true"
          />

          <p className="text-2xl font-bold text-white">
            {gardenXP.toLocaleString()}
          </p>

          <p className="text-sm text-slate-400 uppercase tracking-wide">
            Total XP
          </p>
        </GlassCard>

        {/* Seeds Planted */}
        <GlassCard className="p-6 text-center">
          <Leaf
            size={32}
            className="mx-auto text-pink-400 mb-2"
            aria-hidden="true"
          />

          <p className="text-2xl font-bold text-white">
            {Math.floor(gardenXP / 1000).toLocaleString()}
          </p>

          <p className="text-sm text-slate-400 uppercase tracking-wide">
            Seeds Planted
          </p>
        </GlassCard>
      </div>

      {/* Garden Members */}
      <section>
        <h3 className="text-xl font-bold text-white italic mb-4">
          Garden Members
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeFriends.map((friend) => {
            const username =
              String(friend?.username || "User").trim();

            const displayName =
              String(
                friend?.displayName || username
              ).trim();

            const friendXP = Number(friend?.xp) || 0;
            const friendLevel =
              Number(friend?.level) || 1;

            const avatarLetter =
              username.charAt(0).toUpperCase() || "U";

            return (
              <GlassCard
                key={friend?._id || username}
                className="p-6"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold italic shrink-0"
                    aria-hidden="true"
                  >
                    {avatarLetter}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate">
                      {displayName}
                    </h4>

                    <p className="text-sm text-slate-400">
                      Level {friendLevel}
                    </p>
                  </div>

                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    {friendXP.toLocaleString()} XP
                  </Badge>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default CommunityGarden;
