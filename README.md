# Academy Desk — Sports Academy Management System 🏏⚽🎾

**Academy Desk** is a full-stack, enterprise-grade Sports Academy Management platform built with **React 19**, **TypeScript**, **Vite**, and **Supabase (PostgreSQL with RLS)**.

Designed for academies, coaches, scouts, and players to manage training sessions, track attendance, log match performances, and identify tournament-ready athletes through automated readiness formulas.

---

## 🚀 Key Features

### 1. Role-Based Access Control (RBAC)
- **Admin / Head Coach**: Full operational control — register & manage players, schedule training sessions, record attendance, create matches, and assign rosters.
- **Talent Scout**: Read-only access to tournament-ready players, scouting metrics, and match histories.
- **Player**: Personal athlete dashboard showing session schedules, attendance history, match participation, and readiness percentage.
- **Visitor / Public**: Academy overview, program highlights, and self-registration with instant role assignment.

### 2. Session Scheduling & Locking
- Create sports-specific practice sessions with date, time, and target discipline.
- **Immutable Session History**: Once an admin marks a session as **Closed**, the attendance records are locked via database triggers to guarantee data integrity.

### 3. Match Management & Validation
- Organize inter-academy and competitive fixtures.
- **Integrity Validation Trigger**: PostgreSQL trigger prevents assigning inactive players or players whose enrolled sport does not match the match fixture.

### 4. Automated Player Readiness Formula
- **Formula**: `Attendance Rate >= 75%` **AND** `Matches Played >= 2` = **READY**
- Scout views automatically filter and highlight only players meeting readiness criteria.

### 5. Multi-Device Responsive Design
- Crafted for mobile (<=640px), tablet (641px–1024px), and desktop screens with collapsible sidebar navigation, quick-action drawers, and touch-friendly controls.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Router 7, Lucide Icons |
| **Backend & DB** | Supabase (PostgreSQL 17), Supabase Auth |
| **Security** | Row Level Security (RLS) policies, PostgreSQL `SECURITY DEFINER` helper functions, database triggers |
| **Styling** | Custom Responsive CSS Design System with dark sidebar navigation and light content surfaces |
| **Deployment** | Vercel SPA with rewrite rules (`vercel.json`) |

---

## 📁 Project Structure

```
cricket-academy/
├── public/                 # Static assets & icons
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # Sidebar, Header, DashboardLayout
│   │   └── ProtectedRoute.tsx
│   ├── contexts/           # AuthContext with race-free multi-user switching
│   ├── lib/                # Supabase client & API services
│   │   ├── auth.ts
│   │   ├── players.ts
│   │   ├── sessions.ts
│   │   ├── attendance.ts
│   │   ├── matches.ts
│   │   └── readiness.ts
│   ├── pages/              # Role-specific dashboard & workflow pages
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── OverviewPage.tsx
│   │   ├── PlayersPage.tsx
│   │   ├── AttendancePage.tsx
│   │   ├── MatchesPage.tsx
│   │   ├── ReadyPlayersPage.tsx
│   │   ├── ScoutDashboard.tsx
│   │   ├── PlayerDashboard.tsx
│   │   └── SettingsPage.tsx
│   ├── types/              # Comprehensive TypeScript interfaces
│   ├── App.tsx             # Route definitions & lazy loading
│   ├── main.tsx            # Application entrypoint
│   └── index.css           # Responsive design system
├── supabase/
│   └── schema.sql          # Complete PostgreSQL schema, functions, triggers & RLS
├── vercel.json             # Vercel SPA routing rewrites
├── vite.config.ts          # Vite build configuration
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🏃 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/rajanjharkhand2588-hue/vibe-coding-challenge-2-0-team-solvex.git
cd vibe-coding-challenge-2-0-team-solvex
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

---

## 🗄️ Database Setup

The database schema, triggers, helper functions, and RLS policies can be set up in Supabase:
1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor**.
3. Paste the contents of `supabase/schema.sql` and click **Run**.

---

## 🌐 Deploy to Vercel

1. Push your code to GitHub.
2. In [Vercel](https://vercel.com/new), import your repository: `vibe-coding-challenge-2-0-team-solvex`.
3. Add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**.

---

## 🔒 Security Architecture

- **Row Level Security (RLS)** is enabled on all tables (`profiles`, `players`, `sessions`, `attendance`, `matches`, `match_participants`).
- Non-admin users cannot write to training sessions or edit closed sessions.
- Authentication utilizes JWT-based sessions with instant fallback profile generation to prevent UI locking during cold starts or rapid account switching.
