import React, { useState, useEffect } from 'react';
import { Bell, Search, Flame, Zap, Award } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useAppStore from '../store/useAppStore';
import useSanctuaryStore from '../store/useSanctuaryStore';
import { cn } from '../utils/cn';
import Badge from './common/Badge';
import { calculateXPProgress } from '../utils/gamification';
import ProfileDropdown from './ProfileDropdown';
import NotificationPanel from './NotificationPanel';

const Navbar = () => {
  const user = useAuthStore(state => state.user);
  const notifications = useAppStore(state => state.notifications);
  const fetchNotifications = useAppStore(state => state.fetchNotifications);
  const { settings } = useSanctuaryStore();
  const xpProgress = user ? calculateXPProgress(user.xp) : { currentLevel: 1, currentXP: 0, xpNeeded: 100, progressPercentage: 0 };
  
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <header 
      className="h-20 border-b backdrop-blur-3xl sticky top-0 z-40 px-10 flex items-center justify-between"
      style={{ 
        backgroundColor: 'var(--navbar)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative group">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors" 
            style={{ color: 'var(--text-secondary)' }}
          />
          <input 
            type="text" 
            placeholder="Search the sanctuary... (⌘K)" 
            className="w-full rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none transition-all"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              '::placeholder': { color: 'var(--text-secondary)' }
            }}
          />
        </div>
      </div>

      {/* User Stats & Actions */}
      <div className="flex items-center gap-10">
        {/* Streak */}
        <div className="flex items-center gap-3 group cursor-help px-4 py-2 rounded-2xl transition-all" style={{ hover: { backgroundColor: 'var(--accent-light)' } }} title="Your Daily Ritual Streak">
          <Flame size={18} className="group-hover:scale-110 transition-transform" fill="currentColor" style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-black tracking-tight" style={{ color: 'var(--text)' }}>{user?.streak || 0}</span>
        </div>

        {/* Level + XP Bar */}
        <div 
          className="flex flex-col items-start gap-2 px-4 py-2 rounded-2xl shadow-inner min-w-[200px]"
          style={{
            backgroundColor: 'var(--accent-light)',
            border: '1px solid var(--border)'
          }}
        >
          <div className="flex items-center gap-2">
            <Zap size={16} className="animate-pulse" fill="currentColor" style={{ color: 'var(--accent)' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>Lvl {xpProgress.currentLevel}</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface)' }}>
            <div 
              className="h-full rounded-full transition-all duration-700"
              style={{ 
                width: `${xpProgress.progressPercentage}%`,
                background: 'var(--button)'
              }}
            />
          </div>
          <span className="text-[10px] font-black" style={{ color: 'var(--text-secondary)' }}>
            {xpProgress.currentXP} / {xpProgress.xpNeeded} XP
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileDropdown(false); }}
            className="relative p-2.5 rounded-2xl transition-all group"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--navbar)', color: 'white' }}>
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
            className="flex items-center gap-4 pl-6 cursor-pointer group"
            style={{ borderLeft: '1px solid var(--border)' }}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold italic tracking-tight" style={{ color: 'var(--text)' }}>{user?.username}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>Seeker</p>
            </div>
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${settings?.avatarColor || "from-primary-400 to-secondary-400"} flex items-center justify-center text-white font-black italic shadow-lg border hover:scale-105 transition-transform`} style={{ boxShadow: 'var(--shadow)', borderColor: 'var(--border)' }}>
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
