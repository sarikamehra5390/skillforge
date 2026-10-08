import React, { useEffect, useState } from "react";
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
import useAuthStore from "../store/useAuthStore";
import api from "../api/axios";
import { cn } from "../utils/cn";
import Illustration from "../components/common/Illustration";
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

const Achievements = () => {
  const userId = useAuthStore(
    (state) => state.user?._id || state.user?.id
  );

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await api.get("/achievements");

      setData(res.data);
    } catch (err) {
      console.error("Failed to load achievements:", err);
      setError(true);

      toast.error("Failed to load your milestone archive");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2
          size={36}
          className="animate-spin text-warm-amber"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Trophy className="w-12 h-12 text-slate-600 mb-4" />

        <h2 className="text-xl font-bold text-white mb-2">
          Couldn't load your milestones
        </h2>

        <p className="text-sm text-slate-500 mb-6">
          Something went wrong while loading your achievements.
        </p>

        <button
          type="button"
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  const stats = data?.stats || {
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

  const achievements = Array.isArray(data?.achievements)
    ? data.achievements
    : [];

  const unlockedCount = achievements.filter(
    (achievement) => achievement?.unlocked === true
  ).length;

  return (
    <div className="space-y-16 pb-24 relative">
      <section className="relative overflow-hidden rounded-[3.5rem] border border-white/5 shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-br from-forge-900/60 to-forge-950/40" />

        {/* Desktop Hero */}
        <div className="hidden md:flex flex-col md:flex-row items-center gap-16 p-16 md:p-24">
          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full bg-warm-amber/10 border border-warm-amber/20 backdrop-blur-md">
              <Trophy
                size={16}
                className="text-warm-amber animate-pulse"
                fill="currentColor"
              />

              <span className="text-[10px] font-black tracking-[0.2em] text-warm-amber uppercase">
                Milestone Archive
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.05] italic">
              Your tree is
              <br />

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-amber via-primary-400 to-warm-amber">
                blooming beautifully.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
              You've earned{" "}
              <span className="text-white font-black">
                {unlockedCount} of {achievements.length}
              </span>{" "}
              blossoms. Every achievement is a golden fruit growing from your
              consistent care.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
              <GlassCard className="p-4 text-center bg-white/[0.02] border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                  Level
                </p>

                <p className="text-2xl font-bold text-white italic">
                  {stats.level}
                </p>
              </GlassCard>

              <GlassCard className="p-4 text-center bg-white/[0.02] border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                  Streak
                </p>

                <p className="text-2xl font-bold text-warm-amber italic">
                  🔥 {stats.streak}
                </p>
              </GlassCard>

              <GlassCard className="p-4 text-center bg-white/[0.02] border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                  Sessions
                </p>

                <p className="text-2xl font-bold text-white italic">
                  {stats.totalSessions}
                </p>
              </GlassCard>

              <GlassCard className="p-4 text-center bg-white/[0.02] border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                  XP
                </p>

                <p className="text-2xl font-bold text-white italic">
                  {stats.totalXP}
                </p>
              </GlassCard>
            </div>
          </div>

          <div className="relative z-10 flex-shrink-0 w-full max-w-[350px] md:max-w-[400px]">
            <Illustration
              name="constellationOfSkills"
              className="w-full h-auto opacity-90"
            />
          </div>
        </div>

        {/* Mobile Hero */}
        <div className="md:hidden flex flex-col items-center p-8 text-center space-y-8">
          <div className="relative w-full max-w-xs">
            <Illustration
              name="constellationOfSkills"
              className="w-full h-auto opacity-90"
            />
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-amber/10 border border-warm-amber/20 backdrop-blur-md">
              <Trophy
                size={14}
                className="text-warm-amber animate-pulse"
                fill="currentColor"
              />

              <span className="text-[10px] font-black tracking-[0.2em] text-warm-amber uppercase">
                Milestones
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white leading-[1.05] italic">
              Your tree is{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-amber via-primary-400 to-warm-amber">
                blooming
              </span>
            </h1>

            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
              You've earned{" "}
              <span className="text-white font-bold">
                {unlockedCount} of {achievements.length}
              </span>{" "}
              blossoms.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 w-full">
            {[
              { label: "Lv", val: stats.level },
              { label: "🔥", val: stats.streak },
              { label: "📖", val: stats.totalSessions },
              { label: "XP", val: stats.totalXP },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center"
              >
                <p className="text-[9px] font-black uppercase text-slate-500 mb-1">
                  {stat.label}
                </p>

                <p className="text-lg font-bold text-white">
                  {stat.val}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-warm-amber/5 rounded-full blur-[120px] animate-glow-pulse" />

          <div
            className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-secondary-500/5 rounded-full blur-[100px] animate-glow-pulse"
            style={{ animationDelay: "3s" }}
          />
        </div>
      </section>

      {/* Rarity filters / legend */}
      <div className="flex flex-wrap gap-3 px-2">
        {["Common", "Uncommon", "Rare", "Epic", "Legendary"].map(
          (rarity) => {
            const c = RARITY_COLOR[rarity];

            return (
              <Badge
                key={rarity}
                variant="default"
                className={cn(
                  "px-4 py-1.5 rounded-full lowercase italic font-medium border",
                  c.color,
                  c.bg,
                  c.border
                )}
              >
                {rarity}
              </Badge>
            );
          }
        )}
      </div>

      {/* Achievement cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {achievements.map((achievement) => {
          const colors =
            RARITY_COLOR[achievement.rarity] ||
            RARITY_COLOR.Common;

          const Icon =
            RARITY_ICON[achievement.rarity] || Trophy;

          const isUnlocked = achievement.unlocked === true;

          return (
            <GlassCard
              key={achievement.id || achievement._id}
              className={cn(
                "p-10 transition-all duration-700 group relative overflow-hidden border-white/5",
                isUnlocked
                  ? "opacity-100 hover:border-primary-500/30"
                  : "opacity-40 grayscale blur-[1px] hover:blur-none transition-all duration-500"
              )}
            >
              <div className="flex items-start justify-between mb-10">
                <div
                  className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-1000 group-hover:scale-110 group-hover:rotate-3 shadow-2xl relative",
                    isUnlocked
                      ? `${colors.bg} ${colors.border} border`
                      : "bg-white/5 border border-white/5"
                  )}
                >
                  {isUnlocked ? (
                    <>
                      <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                      <Icon
                        className={cn(
                          "w-10 h-10 relative z-10",
                          colors.color
                        )}
                      />
                    </>
                  ) : (
                    <Lock className="w-8 h-8 text-slate-700" />
                  )}
                </div>

                <Badge
                  variant="default"
                  className={cn(
                    "rounded-full px-4 py-1 bg-white/5 border text-[10px] tracking-widest lowercase italic border-white/5",
                    colors.color
                  )}
                >
                  {achievement.rarity}
                </Badge>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                {achievement.title}
              </h3>

              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 min-h-[48px]">
                {achievement.description}
              </p>

              <div className="flex items-center justify-between pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 text-warm-amber font-bold italic">
                  <Zap size={16} fill="currentColor" />

                  <span className="text-sm">
                    +{achievement.xp} XP
                  </span>
                </div>

                {isUnlocked ? (
                  <div className="flex items-center gap-2 text-soft-mint font-bold text-xs uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-soft-mint shadow-[0_0_8px_rgba(110,231,183,0.6)]" />
                    Unlocked
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    Awaiting...
                  </span>
                )}
              </div>

              {isUnlocked && (
                <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-primary-500/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;