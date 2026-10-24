# SchedulePro

SchedulePro is a cross-platform scheduling and productivity monorepo: a web dashboard and an Expo mobile app, sharing one core package.

Live (web): **[schedulepro-web.vercel.app](https://schedulepro-web.vercel.app)**

## 📄 Product Requirements Document (PRD)

### 1. Project Overview
SchedulePro aims to solve the problem of fragmented productivity tools by providing a unified environment for daily and weekly planning, focus sessions, and performance tracking.

### 2. Core Features
- **User Authentication**: Secure login and onboarding through Supabase.
- **Unified Dashboard**: At-a-glance view of tasks, progress, and upcoming events.
- **Flexible Views**: Toggle between high-level Weekly Planners and granular Daily Views.
- **Focus Mode**: Dedicated interface for deep work sessions to minimize distractions.
- **Performance Analytics**: Visualized history and performance metrics to identify productivity patterns.
- **Cross-Platform Sync**: Real-time synchronization between Web and Mobile applications via `@schedulepro/shared`.
- **Offline Capability**: PWA support for web and local storage for mobile.

### 3. User Flows
1. **Onboarding**: User creates an account, completes the welcome flow, and sets up initial preferences.
2. **Planning**: User schedules tasks in the Weekly Planner; these automatically populate the Daily View.
3. **Execution**: User initiates "Focus Mode" for a specific task.
4. **Review**: User checks the History and Performance screens to analyze completed work.

---

## 🛠 Technology Stack

### Monorepo Infrastructure
- **Manager**: NPM Workspaces
- **Shared Core**: `@schedulepro/shared` (Common logic, types, and utilities)

### 💻 Web Application (`apps/web`)
- **Framework**: [Vite](https://vitejs.dev/) + [React](https://reactjs.org/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Backend/Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **Visuals**: [Recharts](https://recharts.org/) (Data Viz), [Framer Motion](https://www.framer.com/motion/) (Animations)
- **Utilities**: `date-fns`, `lucide-react`

### 📱 Mobile Application (`apps/mobile`)
- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Navigation**: [React Navigation](https://reactnavigation.org/)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind for React Native)
- **Local Storage**: `@react-native-async-storage/async-storage`
- **Icons**: `lucide-react-native`

---

## 🚀 Deployment

### Web Deployment (Vercel)
The web application is optimized for deployment on [Vercel](https://vercel.com/).

**Configuration details:**
- **Framework Preset**: Vite
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build` (Executed from the root or via Vercel's monorepo detection)
- **Output Directory**: `dist`
- **Environment Variables**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (your Supabase project URL and public anon key).

### Mobile Deployment (EAS)
Use Expo Application Services (EAS) for builds and distribution.
```bash
cd apps/mobile
eas build --platform ios
# or
eas build --platform android
```

---

## 🔨 Development Setup

1. **Clone and Install**:
   ```bash
   git clone https://github.com/ken-muritu/schedulepro.git
   cd schedulepro
   npm install
   ```
2. **Run Web**:
   ```bash
   npm run start --workspace=@schedulepro/web
   ```
3. **Run Mobile**:
   ```bash
   npm run start --workspace=@schedulepro/mobile
   ```

## Environment variables

| App | Variables |
|---|---|
| Web (`apps/web`) and shared core | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Mobile (`apps/mobile`) | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` |

Database schema, storage bucket and row-level-security policies are in `apps/web/supabase/migrations/`.

## Licence

Copyright © 2026 Kennedy Muritu. All rights reserved. The code is public to read, not to reuse. See [LICENSE](LICENSE).
