import { useEffect, useState } from 'react';
import Head from 'next/head';
import clsx from 'clsx';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';

interface Blog {
  id: string;
  title: string;
  description: string;
  slug: string;
  tags: string[];
  isPublished: boolean;
  inProgress: boolean;
  publishedAt: string;
  lastEdited: string;
  cover: string | null;
}

export default function DashboardBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    fetch('/api/dashboard/blogs')
      .then((r) => r.json())
      .then((data) => setBlogs(data.blogs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredBlogs = blogs.filter((b) => {
    if (filter === 'published' && !b.isPublished) return false;
    if (filter === 'draft' && b.isPublished) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <DashboardLayout title="Blogs">
      <Head><title>Blogs — Dashboard</title></Head>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
          {(['all', 'published', 'draft'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all capitalize',
                filter === f
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="text-xs text-zinc-500">
          {filteredBlogs.length} blog{filteredBlogs.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Blog list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-primary" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-zinc-500">No blogs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 p-4 sm:p-5 transition-all"
            >
              <div className="flex items-start gap-4">
                {blog.cover && (
                  <div className="hidden sm:block w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.cover}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={clsx(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        blog.isPublished
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : blog.inProgress
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-zinc-700/50 text-zinc-400',
                      )}
                    >
                      {blog.isPublished ? 'Published' : blog.inProgress ? 'In Progress' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-100 truncate">
                    {blog.title}
                  </h3>
                  {blog.description && (
                    <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">{blog.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {blog.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                    {blog.tags.length > 3 && (
                      <span className="text-[10px] text-zinc-600">+{blog.tags.length - 3}</span>
                    )}
                    <span className="text-zinc-700">·</span>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <a
                  href={`/blogs/${blog.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 rounded-lg p-2 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
