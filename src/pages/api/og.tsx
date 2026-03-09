/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'experimental-edge',
};

const interRegular = fetch(
  new URL('../../../public/assets/font/Inter.ttf', import.meta.url),
).then((res) => res.arrayBuffer());

function truncateToLines(text: string, maxCharsPerLine: number, maxLines: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length > maxCharsPerLine && currentLine) {
      lines.push(currentLine);
      if (lines.length >= maxLines) break;
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (lines.length < maxLines && currentLine) {
    lines.push(currentLine);
  }

  // If we hit the line limit, truncate the last line with ellipsis
  if (lines.length >= maxLines) {
    const lastLine = lines[maxLines - 1];
    if (words.join(' ').length > lines.join(' ').length) {
      lines[maxLines - 1] =
        lastLine.length > maxCharsPerLine - 3
          ? lastLine.slice(0, maxCharsPerLine - 3) + '...'
          : lastLine + '...';
    }
    return lines.slice(0, maxLines).join('\n');
  }

  return lines.join('\n');
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const generateImage = async (req: NextRequest) => {
  // Handle cache headers for CDN/social crawlers
  const headers = {
    'Cache-Control': 'public, immutable, no-transform, max-age=31536000',
    'CDN-Cache-Control': 'max-age=31536000',
  };

  const fontData = await interRegular;
  const { searchParams } = req.nextUrl;
  const title = searchParams.get('title') || 'Untitled';
  const description = searchParams.get('description') || '';
  const tags = searchParams.get('tags') || '';
  const date = searchParams.get('date') || '';

  const truncatedTitle = truncateToLines(title, 28, 3);
  const truncatedDescription = description
    ? description.length > 100
      ? description.slice(0, 97) + '...'
      : description
    : '';
  const allTags = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const tagList = allTags.slice(0, 3);
  const extraTagCount = allTags.length - tagList.length;
  const formattedDate = date ? formatDate(date) : '';

  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full"
        style={{
          background: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)',
        }}
      >
        {/* Accent border left */}
        <div
          tw="absolute left-0 top-0 bottom-0 w-2"
          style={{ background: '#FB2576' }}
        />

        <div tw="flex flex-col w-full h-full px-16 py-12">
          {/* Top bar: site name + avatar/name */}
          <div tw="flex items-center justify-between w-full">
            <div tw="flex items-center">
              <div
                tw="text-xl font-bold tracking-wide"
                style={{ color: '#FB2576' }}
              >
                malaikaa.space
              </div>
            </div>
            <div tw="flex items-center">
              <img
                tw="w-12 h-12 rounded-full"
                src="https://malaikaa.space/assets/blog/authors/malaika.png"
                alt="Malaika Nisar"
                width={48}
                height={48}
              />
              <div tw="flex flex-col ml-3">
                <span tw="text-base font-semibold text-white">
                  Malaika Nisar
                </span>
                <span tw="text-sm text-zinc-400">Digital Marketer</span>
              </div>
            </div>
          </div>

          {/* Date */}
          {formattedDate && (
            <div tw="flex mt-auto">
              <span tw="text-lg text-zinc-400">{formattedDate}</span>
            </div>
          )}

          {/* Title - large, centered, max 3 lines */}
          <div tw="flex flex-col mt-4">
            {truncatedTitle.split('\n').map((line, i) => (
              <span
                key={i}
                tw="text-6xl font-bold text-white leading-tight"
                style={{ lineHeight: 1.15 }}
              >
                {line}
              </span>
            ))}
          </div>

          {/* Description */}
          {truncatedDescription && (
            <div tw="flex mt-3">
              <span tw="text-xl text-zinc-400" style={{ lineHeight: 1.4 }}>
                {truncatedDescription}
              </span>
            </div>
          )}

          {/* Tags */}
          {tagList.length > 0 && (
            <div tw="flex mt-6 flex-wrap items-center">
              {tagList.map((tag, i) => (
                <span
                  key={i}
                  tw="text-sm font-medium mr-2 px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(251, 37, 118, 0.15)',
                    color: '#FB2576',
                  }}
                >
                  {tag}
                </span>
              ))}
              {extraTagCount > 0 && (
                <span tw="text-sm text-zinc-500 ml-1">
                  +{extraTagCount} more
                </span>
              )}
            </div>
          )}

          {/* Bottom accent line */}
          <div tw="flex mt-auto w-full">
            <div
              tw="h-1 rounded-full"
              style={{
                width: '120px',
                background:
                  'linear-gradient(90deg, #FB2576 0%, rgba(251,37,118,0.3) 100%)',
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal',
        },
      ],
    },
  );
};

export default generateImage;
