/**
 * AuthContext – Provides authentication state across the app.
 *
 * Key behaviours:
 *  1. No auto-login: user MUST sign in via the Login page.
 *  2. On mount, checks for an existing token in localStorage and verifies
 *     it against the backend (/api/auth/me).  If valid the session resumes;
 *     otherwise the user is treated as unauthenticated.
 *  3. loginWithEmail sends credentials to /api/auth/login.
 *  4. logout clears token + state and redirects to /login.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Role } from '../types';
import { authService } from '../api/authService';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  status: string;
  student_profile?: {
    id: number;
    admission_number: string;
    roll_number?: string;
    current_class_id?: number;
    current_section_id?: number;
    school_class?: { id: number; name: string };
    section?: { id: number; name: string };
  };
  teacher_profile?: {
    id: number;
    employee_id: string;
    specialization?: string;
  };
  parent_profile?: {
    id: number;
  };
}

interface AuthContextType {
  /** Currently authenticated user (null when logged out) */
  currentUser: AuthUser;
  currentRole: Role;
  /** true while we're checking for an existing session on initial load */
  isLoading: boolean;
  /** true while a login/logout API call is in progress */
  isAuthenticating: boolean;
  /** true when user is logged in */
  isAuthenticated: boolean;
  /** Log in with email + password */
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  /** Register a new user account (student, teacher, parent) */
  registerUser: (payload: import('../api/authService').RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  /** Log out and clear session */
  logout: () => void;
}

/* ------------------------------------------------------------------ */
/*  Defaults / Placeholders                                            */
/* ------------------------------------------------------------------ */
const EMPTY_USER: AuthUser = {
  id: '',
  name: '',
  email: '',
  role: 'student',
  status: 'inactive',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser>(EMPTY_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);          // initial session check
  const [isAuthenticating, setIsAuthenticating] = useState(false); // login/logout call

  /* ---------- helpers ---------- */
  const mapApiUser = (apiUser: any): AuthUser => ({
    id: String(apiUser.id),
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role as Role,
    phone: apiUser.phone,
    avatar: apiUser.avatar,
    status: apiUser.status ?? 'active',
    student_profile: apiUser.student_profile || (apiUser.role === 'student' ? { id: apiUser.id, admission_number: `ADM-${apiUser.id}`, roll_number: `R-${apiUser.id}` } : undefined),
    teacher_profile: apiUser.teacher_profile || (apiUser.role === 'teacher' ? { id: apiUser.id, employee_id: `EMP-${apiUser.id}` } : undefined),
    parent_profile: apiUser.parent_profile || (apiUser.role === 'parent' ? { id: apiUser.id } : undefined),
  });

  /* ---------- check existing session on mount ---------- */
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const apiUser = await authService.getCurrentUser();
        if (apiUser) {
          setCurrentUser(mapApiUser(apiUser));
          setIsAuthenticated(true);
        }
      } catch {
        // Token expired / invalid – clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('active_user');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  /* ---------- login ---------- */
  const loginWithEmail = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsAuthenticating(true);
    try {
      const { user } = await authService.login({ email, password });
      if (user) {
        const mapped = mapApiUser(user);
        setCurrentUser(mapped);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  /* ---------- register ---------- */
  const registerUser = useCallback(async (payload: import('../api/authService').RegisterPayload): Promise<{ success: boolean; error?: string }> => {
    setIsAuthenticating(true);
    try {
      const { user } = await authService.register(payload);
      if (user) {
        // Account registered. Do NOT auto-login — user must sign in with credentials
        return { success: true };
      }
      return { success: false, error: 'Registration failed.' };
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.errors?.password?.[0] ||
        'Registration failed. Please check your information.';
      return { success: false, error: errorMsg };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  /* ---------- logout ---------- */
  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(EMPTY_USER);
    setIsAuthenticated(false);
  }, []);

  /* ---------- context value ---------- */
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        isLoading,
        isAuthenticating,
        isAuthenticated,
        loginWithEmail,
        registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
