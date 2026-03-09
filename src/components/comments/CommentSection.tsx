import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';

import { COMMENT_AVATARS } from '../../data/commentAvatars';

interface Comment {
  _id: string;
  slug: string;
  name: string;
  comment: string;
  avatar: string;
  createdAt: string;
}

interface Props {
  slug: string;
}

export const CommentSection = ({ slug }: Props) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(COMMENT_AVATARS[0].url);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: name.trim(),
          comment: comment.trim(),
          avatar: selectedAvatar,
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [newComment, ...prev]);
        setName('');
        setComment('');
        setShowAvatarPicker(false);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to post comment');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAvatarData = COMMENT_AVATARS.find((a) => a.url === selectedAvatar);

  return (
    <div className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-700/60">
      <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
        Comments{' '}
        {comments.length > 0 && (
          <span className="text-base font-normal text-zinc-400">({comments.length})</span>
        )}
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 overflow-hidden">
          {/* Avatar row */}
          <div className="px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-700/40">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="group flex-shrink-0"
                title="Click to change avatar"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedAvatar}
                  alt={selectedAvatarData?.label || 'Avatar'}
                  className="w-9 h-9 rounded-full ring-2 ring-zinc-200 dark:ring-zinc-600 group-hover:ring-primary transition-all cursor-pointer"
                  width={36}
                  height={36}
                />
              </button>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  className="flex-1 bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="text-[10px] text-zinc-400 hover:text-primary transition-colors whitespace-nowrap"
                >
                  change avatar
                </button>
              </div>
            </div>
          </div>

          {/* Avatar picker */}
          {showAvatarPicker && (
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-700/40 bg-zinc-50/50 dark:bg-zinc-800/60">
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                {COMMENT_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(avatar.url);
                      setShowAvatarPicker(false);
                    }}
                    className={clsx(
                      'transition-all hover:scale-110',
                      selectedAvatar === avatar.url
                        ? 'scale-105'
                        : 'opacity-60 hover:opacity-100',
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatar.url}
                      alt={avatar.label}
                      className={clsx(
                        'w-full aspect-square rounded-full',
                        selectedAvatar === avatar.url
                          ? 'ring-2 ring-primary ring-offset-1 ring-offset-zinc-50 dark:ring-offset-zinc-800'
                          : 'ring-1 ring-zinc-200 dark:ring-zinc-600',
                      )}
                      width={40}
                      height={40}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Textarea */}
          <div className="px-4 pt-3 pb-2">
            <textarea
              placeholder="Share your thoughts..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full bg-transparent text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Footer */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-700/40">
            <span className="text-[11px] text-zinc-400 tabular-nums">
              {comment.length}<span className="text-zinc-300 dark:text-zinc-600">/1000</span>
            </span>
            <button
              type="submit"
              disabled={submitting || !name.trim() || !comment.trim()}
              className="rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {submitting ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-white/30 border-t-white" />
                  Posting
                </span>
              ) : (
                'Post Comment'
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </form>

      {/* Comments list */}
      <div className="mt-10 space-y-1">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-primary" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((c, i) => (
            <div
              key={c._id}
              className="group rounded-xl px-4 py-3.5 -mx-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <div className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-9 h-9 rounded-full flex-shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-700"
                  width={36}
                  height={36}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {c.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      ·
                    </span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap break-words">
                    {c.comment}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
