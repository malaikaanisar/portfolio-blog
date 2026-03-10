import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { withAuth } from '../../../../lib/auth';
import { connectToDatabase } from '../../../../lib/mongodb';

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
