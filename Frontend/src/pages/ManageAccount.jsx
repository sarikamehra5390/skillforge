import { useState } from "react";

import {
  User,
  Mail,
  Lock,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import useAuthStore from "../store/useAuthStore";

import GlassCard from "../components/common/GlassCard";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

import { toast } from "sonner";

const ManageAccount = () => {
  const navigate = useNavigate();

  const user = useAuthStore(
    (state) => state.user
  );

  const updateProfile = useAuthStore(
    (state) => state.updateProfile
  );

  const loading = useAuthStore(
    (state) => state.profileUpdating
  );

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    displayName: user?.displayName || "",
    newPassword: "",
    confirmPassword: "",
  });

  // ---------------------------------------------------------
  // Sync form with authenticated user
  // ---------------------------------------------------------

  // ---------------------------------------------------------
  // Input Handler
  // ---------------------------------------------------------

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ---------------------------------------------------------
  // Submit
  // ---------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    const username = formData.username.trim();
    const email = formData.email.trim();
    const displayName =
      formData.displayName.trim();
    const newPassword =
      formData.newPassword;
    const confirmPassword =
      formData.confirmPassword;

    // Username validation
    if (!username) {
      toast.error("Username is required.");
      return;
    }

    // Email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error(
        "Please enter a valid email address."
      );
      return;
    }

    // Password validation
    if (newPassword) {
      if (Array.from(newPassword).length < 15) {
        toast.error(
          "New password must be at least 15 characters."
        );
        return;
      }

      if (new TextEncoder().encode(newPassword).length > 72) {
        toast.error("New password must be 72 UTF-8 bytes or fewer.");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error(
          "Passwords don't match!"
        );
        return;
      }
    }

    const updateData = {
      username,
      email,
      displayName,
    };

    if (newPassword) {
      updateData.password = newPassword;
    }

    try {
      const result =
        await updateProfile(updateData);

      /*
       * If updateProfile returns false, treat it
       * as a failed update.
       *
       * If your store returns undefined after a
       * successful update, we still consider the
       * operation successful as long as it didn't throw.
       */
      if (result === false) {
        toast.error(
          "Unable to update your account."
        );
        return;
      }

      toast.success(
        "Account updated successfully."
      );

      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error(
        "Account update failed:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update your account."
      );
    }
  };

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

      <h1 className="text-3xl font-bold text-white italic">
        Manage Account
      </h1>

      <GlassCard className="p-4 sm:p-6 md:p-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
        >
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="text-sm font-medium text-slate-300 mb-2 block"
            >
              Username
            </label>

            <Input
              id="username"
              icon={User}
              value={formData.username}
              onChange={(event) =>
                handleChange(
                  "username",
                  event.target.value
                )
              }
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          {/* Display Name */}
          <div>
            <label
              htmlFor="displayName"
              className="text-sm font-medium text-slate-300 mb-2 block"
            >
              Display Name
            </label>

            <Input
              id="displayName"
              icon={User}
              value={formData.displayName}
              onChange={(event) =>
                handleChange(
                  "displayName",
                  event.target.value
                )
              }
              placeholder="Enter display name"
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-300 mb-2 block"
            >
              Email
            </label>

            <Input
              id="email"
              icon={Mail}
              value={formData.email}
              onChange={(event) =>
                handleChange(
                  "email",
                  event.target.value
                )
              }
              placeholder="Enter email"
              type="email"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-bold text-white italic mb-4">
              Change Password
            </h3>

            <div className="space-y-4">
              <Input
                id="newPassword"
                icon={Lock}
                value={formData.newPassword}
                onChange={(event) =>
                  handleChange(
                    "newPassword",
                    event.target.value
                  )
                }
                placeholder="New password"
                type="password"
                autoComplete="new-password"
                maxLength={72}
              />

              <Input
                id="confirmPassword"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={(event) =>
                  handleChange(
                    "confirmPassword",
                    event.target.value
                  )
                }
                placeholder="Confirm password"
                type="password"
                autoComplete="new-password"
                maxLength={72}
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {loading
              ? "Saving Changes..."
              : "Save Changes"}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

export default ManageAccount;
