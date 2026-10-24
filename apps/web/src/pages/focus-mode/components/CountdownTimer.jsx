import React from 'react';

const CountdownTimer = ({ secondsLeft, totalSeconds }) => {
  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;

  const pct = totalSeconds > 0 ? Math.min(100, ((totalSeconds - secondsLeft) / totalSeconds) * 100) : 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const formatPart = (n) => String(n)?.padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular SVG ring */}
      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" className="-rotate-90">
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-data text-4xl font-bold text-white tracking-tight">
            {h > 0 ? `${formatPart(h)}:` : ''}{formatPart(m)}:{formatPart(s)}
          </span>
          <span className="font-caption text-xs text-white/60 mt-1">remaining</span>
        </div>
      </div>

      {/* Text breakdown */}
      <p className="font-data text-lg text-white/80">
        {h > 0 && <span>{h}h </span>}
        {m > 0 && <span>{m}m </span>}
        <span>{s}s remaining</span>
      </p>
    </div>
  );
};

export default CountdownTimer;
