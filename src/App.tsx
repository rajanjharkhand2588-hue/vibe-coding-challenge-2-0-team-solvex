import React from 'react';
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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#f8fafc',
          padding: 24,
          fontFamily: "'Inter', sans-serif",
          textAlign: 'center',
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 16,
            padding: '36px 28px',
            maxWidth: 480,
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 24,
              fontWeight: 700,
            }}>
              !
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px', color: '#ffffff' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 20px', lineHeight: 1.6 }}>
              {this.state.error?.message || 'An unexpected error occurred while loading this page.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Reload Page
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                style={{
                  background: '#334155',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
