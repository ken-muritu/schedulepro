import React from 'react';
import Icon from '../../../components/AppIcon';

const PWAInstallCard = ({ canInstall, isInstalled, onInstall }) => {
  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))',
        border: '1px solid rgba(99,102,241,0.25)',
      }}
    >
      {/* App Icon + Name */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          <Icon name="Clock" size={32} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-[var(--color-foreground)]">
            SchedulePro
          </h2>
          <p className="font-body text-sm text-[var(--color-muted-foreground)]">
            Discipline-driven productivity planner
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            {[1, 2, 3, 4, 5]?.map((s) => (
              <Icon key={s} name="Star" size={12} color="#f59e0b" />
            ))}
            <span className="font-caption text-xs text-[var(--color-muted-foreground)] ml-1">5.0</span>
          </div>
        </div>
      </div>
      {/* Install Button or Status */}
      {isInstalled ? (
        <div
          className="flex items-center gap-3 rounded-xl p-3"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.2)' }}
          >
            <Icon name="CheckCircle2" size={18} color="#10b981" />
          </div>
          <div>
            <p className="font-caption text-sm font-semibold" style={{ color: '#10b981' }}>
              App Installed
            </p>
            <p className="font-body text-xs text-[var(--color-muted-foreground)]">
              SchedulePro is installed on your device
            </p>
          </div>
        </div>
      ) : canInstall ? (
        <button
          onClick={onInstall}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-heading text-sm font-semibold text-white transition-all duration-200 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}
        >
          <Icon name="Download" size={18} color="#fff" strokeWidth={2.5} />
          Install SchedulePro
        </button>
      ) : (
        <div
          className="flex items-center gap-3 rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Icon name="Info" size={18} color="var(--color-muted-foreground)" />
          <p className="font-body text-xs text-[var(--color-muted-foreground)]">
            Installation is not available in this browser or the app is already installed. Try opening in Chrome or Edge on Android/Desktop.
          </p>
        </div>
      )}
    </div>
  );
};

export default PWAInstallCard;
