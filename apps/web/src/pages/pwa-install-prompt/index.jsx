import React from 'react';
import TopAppBar from '../../components/ui/TopAppBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import PWAInstallCard from './components/PWAInstallCard';
import PWAFeaturesGrid from './components/PWAFeaturesGrid';
import PWAStatusBadge from './components/PWAStatusBadge';
import usePWAInstall from '@schedulepro/shared/src/hooks/usePWAInstall';
import useNetworkStatus from '@schedulepro/shared/src/hooks/useNetworkStatus';
import Icon from '../../components/AppIcon';

export default function PWAInstallPrompt() {
  const { canInstall, triggerInstall, isInstalled } = usePWAInstall();
  const { isOnline } = useNetworkStatus();

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <TopAppBar currentMode="flexible" onModeToggle={() => {}} onAddTask={() => {}} />

      <main className="flex-1 content-area overflow-y-auto">
        <div className="px-4 md:px-6 lg:px-8 max-w-2xl mx-auto py-6">
          {/* Header */}
          <div className="flex flex-col gap-1 mb-6">
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                <Icon name="Download" size={20} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-heading text-xl md:text-2xl font-bold text-[var(--color-foreground)]">
                  Install App
                </h1>
                <p className="font-caption text-xs text-[var(--color-muted-foreground)]">
                  Get the full native experience
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <PWAStatusBadge isInstalled={isInstalled} isOnline={isOnline} />

          {/* Install Card */}
          <PWAInstallCard
            canInstall={canInstall}
            isInstalled={isInstalled}
            onInstall={triggerInstall}
          />

          {/* Features Grid */}
          <PWAFeaturesGrid />

          {/* Offline Info */}
          <div
            className="mt-4 rounded-xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(99,102,241,0.15)' }}
            >
              <Icon name="WifiOff" size={16} color="#a5b4fc" />
            </div>
            <div>
              <p className="font-caption text-sm font-semibold text-[var(--color-foreground)]">
                Works Offline
              </p>
              <p className="font-body text-xs text-[var(--color-muted-foreground)] mt-0.5">
                SchedulePro caches your schedule data locally. Even without internet, you can view and manage your tasks. Changes sync automatically when you reconnect.
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomTabNavigation />
    </div>
  );
}
