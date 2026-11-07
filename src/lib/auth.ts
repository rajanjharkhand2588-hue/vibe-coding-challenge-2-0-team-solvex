// ============================================================
// Academy Desk – Auth Service
// ============================================================

import { supabase } from './supabase';
import type { Profile } from '../types';
import type { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js';

/**
 * Register a new user with email/password and set role in metadata.
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: Profile['role'] = 'player'
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  return { data, error };
}

/**
 * Sign in an existing user with email/password.
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the current auth session.
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { data: data.session, error };
}

/**
 * Fetch a user's profile from the profiles table.
 */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data: data as Profile | null, error };
}

/**
 * Update a user's profile.
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  return { data: data as Profile | null, error };
}

/**
 * Subscribe to auth state changes.
 * Returns the subscription so the caller can unsubscribe.
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): Subscription {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}
