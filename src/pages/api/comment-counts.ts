import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slugs } = req.query;

  if (!slugs || typeof slugs !== 'string') {
    return res.status(400).json({ error: 'Missing slugs parameter (comma-separated)' });
  }

  const slugList = slugs.split(',').map((s) => s.trim()).filter(Boolean);

  if (slugList.length === 0) {
    return res.status(200).json({});
  }

  try {
    const { db } = await connectToDatabase();
    const counts = await db
      .collection('comments')
      .aggregate([
        { $match: { slug: { $in: slugList } } },
        { $group: { _id: '$slug', count: { $sum: 1 } } },
      ])
      .toArray();

    const result: Record<string, number> = {};
    for (const slug of slugList) {
      result[slug] = 0;
    }
    for (const item of counts) {
      result[item._id] = item.count;
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching comment counts:', error);
    return res.status(500).json({ error: 'Failed to fetch comment counts' });
  }
}
