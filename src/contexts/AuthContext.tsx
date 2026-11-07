import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: any; error: any; profile?: Profile | null }>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ data?: any; error: any; profile?: Profile | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to build a fallback profile from user object metadata
  const buildFallbackProfile = (activeUser: User, overrideRole?: string): Profile => {
    const role = (overrideRole || activeUser.user_metadata?.role || 'player') as UserRole;
    const fullName = activeUser.user_metadata?.full_name || activeUser.email?.split('@')[0] || 'User';

    return {
      id: activeUser.id,
      full_name: fullName,
      email: activeUser.email || '',
      role,
      player_id: null,
      avatar_url: null,
      created_at: activeUser.created_at || new Date().toISOString(),
      updated_at: activeUser.updated_at || new Date().toISOString(),
    };
  };

  const fetchProfile = async (userId: string, currentUser?: User | null): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        const userProfile = data as Profile;
        setProfile(userProfile);
        return userProfile;
      }

      if (error) {
        console.warn('Profile fetch note:', error.message);
      }

      // If profile record does not exist yet (e.g. trigger delay), synthesize from metadata
      const activeUser = currentUser || user || (await supabase.auth.getUser()).data.user;
      if (activeUser) {
        const fallbackProfile = buildFallbackProfile(activeUser);
        setProfile(fallbackProfile);

        // Try to upsert into profiles in background
        (async () => {
          try {
            await supabase.from('profiles').upsert(fallbackProfile);
          } catch {
            // Ignore background sync errors
          }
        })();
        return fallbackProfile;
      }

      return null;
    } catch (err) {
      console.warn('Profile retrieval notice:', err);
      if (currentUser || user) {
        const fallbackProfile = buildFallbackProfile(currentUser || user!);
        setProfile(fallbackProfile);
        return fallbackProfile;
      }
      return null;
    }
  };

  const refreshProfile = async (): Promise<Profile | null> => {
    if (!user) return null;
    return await fetchProfile(user.id, user);
  };

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Immediately set temporary profile so UI is never blocked
          const tempProf = buildFallbackProfile(currentUser);
          setProfile(tempProf);

          // Enrich with database profile
          await fetchProfile(currentUser.id, currentUser);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        const nextUser = newSession?.user ?? null;
        setUser(nextUser);

        if (nextUser) {
          const tempProf = buildFallbackProfile(nextUser);
          setProfile(tempProf);
          await fetchProfile(nextUser.id, nextUser);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // If an existing session for a different user is in localStorage, clear it
    if (user && user.email?.toLowerCase() !== cleanEmail) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore signout cleanup errors
      }
      setUser(null);
      setSession(null);
      setProfile(null);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error || !data.user) {
      return { data, error, profile: null };
    }

    // Immediately establish user, session, and synthesized profile
    const instantProfile = buildFallbackProfile(data.user);
    setUser(data.user);
    setSession(data.session);
    setProfile(instantProfile);

    // Enrich from DB
    let fetchedProf: Profile | null = null;
    try {
      fetchedProf = await fetchProfile(data.user.id, data.user);
    } catch {
      fetchedProf = instantProfile;
    }

    return { data, error: null, profile: fetchedProf || instantProfile };
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    // Clear any active session first to guarantee clean registration
    if (user) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore signout cleanup errors
      }
      setUser(null);
      setSession(null);
      setProfile(null);
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          role,
        },
      },
    });

    if (error) {
      return { data, error, profile: null };
    }

    // Detect duplicate email silently returned by Supabase (identities = [])
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return {
        data: null,
        error: {
          message: 'An account with this email already exists. Please sign in instead.',
        },
        profile: null,
      };
    }

    // If Supabase did not return a session directly, auto sign-in
    let activeSession = data.session;
    let activeUser = data.user;

    if (!activeSession && cleanEmail && password) {
      try {
        const signInRes = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInRes.data?.session) {
          activeSession = signInRes.data.session;
          activeUser = signInRes.data.user;
        } else if (signInRes.error) {
          console.warn('Post-signup auto-login notice:', signInRes.error.message);
        }
      } catch (signInErr) {
        console.warn('Auto sign-in exception:', signInErr);
      }
    }

    // Immediately build and assign profile
    let finalProfile: Profile | null = null;
    if (activeUser) {
      finalProfile = buildFallbackProfile(activeUser, role);
      setUser(activeUser);
      setSession(activeSession);
      setProfile(finalProfile);

      // Attempt to load from DB or persist fallback
      try {
        const dbProfile = await fetchProfile(activeUser.id, activeUser);
        if (dbProfile) finalProfile = dbProfile;
      } catch {
        // Fallback is already assigned
      }
    }

    return { data, error: null, profile: finalProfile };
  };

  const signOut = async () => {
    setProfile(null);
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
