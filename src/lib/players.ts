// ============================================================
// Academy Desk – Player Service
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Player, CreatePlayerForm } from '../types';

/**
 * Fetch players (admin view).
 * Can include inactive players to let coaches view and reactivate them.
 */
export async function getPlayers(includeInactive = true) {
  let query = supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: false });

  if (!includeInactive) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;
  return { data: (data ?? []) as Player[], error };
}

/**
 * Fetch a single player by ID.
 */
export async function getPlayerById(id: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return { data: data as Player | null, error };
}

/**
 * Fetch active players filtered by sport.
 */
export async function getPlayersBySport(sport: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('sport', sport)
    .eq('active', true)
    .order('full_name');

  return { data: (data ?? []) as Player[], error };
}

/**
 * Generate the next unique player code (PL-001, PL-002, …)
 * by finding the highest existing numeric code.
 */
async function generatePlayerCode(): Promise<string> {
  const { data } = await supabase
    .from('players')
    .select('player_code');

  if (data && data.length > 0) {
    let maxNum = 0;
    for (const p of data) {
      if (p.player_code) {
        const parts = p.player_code.split('-');
        const n = parseInt(parts[1] || parts[0], 10);
        if (!isNaN(n) && n > maxNum) {
          maxNum = n;
        }
      }
    }
    return `PL-${String(maxNum + 1).padStart(3, '0')}`;
  }

  return 'PL-001';
}

/**
 * Create a new player.
 * Supports optional login credentials WITHOUT logging out the current coach.
 */
export async function createPlayer(form: CreatePlayerForm, createdBy?: string) {
  let creatorId = createdBy;
  if (!creatorId) {
    const { data: { user } } = await supabase.auth.getUser();
    creatorId = user?.id;
  }

  if (!creatorId) {
    return { data: null, error: new Error('You must be logged in as a coach/admin to add players.') };
  }

  let userId: string | null = null;

  // If credentials are provided, create an auth user using an isolated client
  // so the active coach session is NOT replaced or logged out!
  if (form.email && form.password && form.email.trim() && form.password.trim()) {
    try {
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            full_name: form.full_name.trim(),
            role: 'player',
          },
        },
      });

      if (authError) {
        return { data: null, error: new Error(`Could not create player account: ${authError.message}`) };
      }

      userId = authData.user?.id ?? null;
    } catch (authErr: any) {
      console.warn('Player auth account error:', authErr);
      return { data: null, error: new Error(`Auth error: ${authErr.message || authErr}`) };
    }
  }

  const playerCode = await generatePlayerCode();

  const { data, error } = await supabase
    .from('players')
    .insert({
      player_code: playerCode,
      full_name: form.full_name.trim(),
      age: Number(form.age),
      sport: form.sport,
      joining_date: form.joining_date || new Date().toISOString().split('T')[0],
      active: true,
      user_id: userId,
      created_by: creatorId,
    })
    .select()
    .maybeSingle();

  return { data: data as Player | null, error };
}

/**
 * Update an existing player's details.
 */
export async function updatePlayer(
  id: string,
  updates: Partial<Pick<Player, 'full_name' | 'age' | 'sport' | 'joining_date' | 'active'>>
) {
  const { data, error } = await supabase
    .from('players')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  return { data: data as Player | null, error };
}

/**
 * Toggle a player's active status (deactivate or reactivate).
 */
export async function togglePlayerStatus(id: string, active: boolean) {
  const { data, error } = await supabase
    .from('players')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  return { data: data as Player | null, error };
}

/**
 * Deactivate a player (sets active = false).
 */
export async function deactivatePlayer(id: string) {
  return togglePlayerStatus(id, false);
}

/**
 * Reactivate a player (sets active = true).
 */
export async function reactivatePlayer(id: string) {
  return togglePlayerStatus(id, true);
}

/**
 * Permanently delete a player record.
 */
export async function deletePlayer(id: string) {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', id);

  return { error };
}

/**
 * Get the player record linked to a given auth user (for player self-view).
 */
export async function getPlayerByUserId(userId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return { data: data as Player | null, error };
}
