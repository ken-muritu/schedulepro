import React, { useState, useEffect } from "react";
import TopAppBar from '../../components/ui/TopAppBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import useDarkMode from '@schedulepro/shared/src/hooks/useDarkMode';
import useSettings from '@schedulepro/shared/src/hooks/useSettings';
import { useAuth } from '@schedulepro/shared/src/contexts/AuthContext';
import TaskEditorModal from '../../components/ui/TaskEditorModal';
import useSchedule from '@schedulepro/shared/src/hooks/useSchedule';

const CATEGORIES = [
  { key: "work", label: "Work", colorVar: "var(--color-work)" },
  { key: "languages", label: "Languages", colorVar: "var(--color-learning)" },
  { key: "literature", label: "Literature", colorVar: "var(--color-creative)" },
  { key: "coding", label: "Coding", colorVar: "var(--color-health)" },
  { key: "leadership", label: "Leadership", colorVar: "var(--color-accent)" },
  { key: "spirituality", label: "Spirituality", colorVar: "var(--color-personal)" },
  { key: "chores", label: "Chores", colorVar: "var(--color-destructive)" },
  { key: "meals", label: "Meals", colorVar: "var(--color-warning)" },
  { key: "leisure", label: "Leisure", colorVar: "var(--color-secondary)" },
];

export default function Settings() {
  const { user, userProfile, updateProfile, updateEmail, updatePassword, deleteAccount, signOut } = useAuth();
  const { settings, updateSettings, synced } = useSettings();
  const { theme, setTheme } = useDarkMode();
  const { saveTask, deleteTask } = useSchedule();
  const [addModalOpen, setAddModalOpen] = useState(false);

  // ── Schedule settings state ──────────────────────────────────────────────
  const [scheduleMode, setScheduleMode] = useState(settings?.scheduleMode || 'flexible');
  const [timeFormat, setTimeFormat] = useState(settings?.timeFormat || '12h');
  const [dayStart, setDayStart] = useState(settings?.dayStart || '06:00');
  const [dayEnd, setDayEnd] = useState(settings?.dayEnd || '23:59');
  const [homeMode, setHomeMode] = useState(settings?.homeMode || false);
  const [textSize, setTextSize] = useState(settings?.textSize || 1);
  const [dayBoundaryError, setDayBoundaryError] = useState('');
  const [dayBoundarySaved, setDayBoundarySaved] = useState(false);
  const [scheduleModeSaved, setScheduleModeSaved] = useState(false);
  const [timeFormatSaved, setTimeFormatSaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  // ── Edit Profile state ───────────────────────────────────────────────────
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { type: 'success'|'error', text }

  // ── Password change state ────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  // ── Delete Account state ─────────────────────────────────────────────────
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Sync local state when settings load from Supabase
  useEffect(() => {
    if (synced) {
      setScheduleMode(settings?.scheduleMode || 'flexible');
      setTimeFormat(settings?.timeFormat || '12h');
      setDayStart(settings?.dayStart || '06:00');
      setDayEnd(settings?.dayEnd || '23:59');
      setHomeMode(settings?.homeMode || false);
      setTextSize(settings?.textSize || 1);
    }
  }, [synced]);

  // Populate profile fields from auth context
  useEffect(() => {
    setProfileName(userProfile?.name || user?.email?.split('@')?.[0] || '');
    setProfileEmail(user?.email || '');
  }, [userProfile, user]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleDayBoundarySave = async () => {
    const startMins = parseInt(dayStart?.split(':')?.[0]) * 60 + parseInt(dayStart?.split(':')?.[1]);
    const endMins = parseInt(dayEnd?.split(':')?.[0]) * 60 + parseInt(dayEnd?.split(':')?.[1]);
    if (endMins <= startMins) {
      setDayBoundaryError('Day end must be after day start');
      return;
    }
    setDayBoundaryError('');
    await updateSettings({ dayStart, dayEnd });
    setDayBoundarySaved(true);
    setTimeout(() => setDayBoundarySaved(false), 2000);
  };

  const handleScheduleModeSave = async (mode) => {
    setScheduleMode(mode);
    await updateSettings({ scheduleMode: mode });
    setScheduleModeSaved(true);
    setTimeout(() => setScheduleModeSaved(false), 2000);
  };

  const handleTimeFormatSave = async (format) => {
    setTimeFormat(format);
    await updateSettings({ timeFormat: format });
    setTimeFormatSaved(true);
    setTimeout(() => setTimeFormatSaved(false), 2000);
  };

  const handleThemeChange = async (value) => {
    setTheme(value);
    await updateSettings({ theme: value });
  };

  const handleReset = () => {
    if (!resetConfirm) { setResetConfirm(true); return; }
    try {
      localStorage.removeItem('schedulepro_tasks');
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key?.startsWith('schedulepro_history_')) keysToRemove?.push(key);
      }
      keysToRemove?.forEach(k => localStorage.removeItem(k));
    } catch {}
    setResetDone(true);
    setResetConfirm(false);
    setTimeout(() => { setResetDone(false); window.location?.reload(); }, 2000);
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      // Update display name in profiles table
      const { error: nameError } = await updateProfile({ name: profileName?.trim() });
      if (nameError) {
        setProfileMsg({ type: 'error', text: nameError?.message || 'Failed to update name.' });
        setProfileSaving(false);
        return;
      }
      // Update email if changed
      if (profileEmail?.trim() !== user?.email) {
        const { error: emailError } = await updateEmail(profileEmail?.trim());
        if (emailError) {
          setProfileMsg({ type: 'error', text: emailError?.message || 'Failed to update email.' });
          setProfileSaving(false);
          return;
        }
        setProfileMsg({ type: 'success', text: 'Profile updated! Check your new email for a confirmation link.' });
      } else {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg(null), 4000);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword?.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setPasswordMsg({ type: 'error', text: error?.message || 'Failed to update password.' });
      } else {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setPasswordSaving(false);
      setTimeout(() => setPasswordMsg(null), 4000);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Type DELETE to confirm.');
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      // Sign out and clear local data
      localStorage.clear();
      await signOut();
      window.location.href = '/auth-page';
    } catch {
      setDeleteError('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  const handleHomeModeToggle = async () => {
    const newVal = !homeMode;
    setHomeMode(newVal);
    await updateSettings({ homeMode: newVal });
  };

  const handleTextSizeChange = async (size) => {
    setTextSize(size);
    // Apply immediately so the change is visible right away
    document.documentElement?.style?.setProperty('--text-size-scale', String(size));
    await updateSettings({ textSize: size });
  };

  const THEME_OPTIONS = [
    { value: 'light', label: 'Light', icon: 'Sun' },
    { value: 'system', label: 'System', icon: 'Monitor' },
    { value: 'dark', label: 'Dark', icon: 'Moon' },
  ];

  const userName = userProfile?.name || user?.email?.split('@')?.[0] || 'Not set';
  const userInitial = userName?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <TopAppBar currentMode={scheduleMode} onModeToggle={setScheduleMode} onAddTask={() => setAddModalOpen(true)} />
      <main className="content-area px-4 md:px-6 lg:px-8 max-w-2xl mx-auto">
        <div className="pt-6 pb-4">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-foreground)]">Settings</h1>
          <p className="font-body text-sm text-[var(--color-muted-foreground)] mt-1">Customize your SchedulePro experience</p>
        </div>

        <div className="flex flex-col gap-4 md:gap-5">

          {/* ── Home Mode ─────────────────────────────────────────────── */}
          <div className="card p-4 md:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-family)]/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Home" size={18} color="var(--color-family)" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)]">Home Mode</h2>
                <p className="font-body text-sm text-[var(--color-muted-foreground)]">Adds playful bounce, glow &amp; fade animations to text and buttons throughout the app. Switches to a cozy Nunito font.</p>
              </div>
            </div>
            <div
              onClick={handleHomeModeToggle}
              className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-smooth ${
                homeMode
                  ? 'border-[var(--color-family)] bg-[var(--color-family)]/5'
                  : 'border-[var(--color-border)] hover:border-[var(--color-family)]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xl ${homeMode ? 'animate-home-bounce' : ''}`}>🏠</span>
                <div>
                  <p className={`font-caption text-sm font-semibold ${
                    homeMode ? 'text-[var(--color-family)]' : 'text-[var(--color-foreground)]'
                  }`}>
                    {homeMode ? 'Home Mode is ON ✨' : 'Enable Home Mode'}
                  </p>
                  <p className="font-body text-xs text-[var(--color-muted-foreground)]">
                    {homeMode ? 'Buttons and text are animated with cute effects' : 'Tap to enable cute animations'}
                  </p>
                </div>
              </div>
              <div className={`relative w-12 h-6 rounded-full transition-smooth ${
                homeMode ? 'bg-[var(--color-family)]' : 'bg-[var(--color-border)]'
              }`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                  homeMode ? 'left-7' : 'left-1'
                }`} />
              </div>
            </div>
            {homeMode && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-family)]/10 text-[var(--color-family)] font-caption text-xs font-medium animate-home-wiggle">✨ Animated</span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-caption text-xs font-medium animate-home-bounce" style={{ animationDelay: '150ms' }}>🎀 Playful</span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] font-caption text-xs font-medium animate-home-fade" style={{ animationDelay: '300ms' }}>🌸 Cute</span>
              </div>
            )}
          </div>

          {/* ── Text Size ─────────────────────────────────────────────── */}
          <div className="card p-4 md:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Type" size={18} color="var(--color-primary)" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)]">Text Size</h2>
                <p className="font-body text-sm text-[var(--color-muted-foreground)]">Adjust the app-wide text size for comfort</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-caption text-xs text-[var(--color-muted-foreground)]">A</span>
                <input
                  type="range"
                  min="0.85"
                  max="1.3"
                  step="0.05"
                  value={textSize}
                  onChange={(e) => handleTextSizeChange(parseFloat(e?.target?.value))}
                  className="flex-1 h-2 rounded-full accent-[var(--color-primary)] cursor-pointer"
                />
                <span className="font-caption text-base font-semibold text-[var(--color-muted-foreground)]">A</span>
              </div>
              <div className="flex justify-between gap-2">
                {[{ label: 'Small', value: 0.85 }, { label: 'Normal', value: 1 }, { label: 'Large', value: 1.15 }, { label: 'XL', value: 1.3 }]?.map((opt) => (
                  <button
                    key={opt?.value}
                    onClick={() => handleTextSizeChange(opt?.value)}
                    className={`flex-1 py-1.5 rounded-lg font-caption text-xs font-medium transition-smooth border ${
                      Math.abs(textSize - opt?.value) < 0.03
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    {opt?.label}
                  </button>
                ))}
              </div>
              <p className="font-body text-sm text-[var(--color-foreground)] p-2 rounded-lg bg-[var(--color-muted)] text-center">
                Preview: The quick brown fox jumps over the lazy dog.
              </p>
            </div>
          </div>

          {/* ── Edit Profile ─────────────────────────────────────────────── */}
          <div className="card p-4 md:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                <Icon name="UserCog" size={18} color="var(--color-primary)" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)]">Edit Profile</h2>
                <p className="font-body text-sm text-[var(--color-muted-foreground)]">Update your display name and email address</p>
              </div>
            </div>

            {/* Avatar + current info */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-[var(--color-muted)]">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0">
                <span className="font-heading text-base font-bold text-[var(--color-primary)]">{userInitial}</span>
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-[var(--color-foreground)]">{userName}</p>
                {user?.email && (
                  <p className="font-caption text-xs text-[var(--color-muted-foreground)]">{user?.email}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-caption text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Display Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e?.target?.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] font-body text-sm text-[var(--color-foreground)] bg-[var(--color-muted)] outline-none transition-smooth focus:border-[var(--color-primary)] focus:ring-2"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-caption text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e?.target?.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] font-body text-sm text-[var(--color-foreground)] bg-[var(--color-muted)] outline-none transition-smooth focus:border-[var(--color-primary)] focus:ring-2"
                />
              </div>

              {profileMsg && (
                <p className={`font-caption text-xs flex items-center gap-1 ${
                  profileMsg?.type === 'success' ? 'text-[var(--color-success)]' : 'text-[var(--color-destructive)]'
                }`}>
                  <Icon name={profileMsg?.type === 'success' ? 'CheckCircle' : 'AlertCircle'} size={12} color="currentColor" />
                  {profileMsg?.text}
                </p>
              )}

              <Button
                variant="default"
                size="sm"
                onClick={handleProfileSave}
                disabled={profileSaving}
                iconName={profileSaving ? 'Loader' : 'Save'}
                iconPosition="left"
                iconSize={13}
              >
                {profileSaving ? 'Saving…' : 'Save Profile'}
              </Button>
            </div>
          </div>

          {/* ── Change Password ───────────────────────────────────────────── */}
          <div className="card p-4 md:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-warning)]/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Lock" size={18} color="var(--color-warning)" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)]">Change Password</h2>
                <p className="font-body text-sm text-[var(--color-muted-foreground)]">Set a new password for your account</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-caption text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e?.target?.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-[var(--color-border)] font-body text-sm text-[var(--color-foreground)] bg-[var(--color-muted)] outline-none transition-smooth focus:border-[var(--color-warning)] focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  >
                    <Icon name={showNewPw ? 'EyeOff' : 'Eye'} size={15} color="currentColor" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-caption text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e?.target?.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-[var(--color-border)] font-body text-sm text-[var(--color-foreground)] bg-[var(--color-muted)] outline-none transition-smooth focus:border-[var(--color-warning)] focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  >
                    <Icon name={showConfirmPw ? 'EyeOff' : 'Eye'} size={15} color="currentColor" />
                  </button>
                </div>
              </div>

              {passwordMsg && (
                <p className={`font-caption text-xs flex items-center gap-1 ${
                  passwordMsg?.type === 'success' ? 'text-[var(--color-success)]' : 'text-[var(--color-destructive)]'
                }`}>
                  <Icon name={passwordMsg?.type === 'success' ? 'CheckCircle' : 'AlertCircle'} size={12} color="currentColor" />
                  {passwordMsg?.text}
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handlePasswordChange}
                disabled={passwordSaving || !newPassword || !confirmPassword}
                iconName={passwordSaving ? 'Loader' : 'KeyRound'}
                iconPosition="left"
                iconSize={13}
              >
                {passwordSaving ? 'Updating…' : 'Update Password'}
              </Button>
            </div>
          </div>

          {/* ── Theme ────────────────────────────────────────────────────── */}
          <div className="card p-4 md:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Palette" size={18} color="var(--color-accent)" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)]">Theme</h2>
                <p className="font-body text-sm text-[var(--color-muted-foreground)]">Choose your preferred appearance — synced to your account</p>
              </div>
            </div>
            <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
              {THEME_OPTIONS?.map((opt) => (
                <button
                  key={opt?.value}
                  onClick={() => handleThemeChange(opt?.value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 font-caption text-sm font-medium transition-smooth ${
                    theme === opt?.value
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                  }`}
                >
                  <Icon name={opt?.icon} size={15} color="currentColor" />
                  <span className="hidden sm:inline">{opt?.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Day Boundaries ───────────────────────────────────────────── */}
          <div className="card p-4 md:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-warning)]/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Sunrise" size={18} color="var(--color-warning)" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)]">Day Boundaries</h2>
                <p className="font-body text-sm text-[var(--color-muted-foreground)]">Set when your day starts and ends — synced to your account</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-caption text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Day Starts</label>
                <input
                  type="time"
                  value={dayStart}
                  onChange={(e) => { setDayStart(e?.target?.value); setDayBoundaryError(''); }}
                  className="w-full px-3 py-2 rounded-lg border font-data text-sm text-[var(--color-foreground)] bg-[var(--color-muted)] outline-none transition-smooth focus:border-[var(--color-primary)] focus:ring-2"
                  style={{ borderColor: dayBoundaryError ? 'var(--color-destructive)' : 'var(--color-border)' }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-caption text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Day Ends</label>
                <input
                  type="time"
                  value={dayEnd}
                  onChange={(e) => { setDayEnd(e?.target?.value); setDayBoundaryError(''); }}
                  className="w-full px-3 py-2 rounded-lg border font-data text-sm text-[var(--color-foreground)] bg-[var(--color-muted)] outline-none transition-smooth focus:border-[var(--color-primary)] focus:ring-2"
                  style={{ borderColor: dayBoundaryError ? 'var(--color-destructive)' : 'var(--color-border)' }}
                />
              </div>
            </div>
            {dayBoundaryError && (
              <p className="font-caption text-xs text-[var(--color-destructive)] flex items-center gap-1 mb-2">
                <Icon name="AlertCircle" size={12} color="var(--color-destructive)" />
                {dayBoundaryError}
              </p>
            )}
            {dayBoundarySaved && (
              <p className="font-caption text-xs text-[var(--color-success)] flex items-center gap-1 mb-2">
                <Icon name="CheckCircle" size={12} color="var(--color-success)" />
                Day boundaries saved to your account!
              </p>
            )}
            <Button variant="default" size="sm" onClick={handleDayBoundarySave} iconName="Save" iconPosition="left" iconSize={13}>Save Boundaries</Button>
          </div>

          {/* ── Schedule Mode ─────────────────────────────────────────────── */}
          <div className="card p-4 md:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                <Icon name="LayoutGrid" size={18} color="var(--color-primary)" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)]">Schedule Mode</h2>
                <p className="font-body text-sm text-[var(--color-muted-foreground)]">Choose how strictly your schedule is enforced — synced to your account</p>
              </div>
            </div>
            {scheduleModeSaved && (
              <p className="font-caption text-xs text-[var(--color-success)] flex items-center gap-1 mb-3">
                <Icon name="CheckCircle" size={12} color="var(--color-success)" />
                Schedule mode saved!
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "flexible", label: "Flexible", icon: "Shuffle", desc: "Adaptable time blocks with soft boundaries" },
                { value: "structured", label: "Structured", icon: "AlignJustify", desc: "Strict hourly schedule with fixed time slots" },
              ]?.map((opt) => (
                <button key={opt?.value} onClick={() => handleScheduleModeSave(opt?.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-smooth ${
                    scheduleMode === opt?.value ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name={opt?.icon} size={16} color={scheduleMode === opt?.value ? "var(--color-primary)" : "var(--color-muted-foreground)"} />
                    <span className={`font-caption text-sm font-semibold ${scheduleMode === opt?.value ? "text-[var(--color-primary)]" : "text-[var(--color-foreground)]"}`}>{opt?.label}</span>
                  </div>
                  <p className="font-body text-xs text-[var(--color-muted-foreground)]">{opt?.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Time Format ───────────────────────────────────────────────── */}
          <div className="card p-4 md:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Clock" size={18} color="var(--color-accent)" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)]">Time Format</h2>
                <p className="font-body text-sm text-[var(--color-muted-foreground)]">Choose how times are displayed — synced to your account</p>
              </div>
            </div>
            {timeFormatSaved && (
              <p className="font-caption text-xs text-[var(--color-success)] flex items-center gap-1 mb-3">
                <Icon name="CheckCircle" size={12} color="var(--color-success)" />
                Time format saved!
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "12h", label: "12-Hour", example: "2:30 PM" },
                { value: "24h", label: "24-Hour", example: "14:30" },
              ]?.map((opt) => (
                <button key={opt?.value} onClick={() => handleTimeFormatSave(opt?.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-smooth ${
                    timeFormat === opt?.value ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
                  }`}>
                  <p className={`font-caption text-sm font-semibold ${timeFormat === opt?.value ? "text-[var(--color-accent)]" : "text-[var(--color-foreground)]"}`}>{opt?.label}</p>
                  <p className="font-data text-xs text-[var(--color-muted-foreground)] mt-1">e.g. {opt?.example}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Category Colors ───────────────────────────────────────────── */}
          <div className="card p-4 md:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Palette" size={18} color="var(--color-success)" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)]">Life Domain Colors</h2>
                <p className="font-body text-sm text-[var(--color-muted-foreground)]">Color coding for your life domains</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CATEGORIES?.map((cat) => (
                <div key={cat?.key} className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--color-muted)]">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat?.colorVar }} />
                  <span className="font-caption text-sm text-[var(--color-foreground)]">{cat?.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Reset ─────────────────────────────────────────────────────── */}
          <div className="card p-4 md:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-destructive)]/10 flex items-center justify-center flex-shrink-0">
                <Icon name="RotateCcw" size={18} color="var(--color-destructive)" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)]">Reset to Defaults</h2>
                <p className="font-body text-sm text-[var(--color-muted-foreground)]">Restore the example schedule and default settings. This cannot be undone.</p>
              </div>
            </div>
            {resetDone ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-success)]/10">
                <Icon name="CheckCircle" size={16} color="var(--color-success)" />
                <span className="font-caption text-sm text-[var(--color-success)]">Schedule reset to defaults successfully!</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <Button variant={resetConfirm ? "destructive" : "outline"} size="sm" iconName={resetConfirm ? "AlertTriangle" : "RotateCcw"} iconPosition="left" iconSize={14} onClick={handleReset}>
                  {resetConfirm ? "Confirm Reset" : "Reset Schedule"}
                </Button>
                {resetConfirm && <Button variant="ghost" size="sm" onClick={() => setResetConfirm(false)}>Cancel</Button>}
              </div>
            )}
          </div>

          {/* ── Delete Account ────────────────────────────────────────────── */}
          <div className="card p-4 md:p-5 border border-[var(--color-destructive)]/20">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-destructive)]/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Trash2" size={18} color="var(--color-destructive)" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-[var(--color-destructive)]">Delete Account</h2>
                <p className="font-body text-sm text-[var(--color-muted-foreground)]">Permanently delete your account and all associated data. This action cannot be undone.</p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              iconName="Trash2"
              iconPosition="left"
              iconSize={13}
              onClick={() => { setShowDeleteDialog(true); setDeleteConfirmText(''); setDeleteError(''); }}
            >
              Delete My Account
            </Button>
          </div>

          {/* ── About ─────────────────────────────────────────────────────── */}
          <div className="card p-4 md:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                <Icon name="Clock" size={20} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-heading text-base font-semibold text-[var(--color-foreground)]">SchedulePro</p>
                <p className="font-caption text-xs text-[var(--color-muted-foreground)]">Version 1.0.0 · Discipline-driven productivity planner</p>
              </div>
            </div>
            <p className="font-body text-sm text-[var(--color-muted-foreground)] mt-3">&copy; {new Date()?.getFullYear()} SchedulePro. Built for disciplined self-improvers.</p>
          </div>
        </div>
      </main>
      <BottomTabNavigation />
      {/* ── Delete Account Confirmation Dialog ──────────────────────────── */}
      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e?.target === e?.currentTarget) setShowDeleteDialog(false); }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-destructive)]/15 flex items-center justify-center flex-shrink-0">
                <Icon name="AlertTriangle" size={22} color="var(--color-destructive)" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--color-foreground)]">Delete Account</h3>
                <p className="font-body text-sm text-[var(--color-muted-foreground)] mt-0.5">
                  This will permanently delete your account, all schedules, history, and settings. This cannot be undone.
                </p>
              </div>
            </div>

            {/* Confirmation input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-caption text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">
                Type <span className="text-[var(--color-destructive)] font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => { setDeleteConfirmText(e?.target?.value); setDeleteError(''); }}
                placeholder="DELETE"
                className="w-full px-3 py-2 rounded-lg border font-body text-sm text-[var(--color-foreground)] bg-[var(--color-muted)] outline-none transition-smooth focus:ring-2"
                style={{ borderColor: deleteError ? 'var(--color-destructive)' : 'var(--color-border)' }}
                autoFocus
              />
              {deleteError && (
                <p className="font-caption text-xs text-[var(--color-destructive)] flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} color="var(--color-destructive)" />
                  {deleteError}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE'}
                iconName={deleting ? 'Loader' : 'Trash2'}
                iconPosition="left"
                iconSize={13}
                className="flex-1"
              >
                {deleting ? 'Deleting…' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <TaskEditorModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        editingTask={null}
        onSave={(task) => { saveTask(task); setAddModalOpen(false); }}
        onDelete={deleteTask}
      />
    </div>
  );
}