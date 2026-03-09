import { GetStaticPaths, GetStaticProps } from 'next';
import { NextSeo } from 'next-seo';
import React from 'react';

import { PageLayout } from '../../components/PageLayout';
import { BlogPreview } from '../../components/blogs/BlogPreview';
import { BlogPost, notesApi } from '../../lib/notesApi';
import { slugifyTag } from '../../lib/slugify';

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://malaikaa.space';

interface Props {
  tag: string;
  displayTag: string;
  relatedNotes: BlogPost[];
}

export default function Tag({ tag, displayTag, relatedNotes }: Props) {
  const seoTitle = `${displayTag} — Blog Posts by Malaika Nisar`;
  const seoDescription = `Browse all blog posts tagged with ${displayTag} — insights on digital marketing, social media, and more by Malaika Nisar.`;

  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        canonical={`${SITE_URL}/tags/${tag}`}
        openGraph={{
          images: [
            {
              url: `${SITE_URL}/api/og?title=${encodeURIComponent(seoTitle)}&description=${encodeURIComponent(seoDescription)}`,
              width: 1200,
              height: 630,
              alt: seoTitle,
            },
          ],
        }}
      />
      <PageLayout title={`${displayTag}`} intro={`All blog posts tagged with ${displayTag}`}>
        <div className="mt-24 md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {relatedNotes.map((post) => (
              <BlogPreview key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </PageLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props, { tag: string }> = async (context) => {
  const tag = context.params?.tag;
  if (!tag) {
    return {
      notFound: true,
    };
  }

  const allTags = await notesApi.getAllTags();
  const displayTag = allTags.find((t) => slugifyTag(t) === tag) || tag;
  const relatedNotes = await notesApi.getNotesByTag(displayTag);

  return {
    props: {
      relatedNotes,
      tag,
      displayTag,
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const tags = await notesApi.getAllTags();

  return {
    paths: tags.map((tag) => ({
      params: { tag: slugifyTag(tag) },
    })),
    fallback: 'blocking',
  };
};
