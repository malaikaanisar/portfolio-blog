import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/mongodb';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { db } = await connectToDatabase();
  const collection = db.collection('drafts');

  // GET - List all drafts
  if (req.method === 'GET') {
    try {
      const drafts = await collection.find().sort({ updatedAt: -1 }).toArray();
      return res.status(200).json(drafts);
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
      return res.status(500).json({ error: 'Failed to fetch drafts' });
    }
  }

  // POST - Create a new draft
  if (req.method === 'POST') {
    try {
      const { title, content, category } = req.body;

      if (!title?.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const draft = {
        title: title.trim(),
        content: content?.trim() || '',
        category: category?.trim() || 'idea',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(draft);
      return res.status(201).json({ ...draft, _id: result.insertedId });
    } catch (error) {
      console.error('Failed to create draft:', error);
      return res.status(500).json({ error: 'Failed to create draft' });
    }
  }

  // PUT - Update a draft
  if (req.method === 'PUT') {
    try {
      const { ObjectId } = await import('mongodb');
      const { id, title, content, category } = req.body;

      if (!id) return res.status(400).json({ error: 'Missing draft ID' });

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (title !== undefined) updates.title = title.trim();
      if (content !== undefined) updates.content = content.trim();
      if (category !== undefined) updates.category = category.trim();

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates },
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to update draft:', error);
      return res.status(500).json({ error: 'Failed to update draft' });
    }
  }

  // DELETE
  if (req.method === 'DELETE') {
    try {
      const { ObjectId } = await import('mongodb');
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing draft ID' });
      }

      await collection.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to delete draft:', error);
      return res.status(500).json({ error: 'Failed to delete draft' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
