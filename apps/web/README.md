# SchedulePro — Product Requirements Document (PRD)

> **Version:** 1.0.0  
> **Status:** Production  
> **Live URL:** https://schedulepro-web.vercel.app  
> **Stack:** React 18 · Vite 5 · Tailwind CSS 3 · Supabase · PWA  
> **Last Updated:** March 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Users](#3-target-users)
4. [Architecture Overview](#4-architecture-overview)
5. [Technology Stack](#5-technology-stack)
6. [Project Structure](#6-project-structure)
7. [Routing & Navigation](#7-routing--navigation)
8. [Authentication System](#8-authentication-system)
9. [Database Schema (Supabase)](#9-database-schema-supabase)
10. [Pages & Screens](#10-pages--screens)
11. [Shared UI Components](#11-shared-ui-components)
12. [Custom Hooks](#12-custom-hooks)
13. [Context Providers](#13-context-providers)
14. [Library Modules](#14-library-modules)
15. [Utilities](#15-utilities)
16. [State Management & Data Flow](#16-state-management--data-flow)
17. [Offline-First Architecture](#17-offline-first-architecture)
18. [Real-Time Sync](#18-real-time-sync)
19. [PWA Configuration](#19-pwa-configuration)
20. [Dark Mode System](#20-dark-mode-system)
21. [Design System & Theming](#21-design-system--theming)
22. [Task Data Model](#22-task-data-model)
23. [Settings Data Model](#23-settings-data-model)
24. [Environment Variables](#24-environment-variables)
25. [Build & Deployment](#25-build--deployment)
26. [Known Limitations & Future Work](#26-known-limitations--future-work)

---

## 1. Executive Summary

SchedulePro is a **discipline-driven, cloud-synced daily productivity planner** built as a Progressive Web App (PWA). It enables users to plan their week, track tasks in real time, review historical schedules, and enter a distraction-free focus mode — all backed by a Supabase cloud database with offline-first local storage fallback.

The application is faith-integrated: the landing page surfaces a daily Bible verse, an inspirational quote, and a "Did You Know" fact each day. It is designed for individuals who want structured, intentional time management across categories like Work, Coding, Spirituality, Health, Languages, Literature, Leadership, Meals, Chores, and Leisure.

---

## 2. Product Vision & Goals

### Vision
A premium, mobile-first scheduling application that feels as polished as a native app, works offline, syncs instantly across devices, and keeps the user anchored to their daily purpose.

### Primary Goals
| # | Goal | Status |
|---|------|--------|
| 1 | Full weekly schedule management (add, edit, delete, reorder tasks) | ✅ Implemented |
| 2 | Real-time cloud sync via Supabase Postgres subscriptions | ✅ Implemented |
| 3 | Offline-first with localStorage fallback and pending-change queue | ✅ Implemented |
| 4 | Authentication: sign-up, sign-in, password reset, account management | ✅ Implemented |
| 5 | Focus Mode with live countdown timer | ✅ Implemented |
| 6 | Schedule history (last 30 days) with cloud + local source | ✅ Implemented |
| 7 | Dark mode as a first-class experience | ✅ Implemented |
| 8 | PWA installability with offline caching | ✅ Implemented |
| 9 | Daily inspirational content (scripture, quote, fact) | ✅ Implemented |
| 10 | Per-user settings persisted to Supabase | ✅ Implemented |

---

## 3. Target Users

- **Disciplined self-improvers** who plan their days in time blocks
- **Faith-motivated individuals** who appreciate daily scripture
- **Multi-device users** who need their schedule available everywhere
- **Offline-capable users** (commuters, travelers) who need the app to work without internet
- **Productivity enthusiasts** who track categories like coding, languages, health, and leadership

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / PWA                            │
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│  │  React SPA   │   │  Tailwind    │   │  Framer Motion   │   │
│  │  (Vite 5)    │   │  CSS v3      │   │  Animations      │   │
│  └──────┬───────┘   └──────────────┘   └──────────────────┘   │
│         │                                                       │
│  ┌──────▼───────────────────────────────────────────────────┐  │
│  │                   React Router v6                         │  │
│  │  / → Landing  /dashboard  /daily-view  /weekly-planner   │  │
│  │  /focus  /history-view  /settings  /auth-page  /pwa      │  │
│  └──────┬───────────────────────────────────────────────────┘  │
│         │                                                       │
│  ┌──────▼───────────────────────────────────────────────────┐  │
│  │              Custom Hooks Layer                           │  │
│  │  useSchedule · useSettings · useDarkMode · useSyncStatus  │  │
│  │  useOfflineQueue · usePWAInstall · useNetworkStatus       │  │
│  └──────┬───────────────────────────────────────────────────┘  │
│         │                                                       │
│  ┌──────▼───────────────────────────────────────────────────┐  │
│  │              AuthContext (Supabase Auth)                  │  │
│  └──────┬───────────────────────────────────────────────────┘  │
│         │                                                       │
│  ┌──────▼───────────────────────────────────────────────────┐  │
│  │              localStorage (Offline Cache)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS / WebSocket
┌─────────────────────────────▼───────────────────────────────────┐
│                        Supabase                                 │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Auth        │  │  Postgres DB │  │  Realtime            │  │
│  │  (JWT/email) │  │  (4 tables)  │  │  (Postgres Changes)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Technology Stack

### Core Framework
| Package | Version | Purpose |
|---------|---------|--------|
| `react` | ^18.2.0 | UI framework |
| `react-dom` | ^18.2.0 | DOM rendering |
| `vite` | 5.0.0 | Build tool & dev server |
| `@vitejs/plugin-react` | 4.3.4 | React fast refresh |
| `vite-plugin-pwa` | 0.21.0 | PWA service worker generation |

### Routing
| Package | Version | Purpose |
|---------|---------|--------|
| `react-router-dom` | 6.0.2 | Client-side routing |
| `react-router-hash-link` | ^2.4.3 | Anchor/hash navigation |

### Backend / Database
| Package | Version | Purpose |
|---------|---------|--------|
| `@supabase/supabase-js` | ^2.87.1 | Supabase client (auth + DB + realtime) |

### Styling
| Package | Version | Purpose |
|---------|---------|--------|
| `tailwindcss` | 3.4.6 | Utility-first CSS |
| `@tailwindcss/forms` | ^0.5.7 | Form element normalization |
| `@tailwindcss/typography` | ^0.5.16 | Prose typography |
| `@tailwindcss/aspect-ratio` | ^0.4.2 | Aspect ratio utilities |
| `@tailwindcss/container-queries` | ^0.1.1 | Container query support |
| `tailwindcss-animate` | ^1.0.7 | Animation utilities |
| `tailwindcss-elevation` | ^2.0.0 | Material elevation shadows |
| `tailwindcss-fluid-type` | ^2.0.7 | Fluid typography |
| `autoprefixer` | 10.4.2 | CSS vendor prefixing |
| `postcss` | 8.4.8 | CSS processing |

### UI & Animation
| Package | Version | Purpose |
|---------|---------|--------|
| `framer-motion` | ^10.16.4 | Animations and transitions |
| `lucide-react` | ^0.484.0 | Icon library |
| `@radix-ui/react-slot` | ^1.2.3 | Composable slot primitive |
| `class-variance-authority` | ^0.7.1 | Component variant management |
| `clsx` | ^2.1.1 | Conditional class names |
| `tailwind-merge` | ^3.3.1 | Tailwind class deduplication |

### Drag & Drop
| Package | Version | Purpose |
|---------|---------|--------|
| `@hello-pangea/dnd` | ^18.0.1 | Drag-and-drop for task reordering |

### Data & Charts
| Package | Version | Purpose |
|---------|---------|--------|
| `recharts` | ^2.15.2 | Chart components |
| `d3` | ^7.9.0 | Data visualization primitives |
| `date-fns` | ^4.1.0 | Date manipulation |

### Forms & HTTP
| Package | Version | Purpose |
|---------|---------|--------|
| `react-hook-form` | ^7.55.0 | Form state management |
| `axios` | ^1.8.4 | HTTP client |
| `dotenv` | ^16.0.1 | Environment variable loading |

### State Management
| Package | Version | Purpose |
|---------|---------|--------|
| `@reduxjs/toolkit` | ^2.6.1 | Redux toolkit (available, not primary) |
| `redux` | ^5.0.1 | Redux core |

### SEO
| Package | Version | Purpose |
|---------|---------|--------|
| `react-helmet` | ^6.1.0 | Document head management |

### Testing
| Package | Version | Purpose |
|---------|---------|--------|
| `@testing-library/react` | ^11.2.7 | React component testing |
| `@testing-library/jest-dom` | ^5.15.1 | DOM assertion matchers |
| `@testing-library/user-event` | ^12.8.3 | User interaction simulation |

---

## 6. Project Structure

```
schedulepro/
├── index.html                          # HTML entry point, PWA meta tags
├── package.json                        # Dependencies and scripts
├── vite.config.js                      # Vite + PWA plugin config
├── tailwind.config.js                  # Full design system config
├── postcss.config.js                   # PostCSS pipeline
├── jsconfig.json                       # Path aliases (src/ → @/)
├── .env                                # Environment variables
├── favicon.ico                         # Root favicon
│
├── public/
│   ├── manifest.json                   # PWA manifest
│   ├── favicon.ico                     # Public favicon
│   ├── robots.txt                      # SEO crawl rules
│   ├── _redirects                      # Netlify/CDN SPA redirect rule
│   └── assets/images/
│       └── no_image.png                # Fallback image
│
├── supabase/
│   └── migrations/
│       └── 20260309173932_schedulepro_schema.sql  # Full DB schema
│
└── src/
    ├── index.jsx                       # App entry — mounts AuthProvider + App
    ├── App.jsx                         # AppInner: theme init, onboarding gate
    ├── Routes.jsx                      # BrowserRouter + all route definitions
    │
    ├── styles/
    │   ├── tailwind.css                # Tailwind directives + CSS variables
    │   └── index.css                   # Global reset (body, box-sizing)
    │
    ├── lib/
    │   ├── supabase.js                 # Supabase client singleton
    │   └── dailyContent.js             # Daily scripture/quote/fact fetcher
    │
    ├── utils/
    │   └── cn.js                       # clsx + tailwind-merge utility
    │
    ├── contexts/
    │   └── AuthContext.jsx             # Auth state, user profile, auth methods
    │
    ├── hooks/
    │   ├── useSchedule.js              # Task CRUD + Supabase sync + realtime
    │   ├── useSettings.js              # User settings + Supabase upsert
    │   ├── useDarkMode.js              # Theme toggle (light/dark/system)
    │   ├── useSyncStatus.js            # Sync badge state (offline/syncing/synced)
    │   ├── useOfflineQueue.js          # Pending-change queue for offline writes
    │   ├── usePWAInstall.js            # PWA install prompt management
    │   └── useNetworkStatus.js         # navigator.onLine listener
    │
    ├── components/
    │   ├── AppIcon.jsx                 # Lucide icon wrapper
    │   ├── AppImage.jsx                # Image with fallback
    │   ├── ErrorBoundary.jsx           # React error boundary
    │   ├── ScrollToTop.jsx             # Route-change scroll reset
    │   ├── OnboardingModal.jsx         # First-run name capture modal
    │   ├── FocusFAB.jsx                # Floating action button → Focus Mode
    │   ├── WeeklyProgressBar.jsx       # 7-day completion progress bar
    │   └── ui/
    │       ├── TopAppBar.jsx           # Global header with sync badge
    │       ├── BottomTabNavigation.jsx # 5-tab bottom nav
    │       ├── TaskEditorModal.jsx     # Full task create/edit modal
    │       ├── SyncStatusBadge.jsx     # Offline/syncing/synced indicator
    │       ├── Button.jsx              # Reusable button component
    │       ├── Input.jsx               # Reusable input component
    │       ├── Select.jsx              # Reusable select component
    │       └── Checkbox.jsx            # Reusable checkbox component
    │
    └── pages/
        ├── NotFound.jsx                # 404 page
        ├── online-landing-page/        # / and /online-landing-page
        ├── auth-page/                  # /auth-page
        ├── onboarding-welcome/         # /onboarding-welcome
        ├── dashboard/                  # /dashboard
        ├── daily-view/                 # /daily-view
        ├── weekly-planner/             # /weekly-planner
        ├── focus-mode/                 # /focus
        ├── history-view/               # /history-view
        ├── settings/                   # /settings and /settings-page
        ├── pwa-install-prompt/         # /pwa-install-prompt
        ├── task-editor-modal/          # (standalone modal page)
        └── settings-page/              # (alias)
```

---

## 7. Routing & Navigation

### Route Table

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `OnlineLandingPage` | Default entry — daily content splash |
| `/online-landing-page` | `OnlineLandingPage` | Alias for landing page |
| `/auth-page` | `AuthPage` | Sign in / Create account |
| `/dashboard` | `Dashboard` | Today's schedule overview |
| `/daily-view` | `DailyView` | Timeline view for any day |
| `/weekly-planner` | `WeeklyPlanner` | 7-column weekly grid |
| `/focus` | `FocusModePage` | Distraction-free countdown timer |
| `/history-view` | `HistoryView` | Past 30 days of schedule history |
| `/settings` | `Settings` | App settings + profile management |
| `/settings-page` | `Settings` | Alias for settings |
| `/onboarding-welcome` | `OnboardingWelcome` | Post-onboarding welcome screen |
| `/pwa-install-prompt` | `PWAInstallPrompt` | PWA installation guide |
| `*` | `NotFound` | 404 fallback |

### Navigation Architecture

- **Single `BrowserRouter`** lives exclusively in `Routes.jsx` — never in `App.jsx`
- **`FocusFAB`** (floating action button) is rendered globally inside `ErrorBoundary` in `Routes.jsx`, visible on `/dashboard`, `/daily-view`, and `/weekly-planner`
- **`BottomTabNavigation`** is rendered inside each main page (Dashboard, Daily View, Weekly Planner, History, Settings)
- **`TopAppBar`** is rendered inside each main page with mode toggle, dark mode, PWA install, sync badge, and add-task button
- **`ScrollToTop`** resets scroll position on every route change

### Bottom Tab Navigation Tabs

| Tab | Path | Icon |
|-----|------|------|
| Dashboard | `/dashboard` | `LayoutDashboard` |
| Weekly | `/weekly-planner` | `CalendarDays` |
| Daily | `/daily-view` | `CalendarClock` |
| History | `/history-view` | `History` |
| Settings | `/settings` | `Settings` |

---

## 8. Authentication System

### Provider
- **Supabase Auth** with email + password strategy
- JWT tokens auto-refreshed, sessions persisted in localStorage

### AuthContext (`src/contexts/AuthContext.jsx`)

The `AuthProvider` wraps the entire app (mounted in `src/index.jsx`). It exposes:

| Value | Type | Description |
|-------|------|-------------|
| `user` | `User \| null` | Current Supabase auth user |
| `userProfile` | `Profile \| null` | Row from `public.profiles` |
| `loading` | `boolean` | Auth session loading state |
| `profileLoading` | `boolean` | Profile fetch loading state |
| `isAuthenticated` | `boolean` | Derived: `!!user` |
| `signIn(email, password)` | `async fn` | Calls `supabase.auth.signInWithPassword` |
| `signOut()` | `async fn` | Calls `supabase.auth.signOut` |
| `updateProfile(updates)` | `async fn` | Updates `public.profiles` row |
| `updateEmail(newEmail)` | `async fn` | Calls `supabase.auth.updateUser` |
| `updatePassword(newPassword)` | `async fn` | Calls `supabase.auth.updateUser` |
| `deleteAccount()` | `async fn` | Calls `supabase.rpc('delete_user_account')` |

### Auth Flow

```
App Load
  └─ supabase.auth.getSession()
       ├─ Session exists → setUser(session.user) → load profile
       └─ No session → setUser(null)

Sign Up (/auth-page → Create Account tab)
  └─ supabase.auth.signUp({ email, password, options: { data: { name } } })
       └─ DB trigger: handle_new_user() → INSERT into profiles + user_settings
       └─ navigate('/dashboard')

Sign In (/auth-page → Sign In tab)
  └─ signIn(email, password)
       └─ navigate('/dashboard')

Password Reset
  └─ ForgotPasswordModal → supabase.auth.resetPasswordForEmail(email, { redirectTo })
       └─ Email sent → user clicks link → redirected to /auth-page

Sign Out (Settings page)
  └─ signOut() → clear local state → redirect to /auth-page

Delete Account (Settings page)
  └─ Type "DELETE" to confirm
       └─ localStorage.clear() → signOut() → redirect to /auth-page

Guest Mode
  └─ localStorage.setItem('schedulepro_guest_mode', 'true')
       └─ navigate('/dashboard') — no cloud sync, localStorage only
```

### Onboarding Gate

`App.jsx` checks:
1. Is there a Supabase authenticated user? → Skip onboarding
2. Is there a `schedulepro_user` localStorage entry with `onboarded: true`? → Skip onboarding
3. Neither → Show `OnboardingModal` (name capture)

---

## 9. Database Schema (Supabase)

**Migration file:** `supabase/migrations/20260309173932_schedulepro_schema.sql`

### Tables

#### `public.profiles`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, FK → `auth.users(id)` ON DELETE CASCADE | Matches Supabase auth user ID |
| `name` | `TEXT` | NOT NULL DEFAULT `''` | Display name |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Account creation time |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Last profile update |

#### `public.schedule_blocks`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK DEFAULT gen_random_uuid() | Unique task ID |
| `user_id` | `UUID` | FK → `auth.users(id)` ON DELETE CASCADE | Owner |
| `title` | `TEXT` | NOT NULL | Task name |
| `category` | `TEXT` | NOT NULL | Category key (work, coding, etc.) |
| `day_of_week` | `TEXT` | NOT NULL | Day name (Sunday–Saturday) |
| `start_time` | `TEXT` | NOT NULL | HH:MM format |
| `end_time` | `TEXT` | NOT NULL | HH:MM format |
| `mode` | `TEXT` | DEFAULT `'strict'` | flexible \| strict |
| `notes` | `TEXT` | | Optional notes |
| `is_completed` | `BOOLEAN` | DEFAULT FALSE | Completion flag |
| `completed_at` | `TIMESTAMPTZ` | | When marked complete |
| `recurrence_type` | `TEXT` | | Future: daily/weekly recurrence |
| `recurrence_days` | `TEXT[]` | | Future: recurrence day array |
| `duration_minutes` | `INTEGER` | | Duration in minutes |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

**Indexes:**
- `idx_schedule_blocks_user_id` on `user_id`
- `idx_schedule_blocks_day_of_week` on `day_of_week`

#### `public.user_settings`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | `UUID` | PK, FK → `auth.users(id)` ON DELETE CASCADE | One row per user |
| `schedule_mode` | `TEXT` | DEFAULT `'strict'` | flexible \| strict |
| `time_format` | `TEXT` | DEFAULT `'12h'` | 12h \| 24h |
| `theme` | `TEXT` | DEFAULT `'system'` | light \| dark \| system |
| `day_start_time` | `TEXT` | DEFAULT `'06:00'` | HH:MM |
| `day_end_time` | `TEXT` | DEFAULT `'23:59'` | HH:MM |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

#### `public.schedule_history`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK DEFAULT gen_random_uuid() | |
| `user_id` | `UUID` | FK → `auth.users(id)` ON DELETE CASCADE | Owner |
| `snapshot_date` | `DATE` | NOT NULL | The date of the snapshot |
| `blocks` | `JSONB` | NOT NULL DEFAULT `'[]'` | Array of task objects |
| `stats` | `JSONB` | | Aggregate stats (optional) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

**Unique constraint:** `(user_id, snapshot_date)` — one snapshot per user per day  
**Indexes:**
- `idx_schedule_history_user_id`
- `idx_schedule_history_snapshot_date`

### Row Level Security (RLS)

All four tables have RLS enabled. Each table has a single policy:

```sql
-- Pattern applied to all tables:
CREATE POLICY "users_manage_own_<table>"
  ON public.<table>
  FOR ALL
  TO authenticated
  USING (<user_col> = auth.uid())
  WITH CHECK (<user_col> = auth.uid());
```

Users can only read/write their own rows. No cross-user data access is possible.

### Trigger: Auto-Create Profile on Signup

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

`handle_new_user()` inserts a row into `profiles` (using name from `raw_user_meta_data`) and a row into `user_settings` with defaults. Both use `ON CONFLICT DO NOTHING` for idempotency.

---

## 10. Pages & Screens

### 10.1 Online Landing Page (`/`)
**File:** `src/pages/online-landing-page/index.jsx`

The app's entry point. A full-screen glassmorphism card over a dynamic background image (from Picsum Photos seeded by date).

**Features:**
- Fetches daily content via `getDailyContent()` from `lib/dailyContent.js`
- Displays: Bible verse (`ScriptureSection`), inspirational quote (`QuoteSection`), "Did You Know" fact (`FactSection`)
- Shows `OfflineBanner` if offline or using fallback content
- "Start Planning" CTA navigates to `/dashboard`
- Content is cached in localStorage by date key (`schedulepro_daily_YYYY-MM-DD`)
- Falls back to hardcoded content if network is unavailable
- Background: Picsum Photos URL seeded with `YYYYMMDD` for consistent daily image

**Sub-components:**
- `ScriptureSection` — renders scripture text + reference with skeleton loading
- `QuoteSection` — renders quote + author with skeleton loading
- `FactSection` — renders fact with skeleton loading
- `OfflineBanner` — red/amber banner indicating offline or stale content

**Daily Content Sources:**
- **Scripture:** Rotates through 52 curated Bible verses (one per week of year, cycling)
- **Quote:** Fetched from `https://api.quotable.io/quotes/random?tags=inspirational`
- **Fact:** Fetched from `https://uselessfacts.jsph.pl/api/v2/facts/today?language=en`
- **Background:** `https://picsum.photos/seed/{YYYYMMDD}/1920/1080`

---

### 10.2 Auth Page (`/auth-page`)
**File:** `src/pages/auth-page/index.jsx`

Premium glassmorphism authentication screen with indigo/violet gradient background.

**Features:**
- **Sign In tab:** Email + password, show/hide toggle, Forgot Password link
- **Create Account tab:** Name, email, password, confirm password, `PasswordStrengthIndicator`
- **Forgot Password:** Opens `ForgotPasswordModal` → calls `supabase.auth.resetPasswordForEmail`
- **Guest Mode:** Bypasses auth, sets `schedulepro_guest_mode` in localStorage, navigates to dashboard
- Auto-redirects to `/dashboard` if user is already authenticated
- Loading spinner while auth state resolves
- Inline error messages for all failure states

**Sub-components:**
- `ForgotPasswordModal` — email input → sends reset link → success state with email confirmation
- `PasswordStrengthIndicator` — 3-segment bar: Weak (red) / Fair (amber) / Strong (emerald), based on length + uppercase + numbers + special chars

---

### 10.3 Dashboard (`/dashboard`)
**File:** `src/pages/dashboard/index.jsx`

The primary home screen. Shows today's schedule at a glance.

**Features:**
- Personalized greeting (Good Morning/Afternoon/Evening + user name from profile or email)
- Today's date label
- Day progress bar (% of tasks completed)
- Current active task card with "Live" badge and "Enter Focus Mode" button
- Next Up card (next upcoming task)
- Upcoming tasks list (next 5 tasks)
- Focus Area Breakdown (horizontal bar chart by category, hours)
- "Today at a Glance" stats grid: Total Blocks, Completed, Remaining, Total Hours
- "This Week" mini calendar showing task count per day
- Add Task button → `TaskEditorModal`
- Click any task → `TaskEditorModal` in edit mode
- Real-time clock (updates every 60 seconds)
- Loading spinner while `useSchedule` fetches from Supabase

**Sub-components:**
- `GreetingHeader` — greeting text + today label + task count
- `DayProgressBar` — animated progress bar with completed/total counts
- `CurrentTaskCard` — active task with category color accent, time range, remaining minutes
- `NextUpCard` — next upcoming task preview
- `UpcomingTasksList` — scrollable list of next 5 tasks with toggle-complete checkboxes
- `FocusAreaBreakdown` — category breakdown with proportional horizontal bars

---

### 10.4 Daily View (`/daily-view`)
**File:** `src/pages/daily-view/index.jsx`

A scrollable vertical timeline for any selected day.

**Features:**
- Day navigation (prev/next/today buttons)
- Vertical timeline with pixel-accurate block positioning (1.2px per minute)
- Current time indicator (red line) that auto-scrolls into view on today
- Task blocks positioned absolutely by start time
- Active block (currently running) highlighted differently from past blocks
- Drag-and-drop reordering via `@hello-pangea/dnd` — reorders blocks and recalculates times proportionally
- Click any block → `TaskEditorModal` in edit mode
- Empty state with "Add your first task" CTA
- Day summary bar (total tasks, completed count, total hours)
- 12h/24h time format toggle
- Loading spinner while fetching

**Sub-components:**
- `DayNavigation` — prev/next/today controls with date display
- `TimelineBlock` — absolutely positioned task card with drag handle, completion toggle, category color
- `CurrentTimeIndicator` — red horizontal line with current time label
- `TimeAxisLabel` — hour labels on the left axis
- `EmptyDayState` — illustrated empty state with add task CTA
- `DaySummaryBar` — compact stats bar above the timeline

---

### 10.5 Weekly Planner (`/weekly-planner`)
**File:** `src/pages/weekly-planner/index.jsx`

A 7-column grid view of the entire week.

**Features:**
- Desktop/tablet: `WeeklyGrid` — 7-column layout with tasks in each day column
- Mobile: `MobileDayView` — single-day view with day selector tabs
- Week label (e.g., "Mar 3 – Mar 9, 2026")
- Week summary bar (total tasks, total hours)
- Weekly progress bar (per-day mini bars + overall %)
- Category legend with task counts per category
- 12h/24h time format toggle
- Add task per day (click empty slot or + button)
- Edit task (click existing task)
- Loading spinner while fetching

**Sub-components:**
- `WeeklyGrid` — desktop 7-column grid
- `MobileDayView` — mobile single-day with swipeable day tabs
- `WeekSummaryBar` — total tasks + hours + week label
- `CategoryLegend` — color-coded category pills with counts
- `WeeklyProgressBar` (shared component) — 7-day progress visualization

---

### 10.6 Focus Mode (`/focus`)
**File:** `src/pages/focus-mode/index.jsx`

A distraction-free, full-screen focus experience.

**Features:**
- Dark background with radial gradient tinted by current task's category color
- Displays current active task (title, category, time range)
- `CountdownTimer` — SVG circular ring + digital countdown (HH:MM:SS)
- "Mark Complete" button — calls `toggleCompletion` on the current task
- "Edit Task" button — opens `TaskEditorModal`
- "Up Next" card showing the next scheduled task
- `NoActiveTask` state — shows time until next task if nothing is currently active
- Auto-advances when countdown hits 0
- Exit button (top-left) → navigates back to `/dashboard`
- Accessible via `FocusFAB` (floating button on Dashboard, Daily View, Weekly Planner) and `TopAppBar` Focus Mode button

**Sub-components:**
- `CountdownTimer` — SVG ring with stroke-dashoffset animation + digital time display
- `UpNextCard` — compact preview of the next task
- `NoActiveTask` — empty state with countdown to next task

---

### 10.7 History View (`/history-view`)
**File:** `src/pages/history-view/index.jsx`

Browse and review past schedule snapshots.

**Features:**
- Last 30 days date picker (horizontal scrollable strip)
- Dates with data highlighted (dot indicator)
- Selected date shows all schedule blocks for that day
- Stats bar: total blocks, completed count, completion %
- Each block rendered as `HistoryBlockCard` with completion status
- Data source badge: ☁️ Cloud (Supabase) or 💾 Local cache (localStorage)
- Real-time Supabase subscription for live updates to history
- Offline/loading/synced status indicator in header
- Merges Supabase data + localStorage data (Supabase takes priority)
- Fetches last 30 days from `schedule_history` table

**Sub-components:**
- `HistoryDatePicker` — horizontal scrollable date strip with data indicators
- `HistoryStatsBar` — completion stats for selected date
- `HistoryBlockCard` — individual task card with category color, time, completion badge

---

### 10.8 Settings (`/settings`)
**File:** `src/pages/settings/index.jsx`

Full settings management page (677 lines).

**Sections:**

1. **Edit Profile**
   - Avatar initial display
   - Name field (updates `public.profiles.name`)
   - Email field (calls `supabase.auth.updateUser` — sends confirmation email)
   - Save button with success/error feedback

2. **Change Password**
   - New password + confirm password fields with show/hide toggles
   - Minimum 8 characters validation
   - Passwords must match validation
   - Calls `supabase.auth.updateUser({ password })`

3. **Appearance**
   - Theme selector: Light / System / Dark (3-button toggle)
   - Calls `setTheme()` from `useDarkMode` + `updateSettings({ theme })`

4. **Schedule Settings**
   - Day boundaries: Start time + End time (time inputs)
   - Validates end > start
   - Schedule mode: Flexible / Structured toggle
   - Time format: 12h / 24h toggle
   - Each setting saved to Supabase `user_settings` on change
   - Per-field save confirmation ("Saved!" badge, 2s timeout)

5. **Categories**
   - Visual display of all 9 categories with color swatches
   - Work, Languages, Literature, Coding, Leadership, Spirituality, Chores, Meals, Leisure

6. **Reset Schedule**
   - Clears `schedulepro_tasks` and all `schedulepro_history_*` from localStorage
   - Two-step confirmation (click once to arm, click again to execute)
   - Reloads page after reset

7. **Delete Account**
   - Opens confirmation dialog
   - Must type "DELETE" to confirm
   - Clears all localStorage + signs out + redirects to `/auth-page`

8. **Sign Out**
   - Calls `signOut()` from `AuthContext`

---

### 10.9 Onboarding Welcome (`/onboarding-welcome`)
**File:** `src/pages/onboarding-welcome/index.jsx`

Simple welcome screen shown after onboarding completion. Displays app logo + tagline + "Go to Dashboard" CTA.

---

### 10.10 PWA Install Prompt (`/pwa-install-prompt`)
**File:** `src/pages/pwa-install-prompt/index.jsx`

Dedicated page for PWA installation guidance.

**Features:**
- `PWAStatusBadge` — shows installed/not-installed/online status
- `PWAInstallCard` — install button (triggers native browser install prompt) or "Already Installed" state
- `PWAFeaturesGrid` — grid of PWA benefits (offline access, home screen, fast load, etc.)
- Offline info card explaining local caching behavior
- Uses `usePWAInstall` hook for install prompt management

---

## 11. Shared UI Components

### 11.1 TopAppBar (`src/components/ui/TopAppBar.jsx`)

Global header rendered on all main pages.

| Element | Description |
|---------|-------------|
| Logo | Clock icon + "SchedulePro" text → links to `/dashboard` |
| Mode Toggle | Flexible / Structured toggle (hidden on mobile) |
| Focus Mode Button | Target icon → navigates to `/focus` |
| Dark Mode Toggle | Sun/Moon icon → calls `toggleTheme()` |
| PWA Install Button | Download icon (shown only when `canInstall` is true) |
| Sync Status Badge | `SyncStatusBadge` component |
| Add Task Button | Plus icon → calls `onAddTask` prop |

### 11.2 BottomTabNavigation (`src/components/ui/BottomTabNavigation.jsx`)

5-tab bottom navigation bar. Uses `NavLink` with active state detection. Tabs: Dashboard, Weekly, Daily, History, Settings.

### 11.3 TaskEditorModal (`src/components/ui/TaskEditorModal.jsx`)

Full-featured task create/edit modal (474 lines).

**Fields:**
| Field | Type | Validation |
|-------|------|------------|
| Title | Text input | Required |
| Category | Select (12 options) | Required |
| Date | Date picker | Required |
| Start Time | Time input | Required |
| End Time | Time input | Auto-calculated from start + duration |
| Duration | Number input + presets | 5–720 minutes |
| Priority | Select (Low/Medium/High) | Default: Medium |
| Notes | Textarea | Optional |

**Duration Presets:** 15m, 30m, 45m, 1h, 1.5h, 2h, 3h

**Behavior:**
- Start time change → recalculates end time (keeps duration)
- End time change → recalculates duration
- Duration input change → recalculates end time
- Preset click → sets duration + recalculates end time
- Escape key closes modal
- Backdrop click closes modal
- Body scroll locked while open
- Two-step delete confirmation (click Delete → confirm)
- Day derived from selected date (not manually entered)

### 11.4 SyncStatusBadge (`src/components/ui/SyncStatusBadge.jsx`)

Animated status indicator with 4 states:

| State | Color | Animation | Description |
|-------|-------|-----------|-------------|
| `offline` | Red | None | No network connection |
| `syncing` | Amber | Pulse + spin icon | Actively syncing |
| `synced` | Green | None | All changes saved |
| `pending` | Orange | Pulse | Changes queued, waiting to sync |

Supports `compact` prop (dot only, no label) and `pendingCount` for queue size display.

### 11.5 FocusFAB (`src/components/FocusFAB.jsx`)

Fixed floating action button (bottom-right, above bottom nav). Visible only on `/dashboard`, `/daily-view`, `/weekly-planner`. Indigo/violet gradient, navigates to `/focus`.

### 11.6 WeeklyProgressBar (`src/components/WeeklyProgressBar.jsx`)

Two-part progress visualization:
1. **Main bar:** Overall weekly completion % with animated width transition
2. **Per-day mini bars:** 7 columns (S/M/T/W/T/F/S) each with individual completion bar and count

Today's column highlighted in primary color. Fully complete days use emerald gradient.

### 11.7 OnboardingModal (`src/components/OnboardingModal.jsx`)

First-run modal (shown to unauthenticated, non-onboarded users). Captures user's name, saves to `schedulepro_user` in localStorage, calls `onComplete` callback.

### 11.8 Button (`src/components/ui/Button.jsx`)

Reusable button with variants (default, outline, ghost, destructive), sizes (sm, md, lg), optional icon (left/right position), loading state.

### 11.9 Input (`src/components/ui/Input.jsx`)

Styled input with label, error state, helper text.

### 11.10 Select (`src/components/ui/Select.jsx`)

Styled select dropdown with label and error state.

### 11.11 Checkbox (`src/components/ui/Checkbox.jsx`)

Styled checkbox with label.

---

## 12. Custom Hooks

### 12.1 `useSchedule` (`src/hooks/useSchedule.js`)

The core data hook. Manages all task state with Supabase sync and localStorage fallback.

**Initialization:**
1. Loads tasks from `localStorage` (`schedulepro_tasks`) as initial state
2. Detects current Supabase user via `auth.getSession()`
3. If authenticated: fetches all `schedule_blocks` for the user from Supabase
4. Subscribes to Postgres realtime changes on `schedule_blocks` filtered by `user_id`

**Realtime Events Handled:**
- `INSERT` → appends new task to state (deduplicates by ID)
- `UPDATE` → replaces task in state
- `DELETE` → removes task from state

**CRUD Methods:**
| Method | Behavior |
|--------|----------|
| `addTask(task)` | Inserts to Supabase (realtime handles state) or falls back to local |
| `updateTask(task)` | Updates in Supabase (realtime handles state) or falls back to local |
| `deleteTask(taskId)` | Deletes from Supabase (realtime handles state) or falls back to local |
| `saveTask(task)` | Upserts (insert or update based on ID existence) |
| `toggleCompletion(taskId)` | Flips `isCompleted`, sets/clears `completedAt` |

**Data Mapping:**
- `rowToTask(row)` — converts Supabase snake_case → camelCase task object
- `taskToRow(task, userId)` — converts camelCase task → Supabase snake_case row

**History Snapshots:**
- Auto-snapshot on date change (checked every 60 seconds)
- Snapshot on `visibilitychange` (tab hidden/closed)
- Snapshot on hook unmount
- Snapshots stored in localStorage as `schedulepro_history_YYYY-MM-DD`

**Exports:**
- `useSchedule` (default) — the hook
- `saveHistorySnapshot(tasks, dateKey)` — manual snapshot utility
- `getHistoryForDate(dateKey)` — read snapshot from localStorage
- `getHistoryDates()` — list all snapshot date keys

### 12.2 `useSettings` (`src/hooks/useSettings.js`)

Manages user settings with Supabase persistence.

**Initialization:**
1. Loads from `localStorage` (`schedulepro_settings`) as initial state
2. If authenticated: fetches `user_settings` row from Supabase
3. Merges Supabase data into state + syncs to localStorage

**`updateSettings(updates)`:**
- Merges updates into current settings
- Persists to localStorage immediately
- Upserts to Supabase `user_settings` (conflict on `user_id`)

**Default Settings:**
```js
{
  dayStart: '06:00',
  dayEnd: '23:59',
  scheduleMode: 'flexible',
  timeFormat: '12h',
  theme: 'system'
}
```

**Exports:** `useSettings` (default), `loadSettings()`, `DEFAULT_SETTINGS`

### 12.3 `useDarkMode` (`src/hooks/useDarkMode.js`)

Manages theme state with system preference detection.

**Themes:** `'light'` | `'dark'` | `'system'`

**Behavior:**
- Reads initial theme from `localStorage` (`schedulepro_theme`)
- `applyTheme()` adds/removes `dark` class on `document.documentElement`
- Listens to `prefers-color-scheme` media query changes when theme is `'system'`
- `toggleTheme()` cycles: light → dark → light (system-aware)

**Exports:** `useDarkMode` (default)

### 12.4 `useSyncStatus` (`src/hooks/useSyncStatus.js`)

Derives sync badge state from network status.

**States:** `'offline'` | `'syncing'` | `'synced'`

**Behavior:**
- Goes `'offline'` when `isOnline` is false
- Goes `'syncing'` briefly (2.5s) when coming back online
- Returns to `'synced'` after the syncing window
- `markSyncing()` / `markSynced()` for manual control from async operations

### 12.5 `useOfflineQueue` (`src/hooks/useOfflineQueue.js`)

Manages a persistent queue of pending changes for offline-first writes.

**Queue Storage:** `localStorage` (`schedulepro_offline_queue`)

**States:** `'offline'` | `'syncing'` | `'synced'` | `'pending'`

**Methods:**
| Method | Description |
|--------|-------------|
| `enqueue(operation)` | Adds operation to queue with timestamp |
| `flushQueue(executor)` | Processes queue items with provided async executor |
| `markSynced()` | Manually marks as synced |
| `markSyncing()` | Manually marks as syncing |

**Returned values:** `queue`, `syncStatus`, `lastSynced`, `pendingCount`, `isOnline`

### 12.6 `usePWAInstall` (`src/hooks/usePWAInstall.js`)

Manages the browser's native PWA install prompt.

**Behavior:**
- Listens for `beforeinstallprompt` event → stores deferred prompt
- Listens for `appinstalled` event → marks as installed
- Checks `display-mode: standalone` media query for already-installed state
- `triggerInstall()` → calls `deferredPrompt.prompt()` → awaits user choice

**Returns:** `{ canInstall, triggerInstall, isInstalled }`

### 12.7 `useNetworkStatus` (`src/hooks/useNetworkStatus.js`)

Simple hook wrapping `navigator.onLine` with event listeners.

**Returns:** `{ isOnline: boolean }`

---

## 13. Context Providers

### AuthContext (`src/contexts/AuthContext.jsx`)

See [Section 8](#8-authentication-system) for full details.

**Mount order in `src/index.jsx`:**
```jsx
<AuthProvider>    ← Supabase auth session
  <App />         ← Theme init + onboarding gate
    <Routes />    ← BrowserRouter + all routes
```

**Critical implementation note:** The `onAuthStateChange` callback is kept **synchronous** (Supabase requirement). Profile loading is done via fire-and-forget async calls (`profileOperations.load()`) that are isolated from the auth callback to prevent Supabase's internal deadlock detection.

---

## 14. Library Modules

### 14.1 Supabase Client (`src/lib/supabase.js`)

```js
export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
});
```

Throws at module load time if environment variables are missing. Singleton exported as `supabase`.

### 14.2 Daily Content (`src/lib/dailyContent.js`)

Manages the landing page's daily inspirational content.

**Scripture Library:** 52 curated Bible verses (one per week of year, cycling via `getDayOfYear() / 7 % 52`)

**Content Pipeline:**
```
getDailyContent()
  1. Check localStorage cache for today (schedulepro_daily_YYYY-MM-DD)
  2. If cached → return immediately
  3. Else → fetch in parallel:
     - Scripture: deterministic from built-in array (no network)
     - Quote: api.quotable.io (inspirational tag)
     - Fact: uselessfacts.jsph.pl (today's fact)
     - Background: picsum.photos (seeded by date)
  4. Cache result to localStorage
  5. Return content object

getFallbackContent()
  1. Try most recent cached content from localStorage
  2. Fall back to hardcoded FALLBACK_CONTENT constant
```

**Content Object Shape:**
```ts
{
  quote: string
  quoteAuthor: string
  fact: string
  scripture: string
  scriptureRef: string
  backgroundUrl: string | null
  fetchedAt: string  // ISO timestamp
}
```

---

## 15. Utilities

### `cn` (`src/utils/cn.js`)

```js
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

Combines `clsx` (conditional class names) with `tailwind-merge` (deduplication of conflicting Tailwind classes). Used throughout components for dynamic class composition.

---

## 16. State Management & Data Flow

### Primary State Architecture

SchedulePro uses **React Context + Custom Hooks** as its primary state management pattern. Redux is available as a dependency but is not used for application state.

```
┌─────────────────────────────────────────────────────────┐
│                    AuthContext                          │
│  user, userProfile, loading, auth methods               │
│  (consumed by: Dashboard, Settings, AuthPage, App)      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    useSchedule (hook)                   │
│  tasks[], loading, addTask, updateTask, deleteTask,     │
│  saveTask, toggleCompletion                             │
│  (consumed by: Dashboard, DailyView, WeeklyPlanner,     │
│   FocusMode, HistoryView)                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    useSettings (hook)                   │
│  settings{dayStart,dayEnd,scheduleMode,timeFormat,theme}│
│  updateSettings()                                       │
│  (consumed by: Settings page)                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    useDarkMode (hook)                   │
│  theme, setTheme, isDark, toggleTheme                   │
│  (consumed by: TopAppBar, Settings)                     │
└─────────────────────────────────────────────────────────┘
```

### Data Flow for Task Operations

```
User Action (add/edit/delete/complete)
  ↓
TaskEditorModal / toggle button
  ↓
useSchedule.saveTask() / deleteTask() / toggleCompletion()
  ↓
  ├─ [Online + Authenticated]
  │    ↓
  │  Supabase INSERT/UPDATE/DELETE
  │    ↓
  │  Postgres Realtime → INSERT/UPDATE/DELETE event
  │    ↓
  │  setTasks() ← state updated via realtime
  │    ↓
  │  localStorage sync (useEffect on tasks change)
  │
  └─ [Offline or Guest]
       ↓
     setTasks() ← local state update only
       ↓
     localStorage sync
       ↓
     (queued for sync when online via useOfflineQueue)
```

---

## 17. Offline-First Architecture

### localStorage Keys

| Key | Content | Purpose |
|-----|---------|--------|
| `schedulepro_tasks` | `Task[]` JSON | Current task list cache |
| `schedulepro_settings` | `Settings` JSON | Settings cache |
| `schedulepro_user` | `{ name, onboarded }` | Guest/onboarding user data |
| `schedulepro_theme` | `'light'\|'dark'\|'system'` | Theme preference |
| `schedulepro_history_YYYY-MM-DD` | `Task[]` JSON | Daily history snapshots |
| `schedulepro_daily_YYYY-MM-DD` | `DailyContent` JSON | Landing page content cache |
| `schedulepro_offline_queue` | `Operation[]` JSON | Pending sync operations |
| `schedulepro_guest_mode` | `'true'` | Guest mode flag |

### Offline Behavior by Feature

| Feature | Online | Offline |
|---------|--------|--------|
| Task CRUD | Supabase + realtime | localStorage only |
| Settings | Supabase upsert | localStorage only |
| History | Supabase query | localStorage snapshots |
| Landing content | API fetch + cache | Cached or hardcoded fallback |
| Auth | Supabase required | Session persisted in localStorage |

### History Snapshot Strategy

Snapshots are written to localStorage (and eventually Supabase `schedule_history`) at:
1. **Midnight crossing** — detected by 60-second interval comparing date keys
2. **Tab hidden** — `visibilitychange` event fires when user switches tabs
3. **Hook unmount** — cleanup function of `useSchedule`

---

## 18. Real-Time Sync

### Supabase Realtime Subscriptions

**`useSchedule`** subscribes to `schedule_blocks` changes:
```js
supabase
  .channel(`schedule_blocks_${userId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'schedule_blocks',
    filter: `user_id=eq.${userId}`,
  }, handler)
  .subscribe()
```

**`HistoryView`** subscribes to `schedule_history` changes:
```js
supabase
  .channel(`schedule_history_${userId}`)
  .on('postgres_changes', { event: '*', ... }, handler)
  .subscribe()
```

### Sync Status Flow

```
network offline → useSyncStatus → status: 'offline' → SyncStatusBadge (red)
network online  → useSyncStatus → status: 'syncing' (2.5s) → SyncStatusBadge (amber)
                                → status: 'synced' → SyncStatusBadge (green)
```

---

## 19. PWA Configuration

### Web App Manifest (`public/manifest.json`)

```json
{
  "name": "SchedulePro",
  "short_name": "SchedulePro",
  "description": "Discipline-driven productivity planner",
  "theme_color": "#1e1b4b",
  "background_color": "#0f0e17",
  "display": "standalone",
  "start_url": "/",
  "orientation": "portrait-primary"
}
```

### PWA Icons
- 192×192 (any maskable)
- 512×512 (any maskable)

### Service Worker
Generated by `vite-plugin-pwa` (version 0.21.0). Handles:
- Static asset caching
- Offline fallback
- Background sync (when supported)

### Install Prompt
`usePWAInstall` captures the `beforeinstallprompt` event and defers it. The `TopAppBar` shows an "Install" button when `canInstall` is true. The `/pwa-install-prompt` page provides a full installation guide.

### Apple PWA Meta Tags (`index.html`)
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="SchedulePro" />
```

---

## 20. Dark Mode System

### Implementation
- Tailwind `darkMode: 'class'` strategy
- `dark` class toggled on `document.documentElement`
- Theme stored in `localStorage` (`schedulepro_theme`)
- Three modes: `light`, `dark`, `system`
- System mode listens to `prefers-color-scheme` media query

### Theme Initialization
`App.jsx` calls `initTheme()` synchronously before render to prevent flash of wrong theme:
```js
function initTheme() {
  const theme = localStorage.getItem('schedulepro_theme') || 'light';
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}
```

### CSS Variables
All colors are defined as CSS custom properties in `src/styles/tailwind.css` with light and dark variants. Tailwind's `theme.extend.colors` maps all color tokens to these variables.

---

## 21. Design System & Theming

### Typography
| Font | Variable | Usage |
|------|----------|-------|
| Outfit | `font-heading` | Headings, titles, CTAs |
| Source Sans 3 | `font-body` / `font-sans` | Body text, descriptions |
| Inter | `font-caption` | Labels, captions, badges |
| JetBrains Mono | `font-data` / `font-mono` | Numbers, times, data |

### Color Tokens
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `background` | gray-50 | slate-900 | Page background |
| `foreground` | slate-800 | slate-100 | Primary text |
| `card` | white | slate-800 | Card surfaces |
| `muted` | slate-100 | slate-700 | Subtle backgrounds |
| `primary` | blue-600 | blue-500 | Brand color, CTAs |
| `accent` | violet-700 | violet-500 | Secondary accent |
| `success` | emerald-600 | emerald-500 | Completion states |
| `warning` | amber-600 | amber-500 | Time warnings |
| `destructive` | red-600 | red-500 | Delete actions |

### Category Colors
| Category | Color Token | Hex |
|----------|-------------|-----|
| work | `--color-work` | blue-600 |
| health | `--color-health` | emerald-600 |
| learning/languages | `--color-learning` | violet-700 |
| faith/spirituality | `--color-faith` | amber-600 |
| family | `--color-family` | pink-500 |
| social | `--color-social` | sky-500 |
| creative/literature | `--color-creative` | orange-500 |
| finance | `--color-finance` | teal-500 |
| personal | `--color-personal` | violet-500 |

### Spacing & Sizing
| Token | Value | Usage |
|-------|-------|-------|
| `h-top-bar` | 64px | TopAppBar height |
| `h-bottom-nav` | 64px | BottomTabNavigation height |
| `h-btn` | 48px | Standard button height |
| `h-input` | 44px | Standard input height |
| `min-h-touch` | 44px | Minimum touch target |

### Border Radius
| Token | Value |
|-------|-------|
| `sm` | 6px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 20px |
| DEFAULT | 12px |

### Shadows
Two shadow scales: `theme-sm/md/lg/xl` (light mode) and `dark-sm/md/lg/xl` (dark mode).

### Animations
| Name | Duration | Usage |
|------|----------|-------|
| `skeleton-pulse` | 1.5s | Loading skeleton shimmer |
| `modal-enter` | 250ms | Modal open animation |
| `time-pulse` | 2s | Current time indicator pulse |
| `fade-in` | 250ms | General fade-in |

### Z-Index Scale
| Token | Value | Usage |
|-------|-------|-------|
| `base` | 0 | Default |
| `card` | 1 | Cards |
| `bottom-nav` | 30 | Bottom navigation |
| `sticky` | 40 | Sticky headers |
| `modal-backdrop` | 45 | Modal backdrop |
| `modal` | 50 | Modals |
| `toast` | 300 | Toast notifications |

---

## 22. Task Data Model

### Frontend (camelCase)
```ts
interface Task {
  id: string;              // UUID
  title: string;           // Task name
  category: string;        // Category key
  day: string;             // Day name ("Monday", etc.)
  dayOfWeek: number;       // 0–6 (Sunday = 0)
  startTime: string;       // "HH:MM"
  endTime: string;         // "HH:MM"
  duration: number;        // Minutes
  mode: string;            // "flexible" | "strict"
  notes: string;           // Optional notes
  isCompleted: boolean;    // Completion flag
  completedAt: string | null;  // ISO timestamp
  priority: string;        // "low" | "medium" | "high"
  userId: string;          // Supabase user ID
}
```

### Database (snake_case) → see `schedule_blocks` table in Section 9

### Categories
`work`, `coding`, `spirituality`, `health`, `languages`, `literature`, `leadership`, `meals`, `chores`, `leisure`, `family`, `social`

### Priority Levels
`low`, `medium` (default), `high`

### Schedule Modes
`flexible` — tasks can be moved/adjusted freely  
`strict` — tasks are fixed to their time slots

---

## 23. Settings Data Model

```ts
interface Settings {
  dayStart: string;        // "HH:MM" — default "06:00"
  dayEnd: string;          // "HH:MM" — default "23:59"
  scheduleMode: string;    // "flexible" | "structured"
  timeFormat: string;      // "12h" | "24h"
  theme: string;           // "light" | "dark" | "system"
}
```

---

## 24. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous/public key |
| `VITE_OPENAI_API_KEY` | ⬜ Optional | OpenAI API (not currently used) |
| `VITE_GEMINI_API_KEY` | ⬜ Optional | Gemini API (not currently used) |
| `VITE_ANTHROPIC_API_KEY` | ⬜ Optional | Anthropic API (not currently used) |
| `VITE_GA_MEASUREMENT_ID` | ⬜ Optional | Google Analytics (not currently used) |
| `VITE_ADSENSE_ID` | ⬜ Optional | Google AdSense (not currently used) |
| `VITE_PERPLEXITY_API_KEY` | ⬜ Optional | Perplexity API (not currently used) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ⬜ Optional | Stripe (not currently used) |

**Note:** All variables must be prefixed with `VITE_` to be accessible in the browser via `import.meta.env.VITE_*`. The Supabase client throws an error at startup if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing.

---

## 25. Build & Deployment

### Scripts
```bash
npm run start    # vite — development server
npm run build    # vite build --sourcemap — production build
npm run serve    # vite preview — preview production build
```

### Build Output
- Output directory: `dist/`
- Source maps included (`--sourcemap`)
- PWA service worker generated by `vite-plugin-pwa`

### Deployment
- **Platform:** Rocket.new (builtwithrocket.new)
- **Live URL:** https://schedulepr6726.builtwithrocket.new
- **SPA Redirect:** `public/_redirects` contains `/* /index.html 200` for client-side routing support
- **Robots:** `public/robots.txt` — standard crawl rules

### Browser Targets
```json
"production": [">0.2%", "not dead", "not op_mini all"]
"development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
```

### Path Aliases
`jsconfig.json` configures `src/` as the base for absolute imports:
- `components/...` → `src/components/...`
- `pages/...` → `src/pages/...`
- `hooks/...` → `src/hooks/...`
- `lib/...` → `src/lib/...`
- `contexts/...` → `src/contexts/...`
- `utils/...` → `src/utils/...`

---

## 26. Known Limitations & Future Work

### Current Limitations

| Area | Limitation |
|------|------------|
| History snapshots | Written to localStorage only; Supabase `schedule_history` table exists but auto-population from `useSchedule` is not yet wired |
| Recurrence | `recurrence_type` and `recurrence_days` columns exist in DB but recurring tasks are not implemented in the UI |
| Offline queue | `useOfflineQueue` is implemented but not yet wired to `useSchedule` CRUD operations |
| AI integrations | API keys for OpenAI, Gemini, Anthropic, Perplexity are in `.env` but no AI features are implemented |
| Analytics | `VITE_GA_MEASUREMENT_ID` is in `.env` but Google Analytics is not integrated |
| Payments | `VITE_STRIPE_PUBLISHABLE_KEY` is in `.env` but Stripe is not integrated |
| Delete Account | Currently signs out + clears localStorage; the `delete_user_account` RPC function is called but may not exist in the DB |
| Settings page duplicate | Both `src/pages/settings/` and `src/pages/settings-page/` exist; both routes point to `src/pages/settings/` |
| Task editor modal page | `src/pages/task-editor-modal/` exists as a standalone page but is not routed |

### Recommended Future Work

1. **Wire offline queue to CRUD** — when `useSchedule` writes fail (offline), enqueue via `useOfflineQueue` and flush on reconnect
2. **Populate `schedule_history` from Supabase** — write snapshots to the DB table, not just localStorage
3. **Recurring tasks** — implement UI for `recurrence_type` / `recurrence_days` fields
4. **Push notifications** — remind users of upcoming tasks via Web Push API
5. **AI scheduling assistant** — use OpenAI/Gemini to suggest optimal task scheduling
6. **Analytics integration** — connect Google Analytics for usage tracking
7. **Subscription/monetization** — implement Stripe for premium tier
8. **Social sharing** — share daily schedule or completion stats
9. **Export** — export schedule to PDF, iCal, or CSV
10. **Drag-to-create** — click and drag on the timeline to create a new task
11. **Conflict detection** — warn when tasks overlap in time
12. **Delete Account RPC** — implement `delete_user_account` Postgres function to fully cascade-delete user data

---

*This document represents a complete due diligence analysis of the SchedulePro codebase as of March 2026. Every file, component, hook, utility, database table, and configuration has been inspected and documented above.*
