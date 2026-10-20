import { useEffect, useRef } from "react";
import {
  User,
  Settings,
  Palette,
  Bell,
  LogOut,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { useNavigate } from "react-router-dom";

import useAuthStore from "../store/useAuthStore";
import useSanctuaryStore from "../store/useSanctuaryStore";

const ProfileDropdown = ({
  isOpen,
  onClose,
}) => {
  const dropdownRef = useRef(null);

  const logout = useAuthStore(
    (state) => state.logout
  );

  const user = useAuthStore(
    (state) => state.user
  );

  const setIsModalOpen = useSanctuaryStore(
    (state) => state.setIsModalOpen
  );

  const setActiveTab = useSanctuaryStore(
    (state) => state.setActiveTab
  );

  const navigate = useNavigate();

  const username =
    user?.username ||
    user?.displayName ||
    "User";

  const avatarLetter =
    username.charAt(0).toUpperCase();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    } finally {
      onClose();
    }
  };

  const menuItems = [
    {
      icon: User,
      label: "My Profile",
      action: () => {
        navigate("/profile");
        onClose();
      },
    },
    {
      icon: Settings,
      label: "Manage Account",
      action: () => {
        navigate("/account");
        onClose();
      },
    },
    {
      icon: Palette,
      label: "Appearance",
      action: () => {
        setActiveTab("theme");
        setIsModalOpen(true);
        onClose();
      },
    },
    {
      icon: Bell,
      label: "Notification Settings",
      action: () => {
        navigate("/notifications");
        onClose();
      },
    },
    {
      icon: LogOut,
      label: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
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
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-3xl border border-white/10 bg-forge-900/95 shadow-2xl backdrop-blur-3xl"
          role="menu"
          aria-label="Profile menu"
        >
          {/* Profile Header */}
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 text-white font-black italic shadow-lg"
                aria-hidden="true"
              >
                {avatarLetter}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold italic tracking-tight text-white">
                  {username}
                </p>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Seeker
                </p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={item.action}
                  className="group flex w-full items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-white/5"
                >
                  <Icon
                    size={18}
                    className="text-slate-400 transition-colors group-hover:text-white"
                    aria-hidden="true"
                  />

                  <span className="text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileDropdown;
