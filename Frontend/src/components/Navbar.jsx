import React from 'react';
import { Bell, Search, Flame, Zap, Award } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { cn } from '../utils/cn';
import Badge from './common/Badge';

const Navbar = () => {
  const user = useAuthStore(state => state.user);

  return (
    <header className="h-20 border-b border-white/5 bg-forge-950/20 backdrop-blur-3xl sticky top-0 z-40 px-10 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-primary-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search the sanctuary... (⌘K)" 
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary-500/30 focus:border-primary-500/30 focus:bg-white/[0.04] transition-all"
          />
        </div>
      </div>

      {/* User Stats & Actions */}
      <div className="flex items-center gap-10">
        {/* Streak */}
        <div className="flex items-center gap-3 group cursor-help px-4 py-2 rounded-2xl hover:bg-white/5 transition-all" title="Your Daily Ritual Streak">
          <Flame size={18} className="text-warm-amber group-hover:scale-110 transition-transform" fill="currentColor" />
          <span className="text-sm font-black text-slate-200 tracking-tight">{user?.streak || 0}</span>
        </div>

        {/* Level */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary-500/5 border border-primary-500/10 shadow-inner">
          <Zap size={18} className="text-primary-400 animate-pulse" fill="currentColor" />
          <span className="text-xs font-black text-primary-300 uppercase tracking-widest">Lvl {user?.level || 1}</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-secondary-500 rounded-full border-2 border-forge-950 animate-pulse"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-4 pl-6 border-l border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white italic tracking-tight">{user?.username}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Seeker</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-black italic shadow-lg shadow-primary-500/10 border border-white/10 hover:scale-105 transition-transform cursor-pointer">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
