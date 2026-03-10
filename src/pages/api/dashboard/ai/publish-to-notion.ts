import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';
import { withAuth } from '../../../../lib/auth';
import { connectToDatabase } from '../../../../lib/mongodb';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

/**
 * Converts markdown text into Notion block children.
 * Handles headings, paragraphs, bullet lists, numbered lists, dividers, and bold/italic/links.
 */
function markdownToNotionBlocks(markdown: string): any[] {
  const lines = markdown.split('\n');
  const blocks: any[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) continue;

    // Divider
    if (/^---+$/.test(line.trim())) {
      blocks.push({ object: 'block', type: 'divider', divider: {} });
      continue;
    }

    // Heading 1
    if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: { rich_text: parseInlineMarkdown(line.slice(2).trim()) },
      });
      continue;
    }

    // Heading 2
    if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: parseInlineMarkdown(line.slice(3).trim()) },
      });
      continue;
    }

    // Heading 3
    if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: parseInlineMarkdown(line.slice(4).trim()) },
      });
      continue;
    }

    // Bullet list item
    if (/^[-*]\s/.test(line.trim())) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: parseInlineMarkdown(line.trim().slice(2).trim()) },
      });
      continue;
    }

    // Numbered list item
    if (/^\d+\.\s/.test(line.trim())) {
      blocks.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: parseInlineMarkdown(line.trim().replace(/^\d+\.\s/, '').trim()),
        },
      });
      continue;
    }

    // Paragraph (default)
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: parseInlineMarkdown(line.trim()) },
    });
  }

  return blocks;
}

/** Parse inline markdown (bold, italic, links) into Notion rich_text objects */
function parseInlineMarkdown(text: string): any[] {
  const segments: any[] = [];
  // Regex for **bold**, *italic*, [link text](url)
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Plain text before this match
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: { content: text.slice(lastIndex, match.index) },
      });
    }

    if (match[2]) {
      // **bold**
      segments.push({
        type: 'text',
        text: { content: match[2] },
        annotations: { bold: true },
      });
    } else if (match[4]) {
      // *italic*
      segments.push({
        type: 'text',
        text: { content: match[4] },
        annotations: { italic: true },
      });
    } else if (match[6] && match[7]) {
      // [link](url)
      segments.push({
        type: 'text',
        text: { content: match[6], link: { url: match[7] } },
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining plain text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      text: { content: text.slice(lastIndex) },
    });
  }

  if (segments.length === 0) {
    segments.push({ type: 'text', text: { content: text } });
  }

  return segments;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, description, content, tags, published, scheduleAt } = req.body as {
    title: string;
    description?: string;
    content: string; // markdown
    tags?: string[];
    published?: boolean;
    scheduleAt?: string; // ISO date string for scheduled publishing
  };

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: '"title" and "content" are required.' });
  }

  if (!process.env.NOTION_TOKEN || !DATABASE_ID) {
    return res.status(503).json({ error: 'Notion API credentials are not configured.' });
  }

  try {
    const slug = slugify(title);
    const publishDate = scheduleAt
      ? new Date(scheduleAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const shouldPublish = scheduleAt ? false : published !== false; // if scheduling, start unpublished

    // Build Notion blocks from markdown (Notion API has a 100-block limit per request)
    const allBlocks = markdownToNotionBlocks(content);
    const firstBatch = allBlocks.slice(0, 100);

    // Create the page in Notion
    const page = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        title: {
          title: [{ text: { content: title } }],
        },
        description: {
          rich_text: [
            { text: { content: description || `A blog post about ${title}` } },
          ],
        },
        slug: {
          rich_text: [{ text: { content: slug } }],
        },
        published: {
          checkbox: shouldPublish,
        },
        publishedAt: {
          date: { start: publishDate },
        },
        hashtags: {
          multi_select: (tags || ['Digital Marketing']).map((tag) => ({ name: tag })),
        },
        ...(req.body.inProgress !== undefined
          ? { inProgress: { checkbox: !!req.body.inProgress } }
          : {}),
      },
      children: firstBatch,
    });

    // Append remaining blocks in batches of 100
    for (let i = 100; i < allBlocks.length; i += 100) {
      const batch = allBlocks.slice(i, i + 100);
      await notion.blocks.children.append({
        block_id: page.id,
        children: batch,
      });
    }

    // If scheduling, store the schedule in MongoDB
    if (scheduleAt) {
      const { db } = await connectToDatabase();
      await db.collection('scheduled_posts').insertOne({
        notionPageId: page.id,
        title,
        slug,
        scheduledFor: new Date(scheduleAt),
        status: 'pending',
        createdAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      pageId: page.id,
      slug,
      published: shouldPublish,
      scheduledFor: scheduleAt || null,
      url: `${process.env.NEXT_PUBLIC_URL || ''}/notes/${slug}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Publish to Notion]', message);
    return res.status(500).json({ error: `Failed to publish: ${message}` });
  }
}

export default withAuth(handler);
