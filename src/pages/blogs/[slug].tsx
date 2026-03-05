import { GetStaticPaths, GetStaticProps } from 'next';
import { ArticleJsonLd, NextSeo } from 'next-seo';
import Prism from 'prismjs';
import { useEffect } from 'react';

import { XIcon } from '../../components/icons/XIcon';
import { BlogLayout } from '../../components/blogs/BlogLayout';
import { NotionBlockRenderer } from '../../components/notion/NotionBlockRenderer';
import { BlogPost, notesApi } from '../../lib/notesApi';

type Props = {
  note: BlogPost;
  noteContent: any[];
};

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://malaikaanisar.vercel.app';

export default function Blog({
  note: { title, description, createdAt, slug, tags, coverImage },
  noteContent,
  previousPathname,
}: Props & { previousPathname: string }) {
  const url = `${SITE_URL}/blogs/${slug}`;
  const openGraphImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`;

  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <>
      <NextSeo
        title={`${title} — Malaika Nisar`}
        description={description}
        canonical={url}
        openGraph={{
          type: 'article',
          article: {
            publishedTime: createdAt,
            authors: ['https://www.linkedin.com/in/malaikaanisar'],
            tags: tags,
          },
          images: [
            {
              url: openGraphImageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        }}
      />
      <ArticleJsonLd
        url={url}
        images={[openGraphImageUrl]}
        title={title}
        datePublished={createdAt}
        authorName="Malaika Nisar"
        publisherName="Malaika Nisar"
        publisherLogo={`${SITE_URL}/favicon/apple-touch-icon.png`}
        description={description}
      />
      <BlogLayout
        meta={{ title, description, date: createdAt }}
        previousPathname={previousPathname}
      >
        <div className="pb-32">
          {noteContent.map((block) => (
            <NotionBlockRenderer key={block.id} block={block} />
          ))}

          <hr />

          <a
            className="group block text-xl font-semibold md:text-3xl no-underline"
            href={`http://x.com/share?text=${title}&url=${url}`}
          >
            <h4 className="max-w-lg flex cursor-pointer flex-col duration-200 ease-in-out group-hover:text-primary group-hover:fill-primary fill-white text-wrap">
              <XIcon className="my-6 h-10 w-10 transform transition-transform group-hover:-rotate-12 text-black dark:text-white group-hover:text-primary" />
              Click here to share this article with your friends on X if you liked it.
            </h4>
          </a>
        </div>
      </BlogLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props, { slug: string }> = async (context) => {
  const slug = context.params?.slug;
  const allNotes = await notesApi.getNotes();
  const note = allNotes.find((note) => note.slug === slug);

  if (!note) {
    return {
      notFound: true,
    };
  }

  const noteContent = await notesApi.getNote(note.id);

  return {
    props: {
      note,
      noteContent,
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await notesApi.getNotes();

  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: 'blocking',
  };
};
