// ============================================================
// Academy Desk – Attendance Service
// ============================================================

import { supabase } from './supabase';
import type {
  AttendanceRecord,
  AttendanceWithPlayer,
  AttendanceWithSession,
} from '../types';

/**
 * Get all attendance records for a session, joined with player details.
 */
export async function getAttendanceBySession(sessionId: string) {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, players(*)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  return { data: (data ?? []) as AttendanceWithPlayer[], error };
}

/**
 * Bulk upsert attendance for a session.
 * Each entry in `playerAttendances` is { playerId, status }.
 */
export async function markAttendance(
  sessionId: string,
  playerAttendances: { playerId: string; status: 'present' | 'absent' }[],
  markedBy: string
) {
  const rows = playerAttendances.map((pa) => ({
    session_id: sessionId,
    player_id: pa.playerId,
    status: pa.status,
    marked_by: markedBy,
  }));

  // Upsert on the unique constraint (session_id, player_id)
  const { data, error } = await supabase
    .from('attendance')
    .upsert(rows, { onConflict: 'session_id,player_id' })
    .select('*, players(*)');

  return { data: (data ?? []) as AttendanceWithPlayer[], error };
}

/**
 * Get attendance history for a specific player, joined with session details.
 */
export async function getAttendanceByPlayer(playerId: string) {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, sessions(*)')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false });

  return { data: (data ?? []) as AttendanceWithSession[], error };
}

/**
 * Calculate attendance statistics for a player.
 */
export async function getAttendanceStats(playerId: string) {
  const { data, error } = await supabase
    .from('attendance')
    .select('status')
    .eq('player_id', playerId);

  if (error) return { data: null, error };

  const records = (data ?? []) as Pick<AttendanceRecord, 'status'>[];
  const total = records.length;
  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return {
    data: { total, present, absent, percentage },
    error: null,
  };
}
