import React, { useState, useEffect } from 'react';
import Routes from './Routes';
import OnboardingModal from './components/OnboardingModal';
import { useAuth } from '@schedulepro/shared/src/contexts/AuthContext';

function initTheme() {
  try {
    const theme = localStorage.getItem('schedulepro_theme') || 'light';
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches);
    if (isDark) document.documentElement?.classList?.add('dark');
    else document.documentElement?.classList?.remove('dark');
  } catch {}
}

function AppInner() {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    initTheme();
    try {
      const stored = localStorage.getItem('schedulepro_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.onboarded && parsed?.name) {
          setUserData(parsed);
        }
      }
    } catch {
      // ignore
    }
    setChecked(true);
  }, []);

  const handleOnboardingComplete = (data) => {
    setUserData(data);
  };

  if (!checked || authLoading) return null;

  // Don't show onboarding if user is authenticated
  const showOnboarding = !userData && !user;

  return (
    <>
      <Routes />
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
    </>
  );
}

function App() {
  return <AppInner />;
}

export default App;
