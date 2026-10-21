import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  Flame,
  Zap,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useAppStore from "../store/useAppStore";
import useSanctuaryStore from "../store/useSanctuaryStore";
import { calculateXPProgress } from "../utils/gamification";
import ProfileDropdown from "./ProfileDropdown";
import NotificationPanel from "./NotificationPanel";
import BrandMark from "./BrandMark";

const Navbar = ({ onMenuClick, menuButtonRef, mobileMenuOpen }) => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const notifications = useAppStore(
    (state) => state.notifications
  );
  const fetchNotifications = useAppStore(
    (state) => state.fetchNotifications
  );

  const { settings } = useSanctuaryStore();

  const [showProfileDropdown, setShowProfileDropdown] =
    useState(false);
  const [showNotifications, setShowNotifications] =
    useState(false);

  const xpProgress = calculateXPProgress(
    Number(user?.xp) || 0
  );

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter(
        (notification) => !notification.read
      ).length
    : 0;

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown((prev) => !prev);
    setShowNotifications(false);
  };

  return (
    <header
      className="sticky top-0 z-40 flex min-h-[4.5rem] flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b px-3 py-2 backdrop-blur-3xl sm:px-4 md:h-20 md:flex-nowrap md:px-10 md:py-0"
      style={{
        backgroundColor: "var(--navbar)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex min-w-0 items-center gap-2 md:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          aria-controls="skillforge-navigation"
          aria-expanded={mobileMenuOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
          style={{ color: "var(--text)" }}
        >
          <Menu size={22} aria-hidden="true" />
        </button>
        <BrandMark className="h-9 w-9 shrink-0" />
      </div>

      {/* Search Button */}
      <div className="hidden max-w-md flex-1 md:block">
        <button
          type="button"
          onClick={() => navigate("/friends")}
          className="group relative flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm transition-all hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
            aria-label="Find friends"
        >
          <Search
            className="h-4 w-4"
            aria-hidden="true"
          />
          <span>Find friends</span>
        </button>
      </div>

      {/* User Stats & Actions */}
      <div className="flex min-w-0 items-center gap-1 sm:gap-3 md:gap-10">
        {/* Streak */}
        <div
          className="group flex min-h-11 shrink-0 cursor-help items-center gap-1 rounded-xl px-2 py-2 transition-all hover:opacity-80 sm:gap-2 sm:px-3 md:gap-3 md:rounded-2xl md:px-4"
          title="Your Daily Ritual Streak"
        >
          <Flame
            size={18}
            className="transition-transform group-hover:scale-110"
            fill="currentColor"
            style={{ color: "var(--accent)" }}
            aria-hidden="true"
          />

          <span
            className="text-sm font-black tracking-tight"
            style={{ color: "var(--text)" }}
          >
            {Number(user?.streak) || 0}
          </span>
        </div>

        {/* Level + XP Bar */}
        <div
          className="flex min-w-0 shrink items-center gap-2 rounded-xl px-2 py-2 shadow-inner sm:px-3 md:min-w-[200px] md:flex-col md:items-start md:gap-2 md:rounded-2xl md:px-4"
          style={{
            backgroundColor: "var(--accent-light)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <Zap
              size={16}
              className="animate-pulse"
              fill="currentColor"
              style={{ color: "var(--accent)" }}
              aria-hidden="true"
            />

            <span
              className="text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ color: "var(--accent)" }}
            >
              Lvl {xpProgress.currentLevel}
            </span>
          </div>

          <div
            className="hidden h-2 w-full overflow-hidden rounded-full md:block"
            style={{
              backgroundColor: "var(--surface)",
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    Number(
                      xpProgress.progressPercentage
                    ) || 0
                  )
                )}%`,
                background: "var(--button)",
              }}
            />
          </div>

          <span
            className="hidden text-[10px] font-black md:inline"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            {xpProgress.currentXP} /{" "}
            {xpProgress.xpNeeded} XP
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleNotifications}
            className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 md:rounded-2xl"
            style={{
              color: "var(--text-secondary)",
            }}
            aria-label={`Notifications${
              unreadCount > 0
                ? `, ${unreadCount} unread`
                : ""
            }`}
            aria-expanded={showNotifications}
            aria-haspopup="dialog"
          >
            <Bell
              size={20}
              className="transition-transform group-hover:rotate-12"
              aria-hidden="true"
            />

            {unreadCount > 0 && (
              <span
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-black"
                style={{
                  backgroundColor: "var(--accent)",
                  borderColor: "var(--navbar)",
                  color: "white",
                }}
              >
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          <NotificationPanel
            isOpen={showNotifications}
            onClose={() =>
              setShowNotifications(false)
            }
          />
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleProfileDropdown}
            className="group flex min-h-11 shrink-0 cursor-pointer items-center gap-2 border-l pl-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30 sm:gap-3 sm:pl-3 md:gap-4 md:pl-6"
            style={{
              borderColor: "var(--border)",
            }}
            aria-expanded={showProfileDropdown}
            aria-haspopup="menu"
            aria-label="Open profile menu"
          >
            <div className="hidden text-right sm:block">
              <p
                className="text-sm font-bold italic tracking-tight"
                style={{ color: "var(--text)" }}
              >
                {user?.username || "User"}
              </p>

              <p
                className="text-[10px] font-black uppercase tracking-[0.2em]"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Seeker
              </p>
            </div>

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border bg-gradient-to-br ${
                settings?.avatarColor ||
                "from-primary-400 to-secondary-400"
              } font-black italic text-white shadow-lg transition-transform hover:scale-105`}
              style={{
                boxShadow: "var(--shadow)",
                borderColor: "var(--border)",
              }}
              aria-hidden="true"
            >
              {user?.username
                ?.charAt(0)
                .toUpperCase() || "U"}
            </div>
          </button>

          <ProfileDropdown
            isOpen={showProfileDropdown}
            onClose={() =>
              setShowProfileDropdown(false)
            }
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
