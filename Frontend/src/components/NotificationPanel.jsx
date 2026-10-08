import { useEffect, useRef } from "react";
import {
  Bell,
  Check,
  Trophy,
  Zap,
  Target,
  Flame,
  Users,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import useAppStore from "../store/useAppStore";
import GlassCard from "./common/GlassCard";

const getIconForType = (type) => {
  switch (type) {
    case "achievement":
      return Trophy;
    case "levelup":
      return Zap;
    case "mission":
      return Target;
    case "streak":
      return Flame;
    case "friend":
      return Users;
    default:
      return Bell;
  }
};

const getColorForType = (type) => {
  switch (type) {
    case "achievement":
      return "text-purple-400";
    case "levelup":
      return "text-primary-400";
    case "mission":
      return "text-green-400";
    case "streak":
      return "text-amber-400";
    case "friend":
      return "text-pink-400";
    default:
      return "text-slate-400";
  }
};

const formatNotificationDate = (value) => {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString();
};

const NotificationPanel = ({
  isOpen,
  onClose,
}) => {
  const panelRef = useRef(null);

  const notifications = useAppStore(
    (state) => state.notifications
  );
  const markNotificationRead = useAppStore(
    (state) => state.markNotificationRead
  );
  const markAllRead = useAppStore(
    (state) => state.markAllRead
  );

  const safeNotifications = Array.isArray(
    notifications
  )
    ? notifications
    : [];

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [isOpen, onClose]);

  const unreadCount = safeNotifications.filter(
    (notification) => !notification?.read
  ).length;

  const handleNotificationClick = async (
    notification
  ) => {
    if (
      !notification?.read &&
      notification?._id
    ) {
      try {
        await markNotificationRead(
          notification._id
        );
      } catch (error) {
        console.error(
          "Failed to mark notification as read:",
          error
        );
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{
            opacity: 0,
            y: -10,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -10,
            scale: 0.95,
          }}
          className="absolute right-0 top-full z-50 mt-2 flex max-h-[500px] w-96 flex-col rounded-3xl border border-white/10 bg-forge-900/95 shadow-2xl backdrop-blur-3xl"
          role="dialog"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-2">
              <Bell
                size={18}
                className="text-slate-300"
                aria-hidden="true"
              />

              <h3 className="text-lg font-bold italic text-white">
                Notifications
              </h3>

              {unreadCount > 0 && (
                <span className="rounded-full bg-primary-400/10 px-2 py-0.5 text-xs font-black text-primary-400">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-primary-400 transition-colors hover:text-primary-300"
              >
                <Check
                  size={14}
                  aria-hidden="true"
                />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications */}
          <div className="flex-1 space-y-2 overflow-y-auto p-2">
            {safeNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell
                  size={40}
                  className="mx-auto mb-3 text-slate-600"
                  aria-hidden="true"
                />

                <p className="font-medium text-slate-500">
                  No notifications yet
                </p>
              </div>
            ) : (
              safeNotifications.map(
                (notification) => {
                  if (!notification?._id) {
                    return null;
                  }

                  const Icon =
                    getIconForType(
                      notification.type
                    );

                  const color =
                    getColorForType(
                      notification.type
                    );

                  const isUnread =
                    !notification.read;

                  return (
                    <button
                      key={notification._id}
                      type="button"
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                      className="w-full text-left"
                      aria-label={`Notification: ${
                        notification.title ||
                        "Untitled notification"
                      }`}
                    >
                      <GlassCard
                        className={`p-4 transition-all hover:bg-white/5 ${
                          isUnread
                            ? "border-primary-500/20 bg-primary-500/5"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`rounded-xl bg-white/5 p-2 ${color}`}
                          >
                            <Icon
                              size={18}
                              aria-hidden="true"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-white">
                              {notification.title ||
                                "Notification"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {notification.message ||
                                "You have a new notification."}
                            </p>

                            <p className="mt-2 text-[10px] text-slate-600">
                              {formatNotificationDate(
                                notification.createdAt
                              )}
                            </p>
                          </div>

                          {isUnread && (
                            <div
                              className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-400"
                              aria-label="Unread"
                            />
                          )}
                        </div>
                      </GlassCard>
                    </button>
                  );
                }
              )
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;