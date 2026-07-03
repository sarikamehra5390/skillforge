import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Mail, Flame, Trophy, Trees } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useAuthStore from "../store/useAuthStore";
import api from "../api/axios";
import GlassCard from "../components/common/GlassCard";
import Button from "../components/common/Button";

const NotificationSettings = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(user?.notificationSettings || {
    dailyReminders: true,
    friendNotifications: true,
    achievementNotifications: true,
    gardenNotifications: true,
    emailNotifications: false,
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put("/users/profile", { notificationSettings: settings });
      updateUser(res.data);
      toast.success("Notification settings saved!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const toggleItems = [
    { key: "dailyReminders", icon: Flame, label: "Daily Reminders", description: "Reminders to practice daily" },
    { key: "friendNotifications", icon: Bell, label: "Friend Notifications", description: "When friends send requests or encouragement" },
    { key: "achievementNotifications", icon: Trophy, label: "Achievement Notifications", description: "When you unlock an achievement" },
    { key: "gardenNotifications", icon: Trees, label: "Garden Notifications", description: "Updates about the community garden" },
    { key: "emailNotifications", icon: Mail, label: "Email Notifications", description: "Receive important updates via email" },
  ];

  return (
    <div className="space-y-8 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <h1 className="text-3xl font-bold text-white italic">Notification Settings</h1>

      <GlassCard className="p-8 space-y-6">
        {toggleItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400">
                <item.icon size={24} />
              </div>
              <div>
                <p className="font-medium text-white">{item.label}</p>
                <p className="text-sm text-slate-400">{item.description}</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(item.key)}
              className={`w-14 h-7 rounded-full transition-all relative ${settings[item.key] ? "bg-primary-500" : "bg-slate-600"}`}
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md ${settings[item.key] ? "left-8" : ""}`}
              />
            </button>
          </div>
        ))}
        <Button onClick={handleSave} loading={loading} className="w-full mt-4">
          Save Settings
        </Button>
      </GlassCard>
    </div>
  );
};

export default NotificationSettings;
