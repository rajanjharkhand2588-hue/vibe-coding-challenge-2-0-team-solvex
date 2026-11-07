import { useEffect, useState } from 'react';
import { ClipboardCheck, Plus, Lock, Eye, Loader2, Check, X as XIcon, Users as UsersIcon } from 'lucide-react';
import { getSessions, createSession, closeSession } from '../../lib/sessions';
import { getAttendanceBySession, markAttendance } from '../../lib/attendance';
import { getPlayersBySport } from '../../lib/players';
import { useAuth } from '../../contexts/AuthContext';
import type { Session, Player, AttendanceWithPlayer } from '../../types';
import toast from 'react-hot-toast';

const SPORTS = ['Cricket', 'Football', 'Basketball', 'Hockey', 'Badminton', 'Tennis', 'Volleyball', 'Athletics'];

export default function AttendancePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'create' | 'history'>('create');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Create session
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionSport, setSessionSport] = useState('Cricket');
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});

  // View session
  const [viewSession, setViewSession] = useState<Session | null>(null);
  const [viewAttendance, setViewAttendance] = useState<AttendanceWithPlayer[]>([]);

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    setLoading(true);
    const { data } = await getSessions();
    setSessions(data);
    setLoading(false);
  };

  const handleCreateSession = async () => {
    if (!sessionDate || !sessionSport) { toast.error('Select date and sport'); return; }
    setSaving(true);
    const { data, error } = await createSession({ session_date: sessionDate, sport: sessionSport }, user!.id);
    setSaving(false);
    if (error) { toast.error(error.message || 'Failed to create session'); return; }
    if (data) {
      toast.success('Session created!');
      setActiveSession(data);
      loadSessions();
      // Load players for this sport
      const { data: sportPlayers } = await getPlayersBySport(sessionSport);
      setPlayers(sportPlayers);
      const defaultAttendance: Record<string, 'present' | 'absent'> = {};
      sportPlayers.forEach((p) => { defaultAttendance[p.id] = 'present'; });
      setAttendance(defaultAttendance);
    }
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    const updated: Record<string, 'present' | 'absent'> = {};
    players.forEach((p) => { updated[p.id] = status; });
    setAttendance(updated);
  };

  const handleSaveAttendance = async () => {
    if (!activeSession) return;
    setSaving(true);
    const records = Object.entries(attendance).map(([playerId, status]) => ({ playerId, status }));
    const { error } = await markAttendance(activeSession.id, records, user!.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success('Attendance saved!');
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;
    if (!confirm('Close this session? Attendance will be locked permanently.')) return;
    setSaving(true);
    // Save attendance first
    const records = Object.entries(attendance).map(([playerId, status]) => ({ playerId, status }));
    await markAttendance(activeSession.id, records, user!.id);
    const { error } = await closeSession(activeSession.id);
    setSaving(false);
    if (error) toast.error(error.message); else {
      toast.success('Session closed and locked!');
      setActiveSession(null);
      setPlayers([]);
      setAttendance({});
      loadSessions();
    }
  };

  const handleViewSession = async (s: Session) => {
    setViewSession(s);
    const { data } = await getAttendanceBySession(s.id);
    setViewAttendance(data);
  };

  const presentCount = Object.values(attendance).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length;

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardCheck size={24} color="#6366f1" /> Attendance</h1>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>Mark Attendance</button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>Session History</button>
      </div>

      {tab === 'create' && (
        <div>
          {!activeSession ? (
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: 20 }}>Open New Session</h3>
                <div className="open-session-grid">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Sport</label>
                    <select className="form-select" value={sessionSport} onChange={(e) => setSessionSport(e.target.value)}>
                      {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <button className="btn btn-primary" onClick={handleCreateSession} disabled={saving} style={{ width: '100%', height: 42 }}>
                    {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />} Open Session
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Session info */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{sessionSport} Practice</h3>
                    <p style={{ margin: 0, fontSize: 14 }}>Date: {new Date(sessionDate).toLocaleDateString()} · <span className="badge badge-success">Open</span></p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-success">Present: {presentCount}</span>
                    <span className="badge badge-danger">Absent: {absentCount}</span>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button className="btn btn-success btn-sm" onClick={() => handleMarkAll('present')}><Check size={14} /> Mark All Present</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleMarkAll('absent')}><XIcon size={14} /> Mark All Absent</button>
              </div>

              {/* Player list */}
              {players.length === 0 ? (
                <div className="card"><div className="empty-state"><UsersIcon size={48} /><h3>No players for {sessionSport}</h3><p>Add players for this sport first</p></div></div>
              ) : (
                <div className="card">
                  <div className="table-container">
                    <table>
                      <thead><tr><th>Player</th><th>Code</th><th>Attendance</th></tr></thead>
                      <tbody>
                        {players.map((p) => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 500, color: '#0f172a' }}>{p.full_name}</td>
                            <td><span className="badge badge-primary">{p.player_code}</span></td>
                            <td>
                              <div className="toggle-group">
                                <button
                                  className={`toggle-btn ${attendance[p.id] === 'present' ? 'active-present' : ''}`}
                                  onClick={() => setAttendance({ ...attendance, [p.id]: 'present' })}
                                >Present</button>
                                <button
                                  className={`toggle-btn ${attendance[p.id] === 'absent' ? 'active-absent' : ''}`}
                                  onClick={() => setAttendance({ ...attendance, [p.id]: 'absent' })}
                                >Absent</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="responsive-action-buttons" style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={handleSaveAttendance} disabled={saving}>
                  {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />} Save Attendance
                </button>
                <button className="btn btn-warning" onClick={handleCloseSession} disabled={saving}>
                  <Lock size={16} /> Close & Lock Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
          ) : sessions.length === 0 ? (
            <div className="card"><div className="empty-state"><ClipboardCheck size={48} /><h3>No sessions yet</h3><p>Create your first practice session</p></div></div>
          ) : (
            <div className="card">
              <div className="table-container">
                <table>
                  <thead><tr><th>Date</th><th>Sport</th><th>Status</th><th>Closed At</th><th>Actions</th></tr></thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id}>
                        <td>{new Date(s.session_date).toLocaleDateString()}</td>
                        <td><span className="badge badge-info">{s.sport}</span></td>
                        <td>
                          <span className={`badge ${s.status === 'closed' ? 'badge-danger' : 'badge-success'}`}>
                            {s.status === 'closed' && <Lock size={12} />} {s.status.toUpperCase()}
                          </span>
                        </td>
                        <td>{s.closed_at ? new Date(s.closed_at).toLocaleString() : '—'}</td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={() => handleViewSession(s)}>
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Session Modal */}
      {viewSession && (
        <div className="modal-overlay" onClick={() => setViewSession(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Session: {viewSession.sport} — {new Date(viewSession.session_date).toLocaleDateString()}</h3>
              <button onClick={() => setViewSession(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <XIcon size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span className={`badge ${viewSession.status === 'closed' ? 'badge-danger' : 'badge-success'}`}>
                  {viewSession.status === 'closed' && <Lock size={12} />} {viewSession.status.toUpperCase()}
                </span>
              </div>
              {viewAttendance.length === 0 ? (
                <p style={{ color: '#64748b' }}>No attendance records</p>
              ) : (
                <table>
                  <thead><tr><th>Player</th><th>Status</th></tr></thead>
                  <tbody>
                    {viewAttendance.map((a) => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 500, color: '#0f172a' }}>{a.players?.full_name || 'Unknown'}</td>
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
        </div>
      )}
    </div>
  );
}

