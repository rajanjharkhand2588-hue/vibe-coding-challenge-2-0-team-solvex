// ============================================================
// Academy Desk – TypeScript Type Definitions
// ============================================================

// ----- Database Row Types -----

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'scout' | 'player';
  player_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  player_code: string;
  full_name: string;
  age: number;
  sport: string;
  joining_date: string;
  active: boolean;
  user_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  session_date: string;
  sport: string;
  status: 'open' | 'closed';
  created_by: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  player_id: string;
  status: 'present' | 'absent';
  marked_by: string;
  created_at: string;
}

export interface Match {
  id: string;
  match_date: string;
  sport: string;
  opponent: string;
  session_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MatchParticipant {
  id: string;
  match_id: string;
  player_id: string;
  score: number;
  created_at: string;
}

export interface PlayerReadiness {
  player_id: string;
  player_code: string;
  full_name: string;
  age: number;
  sport: string;
  joining_date: string;
  active: boolean;
  user_id: string | null;
  total_sessions: number;
  present_sessions: number;
  absent_sessions: number;
  attendance_percentage: number;
  matches_played: number;
  readiness_status: 'READY' | 'NOT READY';
}

// ----- Role Type -----
export type UserRole = 'admin' | 'scout' | 'player';

// ----- Form Types -----

export interface CreatePlayerForm {
  full_name: string;
  age: number;
  sport: string;
  joining_date: string;
  email?: string;
  password?: string;
}

export interface CreateSessionForm {
  session_date: string;
  sport: string;
}

export interface CreateMatchForm {
  match_date: string;
  sport: string;
  opponent: string;
}

export interface MatchScoreEntry {
  player_id: string;
  score: number;
}

// ----- Dashboard Stats -----

export interface DashboardStats {
  totalPlayers: number;
  todayAttendance: number;
  totalMatches: number;
  readyPlayers: number;
}

// ----- Relational / Joined Types -----

export interface AttendanceWithPlayer extends AttendanceRecord {
  players: Player;
}

export interface AttendanceWithSession extends AttendanceRecord {
  sessions: Session;
}

export interface MatchParticipantWithPlayer extends MatchParticipant {
  players: Player;
}

export interface MatchWithParticipants extends Match {
  match_participants: MatchParticipantWithPlayer[];
}
