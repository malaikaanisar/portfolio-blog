import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import {
  LineChart,
  HorizontalBarChart,
  DonutChart,
  VerticalBarChart,
} from '../../components/dashboard/Charts';
import { formatDistanceToNow } from 'date-fns';

/* ─── Types ─── */
interface CommentStats {
  totalComments: number;
  recentCount: number;
  recentComments: Array<{
    _id: string;
    slug: string;
    name: string;
    comment: string;
    avatar: string;
    createdAt: string;
  }>;
  commentsByPost: Array<{ _id: string; count: number }>;
  dailyComments: Array<{ _id: string; count: number }>;
}

interface BlogStats {
  totalBlogs: number;
  totalTags: number;
  latestBlog: string;
}

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

/* ─── Color palette ─── */
const CHART_COLORS = [
  '#FB2576',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#EF4444',
];

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#3B82F6',
  mobile: '#FB2576',
  tablet: '#10B981',
};

/* ─── Helper ─── */
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

/* ─── Stat Card ─── */
function StatCard({
  label,
  value,
  subtitle,
  icon,
  color = 'primary',
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'emerald' | 'amber' | 'blue' | 'purple';
}) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-3xl font-bold text-zinc-100">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-emerald-400">{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

/* ─── Section Card Wrapper ─── */
function SectionCard({
  title,
  action,
  children,
  className = '',
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ─── GA Setup Card ─── */
function AnalyticsSetupCard() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">Connect Google Analytics</h3>
      <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
        Set up Google Analytics Data API to see visitor stats, pageviews, traffic sources, and more right on your dashboard.
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
      <p className="mt-4 text-[11px] text-zinc-600">
        Find your Property ID in Google Analytics → Admin → Property Settings
      </p>
    </div>
  );
}

/* ─── Main Page ─── */
export default function DashboardOverview() {
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('30d');

  const fetchData = useCallback(() => {
    setLoading(true);
    setAnalyticsLoading(true);

    Promise.all([
      fetch('/api/dashboard/stats').then((r) => r.json()),
      fetch('/api/dashboard/blogs').then((r) => r.json()),
    ])
      .then(([statsData, blogsData]) => {
        setStats(statsData);
        setBlogStats({
          totalBlogs: blogsData.total || 0,
          totalTags: blogsData.totalTags || 0,
          latestBlog: blogsData.blogs?.[0]?.title || 'N/A',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch('/api/dashboard/analytics')
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(() => setAnalytics({ configured: false }))
      .finally(() => setAnalyticsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const gaConfigured = analytics?.configured && !analytics?.error;

  const dailyChartLabels = analytics?.daily?.map((d) => formatDateLabel(d.date)) || [];
  const dailyVisitors = analytics?.daily?.map((d) => d.visitors) || [];
  const dailyPageViews = analytics?.daily?.map((d) => d.pageViews) || [];

  const sliceStart = timeRange === '7d' ? Math.max(dailyChartLabels.length - 7, 0) : 0;
  const filteredLabels = dailyChartLabels.slice(sliceStart);
  const filteredVisitors = dailyVisitors.slice(sliceStart);
  const filteredPageViews = dailyPageViews.slice(sliceStart);

  const trafficDonutItems = (analytics?.trafficSources || []).map((s, i) => ({
    label: s.channel,
    value: s.sessions,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const deviceDonutItems = (analytics?.devices || []).map((d) => ({
    label: d.device.charAt(0).toUpperCase() + d.device.slice(1),
    value: d.sessions,
    color: DEVICE_COLORS[d.device.toLowerCase()] || '#8B5CF6',
  }));

  const topPagesItems = (analytics?.topPages || []).map((p) => ({
    label: p.path === '/' ? 'Home (/)' : p.path,
    value: p.views,
    secondaryValue: p.users,
  }));

  if (loading && analyticsLoading) {
    return (
      <DashboardLayout title="Overview">
        <Head><title>Dashboard — Malaika Nisar</title></Head>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Overview">
      <Head><title>Dashboard — Malaika Nisar</title></Head>

      {/* Greeting */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} 👋
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Here&apos;s what&apos;s happening with your site.</p>
        </div>
        <button
          onClick={fetchData}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Analytics Stats Cards */}
      {gaConfigured && analytics?.overview ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Visitors"
            value={analytics.overview.activeUsers.toLocaleString()}
            subtitle={`${analytics.overview.newUsers} new`}
            color="blue"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
          />
          <StatCard
            label="Page Views"
            value={analytics.overview.pageViews.toLocaleString()}
            color="primary"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            label="Sessions"
            value={analytics.overview.sessions.toLocaleString()}
            subtitle={`${Math.round((1 - analytics.overview.bounceRate) * 100)}% engaged`}
            color="emerald"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            }
          />
          <StatCard
            label="Avg. Duration"
            value={formatDuration(analytics.overview.avgSessionDuration)}
            subtitle={`${Math.round(analytics.overview.bounceRate * 100)}% bounce rate`}
            color="amber"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      ) : null}

      {/* Content Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Blogs"
          value={blogStats?.totalBlogs || 0}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          label="Total Comments"
          value={stats?.totalComments || 0}
          subtitle={stats?.recentCount ? `+${stats.recentCount} this week` : undefined}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
          }
          color="primary"
        />
        <StatCard
          label="Total Tags"
          value={blogStats?.totalTags || 0}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          }
          color="amber"
        />
        <StatCard
          label="This Week"
          value={stats?.recentCount || 0}
          subtitle="New comments"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
          color="emerald"
        />
      </div>

      {/* Analytics Section */}
      {analyticsLoading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-primary" />
            <span className="text-sm text-zinc-500">Loading analytics...</span>
          </div>
        </div>
      ) : !gaConfigured ? (
        <div className="mb-8">
          <AnalyticsSetupCard />
        </div>
      ) : (
        <>
          {/* Visitors & Pageviews Chart */}
          <SectionCard
            title="Visitors & Page Views"
            className="mb-6"
            action={
              <div className="flex items-center gap-1 rounded-lg bg-zinc-800/50 p-0.5">
                {(['7d', '30d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2.5 py-1 text-[11px] rounded-md transition-all ${
                      timeRange === range
                        ? 'bg-zinc-700 text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {range === '7d' ? '7 days' : '30 days'}
                  </button>
                ))}
              </div>
            }
          >
            {filteredLabels.length > 0 ? (
              <LineChart
                labels={filteredLabels}
                datasets={[
                  { label: 'Visitors', data: filteredVisitors, color: '#3B82F6' },
                  { label: 'Page Views', data: filteredPageViews, color: '#FB2576' },
                ]}
                height={220}
              />
            ) : (
              <p className="text-sm text-zinc-500 py-8 text-center">No data for this period</p>
            )}
          </SectionCard>

          {/* Top Pages + Traffic Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SectionCard title="Top Pages">
              {topPagesItems.length > 0 ? (
                <HorizontalBarChart items={topPagesItems} color="#FB2576" maxItems={8} />
              ) : (
                <p className="text-sm text-zinc-500 py-8 text-center">No page data</p>
              )}
            </SectionCard>

            <SectionCard title="Traffic Sources">
              {trafficDonutItems.length > 0 ? (
                <DonutChart
                  items={trafficDonutItems}
                  size={140}
                  centerValue={analytics?.overview?.sessions.toLocaleString()}
                  centerLabel="sessions"
                />
              ) : (
                <p className="text-sm text-zinc-500 py-8 text-center">No traffic data</p>
              )}
            </SectionCard>
          </div>

          {/* Devices + Countries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SectionCard title="Devices">
              {deviceDonutItems.length > 0 ? (
                <DonutChart
                  items={deviceDonutItems}
                  size={140}
                  centerValue={`${Math.round(
                    ((analytics?.devices?.find((d) => d.device === 'mobile')?.sessions || 0) /
                      Math.max(analytics?.overview?.sessions || 1, 1)) *
                      100
                  )}%`}
                  centerLabel="mobile"
                />
              ) : (
                <p className="text-sm text-zinc-500 py-8 text-center">No device data</p>
              )}
            </SectionCard>

            <SectionCard title="Top Countries">
              {analytics?.countries?.length ? (
                <HorizontalBarChart
                  items={analytics.countries.map((c) => ({
                    label: c.country,
                    value: c.users,
                  }))}
                  color="#3B82F6"
                  maxItems={8}
                />
              ) : (
                <p className="text-sm text-zinc-500 py-8 text-center">No country data</p>
              )}
            </SectionCard>
          </div>
        </>
      )}

      {/* Comments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Comments */}
        <SectionCard
          title="Recent Comments"
          className="lg:col-span-2"
          action={
            <Link href="/dashboard/comments" className="text-xs text-primary hover:text-primary/80 transition-colors">
              View all →
            </Link>
          }
        >
          <div className="space-y-1">
            {stats?.recentComments?.length ? (
              stats.recentComments.map((c) => (
                <div
                  key={c._id}
                  className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-zinc-800/40 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-8 h-8 rounded-full ring-1 ring-zinc-700 flex-shrink-0"
                    width={32}
                    height={32}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">{c.name}</span>
                      <span className="text-[10px] text-zinc-600">·</span>
                      <span className="text-[10px] text-zinc-500 truncate">{c.slug}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400 line-clamp-1">{c.comment}</p>
                    <p className="mt-0.5 text-[10px] text-zinc-600">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 py-8 text-center">No comments yet</p>
            )}
          </div>
        </SectionCard>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Comment Activity */}
          <SectionCard title="Comment Activity (7d)">
            {stats?.dailyComments?.length ? (
              <VerticalBarChart
                data={stats.dailyComments.map((d) => ({
                  label: d._id.slice(5),
                  value: d.count,
                }))}
                color="#FB2576"
                height={100}
              />
            ) : (
              <p className="text-xs text-zinc-500 py-4 text-center">No activity yet</p>
            )}
          </SectionCard>

          {/* Most Discussed */}
          <SectionCard title="Most Discussed">
            <div className="space-y-2">
              {stats?.commentsByPost?.length ? (
                stats.commentsByPost.map((post, i) => (
                  <div key={post._id} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-zinc-600 w-4">{i + 1}.</span>
                    <span className="flex-1 text-xs text-zinc-400 truncate">{post._id}</span>
                    <span className="text-xs font-semibold text-zinc-300 tabular-nums">{post.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center">No data</p>
              )}
            </div>
          </SectionCard>

          {/* Quick Actions */}
          <SectionCard title="Quick Actions">
            <div className="space-y-1.5">
              {[
                { href: '/dashboard/blogs', label: 'Manage blogs', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' },
                { href: '/dashboard/comments', label: 'Moderate comments', icon: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155' },
                { href: '/dashboard/drafts', label: 'Save a new idea', icon: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                  </svg>
                  {action.label}
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
