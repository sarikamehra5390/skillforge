import React, { useState } from "react";
import { User, Mail, Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import GlassCard from "../components/common/GlassCard";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const ManageAccount = () => {
  const { user, updateProfile, loading } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    displayName: user?.displayName || "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return;
    }

    const updateData = {
      username: formData.username,
      email: formData.email,
      displayName: formData.displayName,
    };
    if (formData.newPassword) updateData.password = formData.newPassword;

    await updateProfile(updateData);
  };

  return (
    <div className="space-y-8 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <h1 className="text-3xl font-bold text-white italic">Manage Account</h1>

      <GlassCard className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Username
            </label>
            <Input
              icon={User}
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Display Name
            </label>
            <Input
              icon={User}
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              placeholder="Enter display name"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Email
            </label>
            <Input
              icon={Mail}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter email"
              type="email"
            />
          </div>
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-bold text-white italic mb-4">
              Change Password
            </h3>
            <div className="space-y-4">
              <Input
                icon={Lock}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                placeholder="New password"
                type="password"
              />
              <Input
                icon={Lock}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Confirm password"
                type="password"
              />
            </div>
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Save Changes
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

export default ManageAccount;
