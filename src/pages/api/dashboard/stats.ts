import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/mongodb';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const commentsCollection = db.collection('comments');

    const totalComments = await commentsCollection.countDocuments();
    const recentComments = await commentsCollection
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Get comments per post
    const commentsByPost = await commentsCollection
      .aggregate([
        { $group: { _id: '$slug', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    // Get comments over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = await commentsCollection.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Daily comment counts for chart (last 7 days)
    const dailyComments = await commentsCollection
      .aggregate([
        {
          $match: { createdAt: { $gte: sevenDaysAgo } },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    return res.status(200).json({
      totalComments,
      recentCount,
      recentComments,
      commentsByPost,
      dailyComments,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

export default withAuth(handler);
