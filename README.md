# Malaika Nisar — Personal Portfolio & Blog

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://typescriptlang.org/)

> A modern, SEO-optimized personal website and blog built with Next.js and Notion as a headless CMS.

[**🌐 Live Site**](https://malaikaa.space)

---

## Features

- **Blog System** — Content managed via Notion, with tags, cover images, and automatic sitemap inclusion
- **SEO Optimized** — Full meta tags, Open Graph, Twitter Cards, JSON-LD structured data, dynamic sitemap
- **Dark Mode** — System-aware theme toggle with `next-themes`
- **Static Generation** — SSG with ISR for fast page loads and fresh content
- **OG Image Generation** — Dynamic Open Graph images generated at the edge via `@vercel/og`
- **RSS Feed** — Auto-generated RSS feed at `/api/rss.xml`
- **Analytics** — Vercel Analytics integration
- **Responsive Design** — Mobile-first layout with Tailwind CSS
- **Performance** — Image optimization with Plaiceholder and Next.js Image

## Tech Stack

- [Next.js 14](https://nextjs.org/) — React framework with SSG/ISR
- [TypeScript](https://typescriptlang.org/) — Type safety
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [Notion API](https://developers.notion.com/) — Headless CMS
- [next-seo](https://github.com/garmeeh/next-seo) — SEO meta management
- [next-sitemap](https://github.com/iamvishnusankar/next-sitemap) — Sitemap generation
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Vercel](https://vercel.com/) — Hosting & deployment

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager
- A Notion account with an API integration

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/portfolio-blog.git
cd portfolio-blog

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
yarn dev
```

## Environment Variables

Create a `.env.local` file with:

```env
NOTION_TOKEN=your_notion_api_token
NOTION_DATABASE_ID=your_notion_database_id
NEXT_PUBLIC_URL=http://localhost:3000
SITE_URL=https://malaikaa.space
```

For production (Vercel), set `NEXT_PUBLIC_URL=https://malaikaa.space`.

### Getting Notion Credentials

1. Go to [Notion Integrations](https://www.notion.so/my-integrations) and create a new integration
2. Copy the **Internal Integration Token** → `NOTION_TOKEN`
3. Share your Notion database with the integration
4. Copy the **Database ID** from the database URL → `NOTION_DATABASE_ID`

## Notion Database Schema

Your Notion database should have these properties:

| Property | Type | Description |
|----------|------|-------------|
| `title` | Title | Blog post title |
| `slug` | Rich Text | URL slug for the post |
| `description` | Rich Text | SEO meta description |
| `published` | Checkbox | Whether to show on the site |
| `publishedAt` | Date | Publication date |
| `hashtags` | Multi-select | Tags/categories |
| `cover` | Files | Cover image |

## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn format` | Format code with Prettier |
| `yarn typecheck` | TypeScript type checking |
| `yarn postbuild` | Generate sitemap (auto after build) |

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── blogs/        # Blog-specific components
│   ├── icons/        # SVG icon components
│   ├── notion/       # Notion block renderer
│   └── tools/        # Tools page components
├── data/
│   └── lifeApi.tsx   # Personal data, projects, social links
├── lib/
│   ├── notesApi.ts   # Notion API client
│   ├── date.ts       # Date utilities
│   └── animation.ts  # Animation configs
├── pages/
│   ├── blogs/        # Blog listing & individual posts
│   ├── tags/         # Tag-filtered blog views
│   ├── api/          # OG image & RSS endpoints
│   ├── about.tsx     # About page
│   ├── work.tsx      # Work/projects page
│   └── tools.tsx     # Marketing tools page
└── styles/           # Global CSS & Prism themes
```

## SEO Features

- **DefaultSeo** in `_app.tsx` — Site-wide meta defaults, OG tags, Twitter cards
- **Per-page SEO** — Custom title, description, canonical URL on every page
- **JSON-LD Structured Data** — `WebSite`, `Person`, `ProfilePage`, `ArticleJsonLd` schemas
- **Dynamic Sitemap** — Auto-includes all blog posts with proper priorities via `next-sitemap`
- **Robots.txt** — Auto-generated with sitemap reference
- **OG Image API** — Dynamic images at `/api/og` for social sharing
- **RSS Feed** — Available at `/api/rss.xml`
- **Security Headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- **301 Redirects** — Old URLs redirect to new paths

## Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com/)
3. Set environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Set these in your Vercel project settings:
- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`
- `NEXT_PUBLIC_URL` = `https://malaikaa.space`
- `SITE_URL` = `https://malaikaa.space`

## License

[MIT](LICENSE) © 2025 Malaika Nisar
