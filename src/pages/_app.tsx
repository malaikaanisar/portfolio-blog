import { Analytics } from '@vercel/analytics/react';
import 'focus-visible';
import { DefaultSeo } from 'next-seo';
import { ThemeProvider } from 'next-themes';
import { AppProps } from 'next/app';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import React, { useEffect, useRef } from 'react';

import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import '../styles/index.css';
import '../styles/prism.css';

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://malaikaanisar.vercel.app';

function usePrevious(value: string) {
  let ref = useRef<string>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export default function App({ Component, pageProps, router }: AppProps) {
  let previousPathname = usePrevious(router.pathname);

  return (
    <>
      <DefaultSeo
        titleTemplate="%s — Malaika Nisar"
        defaultTitle="Malaika Nisar — Digital Marketer"
        description="Malaika Nisar is a results-driven Digital Marketer specializing in social media marketing, content strategy, and data-driven campaigns."
        canonical={`${SITE_URL}${router.asPath}`}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${SITE_URL}${router.asPath}`,
          siteName: 'Malaika Nisar',
          title: 'Malaika Nisar — Digital Marketer',
          description:
            'Malaika Nisar is a results-driven Digital Marketer specializing in social media marketing, content strategy, and data-driven campaigns.',
          images: [
            {
              url: `${SITE_URL}/api/og?title=Malaika+Nisar&description=Digital+Marketer`,
              width: 1200,
              height: 630,
              alt: 'Malaika Nisar — Digital Marketer',
              type: 'image/png',
            },
          ],
        }}
        twitter={{
          handle: '@malaikanisar',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          { name: 'author', content: 'Malaika Nisar' },
          {
            name: 'keywords',
            content:
              'digital marketing, social media marketing, content strategy, SEO, brand management, Malaika Nisar, digital marketer Pakistan',
          },
          { name: 'robots', content: 'index, follow' },
          { name: 'googlebot', content: 'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1' },
        ]}
        additionalLinkTags={[
          { rel: 'icon', href: '/favicon/favicon.ico' },
          { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
          { rel: 'manifest', href: '/favicon/site.webmanifest' },
          {
            rel: 'alternate',
            type: 'application/rss+xml',
            href: `${SITE_URL}/api/rss.xml`,
          },
        ]}
      />
      <ThemeProvider attribute="class">
        <div className={`${GeistSans.className}`}>
          <div className="fixed inset-0 flex justify-center sm:px-8">
            <div className="flex w-full max-w-7xl lg:px-8">
              <div className="w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20" />
            </div>
          </div>
          <div className="relative">
            <Header />
            <main>
              <Component previousPathname={previousPathname} {...pageProps} />
            </main>
            <Footer />
          </div>
          <Analytics />
        </div>
      </ThemeProvider>
    </>
  );
}
