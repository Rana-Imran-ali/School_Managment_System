/**
 * ProtectedRoute – Wraps routes that require authentication.
 * Redirects unauthenticated users to /login.
 * Optionally checks role-based access.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasRouteAccess } from '../../config/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const location = useLocation();

  // Still checking auth state – show nothing (avoids flash)
  if (isLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner" />
        <p>Verifying session…</p>
      </div>
    );
  }

  // Not logged in → redirect to login, preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but no access to this specific route
  if (!hasRouteAccess(currentUser.role, location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
