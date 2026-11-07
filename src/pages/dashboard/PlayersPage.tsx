import { useEffect, useState } from 'react';
import { Users, Plus, Search, Edit2, UserCheck, UserX, Trash2, X, Loader2, Filter } from 'lucide-react';
import { getPlayers, createPlayer, updatePlayer, togglePlayerStatus, deletePlayer } from '../../lib/players';
import { useAuth } from '../../contexts/AuthContext';
import type { Player, CreatePlayerForm } from '../../types';
import toast from 'react-hot-toast';

const SPORTS = ['Cricket', 'Football', 'Basketball', 'Hockey', 'Badminton', 'Tennis', 'Volleyball', 'Athletics'];

export default function PlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreatePlayerForm>({
    full_name: '',
    age: 16,
    sport: 'Cricket',
    joining_date: new Date().toISOString().split('T')[0],
    email: '',
    password: '',
  });

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    const { data, error } = await getPlayers(true);
    if (error) {
      toast.error('Failed to load players: ' + error.message);
    } else {
      setPlayers(data);
    }
    setLoading(false);
  };

  const filtered = players.filter((p) => {
    const query = search.toLowerCase();
    const matchSearch = p.full_name.toLowerCase().includes(query) || p.player_code.toLowerCase().includes(query);
    const matchSport = !sportFilter || p.sport === sportFilter;
    const matchStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? p.active : !p.active;
    return matchSearch && matchSport && matchStatus;
  });

  const openAdd = () => {
    setEditPlayer(null);
    setForm({
      full_name: '',
      age: 16,
      sport: 'Cricket',
      joining_date: new Date().toISOString().split('T')[0],
      email: '',
      password: '',
    });
    setShowModal(true);
  };

  const openEdit = (p: Player) => {
    setEditPlayer(p);
    setForm({
      full_name: p.full_name,
      age: p.age,
      sport: p.sport,
      joining_date: p.joining_date,
      email: '',
      password: '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = form.full_name.trim();
    if (!trimmedName) {
      toast.error('Please enter the player full name');
      return;
    }
    const ageNum = Number(form.age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 99) {
      toast.error('Please enter a valid age between 1 and 99');
      return;
    }
    if (!form.sport) {
      toast.error('Please select a sport');
      return;
    }

    setSaving(true);
    if (editPlayer) {
      const { data, error } = await updatePlayer(editPlayer.id, {
        full_name: trimmedName,
        age: ageNum,
        sport: form.sport,
        joining_date: form.joining_date || new Date().toISOString().split('T')[0],
      });
      setSaving(false);
      if (error) {
        toast.error('Update failed: ' + error.message);
      } else {
        toast.success(`Player ${data?.full_name || trimmedName} updated!`);
        setShowModal(false);
        loadPlayers();
      }
    } else {
      const { data, error } = await createPlayer(
        {
          ...form,
          full_name: trimmedName,
          age: ageNum,
        },
        user?.id
      );
      setSaving(false);
      if (error) {
        toast.error('Failed to add player: ' + error.message);
      } else {
        toast.success(`Player ${data?.full_name || trimmedName} added successfully (${data?.player_code})!`);
        setShowModal(false);
        loadPlayers();
      }
    }
  };

  const handleToggleStatus = async (p: Player) => {
    const nextStatus = !p.active;
    const actionLabel = nextStatus ? 'Reactivate' : 'Deactivate';
    if (!confirm(`${actionLabel} player "${p.full_name}"?`)) return;

    const { error } = await togglePlayerStatus(p.id, nextStatus);
    if (error) {
      toast.error(`Failed to ${actionLabel.toLowerCase()} player: ` + error.message);
    } else {
      toast.success(`Player ${p.full_name} ${nextStatus ? 'reactivated' : 'deactivated'}!`);
      loadPlayers();
    }
  };

  const handleDelete = async (p: Player) => {
    if (!confirm(`Are you sure you want to permanently delete "${p.full_name}"? This action cannot be undone.`)) {
      return;
    }

    const { error } = await deletePlayer(p.id);
    if (error) {
      toast.error('Failed to delete player: ' + error.message);
    } else {
      toast.success(`Player ${p.full_name} deleted.`);
      loadPlayers();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={24} color="#6366f1" /> Players Management
        </h1>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add New Player
        </button>
      </div>

      <div className="page-filters" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            className="form-input"
            placeholder="Search by name or code (e.g. PL-001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 1 180px' }}>
          <Filter size={16} color="#94a3b8" />
          <select
            className="form-select"
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">All Sports</option>
            {SPORTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '0 1 150px' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ width: '100%' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Users size={48} />
            <h3>No players found</h3>
            <p style={{ marginBottom: 16 }}>
              {players.length === 0
                ? 'Get started by adding the first player to your academy.'
                : 'No players match your search and filter criteria.'}
            </p>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <Plus size={14} /> Add Player
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Player Code</th>
                  <th>Full Name</th>
                  <th>Age</th>
                  <th>Sport</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="badge badge-primary">{p.player_code}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{p.full_name}</td>
                    <td>{p.age} yrs</td>
                    <td>
                      <span className="badge badge-info">{p.sport}</span>
                    </td>
                    <td>{new Date(p.joining_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${p.active ? 'badge-success' : 'badge-danger'}`}>
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          className="btn btn-outline btn-sm"
                          title="Edit Player"
                          onClick={() => openEdit(p)}
                          style={{ padding: '6px 10px' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          title={p.active ? 'Deactivate Player' : 'Reactivate Player'}
                          style={{
                            color: p.active ? '#f59e0b' : '#22c55e',
                            padding: '6px 10px',
                          }}
                          onClick={() => handleToggleStatus(p)}
                        >
                          {p.active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          title="Delete Player"
                          style={{ color: '#ef4444', padding: '6px 10px' }}
                          onClick={() => handleDelete(p)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editPlayer ? `Edit Player: ${editPlayer.player_code}` : 'Add New Player'}</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Player Full Name *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Rohit Sharma"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Age (1 - 99) *</label>
                    <input
                      type="number"
                      className="form-input"
                      min={1}
                      max={99}
                      placeholder="e.g. 17"
                      value={form.age || ''}
                      onChange={(e) => setForm({ ...form, age: parseInt(e.target.value, 10) || 0 })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sport *</label>
                    <select
                      className="form-select"
                      value={form.sport}
                      onChange={(e) => setForm({ ...form, sport: e.target.value })}
                    >
                      {SPORTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Joining Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.joining_date}
                    onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
                  />
                </div>

                {!editPlayer && (
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', margin: '0 0 8px' }}>
                      Optional: Create Player Login Account
                    </p>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px' }}>
                      Allows the player to log into their personal dashboard to view attendance & performance.
                    </p>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Player Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={form.email || ''}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="player@example.com"
                        autoComplete="off"
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Temporary Password</label>
                      <input
                        type="password"
                        className="form-input"
                        value={form.password || ''}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving && <Loader2 size={16} className="spinner-sm" />}
                  {editPlayer ? 'Save Changes' : 'Add Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
