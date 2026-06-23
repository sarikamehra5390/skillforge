import React, { useEffect } from 'react';
import {
  Plus,
  Trophy,
  Target,
  Flame,
  Zap,
  Clock,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import useDashboardStore from '../store/useDashboardStore';
import useAuthStore from '../store/useAuthStore';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Badge from '../components/common/Badge';
import Illustration from '../components/common/Illustration';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';
import { getTreeStage, calculateXPProgress } from '../utils/gamification';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { stats, recentActivity, loading, fetchDashboardData } = useDashboardStore();

  const treeStage = user ? getTreeStage(user.xp) : { name: "Seed", emoji: "🌱" };
  const xpProgress = user ? calculateXPProgress(user.xp) : { currentLevel: 1, currentXP: 0, xpNeeded: 100, progressPercentage: 0 };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Still awake? The stars are watching";
    if (hour < 12) return "A beautiful morning for growth";
    if (hour < 18) return "The afternoon sun warms your path";
    return "A peaceful evening to reflect";
  };

  const missions = [
    { id: 1, title: "Morning Watering", description: "Dedicate 20 minutes to nourish any of your skill branches", reward: "50 XP", icon: Target, color: "text-primary-400" },
    { id: 2, title: "Journal Entry", description: "Reflect on your growth by recording today's moments in your journal", reward: "100 XP", icon: Sparkles, color: "text-warm-amber" },
  ];

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="h-64 w-full bg-white/[0.02] rounded-[3rem] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/[0.02] rounded-[2.5rem] animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-24 relative">
      {/* Tree of Mastery Hero */}
      <section className="relative overflow-hidden rounded-[3.5rem] border border-white/5 shadow-2xl group">
        {/* Background Gradient for mobile fallback */}
        <div className="absolute inset-0 bg-gradient-to-b from-forge-900/60 via-forge-950/40 to-forge-950" />
        
        {/* Tree Illustration (visible md+) */}
        <div className="relative hidden md:block">
          <Illustration name="treeOfMastery" className="w-full h-auto" />
          
          {/* Overlay Content */}
          <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between p-16 md:p-24">
            {/* Left: Greeting & Text */}
            <div className="relative z-10 max-w-lg space-y-8 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warm-amber/60 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-warm-amber"></span>
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-warm-amber uppercase">{getGreeting()}</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1] italic drop-shadow-lg">
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour < 5) return "Still awake?";
                    if (hour < 12) return "Good Morning,";
                    if (hour < 18) return "Good Afternoon,";
                    return "Good Evening,";
                  })()}<br />
                  <span className="text-3xl md:text-4xl">{user?.username}.</span>
                </h1>
                
                <p className="text-lg text-slate-300 font-medium leading-relaxed drop-shadow-md">
                  The seeds you planted yesterday are growing. 
                  Every drop of effort makes your tree stronger.
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                <Link to="/sessions">
                  <Button size="lg" className="rounded-2xl px-8 py-4 shadow-xl shadow-warm-amber/20 bg-gradient-to-r from-warm-amber to-primary-400 hover:from-warm-amber/90 hover:to-primary-400/90 group/btn">
                    <Plus size={18} className="mr-2 group-hover/btn:rotate-90 transition-transform duration-500" />
                    Water Your Tree
                  </Button>
                </Link>
                <Link to="/skills">
                  <Button size="lg" variant="outline" className="rounded-2xl px-8 py-4 bg-white/5 border-white/10 hover:bg-white/10">
                    <BookOpen size={18} className="mr-2" />
                    Plant New Seeds
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Growth Stage Card */}
            <div className="relative z-10 mt-12 md:mt-0">
              <GlassCard className="p-8 md:p-10 bg-forge-950/60 backdrop-blur-xl border-warm-amber/20 shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-700">
                <div className="flex items-center gap-6">
                  <div className="w-20 md:w-24 h-20 md:h-24 rounded-[2.5rem] bg-gradient-to-br from-warm-amber to-primary-400 flex items-center justify-center text-4xl md:text-5xl shadow-lg">
                    {treeStage.emoji}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Growth Stage</p>
                    <p className="text-2xl md:text-3xl font-bold text-white italic tracking-tight">{treeStage.name}</p>
                    <p className="text-sm text-slate-400 mt-1">{stats.totalSkills} branches, {stats.totalSessions} waterings</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>

        {/* Mobile Hero Layout */}
        <div className="md:hidden flex flex-col items-center p-8 text-center space-y-8">
          <div className="relative w-full max-w-xs">
            <Illustration name="growthTree" className="w-full h-auto opacity-90" />
          </div>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warm-amber/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-warm-amber"></span>
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-warm-amber uppercase">{getGreeting()}</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-white leading-[1.1] italic">
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 5) return "Still awake?";
                  if (hour < 12) return "Good Morning,";
                  if (hour < 18) return "Good Afternoon,";
                  return "Good Evening,";
                })()}<br />
                <span className="text-2xl">{user?.username}.</span>
              </h1>
              <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-sm mx-auto">
                The seeds you planted yesterday are growing. 
                Every drop of effort makes your tree stronger.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <Link to="/sessions" className="w-full">
                <Button size="lg" className="w-full rounded-2xl px-6 py-4 shadow-xl shadow-warm-amber/20 bg-gradient-to-r from-warm-amber to-primary-400">
                  <Plus size={18} className="mr-2" />
                  Water Your Tree
                </Button>
              </Link>
              <Link to="/skills" className="w-full">
                <Button size="lg" variant="outline" className="w-full rounded-2xl px-6 py-4 bg-white/5 border-white/10">
                  <BookOpen size={18} className="mr-2" />
                  Plant New Seeds
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Atmospheric Glows - keep it subtle */}
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
                <h3 className="text-2xl font-bold text-white italic">Daily Watering</h3>
                <div className="h-[1px] w-12 bg-white/10" />
              </div>
              <Badge variant="default" className="bg-white/5 text-slate-500 border-none font-bold tracking-widest">RESET AT MIDNIGHT</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {missions.map(mission => (
                <GlassCard key={mission.id} className="p-10 group/card hover:bg-white/[0.04] transition-all duration-700">
                  <div className="flex items-start justify-between mb-8">
                    <div className={cn("p-5 rounded-3xl bg-white/5 group-hover/card:scale-110 transition-transform duration-700", mission.color)}>
                      <mission.icon size={28} />
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-300 text-[10px] font-black tracking-widest uppercase">
                      {mission.reward}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 italic tracking-tight">{mission.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{mission.description}</p>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* Growth Journal */}
          <section>
            <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="text-2xl font-bold text-white italic">Growth Journal</h3>
              <Link to="/sessions" className="text-xs font-black text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-[0.2em]">Open Journal</Link>
            </div>
            <RecentActivity activities={recentActivity} />
          </section>
        </div>

        <div className="space-y-12">
          {/* Tree Health Card */}
          <GlassCard className="p-10 bg-gradient-to-br from-warm-amber/10 via-transparent to-primary-500/10 border-warm-amber/20 animate-breathing">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-2 h-2 rounded-full bg-warm-amber" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Tree Health</h3>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-warm-amber border border-white/10 shadow-inner">
                  <Zap size={40} fill="currentColor" className="animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Tree Age</p>
                  <p className="text-4xl font-bold text-white italic tracking-tighter">Lvl {xpProgress.currentLevel}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="text-slate-500">Growth Progress</span>
                  <span className="text-warm-amber">{xpProgress.currentXP} / {xpProgress.xpNeeded} XP</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-warm-amber via-primary-400 to-warm-amber rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                    style={{ width: `${xpProgress.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Sunlight</p>
                  <p className="text-xl font-bold text-white">{user?.xp || 0}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Branches</p>
                  <p className="text-xl font-bold text-white">{stats.totalSkills}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Tree Wisdom */}
          <div className="relative group">
            <div className="absolute inset-0 bg-warm-amber/10 blur-[60px] rounded-full group-hover:bg-warm-amber/20 transition-colors duration-1000" />
            <GlassCard className="p-10 relative bg-forge-900/40 border-white/5 overflow-hidden">
              <Sparkles className="absolute -top-6 -right-6 w-32 h-32 text-warm-amber/5 rotate-12" />
              <p className="text-xl font-bold text-white italic leading-relaxed mb-8">
                "A tree grows slowly, but its roots run deep. Consistency is the water that makes mastery bloom."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-amber to-primary-400" />
                <div>
                  <p className="text-xs font-bold text-white">The Forest Keeper</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tree Wisdom</p>
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
