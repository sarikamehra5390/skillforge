import React, { useState, useEffect } from 'react';
import { Trophy, Lock, Star, Zap, Flame, Shield, Award, Target, Book, Loader2 } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import Badge from '../components/common/Badge';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axios';
import { cn } from '../utils/cn';
import Illustration from '../components/common/Illustration';
import { toast } from 'sonner';
import { ACHIEVEMENTS as XP_ACHIEVEMENTS } from '../utils/gamification';

const ACHIEVEMENTS = [
  {
    id: 1,
    title: "First Step",
    description: "Complete your first practice session",
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    rarity: "Common",
    xp: 50,
    requirement: (stats) => stats.totalSessions >= 1
  },
  {
    id: 2,
    title: "Habit Builder",
    description: "Maintain a 3-day practice streak",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    rarity: "Common",
    xp: 100,
    requirement: (stats) => stats.streak >= 3
  },
  {
    id: 3,
    title: "Deep Focus",
    description: "Complete a session longer than 60 minutes",
    icon: Zap,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    rarity: "Uncommon",
    xp: 200,
    requirement: (stats) => stats.maxDuration >= 60
  },
  {
    id: 4,
    title: "Skill Collector",
    description: "Add 5 different skills to your forge",
    icon: Book,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    rarity: "Uncommon",
    xp: 250,
    requirement: (stats) => stats.totalSkills >= 5
  },
  {
    id: 5,
    title: "Mastery Initiate",
    description: "Reach Level 5",
    icon: Trophy,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    rarity: "Rare",
    xp: 500,
    requirement: (stats) => stats.level >= 5
  },
  {
    id: 6,
    title: "Unstoppable",
    description: "Maintain a 7-day practice streak",
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-500/10",
    rarity: "Epic",
    xp: 1000,
    requirement: (stats) => stats.streak >= 7
  },
  ...XP_ACHIEVEMENTS.map((ach, idx) => ({
    id: `xp-${ach.id}`,
    title: ach.title,
    description: ach.description,
    icon: () => <span className="text-2xl">{ach.emoji || "⭐"}</span>,
    color: "text-primary-400",
    bg: "bg-primary-400/10",
    rarity: idx === XP_ACHIEVEMENTS.length - 1 ? "Legendary" : idx > 2 ? "Epic" : idx > 0 ? "Rare" : "Common",
    xp: ach.xpRequired,
    requirement: (stats) => stats.totalXP >= ach.xpRequired
  }))
];

const Achievements = () => {
  const user = useAuthStore(state => state.user);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    streak: 0,
    maxDuration: 0,
    totalSkills: 0,
    level: 1,
    totalXP: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, skillsRes] = await Promise.all([
          api.get('/sessions'),
          api.get('/skills')
        ]);

        const sessions = sessionsRes.data;
        const skills = skillsRes.data;

        setStats({
          totalSessions: sessions.length,
          streak: user?.streak || 0,
          maxDuration: sessions.length > 0 ? Math.max(...sessions.map(s => s.duration)) : 0,
          totalSkills: skills.length,
          level: user?.level || 1,
          totalXP: user?.xp || 0
        });
        setLoading(false);
      } catch (error) {
        toast.error("Failed to connect to your milestone archive");
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const unlockedCount = ACHIEVEMENTS.filter(a => a.requirement(stats)).length;

  return (
    <div className="space-y-16 pb-24 relative">
      {/* Cinematic Header */}
      <section className="relative overflow-hidden rounded-[3.5rem] border border-white/5 shadow-2xl group">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-forge-900/60 to-forge-950/40" />
        
        {/* Desktop Layout */}
        <div className="hidden md:flex flex-col md:flex-row items-center gap-16 p-16 md:p-24">
          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full bg-warm-amber/10 border border-warm-amber/20 backdrop-blur-md">
              <Trophy size={16} className="text-warm-amber animate-pulse" fill="currentColor" />
              <span className="text-[10px] font-black tracking-[0.2em] text-warm-amber uppercase">Milestone Archive</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.05] italic">
              Your tree is <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-amber via-primary-400 to-warm-amber">
                blooming beautifully.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
              You've earned <span className="text-white font-black">{unlockedCount} of {ACHIEVEMENTS.length}</span> blossoms. 
              Every achievement is a golden fruit growing from your consistent care.
            </p>
          </div>

          {/* Constellation Visual */}
          <div className="relative z-10 flex-shrink-0 w-full max-w-[350px] md:max-w-[400px]">
            <Illustration name="constellationOfSkills" className="w-full h-auto opacity-90" />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col items-center p-8 text-center space-y-8">
          <div className="relative w-full max-w-xs">
            <Illustration name="constellationOfSkills" className="w-full h-auto opacity-90" />
          </div>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-amber/10 border border-warm-amber/20 backdrop-blur-md">
              <Trophy size={14} className="text-warm-amber animate-pulse" fill="currentColor" />
              <span className="text-[10px] font-black tracking-[0.2em] text-warm-amber uppercase">Milestones</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white leading-[1.05] italic">
              Your tree is <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-amber via-primary-400 to-warm-amber">blooming</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
              You've earned <span className="text-white font-bold">{unlockedCount} of {ACHIEVEMENTS.length}</span> blossoms. Every achievement is a golden fruit!
            </p>
          </div>
        </div>
        
        {/* Atmospheric Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-warm-amber/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-secondary-500/5 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '3s' }} />
        </div>
      </section>

      {/* Rarity Legend */}
      <div className="flex flex-wrap gap-3 px-2">
        {['Common', 'Uncommon', 'Rare', 'Epic'].map(rarity => (
          <Badge key={rarity} variant="default" className="bg-white/5 border-white/5 px-4 py-1.5 rounded-full lowercase italic font-medium text-slate-400">
            {rarity}
          </Badge>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = achievement.requirement(stats);
          const Icon = typeof achievement.icon === 'function' ? achievement.icon : achievement.icon;

          return (
            <GlassCard 
              key={achievement.id} 
              className={cn(
                "p-10 transition-all duration-700 group relative overflow-hidden border-white/5",
                isUnlocked ? "opacity-100 hover:border-primary-500/30" : "opacity-40 grayscale blur-[1px] hover:blur-none transition-all duration-500"
              )}
            >
              <div className="flex items-start justify-between mb-10">
                <div className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-1000 group-hover:scale-110 group-hover:rotate-3 shadow-2xl relative",
                  isUnlocked ? `${achievement.bg} shadow-primary-500/10` : "bg-white/5 border border-white/5"
                )}>
                  {isUnlocked ? (
                    <>
                      <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      {typeof Icon === 'function' ? <Icon /> : <Icon className={cn("w-10 h-10 relative z-10", achievement.color)} />}
                    </>
                  ) : (
                    <Lock className="w-8 h-8 text-slate-700" />
                  )}
                </div>
                <Badge 
                  variant={isUnlocked ? "purple" : "default"}
                  className="rounded-full px-4 py-1 bg-white/5 border-white/5 text-[10px] tracking-widest lowercase italic"
                >
                  {achievement.rarity}
                </Badge>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{achievement.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 min-h-[48px]">
                {achievement.description}
              </p>

              <div className="flex items-center justify-between pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 text-warm-amber font-bold italic">
                  <Zap size={16} fill="currentColor" />
                  <span className="text-sm">+{achievement.xp} XP</span>
                </div>
                {isUnlocked ? (
                  <div className="flex items-center gap-2 text-soft-mint font-bold text-xs uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-soft-mint shadow-[0_0_8px_rgba(110,231,183,0.6)]" />
                    Unlocked
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Awaiting...</span>
                )}
              </div>

              {/* Ambient Shine */}
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
