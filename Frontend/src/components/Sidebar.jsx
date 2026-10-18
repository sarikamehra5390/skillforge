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
  Users,
  Sprout,
  Settings,
  Bell,
} from "lucide-react";

import { cn } from "../utils/cn";
import useAuthStore from "../store/useAuthStore";
import BrandMark from "./BrandMark";

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  const logout = useAuthStore(
    (state) => state.logout
  );

  const navigate = useNavigate();

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
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  };

  return (
    <aside
      className={cn(
        "relative z-50 flex h-screen flex-col backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
        sidebarOpen ? "w-80" : "w-24"
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
          setSidebarOpen(!sidebarOpen)
        }
        aria-label={
          sidebarOpen
            ? "Collapse sidebar"
            : "Expand sidebar"
        }
        aria-expanded={sidebarOpen}
        className="absolute -right-4 top-12 z-[60] rounded-2xl border p-2.5 shadow-2xl transition-all"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text-secondary)",
        }}
      >
        {sidebarOpen ? (
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
          "flex items-center gap-5 p-10",
          !sidebarOpen && "justify-center"
        )}
      >
        <BrandMark className="animate-soft-float rotate-3" />

        {sidebarOpen && (
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
      <nav
        className="mt-8 min-h-0 flex-1 space-y-4 overflow-y-auto px-6"
        aria-label="Main navigation"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-4 overflow-hidden rounded-[1.5rem] px-5 py-4 transition-all duration-500",
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

                  {sidebarOpen && (
                    <span className="text-sm font-bold tracking-tight">
                      {item.label}
                    </span>
                  )}

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
        className="border-t p-8"
        style={{
          borderColor: "var(--border)",
        }}
      >
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "group flex w-full items-center gap-4 rounded-[1.5rem] px-5 py-4 transition-all duration-500",
            !sidebarOpen && "justify-center"
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

          {sidebarOpen && (
            <span className="text-sm font-bold tracking-tight">
              Leave Sanctuary
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
