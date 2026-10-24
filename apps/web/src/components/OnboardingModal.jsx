import React, { useState, useEffect, useRef } from 'react';
import Icon from './AppIcon';

const OnboardingModal = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef?.current?.focus(), 100);
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = name?.trim();
    if (!trimmed) {
      setError('Please enter your name to continue');
      return;
    }
    const userData = { name: trimmed, onboarded: true };
    localStorage.setItem('schedulepro_user', JSON.stringify(userData));
    onComplete(userData);
  };

  const isValid = name?.trim()?.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,14,23,0.92)', backdropFilter: 'blur(8px)' }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="onboarding-title"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 p-8 shadow-2xl"
        style={{ background: 'rgba(30,27,75,0.85)', backdropFilter: 'blur(20px)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <Icon name="Clock" size={32} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <h1
            id="onboarding-title"
            className="font-heading text-2xl md:text-3xl font-bold text-white text-center"
          >
            Welcome to SchedulePro
          </h1>
          <p className="font-body text-sm text-white/60 mt-2 text-center">
            Discipline-driven productivity planner
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="user-name"
              className="font-caption text-sm font-medium text-white/80"
            >
              What should we call you?
            </label>
            <input
              ref={inputRef}
              id="user-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e?.target?.value);
                if (error) setError('');
              }}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 rounded-xl border text-white placeholder-white/30 font-body text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.07)',
                borderColor: error ? '#f87171' : 'rgba(255,255,255,0.15)',
                boxShadow: error ? '0 0 0 2px rgba(248,113,113,0.3)' : 'none',
              }}
              onFocus={(e) => {
                if (!error) e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = error
                  ? '0 0 0 2px rgba(248,113,113,0.3)'
                  : '0 0 0 2px rgba(99,102,241,0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = error ? '#f87171' : 'rgba(255,255,255,0.15)';
                e.target.style.boxShadow = 'none';
              }}
              autoComplete="given-name"
              maxLength={50}
            />
            {error && (
              <p className="font-caption text-xs text-red-400 flex items-center gap-1">
                <Icon name="AlertCircle" size={12} color="#f87171" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="w-full py-3 rounded-xl font-heading text-sm font-semibold text-white transition-all duration-200"
            style={{
              background: isValid
                ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                : 'rgba(255,255,255,0.1)',
              opacity: isValid ? 1 : 0.5,
              cursor: isValid ? 'pointer' : 'not-allowed',
              boxShadow: isValid ? '0 4px 20px rgba(99,102,241,0.4)' : 'none',
            }}
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
