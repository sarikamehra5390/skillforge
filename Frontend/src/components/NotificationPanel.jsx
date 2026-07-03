import React, { useEffect, useRef } from 'react';
import { Bell, Check, Trophy, Zap, Target, Flame, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../store/useAppStore';
import GlassCard from './common/GlassCard';

const getIconForType = (type) => {
  switch (type) {
    case 'achievement': return Trophy;
    case 'levelup': return Zap;
    case 'mission': return Target;
    case 'streak': return Flame;
    case 'friend': return Users;
    default: return Bell;
  }
};

const getColorForType = (type) => {
  switch (type) {
    case 'achievement': return 'text-purple-400';
    case 'levelup': return 'text-primary-400';
    case 'mission': return 'text-green-400';
    case 'streak': return 'text-amber-400';
    case 'friend': return 'text-pink-400';
    default: return 'text-slate-400';
  }
};

const NotificationPanel = ({ isOpen, onClose }) => {
  const panelRef = useRef(null);
  const { notifications, fetchNotifications, markNotificationRead, markAllRead } = useAppStore();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-96 rounded-3xl bg-forge-900/95 backdrop-blur-3xl border border-white/10 shadow-2xl z-50 max-h-[500px] flex flex-col"
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-slate-300" />
              <h3 className="text-lg font-bold text-white italic">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-black text-primary-400 bg-primary-400/10 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center p-8">
                <Bell size={40} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-500 font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getIconForType(notification.type);
                const color = getColorForType(notification.type);
                return (
                  <button
                    key={notification._id}
                    onClick={() => !notification.read && markNotificationRead(notification._id)}
                    className="w-full"
                  >
                    <GlassCard className={`p-4 text-left transition-all hover:bg-white/5 ${!notification.read ? 'bg-primary-500/5 border-primary-500/20' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl bg-white/5 ${color}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{notification.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
                          <p className="text-[10px] text-slate-600 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary-400 rounded-full mt-1" />
                        )}
                      </div>
                    </GlassCard>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
