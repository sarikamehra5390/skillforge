import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = () => {
  const { isAuthenticated, checkAuth, loading, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token && !user && !loading) {
      checkAuth();
    }
  }, [user, loading, checkAuth]);

  // Still checking authentication
  if (loading || (localStorage.getItem('token') && !user)) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
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