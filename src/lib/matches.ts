// ============================================================
// Academy Desk – Match Service
// ============================================================

import { supabase } from './supabase';
import type {
  Match,
  MatchWithParticipants,
  MatchParticipantWithPlayer,
  CreateMatchForm,
  MatchScoreEntry,
} from '../types';

/**
 * Fetch all matches with their participants and player details.
 */
export async function getMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select('*, match_participants(*, players(*))')
    .order('match_date', { ascending: false });

  return { data: (data ?? []) as MatchWithParticipants[], error };
}

/**
 * Fetch a single match by ID, including participants and player details.
 */
export async function getMatchById(id: string) {
  const { data, error } = await supabase
    .from('matches')
    .select('*, match_participants(*, players(*))')
    .eq('id', id)
    .single();

  return { data: data as MatchWithParticipants | null, error };
}

/**
 * Create a new match record.
 */
export async function createMatch(form: CreateMatchForm, createdBy: string) {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      match_date: form.match_date,
      sport: form.sport,
      opponent: form.opponent,
      created_by: createdBy,
    })
    .select()
    .single();

  return { data: data as Match | null, error };
}

/**
 * Add participants to a match with their scores.
 * Validates that each player was marked "present" in at least one session
 * before allowing participation.
 */
export async function addMatchParticipants(
  matchId: string,
  participants: MatchScoreEntry[]
) {
  // Validate attendance — each player must have at least one "present" record
  const playerIds = participants.map((p) => p.player_id);

  const { data: attendanceRecords, error: attError } = await supabase
    .from('attendance')
    .select('player_id')
    .in('player_id', playerIds)
    .eq('status', 'present');

  if (attError) return { data: null, error: attError };

  const presentPlayerIds = new Set(
    (attendanceRecords ?? []).map((r: { player_id: string }) => r.player_id)
  );

  const ineligible = playerIds.filter((id) => !presentPlayerIds.has(id));
  if (ineligible.length > 0) {
    return {
      data: null,
      error: {
        message: `The following players have no attendance records and cannot participate: ${ineligible.join(', ')}`,
        details: '',
        hint: 'Mark attendance for these players before adding them to a match.',
        code: 'ATTENDANCE_REQUIRED',
      },
    };
  }

  const rows = participants.map((p) => ({
    match_id: matchId,
    player_id: p.player_id,
    score: p.score,
  }));

  const { data, error } = await supabase
    .from('match_participants')
    .upsert(rows, { onConflict: 'match_id,player_id' })
    .select('*, players(*)');

  return { data: (data ?? []) as MatchParticipantWithPlayer[], error };
}

/**
 * Get all matches a specific player has participated in, with scores.
 */
export async function getMatchesByPlayer(playerId: string) {
  const { data, error } = await supabase
    .from('match_participants')
    .select('*, matches(*)')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false });

  return { data: data ?? [], error };
}
