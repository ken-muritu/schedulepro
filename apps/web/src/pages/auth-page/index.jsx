import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@schedulepro/shared/src/contexts/AuthContext';
import { supabase } from '@schedulepro/shared/src/lib/supabase';
import Icon from '../../components/AppIcon';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import PasswordStrengthIndicator from './components/PasswordStrengthIndicator';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [signUpSuccessEmail, setSignUpSuccessEmail] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState('');

  // Sign Up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Detect password reset token in URL hash
  useEffect(() => {
    const hash = window.location?.hash;
    if (hash?.includes('type=recovery')) {
      setIsPasswordReset(true);
      setShowForgotPassword(true);
    }
  }, []);

  const handleSignIn = async (e) => {
    e?.preventDefault();
    if (!signInEmail?.trim() || !signInPassword) {
      setSignInError('Please fill in all fields');
      return;
    }
    setSignInLoading(true);
    setSignInError('');
    try {
      const { error } = await signIn(signInEmail?.trim(), signInPassword);
      if (error) {
        setSignInError(error?.message || 'Invalid email or password');
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setSignInError('Something went wrong. Please try again.');
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e?.preventDefault();
    if (!signUpName?.trim() || !signUpEmail?.trim() || !signUpPassword || !signUpConfirmPassword) {
      setSignUpError('Please fill in all fields');
      return;
    }
    if (signUpPassword?.length < 8) {
      setSignUpError('Password must be at least 8 characters');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match');
      return;
    }
    setSignUpLoading(true);
    setSignUpError('');
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email: signUpEmail?.trim(),
        password: signUpPassword,
        options: {
          data: {
            name: signUpName?.trim(),
            full_name: signUpName?.trim(),
          },
          emailRedirectTo: `${window.location?.origin}/auth-page`,
        },
      });
      if (error) {
        setSignUpError(error?.message || 'Failed to create account');
      } else if (data?.user) {
        // Check if email confirmation is required
        if (data?.user?.identities?.length === 0 || !data?.session) {
          // Email confirmation required
          setSignUpSuccessEmail(signUpEmail?.trim());
          setSignUpSuccess(true);
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setSignUpError('Something went wrong. Please try again.');
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleGuestMode = () => {
    localStorage.setItem('schedulepro_guest_mode', 'true');
    setGuestMode(true);
    navigate('/dashboard', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl" />
      </div>
      {/* Card */}
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
          {/* Logo header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="flex items-center justify-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Icon name="Clock" size={20} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                SchedulePro
              </span>
            </div>

            {/* Tabs - hide when showing email verification success */}
            {!signUpSuccess && (
              <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
                <button
                  onClick={() => { setActiveTab('signin'); setSignInError(''); }}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'signin' ?'bg-slate-600 text-white shadow-sm' :'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setActiveTab('signup'); setSignUpError(''); }}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'signup' ?'bg-slate-600 text-white shadow-sm' :'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}
          </div>

          {/* Tab content */}
          <div className="px-8 pb-8">
            {/* Email Verification Success Screen */}
            {signUpSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-indigo-900/40 border border-indigo-500/30 flex items-center justify-center mx-auto mb-5">
                  <Icon name="MailCheck" size={28} className="text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify your email</h2>
                <p className="text-sm text-white/50 mb-2">We sent a confirmation link to</p>
                <p className="text-sm font-semibold text-indigo-400 mb-5">{signUpSuccessEmail}</p>
                <p className="text-xs text-white/40 leading-relaxed mb-6">
                  Click the link in your email to activate your account. Check your spam folder if you don't see it.
                </p>
                <button
                  onClick={() => { setSignUpSuccess(false); setActiveTab('signin'); }}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 active:scale-[0.97]"
                >
                  Back to Sign In
                </button>
                <button
                  onClick={async () => {
                    await supabase?.auth?.resend({ type: 'signup', email: signUpSuccessEmail });
                  }}
                  className="w-full mt-3 h-11 rounded-xl border border-white/10 text-white/50 font-semibold text-sm hover:bg-white/5 hover:text-white/70 transition-all duration-200"
                >
                  Resend email
                </button>
              </div>
            ) : activeTab === 'signin' ? (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
                  <p className="text-sm text-white/50">Your schedule, everywhere</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e?.target?.value)}
                      placeholder="you@example.com"
                      className="w-full h-11 px-4 rounded-xl border border-white/15 bg-slate-800 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70 transition-all text-sm"
                      style={{ colorScheme: 'dark' }}
                      autoComplete="email"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showSignInPassword ? 'text' : 'password'}
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e?.target?.value)}
                        placeholder="••••••••"
                        className="w-full h-11 px-4 pr-11 rounded-xl border border-white/15 bg-slate-800 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70 transition-all text-sm"
                        style={{ colorScheme: 'dark' }}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        <Icon name={showSignInPassword ? 'EyeOff' : 'Eye'} size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {signInError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-400">{signInError}</p>
                    </div>
                  )}

                  {/* Sign In CTA */}
                  <button
                    type="submit"
                    disabled={signInLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    {signInLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <Icon name="ArrowRight" size={16} />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-white/30 font-medium">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Guest mode */}
                  <button
                    type="button"
                    onClick={handleGuestMode}
                    className="w-full h-11 rounded-xl border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/5 hover:text-white/80 hover:border-white/20 transition-all duration-200 active:scale-[0.97]"
                  >
                    Continue as Guest
                  </button>

                  {/* Guest mode info */}
                  <p className="text-center text-xs text-white/30">
                    Guest mode saves data locally only
                  </p>
                </form>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white mb-1">Start your journey</h1>
                  <p className="text-sm text-white/50">Create your free account</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e?.target?.value)}
                      placeholder="Your name"
                      className="w-full h-11 px-4 rounded-xl border border-white/15 bg-slate-800 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70 transition-all text-sm"
                      style={{ colorScheme: 'dark' }}
                      autoComplete="name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e?.target?.value)}
                      placeholder="you@example.com"
                      className="w-full h-11 px-4 rounded-xl border border-white/15 bg-slate-800 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70 transition-all text-sm"
                      style={{ colorScheme: 'dark' }}
                      autoComplete="email"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e?.target?.value)}
                        placeholder="Min. 8 characters"
                        className="w-full h-11 px-4 pr-11 rounded-xl border border-white/15 bg-slate-800 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70 transition-all text-sm"
                        style={{ colorScheme: 'dark' }}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        <Icon name={showSignUpPassword ? 'EyeOff' : 'Eye'} size={16} />
                      </button>
                    </div>
                    <PasswordStrengthIndicator password={signUpPassword} />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e?.target?.value)}
                        placeholder="Repeat your password"
                        className="w-full h-11 px-4 pr-11 rounded-xl border border-white/15 bg-slate-800 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70 transition-all text-sm"
                        style={{ colorScheme: 'dark' }}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} />
                      </button>
                    </div>
                    {signUpConfirmPassword && signUpPassword !== signUpConfirmPassword && (
                      <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  {/* Error */}
                  {signUpError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-400">{signUpError}</p>
                    </div>
                  )}

                  {/* Create Account CTA */}
                  <button
                    type="submit"
                    disabled={signUpLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    {signUpLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <Icon name="Sparkles" size={16} />
                      </>
                    )}
                  </button>

                  {/* Terms */}
                  <p className="text-center text-xs text-white/30 leading-relaxed">
                    By signing up, you agree to our{' '}
                    <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer">Terms of Service</span>{' '}
                    and{' '}
                    <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer">Privacy Policy</span>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Switch tab link */}
        <p className="text-center text-sm text-white/40 mt-5">
          {activeTab === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => { setActiveTab('signup'); setSignInError(''); }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setActiveTab('signin'); setSignUpError(''); }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal
          onClose={() => { setShowForgotPassword(false); setIsPasswordReset(false); }}
          mode={isPasswordReset ? 'reset' : 'request'}
        />
      )}
      {/* Guest mode banner */}
      {guestMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm">
          <Icon name="Info" size={14} className="text-amber-400" />
          <p className="text-xs text-amber-300 font-medium">
            Using guest mode — sign up to sync across devices
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
