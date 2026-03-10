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
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="text-base font-semibold text-zinc-100">Profile</h2>
      <p className="text-sm text-zinc-500 mt-1">Manage your public profile and account details.</p>

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-zinc-400 mb-1.5">
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
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
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
            className="rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="text-base font-semibold text-zinc-100">Security</h2>
      <p className="text-sm text-zinc-500 mt-1">Update your dashboard login password.</p>

      <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
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
            className="rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </section>
  );
}
