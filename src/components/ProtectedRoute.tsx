import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading, signOut } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let timer: any;
    if (loading || (user && !profile)) {
      timer = setTimeout(() => {
        setTimedOut(true);
      }, 3500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, user, profile]);

  if (loading || (user && !profile && !timedOut)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f8fafc',
        padding: 20,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <Loader2
            size={44}
            style={{
              animation: 'spin 1s linear infinite',
              color: '#6366f1',
              margin: '0 auto',
            }}
          />
          <p style={{ marginTop: 16, color: '#64748b', fontSize: 14, fontWeight: 500 }}>
            Loading your session...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Safety fallback if waiting for profile took too long
  if (timedOut && user && !profile) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f8fafc',
        padding: 20,
      }}>
        <div className="card" style={{ maxWidth: 420, padding: 24, textAlign: 'center' }}>
          <h3 style={{ marginBottom: 8, color: '#0f172a' }}>Syncing Session...</h3>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
            You are signed in as <strong>{user.email}</strong>. If the page doesn't load shortly, please refresh or sign in again.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>
              Reload
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={async () => {
                await signOut();
                window.location.href = '/login';
              }}
            >
              Sign In Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Determine effective role
  const effectiveRole: UserRole = profile?.role || (user.user_metadata?.role as UserRole) || 'player';

  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    const roleRedirects: Record<UserRole, string> = {
      admin: '/dashboard',
      scout: '/scout',
      player: '/player',
    };
    const redirectTo = roleRedirects[effectiveRole] || '/login';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
