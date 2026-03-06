import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { BreadcrumbJsonLd, NextSeo } from 'next-seo';
import Head from 'next/head';

import { Container } from '../components/Container';
import { PageTitle } from '../components/PageTitle';
import { SocialLink } from '../components/SocialLink';
import { SocialMedia } from '../data/lifeApi';
import { LinkedInIcon } from '../components/icons/LinkedInIcon';

const SITE_URL =
  process.env.NEXT_PUBLIC_URL || 'https://malaikaanisar.vercel.app';

const seoTitle = 'Contact — Malaika Nisar';
const seoDescription =
  'Get in touch with Malaika Nisar — Digital Marketer available for freelance and collaboration. Reach out via email or LinkedIn.';

export default function ContactPage() {
  const contactPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Malaika Nisar',
    description: seoDescription,
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'Person',
      name: 'Malaika Nisar',
      email: 'malaikaanisar2521@gmail.com',
      jobTitle: 'Digital Marketer',
      url: SITE_URL,
      sameAs: ['https://www.linkedin.com/in/malaikaanisar'],
    },
  };

  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        canonical={`${SITE_URL}/contact`}
        openGraph={{
          images: [
            {
              url: `${SITE_URL}/api/og?title=${encodeURIComponent('Contact')}&description=${encodeURIComponent(seoDescription)}`,
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
          { position: 2, name: 'Contact', item: `${SITE_URL}/contact` },
        ]}
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(contactPageJsonLd),
          }}
        />
      </Head>

      <Container className="mt-16 sm:mt-32">
        <div className="max-w-2xl">
          <PageTitle>Let&apos;s work together.</PageTitle>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            I&apos;m always open to new opportunities, collaborations, and
            interesting conversations about digital marketing. Feel free to reach
            out through any of the channels below.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {/* Email */}
          <div className="group rounded-2xl border border-zinc-100 p-6 transition hover:border-zinc-300 dark:border-zinc-700/40 dark:hover:border-zinc-600">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <EnvelopeIcon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Email
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Best way to reach me for project inquiries or collaborations.
            </p>
            <a
              href="mailto:malaikaanisar2521@gmail.com"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:underline"
            >
              malaikaanisar2521@gmail.com
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>

          {/* Socials */}
          <div className="group rounded-2xl border border-zinc-100 p-6 transition hover:border-zinc-300 dark:border-zinc-700/40 dark:hover:border-zinc-600">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20">
              <LinkedInIcon className="h-6 w-6 text-[#0A66C2]" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Socials
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Connect with me on social media for updates and insights.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {SocialMedia.map((social) => (
                <a
                  key={social.name}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:underline"
                >
                  {social.name}
                  <span aria-hidden="true">&rarr;</span>
                </a>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="group rounded-2xl border border-zinc-100 p-6 transition hover:border-zinc-300 dark:border-zinc-700/40 dark:hover:border-zinc-600">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Availability
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Currently available for freelance work and new opportunities.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Freelance projects
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Social media management
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Content strategy consulting
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Brand collaborations
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-zinc-50 p-8 dark:bg-zinc-800/50">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Response time
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            I typically respond within 24–48 hours. For urgent inquiries, email
            is the fastest way to reach me. Based in Rahim Yar Khan, Pakistan
            (PKT, UTC+5).
          </p>
        </div>
      </Container>
    </>
  );
}
