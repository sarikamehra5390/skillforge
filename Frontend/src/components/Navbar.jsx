import React, { useEffect, useState } from "react";
import {
  Bell,
  Search,
  Flame,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useAppStore from "../store/useAppStore";
import useSanctuaryStore from "../store/useSanctuaryStore";
import { calculateXPProgress } from "../utils/gamification";
import ProfileDropdown from "./ProfileDropdown";
import NotificationPanel from "./NotificationPanel";

const Navbar = () => {
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
      className="sticky top-0 z-40 flex h-20 items-center justify-between border-b px-10 backdrop-blur-3xl"
      style={{
        backgroundColor: "var(--navbar)",
        borderColor: "var(--border)",
      }}
    >
      {/* Search Button */}
      <div className="hidden max-w-md flex-1 md:block">
        <button
          type="button"
          onClick={() => navigate("/search")}
          className="group relative flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm transition-all hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
          aria-label="Search"
        >
          <Search
            className="h-4 w-4"
            aria-hidden="true"
          />
          <span>Search (Ctrl/⌘ K)</span>
        </button>
      </div>

      {/* User Stats & Actions */}
      <div className="flex items-center gap-10">
        {/* Streak */}
        <div
          className="group flex cursor-help items-center gap-3 rounded-2xl px-4 py-2 transition-all hover:opacity-80"
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
          className="flex min-w-[200px] flex-col items-start gap-2 rounded-2xl px-4 py-2 shadow-inner"
          style={{
            backgroundColor: "var(--accent-light)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2">
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
            className="h-2 w-full overflow-hidden rounded-full"
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
            className="text-[10px] font-black"
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
            className="group relative rounded-2xl p-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30"
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
            className="group flex cursor-pointer items-center gap-4 border-l pl-6 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
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