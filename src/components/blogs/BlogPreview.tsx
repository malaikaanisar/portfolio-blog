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
}

export const BlogPreview = ({ post, dense }: Props) => {
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
