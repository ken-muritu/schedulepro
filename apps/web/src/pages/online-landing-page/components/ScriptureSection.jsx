import React from 'react';
import Icon from '../../../components/AppIcon';

const ScriptureSection = ({ scripture, scriptureRef, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-3 bg-white/20 rounded animate-pulse w-24" />
        <div className="h-4 bg-white/20 rounded animate-pulse w-full" />
        <div className="h-4 bg-white/20 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-white/20 rounded animate-pulse w-32" />
      </div>
    );
  }

  return (
    <div className="border-l-2 border-white/40 pl-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon name="BookOpen" size={13} color="rgba(255,255,255,0.7)" />
        <span className="text-white/70 text-xs font-medium uppercase tracking-widest">Daily Scripture</span>
      </div>
      <p className="text-white/90 text-sm italic leading-relaxed">
        &ldquo;{scripture}&rdquo;
      </p>
      <p className="text-white/60 text-xs mt-2 font-medium">&mdash; {scriptureRef}</p>
    </div>
  );
};

export default ScriptureSection;
