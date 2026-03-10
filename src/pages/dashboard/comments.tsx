import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';

interface AdminReply {
  text: string;
  repliedAt: string;
}

interface Comment {
  _id: string;
  slug: string;
  name: string;
  comment: string;
  avatar: string;
  createdAt: string;
  adminReply?: AdminReply;
}

export default function DashboardComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
      });
      if (searchDebounce) params.set('search', searchDebounce);

      const res = await fetch(`/api/dashboard/comments?${params}`);
      const data = await res.json();
      setComments(data.comments || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchDebounce]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/dashboard/comments?id=${id}`, { method: 'DELETE' });
      setComments((prev) => prev.filter((c) => c._id !== id));
      setTotal((prev) => prev - 1);
      setSelectedComments((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedComments.size === 0) return;
    if (!confirm(`Delete ${selectedComments.size} comments?`)) return;
    
    const ids = Array.from(selectedComments);
    for (const id of ids) {
      try {
        await fetch(`/api/dashboard/comments?id=${id}`, { method: 'DELETE' });
      } catch {}
    }
    setSelectedComments(new Set());
    fetchComments();
  };

  const toggleSelect = (id: string) => {
    setSelectedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    setReplySending(true);
    try {
      const res = await fetch('/api/dashboard/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId, reply: replyText.trim() }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? { ...c, adminReply: { text: replyText.trim(), repliedAt: new Date().toISOString() } }
              : c,
          ),
        );
        setReplyingTo(null);
        setReplyText('');
      }
    } catch (err) {
      console.error('Failed to reply:', err);
    } finally {
      setReplySending(false);
    }
  };

  const handleAiSuggest = async (commentId: string, commentText: string, authorName: string) => {
    setAiSuggesting(commentId);
    try {
      const res = await fetch('/api/dashboard/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest-reply', comment: commentText, authorName }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setReplyText(data.reply);
      } else {
        console.error('AI suggest failed:', data.error);
      }
    } catch (err) {
      console.error('AI suggest error:', err);
    }
    setAiSuggesting(null);
  };

  const handleDeleteReply = async (commentId: string) => {
    if (!confirm('Delete this reply?')) return;
    try {
      const res = await fetch('/api/dashboard/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId, reply: null }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId ? { ...c, adminReply: undefined } : c,
          ),
        );
      }
    } catch (err) {
      console.error('Failed to delete reply:', err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedComments.size === comments.length) {
      setSelectedComments(new Set());
    } else {
      setSelectedComments(new Set(comments.map((c) => c._id)));
    }
  };

  return (
    <DashboardLayout title="Comments">
      <Head><title>Comments — Dashboard</title></Head>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search comments..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{total} total</span>
          {selectedComments.size > 0 && (
            <>
              <span>·</span>
              <span className="text-primary">{selectedComments.size} selected</span>
              <button
                onClick={handleBulkDelete}
                className="ml-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all"
              >
                Delete selected
              </button>
            </>
          )}
        </div>
      </div>

      {/* Comments table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-primary" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-20">
          <svg className="mx-auto w-12 h-12 text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
          <p className="text-sm text-zinc-500">No comments found</p>
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            <div className="w-5">
              <input
                type="checkbox"
                checked={selectedComments.size === comments.length && comments.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-zinc-700 bg-zinc-800 text-primary focus:ring-primary/50"
              />
            </div>
            <div className="w-8" />
            <div className="flex-1">Comment</div>
            <div className="w-24 text-right">Actions</div>
          </div>

          <div className="space-y-1">
            {comments.map((c) => (
              <div
                key={c._id}
                className={clsx(
                  'group rounded-xl px-4 py-3 transition-all',
                  selectedComments.has(c._id)
                    ? 'bg-primary/5 border border-primary/20'
                    : 'hover:bg-zinc-800/40 border border-transparent',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="hidden sm:flex items-center pt-1 w-5">
                    <input
                      type="checkbox"
                      checked={selectedComments.has(c._id)}
                      onChange={() => toggleSelect(c._id)}
                      className="rounded border-zinc-700 bg-zinc-800 text-primary focus:ring-primary/50"
                    />
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-8 h-8 rounded-full ring-1 ring-zinc-700 flex-shrink-0 mt-0.5"
                    width={32}
                    height={32}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-zinc-200">{c.name}</span>
                      <span className="text-[10px] text-zinc-600">·</span>
                      <span className="text-[11px] text-zinc-500 truncate">{c.slug}</span>
                      <span className="text-[10px] text-zinc-600">·</span>
                      <span className="text-[11px] text-zinc-600">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{c.comment}</p>

                    {/* Existing admin reply */}
                    {c.adminReply && replyingTo !== c._id && (
                      <div className="mt-2.5 ml-2 pl-3 border-l-2 border-primary/30">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-primary">Admin Reply</span>
                          <span className="text-[10px] text-zinc-600">·</span>
                          <span className="text-[10px] text-zinc-600">
                            {formatDistanceToNow(new Date(c.adminReply.repliedAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-300 leading-relaxed">{c.adminReply.text}</p>
                      </div>
                    )}

                    {/* Reply form */}
                    {replyingTo === c._id && (
                      <div className="mt-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          rows={2}
                          maxLength={1000}
                          autoFocus
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary resize-none"
                        />
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {/* AI Suggest button */}
                          <button
                            type="button"
                            onClick={() => handleAiSuggest(c._id, c.comment, c.name)}
                            disabled={!!aiSuggesting}
                            className="rounded-lg bg-violet-500/15 border border-violet-500/20 px-3 py-1.5 text-[11px] font-medium text-violet-400 hover:bg-violet-500/25 transition-all disabled:opacity-40 flex items-center gap-1.5"
                            title="Let Gemini suggest a reply"
                          >
                            {aiSuggesting === c._id ? (
                              <>
                                <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-violet-400/30 border-t-violet-400" />
                                Suggesting...
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a1 1 0 0 1 .894.553l2.618 5.302 5.853.851a1 1 0 0 1 .555 1.705l-4.234 4.127.999 5.829a1 1 0 0 1-1.451 1.054L12 18.897l-5.234 2.524a1 1 0 0 1-1.451-1.054l.999-5.829L2.08 10.41a1 1 0 0 1 .556-1.705l5.852-.851L11.106 2.553A1 1 0 0 1 12 2Z"/></svg>
                                AI Suggest
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReply(c._id)}
                            disabled={replySending || !replyText.trim()}
                            className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-primary/90 transition-all disabled:opacity-40"
                          >
                            {replySending ? (
                              <span className="flex items-center gap-1.5">
                                <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-white/30 border-t-white" />
                                Sending
                              </span>
                            ) : (
                              'Send Reply'
                            )}
                          </button>
                          <button
                            onClick={() => { setReplyingTo(null); setReplyText(''); }}
                            className="rounded-lg px-3 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
                          >
                            Cancel
                          </button>
                          <span className="text-[10px] text-zinc-600 ml-auto tabular-nums">
                            {replyText.length}/1000
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Reply / Edit reply button */}
                    <button
                      onClick={() => {
                        if (replyingTo === c._id) {
                          setReplyingTo(null);
                          setReplyText('');
                        } else {
                          setReplyingTo(c._id);
                          setReplyText(c.adminReply?.text || '');
                        }
                      }}
                      className={clsx(
                        'rounded-lg p-1.5 transition-all',
                        replyingTo === c._id
                          ? 'text-primary bg-primary/10'
                          : c.adminReply
                          ? 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 opacity-60 group-hover:opacity-100'
                          : 'text-zinc-600 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100',
                      )}
                      title={c.adminReply ? 'Edit reply' : 'Reply'}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                      </svg>
                    </button>

                    {/* Delete reply button */}
                    {c.adminReply && (
                      <button
                        onClick={() => handleDeleteReply(c._id)}
                        className="rounded-lg p-1.5 text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete reply"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}

                    {/* Delete comment button */}
                    <button
                      onClick={() => handleDelete(c._id)}
                      disabled={deleting === c._id}
                      className="rounded-lg p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      title="Delete comment"
                    >
                      {deleting === c._id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-red-400/30 border-t-red-400" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              <span className="text-xs text-zinc-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
