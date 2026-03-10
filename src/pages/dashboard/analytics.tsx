import { useEffect, useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import clsx from 'clsx';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import {
  LineChart,
  HorizontalBarChart,
  DonutChart,
  VerticalBarChart,
} from '../../components/dashboard/Charts';

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
interface AnalyticsData {
  configured: boolean;
  message?: string;
  error?: string;
  overview?: {
    activeUsers: number;
    pageViews: number;
    sessions: number;
    avgSessionDuration: number;
    bounceRate: number;
    newUsers: number;
  };
  daily?: Array<{
    date: string;
    visitors: number;
    pageViews: number;
    sessions: number;
  }>;
  topPages?: Array<{
    path: string;
    views: number;
    users: number;
  }>;
  trafficSources?: Array<{
    channel: string;
    sessions: number;
  }>;
  devices?: Array<{
    device: string;
    sessions: number;
  }>;
  countries?: Array<{
    country: string;
    users: number;
  }>;
}

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */
const CHART_COLORS = [
  '#FB2576', '#3B82F6', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444',
];

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#3B82F6',
  mobile: '#FB2576',
  tablet: '#10B981',
};

const CHANNEL_COLORS: Record<string, string> = {
  'Organic Search': '#10B981',
  'Direct': '#3B82F6',
  'Organic Social': '#EC4899',
  'Referral': '#F59E0B',
  'Paid Search': '#8B5CF6',
  'Email': '#06B6D4',
  'Display': '#EF4444',
  'Unassigned': '#6B7280',
};

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDateLabel(dateStr: string): string {
  if (dateStr.length === 8) {
    const month = parseInt(dateStr.slice(4, 6)) - 1;
    const day = parseInt(dateStr.slice(6, 8));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[month]} ${day}`;
  }
  return dateStr;
}

function formatFullDate(dateStr: string): string {
  if (dateStr.length === 8) {
    const year = dateStr.slice(0, 4);
    const month = parseInt(dateStr.slice(4, 6)) - 1;
    const day = parseInt(dateStr.slice(6, 8));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[month]} ${day}, ${year}`;
  }
  return dateStr;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

/* ═══════════════════════════════════════════════════════
   SHARED UI COMPONENTS
   ═══════════════════════════════════════════════════════ */

function MetricCard({
  label,
  value,
  subtitle,
  change,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  change?: number | null;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 border-l-2 ${color} hover:bg-zinc-900/60 transition-colors`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{label}</p>
        <div className="text-zinc-500">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-zinc-100 tracking-tight">{value}</p>
      <div className="mt-1.5 flex items-center gap-2">
        {change !== undefined && change !== null && (
          <span className={clsx(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded',
            change > 0 ? 'text-emerald-400 bg-emerald-500/10' : change < 0 ? 'text-red-400 bg-red-500/10' : 'text-zinc-500 bg-zinc-800',
          )}>
            {change > 0 ? '↑' : change < 0 ? '↓' : '—'} {Math.abs(change)}%
          </span>
        )}
        {subtitle && <p className="text-[11px] text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  noPadding = false,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/40 ${noPadding ? '' : 'p-5'} ${className}`}>
      <div className={`flex items-start justify-between mb-4 ${noPadding ? 'px-5 pt-5' : ''}`}>
        <div>
          <h3 className="text-[13px] font-semibold text-zinc-200 tracking-tight">{title}</h3>
          {subtitle && <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={noPadding ? '' : ''}>{children}</div>
    </div>
  );
}

function TimePicker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-zinc-800/40 border border-zinc-800/60 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'px-2.5 py-1 text-[11px] rounded-md transition-all duration-150',
            value === opt.value
              ? 'bg-zinc-700 text-zinc-200 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-[13px] text-zinc-600 py-8 text-center">{message}</p>;
}

/* ═══════════════════════════════════════════════════════
   SETUP CARD
   ═══════════════════════════════════════════════════════ */
function SetupCard() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 p-8 text-center max-w-xl mx-auto mt-8">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">Connect Google Analytics</h3>
      <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
        Set up Google Analytics Data API to see visitor stats, pageviews, traffic sources, and more.
      </p>
      <div className="text-left max-w-lg mx-auto space-y-3">
        {[
          { step: '1', text: 'Go to Google Cloud Console → enable the "Google Analytics Data API"' },
          { step: '2', text: 'Create a Service Account and download the JSON key' },
          { step: '3', text: 'Add the service account email as a Viewer in GA4 Admin → Property Access' },
          { step: '4', text: 'Add these environment variables:' },
        ].map((item) => (
          <div key={item.step} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold flex items-center justify-center">
              {item.step}
            </span>
            <p className="text-xs text-zinc-400">{item.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 ml-8 rounded-lg bg-zinc-800/50 p-3 text-left">
        <code className="text-[11px] text-zinc-300 block space-y-0.5">
          <span className="block"><span className="text-primary">GA_PROPERTY_ID</span>=your-numeric-property-id</span>
          <span className="block"><span className="text-primary">GA_CLIENT_EMAIL</span>=service-account@project.iam.gserviceaccount.com</span>
          <span className="block"><span className="text-primary">GA_PRIVATE_KEY</span>=&quot;-----BEGIN PRIVATE KEY-----\n...&quot;</span>
        </code>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'sources' | 'geo'>('overview');

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/dashboard/analytics')
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(() => setAnalytics({ configured: false }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const gaConfigured = analytics?.configured && !analytics?.error;
  const ov = analytics?.overview;
  const daily = analytics?.daily || [];

  /* ── Computed metrics ── */
  const computed = useMemo(() => {
    if (!daily.length || !ov) return null;

    const sliceStart = timeRange === '7d' ? Math.max(daily.length - 7, 0) : timeRange === '14d' ? Math.max(daily.length - 14, 0) : 0;
    const filtered = daily.slice(sliceStart);
    const labels = filtered.map((d) => formatDateLabel(d.date));
    const visitors = filtered.map((d) => d.visitors);
    const pageViews = filtered.map((d) => d.pageViews);
    const sessions = filtered.map((d) => d.sessions);

    const totalVisitors = visitors.reduce((a, b) => a + b, 0);
    const totalPageViews = pageViews.reduce((a, b) => a + b, 0);
    const totalSessions = sessions.reduce((a, b) => a + b, 0);
    const avgVisitors = filtered.length > 0 ? Math.round(totalVisitors / filtered.length) : 0;
    const avgPageViews = filtered.length > 0 ? Math.round(totalPageViews / filtered.length) : 0;
    const peakVisitors = Math.max(...visitors, 0);
    const peakDay = filtered[visitors.indexOf(peakVisitors)]?.date || '';
    const pagesPerSession = totalSessions > 0 ? (totalPageViews / totalSessions).toFixed(1) : '0';

    // Compare first half vs second half for trend
    const mid = Math.floor(filtered.length / 2);
    const firstHalf = filtered.slice(0, mid);
    const secondHalf = filtered.slice(mid);
    const firstVisitors = firstHalf.reduce((a, b) => a + b.visitors, 0);
    const secondVisitors = secondHalf.reduce((a, b) => a + b.visitors, 0);
    const visitorsTrend = pctChange(secondVisitors, firstVisitors);
    const firstPV = firstHalf.reduce((a, b) => a + b.pageViews, 0);
    const secondPV = secondHalf.reduce((a, b) => a + b.pageViews, 0);
    const pvTrend = pctChange(secondPV, firstPV);

    // Daily bar chart data
    const barData = filtered.map((d) => ({
      label: formatDateLabel(d.date),
      value: d.sessions,
    }));

    return {
      labels, visitors, pageViews, sessions, filtered,
      totalVisitors, totalPageViews, totalSessions,
      avgVisitors, avgPageViews, peakVisitors, peakDay,
      pagesPerSession, visitorsTrend, pvTrend, barData,
    };
  }, [daily, ov, timeRange]);

  /* ── Traffic source items ── */
  const trafficItems = useMemo(() => {
    const sources = analytics?.trafficSources || [];
    const total = sources.reduce((a, b) => a + b.sessions, 0) || 1;
    return sources.map((s, i) => ({
      label: s.channel,
      value: s.sessions,
      percentage: Math.round((s.sessions / total) * 100),
      color: CHANNEL_COLORS[s.channel] || CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [analytics?.trafficSources]);

  /* ── Device items ── */
  const deviceItems = useMemo(() => {
    return (analytics?.devices || []).map((d) => ({
      label: d.device.charAt(0).toUpperCase() + d.device.slice(1),
      value: d.sessions,
      color: DEVICE_COLORS[d.device.toLowerCase()] || '#8B5CF6',
    }));
  }, [analytics?.devices]);

  /* ── Page items ── */
  const topPages = analytics?.topPages || [];
  const totalPageViewsAll = topPages.reduce((a, b) => a + b.views, 0) || 1;

  /* ── Country items ── */
  const countries = analytics?.countries || [];
  const totalCountryUsers = countries.reduce((a, b) => a + b.users, 0) || 1;

  const timeOptions = [
    { value: '7d', label: '7 days' },
    { value: '14d', label: '14 days' },
    { value: '30d', label: '30 days' },
  ];

  return (
    <DashboardLayout title="Analytics">
      <Head><title>Analytics — Dashboard</title></Head>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-primary" />
          <span className="text-sm text-zinc-500">Loading analytics data...</span>
        </div>
      ) : !gaConfigured ? (
        <SetupCard />
      ) : (
        <div className="space-y-6">

          {/* ──────── HEADER ──────── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Site Analytics</h2>
              <p className="mt-1 text-[13px] text-zinc-500">
                Google Analytics data · Last updated just now
              </p>
            </div>
            <div className="flex items-center gap-3">
              <TimePicker value={timeRange} onChange={setTimeRange} options={timeOptions} />
              <button
                onClick={fetchData}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-all flex items-center gap-1.5 rounded-lg border border-zinc-800/80 px-2.5 py-1.5 hover:bg-white/[0.04]"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* ──────── TAB NAV ──────── */}
          <div className="flex items-center gap-1 border-b border-zinc-800/60 pb-0">
            {([
              { id: 'overview' as const, label: 'Overview' },
              { id: 'pages' as const, label: 'Pages' },
              { id: 'sources' as const, label: 'Traffic Sources' },
              { id: 'geo' as const, label: 'Geography & Devices' },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'relative px-4 py-2.5 text-[13px] font-medium transition-colors',
                  activeTab === tab.id
                    ? 'text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300',
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-t-full bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* ════════════════════════════════════════════
             TAB: OVERVIEW
             ════════════════════════════════════════════ */}
          {activeTab === 'overview' && ov && computed && (
            <div className="space-y-6">

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                <MetricCard
                  label="Visitors"
                  value={ov.activeUsers.toLocaleString()}
                  subtitle={`${ov.newUsers} new`}
                  change={computed.visitorsTrend}
                  color="border-l-blue-500/40"
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
                />
                <MetricCard
                  label="Page Views"
                  value={ov.pageViews.toLocaleString()}
                  change={computed.pvTrend}
                  color="border-l-primary/40"
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                />
                <MetricCard
                  label="Sessions"
                  value={ov.sessions.toLocaleString()}
                  color="border-l-emerald-500/40"
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>}
                />
                <MetricCard
                  label="Avg. Duration"
                  value={formatDuration(ov.avgSessionDuration)}
                  subtitle="per session"
                  color="border-l-amber-500/40"
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <MetricCard
                  label="Bounce Rate"
                  value={`${Math.round(ov.bounceRate * 100)}%`}
                  subtitle={`${Math.round((1 - ov.bounceRate) * 100)}% engaged`}
                  color="border-l-red-500/40"
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>}
                />
                <MetricCard
                  label="Pages / Session"
                  value={computed.pagesPerSession}
                  subtitle={`${ov.newUsers} new users`}
                  color="border-l-purple-500/40"
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
                />
              </div>

              {/* Summary strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-800/20 px-4 py-3">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Avg. Daily Visitors</p>
                  <p className="mt-1 text-lg font-bold text-zinc-100 tabular-nums">{computed.avgVisitors}</p>
                </div>
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-800/20 px-4 py-3">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Avg. Daily Views</p>
                  <p className="mt-1 text-lg font-bold text-zinc-100 tabular-nums">{computed.avgPageViews}</p>
                </div>
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-800/20 px-4 py-3">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Peak Visitors</p>
                  <p className="mt-1 text-lg font-bold text-zinc-100 tabular-nums">{computed.peakVisitors}</p>
                  {computed.peakDay && <p className="text-[10px] text-zinc-500 mt-0.5">{formatFullDate(computed.peakDay)}</p>}
                </div>
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-800/20 px-4 py-3">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Total Sessions</p>
                  <p className="mt-1 text-lg font-bold text-zinc-100 tabular-nums">{computed.totalSessions.toLocaleString()}</p>
                </div>
              </div>

              {/* Visitors & Page Views Line Chart */}
              <Card title="Visitors & Page Views Over Time" subtitle={`${timeRange === '7d' ? 'Last 7' : timeRange === '14d' ? 'Last 14' : 'Last 30'} days trend`}>
                {computed.labels.length > 0 ? (
                  <LineChart
                    labels={computed.labels}
                    datasets={[
                      { label: 'Visitors', data: computed.visitors, color: '#3B82F6' },
                      { label: 'Page Views', data: computed.pageViews, color: '#FB2576' },
                      { label: 'Sessions', data: computed.sessions, color: '#10B981' },
                    ]}
                    height={280}
                  />
                ) : (
                  <EmptyState message="No daily data available" />
                )}
              </Card>

              {/* Sessions Bar Chart */}
              <Card title="Daily Sessions" subtitle="Sessions per day breakdown">
                {computed.barData.length > 0 ? (
                  <VerticalBarChart data={computed.barData} color="#3B82F6" height={140} />
                ) : (
                  <EmptyState message="No session data" />
                )}
              </Card>
            </div>
          )}

          {/* ════════════════════════════════════════════
             TAB: PAGES
             ════════════════════════════════════════════ */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <Card title="Top Pages" subtitle={`${topPages.length} pages tracked · Sorted by page views`}>
                {topPages.length > 0 ? (
                  <div>
                    {/* Table header */}
                    <div className="grid grid-cols-12 gap-3 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 border-b border-zinc-800/40">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">Page Path</div>
                      <div className="col-span-2 text-right">Views</div>
                      <div className="col-span-2 text-right">Users</div>
                      <div className="col-span-2 text-right">% of Total</div>
                    </div>
                    {/* Table rows */}
                    {topPages.map((page, i) => {
                      const pct = Math.round((page.views / totalPageViewsAll) * 100);
                      return (
                        <div key={i} className="grid grid-cols-12 gap-3 px-3 py-2.5 text-sm border-b border-zinc-800/20 hover:bg-zinc-800/20 transition-colors">
                          <div className="col-span-1 text-[11px] text-zinc-600 tabular-nums">{i + 1}</div>
                          <div className="col-span-5 text-[12px] text-zinc-200 truncate font-mono" title={page.path}>
                            {page.path === '/' ? 'Home (/)' : page.path}
                          </div>
                          <div className="col-span-2 text-right text-[12px] text-zinc-100 font-semibold tabular-nums">
                            {page.views.toLocaleString()}
                          </div>
                          <div className="col-span-2 text-right text-[12px] text-zinc-400 tabular-nums">
                            {page.users.toLocaleString()}
                          </div>
                          <div className="col-span-2 text-right flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[11px] text-zinc-500 tabular-nums w-8 text-right">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState message="No page data available" />
                )}
              </Card>

              {/* Pages Bar Chart visual */}
              <Card title="Page Views Distribution" subtitle="Visual comparison of top pages">
                {topPages.length > 0 ? (
                  <HorizontalBarChart
                    items={topPages.map((p) => ({
                      label: p.path === '/' ? 'Home (/)' : p.path,
                      value: p.views,
                      secondaryValue: p.users,
                    }))}
                    color="#FB2576"
                    maxItems={10}
                  />
                ) : (
                  <EmptyState message="No page data" />
                )}
              </Card>
            </div>
          )}

          {/* ════════════════════════════════════════════
             TAB: TRAFFIC SOURCES
             ════════════════════════════════════════════ */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut */}
                <Card title="Traffic Channels" subtitle="Session distribution by channel">
                  {trafficItems.length > 0 ? (
                    <DonutChart
                      items={trafficItems}
                      size={180}
                      centerValue={ov?.sessions.toLocaleString()}
                      centerLabel="sessions"
                    />
                  ) : (
                    <EmptyState message="No source data" />
                  )}
                </Card>

                {/* Table */}
                <Card title="Channel Breakdown" subtitle="Detailed traffic source metrics">
                  {trafficItems.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 border-b border-zinc-800/40">
                        <div className="col-span-5">Channel</div>
                        <div className="col-span-3 text-right">Sessions</div>
                        <div className="col-span-4 text-right">Share</div>
                      </div>
                      {trafficItems.map((item, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-zinc-800/20 hover:bg-zinc-800/20 transition-colors">
                          <div className="col-span-5 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-[12px] text-zinc-200 truncate">{item.label}</span>
                          </div>
                          <div className="col-span-3 text-right text-[12px] text-zinc-100 font-semibold tabular-nums">
                            {item.value.toLocaleString()}
                          </div>
                          <div className="col-span-4 text-right flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                            </div>
                            <span className="text-[11px] text-zinc-500 tabular-nums w-8 text-right">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No source data" />
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
             TAB: GEOGRAPHY & DEVICES
             ════════════════════════════════════════════ */}
          {activeTab === 'geo' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Devices Donut */}
                <Card title="Device Categories" subtitle="Sessions by device type">
                  {deviceItems.length > 0 ? (
                    <div className="space-y-5">
                      <DonutChart
                        items={deviceItems}
                        size={180}
                        centerValue={`${Math.round(((analytics?.devices?.find((d) => d.device === 'mobile')?.sessions || 0) / Math.max(ov?.sessions || 1, 1)) * 100)}%`}
                        centerLabel="mobile"
                      />
                      {/* Device detail cards */}
                      <div className="grid grid-cols-3 gap-2">
                        {deviceItems.map((d) => {
                          const total = deviceItems.reduce((a, b) => a + b.value, 0) || 1;
                          return (
                            <div key={d.label} className="rounded-xl border border-zinc-800/60 bg-zinc-800/20 px-3 py-2.5 text-center">
                              <div className="w-2 h-2 rounded-full mx-auto mb-1.5" style={{ backgroundColor: d.color }} />
                              <p className="text-lg font-bold text-zinc-100 tabular-nums">{d.value.toLocaleString()}</p>
                              <p className="text-[10px] text-zinc-500">{d.label} · {Math.round((d.value / total) * 100)}%</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <EmptyState message="No device data" />
                  )}
                </Card>

                {/* Countries */}
                <Card title="Top Countries" subtitle={`${countries.length} countries tracked`}>
                  {countries.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 border-b border-zinc-800/40">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">Country</div>
                        <div className="col-span-3 text-right">Users</div>
                        <div className="col-span-3 text-right">Share</div>
                      </div>
                      {countries.map((country, i) => {
                        const pct = Math.round((country.users / totalCountryUsers) * 100);
                        return (
                          <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-zinc-800/20 hover:bg-zinc-800/20 transition-colors">
                            <div className="col-span-1 text-[11px] text-zinc-600 tabular-nums">{i + 1}</div>
                            <div className="col-span-5 text-[12px] text-zinc-200">{country.country}</div>
                            <div className="col-span-3 text-right text-[12px] text-zinc-100 font-semibold tabular-nums">
                              {country.users.toLocaleString()}
                            </div>
                            <div className="col-span-3 text-right flex items-center justify-end gap-2">
                              <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[11px] text-zinc-500 tabular-nums w-8 text-right">{pct}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState message="No country data" />
                  )}
                </Card>
              </div>

              {/* Countries bar chart */}
              <Card title="Users by Country" subtitle="Visual comparison">
                {countries.length > 0 ? (
                  <HorizontalBarChart
                    items={countries.map((c) => ({ label: c.country, value: c.users }))}
                    color="#3B82F6"
                    maxItems={10}
                  />
                ) : (
                  <EmptyState message="No country data" />
                )}
              </Card>
            </div>
          )}

          {/* ──────── DAILY DATA TABLE (always visible at bottom) ──────── */}
          {computed && computed.filtered.length > 0 && (
            <Card title="Daily Breakdown" subtitle={`${computed.filtered.length} days of data`} noPadding>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Table header */}
                  <div className="grid grid-cols-5 gap-3 px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 border-b border-zinc-800/40">
                    <div>Date</div>
                    <div className="text-right">Visitors</div>
                    <div className="text-right">Page Views</div>
                    <div className="text-right">Sessions</div>
                    <div className="text-right">Views / Visitor</div>
                  </div>
                  {/* Rows */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {[...computed.filtered].reverse().map((day, i) => {
                      const ratio = day.visitors > 0 ? (day.pageViews / day.visitors).toFixed(1) : '0';
                      return (
                        <div key={i} className="grid grid-cols-5 gap-3 px-5 py-2 text-[12px] border-b border-zinc-800/20 hover:bg-zinc-800/20 transition-colors">
                          <div className="text-zinc-300">{formatFullDate(day.date)}</div>
                          <div className="text-right text-zinc-100 font-semibold tabular-nums">{day.visitors}</div>
                          <div className="text-right text-zinc-100 font-semibold tabular-nums">{day.pageViews}</div>
                          <div className="text-right text-zinc-400 tabular-nums">{day.sessions}</div>
                          <div className="text-right text-zinc-400 tabular-nums">{ratio}</div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Totals footer */}
                  <div className="grid grid-cols-5 gap-3 px-5 py-2.5 text-[12px] border-t border-zinc-700/40 bg-zinc-800/20">
                    <div className="text-zinc-400 font-semibold">Total</div>
                    <div className="text-right text-zinc-100 font-bold tabular-nums">{computed.totalVisitors.toLocaleString()}</div>
                    <div className="text-right text-zinc-100 font-bold tabular-nums">{computed.totalPageViews.toLocaleString()}</div>
                    <div className="text-right text-zinc-200 font-bold tabular-nums">{computed.totalSessions.toLocaleString()}</div>
                    <div className="text-right text-zinc-400 font-semibold tabular-nums">
                      {computed.totalVisitors > 0 ? (computed.totalPageViews / computed.totalVisitors).toFixed(1) : '0'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

        </div>
      )}
    </DashboardLayout>
  );
}
