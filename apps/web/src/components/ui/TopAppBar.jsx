import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import useSyncStatus from '@schedulepro/shared/src/hooks/useSyncStatus';
import usePWAInstall from '@schedulepro/shared/src/hooks/usePWAInstall';
import useDarkMode from '@schedulepro/shared/src/hooks/useDarkMode';
import SyncStatusBadge from '../ui/SyncStatusBadge';

const TopAppBar = ({ currentMode = 'flexible', onModeToggle, onAddTask }) => {
  const [mode, setMode] = useState(currentMode);
  const { status: syncStatus, isOnline } = useSyncStatus();
  const { canInstall, triggerInstall } = usePWAInstall();
  const { isDark, toggleTheme } = useDarkMode();
  const navigate = useNavigate();

  const handleModeToggle = (newMode) => {
    setMode(newMode);
    if (onModeToggle) onModeToggle(newMode);
  };

  return (
    <header className="top-app-bar">
      {/* Logo */}
      <Link to="/dashboard" className="top-app-bar-logo" aria-label="SchedulePro Home">
        <div className="top-app-bar-logo-icon">
          <Icon name="Clock" size={20} color="#FFFFFF" strokeWidth={2.5} />
        </div>
        <span className="top-app-bar-logo-text hidden sm:block">SchedulePro</span>
      </Link>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Mode Toggle */}
        <div className="mode-toggle hidden sm:flex" role="group" aria-label="Scheduling mode">
          <button
            className={`mode-toggle-btn ${mode === 'flexible' ? 'active' : ''}`}
            onClick={() => handleModeToggle('flexible')}
            aria-pressed={mode === 'flexible'}
          >
            <Icon name="Shuffle" size={12} />
            <span className="hidden xs:inline">Flexible</span>
          </button>
          <button
            className={`mode-toggle-btn ${mode === 'structured' ? 'active' : ''}`}
            onClick={() => handleModeToggle('structured')}
            aria-pressed={mode === 'structured'}
          >
            <Icon name="AlignJustify" size={12} />
            <span className="hidden xs:inline">Structured</span>
          </button>
        </div>

        {/* Focus Mode Button */}
        <button
          onClick={() => navigate('/focus')}
          className="flex items-center justify-center w-9 h-9 rounded-md transition-smooth hover:opacity-90 active:scale-95 focus:outline-none focus-ring"
          style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
          aria-label="Enter Focus Mode"
          title="Focus Mode"
        >
          <Icon name="Target" size={16} color="currentColor" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth focus:outline-none focus-ring"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light Mode' : 'Dark Mode'}
        >
          <Icon name={isDark ? 'Sun' : 'Moon'} size={18} color="currentColor" />
        </button>

        {/* PWA Install Button */}
        {canInstall && (
          <button
            onClick={triggerInstall}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-smooth hover:opacity-90 focus:outline-none focus-ring"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
            aria-label="Install SchedulePro app"
            title="Install App"
          >
            <Icon name="Download" size={13} color="currentColor" />
            <span className="hidden sm:inline">Install</span>
          </button>
        )}

        {/* Sync Status Badge */}
        <SyncStatusBadge status={syncStatus} />

        {/* Add Task Button */}
        <button
          onClick={onAddTask}
          className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground transition-smooth hover:opacity-90 active:scale-95 focus:outline-none focus-ring"
          aria-label="Add new task"
        >
          <Icon name="Plus" size={18} color="currentColor" strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
};

export default TopAppBar;