import React from 'react';

const getStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password?.length >= 8) score++;
  if (password?.length >= 12) score++;
  if (/[A-Z]/?.test(password)) score++;
  if (/[0-9]/?.test(password)) score++;
  if (/[^A-Za-z0-9]/?.test(password)) score++;

  if (score <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
  return { level: 3, label: 'Strong', color: 'bg-emerald-500' };
};

const PasswordStrengthIndicator = ({ password }) => {
  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3]?.map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength?.level ? strength?.color : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        strength?.level === 1 ? 'text-red-500' :
        strength?.level === 2 ? 'text-amber-500': 'text-emerald-500'
      }`}>
        {strength?.label} password
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
