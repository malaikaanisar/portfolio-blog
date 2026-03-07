import { GetStaticProps } from 'next';
import { BreadcrumbJsonLd, NextSeo } from 'next-seo';

import { Badge } from '../../components/Badge';
import { PageLayout } from '../../components/PageLayout';
import { BlogPreview } from '../../components/blogs/BlogPreview';
import { BlogPost, notesApi } from '../../lib/notesApi';
import { slugifyTag } from '../../lib/slugify';

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://malaikaa.space';

const seoTitle = 'Blog — Malaika Nisar';
const seoDescription =
  'Insights on digital marketing, social media strategy, content creation, SEO, and brand growth by Malaika Nisar.';

interface Props {
  notes: BlogPost[];
  tags: Array<string>;
}

export default function Blogs({ notes, tags }: Props) {
  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        canonical={`${SITE_URL}/blogs`}
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
      <BreadcrumbJsonLd
        itemListElements={[
          { position: 1, name: 'Home', item: SITE_URL },
          { position: 2, name: 'Blog', item: `${SITE_URL}/blogs` },
        ]}
      />
      <PageLayout
        title="Blog posts on digital marketing, social media, and more."
        intro="All of my thoughts on digital marketing, social media strategies, content creation, and other topics."
      >
        <h3 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">Tags</h3>
        <div className="mt-4 flex max-w-xl flex-wrap gap-1 font-mono">
          {tags.map((tag) => (
            <Badge key={tag} href={`/tags/${slugifyTag(tag)}`}>
              #{tag}
            </Badge>
          ))}
        </div>

        <div className="mt-24 md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {notes.map((post) => (
              <BlogPreview key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </PageLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const notes = await notesApi.getNotes('desc');

  return {
    props: {
      notes,
      tags: Array.from(new Set(notes.map((post) => post.tags).flat())),
    },
    revalidate: 10,
  };
};
