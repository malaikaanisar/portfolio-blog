import { useState, useEffect } from 'react';
import Head from 'next/head';
import clsx from 'clsx';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';

export default function DashboardSettings() {
  return (
    <DashboardLayout title="Settings">
      <Head><title>Settings — Dashboard</title></Head>
      <div className="space-y-8 max-w-2xl">
        <ProfileSettings />
        <SecuritySettings />
      </div>
    </DashboardLayout>
  );
}

function ProfileSettings() {
  const [username, setUsername] = useState('');
  const [initialUsername, setInitialUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard/settings');
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
          setInitialUsername(data.username);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-username', newUsername: username }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Username updated successfully.' });
        setInitialUsername(username);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update username.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong.' });
    }
    setSaving(false);
  };

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/15">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <div>
          <h2 className="text-[13px] font-semibold text-zinc-100">Profile</h2>
          <p className="text-[11px] text-zinc-500">Manage your public profile and account details.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-5 space-y-4">
        <div>
          <label htmlFor="username" className="block text-xs font-medium text-zinc-400 mb-1.5">
            Username
          </label>
          {loading ? (
            <div className="h-10 w-full rounded-xl bg-zinc-800 animate-pulse" />
          ) : (
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              required
              className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/40 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800/60 transition-all"
            />
          )}
        </div>

        {message && message.type === 'error' && (
          <div className="rounded-lg px-3 py-2 text-sm bg-red-500/10 text-red-400 border border-red-500/20">
            {message.text}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {message && message.type === 'success' ? (
            <span className="text-sm text-emerald-400">{message.text}</span>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={saving || loading || username === initialUsername}
            className="rounded-xl bg-zinc-100 px-5 py-2.5 text-[13px] font-semibold text-zinc-900 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}

function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully. Use it next time you log in.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong' });
    }
    setSaving(false);
  };

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/15">
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <div>
          <h2 className="text-[13px] font-semibold text-zinc-100">Security</h2>
          <p className="text-[11px] text-zinc-500">Update your dashboard login password.</p>
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/40 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800/60 transition-all"
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/40 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800/60 transition-all"
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/40 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800/60 transition-all"
            placeholder="Repeat new password"
          />
        </div>

        {message && (
          <div
            className={clsx(
              'rounded-lg px-3 py-2 text-sm',
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20',
            )}
          >
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            className="rounded-xl bg-zinc-100 px-5 py-2.5 text-[13px] font-semibold text-zinc-900 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </section>
  );
}
