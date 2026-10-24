import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import useNetworkStatus from '@schedulepro/shared/src/hooks/useNetworkStatus';
import { getDailyContent, getFallbackContent, clearTodayCache } from '@schedulepro/shared/src/lib/dailyContent';
import ScriptureSection from './components/ScriptureSection';
import QuoteSection from './components/QuoteSection';
import FactSection from './components/FactSection';
import OfflineBanner from './components/OfflineBanner';
import { useAuth } from '@schedulepro/shared/src/contexts/AuthContext';

function getTodayDateString() {
  const d = new Date();
  return `${d?.getFullYear()}-${String(d?.getMonth() + 1)?.padStart(2, '0')}-${String(d?.getDate())?.padStart(2, '0')}`;
}

export default function OnlineLandingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const loadedDateRef = useRef(null);

  async function loadContent(forceRefresh = false) {
    setLoading(true);
    if (forceRefresh) clearTodayCache();
    try {
      const data = await getDailyContent();
      setContent(data);
      setUsingFallback(false);
      loadedDateRef.current = getTodayDateString();
    } catch (err) {
      const fallback = getFallbackContent();
      setContent(fallback);
      setUsingFallback(true);
      loadedDateRef.current = getTodayDateString();
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    loadContent();
  }, []);

  // Check every minute if the date has changed (midnight crossing) and re-fetch
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getTodayDateString();
      if (loadedDateRef?.current && loadedDateRef?.current !== today) {
        loadContent();
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const showOfflineBanner = !isOnline || usingFallback;
  const noContent = !loading && !content;

  const bgStyle = content?.backgroundUrl
    ? { backgroundImage: `url(${content?.backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)' };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={bgStyle}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8">

        {/* Offline Banner */}
        {showOfflineBanner && (
          <div className="mb-4">
            <OfflineBanner />
          </div>
        )}

        {/* Main Card */}
        <div
          className="rounded-2xl border border-white/20 p-6 md:p-8 space-y-6"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo + App Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <Icon name="Clock" size={20} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight tracking-tight">SchedulePro</h1>
                <p className="text-white/50 text-xs">Your daily planning companion</p>
              </div>
            </div>
            {/* Manual refresh button */}
            {isOnline && !loading && (
              <button
                onClick={() => loadContent(true)}
                title="Refresh today's content"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
              >
                <Icon name="RefreshCw" size={15} />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {noContent ? (
            /* No content fallback */
            (<div className="text-center py-4 space-y-2">
              <Icon name="CloudOff" size={32} color="rgba(255,255,255,0.4)" />
              <p className="text-white/60 text-sm">No cached content available</p>
            </div>)
          ) : (
            <div className="space-y-6">
              {/* Scripture */}
              <ScriptureSection
                scripture={content?.scripture}
                scriptureRef={content?.scriptureRef}
                loading={loading}
              />

              {/* Divider */}
              <div className="border-t border-white/10" />

              {/* Quote */}
              <QuoteSection
                quote={content?.quote}
                quoteAuthor={content?.quoteAuthor}
                loading={loading}
              />

              {/* Divider */}
              <div className="border-t border-white/10" />

              {/* Did You Know */}
              <FactSection
                fact={content?.fact}
                loading={loading}
              />
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Start Planning Button */}
          <button
            onClick={() => {
              if (authLoading) return;
              navigate(user ? '/dashboard' : '/auth-page');
            }}
            disabled={authLoading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus:outline-none disabled:opacity-70 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
          >
            {authLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Loading...</span>
              </>
            ) : user ? 'Go to Dashboard' : 'Start Planning'}
          </button>
        </div>

        {/* Footer note */}
        {content?.fetchedAt && !loading && (
          <p className="text-center text-white/30 text-xs mt-4">
            Content refreshed {new Date(content.fetchedAt)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
}
