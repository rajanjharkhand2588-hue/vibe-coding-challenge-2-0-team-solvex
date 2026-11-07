-- ==============================================================================
-- ACADEMY DESK - DATABASE SCHEMA & RLS POLICIES
-- Supabase Postgres Schema for Sports Academy Management System
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'scout', 'player')),
    player_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. PLAYERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 5 AND age <= 60),
    sport TEXT NOT NULL CHECK (sport IN ('Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 'Swimming')),
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    active BOOLEAN NOT NULL DEFAULT true,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Add foreign key back to profiles if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_profiles_player'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT fk_profiles_player
        FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ==============================================================================
-- 3. SESSIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    sport TEXT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 4. ATTENDANCE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    marked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(session_id, player_id)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. MATCHES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    sport TEXT NOT NULL,
    match_date DATE NOT NULL,
    location TEXT,
    result TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 6. MATCH PARTICIPANTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.match_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    performance_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(match_id, player_id)
);

ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 7. HELPER FUNCTIONS (SECURITY DEFINER to prevent recursive RLS)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_scout()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role = 'scout' OR role = 'admin')
    );
$$;

-- ==============================================================================
-- 8. SESSION LOCKING TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.prevent_closed_session_edit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    sess_status TEXT;
BEGIN
    SELECT status INTO sess_status FROM public.sessions WHERE id = COALESCE(NEW.session_id, OLD.session_id);
    IF sess_status = 'closed' THEN
        RAISE EXCEPTION 'Cannot modify attendance records for a closed session.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_closed_attendance_change ON public.attendance;
CREATE TRIGGER tr_prevent_closed_attendance_change
    BEFORE INSERT OR UPDATE OR DELETE ON public.attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_closed_session_edit();

CREATE OR REPLACE FUNCTION public.prevent_session_reopen()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status = 'closed' AND NEW.status <> 'closed' THEN
        RAISE EXCEPTION 'Closed sessions cannot be re-opened.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_session_reopen ON public.sessions;
CREATE TRIGGER tr_prevent_session_reopen
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_session_reopen();

-- ==============================================================================
-- 9. MATCH PARTICIPANT VALIDATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.validate_match_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    m_sport TEXT;
    p_sport TEXT;
    p_active BOOLEAN;
BEGIN
    SELECT sport INTO m_sport FROM public.matches WHERE id = NEW.match_id;
    SELECT sport, active INTO p_sport, p_active FROM public.players WHERE id = NEW.player_id;

    IF NOT p_active THEN
        RAISE EXCEPTION 'Cannot add inactive player to a match.';
    END IF;

    IF m_sport <> p_sport THEN
        RAISE EXCEPTION 'Player sport (%) does not match match sport (%).', p_sport, m_sport;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_validate_match_participant ON public.match_participants;
CREATE TRIGGER tr_validate_match_participant
    BEFORE INSERT OR UPDATE ON public.match_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_match_participant();

-- ==============================================================================
-- 10. AUTH PROFILE CREATION & AUTO-CONFIRM TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
    user_name TEXT;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'player');
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, user_name, user_role)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_auto_confirm_user ON auth.users;
CREATE TRIGGER tr_auto_confirm_user
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_confirm_user();

-- ==============================================================================
-- 11. PLAYER READINESS VIEW
-- Formula: Attendance % >= 75% AND Matches Played >= 2 => READY
-- ==============================================================================
CREATE OR REPLACE VIEW public.player_readiness AS
SELECT 
    p.id AS player_id,
    p.player_code,
    p.full_name,
    p.age,
    p.sport,
    p.joining_date,
    p.active,
    p.user_id,
    COALESCE(stats.total_sessions, 0::bigint) AS total_sessions,
    COALESCE(stats.present_sessions, 0::bigint) AS present_sessions,
    COALESCE(stats.absent_sessions, 0::bigint) AS absent_sessions,
    CASE
        WHEN COALESCE(stats.total_sessions, 0::bigint) = 0 THEN 0::numeric
        ELSE round((COALESCE(stats.present_sessions, 0::bigint)::numeric / stats.total_sessions::numeric) * 100::numeric, 2)
    END AS attendance_percentage,
    COALESCE(match_stats.matches_played, 0::bigint) AS matches_played,
    CASE
        WHEN COALESCE(stats.total_sessions, 0::bigint) > 0 
             AND (COALESCE(stats.present_sessions, 0::bigint)::numeric / stats.total_sessions::numeric) * 100::numeric >= 75::numeric 
             AND COALESCE(match_stats.matches_played, 0::bigint) >= 2 
        THEN 'READY'::text
        ELSE 'NOT READY'::text
    END AS readiness_status
FROM players p
LEFT JOIN LATERAL (
    SELECT 
        count(*) AS total_sessions,
        count(*) FILTER (WHERE a.status = 'present'::text) AS present_sessions,
        count(*) FILTER (WHERE a.status = 'absent'::text) AS absent_sessions
    FROM attendance a
    JOIN sessions s ON s.id = a.session_id
    WHERE a.player_id = p.id AND s.status = 'closed'::text AND s.sport = p.sport
) stats ON true
LEFT JOIN LATERAL (
    SELECT count(DISTINCT mp.match_id) AS matches_played
    FROM match_participants mp
    WHERE mp.player_id = p.id
) match_stats ON true
WHERE p.active = true;

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id OR is_admin())
    WITH CHECK (auth.uid() = id OR is_admin());

-- Players Policies
DROP POLICY IF EXISTS "Admins can manage players" ON public.players;
CREATE POLICY "Admins can manage players" ON public.players
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Players can view own record" ON public.players;
CREATE POLICY "Players can view own record" ON public.players
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Scouts can view active players" ON public.players;
CREATE POLICY "Scouts can view active players" ON public.players
    FOR SELECT TO authenticated
    USING (is_scout() AND active = true);

-- Sessions Policies
DROP POLICY IF EXISTS "Admins can manage sessions" ON public.sessions;
CREATE POLICY "Admins can manage sessions" ON public.sessions
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Players can view sessions" ON public.sessions;
CREATE POLICY "Players can view sessions" ON public.sessions
    FOR SELECT TO authenticated
    USING (
        (EXISTS (
            SELECT 1 FROM public.players
            WHERE players.user_id = auth.uid() AND players.sport = sessions.sport
        )) OR is_scout()
    );

-- Attendance Policies
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
CREATE POLICY "Admins can manage attendance" ON public.attendance
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Players can view own attendance" ON public.attendance;
CREATE POLICY "Players can view own attendance" ON public.attendance
    FOR SELECT TO authenticated
    USING (player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid()));

-- Matches Policies
DROP POLICY IF EXISTS "Admins can manage matches" ON public.matches;
CREATE POLICY "Admins can manage matches" ON public.matches
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Scouts can view matches" ON public.matches;
CREATE POLICY "Scouts can view matches" ON public.matches
    FOR SELECT TO authenticated
    USING (is_scout());

DROP POLICY IF EXISTS "Players can view own matches" ON public.matches;
CREATE POLICY "Players can view own matches" ON public.matches
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.match_participants mp
            JOIN public.players p ON p.id = mp.player_id
            WHERE mp.match_id = matches.id AND p.user_id = auth.uid()
        )
    );

-- Match Participants Policies
DROP POLICY IF EXISTS "Admins can manage match participants" ON public.match_participants;
CREATE POLICY "Admins can manage match participants" ON public.match_participants
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Scouts can view match participants" ON public.match_participants;
CREATE POLICY "Scouts can view match participants" ON public.match_participants
    FOR SELECT TO authenticated
    USING (is_scout());

DROP POLICY IF EXISTS "Players can view own match participation" ON public.match_participants;
CREATE POLICY "Players can view own match participation" ON public.match_participants
    FOR SELECT TO authenticated
    USING (player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid()));

