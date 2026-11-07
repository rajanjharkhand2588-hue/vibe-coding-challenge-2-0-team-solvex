// ============================================================
// Academy Desk – Readiness Service
// ============================================================

import { supabase } from './supabase';
import type { PlayerReadiness } from '../types';

/**
 * Fetch readiness data for all players from the player_readiness view.
 */
export async function getPlayerReadiness() {
  const { data, error } = await supabase
    .from('player_readiness')
    .select('*')
    .order('attendance_percentage', { ascending: false });

  return { data: (data ?? []) as PlayerReadiness[], error };
}

/**
 * Fetch only players whose readiness_status is "READY" (used by scouts).
 */
export async function getReadyPlayers() {
  const { data, error } = await supabase
    .from('player_readiness')
    .select('*')
    .eq('readiness_status', 'READY')
    .order('attendance_percentage', { ascending: false });

  return { data: (data ?? []) as PlayerReadiness[], error };
}

/**
 * Fetch readiness data for a single player.
 */
export async function getPlayerReadinessById(playerId: string) {
  const { data, error } = await supabase
    .from('player_readiness')
    .select('*')
    .eq('player_id', playerId)
    .maybeSingle();

  return { data: data as PlayerReadiness | null, error };
}
