import { useEffect, useState } from 'react';
import { Search, Star, LogOut, Filter, Volleyball, Eye, X as XIcon } from 'lucide-react';
import { getReadyPlayers } from '../lib/readiness';
import { getMatchesByPlayer } from '../lib/matches';
import { useAuth } from '../contexts/AuthContext';
import type { PlayerReadiness, MatchWithParticipants } from '../types';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SPORTS = ['Cricket', 'Football', 'Basketball', 'Hockey', 'Badminton', 'Tennis', 'Volleyball', 'Athletics'];

export default function ScoutDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PlayerReadiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [viewPlayer, setViewPlayer] = useState<PlayerReadiness | null>(null);
  const [playerMatches, setPlayerMatches] = useState<MatchWithParticipants[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const { data } = await getReadyPlayers();
    setPlayers(data);
    setLoading(false);
  };

  const handleViewPlayer = async (p: PlayerReadiness) => {
    setViewPlayer(p);
    const { data } = await getMatchesByPlayer(p.player_id);
    setPlayerMatches(data);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  const filtered = players.filter((p) => {
    const matchSearch = p.full_name.toLowerCase().includes(search.toLowerCase());
    const matchSport = !sportFilter || p.sport === sportFilter;
    const matchAge = (!ageMin || p.age >= parseInt(ageMin)) && (!ageMax || p.age <= parseInt(ageMax));
    return matchSearch && matchSport && matchAge;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header className="standalone-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Volleyball size={18} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Scout Dashboard</h1>
            <p className="standalone-subtitle" style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Academy Desk · Talent Discovery</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="scout-welcome-text" style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>
            {profile?.full_name}
          </span>
          <button className="btn btn-outline btn-sm" onClick={handleSignOut}><LogOut size={14} /> Sign Out</button>
        </div>
      </header>

      <div className="scout-dashboard-container" style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {/* Filters */}
        <div className="scout-filters-bar" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input className="form-input" placeholder="Search players..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 140px' }}>
            <Filter size={16} color="#94a3b8" />
            <select className="form-select" value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} style={{ width: '100%' }}>
              <option value="">All Sports</option>
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, flex: '1 1 180px' }}>
            <input type="number" className="form-input" placeholder="Min Age" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} style={{ width: '100%' }} />
            <input type="number" className="form-input" placeholder="Max Age" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: '#64748b' }}>{filtered.length} Ready Player{filtered.length !== 1 ? 's' : ''} Found</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card"><div className="empty-state"><Star size={48} /><h3>No ready players found</h3><p>Players need ≥75% attendance and ≥2 matches</p></div></div>
        ) : (
          <div className="cards-grid">
            {filtered.map((p) => (
              <div key={p.player_id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => handleViewPlayer(p)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
              >
                <div style={{ height: 4, background: '#22c55e' }} />
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{p.full_name}</h4>
                      <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{p.sport} · Age {p.age}</p>
                    </div>
                    <span className="badge badge-success"><Star size={12} /> READY</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{p.attendance_percentage}%</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Attendance</div>
                    </div>
                    <div style={{ background: '#eff6ff', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{p.matches_played}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Matches</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, textAlign: 'right' }}>
                    <span style={{ fontSize: 12, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <Eye size={12} /> View Details
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Player Detail Modal */}
      {viewPlayer && (
        <div className="modal-overlay" onClick={() => setViewPlayer(null)}>
          <div className="modal-content" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewPlayer.full_name}</h3>
              <button onClick={() => setViewPlayer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><XIcon size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span className="badge badge-info">{viewPlayer.sport}</span>
                <span className="badge badge-primary">Age {viewPlayer.age}</span>
                <span className="badge badge-success"><Star size={12} /> READY</span>
              </div>
              <div className="scout-modal-stats-grid" style={{ marginBottom: 20 }}>
                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{viewPlayer.attendance_percentage}%</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Attendance</div>
                </div>
                <div style={{ background: '#eff6ff', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>{viewPlayer.present_sessions}/{viewPlayer.total_sessions}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Sessions</div>
                </div>
                <div style={{ background: '#fef3c7', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{viewPlayer.matches_played}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Matches</div>
                </div>
              </div>

              <h4 style={{ marginBottom: 12 }}>Match History</h4>
              {playerMatches.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: 14 }}>No match data available</p>
              ) : (
                <table>
                  <thead><tr><th>Date</th><th>Opponent</th><th>Score</th></tr></thead>
                  <tbody>
                    {playerMatches.map((m) => {
                      const participant = m.match_participants?.find((mp) => mp.player_id === viewPlayer.player_id);
                      return (
                        <tr key={m.id}>
                          <td>{new Date(m.match_date).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 500 }}>{m.opponent}</td>
                          <td><span className="badge badge-primary">{participant?.score ?? '—'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: 10, background: '#1e293b', color: '#f8fafc', fontSize: 14 } }} />
    </div>
  );
}

