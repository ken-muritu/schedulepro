import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@schedulepro/shared/src/lib/supabase';
import { useAuth } from '@schedulepro/shared/src/contexts/AuthContext';
import TopAppBar from '../../components/ui/TopAppBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import Icon from '../../components/AppIcon';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,  } from 'recharts';
import { format, subDays, endOfWeek, eachDayOfInterval, eachWeekOfInterval, endOfMonth, eachMonthOfInterval } from 'date-fns';

const CATEGORY_COLORS = {
  work: '#6366f1',
  coding: '#22d3ee',
  spirituality: '#a78bfa',
  health: '#34d399',
  languages: '#fbbf24',
  literature: '#f472b6',
  leadership: '#fb923c',
  meals: '#f87171',
  chores: '#94a3b8',
  leisure: '#60a5fa',
  family: '#e879f9',
  social: '#4ade80',
};

const MODES = [
  { id: 'daily', label: 'Daily', icon: 'CalendarDays' },
  { id: 'weekly', label: 'Weekly', icon: 'CalendarRange' },
  { id: 'monthly', label: 'Monthly', icon: 'Calendar' },
];

const CHART_TYPES = [
  { id: 'bar', icon: 'BarChart2', label: 'Bar' },
  { id: 'area', icon: 'TrendingUp', label: 'Area' },
  { id: 'pie', icon: 'PieChart', label: 'Pie' },
];

const METRICS = [
  { id: 'completions', label: 'Tasks', icon: 'CheckCircle' },
  { id: 'time', label: 'Time', icon: 'Clock' },
  { id: 'rating', label: 'Rating', icon: 'Star' },
];

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' };

function getDateRange(mode) {
  const now = new Date();
  if (mode === 'daily') return { start: subDays(now, 6), end: now };
  if (mode === 'weekly') return { start: subDays(now, 27), end: now };
  return { start: subDays(now, 89), end: now };
}

function getPrevDateRange(mode) {
  const now = new Date();
  if (mode === 'daily') return { start: subDays(now, 13), end: subDays(now, 7) };
  if (mode === 'weekly') return { start: subDays(now, 55), end: subDays(now, 28) };
  return { start: subDays(now, 179), end: subDays(now, 90) };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 shadow-2xl">
      <p className="text-xs font-bold text-slate-200 mb-1.5">{label}</p>
      {payload?.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry?.color || entry?.fill }} />
          <span className="text-xs text-slate-400">{entry?.name}:</span>
          <span className="text-xs font-bold text-white">{entry?.value}</span>
        </div>
      ))}
    </div>
  );
};

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const curr = payload?.find(p => p?.dataKey === 'current');
  const prev = payload?.find(p => p?.dataKey === 'previous');
  const diff = curr?.value != null && prev?.value != null ? curr?.value - prev?.value : null;
  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 shadow-2xl min-w-[140px]">
      <p className="text-xs font-bold text-slate-200 mb-2">{label}</p>
      {curr && (
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="text-xs text-slate-400">Current:</span>
          <span className="text-xs font-bold text-white">{curr?.value}</span>
        </div>
      )}
      {prev && (
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-slate-500" />
          <span className="text-xs text-slate-400">Previous:</span>
          <span className="text-xs font-bold text-slate-300">{prev?.value}</span>
        </div>
      )}
      {diff != null && (
        <div className={`flex items-center gap-1 mt-1.5 pt-1.5 border-t border-slate-700/50`}>
          <Icon name={diff >= 0 ? 'TrendingUp' : 'TrendingDown'} size={11} className={diff >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <span className={`text-xs font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {diff >= 0 ? '+' : ''}{diff}
          </span>
        </div>
      )}
    </div>
  );
};

const RatingTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload?.[0]?.value;
  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 shadow-2xl">
      <p className="text-xs font-bold text-slate-200 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-yellow-400 text-xs">★</span>
        <span className="text-xs text-slate-400">Avg Rating:</span>
        <span className="text-xs font-bold text-white">{val ? Number(val)?.toFixed(1) : '—'}</span>
      </div>
    </div>
  );
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>
      {`${(percent * 100)?.toFixed(0)}%`}
    </text>
  );
};

function buildPeriodBuckets(completions, mode) {
  const { start, end } = getDateRange(mode);
  if (mode === 'daily') {
    return eachDayOfInterval({ start, end })?.map((day) => {
      const label = format(day, 'EEE d');
      const items = completions?.filter((c) => format(new Date(c?.completed_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
      return { label, items };
    });
  } else if (mode === 'weekly') {
    const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
    return weeks?.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const label = format(weekStart, 'MMM d');
      const items = completions?.filter((c) => {
        const d = new Date(c?.completed_at);
        return d >= weekStart && d <= weekEnd;
      });
      return { label, items };
    });
  } else {
    const months = eachMonthOfInterval({ start, end });
    return months?.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      const label = format(monthStart, 'MMM');
      const items = completions?.filter((c) => {
        const d = new Date(c?.completed_at);
        return d >= monthStart && d <= monthEnd;
      });
      return { label, items };
    });
  }
}

function calcPeriodTotal(completions, metric) {
  if (metric === 'completions') return completions?.length;
  if (metric === 'time') return Math.round(completions?.reduce((s, c) => s + (c?.duration_minutes || 0), 0));
  const rated = completions?.filter(c => c?.rating);
  return rated?.length > 0 ? parseFloat((rated?.reduce((s, c) => s + c?.rating, 0) / rated?.length)?.toFixed(1)) : 0;
}

function TrendBadge({ current, previous, unit = '' }) {
  if (previous == null || previous === 0) return null;
  const diff = current - previous;
  const pct = Math.abs(Math.round((diff / previous) * 100));
  const up = diff >= 0;
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${up ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
      <Icon name={up ? 'TrendingUp' : 'TrendingDown'} size={11} />
      {up ? '+' : '-'}{pct}%
    </div>
  );
}

export default function PerformancePage() {
  const { user } = useAuth();
  const [mode, setMode] = useState('weekly');
  const [chartType, setChartType] = useState('bar');
  const [metric, setMetric] = useState('completions');
  const [completions, setCompletions] = useState([]);
  const [prevCompletions, setPrevCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'trends' | 'breakdown'

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      setLoading(true);
      const { start } = getDateRange(mode);
      const { start: prevStart } = getPrevDateRange(mode);
      const [curr, prev] = await Promise.all([
        supabase?.from('task_completions')?.select('*')?.eq('user_id', user?.id)?.gte('completed_at', start?.toISOString())?.order('completed_at', { ascending: true }),
        supabase?.from('task_completions')?.select('*')?.eq('user_id', user?.id)?.gte('completed_at', prevStart?.toISOString())?.lt('completed_at', start?.toISOString())?.order('completed_at', { ascending: true }),
      ]);
      if (!curr?.error && curr?.data) setCompletions(curr?.data);
      if (!prev?.error && prev?.data) setPrevCompletions(prev?.data);
      setLoading(false);
    };
    fetchData();
  }, [user?.id, mode]);

  const stats = useMemo(() => {
    const total = completions?.length;
    const rated = completions?.filter((c) => c?.rating);
    const avgRating = rated?.length > 0 ? parseFloat((rated?.reduce((sum, c) => sum + c?.rating, 0) / rated?.length)?.toFixed(1)) : null;
    const totalMinutes = completions?.reduce((sum, c) => sum + (c?.duration_minutes || 0), 0);
    const totalHours = parseFloat((totalMinutes / 60)?.toFixed(1));
    return { total, avgRating, totalHours, totalMinutes };
  }, [completions]);

  const prevStats = useMemo(() => {
    const total = prevCompletions?.length;
    const rated = prevCompletions?.filter((c) => c?.rating);
    const avgRating = rated?.length > 0 ? parseFloat((rated?.reduce((sum, c) => sum + c?.rating, 0) / rated?.length)?.toFixed(1)) : null;
    const totalMinutes = prevCompletions?.reduce((sum, c) => sum + (c?.duration_minutes || 0), 0);
    const totalHours = parseFloat((totalMinutes / 60)?.toFixed(1));
    return { total, avgRating, totalHours };
  }, [prevCompletions]);

  const activeCategories = useMemo(() => {
    const cats = new Set();
    completions?.forEach((c) => cats?.add(c?.category));
    return Array.from(cats);
  }, [completions]);

  const barDataCompletions = useMemo(() => {
    return buildPeriodBuckets(completions, mode)?.map(({ label, items }) => {
      const byCategory = {};
      items?.forEach((c) => { byCategory[c?.category] = (byCategory?.[c?.category] || 0) + 1; });
      return { label, total: items?.length, ...byCategory };
    });
  }, [completions, mode]);

  const barDataTime = useMemo(() => {
    return buildPeriodBuckets(completions, mode)?.map(({ label, items }) => {
      const byCategory = {};
      items?.forEach((c) => { byCategory[c?.category] = (byCategory?.[c?.category] || 0) + Math.round((c?.duration_minutes || 0)); });
      const total = items?.reduce((s, c) => s + (c?.duration_minutes || 0), 0);
      return { label, total: Math.round(total), ...byCategory };
    });
  }, [completions, mode]);

  const ratingOverTime = useMemo(() => {
    return buildPeriodBuckets(completions, mode)?.map(({ label, items }) => {
      const rated = items?.filter((c) => c?.rating);
      const avg = rated?.length > 0 ? parseFloat((rated?.reduce((s, c) => s + c?.rating, 0) / rated?.length)?.toFixed(2)) : null;
      return { label, avgRating: avg, count: rated?.length };
    });
  }, [completions, mode]);

  // Trend comparison data: current vs previous period side by side
  const trendComparisonData = useMemo(() => {
    const currBuckets = buildPeriodBuckets(completions, mode);
    const prevBuckets = buildPeriodBuckets(prevCompletions, mode);
    return currBuckets?.map((bucket, i) => {
      const prevBucket = prevBuckets?.[i];
      const getCurrVal = () => {
        if (metric === 'completions') return bucket?.items?.length;
        if (metric === 'time') return Math.round(bucket?.items?.reduce((s, c) => s + (c?.duration_minutes || 0), 0));
        const rated = bucket?.items?.filter(c => c?.rating);
        return rated?.length > 0 ? parseFloat((rated?.reduce((s, c) => s + c?.rating, 0) / rated?.length)?.toFixed(1)) : null;
      };
      const getPrevVal = () => {
        if (!prevBucket) return null;
        if (metric === 'completions') return prevBucket?.items?.length;
        if (metric === 'time') return Math.round(prevBucket?.items?.reduce((s, c) => s + (c?.duration_minutes || 0), 0));
        const rated = prevBucket?.items?.filter(c => c?.rating);
        return rated?.length > 0 ? parseFloat((rated?.reduce((s, c) => s + c?.rating, 0) / rated?.length)?.toFixed(1)) : null;
      };
      return { label: bucket?.label, current: getCurrVal(), previous: getPrevVal() };
    });
  }, [completions, prevCompletions, mode, metric]);

  const pieData = useMemo(() => {
    const map = {};
    completions?.forEach((c) => {
      const val = metric === 'time' ? (c?.duration_minutes || 0) : 1;
      map[c?.category] = (map?.[c?.category] || 0) + val;
    });
    return Object.entries(map)
      ?.map(([name, value]) => ({ name, value: Math.round(value), color: CATEGORY_COLORS?.[name] || '#6366f1' }))
      ?.sort((a, b) => b?.value - a?.value);
  }, [completions, metric]);

  const ratingData = useMemo(() => {
    const map = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    completions?.forEach((c) => { if (c?.rating) map[c?.rating]++; });
    return Object.entries(map)?.map(([r, count]) => ({
      label: RATING_LABELS?.[r],
      count,
      color: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']?.[r - 1],
    }));
  }, [completions]);

  // Radar chart: category performance score
  const radarData = useMemo(() => {
    const map = {};
    completions?.forEach((c) => {
      if (!map?.[c?.category]) map[c?.category] = { count: 0, ratingSum: 0, ratedCount: 0, minutes: 0 };
      map[c?.category].count++;
      map[c?.category].minutes += c?.duration_minutes || 0;
      if (c?.rating) { map[c?.category].ratingSum += c?.rating; map[c?.category].ratedCount++; }
    });
    return Object.entries(map)?.map(([cat, d]) => ({
      category: cat?.charAt(0)?.toUpperCase() + cat?.slice(1),
      score: Math.round(
        (d?.count * 20 + (d?.ratedCount > 0 ? (d?.ratingSum / d?.ratedCount) * 10 : 0) + Math.min(d?.minutes / 10, 30)) / 3
      ),
    }))?.sort((a, b) => b?.score - a?.score)?.slice(0, 7);
  }, [completions]);

  const modeLabel = mode === 'daily' ? 'Last 7 days' : mode === 'weekly' ? 'Last 4 weeks' : 'Last 3 months';
  const prevModeLabel = mode === 'daily' ? 'Prior 7 days' : mode === 'weekly' ? 'Prior 4 weeks' : 'Prior 3 months';
  const activeBarData = metric === 'time' ? barDataTime : barDataCompletions;
  const metricUnit = metric === 'time' ? 'min' : metric === 'rating' ? '★' : 'tasks';
  const pieUnit = metric === 'time' ? 'min' : 'tasks';

  const currentTotal = calcPeriodTotal(completions, metric);
  const previousTotal = calcPeriodTotal(prevCompletions, metric);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <TopAppBar title="Performance" onModeToggle={() => {}} onAddTask={() => {}} />
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

          {/* Mode + Chart type row */}
          <div className="flex items-center gap-2">
            <div className="flex bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-1 gap-1 flex-1">
              {MODES?.map((m) => (
                <button
                  key={m?.id}
                  onClick={() => setMode(m?.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    mode === m?.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                  }`}
                >
                  <Icon name={m?.icon} size={13} />
                  {m?.label}
                </button>
              ))}
            </div>
            <div className="flex bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-1 gap-1">
              {CHART_TYPES?.map((ct) => (
                <button
                  key={ct?.id}
                  onClick={() => setChartType(ct?.id)}
                  title={ct?.label}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 ${
                    chartType === ct?.id ? 'bg-indigo-600 text-white' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                  }`}
                >
                  <Icon name={ct?.icon} size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Metric selector */}
          <div className="flex bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-1 gap-1">
            {METRICS?.map((m) => (
              <button
                key={m?.id}
                onClick={() => setMetric(m?.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  metric === m?.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                <Icon name={m?.icon} size={13} />
                {m?.label}
              </button>
            ))}
          </div>

          {/* Summary stats with trend badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Completed', value: stats?.total, prev: prevStats?.total,
                icon: 'CheckCircle', color: 'text-emerald-400', bg: 'bg-emerald-500/10',
              },
              {
                label: 'Avg Rating', value: stats?.avgRating ? `${stats?.avgRating}★` : '—',
                prev: prevStats?.avgRating, rawValue: stats?.avgRating,
                icon: 'Star', color: 'text-yellow-400', bg: 'bg-yellow-500/10',
              },
              {
                label: 'Hours Done', value: stats?.totalHours, prev: prevStats?.totalHours,
                icon: 'Clock', color: 'text-indigo-400', bg: 'bg-indigo-500/10',
              },
            ]?.map((s) => (
              <div key={s?.label} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-3.5 flex flex-col items-center gap-1.5 relative overflow-hidden">
                <div className={`w-9 h-9 rounded-xl ${s?.bg} flex items-center justify-center`}>
                  <Icon name={s?.icon} size={17} className={s?.color} />
                </div>
                <p className="text-lg font-black text-[var(--color-foreground)] leading-none">{s?.value ?? 0}</p>
                <p className="text-[10px] text-[var(--color-muted-foreground)] font-medium">{s?.label}</p>
                {s?.prev != null && s?.prev !== 0 && (
                  <TrendBadge current={s?.rawValue ?? s?.value} previous={s?.prev} />
                )}
              </div>
            ))}
          </div>

          {/* Tab navigation */}
          <div className="flex bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-1 gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
              { id: 'trends', label: 'Trends', icon: 'TrendingUp' },
              { id: 'breakdown', label: 'Breakdown', icon: 'PieChart' },
            ]?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === tab?.id ? 'bg-slate-700 text-white shadow-sm' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                <Icon name={tab?.icon} size={12} />
                {tab?.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : completions?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center">
                <Icon name="BarChart2" size={28} className="text-[var(--color-muted-foreground)]" />
              </div>
              <p className="text-[var(--color-foreground)] font-bold">No data yet</p>
              <p className="text-sm text-[var(--color-muted-foreground)] text-center max-w-xs">
                Complete tasks and rate them to see your performance here.
              </p>
            </div>
          ) : (
            <>
              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'overview' && (
                <>
                  {/* Main chart */}
                  <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-black text-[var(--color-foreground)]">
                          {metric === 'completions' ? 'Tasks Completed' : metric === 'time' ? 'Time Spent (min)' : 'Avg Rating Over Time'}
                        </h3>
                        <p className="text-xs text-[var(--color-muted-foreground)]">{modeLabel}</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <span className="text-xs font-black text-indigo-400">{currentTotal}</span>
                        <span className="text-[10px] text-indigo-400/70">{metricUnit}</span>
                      </div>
                    </div>

                    {metric === 'rating' ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={ratingOverTime} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                          <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                          <Tooltip content={<RatingTooltip />} />
                          <ReferenceLine y={3} stroke="#6366f1" strokeDasharray="4 4" strokeOpacity={0.5} />
                          <Area type="monotone" dataKey="avgRating" name="Avg Rating" stroke="#eab308" strokeWidth={2.5} fill="url(#ratingGrad)" dot={{ fill: '#eab308', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : chartType === 'bar' ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={activeBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          {activeCategories?.map((cat, idx) => (
                            <Bar key={cat} dataKey={cat} name={cat} stackId="a" fill={CATEGORY_COLORS?.[cat] || '#6366f1'} radius={idx === activeCategories?.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    ) : chartType === 'area' ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={activeBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <defs>
                            {activeCategories?.map((cat) => (
                              <linearGradient key={cat} id={`grad_${cat}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CATEGORY_COLORS?.[cat] || '#6366f1'} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={CATEGORY_COLORS?.[cat] || '#6366f1'} stopOpacity={0} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          {activeCategories?.map((cat) => (
                            <Area key={cat} type="monotone" dataKey={cat} name={cat} stackId="a" stroke={CATEGORY_COLORS?.[cat] || '#6366f1'} fill={`url(#grad_${cat})`} strokeWidth={1.5} />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={85}
                            innerRadius={35}
                            dataKey="value"
                            labelLine={false}
                            label={CustomPieLabel}
                          >
                            {pieData?.map((entry, index) => (
                              <Cell key={index} fill={entry?.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Rating distribution */}
                  {ratingData?.some((r) => r?.count > 0) && (
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4">
                      <h3 className="text-sm font-black text-[var(--color-foreground)] mb-3">Completion Quality</h3>
                      <ResponsiveContainer width="100%" height={130}>
                        <BarChart data={ratingData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="count" name="Tasks" radius={[4, 4, 0, 0]}>
                            {ratingData?.map((entry, index) => (
                              <Cell key={index} fill={entry?.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Recent notes */}
                  {completions?.filter((c) => c?.completion_notes)?.length > 0 && (
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4">
                      <h3 className="text-sm font-black text-[var(--color-foreground)] mb-3">Recent Notes</h3>
                      <div className="space-y-3">
                        {completions?.filter((c) => c?.completion_notes)?.slice(-5)?.reverse()?.map((c) => (
                          <div key={c?.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: (CATEGORY_COLORS?.[c?.category] || '#6366f1') + '22' }}>
                              <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS?.[c?.category] || '#6366f1' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-bold text-[var(--color-foreground)] truncate">{c?.title}</span>
                                {c?.rating && <span className="text-xs text-yellow-400 flex-shrink-0">{'★'?.repeat(c?.rating)}</span>}
                                {c?.duration_minutes > 0 && <span className="text-xs text-indigo-400 flex-shrink-0">{c?.duration_minutes}min</span>}
                              </div>
                              <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">{c?.completion_notes}</p>
                              <p className="text-[10px] text-[var(--color-muted-foreground)]/60 mt-0.5">{format(new Date(c?.completed_at), 'MMM d, h:mm a')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── TRENDS TAB ── */}
              {activeTab === 'trends' && (
                <>
                  {/* Period comparison header */}
                  <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-black text-[var(--color-foreground)]">Period Comparison</h3>
                    </div>
                    <p className="text-xs text-[var(--color-muted-foreground)] mb-4">
                      {modeLabel} vs {prevModeLabel}
                    </p>

                    {/* Side-by-side totals */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3">
                        <p className="text-[10px] text-indigo-400/70 font-semibold uppercase tracking-wider mb-1">{modeLabel}</p>
                        <p className="text-2xl font-black text-indigo-400">{currentTotal}</p>
                        <p className="text-[10px] text-indigo-400/60">{metricUnit}</p>
                      </div>
                      <div className="rounded-xl bg-slate-700/30 border border-slate-600/30 p-3">
                        <p className="text-[10px] text-slate-400/70 font-semibold uppercase tracking-wider mb-1">{prevModeLabel}</p>
                        <p className="text-2xl font-black text-slate-400">{previousTotal}</p>
                        <p className="text-[10px] text-slate-400/60">{metricUnit}</p>
                      </div>
                    </div>

                    {/* Change indicator */}
                    {previousTotal > 0 && (
                      <div className={`flex items-center gap-2 p-3 rounded-xl ${currentTotal >= previousTotal ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <Icon name={currentTotal >= previousTotal ? 'TrendingUp' : 'TrendingDown'} size={18} className={currentTotal >= previousTotal ? 'text-emerald-400' : 'text-red-400'} />
                        <div>
                          <p className={`text-sm font-black ${currentTotal >= previousTotal ? 'text-emerald-400' : 'text-red-400'}`}>
                            {currentTotal >= previousTotal ? '+' : ''}{currentTotal - previousTotal} {metricUnit}
                            {' '}({Math.abs(Math.round(((currentTotal - previousTotal) / previousTotal) * 100))}%)
                          </p>
                          <p className="text-[10px] text-[var(--color-muted-foreground)]">
                            {currentTotal >= previousTotal ? 'Improvement from last period' : 'Decline from last period'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Comparison line chart */}
                    <div className="mt-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={trendComparisonData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="currGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#818cf8" />
                              <stop offset="100%" stopColor="#a78bfa" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} allowDecimals={metric === 'rating'} />
                          <Tooltip content={<TrendTooltip />} />
                          <Line type="monotone" dataKey="previous" name="Previous" stroke="#475569" strokeWidth={2} strokeDasharray="5 3" dot={{ fill: '#475569', r: 3, strokeWidth: 0 }} connectNulls={false} />
                          <Line type="monotone" dataKey="current" name="Current" stroke="url(#currGrad)" strokeWidth={2.5} dot={{ fill: '#818cf8', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#a78bfa' }} connectNulls={false} />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="flex items-center justify-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-0.5 bg-indigo-400 rounded" />
                          <span className="text-[10px] text-[var(--color-muted-foreground)]">Current</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-0.5 bg-slate-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #64748b 0, #64748b 4px, transparent 4px, transparent 7px)' }} />
                          <span className="text-[10px] text-[var(--color-muted-foreground)]">Previous</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category performance radar */}
                  {radarData?.length >= 3 && (
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4">
                      <h3 className="text-sm font-black text-[var(--color-foreground)] mb-1">Category Performance Score</h3>
                      <p className="text-xs text-[var(--color-muted-foreground)] mb-3">Based on completions, ratings & time</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                          <PolarGrid stroke="var(--color-border)" />
                          <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
                          <PolarRadiusAxis tick={false} axisLine={false} />
                          <Radar name="Score" dataKey="score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} strokeWidth={2} />
                          <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Rating trend */}
                  {ratingOverTime?.some(r => r?.avgRating != null) && (
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4">
                      <h3 className="text-sm font-black text-[var(--color-foreground)] mb-1">Rating Trend</h3>
                      <p className="text-xs text-[var(--color-muted-foreground)] mb-3">Average rating per period</p>
                      <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={ratingOverTime} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="ratingGrad2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                          <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                          <Tooltip content={<RatingTooltip />} />
                          <ReferenceLine y={3} stroke="#6366f1" strokeDasharray="4 4" strokeOpacity={0.5} />
                          <Area type="monotone" dataKey="avgRating" name="Avg Rating" stroke="#eab308" strokeWidth={2.5} fill="url(#ratingGrad2)" dot={{ fill: '#eab308', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}

              {/* ── BREAKDOWN TAB ── */}
              {activeTab === 'breakdown' && (
                <>
                  {/* Donut pie */}
                  <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4">
                    <h3 className="text-sm font-black text-[var(--color-foreground)] mb-1">Category Distribution</h3>
                    <p className="text-xs text-[var(--color-muted-foreground)] mb-3">
                      {metric === 'time' ? 'By time spent (min)' : 'By tasks completed'}
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} innerRadius={40} dataKey="value" labelLine={false} label={CustomPieLabel}>
                          {pieData?.map((entry, index) => (
                            <Cell key={index} fill={entry?.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Areas worked on */}
                  <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4">
                    <h3 className="text-sm font-black text-[var(--color-foreground)] mb-3">Areas Worked On</h3>
                    <div className="space-y-2.5">
                      {pieData?.map((item) => {
                        const total = pieData?.reduce((s, i) => s + i?.value, 0);
                        const pct = total > 0 ? Math.round((item?.value / total) * 100) : 0;
                        return (
                          <div key={item?.name} className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item?.color }} />
                            <span className="text-sm text-[var(--color-foreground)] capitalize flex-1 font-medium">{item?.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 rounded-full bg-[var(--color-muted)] overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: item?.color }} />
                              </div>
                              <span className="text-xs font-bold text-[var(--color-muted-foreground)] w-14 text-right">
                                {item?.value} {pieUnit}
                              </span>
                              <span className="text-[10px] text-[var(--color-muted-foreground)]/60 w-8 text-right">{pct}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Per-category rating breakdown */}
                  {(() => {
                    const catRatings = {};
                    completions?.forEach((c) => {
                      if (!catRatings?.[c?.category]) catRatings[c?.category] = { sum: 0, count: 0, total: 0 };
                      catRatings[c?.category].total++;
                      if (c?.rating) { catRatings[c?.category].sum += c?.rating; catRatings[c?.category].count++; }
                    });
                    const rows = Object.entries(catRatings)
                      ?.filter(([, d]) => d?.count > 0)
                      ?.map(([cat, d]) => ({ cat, avg: parseFloat((d?.sum / d?.count)?.toFixed(1)), count: d?.count, total: d?.total }))
                      ?.sort((a, b) => b?.avg - a?.avg);
                    if (!rows?.length) return null;
                    return (
                      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4">
                        <h3 className="text-sm font-black text-[var(--color-foreground)] mb-3">Avg Rating by Category</h3>
                        <div className="space-y-2.5">
                          {rows?.map(({ cat, avg, count }) => (
                            <div key={cat} className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS?.[cat] || '#6366f1' }} />
                              <span className="text-sm text-[var(--color-foreground)] capitalize flex-1 font-medium">{cat}</span>
                              <div className="flex items-center gap-1.5">
                                <div className="w-16 h-1.5 rounded-full bg-[var(--color-muted)] overflow-hidden">
                                  <div className="h-full rounded-full bg-yellow-400" style={{ width: `${(avg / 5) * 100}%` }} />
                                </div>
                                <span className="text-xs font-black text-yellow-400">{avg}★</span>
                                <span className="text-[10px] text-[var(--color-muted-foreground)]/60">({count})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </>
          )}
        </div>
      </div>
      <BottomTabNavigation />
    </div>
  );
}
