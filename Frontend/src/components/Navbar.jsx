import React, { useState, useEffect } from 'react';
import { Bell, Search, Flame, Zap, Award } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useAppStore from '../store/useAppStore';
import { cn } from '../utils/cn';
import Badge from './common/Badge';
import { calculateXPProgress } from '../utils/gamification';
import ProfileDropdown from './ProfileDropdown';
import NotificationPanel from './NotificationPanel';

const Navbar = () => {
  const user = useAuthStore(state => state.user);
  const notifications = useAppStore(state => state.notifications);
  const fetchNotifications = useAppStore(state => state.fetchNotifications);
  const xpProgress = user ? calculateXPProgress(user.xp) : { currentLevel: 1, currentXP: 0, xpNeeded: 100, progressPercentage: 0 };
  
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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

        {/* Level + XP Bar */}
        <div className="flex flex-col items-start gap-2 px-4 py-2 rounded-2xl bg-primary-500/5 border border-primary-500/10 shadow-inner min-w-[200px]">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-primary-400 animate-pulse" fill="currentColor" />
            <span className="text-[10px] font-black text-primary-300 uppercase tracking-[0.2em]">Lvl {xpProgress.currentLevel}</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-warm-amber via-primary-400 to-warm-amber rounded-full transition-all duration-700"
              style={{ width: `${xpProgress.progressPercentage}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-slate-500">
            {xpProgress.currentXP} / {xpProgress.xpNeeded} XP
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileDropdown(false); }}
            className="relative p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
          >
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-secondary-500 rounded-full border-2 border-forge-950 flex items-center justify-center text-[10px] font-black text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>

        {/* User Profile */}
        <div className="relative">
          <div 
            onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifications(false); }}
            className="flex items-center gap-4 pl-6 border-l border-white/5 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white italic tracking-tight">{user?.username}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Seeker</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-black italic shadow-lg shadow-primary-500/10 border border-white/10 hover:scale-105 transition-transform">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
          <ProfileDropdown isOpen={showProfileDropdown} onClose={() => setShowProfileDropdown(false)} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
