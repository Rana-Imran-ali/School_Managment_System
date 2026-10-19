/**
 * Custom hook for checking permissions in components.
 */
import { useAuth } from '../context/AuthContext';
import { hasRouteAccess, hasFeatureAccess } from '../config/roles';

export function usePermission() {
  const { currentUser } = useAuth();

  return {
    /** Check if current user can access a route path */
    canAccessRoute: (path: string) => hasRouteAccess(currentUser.role, path),

    /** Check if current user has a specific feature permission */
    canUseFeature: (feature: string) => hasFeatureAccess(currentUser.role, feature),

    /** Current user role for conditional rendering */
    role: currentUser.role,

    /** Convenience: is current user admin? */
    isAdmin: currentUser.role === 'admin',

    /** Convenience: is teacher or admin? */
    isStaff: currentUser.role === 'admin' || currentUser.role === 'teacher',
  };
}
