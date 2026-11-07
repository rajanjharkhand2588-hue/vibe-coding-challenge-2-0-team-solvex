import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Loader2, Volleyball, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'scout' | 'player'>('player');
  const [loading, setLoading] = useState(false);
  const { signUp, user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOutToRegister = async () => {
    await signOut();
    toast.success('Signed out. You can now register a new account.');
  };

  const handleGoToDashboard = () => {
    const destRole = profile?.role || (user?.user_metadata?.role as string) || 'player';
    const dest = destRole === 'admin' ? '/dashboard' : destRole === 'scout' ? '/scout' : '/player';
    navigate(dest, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      toast.error('Please enter your full name');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const { error, profile: newProfile } = await signUp(cleanEmail, password, cleanName, role);
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
      return;
    }

    toast.success('Account created successfully!');

    // Automatically navigate to role destination
    const userRole = newProfile?.role || role;
    const dest = userRole === 'admin' ? '/dashboard' : userRole === 'scout' ? '/scout' : '/player';
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Academy Desk Management Platform</p>
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
                  onClick={handleSignOutToRegister}
                  style={{ background: 'white', flex: 1, minWidth: 120 }}
                >
                  <LogOut size={14} /> Switch / New
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

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
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'scout' | 'player')}
              >
                <option value="player">Player</option>
                <option value="admin">Admin / Coach</option>
                <option value="scout">Scout</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? <Loader2 size={18} className="spinner-sm" /> : <UserPlus size={18} />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#6366f1', fontWeight: 600 }}>Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
