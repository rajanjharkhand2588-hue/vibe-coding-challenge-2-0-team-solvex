import { useEffect, useState } from 'react';
import { Trophy, Plus, Eye, Loader2, X as XIcon, AlertCircle } from 'lucide-react';
import { getMatches, createMatch, addMatchParticipants } from '../../lib/matches';
import { getSessionsByDateAndSport } from '../../lib/sessions';
import { getAttendanceBySession } from '../../lib/attendance';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { MatchWithParticipants, AttendanceWithPlayer, MatchScoreEntry } from '../../types';
import toast from 'react-hot-toast';

const SPORTS = ['Cricket', 'Football', 'Basketball', 'Hockey', 'Badminton', 'Tennis', 'Volleyball', 'Athletics'];

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // New match form
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [matchSport, setMatchSport] = useState('Cricket');
  const [opponent, setOpponent] = useState('');
  const [eligiblePlayers, setEligiblePlayers] = useState<AttendanceWithPlayer[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [sessionFound, setSessionFound] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // View match
  const [viewMatch, setViewMatch] = useState<MatchWithParticipants | null>(null);

  useEffect(() => { loadMatches(); }, []);

  const loadMatches = async () => {
    setLoading(true);
    const { data } = await getMatches();
    setMatches(data);
    setLoading(false);
  };

  const handleCheckSession = async () => {
    setEligiblePlayers([]);
    setScores({});
    setSessionFound(null);
    const { data: sessions } = await getSessionsByDateAndSport(matchDate, matchSport);
    const closedSession = sessions.find((s) => s.status === 'closed');
    if (!closedSession) {
      setSessionFound(false);
      return;
    }
    setSessionFound(true);
    setSessionId(closedSession.id);
    // Get present players
    const { data: attendanceList } = await getAttendanceBySession(closedSession.id);
    const presentPlayers = attendanceList.filter((a) => a.status === 'present');
    setEligiblePlayers(presentPlayers);
    const defaultScores: Record<string, number> = {};
    presentPlayers.forEach((a) => { defaultScores[a.player_id] = 0; });
    setScores(defaultScores);
  };

  const handleSaveMatch = async () => {
    if (!opponent.trim()) { toast.error('Enter opponent name'); return; }
    if (eligiblePlayers.length === 0) { toast.error('No eligible players'); return; }
    setSaving(true);
    const { data: match, error: matchError } = await createMatch(
      { match_date: matchDate, sport: matchSport, opponent }, user!.id
    );
    if (matchError || !match) { toast.error(matchError?.message || 'Failed'); setSaving(false); return; }

    // Update session_id on match
    if (sessionId) {
      await supabase.from('matches').update({ session_id: sessionId }).eq('id', match.id);
    }

    const participants: MatchScoreEntry[] = Object.entries(scores).map(([player_id, score]) => ({ player_id, score }));
    const { error: partError } = await addMatchParticipants(match.id, participants);
    setSaving(false);
    if (partError) toast.error(partError.message); else {
      toast.success('Match recorded!');
      setShowModal(false);
      setOpponent('');
      setEligiblePlayers([]);
      setScores({});
      setSessionFound(null);
      loadMatches();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Trophy size={24} color="#6366f1" /> Matches</h1>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setSessionFound(null); setEligiblePlayers([]); }}>
          <Plus size={16} /> Record Match
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : matches.length === 0 ? (
        <div className="card"><div className="empty-state"><Trophy size={48} /><h3>No matches recorded</h3><p>Record your first match to track performance</p></div></div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Date</th><th>Sport</th><th>Opponent</th><th>Players</th><th>Actions</th></tr></thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.match_date).toLocaleDateString()}</td>
                    <td><span className="badge badge-info">{m.sport}</span></td>
                    <td style={{ fontWeight: 500, color: '#0f172a' }}>{m.opponent}</td>
                    <td><span className="badge badge-primary">{m.match_participants?.length || 0} players</span></td>
                    <td><button className="btn btn-outline btn-sm" onClick={() => setViewMatch(m)}><Eye size={14} /> View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Match Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record New Match</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><XIcon size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Match Date</label>
                  <input type="date" className="form-input" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sport</label>
                  <select className="form-select" value={matchSport} onChange={(e) => setMatchSport(e.target.value)}>
                    {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Opponent</label>
                <input className="form-input" placeholder="Opponent team name" value={opponent} onChange={(e) => setOpponent(e.target.value)} />
              </div>
              <button className="btn btn-outline" onClick={handleCheckSession} style={{ marginBottom: 16 }}>
                Check Attendance Session
              </button>

              {sessionFound === false && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 16, display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                  <AlertCircle size={20} color="#ef4444" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: '#991b1b', fontSize: 14 }}>No closed session found</p>
                    <p style={{ margin: 0, color: '#b91c1c', fontSize: 13 }}>A closed attendance session is required for {matchDate} - {matchSport}</p>
                  </div>
                </div>
              )}

              {sessionFound && eligiblePlayers.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 12 }}>Eligible Players (Present in session)</h4>
                  <table>
                    <thead><tr><th>Player</th><th>Score</th></tr></thead>
                    <tbody>
                      {eligiblePlayers.map((a) => (
                        <tr key={a.player_id}>
                          <td style={{ fontWeight: 500, color: '#0f172a' }}>{a.players?.full_name}</td>
                          <td>
                            <input type="number" className="form-input" style={{ width: 100 }}
                              min={0} value={scores[a.player_id] || 0}
                              onChange={(e) => setScores({ ...scores, [a.player_id]: parseInt(e.target.value) || 0 })} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveMatch} disabled={saving || !sessionFound || eligiblePlayers.length === 0}>
                {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />} Save Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Match Modal */}
      {viewMatch && (
        <div className="modal-overlay" onClick={() => setViewMatch(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewMatch.sport} vs {viewMatch.opponent}</h3>
              <button onClick={() => setViewMatch(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><XIcon size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>Date: {new Date(viewMatch.match_date).toLocaleDateString()}</p>
              {viewMatch.match_participants && viewMatch.match_participants.length > 0 ? (
                <table>
                  <thead><tr><th>Player</th><th>Score</th></tr></thead>
                  <tbody>
                    {viewMatch.match_participants.map((mp) => (
                      <tr key={mp.id}>
                        <td style={{ fontWeight: 500, color: '#0f172a' }}>{mp.players?.full_name || 'Unknown'}</td>
                        <td><span className="badge badge-primary" style={{ fontSize: 14 }}>{mp.score}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b' }}>No participants recorded</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

