import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, Sparkles, Zap, Flame, Trophy, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Illustration from '../components/common/Illustration';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const success = await login(data);
    if (success) {
      toast.success('Welcome back to your ritual.');
      navigate('/');
    } else {
      toast.error(error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden" style={{ backgroundColor: 'var(--surface)' }}>
      
      {/* Left Side: Auth Form */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col justify-center p-8 md:p-16 lg:p-24 relative z-10 backdrop-blur-sm border-r" style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderColor: 'var(--border)' }}>
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-16 group">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-500"
              style={{ background: 'var(--button)', boxShadow: 'var(--shadow)' }}
            >
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tighter italic" style={{ color: 'var(--text)' }}>SkillForge</span>
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3 tracking-tight" style={{ color: 'var(--text)' }}>Welcome back</h1>
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Continue your journey toward mastery.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              placeholder="name@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />
              <div className="flex justify-end">
                <button type="button" className="text-xs font-bold transition-colors uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  Forgot path?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-4 rounded-2xl text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Opening the forge...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn size={18} />
                  <span>Enter the Forge</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-12 text-center">
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
              New to the ritual?{' '}
              <Link to="/register" className="font-bold transition-all hover:underline decoration-2 underline-offset-4" style={{ color: 'var(--accent)' }}>
                Forge an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Visuals & Quote */}
      <div className="hidden md:flex flex-1 relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] animate-glow-pulse" style={{ backgroundColor: 'var(--accent-light)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] animate-glow-pulse" style={{ backgroundColor: 'var(--accent-light)', animationDelay: '2s' }} />
        
        {/* Study Sanctuary Illustration */}
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[500px]">
            <Illustration name="studySanctuary" className="w-full h-full opacity-90" />
          </div>
          
          <div className="mt-12 text-center max-w-lg">
            <h3 className="text-3xl font-bold italic mb-4" style={{ color: 'var(--text)' }}>Your sanctuary awaits.</h3>
            <p className="font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Step back into the warmth of your study room. Every ritual you perform here brings you closer to the master you are becoming.
            </p>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-30">
          <div className="h-[1px] w-12" style={{ backgroundColor: 'var(--border)' }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--text)' }}>Personal Growth Companion</span>
          <div className="h-[1px] w-12" style={{ backgroundColor: 'var(--border)' }} />
        </div>
      </div>
    </div>
  );
};

export default Login;
