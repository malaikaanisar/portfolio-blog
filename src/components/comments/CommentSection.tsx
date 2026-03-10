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
  adminReply?: {
    text: string;
    repliedAt: string;
  };
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
      <div className="mt-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-primary" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-3">
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {comments.map((c) => (
              <div key={c._id} className="py-5 first:pt-0">
                {/* Comment header */}
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="not-prose w-8 h-8 rounded-full flex-shrink-0 ring-1 ring-zinc-200/80 dark:ring-zinc-700/80"
                    width={32}
                    height={32}
                  />
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                      {c.name}
                    </span>
                    <time className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </time>
                  </div>
                </div>

                {/* Comment body */}
                <div className="ml-11">
                  <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
                    {c.comment}
                  </p>

                  {/* Admin reply */}
                  {c.adminReply && (
                    <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
                          <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                          </svg>
                        </div>
                        <span className="text-[12px] font-semibold text-primary">
                          Malaika
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {formatDistanceToNow(new Date(c.adminReply.repliedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[13px] leading-[1.7] text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap break-words">
                        {c.adminReply.text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
