import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { db } = await connectToDatabase();
  const collection = db.collection('comments');

  // GET - List all comments with pagination
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const slug = req.query.slug as string;
      const search = req.query.search as string;
      const skip = (page - 1) * limit;

      const filter: Record<string, unknown> = {};
      if (slug) filter.slug = slug;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { comment: { $regex: search, $options: 'i' } },
        ];
      }

      const [comments, total] = await Promise.all([
        collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
        collection.countDocuments(filter),
      ]);

      return res.status(200).json({
        comments,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  // PUT - Reply to a comment
  if (req.method === 'PUT') {
    try {
      const { id, reply } = req.body;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing comment ID' });
      }

      if (reply !== undefined && reply !== null && typeof reply !== 'string') {
        return res.status(400).json({ error: 'Reply must be a string' });
      }

      const trimmedReply = reply?.trim();

      // If reply is empty/null, remove the reply
      if (!trimmedReply) {
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $unset: { adminReply: '' } },
        );
        return res.status(200).json({ success: true, removed: true });
      }

      if (trimmedReply.length > 1000) {
        return res.status(400).json({ error: 'Reply must be under 1000 characters' });
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            adminReply: {
              text: trimmedReply,
              repliedAt: new Date(),
            },
          },
        },
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to reply to comment:', error);
      return res.status(500).json({ error: 'Failed to reply' });
    }
  }

  // DELETE - Delete a comment
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing comment ID' });
      }

      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to delete comment:', error);
      return res.status(500).json({ error: 'Failed to delete comment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
