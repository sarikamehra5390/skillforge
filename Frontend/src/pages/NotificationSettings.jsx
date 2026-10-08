import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Mail,
  Flame,
  Trophy,
  Trees,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import useAuthStore from "../store/useAuthStore";

import GlassCard from "../components/common/GlassCard";
import Button from "../components/common/Button";

const defaultSettings = {
  dailyReminders: true,
  friendNotifications: true,
  achievementNotifications: true,
  streakNotifications: true,
  gardenNotifications: true,
  emailNotifications: false,
};

const NotificationSettings = () => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore(
    (state) => state.updateProfile
  );

  const [loading, setLoading] = useState(false);

  const initialSettings = {
    ...defaultSettings,
    ...(user?.notificationSettings || {}),
  };
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);

  // ---------------------------------------------------------
  // Detect whether anything changed
  // ---------------------------------------------------------

  const hasChanges = useMemo(() => {
    return Object.keys(defaultSettings).some(
      (key) =>
        settings[key] !== savedSettings[key]
    );
  }, [settings, savedSettings]);

  // ---------------------------------------------------------
  // Toggle setting
  // ---------------------------------------------------------

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ---------------------------------------------------------
  // Save settings
  // ---------------------------------------------------------

  const handleSave = async () => {
    if (loading || !hasChanges) return;

    setLoading(true);

    try {
      const result = await updateProfile({
        notificationSettings: settings,
      });

      if (result === false) {
        toast.error(
          "Failed to save notification settings."
        );
        return;
      }

      setSavedSettings({
        ...settings,
      });

      toast.success(
        "Notification settings saved!"
      );
    } catch (error) {
      console.error(
        "Failed to save notification settings:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Notification options
  // ---------------------------------------------------------

  const toggleItems = [
    {
      key: "dailyReminders",
      icon: Flame,
      label: "Daily Reminders",
      description: "Reminders to practice daily",
    },
    {
      key: "friendNotifications",
      icon: Bell,
      label: "Friend Notifications",
      description:
        "When friends send requests or encouragement",
    },
    {
      key: "achievementNotifications",
      icon: Trophy,
      label: "Achievement Notifications",
      description:
        "When you unlock an achievement",
    },
    {
      key: "streakNotifications",
      icon: Flame,
      label: "Streak Notifications",
      description:
        "Updates about your practice streak",
    },
    {
      key: "gardenNotifications",
      icon: Trees,
      label: "Garden Notifications",
      description:
        "Updates about the community garden",
    },
    {
      key: "emailNotifications",
      icon: Mail,
      label: "Email Notifications",
      description:
        "Receive important updates via email",
    },
  ];

  return (
    <div className="space-y-8 pb-24">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft
          size={20}
          aria-hidden="true"
        />
        Back
      </button>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-white italic">
        Notification Settings
      </h1>

      <GlassCard className="p-8 space-y-6">
        {toggleItems.map((item) => {
          const Icon = item.icon;
          const enabled = Boolean(
            settings[item.key]
          );

          return (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/5"
            >
              {/* Setting information */}
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="p-3 rounded-xl bg-primary-500/10 text-primary-400 shrink-0"
                  aria-hidden="true"
                >
                  <Icon size={24} />
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-white">
                    {item.label}
                  </p>

                  <p className="text-sm text-slate-400">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={item.label}
                onClick={() =>
                  handleToggle(item.key)
                }
                className={`w-14 h-7 rounded-full transition-all relative shrink-0 ${
                  enabled
                    ? "bg-primary-500"
                    : "bg-slate-600"
                }`}
              >
                <motion.div
                  layout
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md ${
                    enabled
                      ? "left-8"
                      : "left-1"
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>
          );
        })}

        {/* Save */}
        <Button
          type="button"
          onClick={handleSave}
          loading={loading}
          disabled={loading || !hasChanges}
          className="w-full mt-4"
        >
          {loading
            ? "Saving Settings..."
            : "Save Settings"}
        </Button>
      </GlassCard>
    </div>
  );
};

export default NotificationSettings;
