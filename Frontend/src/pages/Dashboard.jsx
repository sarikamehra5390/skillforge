import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Target,
  Zap,
  BookOpen,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import useDashboardStore from "../store/useDashboardStore";
import useAuthStore from "../store/useAuthStore";
import useFriendsStore from "../store/useFriendsStore";
import useAppStore from "../store/useAppStore";

import RecentActivity from "../components/dashboard/RecentActivity";
import GlassCard from "../components/common/GlassCard";
import Button from "../components/common/Button";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import Badge from "../components/common/Badge";
import LivingTree from "../components/LivingTree";

import { Link, useNavigate } from "react-router-dom";
import { cn } from "../utils/cn";
import { calculateXPProgress, getUtcDayKey } from "../utils/gamification";

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);

  const stats = useDashboardStore(
    (state) => state.stats
  );
  const recentActivity = useDashboardStore(
    (state) => state.recentActivity
  );
  const loading = useDashboardStore(
    (state) => state.loading
  );
  const error = useDashboardStore(
    (state) => state.error
  );
  const fetchDashboardData = useDashboardStore(
    (state) => state.fetchDashboardData
  );
  const skills = useDashboardStore(
    (state) => state.skills
  );
  const sessions = useDashboardStore(
    (state) => state.sessions
  );

  const activityFeed = useFriendsStore(
    (state) => state.activityFeed
  );
  const fetchActivityFeed = useFriendsStore(
    (state) => state.fetchActivityFeed
  );

  const setShowCheckInModal = useAppStore(
    (state) => state.setShowCheckInModal
  );
  const checkMoodToday = useAppStore(
    (state) => state.checkMoodToday
  );

  const [isWatering, setIsWatering] = useState(false);
  const [checkedInToday, setCheckedInToday] =
    useState(false);

  const navigate = useNavigate();

  const safeSkills = Array.isArray(skills)
    ? skills
    : [];

  const safeSessions = Array.isArray(sessions)
    ? sessions
    : [];

  const safeActivityFeed = Array.isArray(activityFeed)
    ? activityFeed
    : [];

  const safeRecentActivity = Array.isArray(
    recentActivity
  )
    ? recentActivity
    : [];

  // ---------------------------------------------------------
  // Check today's mood
  // ---------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const result = await checkMoodToday();

        if (!isMounted) return;

        setCheckedInToday(
          Boolean(result?.hasCheckedInToday)
        );
      } catch (error) {
        console.error(
          "Failed to check today's mood:",
          error
        );

        if (isMounted) {
          setCheckedInToday(false);
        }
      }
    };

    if (user) {
      checkStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [user, checkMoodToday]);

  // ---------------------------------------------------------
  // Dashboard data
  // ---------------------------------------------------------

  useEffect(() => {
    fetchDashboardData();
    fetchActivityFeed();
  }, [fetchDashboardData, fetchActivityFeed]);

  // ---------------------------------------------------------
  // Cleanup watering animation
  // ---------------------------------------------------------

  useEffect(() => {
    if (!isWatering) return undefined;
    const timeout = window.setTimeout(() => setIsWatering(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [isWatering]);

  // ---------------------------------------------------------
  // XP Progress
  // ---------------------------------------------------------

  const xpProgress = user
    ? calculateXPProgress(Number(user.xp) || 0)
    : {
        currentLevel: 1,
        currentXP: 0,
        xpNeeded: 100,
        progressPercentage: 0,
      };

  // ---------------------------------------------------------
  // Greeting
  // ---------------------------------------------------------

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 5) {
      return "Still awake? The stars are watching";
    }

    if (hour < 12) {
      return "A beautiful morning for growth";
    }

    if (hour < 18) {
      return "The afternoon sun warms your path";
    }

    return "A peaceful evening to reflect";
  };

  const getGreetingTitle = () => {
    const hour = new Date().getHours();

    if (hour < 5) return "Still awake?";
    if (hour < 12) return "Good Morning,";
    if (hour < 18) return "Good Afternoon,";

    return "Good Evening,";
  };

  // ---------------------------------------------------------
  // Today's Progress
  // ---------------------------------------------------------

  const today = getUtcDayKey();

  const sessionsToday = safeSessions.filter(
    (session) => {
      if (!session?.completedAt) return false;

      const date = new Date(session.completedAt);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      return getUtcDayKey(date) === today;
    }
  );

  const hasSessionToday = sessionsToday.length > 0;

  const lastCheckIn = user?.lastCheckIn
      ? getUtcDayKey(user.lastCheckIn)
    : null;

  const lastCheckInDate =
    Number.isFinite(lastCheckIn) ? lastCheckIn : null;

  const checkedInMoodToday =
    checkedInToday ||
    lastCheckInDate === today;

  // ---------------------------------------------------------
  // Watering Animation
  // ---------------------------------------------------------

  const handleWaterTree = useCallback(() => {
    setIsWatering(true);
    setShowCheckInModal(true);
  }, [setShowCheckInModal]);

  // ---------------------------------------------------------
  // Daily Missions
  // ---------------------------------------------------------

  const missions = useMemo(() => [
    {
      id: 1,
      title: "Log a Practice Session",
      description:
        "Log any practice session today to nurture your skill branches",
      reward: "10 XP",
      icon: Target,
      color: "text-primary-400",
      completed: hasSessionToday,
      buttonLabel: "Log Practice",
      onClick: () => navigate("/sessions"),
    },
    {
      id: 2,
      title: "Water the Tree",
      description:
        "Check in with your mood today to keep your tree hydrated and happy",
      reward: "5 XP",
      icon: Sparkles,
      color: "text-warm-amber",
      completed: checkedInMoodToday,
      buttonLabel: "Water Tree",
      onClick: handleWaterTree,
    },
  ], [hasSessionToday, checkedInMoodToday, navigate, handleWaterTree]);

  // ---------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-12">
        <LoadingSkeleton className="h-64 w-full rounded-[3rem]" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton
              key={i}
              className="h-48 rounded-[2.5rem]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-24 relative">
      {/* Error State */}
      {error && (
        <GlassCard className="p-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
              <AlertCircle
                size={20}
                aria-hidden="true"
              />
            </div>

            <div className="flex-1">
              <p className="text-white font-bold">
                Couldn&apos;t load your sanctuary data
              </p>

              <p className="text-sm text-slate-400">
                {error}
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={fetchDashboardData}
            >
              Retry
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Tree of Mastery Hero */}
      <section className="relative overflow-hidden rounded-[3.5rem] border border-white/5 shadow-2xl group">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-forge-900/60 via-forge-950/40 to-forge-950" />

        <div className="relative grid items-center gap-8 px-6 py-8 sm:px-10 md:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)] md:gap-10 md:px-14 md:py-12 lg:px-16">
          <div className="relative z-10 order-2 mx-auto max-w-lg space-y-7 text-center md:order-1 md:mx-0 md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warm-amber/60 opacity-75" />

                  <span className="relative inline-flex rounded-full h-2 w-2 bg-warm-amber" />
                </span>

                <span className="text-[10px] font-bold tracking-[0.2em] text-warm-amber uppercase">
                  {getGreeting()}
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1] italic drop-shadow-lg">
                  {getGreetingTitle()}
                  <br />

                  <span className="text-3xl md:text-4xl">
                    {user?.username || "Gardener"}.
                  </span>
                </h1>

                <p className="text-lg text-slate-300 font-medium leading-relaxed drop-shadow-md">
                  The seeds you planted yesterday are
                  growing. Every drop of effort makes your
                  tree stronger.
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleWaterTree}
                  className="rounded-2xl px-8 py-4 shadow-xl shadow-warm-amber/20 bg-gradient-to-r from-warm-amber to-primary-400 hover:from-warm-amber/90 hover:to-primary-400/90 group/btn"
                >
                  <Plus
                    size={18}
                    className="mr-2 group-hover/btn:rotate-90 transition-transform duration-500"
                  />

                  Water Your Tree
                </Button>

                <Link to="/skills">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="rounded-2xl px-8 py-4 bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    <BookOpen
                      size={18}
                      className="mr-2"
                    />

                    Plant New Seeds
                  </Button>
                </Link>
              </div>
            </div>

          <div className="relative z-10 order-1 mx-auto w-full max-w-[min(100%,34rem)] md:order-2 md:max-w-none">
            <LivingTree user={user} skills={safeSkills} sessions={safeSessions} isWatering={isWatering} />
          </div>
        </div>

        {/* Atmospheric Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-warm-amber/5 rounded-full blur-[100px] animate-glow-pulse" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Daily Watering Tasks */}
          <section>
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-white italic">
                  Daily Watering
                </h3>

                <div className="h-[1px] w-12 bg-white/10" />
              </div>

              <Badge
                variant="default"
                className="bg-white/5 text-slate-500 border-none font-bold tracking-widest"
              >
                RESET AT MIDNIGHT
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {missions.map((mission) => (
                <GlassCard
                  key={mission.id}
                  className="p-10 group/card hover:bg-white/[0.04] transition-all duration-700 relative overflow-hidden"
                >
                  {mission.completed && (
                    <div
                      className="absolute top-6 right-6 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center z-10"
                      aria-label="Completed"
                    >
                      <span className="text-emerald-400 text-lg">
                        ✓
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-8">
                    <div
                      className={cn(
                        "p-5 rounded-3xl bg-white/5 group-hover/card:scale-110 transition-transform duration-700",
                        mission.color,
                        mission.completed &&
                          "opacity-50"
                      )}
                    >
                      <mission.icon
                        size={28}
                        aria-hidden="true"
                      />
                    </div>

                    <div
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase",
                        mission.completed
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-primary-500/10 text-primary-300"
                      )}
                    >
                      {mission.completed
                        ? "Claimed"
                        : mission.reward}
                    </div>
                  </div>

                  <h4
                    className={cn(
                      "text-xl font-bold mb-3 italic tracking-tight",
                      mission.completed
                        ? "text-slate-500 line-through"
                        : "text-white"
                    )}
                  >
                    {mission.title}
                  </h4>

                  <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">
                    {mission.description}
                  </p>

                  <button
                    type="button"
                    onClick={mission.onClick}
                    disabled={mission.completed}
                    className={cn(
                      "w-full px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300",
                      mission.completed
                        ? "bg-slate-500/10 text-slate-500 cursor-not-allowed border border-slate-500/10"
                        : "bg-gradient-to-r from-primary-500/20 to-warm-amber/20 text-white hover:from-primary-500/30 hover:to-warm-amber/30 border border-primary-400/20"
                    )}
                  >
                    {mission.completed
                      ? "Completed"
                      : mission.buttonLabel}
                  </button>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* Growth Journal */}
          <section>
            <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="text-2xl font-bold text-white italic">
                Growth Journal
              </h3>

              <Link
                to="/sessions"
                className="text-xs font-black text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-[0.2em]"
              >
                Open Journal
              </Link>
            </div>

            <RecentActivity
              activities={safeRecentActivity}
            />
          </section>

          {/* Community Activity */}
          {safeActivityFeed.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-8 px-4">
                <h3 className="text-2xl font-bold text-white italic">
                  Community Activity
                </h3>
              </div>

              <div className="space-y-4">
                {safeActivityFeed.map(
                  (activity, index) => {
                    const username =
                      activity?.userId?.username ||
                      "User";

                    const firstChar =
                      String(username)
                        .charAt(0)
                        .toUpperCase() || "?";

                    const activityDate =
                      activity?.createdAt
                        ? new Date(
                            activity.createdAt
                          )
                        : null;

                    const validDate =
                      activityDate &&
                      !Number.isNaN(
                        activityDate.getTime()
                      );

                    return (
                      <GlassCard
                        key={
                          activity?._id ||
                          `${activity?.createdAt || "activity"}-${index}`
                        }
                        className="p-6"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold italic shrink-0"
                            aria-hidden="true"
                          >
                            {firstChar}
                          </div>

                          <div className="min-w-0">
                            <p className="text-white font-medium">
                              {activity?.description ||
                                "Community activity"}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {validDate
                                ? activityDate.toLocaleDateString()
                                : "Recently"}
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    );
                  }
                )}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-12">
          {/* Tree Health Card */}
          <GlassCard className="p-10 bg-gradient-to-br from-warm-amber/10 via-transparent to-primary-500/10 border-warm-amber/20 animate-breathing">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-2 h-2 rounded-full bg-warm-amber" />

              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                Tree Health
              </h3>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-warm-amber border border-white/10 shadow-inner">
                  <Zap
                    size={40}
                    fill="currentColor"
                    className="animate-pulse"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                    Tree Age
                  </p>

                  <p className="text-4xl font-bold text-white italic tracking-tighter">
                    Lvl {xpProgress.currentLevel}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="text-slate-500">
                    Growth Progress
                  </span>

                  <span className="text-warm-amber">
                    {xpProgress.currentXP} /{" "}
                    {xpProgress.xpNeeded} XP
                  </span>
                </div>

                <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-warm-amber via-primary-400 to-warm-amber rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          Number(
                            xpProgress.progressPercentage
                          ) || 0
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">
                    Total Sunlight
                  </p>

                  <p className="text-xl font-bold text-white">
                    {(
                      Number(user?.xp) || 0
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">
                    Branches
                  </p>

                  <p className="text-xl font-bold text-white">
                    {stats?.totalSkills ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Tree Wisdom */}
          <div className="relative group">
            <div className="absolute inset-0 bg-warm-amber/10 blur-[60px] rounded-full group-hover:bg-warm-amber/20 transition-colors duration-1000" />

            <GlassCard className="p-10 relative bg-forge-900/40 border-white/5 overflow-hidden">
              <Sparkles
                className="absolute -top-6 -right-6 w-32 h-32 text-warm-amber/5 rotate-12"
                aria-hidden="true"
              />

              <p className="text-xl font-bold text-white italic leading-relaxed mb-8">
                &quot;A tree grows slowly, but its roots run
                deep. Consistency is the water that makes
                mastery bloom.&quot;
              </p>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-amber to-primary-400" />

                <div>
                  <p className="text-xs font-bold text-white">
                    The Forest Keeper
                  </p>

                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Tree Wisdom
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
