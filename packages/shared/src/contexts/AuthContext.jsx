import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { safeWindow, safeDocument, isWeb } from '../lib/platform';

const AuthContext = createContext({})

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const timeoutRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  // Isolated async operations - never called from auth callbacks
  const profileOperations = {
    async load(userId) {
      if (!userId) return
      setProfileLoading(true)
      try {
        const { data, error } = await supabase?.from('profiles')?.select('*')?.eq('id', userId)?.single()
        if (!error) setUserProfile(data)
      } catch (error) {
        console.error('Profile load error:', error)
      } finally {
        setProfileLoading(false)
      }
    },

    clear() {
      setUserProfile(null)
      setProfileLoading(false)
    }
  }

  // Session timeout logic
  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (timeoutRef?.current) clearTimeout(timeoutRef?.current);
    timeoutRef.current = setTimeout(async () => {
      // Only auto-logout if user is authenticated
      const { data: { session } } = await supabase?.auth?.getSession();
      if (session) {
        await supabase?.auth?.signOut();
        setUser(null);
        profileOperations?.clear();
        setSessionExpired(true);
      }
    }, SESSION_TIMEOUT_MS);
  }, []);

  // Auth state handlers - PROTECTED from async modification
  const authStateHandlers = {
    // This handler MUST remain synchronous - Supabase requirement
    onChange: (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      if (session?.user) {
        profileOperations?.load(session?.user?.id) // Fire-and-forget
        resetTimeout(); // Start inactivity timer on login
      } else {
        profileOperations?.clear()
        if (timeoutRef?.current) clearTimeout(timeoutRef?.current);
      }
    }
  }

  // Attach activity listeners when user is logged in
  useEffect(() => {
    if (!user || !isWeb) return;
    const handleActivity = () => resetTimeout();
    ACTIVITY_EVENTS?.forEach((evt) => safeWindow.addEventListener(evt, handleActivity, { passive: true }));
    resetTimeout();
    return () => {
      ACTIVITY_EVENTS?.forEach((evt) => safeWindow.removeEventListener(evt, handleActivity));
      if (timeoutRef?.current) clearTimeout(timeoutRef?.current);
    };
  }, [user, resetTimeout]);

  useEffect(() => {
    // Initial session check
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      authStateHandlers?.onChange(null, session)
    })?.catch((err) => {
      console.warn('Session fetch failed (network error):', err?.message);
      setLoading(false);
    })

    // CRITICAL: This must remain synchronous
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      authStateHandlers?.onChange
    )

    return () => subscription?.unsubscribe()
  }, [])

  // Auth methods
  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase?.auth?.signUp({ email, password })
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const signIn = async (email, password) => {
    setSessionExpired(false);
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({ email, password })
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const signOut = async () => {
    try {
      if (timeoutRef?.current) clearTimeout(timeoutRef?.current);
      const { error } = await supabase?.auth?.signOut()
      if (!error) {
        setUser(null)
        profileOperations?.clear()
      }
      return { error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'No user logged in' } }
    try {
      const { data, error } = await supabase?.from('profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single()
      if (!error) setUserProfile(data)
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const updateEmail = async (newEmail) => {
    if (!user) return { error: { message: 'No user logged in' } }
    try {
      const { data, error } = await supabase?.auth?.updateUser({ email: newEmail })
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const updatePassword = async (newPassword) => {
    if (!user) return { error: { message: 'No user logged in' } }
    try {
      const { data, error } = await supabase?.auth?.updateUser({ password: newPassword })
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const deleteAccount = async () => {
    if (!user) return { error: { message: 'No user logged in' } }
    try {
      const { error } = await supabase?.rpc('delete_user_account')
      if (error) {
        await supabase?.auth?.signOut()
        return { error }
      }
      setUser(null)
      profileOperations?.clear()
      return { error: null }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    sessionExpired,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Session expired toast */}
      {isWeb && sessionExpired && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl shadow-black/40">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Session expired</p>
            <p className="text-xs text-slate-400">You were signed out due to inactivity</p>
          </div>
          <button onClick={() => setSessionExpired(false)} className="ml-2 text-slate-500 hover:text-slate-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
}
