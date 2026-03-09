import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/auth';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ property: 'publishedAt', direction: 'descending' }],
    });

    const allTags = new Set<string>();

    const blogs = response.results.map((page: any) => {
      const props = page.properties;
      const tags = props.hashtags?.multi_select?.map((t: any) => t.name) || [];
      tags.forEach((t: string) => allTags.add(t));

      return {
        id: page.id,
        title: props.title?.title?.[0]?.plain_text || 'Untitled',
        description: props.description?.rich_text?.[0]?.plain_text || '',
        slug: props.slug?.rich_text?.[0]?.plain_text || '',
        tags,
        isPublished: props.published?.checkbox || false,
        inProgress: props.inProgress?.checkbox || false,
        publishedAt: props.publishedAt?.date?.start || page.created_time,
        lastEdited: page.last_edited_time,
        cover: page.cover?.external?.url || page.cover?.file?.url || null,
      };
    });

    return res.status(200).json({
      blogs,
      total: blogs.length,
      totalTags: allTags.size,
    });
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    return res.status(500).json({ error: 'Failed to fetch blogs' });
  }
}

export default withAuth(handler);
