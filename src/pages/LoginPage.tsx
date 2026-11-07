import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Loader2, Volleyball, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOutToSwitch = async () => {
    await signOut();
    toast.success('Signed out. Please enter your credentials.');
  };

  const handleGoToDashboard = () => {
    const role = profile?.role || (user?.user_metadata?.role as string) || 'admin';
    const dest = role === 'admin' ? '/dashboard' : role === 'scout' ? '/scout' : '/player';
    navigate(dest, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    setLoading(true);
    const { error, profile: loggedInProfile, data } = await signIn(cleanEmail, password);
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      return;
    }

    toast.success('Signed in successfully!');

    // Immediate navigation based on role
    const role = loggedInProfile?.role || (data?.user?.user_metadata?.role as string) || 'admin';
    const dest = role === 'admin' ? '/dashboard' : role === 'scout' ? '/scout' : '/player';
    navigate(dest, { replace: true });
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Volleyball size={28} color="white" />
          </div>
          <h1 className="auth-title">Academy Desk</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <div className="auth-body">
          {/* Active session notification banner */}
          {user && (
            <div className="auth-active-session-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <CheckCircle2 size={16} color="#2563eb" />
                <span style={{ fontWeight: 600, color: '#1e40af', fontSize: 13 }}>
                  Active Session Detected
                </span>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 13, color: '#334155', wordBreak: 'break-all' }}>
                Signed in as <strong>{user.email}</strong> ({profile?.role || 'user'})
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleGoToDashboard}
                  style={{ flex: 1, minWidth: 120 }}
                >
                  Go to Dashboard <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleSignOutToSwitch}
                  style={{ background: 'white', flex: 1, minWidth: 120 }}
                >
                  <LogOut size={14} /> Switch Account
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? <Loader2 size={18} className="spinner-sm" /> : <LogIn size={18} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#6366f1', fontWeight: 600 }}>Register</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
