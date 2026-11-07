// ============================================================
// Academy Desk – Dashboard Service
// ============================================================

import { supabase } from './supabase';
import type { DashboardStats } from '../types';

/**
 * Aggregate high-level dashboard statistics.
 */
export async function getDashboardStats(): Promise<{
  data: DashboardStats | null;
  error: unknown;
}> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Run independent queries in parallel
  const [playersRes, attendanceRes, matchesRes, readyRes] = await Promise.all([
    supabase
      .from('players')
      .select('id', { count: 'exact', head: true })
      .eq('active', true),

    supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'present')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`),

    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true }),

    supabase
      .from('player_readiness')
      .select('player_id', { count: 'exact', head: true })
      .eq('readiness_status', 'READY'),
  ]);

  const error =
    playersRes.error || attendanceRes.error || matchesRes.error || readyRes.error;
  if (error) return { data: null, error };

  return {
    data: {
      totalPlayers: playersRes.count ?? 0,
      todayAttendance: attendanceRes.count ?? 0,
      totalMatches: matchesRes.count ?? 0,
      readyPlayers: readyRes.count ?? 0,
    },
    error: null,
  };
}

/**
 * Fetch the most recent attendance and match activity (last 10 records each).
 */
export async function getRecentActivity() {
  const [attendanceRes, matchesRes] = await Promise.all([
    supabase
      .from('attendance')
      .select('*, players(full_name, player_code), sessions(session_date, sport)')
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('matches')
      .select('*, match_participants(player_id, score, players(full_name))')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return {
    data: {
      recentAttendance: attendanceRes.data ?? [],
      recentMatches: matchesRes.data ?? [],
    },
    error: attendanceRes.error || matchesRes.error,
  };
}

/**
 * Build chart data for attendance over the last N days.
 * Returns an array of { date, present, absent } objects suitable for Recharts.
 */
export async function getAttendanceChartData(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startIso = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance')
    .select('status, sessions(session_date)')
    .gte('created_at', `${startIso}T00:00:00`);

  if (error) return { data: [], error };

  // Aggregate per date
  const map = new Map<string, { present: number; absent: number }>();

  for (const record of data ?? []) {
    const session = record.sessions as unknown as { session_date: string } | null;
    const date = session?.session_date ?? 'unknown';
    if (!map.has(date)) map.set(date, { present: 0, absent: 0 });
    const entry = map.get(date)!;
    if (record.status === 'present') entry.present++;
    else entry.absent++;
  }

  const chartData = Array.from(map.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { data: chartData, error: null };
}

/**
 * Get the distribution of active players across sports.
 * Returns an array of { sport, count } objects suitable for Recharts.
 */
export async function getSportDistribution() {
  const { data, error } = await supabase
    .from('players')
    .select('sport')
    .eq('active', true);

  if (error) return { data: [], error };

  const countMap = new Map<string, number>();
  for (const row of data ?? []) {
    countMap.set(row.sport, (countMap.get(row.sport) ?? 0) + 1);
  }

  const distribution = Array.from(countMap.entries())
    .map(([sport, count]) => ({ sport, count }))
    .sort((a, b) => b.count - a.count);

  return { data: distribution, error: null };
}
