import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, Sparkles, Zap, Flame, Trophy, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Illustration from '../components/common/Illustration';
import { toast } from 'sonner';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register = () => {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const { username, email, password } = data;
    const success = await registerUser({ username, email, password });
    if (success) {
      toast.success('Your journey begins now. Welcome to the Forge.');
      navigate('/');
    } else {
      toast.error(error || 'The forge is busy. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-forge-950 flex flex-col md:flex-row overflow-hidden ambient-bg">
      
      {/* Left Side: Auth Form */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col justify-center p-8 md:p-16 lg:p-24 relative z-10 bg-forge-950/50 backdrop-blur-sm border-r border-white/5">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12 group">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:rotate-6 transition-transform duration-500">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tighter italic">SkillForge</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Create your path</h1>
            <p className="text-slate-400 font-medium">Join a community of dedicated learners.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Chosen Name"
              placeholder="johndoe"
              {...register('username')}
              error={errors.username?.message}
              className="bg-white/5 border-white/10 focus:border-primary-500/50"
            />
            <Input
              label="Email Address"
              placeholder="name@example.com"
              {...register('email')}
              error={errors.email?.message}
              className="bg-white/5 border-white/10 focus:border-primary-500/50"
            />
            <Input
              label="Secret Password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
              className="bg-white/5 border-white/10 focus:border-primary-500/50"
            />
            <Input
              label="Confirm Secret"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              className="bg-white/5 border-white/10 focus:border-primary-500/50"
            />

            <Button
              type="submit"
              className="w-full py-4 rounded-2xl shadow-xl shadow-primary-500/20 text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Forging account...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus size={18} />
                  <span>Begin the Ritual</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-medium">
              Already have a path?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold transition-all hover:underline decoration-2 underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Visuals & Quote */}
      <div className="hidden md:flex flex-1 relative flex-col items-center justify-center p-12 overflow-hidden bg-forge-900/20">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary-500/5 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Study Sanctuary Illustration */}
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[500px]">
            <Illustration name="studySanctuary" className="w-full h-full opacity-90" />
          </div>
          
          <div className="mt-12 text-center max-w-lg">
            <h3 className="text-3xl font-bold text-white italic mb-4">Your sanctuary awaits.</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              Create your account and start building your sanctuary of growth and mastery.
            </p>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-30">
          <div className="h-[1px] w-12 bg-white/20" />
          <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Personal Growth Companion</span>
          <div className="h-[1px] w-12 bg-white/20" />
        </div>
      </div>
    </div>
  );
};

export default Register;
