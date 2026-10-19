/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines which routes and features each role can access.
 */
import type { Role } from '../types';

export interface RoutePermission {
  path: string;
  label: string;
  allowedRoles: Role[];
}

/**
 * Route-level access control matrix.
 * Admin has full access; other roles have limited views.
 */
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  { path: '/',              label: 'Dashboard',       allowedRoles: ['admin', 'teacher', 'student', 'parent'] },
  { path: '/students',      label: 'Students',        allowedRoles: ['admin', 'teacher'] },
  { path: '/teachers',      label: 'Teachers',        allowedRoles: ['admin'] },
  { path: '/academics',     label: 'Academic Setup',  allowedRoles: ['admin', 'teacher'] },
  { path: '/timetable',     label: 'Timetable',       allowedRoles: ['admin', 'teacher', 'student', 'parent'] },
  { path: '/attendance',    label: 'Attendance',       allowedRoles: ['admin', 'teacher', 'student', 'parent'] },
  { path: '/examinations',  label: 'Exams & Marks',   allowedRoles: ['admin', 'teacher', 'student', 'parent'] },
  { path: '/fees',          label: 'Fee Management',  allowedRoles: ['admin', 'parent'] },
  { path: '/announcements', label: 'Notice Board',    allowedRoles: ['admin', 'teacher', 'student', 'parent'] },
  { path: '/messages',      label: 'Messages',        allowedRoles: ['admin', 'teacher', 'student', 'parent'] },
  { path: '/activity-logs', label: 'Audit Trail',     allowedRoles: ['admin'] },
];

/** Check if a given role is allowed on a specific route path */
export function hasRouteAccess(role: Role, path: string): boolean {
  const routeConfig = ROUTE_PERMISSIONS.find((r) => r.path === path);
  if (!routeConfig) return false;
  return routeConfig.allowedRoles.includes(role);
}

/** Get all permitted routes for a given role */
export function getPermittedRoutes(role: Role): RoutePermission[] {
  return ROUTE_PERMISSIONS.filter((r) => r.allowedRoles.includes(role));
}

/**
 * Feature-level permissions within pages.
 * e.g. a student can view their own attendance but cannot mark attendance.
 */
export const FEATURE_PERMISSIONS: Record<string, Role[]> = {
  'students.create':      ['admin'],
  'students.edit':        ['admin'],
  'students.delete':      ['admin'],
  'teachers.create':      ['admin'],
  'teachers.edit':        ['admin'],
  'teachers.delete':      ['admin'],
  'attendance.mark':      ['admin', 'teacher'],
  'attendance.view':      ['admin', 'teacher', 'student', 'parent'],
  'exams.create':         ['admin'],
  'exams.grade':          ['admin', 'teacher'],
  'exams.view':           ['admin', 'teacher', 'student', 'parent'],
  'fees.create':          ['admin'],
  'fees.record_payment':  ['admin'],
  'fees.view':            ['admin', 'parent', 'student'],
  'announcements.create': ['admin', 'teacher'],
  'announcements.view':   ['admin', 'teacher', 'student', 'parent'],
  'messages.send':        ['admin', 'teacher', 'student', 'parent'],
  'activity_logs.view':   ['admin'],
  'timetable.manage':     ['admin'],
  'timetable.view':       ['admin', 'teacher', 'student', 'parent'],
  'academics.manage':     ['admin'],
};

/** Check if a role has a specific feature permission */
export function hasFeatureAccess(role: Role, feature: string): boolean {
  const allowed = FEATURE_PERMISSIONS[feature];
  if (!allowed) return false;
  return allowed.includes(role);
}
