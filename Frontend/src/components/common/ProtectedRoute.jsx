import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = () => {
  const {
    isAuthenticated,
    checkAuth,
    authChecking,
    authChecked,
    user,
  } = useAuthStore();

  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token && !authChecked) {
      checkAuth();
    }
  }, [token, authChecked, checkAuth]);

  // Still checking authentication
  if (authChecking || (token && !authChecked)) {
    return (
      <div className="ambient-bg flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center" role="status" aria-label="Checking your SkillForge session">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl">
          <img src="/brand/skillforge-fox.png" alt="" className="h-16 w-16 object-contain" />
          <span className="absolute -bottom-1 -right-1 h-5 w-5 animate-spin rounded-full border-[3px] border-primary-400 border-t-transparent" />
        </div>
        <div>
          <p className="text-lg font-bold tracking-wide text-white">Opening your sanctuary</p>
          <p className="mt-1 text-sm text-white/65">Checking your saved ritual and settings…</p>
        </div>
      </div>
    );
  }

  // No authenticated user
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
