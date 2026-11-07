import { useEffect, useState } from 'react';
import { Users, ClipboardCheck, Trophy, Star, TrendingUp, Activity } from 'lucide-react';
import { getDashboardStats, getSportDistribution, getAttendanceChartData } from '../../lib/dashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { DashboardStats } from '../../types';

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats>({ totalPlayers: 0, todayAttendance: 0, totalMatches: 0, readyPlayers: 0 });
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [sportData, setSportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [statsRes, chartRes, sportRes] = await Promise.all([
      getDashboardStats(),
      getAttendanceChartData(14),
      getSportDistribution(),
    ]);
    if (statsRes.data) setStats(statsRes.data);
    if (chartRes.data) setAttendanceData(chartRes.data);
    if (sportRes.data) setSportData(sportRes.data);
    setLoading(false);
  };

  const statCards = [
    { label: 'Total Players', value: stats.totalPlayers, icon: Users, bg: '#eff6ff', color: '#3b82f6' },
    { label: "Today's Attendance", value: stats.todayAttendance, icon: ClipboardCheck, bg: '#f0fdf4', color: '#22c55e' },
    { label: 'Total Matches', value: stats.totalMatches, icon: Trophy, bg: '#fef3c7', color: '#f59e0b' },
    { label: 'Ready Players', value: stats.readyPlayers, icon: Star, bg: '#fce7f3', color: '#ec4899' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={24} color="#6366f1" /> Dashboard Overview
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={24} color={s.color} />
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="overview-charts-grid" style={{ marginBottom: 24 }}>
        {/* Attendance Trend */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: '1rem' }}>
              <TrendingUp size={18} color="#6366f1" /> Attendance Trend
            </h3>
          </div>
          <div className="card-body">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                  />
                  <Line type="monotone" dataKey="present" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Present" />
                  <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Absent" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <ClipboardCheck size={40} />
                <h3>No attendance data yet</h3>
                <p>Create practice sessions and mark attendance to see trends</p>
              </div>
            )}
          </div>
        </div>

        {/* Sport Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: '1rem' }}>
              <Users size={18} color="#6366f1" /> Players by Sport
            </h3>
          </div>
          <div className="card-body">
            {sportData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={sportData} dataKey="count" nameKey="sport" cx="50%" cy="50%" outerRadius={90} label={(entry: any) => `${entry.sport ?? entry.name}: ${entry.count ?? entry.value}`}>
                    {sportData.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <Users size={40} />
                <h3>No players yet</h3>
                <p>Add players to see distribution</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

