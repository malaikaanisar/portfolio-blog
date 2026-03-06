import { BreadcrumbJsonLd, NextSeo } from 'next-seo';

import { PageLayout } from '../components/PageLayout';
import { Tool } from '../components/tools/Tool';
import { ToolsSection } from '../components/tools/ToolsSection';
import { Tools } from '../data/lifeApi';

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://malaikaanisar.vercel.app';

const seoTitle = 'Tools — Malaika Nisar';
const seoDescription = 'Marketing tools, platforms, and software recommended by Malaika Nisar for digital marketing success.';

export default function ToolsPage() {
  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        canonical={`${SITE_URL}/tools`}
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
          { position: 2, name: 'Tools', item: `${SITE_URL}/tools` },
        ]}
      />
      <PageLayout
        title="Tools I use, platforms I love, and other things I recommend."
        intro="Here's a list of all the marketing tools and platforms I use."
      >
        <div className="space-y-20">
          {Object.entries(Tools).map(([title, tools]) => (
            <ToolsSection key={title} title={title}>
              {tools.map((tool) => (
                <Tool key={tool.title} title={tool.title} href={tool.href} logo={tool.logo} logoBg={tool.logoBg}>
                  {tool.description}
                </Tool>
              ))}
            </ToolsSection>
          ))}
        </div>
      </PageLayout>
    </>
  );
}
