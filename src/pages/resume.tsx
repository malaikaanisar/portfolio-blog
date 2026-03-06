import { ArrowDownTrayIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { BreadcrumbJsonLd, NextSeo } from 'next-seo';
import Head from 'next/head';
import React, { useRef } from 'react';

import { Container } from '../components/Container';
import { ExternalLink } from '../components/ExternalLink';
import { SocialMedia, Work, Name, CompaniesLinks } from '../data/lifeApi';

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://malaikaanisar.vercel.app';

const seoTitle = 'Resume — Malaika Nisar';
const seoDescription =
  'Professional resume of Malaika Nisar — Digital Marketer specializing in social media marketing, content strategy, and e-commerce management.';

function getCompanyLink(companyName: string) {
  const found = CompaniesLinks.find((c) => c.name === companyName);
  return found?.link || '#';
}

export default function ResumePage() {
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    window.print();
  };

  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        canonical={`${SITE_URL}/resume`}
        openGraph={{
          images: [
            {
              url: `${SITE_URL}/api/og?title=${encodeURIComponent('Resume')}&description=${encodeURIComponent(seoDescription)}`,
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
          { position: 2, name: 'Resume', item: `${SITE_URL}/resume` },
        ]}
      />
      <Head>
        <style>{`
          @media print {
            header, footer, nav, .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { background: white !important; color: black !important; }
            .resume-container { 
              max-width: 100% !important; 
              margin: 0 !important; 
              padding: 20px !important;
              box-shadow: none !important;
              border: none !important;
            }
            .dark .resume-container * { color: black !important; border-color: #e5e7eb !important; }
          }
        `}</style>
      </Head>
      <Container className="mt-16 sm:mt-32">
        <div className="flex items-center justify-between mb-8 no-print">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
            Resume
          </h1>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Download PDF
          </button>
        </div>

        <div
          ref={resumeRef}
          className="resume-container rounded-2xl border border-zinc-100 bg-white p-8 shadow-sm dark:border-zinc-700/40 dark:bg-zinc-900 sm:p-12"
        >
          {/* Header */}
          <div className="border-b border-zinc-200 pb-6 dark:border-zinc-700">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {Name}
            </h2>
            <p className="mt-1 text-lg text-primary font-medium">
              Digital Marketer & Social Media Specialist
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <a
                href="mailto:malaikaanisar2521@gmail.com"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <EnvelopeIcon className="h-4 w-4" />
                malaikaanisar2521@gmail.com
              </a>
              <a
                href="https://www.linkedin.com/in/malaikaanisar"
                className="hover:text-primary transition-colors"
              >
                linkedin.com/in/malaikaanisar
              </a>
              <a
                href={SITE_URL}
                className="hover:text-primary transition-colors"
              >
                malaikaanisar.vercel.app
              </a>
              <span>Rahim Yar Khan, Pakistan</span>
            </div>
          </div>

          {/* Summary */}
          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Professional Summary
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              Results-driven Social Media Marketing Specialist with hands-on experience in
              developing and executing data-driven digital strategies that enhance brand visibility
              and drive engagement. Skilled in content marketing, paid advertising, performance
              analytics, Shopify e-commerce management, and campaign optimization. Passionate about
              helping businesses grow through creative and analytical marketing approaches.
            </p>
          </section>

          {/* Experience */}
          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Work Experience
            </h3>
            <div className="mt-4 space-y-6">
              {/* Bacha Toys / Junior Land / Golu Baby */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      Content Manager & Social Media Marketer
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      <ExternalLink href="https://bachatoys.com">Bacha Toys</ExternalLink>
                      {' · '}
                      <ExternalLink href="https://juniorland.store">Junior Land</ExternalLink>
                      {' · '}
                      <ExternalLink href="https://golubaby.com">Golu Baby</ExternalLink>
                    </p>
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap ml-4">
                    Sep 2024 — Present
                  </span>
                </div>
                <ul className="mt-2 list-disc list-outside ml-4 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                  <li>
                    Manage social media accounts across Facebook, Instagram, and TikTok for
                    Pakistan&apos;s #1 toy store brands
                  </li>
                  <li>
                    Plan, execute, and optimize paid advertising campaigns to drive sales and brand
                    awareness
                  </li>
                  <li>
                    Manage Shopify e-commerce websites including product listings, content updates,
                    and store optimization
                  </li>
                  <li>
                    Create engaging content strategies that increase audience engagement and
                    follower growth
                  </li>
                  <li>
                    Analyze campaign performance metrics and optimize strategies to maximize ROI
                  </li>
                </ul>
              </div>

              {/* G-Tech Solutions */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      Social Media Marketing Specialist
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">G-Tech Solutions</p>
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap ml-4">
                    May 2024 — Aug 2024
                  </span>
                </div>
                <ul className="mt-2 list-disc list-outside ml-4 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                  <li>
                    Planned, executed, and optimized social media marketing strategies to enhance
                    brand visibility and engagement
                  </li>
                  <li>
                    Managed content creation and scheduling across multiple social media platforms
                  </li>
                  <li>
                    Developed and monitored paid advertising campaigns to generate leads and
                    conversions
                  </li>
                  <li>
                    Analyzed performance metrics to improve overall campaign effectiveness and ROI
                  </li>
                  <li>
                    Collaborated with the team to strengthen digital presence and ensure consistent
                    brand messaging
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Skills</h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Marketing & Strategy
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    'Social Media Marketing',
                    'Content Strategy',
                    'Paid Advertising',
                    'SEO',
                    'Campaign Management',
                    'Brand Management',
                    'Email Marketing',
                    'Influencer Outreach',
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Tools & Platforms
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    'Meta Business Suite',
                    'Google Analytics',
                    'Google Ads',
                    'Shopify',
                    'Canva',
                    'Hootsuite',
                    'Mailchimp',
                    'WordPress',
                  ].map((tool) => (
                    <span
                      key={tool}
                      className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Education */}
          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Education
            </h3>
            <div className="mt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Bachelor of Science in Information Technology
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    The Islamia University of Bahawalpur
                  </p>
                </div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap ml-4">
                  2024 — 2028
                </span>
              </div>
            </div>
          </section>

          {/* Interests */}
          <section className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-700">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Interests
            </h3>
            <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
              Digital Marketing Trends · E-commerce Growth Strategies · Content Creation · Brand
              Storytelling · Data Analytics · Social Media Innovation
            </p>
          </section>
        </div>
      </Container>
    </>
  );
}
