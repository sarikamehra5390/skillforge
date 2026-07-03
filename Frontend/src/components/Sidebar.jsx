import React from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  BarChart3, 
  Trophy, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Sprout,
  Settings,
  Bell
} from 'lucide-react';
import { cn } from '../utils/cn';
import useAuthStore from '../store/useAuthStore';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Sanctuary', path: '/' },
    { icon: BookOpen, label: 'Mastery Seeds', path: '/skills' },
    { icon: History, label: 'Ritual Journal', path: '/sessions' },
    { icon: BarChart3, label: 'Growth Journey', path: '/analytics' },
    { icon: Trophy, label: 'Milestones', path: '/achievements' },
    { icon: Users, label: 'Friends', path: '/friends' },
    { icon: Sprout, label: 'Community Garden', path: '/garden' },
    { icon: Settings, label: 'Settings', path: '/account' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Self', path: '/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside 
      className={cn(
        "relative h-screen backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col z-50",
        sidebarOpen ? "w-80" : "w-24"
      )}
      style={{ backgroundColor: 'var(--sidebar)', borderRight: '1px solid var(--border)' }}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-4 top-12 rounded-2xl p-2.5 border shadow-2xl transition-all z-[60]"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Brand */}
      <div className={cn(
        "p-10 flex items-center gap-5",
        !sidebarOpen && "justify-center"
      )}>
        <div 
          className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-lg flex-shrink-0 animate-soft-float rotate-3"
          style={{ background: 'var(--button)', boxShadow: 'var(--shadow)' }}
        >
          <Sparkles className="text-white w-6 h-6" />
        </div>
        {sidebarOpen && (
          <span className="text-2xl font-bold tracking-tighter italic" style={{ color: 'var(--text)' }}>
            SkillForge
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 mt-8 space-y-4 overflow-y-auto min-h-0">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-500 group relative overflow-hidden",
              isActive 
                ? "shadow-inner" 
                : ""
            )}
            style={({ isActive }) => ({ 
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)', 
              backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
              '--hover-color': 'var(--text)',
              '--hover-bg': 'var(--accent-light)'
            })}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.backgroundColor = 'var(--accent-light)';
            }}
            onMouseLeave={(e) => {
              const isActive = e.currentTarget.classList.contains('shadow-inner');
              e.currentTarget.style.color = isActive ? 'var(--accent)' : 'var(--text-secondary)';
              e.currentTarget.style.backgroundColor = isActive ? 'var(--accent-light)' : 'transparent';
            }}
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} className="flex-shrink-0 transition-all duration-500" style={{ transform: isActive ? 'scale(1.1)' : '' }} />
                {sidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                {isActive && (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 15px var(--shadow)' }} />
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 10px var(--shadow)' }} />
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-8 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-4 w-full px-5 py-4 rounded-[1.5rem] transition-all duration-500 group",
            !sidebarOpen && "justify-center"
          )}
          style={{ color: 'var(--text-secondary)' }}
        >
          <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
          {sidebarOpen && <span className="font-bold text-sm tracking-tight">Leave Sanctuary</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
