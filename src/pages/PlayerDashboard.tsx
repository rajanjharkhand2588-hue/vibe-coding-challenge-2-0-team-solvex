import { useEffect, useState } from 'react';
import { LogOut, Volleyball, Star, ClipboardCheck, Trophy, TrendingUp, Check, X as XIcon } from 'lucide-react';
import { getPlayerByUserId } from '../lib/players';
import { getPlayerReadinessById } from '../lib/readiness';
import { getAttendanceByPlayer } from '../lib/attendance';
import { getMatchesByPlayer } from '../lib/matches';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Player, PlayerReadiness, AttendanceWithSession, MatchWithParticipants } from '../types';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function PlayerDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [readiness, setReadiness] = useState<PlayerReadiness | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceWithSession[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    let { data: playerData } = await getPlayerByUserId(user!.id);

    // If player record does not exist yet, auto-create one
    if (!playerData && user) {
      try {
        const playerCode = `PL-${Math.floor(100 + Math.random() * 900)}`;
        const { data: newP } = await supabase.from('players').insert({
          player_code: playerCode,
          full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player',
          age: 18,
          sport: 'Cricket',
          joining_date: new Date().toISOString().split('T')[0],
          active: true,
          user_id: user.id,
          created_by: user.id,
        }).select().maybeSingle();

        if (newP) {
          playerData = newP as Player;
        }
      } catch (pErr) {
        console.warn('Player auto-create notice:', pErr);
      }
    }

    if (!playerData) {
      setLoading(false);
      return;
    }
    setPlayer(playerData);

    const [readinessRes, attendanceRes, matchesRes] = await Promise.all([
      getPlayerReadinessById(playerData.id),
      getAttendanceByPlayer(playerData.id),
      getMatchesByPlayer(playerData.id),
    ]);

    if (readinessRes.data) setReadiness(readinessRes.data);
    setAttendanceHistory(attendanceRes.data);
    setMatchHistory(matchesRes.data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!player) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Volleyball size={18} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: 18 }}>My Dashboard</h1>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleSignOut}><LogOut size={14} /> Sign Out</button>
      </header>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state">
          <h3>No player profile linked</h3>
          <p>Contact your coach to link your account to a player profile.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header className="standalone-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Volleyball size={18} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>My Dashboard</h1>
            <p className="standalone-subtitle" style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Academy Desk</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="player-welcome-name" style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>
            {profile?.full_name}
          </span>
          <button className="btn btn-outline btn-sm" onClick={handleSignOut}><LogOut size={14} /> Sign Out</button>
        </div>
      </header>

      <div className="player-dashboard-container" style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
        {/* Welcome */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, padding: 32, marginBottom: 24, color: 'white',
        }}>
          <h2 style={{ color: 'white', margin: '0 0 4px' }}>Welcome, {player.full_name}! 👋</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: 14 }}>
            {player.sport} · Code: {player.player_code} · Joined {new Date(player.joining_date).toLocaleDateString()}
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: readiness && readiness.attendance_percentage >= 75 ? '#f0fdf4' : '#fee2e2' }}>
              <ClipboardCheck size={24} color={readiness && readiness.attendance_percentage >= 75 ? '#22c55e' : '#ef4444'} />
            </div>
            <div>
              <div className="stat-value">{readiness?.attendance_percentage ?? 0}%</div>
              <div className="stat-label">Attendance</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f0fdf4' }}>
              <Check size={24} color="#22c55e" />
            </div>
            <div>
              <div className="stat-value">{readiness?.present_sessions ?? 0}</div>
              <div className="stat-label">Present</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fee2e2' }}>
              <XIcon size={24} color="#ef4444" />
            </div>
            <div>
              <div className="stat-value">{readiness?.absent_sessions ?? 0}</div>
              <div className="stat-label">Absent</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>
              <Trophy size={24} color="#f59e0b" />
            </div>
            <div>
              <div className="stat-value">{readiness?.matches_played ?? 0}</div>
              <div className="stat-label">Matches</div>
            </div>
          </div>
        </div>

        {/* Readiness */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={20} color="#6366f1" /> Trial Readiness</h3>
              <span className={`badge ${readiness?.readiness_status === 'READY' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 14, padding: '6px 14px' }}>
                {readiness?.readiness_status === 'READY' && <Star size={14} />} {readiness?.readiness_status || 'NOT READY'}
              </span>
            </div>
            <div className="readiness-progress-grid" style={{ marginBottom: 8 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Attendance (need ≥75%)</span>
                  <span style={{ fontWeight: 600, color: readiness && readiness.attendance_percentage >= 75 ? '#22c55e' : '#ef4444' }}>{readiness?.attendance_percentage ?? 0}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(readiness?.attendance_percentage ?? 0, 100)}%`, background: readiness && readiness.attendance_percentage >= 75 ? '#22c55e' : '#ef4444' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Matches (need ≥2)</span>
                  <span style={{ fontWeight: 600, color: readiness && readiness.matches_played >= 2 ? '#22c55e' : '#f59e0b' }}>{readiness?.matches_played ?? 0}/2</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(((readiness?.matches_played ?? 0) / 2) * 100, 100)}%`, background: readiness && readiness.matches_played >= 2 ? '#22c55e' : '#f59e0b' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column: Attendance + Matches */}
        <div className="player-history-grid" style={{ marginBottom: 24 }}>
          {/* Attendance History */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Attendance History</h3>
            </div>
            <div className="table-container" style={{ maxHeight: 400, overflowY: 'auto', overflowX: 'auto' }}>
              {attendanceHistory.length === 0 ? (
                <div className="empty-state" style={{ padding: 32 }}><p style={{ color: '#64748b' }}>No attendance records</p></div>
              ) : (
                <table>
                  <thead><tr><th>Date</th><th>Sport</th><th>Status</th></tr></thead>
                  <tbody>
                    {attendanceHistory.map((a) => (
                      <tr key={a.id}>
                        <td>{a.sessions ? new Date(a.sessions.session_date).toLocaleDateString() : '—'}</td>
                        <td>{a.sessions?.sport || '—'}</td>
                        <td>
                          <span className={`badge ${a.status === 'present' ? 'badge-success' : 'badge-danger'}`}>
                            {a.status === 'present' ? <Check size={12} /> : <XIcon size={12} />} {a.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Match History */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Match History</h3>
            </div>
            <div className="table-container" style={{ maxHeight: 400, overflowY: 'auto', overflowX: 'auto' }}>
              {matchHistory.length === 0 ? (
                <div className="empty-state" style={{ padding: 32 }}><p style={{ color: '#64748b' }}>No matches played yet</p></div>
              ) : (
                <table>
                  <thead><tr><th>Date</th><th>Opponent</th><th>Score</th></tr></thead>
                  <tbody>
                    {matchHistory.map((m) => {
                      const mp = m.match_participants?.find((p) => p.player_id === player?.id);
                      return (
                        <tr key={m.id}>
                          <td>{new Date(m.match_date).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 500 }}>{m.opponent}</td>
                          <td><span className="badge badge-primary">{mp?.score ?? '—'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: 10, background: '#1e293b', color: '#f8fafc', fontSize: 14 } }} />
    </div>
  );
}

