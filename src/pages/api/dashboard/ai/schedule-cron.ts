import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';
import { connectToDatabase } from '../../../../lib/mongodb';
import { verifyToken } from '../../../../lib/auth';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

/**
 * Cron endpoint: Checks for scheduled posts whose time has arrived and publishes them.
 *
 * Call this endpoint periodically via Vercel Cron, a cron service, or manually from the dashboard.
 * Accepts an optional `secret` query param or CRON_SECRET env var for security.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple auth: allow dashboard token OR a cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  const querySecret = req.query.secret;

  const dashboardToken = req.cookies['dashboard_token'];
  const hasDashboardAuth = (dashboardToken && verifyToken(dashboardToken)) || authHeader?.startsWith('Bearer ');
  const hasCronAuth = cronSecret && (querySecret === cronSecret || authHeader === `Bearer ${cronSecret}`);

  if (!hasDashboardAuth && !hasCronAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.NOTION_TOKEN) {
    return res.status(503).json({ error: 'Notion API credentials are not configured.' });
  }

  try {
    const { db } = await connectToDatabase();
    const now = new Date();

    // Find all pending posts that are due
    const duePosts = await db
      .collection('scheduled_posts')
      .find({
        status: 'pending',
        scheduledFor: { $lte: now },
      })
      .toArray();

    if (duePosts.length === 0) {
      return res.status(200).json({ message: 'No posts due for publishing.', published: 0 });
    }

    const results: { id: string; title: string; success: boolean; error?: string }[] = [];

    for (const post of duePosts) {
      try {
        // Set the Notion page's "published" checkbox to true
        await notion.pages.update({
          page_id: post.notionPageId,
          properties: {
            published: { checkbox: true },
          },
        });

        // Mark as published in MongoDB
        await db.collection('scheduled_posts').updateOne(
          { _id: post._id },
          { $set: { status: 'published', publishedAt: now } },
        );

        results.push({ id: post.notionPageId, title: post.title, success: true });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        results.push({ id: post.notionPageId, title: post.title, success: false, error: message });

        // Mark as failed
        await db.collection('scheduled_posts').updateOne(
          { _id: post._id },
          { $set: { status: 'failed', error: message, failedAt: now } },
        );
      }
    }

    return res.status(200).json({
      message: `Processed ${results.length} scheduled post(s).`,
      published: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Schedule Cron]', message);
    return res.status(500).json({ error: `Scheduling error: ${message}` });
  }
}

export default handler;
