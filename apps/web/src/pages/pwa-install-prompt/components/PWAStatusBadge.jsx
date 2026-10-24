import React from 'react';
import Icon from '../../../components/AppIcon';

const PWAStatusBadge = ({ isInstalled, isOnline }) => {
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      {/* Online/Offline status */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
          border: `1px solid ${isOnline ? 'rgba(16,185,129,0.3)' : 'rgba(248,113,113,0.3)'}`,
        }}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            backgroundColor: isOnline ? '#10b981' : '#f87171',
            boxShadow: isOnline ? '0 0 6px rgba(16,185,129,0.7)' : '0 0 6px rgba(248,113,113,0.7)',
          }}
        />
        <span
          className="font-caption text-xs font-medium"
          style={{ color: isOnline ? '#10b981' : '#f87171' }}
        >
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* PWA Ready indicator */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
        }}
      >
        <Icon name="Layers" size={12} color="#a5b4fc" />
        <span className="font-caption text-xs font-medium" style={{ color: '#a5b4fc' }}>
          PWA Ready
        </span>
      </div>

      {/* Installed badge */}
      {isInstalled && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)',
          }}
        >
          <Icon name="CheckCircle2" size={12} color="#10b981" />
          <span className="font-caption text-xs font-medium" style={{ color: '#10b981' }}>
            Installed
          </span>
        </div>
      )}
    </div>
  );
};

export default PWAStatusBadge;
