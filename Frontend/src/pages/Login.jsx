
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  Mail,
  Sparkles,
} from "lucide-react";

import { toast } from "sonner";

import useAuthStore from "../store/useAuthStore";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import BrandMark from "../components/BrandMark";
import LoginSanctuaryIllustration from "../components/LoginSanctuaryIllustration";
import { getLoginButtonState } from "../utils/loginButtonState";
import {
  createLoginSubmissionRunner,
  getSafePostLoginRedirect,
} from "../utils/loginSubmission";

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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slowRequestNotice, setSlowRequestNotice] = useState(false);
  const [submitLogin] = useState(() => createLoginSubmissionRunner((value) => {
    setIsSubmitting(value);
    if (value) setSlowRequestNotice(false);
  }));
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const login = useAuthStore(
    (state) => state.login
  );

  const loginButtonState = getLoginButtonState(isSubmitting);

  useEffect(() => {
    if (!isSubmitting) {
      return undefined;
    }

    const noticeTimer = window.setTimeout(() => setSlowRequestNotice(true), 5000);
    return () => window.clearTimeout(noticeTimer);
  }, [isSubmitting]);

  const authChecked = useAuthStore((state) => state.authChecked);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    if (localStorage.getItem("token") && !authChecked) {
      checkAuth();
    }
  }, [authChecked, checkAuth]);

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

  const onSubmit = (formData) =>
    submitLogin(async () => {
      try {
        const success = await login({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (!success) return false;

        toast.success("Welcome back to your ritual.");
        navigate(getSafePostLoginRedirect(searchParams), { replace: true });
        return true;
      } catch (loginError) {
        console.error("Login failed:", loginError);
        toast.error("Unable to sign in right now. Please try again.");
        return false;
      }
    });

  return (
    <div
      className="min-h-dvh flex flex-col md:flex-row"
      style={{
        backgroundColor: "var(--surface)",
      }}
    >
      {/* =====================================================
          Left Side: Auth Form
      ===================================================== */}

      <div
        className="order-2 w-full md:order-1 md:w-[45%] lg:w-[42%] flex flex-col justify-center px-5 py-8 sm:px-8 md:p-12 lg:p-16 relative z-10 backdrop-blur-sm border-r"
        style={{
          backgroundColor: "rgba(0,0,0,0.1)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 mb-8 md:mb-12 group"
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
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
              <Sparkles size={14} aria-hidden="true" /> Welcome to your sanctuary
            </div>
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
              icon={Mail}
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              {...register("email")}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              icon={KeyRound}
              type={passwordVisible ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
              error={errors.password?.message}
              endAdornment={(
                <button
                  type="button"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                  aria-pressed={passwordVisible}
                  className="rounded-md p-1 text-violet-200/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            />

            <Button
              type="submit"
              className="w-full py-4 rounded-2xl text-base shadow-lg shadow-fuchsia-500/20"
              disabled={loginButtonState.disabled}
            >
              {loginButtonState.showSpinner ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />

                  <span>
                    {loginButtonState.label}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    {loginButtonState.label}
                  </span>
                </div>
              )}
            </Button>
            {isSubmitting && slowRequestNotice && (
              <p className="-mt-3 text-center text-xs leading-relaxed text-violet-200/75" role="status" aria-live="polite">
                Still waiting for the server. It may take longer after a period of inactivity; if the request times out, you can safely try again.
              </p>
            )}
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
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

      <div className="login-sanctuary-panel order-1 flex min-h-[250px] sm:min-h-[300px] md:order-2 md:min-h-screen md:flex-1 relative flex-col items-center justify-center px-5 py-6 md:p-8 lg:p-12 overflow-hidden">
        <div className="login-sanctuary-atmosphere" aria-hidden="true">
          <div className="login-sanctuary-teal-glow" />
          <div className="login-fireflies">
            {Array.from({ length: 7 }, (_, index) => <span key={index} style={{ left: `${12 + index * 12}%`, top: `${19 + ((index * 23) % 65)}%`, animationDelay: `${-index * 1.7}s` }} />)}
          </div>
        </div>

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          <LoginSanctuaryIllustration />
        </div>

        {/* Branding Footer */}
        <div className="absolute bottom-4 md:bottom-7 lg:bottom-12 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 opacity-45 pointer-events-none">
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
