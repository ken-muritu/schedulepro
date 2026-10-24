import React from 'react';
import Icon from '../AppIcon';

/**
 * SyncStatusBadge
 * Props:
 *   status: 'offline' | 'syncing' | 'synced'
 *   pendingCount: number (optional)
 *   compact: boolean – show dot only (no label)
 */
const SyncStatusBadge = ({ status = 'synced', pendingCount = 0, compact = false }) => {
  const configs = {
    offline: {
      icon: 'WifiOff',
      label: 'Offline',
      dotColor: '#f87171',
      textColor: '#f87171',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.25)',
      glow: '0 0 6px rgba(248,113,113,0.7)',
      pulse: false,
    },
    syncing: {
      icon: 'RefreshCw',
      label: 'Syncing…',
      dotColor: '#fbbf24',
      textColor: '#fbbf24',
      bg: 'rgba(251,191,36,0.12)',
      border: 'rgba(251,191,36,0.25)',
      glow: '0 0 6px rgba(251,191,36,0.7)',
      pulse: true,
    },
    synced: {
      icon: 'CheckCircle',
      label: 'Synced',
      dotColor: '#4ade80',
      textColor: '#4ade80',
      bg: 'rgba(74,222,128,0.1)',
      border: 'rgba(74,222,128,0.2)',
      glow: '0 0 6px rgba(74,222,128,0.6)',
      pulse: false,
    },
    pending: {
      icon: 'Clock',
      label: 'Pending',
      dotColor: '#fb923c',
      textColor: '#fb923c',
      bg: 'rgba(251,146,60,0.12)',
      border: 'rgba(251,146,60,0.25)',
      glow: '0 0 6px rgba(251,146,60,0.6)',
      pulse: true,
    },
  };

  const cfg = configs?.[status] || configs?.synced;

  if (compact) {
    return (
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg?.pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: cfg?.dotColor, boxShadow: cfg?.glow }}
        aria-label={cfg?.label}
        title={cfg?.label}
      />
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-300`}
      style={{ background: cfg?.bg, border: `1px solid ${cfg?.border}` }}
      aria-label={cfg?.label}
      title={cfg?.label}
    >
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg?.pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: cfg?.dotColor, boxShadow: cfg?.glow }}
      />
      <span
        className="text-xs font-medium hidden sm:inline"
        style={{ color: cfg?.textColor }}
      >
        {status === 'pending' && pendingCount > 0
          ? `${pendingCount} pending`
          : cfg?.label}
      </span>
      {status === 'syncing' && (
        <Icon
          name="RefreshCw"
          size={11}
          color={cfg?.textColor}
          className="animate-spin hidden sm:block"
        />
      )}
    </div>
  );
};

export default SyncStatusBadge;
