import { useState } from 'react';
import Head from 'next/head';
import clsx from 'clsx';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';

export default function DashboardSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'danger'>('general');

  const tabs = [
    { id: 'general' as const, label: 'General' },
    { id: 'security' as const, label: 'Security' },
    { id: 'danger' as const, label: 'Danger Zone' },
  ];

  return (
    <DashboardLayout title="Settings">
      <Head><title>Settings — Dashboard</title></Head>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'rounded-lg px-4 py-2 text-xs font-medium transition-all',
              activeTab === tab.id
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && <GeneralSettings />}
      {activeTab === 'security' && <SecurityInfo />}
      {activeTab === 'danger' && <DangerZone />}
    </DashboardLayout>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-sm font-semibold text-zinc-100 mb-1">Site Information</h3>
        <p className="text-xs text-zinc-500 mb-4">Basic information about your portfolio</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Site Name</label>
            <input
              type="text"
              defaultValue="Malaika Nisar"
              disabled
              className="w-full rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Site URL</label>
            <input
              type="text"
              defaultValue="https://malaikaa.space"
              disabled
              className="w-full rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">CMS</label>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-2.5">
              <svg className="w-4 h-4 text-zinc-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h16v16H4V4z" />
              </svg>
              <span className="text-sm text-zinc-400">Notion</span>
              <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">Connected</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Database</label>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-2.5">
              <span className="text-sm text-zinc-400">MongoDB Atlas</span>
              <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">Connected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-sm font-semibold text-zinc-100 mb-1">Integrations</h3>
        <p className="text-xs text-zinc-500 mb-4">Third-party services connected to your site</p>

        <div className="space-y-3">
          {[
            { name: 'Vercel Analytics', status: 'Active', color: 'emerald' },
            { name: 'Vercel Speed Insights', status: 'Active', color: 'emerald' },
            { name: 'Microsoft Clarity', status: 'Active', color: 'emerald' },
            { name: 'Notion API', status: 'Connected', color: 'emerald' },
            { name: 'MongoDB Atlas', status: 'Connected', color: 'emerald' },
          ].map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-3"
            >
              <span className="text-sm text-zinc-300">{integration.name}</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5 font-medium">
                {integration.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecurityInfo() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-sm font-semibold text-zinc-100 mb-1">Authentication</h3>
        <p className="text-xs text-zinc-500 mb-4">Dashboard access security settings</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <div>
              <p className="text-sm text-zinc-300">Token-based Auth</p>
              <p className="text-[11px] text-zinc-500">HMAC-SHA256 signed tokens, 24h expiry</p>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5 font-medium">
              Enabled
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <div>
              <p className="text-sm text-zinc-300">HTTP-Only Cookies</p>
              <p className="text-[11px] text-zinc-500">Tokens stored in secure HTTP-only cookies</p>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5 font-medium">
              Enabled
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <div>
              <p className="text-sm text-zinc-300">API Route Protection</p>
              <p className="text-[11px] text-zinc-500">All /api/dashboard/* routes require authentication</p>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5 font-medium">
              Active
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <h3 className="text-sm font-semibold text-amber-400 mb-1">Environment Variables</h3>
        <p className="text-xs text-zinc-500 mb-3">
          Set these in your Vercel environment settings for production:
        </p>
        <div className="space-y-2 font-mono text-xs">
          <div className="rounded-lg bg-zinc-900 px-3 py-2 text-zinc-400">
            DASHBOARD_USERNAME=<span className="text-amber-400">your_username</span>
          </div>
          <div className="rounded-lg bg-zinc-900 px-3 py-2 text-zinc-400">
            DASHBOARD_PASSWORD=<span className="text-amber-400">your_secure_password</span>
          </div>
          <div className="rounded-lg bg-zinc-900 px-3 py-2 text-zinc-400">
            TOKEN_SECRET=<span className="text-amber-400">your_random_secret_key</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DangerZone() {
  const [confirmDelete, setConfirmDelete] = useState('');

  const handlePurgeComments = async () => {
    if (confirmDelete !== 'DELETE ALL') return;
    try {
      // This would need a special API endpoint
      alert('This feature requires manual database access for safety.');
    } catch {
      alert('Failed');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <h3 className="text-sm font-semibold text-red-400 mb-1">Danger Zone</h3>
        <p className="text-xs text-zinc-500 mb-4">
          Irreversible actions. Proceed with extreme caution.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-red-500/20 bg-zinc-900 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Purge All Comments</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Permanently delete all comments from the database. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder='Type "DELETE ALL" to confirm'
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50"
              />
              <button
                onClick={handlePurgeComments}
                disabled={confirmDelete !== 'DELETE ALL'}
                className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-600 transition-all"
              >
                Purge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
