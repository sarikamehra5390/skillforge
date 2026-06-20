import React from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Zap, 
  Flame, 
  Target, 
  Award,
  Calendar,
  Settings,
  LogOut,
  Camera
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Illustration from '../components/common/Illustration';

const Profile = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="space-y-16 pb-24 relative">
      {/* Profile Cinematic Header */}
      <section className="relative overflow-hidden rounded-[3.5rem] p-12 md:p-20 bg-gradient-to-br from-forge-900/60 to-forge-950/40 border border-white/5 shadow-2xl group">
        {/* Background Magical Elements */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[120px] animate-glow-pulse" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
          {/* Character Portrait Area */}
          <div className="relative group/portrait flex flex-col items-center">
            <div className="relative mb-8">
              <div className="w-72 h-72 rounded-[3rem] bg-gradient-to-br from-primary-400 to-secondary-400 p-1 shadow-2xl rotate-3 group-hover/portrait:rotate-0 transition-transform duration-700">
                <div className="w-full h-full rounded-[2.8rem] bg-forge-950 flex items-center justify-center text-8xl font-black text-white italic">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
              {/* Level Badge Overlay */}
              <div className="absolute -top-4 -left-4 px-6 py-2 rounded-2xl bg-white backdrop-blur-xl border border-white/20 text-forge-950 font-black italic shadow-2xl rotate-[-6deg]">
                LVL {user?.level}
              </div>
            </div>
            <div className="relative w-48 h-48">
              <Illustration name="growthTree" className="w-full h-full opacity-70" />
            </div>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-warm-amber/10 border border-warm-amber/20 backdrop-blur-md">
              <Shield size={14} className="text-warm-amber" />
              <span className="text-[10px] font-black tracking-[0.2em] text-warm-amber uppercase">Tree Keeper</span>
            </div>
            
            <h1 className="text-6xl font-bold tracking-tight text-white mb-6 italic">
              {user?.username}
            </h1>
            
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl mb-10">
              You've nurtured your tree with <span className="text-warm-amber font-black">{user?.streak} days</span> of consistent care. 
              Every branch tells a story, every blossom is a victory.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Button variant="outline" className="rounded-2xl px-8 py-4 border-white/10 hover:bg-white/5">
                <Settings size={18} className="mr-2" />
                Customize Sanctuary
              </Button>
              <Button variant="danger" className="rounded-2xl px-8 py-4 bg-red-500/10 hover:bg-red-500/20 border-red-500/20" onClick={logout}>
                <LogOut size={18} className="mr-2" />
                Leave Sanctuary
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Progress & Stats */}
        <div className="lg:col-span-2 space-y-10">
          <GlassCard className="p-10 border-white/5 bg-white/[0.01]">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
              <Zap size={18} className="text-primary-400" fill="currentColor" />
              The Next Evolution
            </h3>
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Current Presence</p>
                  <p className="text-4xl font-bold text-white italic tracking-tighter">Level {user?.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Next Horizon</p>
                  <p className="text-4xl font-bold text-slate-700 italic tracking-tighter">Level {user?.level + 1}</p>
                </div>
              </div>
              <div className="relative h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(167,139,250,0.2)]"
                  style={{ width: `${((user?.xp || 0) % 500) / 5}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
                <span className="text-primary-300">{(user?.xp || 0) % 500} XP Nurtured</span>
                <span className="text-slate-600">{500 - ((user?.xp || 0) % 500)} XP to Unfold</span>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <GlassCard className="p-10 group border-white/5 bg-white/[0.01]">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 italic">Ritual Consistency</h3>
              <div className="flex items-center gap-10">
                <div className="w-24 h-24 rounded-[2rem] border-2 border-primary-500/20 flex items-center justify-center group-hover:border-primary-400 transition-colors duration-700 relative">
                   <div className="absolute inset-0 bg-primary-400/5 rounded-[2rem] blur-md" />
                   <span className="text-3xl font-bold text-white italic relative z-10">92%</span>
                </div>
                <div>
                  <p className="text-white font-bold tracking-tight italic">Radiant Path</p>
                  <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">28 of the last 30 sunrises spent in mastery.</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-10 group border-white/5 bg-white/[0.01]">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 italic">Temporal Harvest</h3>
              <div className="flex items-center gap-10">
                <div className="w-24 h-24 rounded-[2rem] border-2 border-secondary-500/20 flex items-center justify-center group-hover:border-secondary-400 transition-colors duration-700 relative">
                   <div className="absolute inset-0 bg-secondary-400/5 rounded-[2rem] blur-md" />
                   <span className="text-3xl font-bold text-white italic relative z-10">45h</span>
                </div>
                <div>
                  <p className="text-white font-bold tracking-tight italic">Rich Harvest</p>
                  <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">Cumulative hours of life given to your skills.</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Right Column: Achievements & Badges */}
        <div className="space-y-10">
          <GlassCard className="p-10 border-white/5 bg-white/[0.01]">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-10 flex items-center justify-between italic">
              Collection
              <Button variant="ghost" size="sm" className="text-[10px] h-7 px-4 rounded-full border border-white/5">archive</Button>
            </h3>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square rounded-[1.25rem] bg-white/[0.03] border border-white/5 flex items-center justify-center group hover:bg-primary-500/10 hover:border-primary-400/30 transition-all duration-700 cursor-help relative overflow-hidden">
                  <Award size={24} className="text-slate-700 group-hover:text-primary-300 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-10 bg-red-500/[0.01] border-red-500/10 hover:border-red-500/20 transition-colors duration-1000">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8 italic text-center">Protocol</h3>
            <div className="space-y-6">
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-4 p-5 rounded-[2rem] bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all group border border-red-500/10"
              >
                <div className="p-2 bg-red-500/10 rounded-xl group-hover:scale-110 transition-transform">
                  <LogOut size={20} />
                </div>
                <span className="font-bold italic uppercase tracking-widest text-xs">Release Presence</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;
