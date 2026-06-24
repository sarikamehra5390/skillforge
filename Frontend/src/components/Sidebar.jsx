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
  Search,
  Sprout
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
    { icon: Search, label: 'Find Friends', path: '/search' },
    { icon: Sprout, label: 'Community Garden', path: '/garden' },
    { icon: User, label: 'Self', path: '/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside 
      className={cn(
        "relative h-screen bg-forge-950/20 backdrop-blur-3xl border-r border-white/5 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col z-50",
        sidebarOpen ? "w-80" : "w-24"
      )}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-4 top-12 bg-forge-900/90 rounded-2xl p-2.5 text-slate-500 border border-white/10 shadow-2xl hover:text-primary-400 hover:border-primary-500/30 transition-all z-[60]"
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Brand */}
      <div className={cn(
        "p-10 flex items-center gap-5",
        !sidebarOpen && "justify-center"
      )}>
        <div className="w-12 h-12 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0 animate-soft-float rotate-3">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        {sidebarOpen && (
          <span className="text-2xl font-bold tracking-tighter text-white italic">
            SkillForge
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 mt-8 space-y-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-500 group relative overflow-hidden",
              isActive 
                ? "bg-primary-500/10 text-primary-300 shadow-inner" 
                : "text-slate-500 hover:text-slate-100 hover:bg-white/[0.03]"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} className={cn(
                  "flex-shrink-0 transition-all duration-500",
                  isActive ? "scale-110 text-primary-400" : "group-hover:scale-110 group-hover:text-primary-300"
                )} />
                {sidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                {isActive && (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 shadow-[0_0_15px_rgba(167,139,250,0.5)]" />
                    <div className="absolute right-4 w-1.5 h-1.5 bg-primary-400 rounded-full shadow-[0_0_10px_rgba(167,139,250,0.8)] animate-pulse" />
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-8 border-t border-white/5">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-4 w-full px-5 py-4 rounded-[1.5rem] text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-500 group",
            !sidebarOpen && "justify-center"
          )}
        >
          <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
          {sidebarOpen && <span className="font-bold text-sm tracking-tight">Leave Sanctuary</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
