import { useState } from 'react';
import { Settings, User, Lock, Info, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { profile } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success('Password updated!'); setNewPassword(''); setConfirmPassword(''); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={24} color="#6366f1" /> Settings</h1>
      </div>

      <div style={{ display: 'grid', gap: 24, maxWidth: 640 }}>
        {/* Profile */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}><User size={18} /> Profile</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label className="form-label">Name</label>
                <p style={{ margin: 0, fontWeight: 500, color: '#0f172a' }}>{profile?.full_name}</p>
              </div>
              <div>
                <label className="form-label">Email</label>
                <p style={{ margin: 0, color: '#475569' }}>{profile?.email}</p>
              </div>
              <div>
                <label className="form-label">Role</label>
                <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{profile?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}><Lock size={18} /> Change Password</h3>
          </div>
          <form onSubmit={handleChangePassword}>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />} Update Password
              </button>
            </div>
          </form>
        </div>

        {/* About */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}><Info size={18} /> About</h3>
          </div>
          <div className="card-body">
            <h4 style={{ margin: '0 0 4px' }}>Academy Desk</h4>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Sports Academy Management System</p>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 8 }}>
              Every Player. Every Practice. Every Performance.
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

