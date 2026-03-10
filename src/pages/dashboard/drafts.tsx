import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';

interface Draft {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: 'idea', label: 'Idea', color: 'text-blue-400 bg-blue-500/10' },
  { value: 'draft', label: 'Draft', color: 'text-amber-400 bg-amber-500/10' },
  { value: 'todo', label: 'Todo', color: 'text-emerald-400 bg-emerald-500/10' },
  { value: 'note', label: 'Note', color: 'text-purple-400 bg-purple-500/10' },
];

export default function DashboardDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('idea');
  const [saving, setSaving] = useState(false);

  const fetchDrafts = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/drafts');
      const data = await res.json();
      setDrafts(data);
    } catch (err) {
      console.error('Failed to fetch drafts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('idea');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    try {
      if (editingId) {
        await fetch('/api/dashboard/drafts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, title, content, category }),
        });
      } else {
        await fetch('/api/dashboard/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, category }),
        });
      }
      resetForm();
      fetchDrafts();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (draft: Draft) => {
    setTitle(draft.title);
    setContent(draft.content);
    setCategory(draft.category);
    setEditingId(draft._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this draft?')) return;
    try {
      await fetch(`/api/dashboard/drafts?id=${id}`, { method: 'DELETE' });
      setDrafts((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const getCategoryStyle = (cat: string) => {
    return CATEGORIES.find((c) => c.value === cat) || CATEGORIES[0];
  };

  return (
    <DashboardLayout title="Drafts & Ideas">
      <Head><title>Drafts — Dashboard</title></Head>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] text-zinc-500">
          <span className="text-zinc-300 font-medium">{drafts.length}</span> draft{drafts.length !== 1 ? 's' : ''} saved
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/ai?tab=ideas"
            className="flex items-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-500/8 px-3 py-2 text-[11px] font-medium text-violet-400 hover:bg-violet-500/15 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            AI Ideas
          </Link>
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className={clsx(
              'rounded-xl px-4 py-2 text-xs font-semibold transition-all',
              showForm
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25',
            )}
          >
            {showForm ? 'Cancel' : '+ New Draft'}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-zinc-100 placeholder:text-zinc-600 focus:outline-none border-b border-zinc-800 pb-3"
            autoFocus
          />
          <textarea
            placeholder="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={clsx(
                    'rounded-lg px-3 py-1 text-[11px] font-medium transition-all',
                    category === cat.value
                      ? cat.color
                      : 'text-zinc-600 hover:text-zinc-400',
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Drafts list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-primary" />
        </div>
      ) : drafts.length === 0 && !showForm ? (
        <div className="text-center py-20">
          <svg className="mx-auto w-12 h-12 text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          <p className="text-sm text-zinc-500 mb-3">No drafts yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-all"
          >
            Create your first draft
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {drafts.map((draft) => {
            const catStyle = getCategoryStyle(draft.category);
            return (
              <div
                key={draft._id}
                className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/60 p-5 transition-all duration-150"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-semibold', catStyle.color)}>
                    {catStyle.label}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(draft)}
                      className="rounded-lg p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(draft._id)}
                      className="rounded-lg p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-1">{draft.title}</h3>
                {draft.content && (
                  <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">{draft.content}</p>
                )}
                <p className="mt-3 text-[10px] text-zinc-600">
                  {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
