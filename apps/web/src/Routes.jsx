import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';
import Settings from './pages/settings';
import Dashboard from './pages/dashboard';
import DailyView from './pages/daily-view';
import WeeklyPlanner from './pages/weekly-planner';
import OnlineLandingPage from './pages/online-landing-page';
import HistoryView from './pages/history-view';
import OnboardingWelcome from './pages/onboarding-welcome';
import PWAInstallPrompt from './pages/pwa-install-prompt';
import FocusModePage from './pages/focus-mode';
import FocusFAB from './components/FocusFAB';
import AuthPage from './pages/auth-page';
import PerformancePage from './pages/performance';
import { useAuth } from '@schedulepro/shared/src/contexts/AuthContext';
import { ScheduleProvider } from '@schedulepro/shared/src/contexts/ScheduleContext';

// Protects app routes: redirects to /auth-page if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth-page" replace />;
  return children;
};

// Auth route: if already logged in, skip auth page and go straight to dashboard
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// Wraps all protected routes in a single shared ScheduleProvider
const ProtectedScheduleRoute = ({ children }) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <ScheduleProvider>
          <RouterRoutes>
            {/* Landing page always shows first */}
            <Route path="/" element={<OnlineLandingPage />} />
            <Route path="/online-landing-page" element={<OnlineLandingPage />} />

            {/* Auth page: skip to dashboard if already logged in */}
            <Route path="/auth-page" element={<AuthRoute><AuthPage /></AuthRoute>} />

            {/* Protected app routes — all share one ScheduleProvider instance */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/daily-view" element={<ProtectedRoute><DailyView /></ProtectedRoute>} />
            <Route path="/weekly-planner" element={<ProtectedRoute><WeeklyPlanner /></ProtectedRoute>} />
            <Route path="/history-view" element={<ProtectedRoute><HistoryView /></ProtectedRoute>} />
            <Route path="/focus" element={<ProtectedRoute><FocusModePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings-page" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />

            {/* Other routes */}
            <Route path="/onboarding-welcome" element={<OnboardingWelcome />} />
            <Route path="/pwa-install-prompt" element={<PWAInstallPrompt />} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
          <FocusFAB />
        </ScheduleProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
