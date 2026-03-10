import clsx from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';

import { formatDate } from '../../lib/date';
import { BlogPost } from '../../lib/notesApi';
import { slugifyTag } from '../../lib/slugify';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { ANIMATION_FROM_PROPS, ANIMATION_TO_PROPS } from '../../lib/animation';


interface Props {
  post: BlogPost;
  dense?: boolean;
  commentCount?: number;
}

export const BlogPreview = ({ post, dense, commentCount }: Props) => {
  return (
    <motion.div
      initial={ANIMATION_FROM_PROPS}
      whileInView={ANIMATION_TO_PROPS}
      viewport={{ once: true }}
    >
      <article className="md:grid md:grid-cols-4 md:items-baseline">
        <Card className="md:col-span-3">
          <Card.Title href={`/blogs/${post.slug}`}>{post.title}</Card.Title>
          <Card.Eyebrow
            as="time"
            dateTime={post.publishedAt}
            className={clsx(!dense && 'md:hidden')}
            decorate
          >
            {formatDate(post.publishedAt)}
          </Card.Eyebrow>
          <Card.Description>{post.description}</Card.Description>
          {post.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} href={`/tags/${slugifyTag(tag)}`} className="text-[10px] px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <span className="text-[10px] text-zinc-400 self-center">+{post.tags.length - 3} more</span>
              )}
            </div>
          )}
          {typeof commentCount === 'number' && (
            <div className="relative z-10 mt-2 flex items-center gap-1.5 text-[12px] text-zinc-400 dark:text-zinc-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
              <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            </div>
          )}
          <Card.Cta>Read blog post</Card.Cta>
        </Card>
        {!dense && (
          <Card.Eyebrow as="time" dateTime={post.publishedAt} className="mt-1 hidden md:block">
            {formatDate(post.publishedAt)}
          </Card.Eyebrow>
        )}
      </article>
    </motion.div>
  );
};
