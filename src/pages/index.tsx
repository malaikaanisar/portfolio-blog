import { compareDesc } from 'date-fns';
import { GetStaticProps } from 'next';
import { BreadcrumbJsonLd, NextSeo } from 'next-seo';
import Head from 'next/head';

import { Container } from '../components/Container';
import { PageTitle } from '../components/PageTitle';
import { Photos } from '../components/Photos';
import { Resume } from '../components/Resume';
import { SocialLink } from '../components/SocialLink';
import { BlogPreview } from '../components/blogs/BlogPreview';
import { About, Name, SocialMedia } from '../data/lifeApi';
import { BlogPost, notesApi } from '../lib/notesApi';

const seoTitle = 'Malaika Nisar';
const seoDescription =
  'Digital Marketer specializing in social media marketing, content strategy, and data-driven campaigns. Based in Rahim Yar Khan, Pakistan.';

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://malaikaanisar.vercel.app';

type Props = {
  latestBlogs: BlogPost[];
};

export default function Home({ latestBlogs }: Props) {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Malaika Nisar',
    url: SITE_URL,
    description: seoDescription,
    author: {
      '@type': 'Person',
      name: 'Malaika Nisar',
    },
  };

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Malaika Nisar',
    url: SITE_URL,
    jobTitle: 'Digital Marketer',
    description: seoDescription,
    email: 'malaikaanisar2521@gmail.com',
    sameAs: ['https://www.linkedin.com/in/malaikaanisar'],
    knowsAbout: [
      'Digital Marketing',
      'Social Media Marketing',
      'Content Strategy',
      'SEO',
      'Brand Management',
      'Paid Advertising',
    ],
  };

  return (
    <>
      <NextSeo
        description={seoDescription}
        canonical={SITE_URL}
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
        ]}
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </Head>
      <Container className="mt-9">
        <div className="max-w-2xl">
          <PageTitle>{Name}</PageTitle>
          <p className="mt-6 max-w-2xl text-base text-balance">{About}</p>
          <div className="mt-6 flex gap-6">
            {SocialMedia.map((socialProfile) => (
              <SocialLink
                key={socialProfile.name}
                aria-label={`Follow on ${socialProfile.name}`}
                href={socialProfile.link}
                icon={socialProfile.icon}
              />
            ))}
          </div>
        </div>
      </Container>
      <Photos />
      <Container className="mt-12">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-16">
            {latestBlogs.map((blogPost) => (
              <BlogPreview key={blogPost.slug} post={blogPost} dense />
            ))}
          </div>
          <div className="lg:ml-auto space-y-10 lg:pl-16 xl:pl-24">
            <Resume />
          </div>
        </div>
      </Container>
    </>
  );
}

const NEWEST_POSTS_TO_DISPLAY = 5;

export const getStaticProps: GetStaticProps<Props> = async () => {
  const latestBlogs = await notesApi.getNotes('desc', NEWEST_POSTS_TO_DISPLAY);

  return {
    props: { latestBlogs },
    revalidate: 10,
  };
};
