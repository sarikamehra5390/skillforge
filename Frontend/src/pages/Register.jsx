import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "sonner";

import useAuthStore from "../store/useAuthStore";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import BrandMark from "../components/BrandMark";
import LoginSanctuaryIllustration from "../components/LoginSanctuaryIllustration";

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(
        3,
        "Username must be at least 3 characters"
      ),

    email: z
      .string()
      .trim()
      .email("Invalid email address"),

    password: z
      .string()
      .min(
        6,
        "Password must be at least 6 characters"
      ),

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

const Register = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const navigate = useNavigate();

  const registerUser = useAuthStore(
    (state) => state.register
  );

  const loading = useAuthStore(
    (state) => state.registerLoading
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    const username = data.username.trim();
    const email = data.email.trim();

    try {
      const result = await registerUser({
        username,
        email,
        password: data.password,
      });

      if (!result) {
        toast.error(
          "The forge is busy. Please try again."
        );
        return;
      }

      toast.success(
        "Your journey begins now. Welcome to the Forge."
      );

      const params = new URLSearchParams(
        window.location.search
      );

      const redirect = params.get("redirect");

      if (
        redirect &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//")
      ) {
        navigate(redirect, {
          replace: true,
        });
      } else {
        navigate("/", {
          replace: true,
        });
      }
    } catch (error) {
      console.error(
        "Registration failed:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "The forge is busy. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-forge-950 flex flex-col md:flex-row overflow-x-hidden ambient-bg">
      {/* Left Side: Auth Form */}
      <div className="order-2 w-full md:order-1 md:w-[45%] lg:w-[42%] flex flex-col justify-center px-5 py-8 sm:px-8 md:p-12 lg:p-16 relative z-10 bg-forge-950/50 backdrop-blur-sm border-r border-white/5">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 mb-8 md:mb-10 group"
          >
            <BrandMark className="group-hover:rotate-6 transition-transform duration-500" />

            <span className="text-2xl font-bold text-white tracking-tighter italic">
              SkillForge
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Create your path
            </h1>

            <p className="text-slate-400 font-medium">
              Join a community of dedicated learners.
            </p>
          </div>

          {/* Registration Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <Input
              label="Chosen Name"
              placeholder="johndoe"
              {...register("username")}
              error={errors.username?.message}
              autoComplete="username"
              className="bg-white/5 border-white/10 focus:border-primary-500/50"
            />

            <Input
              label="Email Address"
              placeholder="name@example.com"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              autoComplete="email"
              className="bg-white/5 border-white/10 focus:border-primary-500/50"
            />

            <Input
              label="Secret Password"
              type={passwordVisible ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
              autoComplete="new-password"
              className="bg-white/5 border-white/10 focus:border-primary-500/50"
              endAdornment={<button type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? "Hide password" : "Show password"} aria-pressed={passwordVisible} className="rounded-md p-1 text-violet-200/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">{passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
            />

            <Input
              label="Confirm Secret"
              type={confirmVisible ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              className="bg-white/5 border-white/10 focus:border-primary-500/50"
              endAdornment={<button type="button" onClick={() => setConfirmVisible((visible) => !visible)} aria-label={confirmVisible ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={confirmVisible} className="rounded-md p-1 text-violet-200/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">{confirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
            />

            <Button
              type="submit"
              className="w-full py-4 rounded-2xl shadow-xl shadow-primary-500/20 text-base"
              disabled={loading}
              loading={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span>Forging account...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus
                    size={18}
                    aria-hidden="true"
                  />
                  <span>Begin the Ritual</span>
                </div>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-10 text-center">
            <p className="text-slate-500 font-medium">
              Already have a path?{" "}
              <Link
                to="/login"
                className="text-primary-400 hover:text-primary-300 font-bold transition-all hover:underline decoration-2 underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Visuals & Quote */}
      <div className="login-sanctuary-panel order-1 flex min-h-[250px] sm:min-h-[300px] md:order-2 md:min-h-screen md:flex-1 relative flex-col items-center justify-center px-5 py-6 md:p-12 overflow-hidden">
        {/* Animated Background Elements */}
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] animate-glow-pulse"
          aria-hidden="true"
        />

        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary-500/5 rounded-full blur-[120px] animate-glow-pulse"
          style={{
            animationDelay: "2s",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          <LoginSanctuaryIllustration />
        </div>

        {/* Branding Footer */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 opacity-35">
          <div
            className="h-[1px] w-12 bg-white/20"
            aria-hidden="true"
          />

          <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em] whitespace-nowrap">
            Personal Growth Companion
          </span>

          <div
            className="h-[1px] w-12 bg-white/20"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
