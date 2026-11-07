// ============================================================
// Academy Desk – Session Service
// ============================================================

import { supabase } from './supabase';
import type { Session, CreateSessionForm } from '../types';

/**
 * Fetch all sessions, newest first.
 */
export async function getSessions() {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('session_date', { ascending: false });

  return { data: (data ?? []) as Session[], error };
}

/**
 * Fetch a single session by ID.
 */
export async function getSessionById(id: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();

  return { data: data as Session | null, error };
}

/**
 * Create a new session after checking for duplicates (same date + sport).
 */
export async function createSession(form: CreateSessionForm, createdBy: string) {
  // Duplicate check
  const { data: existing } = await supabase
    .from('sessions')
    .select('id')
    .eq('session_date', form.session_date)
    .eq('sport', form.sport)
    .limit(1);

  if (existing && existing.length > 0) {
    return {
      data: null,
      error: {
        message: `A ${form.sport} session already exists for ${form.session_date}.`,
        details: '',
        hint: '',
        code: 'DUPLICATE',
      },
    };
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      session_date: form.session_date,
      sport: form.sport,
      status: 'open' as const,
      created_by: createdBy,
    })
    .select()
    .single();

  return { data: data as Session | null, error };
}

/**
 * Close a session — sets status to "closed" with a timestamp.
 */
export async function closeSession(id: string) {
  const { data, error } = await supabase
    .from('sessions')
    .update({
      status: 'closed' as const,
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  return { data: data as Session | null, error };
}

/**
 * Fetch sessions matching a specific date and sport.
 */
export async function getSessionsByDateAndSport(date: string, sport: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('session_date', date)
    .eq('sport', sport)
    .order('created_at', { ascending: false });

  return { data: (data ?? []) as Session[], error };
}
