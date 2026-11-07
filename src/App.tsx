import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OverviewPage from './pages/dashboard/OverviewPage';
import PlayersPage from './pages/dashboard/PlayersPage';
import AttendancePage from './pages/dashboard/AttendancePage';
import MatchesPage from './pages/dashboard/MatchesPage';
import ReadyPlayersPage from './pages/dashboard/ReadyPlayersPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import ScoutDashboard from './pages/ScoutDashboard';
import PlayerDashboard from './pages/PlayerDashboard';

function AuthRedirect() {
  const { user, profile, loading } = useAuth();
  if (loading || (user && !profile)) return <div className="loading-page"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === 'admin') return <Navigate to="/dashboard" replace />;
  if (profile?.role === 'scout') return <Navigate to="/scout" replace />;
  return <Navigate to="/player" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Auto redirect */}
          <Route path="/home" element={<AuthRedirect />} />

          {/* Coach/Admin Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="players" element={<PlayersPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="ready-players" element={<ReadyPlayersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Scout Dashboard */}
          <Route
            path="/scout"
            element={
              <ProtectedRoute allowedRoles={['scout']}>
                <ScoutDashboard />
              </ProtectedRoute>
            }
          />

          {/* Player Dashboard */}
          <Route
            path="/player"
            element={
              <ProtectedRoute allowedRoles={['player']}>
                <PlayerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
