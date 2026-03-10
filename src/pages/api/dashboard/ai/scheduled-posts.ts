import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { Client } from '@notionhq/client';
import { withAuth } from '../../../../lib/auth';
import { connectToDatabase } from '../../../../lib/mongodb';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { db } = await connectToDatabase();
  const collection = db.collection('scheduled_posts');

  // GET: List all scheduled posts
  if (req.method === 'GET') {
    const posts = await collection.find({}).sort({ scheduledFor: -1 }).toArray();
    return res.status(200).json({ posts });
  }

  // DELETE: Cancel a scheduled post
  if (req.method === 'DELETE') {
    const { id } = req.query as { id: string };
    if (!id) return res.status(400).json({ error: '"id" query param is required.' });

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Scheduled post not found.' });
    }
    return res.status(200).json({ success: true });
  }

  // PUT: Publish a single post immediately ("Post Now")
  if (req.method === 'PUT') {
    const { id } = req.body as { id: string };
    if (!id) return res.status(400).json({ error: '"id" is required.' });

    if (!process.env.NOTION_TOKEN) {
      return res.status(503).json({ error: 'Notion API credentials are not configured.' });
    }

    const post = await collection.findOne({ _id: new ObjectId(id) });
    if (!post) return res.status(404).json({ error: 'Scheduled post not found.' });
    if (post.status === 'published') return res.status(400).json({ error: 'Post is already published.' });

    try {
      await notion.pages.update({
        page_id: post.notionPageId,
        properties: { published: { checkbox: true } },
      });

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'published', publishedAt: new Date() } },
      );

      return res.status(200).json({ success: true, message: `"${post.title}" published successfully.` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'failed', error: message, failedAt: new Date() } },
      );
      return res.status(500).json({ error: `Failed to publish: ${message}` });
    }
  }

  // PATCH: Update schedule time
  if (req.method === 'PATCH') {
    const { id, scheduledFor } = req.body as { id: string; scheduledFor: string };
    if (!id || !scheduledFor) {
      return res.status(400).json({ error: '"id" and "scheduledFor" are required.' });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { scheduledFor: new Date(scheduledFor) } },
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Scheduled post not found.' });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
