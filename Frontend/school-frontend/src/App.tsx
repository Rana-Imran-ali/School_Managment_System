/**
 * App – Root component with route definitions.
 *
 * Route structure:
 *  /login          → Login page (guest only)
 *  /               → Dashboard (protected, all roles)
 *  /students       → Students (admin, teacher)
 *  /teachers       → Teachers (admin only)
 *  /academics      → Academic Setup (admin, teacher)
 *  /timetable      → Timetable (all roles)
 *  /attendance     → Attendance (all roles)
 *  /examinations   → Exams (all roles)
 *  /fees           → Fees (admin, parent)
 *  /announcements  → Notice Board (all roles)
 *  /messages       → Messages (all roles)
 *  /activity-logs  → Audit Trail (admin only)
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';

// Guards
import { ProtectedRoute, GuestRoute } from './components';

// Pages
import {
  LoginPage,
  Dashboard,
  Students,
  Teachers,
  Academics,
  Timetable,
  Attendance,
  Examinations,
  Fees,
  Announcements,
  Messages,
  ActivityLogs,
} from './pages';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route – Login */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />

          {/* Protected routes – require authentication */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="academics" element={<Academics />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="examinations" element={<Examinations />} />
            <Route path="fees" element={<Fees />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="messages" element={<Messages />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* Catch-all → login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
