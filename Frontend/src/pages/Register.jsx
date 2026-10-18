import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import useAuthStore from "../store/useAuthStore";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import BrandMark from "../components/BrandMark";

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
  const navigate = useNavigate();

  const registerUser = useAuthStore(
    (state) => state.register
  );

  const loading = useAuthStore(
    (state) => state.loading
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
    <div className="min-h-screen bg-forge-950 flex flex-col md:flex-row overflow-hidden ambient-bg">
      {/* Left Side: Auth Form */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col justify-center p-8 md:p-16 lg:p-24 relative z-10 bg-forge-950/50 backdrop-blur-sm border-r border-white/5">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 mb-12 group"
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
              type="password"
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
              autoComplete="new-password"
              className="bg-white/5 border-white/10 focus:border-primary-500/50"
            />

            <Input
              label="Confirm Secret"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              className="bg-white/5 border-white/10 focus:border-primary-500/50"
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
      <div className="hidden md:flex flex-1 relative flex-col items-center justify-center p-12 overflow-hidden bg-forge-900/20">
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

        {/* Study Sanctuary Illustration */}
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          <div className="relative w-full max-w-[640px] overflow-hidden rounded-3xl shadow-2xl">
            <img src="/brand/skillforge-logo.png" alt="SkillForge — Empower your craft" className="block h-auto w-full" />
          </div>

          <div className="mt-12 text-center max-w-lg">
            <h3 className="text-3xl font-bold text-white italic mb-4">
              Your sanctuary awaits.
            </h3>

            <p className="text-slate-400 font-medium leading-relaxed">
              Create your account and start building
              your sanctuary of growth and mastery.
            </p>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-30">
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
