/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://malaikaanisar.vercel.app',
  generateRobotsTxt: false,
  autoLastmod: true,
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*', '/404', '/500'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    additionalSitemaps: [],
  },
  transform: async (config, path) => {
    // Set higher priority for key pages
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path === '/blogs' || path === '/about') {
      priority = 0.9;
      changefreq = 'daily';
    } else if (path.startsWith('/blogs/')) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path === '/work' || path === '/tools') {
      priority = 0.7;
      changefreq = 'monthly';
    } else if (path === '/resume') {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (path.startsWith('/tags/')) {
      priority = 0.6;
      changefreq = 'weekly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
