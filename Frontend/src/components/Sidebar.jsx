import { NavLink } from "react-router-dom";
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
  Users,
  Sprout,
  Settings,
  Bell,
} from "lucide-react";

import { cn } from "../utils/cn";
import useAuthStore from "../store/useAuthStore";
import BrandMark from "./BrandMark";

const Sidebar = ({
  sidebarExpanded,
  setSidebarExpanded,
  mobileOpen,
  onMobileClose,
}) => {
  const logout = useAuthStore(
    (state) => state.logout
  );

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Sanctuary",
      path: "/",
    },
    {
      icon: BookOpen,
      label: "Mastery Seeds",
      path: "/skills",
    },
    {
      icon: History,
      label: "Ritual Journal",
      path: "/sessions",
    },
    {
      icon: BarChart3,
      label: "Growth Journey",
      path: "/analytics",
    },
    {
      icon: Trophy,
      label: "Milestones",
      path: "/achievements",
    },
    {
      icon: Users,
      label: "Friends",
      path: "/friends",
    },
    {
      icon: Sprout,
      label: "Community Garden",
      path: "/garden",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/account",
    },
    {
      icon: Bell,
      label: "Notifications",
      path: "/notifications",
    },
    {
      icon: User,
      label: "Self",
      path: "/profile",
    },
  ];

  const handleLogout = async () => {
    onMobileClose?.();
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside
      id="skillforge-navigation"
      aria-label="Main navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(18rem,calc(100vw-2rem))] flex-col backdrop-blur-3xl transition-transform duration-300 ease-out md:relative md:inset-auto md:z-20 md:h-dvh md:shrink-0 md:translate-x-0 md:transition-[width] md:duration-500",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        sidebarExpanded ? "md:w-80" : "md:w-24"
      )}
      style={{
        backgroundColor: "var(--sidebar)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() =>
          setSidebarExpanded(!sidebarExpanded)
        }
        aria-label={
          sidebarExpanded
            ? "Collapse sidebar"
            : "Expand sidebar"
        }
        aria-expanded={sidebarExpanded}
        className="absolute -right-4 top-12 z-[60] hidden min-h-11 min-w-11 items-center justify-center rounded-2xl border p-2.5 shadow-2xl transition-all md:flex"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text-secondary)",
        }}
      >
        {sidebarExpanded ? (
          <ChevronLeft
            size={16}
            aria-hidden="true"
          />
        ) : (
          <ChevronRight
            size={16}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Brand */}
      <div
        className={cn(
          "flex items-center gap-4 px-6 py-7 md:gap-5 md:p-10",
          !sidebarExpanded && "md:justify-center"
        )}
      >
        <BrandMark className="animate-soft-float rotate-3" />

        <button type="button" onClick={onMobileClose} className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 md:hidden" aria-label="Close navigation menu">
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        {sidebarExpanded && (
          <span
            className="text-2xl font-bold italic tracking-tighter"
            style={{
              color: "var(--text)",
            }}
          >
            SkillForge
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-4 md:mt-8 md:space-y-4 md:px-6" aria-label="Main navigation">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "group relative flex min-h-12 items-center gap-4 overflow-hidden rounded-2xl px-4 py-3 transition-all duration-300 md:rounded-[1.5rem] md:px-5 md:py-4",
                  isActive && "shadow-inner"
                )
              }
              style={({ isActive }) => ({
                color: isActive
                  ? "var(--accent)"
                  : "var(--text-secondary)",
                backgroundColor: isActive
                  ? "var(--accent-light)"
                  : "transparent",
              })}
              onMouseEnter={(event) => {
                event.currentTarget.style.color =
                  "var(--text)";

                event.currentTarget.style.backgroundColor =
                  "var(--accent-light)";
              }}
              onClick={onMobileClose}
              onMouseLeave={(event) => {
                const isActive =
                  event.currentTarget.classList.contains(
                    "shadow-inner"
                  );

                event.currentTarget.style.color =
                  isActive
                    ? "var(--accent)"
                    : "var(--text-secondary)";

                event.currentTarget.style.backgroundColor =
                  isActive
                    ? "var(--accent-light)"
                    : "transparent";
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={22}
                    className="flex-shrink-0 transition-all duration-500"
                    style={{
                      transform: isActive
                        ? "scale(1.1)"
                        : undefined,
                    }}
                    aria-hidden="true"
                  />

                  <span className={cn("text-sm font-bold tracking-tight", !sidebarExpanded && "md:hidden")}>
                      {item.label}
                  </span>

                  {isActive && (
                    <>
                      <div
                        className="absolute bottom-0 left-0 top-0 w-1"
                        style={{
                          backgroundColor:
                            "var(--accent)",
                          boxShadow:
                            "0 0 15px var(--shadow)",
                        }}
                        aria-hidden="true"
                      />

                      <div
                        className="absolute right-4 h-1.5 w-1.5 animate-pulse rounded-full"
                        style={{
                          backgroundColor:
                            "var(--accent)",
                          boxShadow:
                            "0 0 10px var(--shadow)",
                        }}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div
        className="border-t p-4 md:p-8"
        style={{
          borderColor: "var(--border)",
        }}
      >
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "group flex min-h-12 w-full items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300 md:rounded-[1.5rem] md:px-5 md:py-4",
            !sidebarExpanded && "md:justify-center"
          )}
          style={{
            color: "var(--text-secondary)",
          }}
        >
          <LogOut
            size={22}
            className="transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />

          <span className={cn("text-sm font-bold tracking-tight", !sidebarExpanded && "md:hidden")}>
              Leave Sanctuary
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
