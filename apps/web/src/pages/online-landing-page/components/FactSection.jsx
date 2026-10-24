import React from 'react';
import Icon from '../../../components/AppIcon';

const FactSection = ({ fact, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-3 bg-white/20 rounded animate-pulse w-28" />
        <div className="h-4 bg-white/20 rounded animate-pulse w-full" />
        <div className="h-4 bg-white/20 rounded animate-pulse w-4/5" />
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center mt-0.5">
        <Icon name="Lightbulb" size={15} color="#fbbf24" />
      </div>
      <div>
        <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">Did You Know?</p>
        <p className="text-white/85 text-sm leading-relaxed">{fact}</p>
      </div>
    </div>
  );
};

export default FactSection;
