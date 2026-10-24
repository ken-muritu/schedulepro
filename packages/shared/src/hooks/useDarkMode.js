import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'schedulepro_theme';

function getSystemPreference() {
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const isDark = theme === 'dark' || (theme === 'system' && getSystemPreference() === 'dark');
  if (isDark) {
    document.documentElement?.classList?.add('dark');
  } else {
    document.documentElement?.classList?.remove('dark');
  }
}

const useDarkMode = () => {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'light';
    } catch {
      return 'light';
    }
  });

  const isDark = theme === 'dark' || (theme === 'system' && getSystemPreference() === 'dark');

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  // Listen to system preference changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const handler = () => applyTheme('system');
    mq?.addEventListener?.('change', handler);
    return () => mq?.removeEventListener?.('change', handler);
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'system') {
        const sys = getSystemPreference();
        return sys === 'dark' ? 'light' : 'dark';
      }
      return 'dark';
    });
  }, []);

  return { theme, setTheme, isDark, toggleTheme };
};

export default useDarkMode;
