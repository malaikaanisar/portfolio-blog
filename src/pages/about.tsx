import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';

import AvatarImage from '../../public/assets/blog/authors/malaika.png';
import { Container } from '../components/Container';
import { ExternalLink } from '../components/ExternalLink';
import { PageTitle } from '../components/PageTitle';
import { Quote } from '../components/Quote';
import { Section } from '../components/Section';
import { SocialLink } from '../components/SocialLink';
import {
  AboutExtended,
  Blogs,
  Books,
  PeopleWorthFollowingOnTwitter,
  Podcasts,
  Quotes,
  SocialMedia,
  VideosWorthWatching,
} from '../data/lifeApi';

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://malaikaanisar.vercel.app';

const seoTitle = 'About — Malaika Nisar';
const seoDescription =
  'Learn about Malaika Nisar — a results-driven Digital Marketer specializing in social media marketing, content strategy, and data-driven campaigns.';

export default function AboutMe() {
  const randomQuote = useMemo(() => Quotes[Math.floor(Math.random() * Quotes.length)], []);

  const profilePageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: 'Malaika Nisar',
      jobTitle: 'Digital Marketer',
      description: seoDescription,
      email: 'malaikaanisar2521@gmail.com',
      url: `${SITE_URL}/about`,
      sameAs: ['https://www.linkedin.com/in/malaikaanisar'],
      alumniOf: {
        '@type': 'EducationalOrganization',
        name: 'The Islamia University of Bahawalpur',
      },
      worksFor: {
        '@type': 'Organization',
        name: 'G-Tech Solutions',
      },
      knowsAbout: [
        'Digital Marketing',
        'Social Media Marketing',
        'Content Strategy',
        'SEO',
        'Brand Management',
      ],
    },
  };

  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        canonical={`${SITE_URL}/about`}
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
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageJsonLd) }}
        />
      </Head>
      <Container className="mt-16 sm:mt-32">
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
          <div className="lg:pl-20">
            <div className="max-w-xs px-2.5 lg:max-w-none">
              <Image
                src={AvatarImage}
                alt="Malaika Nisar — Digital Marketer"
                sizes="(min-width: 1024px) 32rem, 20rem"
                className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
                priority
              />
            </div>
          </div>
          <div className="lg:order-first lg:row-span-2">
            <PageTitle>Hi, I&apos;m Malaika Nisar.</PageTitle>
            <div className="mt-6 text-base">{AboutExtended}</div>
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

            <Section>
              <Section.Title as="h2">Work</Section.Title>
              <Section.Content>
                I currently work as a Content Manager &amp; Social Media Marketer for
                Pakistan&apos;s #1 toy stores —{' '}
                <ExternalLink href="https://bachatoys.com">Bacha Toys</ExternalLink>,{' '}
                <ExternalLink href="https://juniorland.store">Junior Land</ExternalLink>, and{' '}
                <ExternalLink href="https://golubaby.com">Golu Baby</ExternalLink>. I manage
                their social media presence, run advertising campaigns, and handle their Shopify
                e-commerce websites to drive sales and brand growth.
                <br />
                <br />
                Previously, at{' '}
                <ExternalLink href={'#'}>G-Tech Solutions</ExternalLink>, I was responsible for
                planning, executing, and optimizing social media marketing strategies to enhance
                brand visibility and engagement. I managed content creation and scheduling across
                multiple platforms, developed and monitored paid advertising campaigns, and
                analyzed performance metrics to maximize ROI.
                <br />
                <br />
                If you&apos;d like to work with me, just{' '}
                <ExternalLink href="mailto:malaikaanisar2521@gmail.com">email me.</ExternalLink>
              </Section.Content>
            </Section>
            <Section>
              <Section.Title as="h2">Books worth re-reading</Section.Title>
              <Section.Content>
                <ul className="mt-1 list-disc list-inside">
                  {Books.map((book) => (
                    <li key={book.name}>
                      <ExternalLink href={book.link}>{book.name}</ExternalLink>
                    </li>
                  ))}
                </ul>
              </Section.Content>
            </Section>
            <Section>
              <Section.Title as="h2">Podcasts I listen to</Section.Title>
              <Section.Content>
                <ul className="mt-1 list-disc list-inside">
                  {Podcasts.map((podcast) => (
                    <li key={podcast.name}>
                      <ExternalLink href={podcast.link}>{podcast.name}</ExternalLink>
                    </li>
                  ))}
                </ul>
              </Section.Content>
            </Section>
            <Section>
              <Section.Title as="h2">Blogs I read</Section.Title>
              <Section.Content>
                <ul className="mt-1 list-disc list-inside">
                  {Blogs.map((blog) => (
                    <li key={blog.name}>
                      <ExternalLink href={blog.link}>{blog.name}</ExternalLink>
                    </li>
                  ))}
                </ul>
              </Section.Content>
            </Section>
            <Section>
              <Section.Title as="h2">Videos worth watching</Section.Title>
              <Section.Content>
                <ul className="mt-1 list-disc list-inside">
                  {VideosWorthWatching.map((video) => (
                    <li key={video.name}>
                      <ExternalLink href={video.link}>{video.name}</ExternalLink>
                    </li>
                  ))}
                </ul>
              </Section.Content>
            </Section>
            <Section>
              <Section.Title as="h2">People with unique perspective I follow</Section.Title>
              <Section.Content>
                {PeopleWorthFollowingOnTwitter.map<React.ReactNode>((personOnTwitter) => (
                  <ExternalLink key={personOnTwitter.name} href={personOnTwitter.link}>
                    {personOnTwitter.name}
                  </ExternalLink>
                )).reduce((prev, curr) => [prev, ', ', curr])}
                .
              </Section.Content>
            </Section>
            <Section>
              <Section.Title as="h2">Quote worth thinking about</Section.Title>
              <Section.Content>
                <div className="mt-8">
                  <Quote quote={randomQuote.content} author={randomQuote.author} />
                </div>
              </Section.Content>
            </Section>
          </div>
        </div>
      </Container>
    </>
  );
}
