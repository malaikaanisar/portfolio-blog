import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, ReactNode } from 'react';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  HomeIcon,
  NewspaperIcon,
  SparklesIcon,
  LightBulbIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  title?: string;
}

const mainNav = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
];

const contentNav = [
  { name: 'Blogs', href: '/dashboard/blogs', icon: NewspaperIcon },
  { name: 'Drafts & Ideas', href: '/dashboard/drafts', icon: LightBulbIcon },
  { name: 'Comments', href: '/dashboard/comments', icon: ChatBubbleLeftRightIcon },
];

const toolsNav = [
  { name: 'AI Tools', href: '/dashboard/ai', icon: SparklesIcon },
  { name: 'Scheduled Posts', href: '/dashboard/ai?tab=scheduled', icon: CalendarDaysIcon },
];

const settingsNav = [
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

function NavSection({ label, items, router, onNavigate }: {
  label: string;
  items: typeof mainNav;
  router: ReturnType<typeof useRouter>;
  onNavigate: () => void;
}) {
  return (
    <div>
      <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{label}</p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? router.pathname === '/dashboard'
              : router.pathname.startsWith(item.href.split('?')[0]);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                'group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]',
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary" />
              )}
              <item.icon className={clsx('w-[18px] h-[18px] flex-shrink-0 transition-colors', isActive ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-300')} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardLayout({ children, title }: Props) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/auth/check')
      .then((res) => {
        if (!res.ok) {
          router.replace('/dashboard/login');
        } else {
          setChecking(false);
        }
      })
      .catch(() => router.replace('/dashboard/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/dashboard/auth/logout', { method: 'POST' });
    router.replace('/dashboard/login');
  };

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800/80 transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-zinc-800/80">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
            M
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100 tracking-tight">Malaika Nisar</p>
            <p className="text-[10px] text-zinc-500 tracking-wide">Dashboard</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {/* Main */}
          <NavSection label="Main" items={mainNav} router={router} onNavigate={() => setSidebarOpen(false)} />
          {/* Content */}
          <NavSection label="Content" items={contentNav} router={router} onNavigate={() => setSidebarOpen(false)} />
          {/* AI & Automation */}
          <NavSection label="AI & Automation" items={toolsNav} router={router} onNavigate={() => setSidebarOpen(false)} />
          {/* System */}
          <NavSection label="System" items={settingsNav} router={router} onNavigate={() => setSidebarOpen(false)} />
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-zinc-800/80 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-all"
          >
            <svg className="w-[18px] h-[18px] text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-zinc-400 hover:text-red-400 hover:bg-red-500/8 transition-all"
          >
            <svg className="w-[18px] h-[18px] text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex h-14 items-center justify-between px-4 sm:px-6 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            {title && (
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-zinc-100">{title}</h1>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-800/60 border border-zinc-800 text-[11px] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-pink-600/80 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-zinc-800">
              M
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
