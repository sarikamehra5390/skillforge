import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = () => {
  const {
    isAuthenticated,
    checkAuth,
    loading,
    user,
  } = useAuthStore();

  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token && !user && !loading) {
      checkAuth();
    }
  }, [token, user, loading, checkAuth]);

  // Still checking authentication
  if (loading || (token && !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"
          aria-label="Checking authentication"
          role="status"
        />
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