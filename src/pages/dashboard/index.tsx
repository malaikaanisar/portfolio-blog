import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { formatDistanceToNow } from 'date-fns';

interface Stats {
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

function StatCard({
  label,
  value,
  change,
  icon,
  color = 'primary',
}: {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'emerald' | 'amber' | 'blue';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    blue: 'bg-blue-500/10 text-blue-400',
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-3xl font-bold text-zinc-100">{value}</p>
          {change && (
            <p className="mt-1 text-xs text-emerald-400">{change}</p>
          )}
        </div>
        <div className={`rounded-xl p-2.5 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniChart({ data }: { data: Array<{ _id: string; count: number }> }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d) => (
        <div
          key={d._id}
          className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors min-w-[4px]"
          style={{ height: `${(d.count / max) * 100}%`, minHeight: '4px' }}
          title={`${d._id}: ${d.count} comments`}
        />
      ))}
    </div>
  );
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  if (loading) {
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-100">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} 👋
        </h2>
        <p className="mt-1 text-sm text-zinc-500">Here&apos;s what&apos;s happening with your site today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          change={stats?.recentCount ? `+${stats.recentCount} this week` : undefined}
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
          change="New comments"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
          color="emerald"
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent comments */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-100">Recent Comments</h3>
            <Link href="/dashboard/comments" className="text-xs text-primary hover:text-primary/80 transition-colors">
              View all →
            </Link>
          </div>
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
                      <span className="text-[10px] text-zinc-600">on</span>
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
        </div>

        {/* Most commented posts + activity chart */}
        <div className="space-y-6">
          {/* Activity chart */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-sm font-semibold text-zinc-100 mb-3">Activity (7 days)</h3>
            {stats?.dailyComments?.length ? (
              <MiniChart data={stats.dailyComments} />
            ) : (
              <p className="text-xs text-zinc-500 py-4 text-center">No activity yet</p>
            )}
          </div>

          {/* Most commented */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-sm font-semibold text-zinc-100 mb-3">Most Discussed</h3>
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
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-sm font-semibold text-zinc-100 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/blogs"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Manage blogs
              </Link>
              <Link
                href="/dashboard/comments"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
                Moderate comments
              </Link>
              <Link
                href="/dashboard/drafts"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
                Save a new idea
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
