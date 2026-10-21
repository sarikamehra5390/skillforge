import {
  useEffect,
  useState,
} from "react";

import {
  Trophy,
  Lock,
  Star,
  Zap,
  Shield,
  Award,
  Target,
  Loader2,
  RefreshCw,
} from "lucide-react";

import GlassCard from "../components/common/GlassCard";
import Badge from "../components/common/Badge";
import Illustration from "../components/common/Illustration";

import useAuthStore from "../store/useAuthStore";
import api from "../api/axios";

import { cn } from "../utils/cn";
import { toast } from "sonner";

const RARITY_ICON = {
  Common: Star,
  Uncommon: Target,
  Rare: Award,
  Epic: Shield,
  Legendary: Trophy,
};

const RARITY_COLOR = {
  Common: {
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },

  Uncommon: {
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-500/20",
  },

  Rare: {
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-500/20",
  },

  Epic: {
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },

  Legendary: {
    color: "text-warm-amber",
    bg: "bg-warm-amber/10",
    border: "border-warm-amber/30",
  },
};

const DEFAULT_STATS = {
  totalSessions: 0,
  streak: 0,
  maxDuration: 0,
  totalSkills: 0,
  level: 1,
  totalXP: 0,
  longestStreak: 0,
  unlockedCount: 0,
  rarityCounts: {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  },
};

const Achievements = () => {
  const userId = useAuthStore(
    (state) =>
      state.user?._id || state.user?.id
  );

  const [loading, setLoading] =
    useState(() => Boolean(userId));

  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    if (!userId) return undefined;

    let active = true;
    const loadAchievements = async () => {
      try {
        const response = await api.get("/achievements");
        if (active) {
          setError(false);
          setData(response.data);
        }
      } catch (err) {
        if (active) {
          console.error("Failed to load achievements:", err);
          setError(true);
          toast.error("Failed to load your milestone archive");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAchievements();
    return () => {
      active = false;
    };
  }, [userId]);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    api.get("/achievements")
      .then((response) => setData(response.data))
      .catch((err) => {
        console.error("Failed to load achievements:", err);
        setError(true);
        toast.error("Failed to load your milestone archive");
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-24"
        role="status"
        aria-label="Loading achievements"
      >
        <Loader2
          size={36}
          className="animate-spin text-warm-amber"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Trophy
          className="mb-4 h-12 w-12 text-slate-600"
          aria-hidden="true"
        />

        <h2 className="mb-2 text-xl font-bold text-white">
          Couldn't load your milestones
        </h2>

        <p className="mb-6 text-sm text-slate-500">
          Something went wrong while
          loading your achievements.
        </p>

        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          <RefreshCw
            size={16}
            aria-hidden="true"
          />
          Try Again
        </button>
      </div>
    );
  }

  const stats = {
    ...DEFAULT_STATS,
    ...(data?.stats || {}),
    rarityCounts: {
      ...DEFAULT_STATS.rarityCounts,
      ...(data?.stats?.rarityCounts || {}),
    },
  };

  const achievements = Array.isArray(
    data?.achievements
  )
    ? data.achievements
    : [];

  const unlockedCount =
    achievements.filter(
      (achievement) =>
        achievement?.unlocked === true
    ).length;

  return (
    <div className="relative space-y-16 pb-24">
      {/* Hero */}
      <section className="group relative overflow-hidden rounded-[3.5rem] border border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-forge-900/60 to-forge-950/40" />

        {/* Desktop Hero */}
        <div className="hidden items-center gap-16 p-16 md:flex md:flex-row md:p-24">
          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-warm-amber/20 bg-warm-amber/10 px-5 py-2 backdrop-blur-md">
              <Trophy
                size={16}
                className="animate-pulse text-warm-amber"
                fill="currentColor"
                aria-hidden="true"
              />

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-warm-amber">
                Milestone Archive
              </span>
            </div>

            <h1 className="mb-8 text-5xl font-bold italic leading-[1.05] tracking-tight text-white md:text-7xl">
              Your tree is
              <br />
              <span className="bg-gradient-to-r from-warm-amber via-primary-400 to-warm-amber bg-clip-text text-transparent">
                blooming beautifully.
              </span>
            </h1>

            <p className="max-w-xl text-lg font-medium leading-relaxed text-slate-400 md:text-xl">
              You've earned{" "}
              <span className="font-black text-white">
                {unlockedCount} of{" "}
                {achievements.length}
              </span>{" "}
              blossoms. Every achievement is
              a golden fruit growing from your
              consistent care.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <GlassCard className="border-white/5 bg-white/[0.02] p-4 text-center">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Level
                </p>

                <p className="text-2xl font-bold italic text-white">
                  {stats.level}
                </p>
              </GlassCard>

              <GlassCard className="border-white/5 bg-white/[0.02] p-4 text-center">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Streak
                </p>

                <p className="text-2xl font-bold italic text-warm-amber">
                  🔥 {stats.streak}
                </p>
              </GlassCard>

              <GlassCard className="border-white/5 bg-white/[0.02] p-4 text-center">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Sessions
                </p>

                <p className="text-2xl font-bold italic text-white">
                  {stats.totalSessions}
                </p>
              </GlassCard>

              <GlassCard className="border-white/5 bg-white/[0.02] p-4 text-center">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  XP
                </p>

                <p className="text-2xl font-bold italic text-white">
                  {stats.totalXP}
                </p>
              </GlassCard>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-[350px] flex-shrink-0 md:max-w-[400px]">
            <Illustration
              name="constellationOfSkills"
              className="h-auto w-full opacity-90"
            />
          </div>
        </div>

        {/* Mobile Hero */}
        <div className="flex flex-col items-center space-y-8 p-4 sm:p-6 md:p-8 text-center md:hidden">
          <div className="relative w-full max-w-xs">
            <Illustration
              name="constellationOfSkills"
              className="h-auto w-full opacity-90"
            />
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-warm-amber/20 bg-warm-amber/10 px-4 py-2 backdrop-blur-md">
              <Trophy
                size={14}
                className="animate-pulse text-warm-amber"
                fill="currentColor"
                aria-hidden="true"
              />

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-warm-amber">
                Milestones
              </span>
            </div>

            <h1 className="text-3xl font-bold italic leading-[1.05] tracking-tight text-white">
              Your tree is{" "}
              <span className="bg-gradient-to-r from-warm-amber via-primary-400 to-warm-amber bg-clip-text text-transparent">
                blooming
              </span>
            </h1>

            <p className="mx-auto max-w-sm text-sm font-medium leading-relaxed text-slate-400">
              You've earned{" "}
              <span className="font-bold text-white">
                {unlockedCount} of{" "}
                {achievements.length}
              </span>{" "}
              blossoms.
            </p>
          </div>

          <div className="grid w-full grid-cols-4 gap-2">
            {[
              {
                label: "Lv",
                val: stats.level,
              },
              {
                label: "🔥",
                val: stats.streak,
              },
              {
                label: "📖",
                val: stats.totalSessions,
              },
              {
                label: "XP",
                val: stats.totalXP,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/5 bg-white/5 p-3 text-center"
              >
                <p className="mb-1 text-[9px] font-black uppercase text-slate-500">
                  {stat.label}
                </p>

                <p className="text-lg font-bold text-white">
                  {stat.val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Glow */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="animate-glow-pulse absolute right-1/4 top-1/2 h-96 w-96 rounded-full bg-warm-amber/5 blur-[120px]" />

          <div
            className="animate-glow-pulse absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-secondary-500/5 blur-[100px]"
            style={{
              animationDelay: "3s",
            }}
          />
        </div>
      </section>

      {/* Rarity Legend */}
      <div
        className="flex flex-wrap gap-3 px-2"
        aria-label="Achievement rarities"
      >
        {[
          "Common",
          "Uncommon",
          "Rare",
          "Epic",
          "Legendary",
        ].map((rarity) => {
          const colors =
            RARITY_COLOR[rarity] ||
            RARITY_COLOR.Common;

          return (
            <Badge
              key={rarity}
              variant="default"
              className={cn(
                "rounded-full border px-4 py-1.5 lowercase italic font-medium",
                colors.color,
                colors.bg,
                colors.border
              )}
            >
              {rarity}
            </Badge>
          );
        })}
      </div>

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => {
          const colors =
            RARITY_COLOR[
              achievement?.rarity
            ] ||
            RARITY_COLOR.Common;

          const Icon =
            RARITY_ICON[
              achievement?.rarity
            ] || Trophy;

          const isUnlocked =
            achievement?.unlocked === true;

          const achievementKey =
            achievement?.id ||
            achievement?._id ||
            achievement?.title;

          return (
            <GlassCard
              key={achievementKey}
              className={cn(
                "group relative overflow-hidden border-white/5 p-5 sm:p-8 md:p-10 transition-all duration-700",
                isUnlocked
                  ? "opacity-100 hover:border-primary-500/30"
                  : "opacity-40 grayscale blur-[1px] transition-all duration-500 hover:blur-none"
              )}
            >
              <div className="mb-10 flex items-start justify-between">
                <div
                  className={cn(
                    "relative flex h-20 w-20 items-center justify-center rounded-3xl shadow-2xl transition-all duration-1000 group-hover:rotate-3 group-hover:scale-110",
                    isUnlocked
                      ? `${colors.bg} ${colors.border} border`
                      : "border border-white/5 bg-white/5"
                  )}
                >
                  {isUnlocked ? (
                    <>
                      <div
                        className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                      />

                      <Icon
                        className={cn(
                          "relative z-10 h-10 w-10",
                          colors.color
                        )}
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <Lock
                      className="h-8 w-8 text-slate-700"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <Badge
                  variant="default"
                  className={cn(
                    "rounded-full border border-white/5 bg-white/5 px-4 py-1 text-[10px] lowercase italic tracking-widest",
                    colors.color
                  )}
                >
                  {achievement?.rarity ||
                    "Common"}
                </Badge>
              </div>

              <h3 className="mb-3 text-2xl font-bold tracking-tight text-white">
                {achievement?.title ||
                  "Untitled Achievement"}
              </h3>

              <p className="mb-10 min-h-[48px] text-sm font-medium leading-relaxed text-slate-500">
                {achievement?.description ||
                  "Keep practicing to unlock this milestone."}
              </p>

              <div className="flex items-center justify-between border-t border-white/5 pt-8">
                <div className="flex items-center gap-2 font-bold italic text-warm-amber">
                  <Zap
                    size={16}
                    fill="currentColor"
                    aria-hidden="true"
                  />

                  <span className="text-sm">
                    +{Number(
                      achievement?.xp
                    ) || 0}{" "}
                    XP
                  </span>
                </div>

                {isUnlocked ? (
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-soft-mint">
                    <div
                      className="h-1.5 w-1.5 rounded-full bg-soft-mint shadow-[0_0_8px_rgba(110,231,183,0.6)]"
                      aria-hidden="true"
                    />

                    Unlocked
                  </div>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    Awaiting...
                  </span>
                )}
              </div>

              {isUnlocked && (
                <div
                  className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-primary-500/5 opacity-0 blur-[60px] transition-opacity duration-1000 group-hover:opacity-100"
                  aria-hidden="true"
                />
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
