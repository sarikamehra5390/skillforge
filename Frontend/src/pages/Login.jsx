
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  LogIn,
} from "lucide-react";

import { toast } from "sonner";

import useAuthStore from "../store/useAuthStore";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import BrandMark from "../components/BrandMark";
import LoginSanctuaryIllustration from "../components/LoginSanctuaryIllustration";

const loginSchema = z.object({
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
});

const Login = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const login = useAuthStore(
    (state) => state.login
  );

  const loading = useAuthStore(
    (state) => state.loading
  );

  const error = useAuthStore(
    (state) => state.error
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData) => {
    try {
      const success = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!success) {
        toast.error(
          error ||
            "Invalid credentials. Please try again."
        );

        return;
      }

      toast.success(
        "Welcome back to your ritual."
      );

      const redirect =
        searchParams.get("redirect");

      const safeRedirect =
        redirect &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//")
          ? redirect
          : "/";

      navigate(safeRedirect, {
        replace: true,
      });
    } catch (loginError) {
      console.error(
        "Login failed:",
        loginError
      );

      toast.error(
        "Unable to sign in right now. Please try again."
      );
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row overflow-hidden"
      style={{
        backgroundColor: "var(--surface)",
      }}
    >
      {/* =====================================================
          Left Side: Auth Form
      ===================================================== */}

      <div
        className="w-full md:w-[45%] lg:w-[40%] flex flex-col justify-center p-8 md:p-16 lg:p-24 relative z-10 backdrop-blur-sm border-r"
        style={{
          backgroundColor: "rgba(0,0,0,0.1)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 mb-16 group"
          >
            <BrandMark className="group-hover:rotate-6 transition-transform duration-500" />

            <span
              className="text-2xl font-bold tracking-tighter italic"
              style={{
                color: "var(--text)",
              }}
            >
              SkillForge
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-10">
            <h1
              className="text-4xl font-bold mb-3 tracking-tight"
              style={{
                color: "var(--text)",
              }}
            >
              Welcome back
            </h1>

            <p
              className="font-medium"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              Continue your journey toward mastery.
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              {...register("email")}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              className="w-full py-4 rounded-2xl text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />

                  <span>
                    Opening the forge...
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    Enter the Forge
                  </span>
                </div>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-12 text-center">
            <p
              className="font-medium"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              New to the ritual?{" "}
              <Link
                to="/register"
                className="font-bold transition-all hover:underline decoration-2 underline-offset-4"
                style={{
                  color: "var(--accent)",
                }}
              >
                Forge an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          Right Side: Visuals & Quote
      ===================================================== */}

      <div className="login-sanctuary-panel hidden md:flex flex-1 relative flex-col items-center justify-center p-8 lg:p-12 overflow-hidden">
        <div className="login-sanctuary-atmosphere" aria-hidden="true">
          <div className="login-sanctuary-halo" />
          <div className="login-sanctuary-teal-glow" />
          <div className="login-sanctuary-orbit" />
          <div className="login-fireflies">
            <span style={{ left: "12%", top: "24%", animationDelay: "-2s" }} />
            <span style={{ left: "79%", top: "19%", animationDelay: "-7s" }} />
            <span style={{ left: "86%", top: "51%", animationDelay: "-4s" }} />
            <span style={{ left: "18%", top: "70%", animationDelay: "-9s" }} />
            <span style={{ left: "70%", top: "78%", animationDelay: "-1s" }} />
            <span style={{ left: "44%", top: "14%", animationDelay: "-5s" }} />
            <span style={{ left: "91%", top: "83%", animationDelay: "-3s" }} />
          </div>
        </div>

        {/* Twilight sanctuary illustration */}
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          <LoginSanctuaryIllustration />

          <div className="mt-9 lg:mt-11 text-center max-w-lg">
            <h3
              className="text-3xl lg:text-4xl font-bold italic mb-4 drop-shadow-[0_0_24px_rgba(196,181,253,0.32)]"
              style={{
                color: "var(--text)",
              }}
            >
              Your sanctuary awaits.
            </h3>

            <p
              className="font-medium leading-relaxed"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              Small steps today. A stronger you tomorrow.
            </p>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="absolute bottom-7 lg:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-45 pointer-events-none">
          <div
            className="h-[1px] w-12"
            style={{
              backgroundColor: "var(--border)",
            }}
          />

          <span
            className="text-[10px] font-bold uppercase tracking-[0.3em]"
            style={{
              color: "var(--text)",
            }}
          >
            Personal Growth Companion
          </span>

          <div
            className="h-[1px] w-12"
            style={{
              backgroundColor: "var(--border)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
