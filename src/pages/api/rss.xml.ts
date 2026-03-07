import { NextApiHandler } from 'next';
import RSS from 'rss';

import { notesApi } from '../../lib/notesApi';

const rss: NextApiHandler = async (req, res) => {
  const feed = new RSS({
    title: 'Malaika Nisar',
    site_url: process.env.NEXT_PUBLIC_URL || 'https://malaikaa.space',
    feed_url: `${process.env.NEXT_PUBLIC_URL || 'https://malaikaa.space'}/rss.xml`,
  });

  const allPosts = await notesApi.getNotes();
  allPosts.map((post) => {
    feed.item({
      title: post.title,
      url: `${process.env.NEXT_PUBLIC_URL || 'https://malaikaa.space'}/blogs/${post.slug}`,
      date: post.publishedAt,
      description: post.description,
    });
  });

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=1200, stale-while-revalidate=600');
  res.write(feed.xml({ indent: true }));
  res.end();
};

export default rss;
