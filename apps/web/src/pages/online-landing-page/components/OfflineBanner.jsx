import React from 'react';
import Icon from '../../../components/AppIcon';

const OfflineBanner = () => (
  <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-lg px-3 py-2 text-amber-200 text-xs">
    <Icon name="WifiOff" size={13} color="currentColor" />
    <span>You&apos;re offline &mdash; showing content from last session</span>
  </div>
);

export default OfflineBanner;
