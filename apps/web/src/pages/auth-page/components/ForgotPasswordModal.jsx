import React, { useState, useEffect } from 'react';
import { supabase } from '@schedulepro/shared/src/lib/supabase';
import Icon from '../../../components/AppIcon';

const ForgotPasswordModal = ({ onClose, mode = 'request' }) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  // Detect if we have a recovery token in the URL (Supabase sends #access_token=...&type=recovery)
  useEffect(() => {
    const hash = window.location?.hash;
    if (hash?.includes('type=recovery') || hash?.includes('type=signup')) {
      setCurrentMode('reset');
    }
  }, []);

  const handleRequestReset = async (e) => {
    e?.preventDefault();
    if (!email?.trim()) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: resetError } = await supabase?.auth?.resetPasswordForEmail(email?.trim(), {
        redirectTo: `${window.location?.origin}/auth-page`,
      });
      if (resetError) {
        setError(resetError?.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e?.preventDefault();
    if (!newPassword || newPassword?.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: updateError } = await supabase?.auth?.updateUser({ password: newPassword });
      if (updateError) {
        setError(updateError?.message);
      } else {
        setSuccess(true);
        // Clear the hash from URL
        window.history?.replaceState(null, '', window.location?.pathname);
        setTimeout(() => onClose?.(), 2000);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">
              {currentMode === 'reset' ? 'Set New Password' : 'Reset Password'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {currentMode === 'reset' ? 'Enter your new password below' : "We'll send you a reset link"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <Icon name={currentMode === 'reset' ? 'CheckCircle' : 'Mail'} size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {currentMode === 'reset' ? 'Password updated!' : 'Check your email'}
            </h3>
            <p className="text-sm text-slate-400 mb-5">
              {currentMode === 'reset' ?'Your password has been successfully updated.'
                : <>We sent a reset link to <span className="font-medium text-slate-200">{email}</span></>}
            </p>
            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 active:scale-[0.97]"
            >
              Done
            </button>
          </div>
        ) : currentMode === 'reset' ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e?.target?.value)}
                  placeholder="Min. 8 characters"
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-white/15 bg-slate-800 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70 transition-all text-sm"
                  autoFocus
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e?.target?.value)}
                placeholder="Repeat your password"
                className="w-full h-11 px-4 rounded-xl border border-white/15 bg-slate-800 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70 transition-all text-sm"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-700 text-slate-400 font-semibold text-sm hover:bg-slate-800 transition-all duration-200 active:scale-[0.97]">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</> : 'Update Password'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e?.target?.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                autoFocus
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-700 text-slate-400 font-semibold text-sm hover:bg-slate-800 transition-all duration-200 active:scale-[0.97]">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
