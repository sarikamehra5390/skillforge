import React, { useEffect, useRef } from 'react';
import { User, Settings, Palette, Bell, BarChart3, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import useSanctuaryStore from '../store/useSanctuaryStore';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const { setIsModalOpen, setActiveTab } = useSanctuaryStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const menuItems = [
    { 
      icon: User, 
      label: 'My Profile', 
      action: () => { 
        navigate('/profile'); 
        onClose(); 
      } 
    },
    { 
      icon: Settings, 
      label: 'Manage Account', 
      action: () => { 
        navigate('/account'); 
        onClose(); 
      } 
    },
    { 
      icon: Palette, 
      label: 'Appearance', 
      action: () => { 
        setActiveTab('theme'); 
        setIsModalOpen(true); 
        onClose(); 
      } 
    },
    { 
      icon: Bell, 
      label: 'Notification Settings', 
      action: () => { 
        navigate('/notifications'); 
        onClose(); 
      } 
    },
    { 
      icon: LogOut, 
      label: 'Logout', 
      action: () => { 
        logout(); 
        navigate('/login'); 
        onClose(); 
      } 
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-64 rounded-3xl bg-forge-900/95 backdrop-blur-3xl border border-white/10 shadow-2xl z-50"
        >
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-black italic shadow-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white italic tracking-tight">{user?.username}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Seeker</p>
              </div>
            </div>
          </div>
          <div className="p-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors group"
              >
                <item.icon size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors font-medium">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileDropdown;
