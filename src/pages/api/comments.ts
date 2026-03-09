import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getComments(req, res);
  }

  if (req.method === 'POST') {
    return postComment(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function getComments(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Missing slug parameter' });
  }

  try {
    const { db } = await connectToDatabase();
    const comments = await db
      .collection('comments')
      .find({ slug })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

async function postComment(req: NextApiRequest, res: NextApiResponse) {
  const { slug, name, comment, avatar } = req.body;

  if (!slug || !name || !comment || !avatar) {
    return res.status(400).json({ error: 'Missing required fields: slug, name, comment, avatar' });
  }

  if (name.length > 50) {
    return res.status(400).json({ error: 'Name must be under 50 characters' });
  }

  if (comment.length > 1000) {
    return res.status(400).json({ error: 'Comment must be under 1000 characters' });
  }

  try {
    const { db } = await connectToDatabase();
    const newComment = {
      slug,
      name: name.trim(),
      comment: comment.trim(),
      avatar,
      createdAt: new Date(),
    };

    const result = await db.collection('comments').insertOne(newComment);

    return res.status(201).json({
      ...newComment,
      _id: result.insertedId,
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    return res.status(500).json({ error: 'Failed to post comment' });
  }
}
