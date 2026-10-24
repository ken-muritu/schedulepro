import React from 'react';
import Icon from '../../../components/AppIcon';

const FEATURES = [
  {
    icon: 'Zap',
    color: '#f59e0b',
    title: 'Lightning Fast',
    desc: 'Instant load times with smart caching',
  },
  {
    icon: 'WifiOff',
    color: '#6366f1',
    title: 'Works Offline',
    desc: 'Full access without internet connection',
  },
  {
    icon: 'Bell',
    color: '#10b981',
    title: 'Notifications',
    desc: 'Get reminders for upcoming tasks',
  },
  {
    icon: 'Smartphone',
    color: '#ec4899',
    title: 'Native Feel',
    desc: 'App-like experience on any device',
  },
  {
    icon: 'Shield',
    color: '#14b8a6',
    title: 'Secure & Private',
    desc: 'Your data stays on your device',
  },
  {
    icon: 'RefreshCw',
    color: '#a855f7',
    title: 'Auto Updates',
    desc: 'Always get the latest features',
  },
];

const PWAFeaturesGrid = () => {
  return (
    <div className="mb-4">
      <h3 className="font-heading text-sm font-semibold text-[var(--color-foreground)] mb-3">
        Why Install?
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {FEATURES?.map((feature) => (
          <div
            key={feature?.title}
            className="rounded-xl p-3 flex items-start gap-3"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: feature?.color + '22' }}
            >
              <Icon name={feature?.icon} size={16} color={feature?.color} />
            </div>
            <div className="min-w-0">
              <p className="font-caption text-xs font-semibold text-[var(--color-foreground)] leading-tight">
                {feature?.title}
              </p>
              <p className="font-body text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-tight">
                {feature?.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PWAFeaturesGrid;
