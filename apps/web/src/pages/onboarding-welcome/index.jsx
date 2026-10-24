import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';

export default function OnboardingWelcome() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-background)' }}
    >
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          <Icon name="Clock" size={40} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-foreground)]">
            Welcome to SchedulePro
          </h1>
          <p className="font-body text-sm text-[var(--color-muted-foreground)] mt-2">
            Your discipline-driven productivity planner is ready.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 rounded-xl font-heading text-sm font-semibold text-white transition-all duration-200 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
