import { useEffect, useState } from 'react';
import { Star, Search, Filter } from 'lucide-react';
import { getPlayerReadiness } from '../../lib/readiness';
import type { PlayerReadiness } from '../../types';

const SPORTS = ['Cricket', 'Football', 'Basketball', 'Hockey', 'Badminton', 'Tennis', 'Volleyball', 'Athletics'];

export default function ReadyPlayersPage() {
  const [players, setPlayers] = useState<PlayerReadiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const { data } = await getPlayerReadiness();
    setPlayers(data);
    setLoading(false);
  };

  const filtered = players.filter((p) => {
    const matchSearch = p.full_name.toLowerCase().includes(search.toLowerCase());
    const matchSport = !sportFilter || p.sport === sportFilter;
    return matchSearch && matchSport;
  });

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Star size={24} color="#6366f1" /> Player Readiness</h1>
      </div>

      <div className="page-filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="form-input" placeholder="Search players..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="#94a3b8" />
          <select className="form-select" value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
            <option value="">All Sports</option>
            {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><Star size={48} /><h3>No players found</h3><p>Players will appear here with their readiness status</p></div></div>
      ) : (
        <div className="cards-grid">
          {filtered.map((p) => (
            <div key={p.player_id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                height: 4,
                background: p.readiness_status === 'READY' ? '#22c55e' : '#ef4444',
              }} />
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{p.full_name}</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{p.sport} · Age {p.age}</p>
                  </div>
                  <span className={`badge ${p.readiness_status === 'READY' ? 'badge-success' : 'badge-danger'}`}>
                    {p.readiness_status === 'READY' && <Star size={12} />} {p.readiness_status}
                  </span>
                </div>

                {/* Attendance Progress */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>Attendance</span>
                    <span style={{ fontWeight: 600, color: p.attendance_percentage >= 75 ? '#22c55e' : '#ef4444' }}>
                      {p.attendance_percentage}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${Math.min(p.attendance_percentage, 100)}%`,
                      background: p.attendance_percentage >= 75 ? '#22c55e' : '#ef4444',
                    }} />
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                    {p.present_sessions}/{p.total_sessions} sessions (need ≥75%)
                  </p>
                </div>

                {/* Matches */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Matches Played</span>
                  <span style={{ fontWeight: 600, color: p.matches_played >= 2 ? '#22c55e' : '#f59e0b' }}>
                    {p.matches_played}/2 required
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

