import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@schedulepro/shared/src/lib/supabase';
import { safeLocalStorage, safeWindow, safeDocument, isWeb } from '../lib/platform';

const SETTINGS_KEY = 'schedulepro_settings';

const DEFAULT_SETTINGS = {
  dayStart: '06:00',
  dayEnd: '23:59',
  scheduleMode: 'flexible',
  timeFormat: '12h',
  theme: 'system',
  homeMode: false,
  textSize: 1,
};

export function loadSettings() {
  try {
    const raw = safeLocalStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

// Apply home mode class to body immediately
function applyHomeMode(enabled) {
  if (enabled) {
    document.body?.classList?.add('home-mode');
  } else {
    document.body?.classList?.remove('home-mode');
  }
}

// Apply text size scale immediately
function applyTextSize(size) {
  if (size) {
    document.documentElement?.style?.setProperty('--text-size-scale', String(size));
  }
}

// Convert Supabase row → settings object
function rowToSettings(row) {
  return {
    dayStart: row?.day_start_time || DEFAULT_SETTINGS?.dayStart,
    dayEnd: row?.day_end_time || DEFAULT_SETTINGS?.dayEnd,
    scheduleMode: row?.schedule_mode || DEFAULT_SETTINGS?.scheduleMode,
    timeFormat: row?.time_format || DEFAULT_SETTINGS?.timeFormat,
    theme: row?.theme || DEFAULT_SETTINGS?.theme,
    homeMode: row?.home_mode || false,
    textSize: row?.text_size || 1,
  };
}

// Convert settings object → Supabase row
function settingsToRow(settings, userId) {
  return {
    user_id: userId,
    day_start_time: settings?.dayStart,
    day_end_time: settings?.dayEnd,
    schedule_mode: settings?.scheduleMode,
    time_format: settings?.timeFormat,
    theme: settings?.theme,
    home_mode: settings?.homeMode || false,
    text_size: settings?.textSize || 1,
    updated_at: new Date()?.toISOString(),
  };
}

const useSettings = () => {
  const [settings, setSettingsState] = useState(() => {
    const loaded = loadSettings();
    // Apply immediately on first render
    applyHomeMode(loaded?.homeMode);
    applyTextSize(loaded?.textSize);
    return loaded;
  });
  const [userId, setUserId] = useState(null);
  const [synced, setSynced] = useState(false);

  // Get current user
  useEffect(() => {
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  // Fetch settings from Supabase when user is available
  useEffect(() => {
    if (!userId) return;
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          ?.from('user_settings')
          ?.select('*')
          ?.eq('user_id', userId)
          ?.single();
        if (!error && data) {
          const loaded = rowToSettings(data);
          setSettingsState(loaded);
          applyHomeMode(loaded?.homeMode);
          applyTextSize(loaded?.textSize);
          try { safeLocalStorage.setItem(SETTINGS_KEY, JSON.stringify(loaded)); } catch {}
          setSynced(true);
        }
      } catch {}
    };
    fetchSettings();
  }, [userId]);

  // Persist to localStorage and apply side-effects whenever settings change
  useEffect(() => {
    try {
      safeLocalStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
    applyHomeMode(settings?.homeMode);
    applyTextSize(settings?.textSize);
  }, [settings]);

  // Listen for storage changes from other tabs/instances
  useEffect(() => {
    const handleStorage = (e) => {
      if (e?.key === SETTINGS_KEY && e?.newValue) {
        try {
          const parsed = JSON.parse(e?.newValue);
          const merged = { ...DEFAULT_SETTINGS, ...parsed };
          setSettingsState(merged);
          applyHomeMode(merged?.homeMode);
          applyTextSize(merged?.textSize);
        } catch {}
      }
    };
    safeWindow.addEventListener('storage', handleStorage);
    return () => safeWindow.removeEventListener('storage', handleStorage);
  }, []);

  const updateSettings = useCallback(async (updates) => {
    const newSettings = { ...settings, ...updates };
    setSettingsState(newSettings);
    // Apply immediately
    if ('homeMode' in updates) applyHomeMode(updates?.homeMode);
    if ('textSize' in updates) applyTextSize(updates?.textSize);
    if (userId) {
      try {
        await supabase
          ?.from('user_settings')
          ?.upsert(settingsToRow(newSettings, userId), { onConflict: 'user_id' });
      } catch {}
    }
  }, [settings, userId]);

  return { settings, updateSettings, synced };
};

export { DEFAULT_SETTINGS };
export default useSettings;
