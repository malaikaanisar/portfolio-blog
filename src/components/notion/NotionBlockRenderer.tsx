import { TextRichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

import { Quote } from '../Quote';

//TODO: improve types here, cleanup the code
type Props = {
  block: any;
};

export const NotionBlockRenderer = ({ block }: Props) => {
  const { type, id } = block;
  const value = block[type];

  switch (type) {
    case 'paragraph':
      return (
        <p>
          <NotionText textItems={value.rich_text} />
        </p>
      );
    case 'heading_1':
      return (
        <h1>
          <NotionText textItems={value.rich_text} />
        </h1>
      );
    case 'heading_2':
      return (
        <h2>
          <NotionText textItems={value.rich_text} />
        </h2>
      );
    case 'heading_3':
      return (
        <h3>
          <NotionText textItems={value.rich_text} />
        </h3>
      );
    case 'bulleted_list':
      return (
        <ul className="list-outside list-disc">
          {value.children.map((block: any) => (
            <NotionBlockRenderer key={block.id} block={block} />
          ))}
        </ul>
      );
    case 'numbered_list':
      return (
        <ol className="list-outside list-decimal">
          {value.children.map((block: any) => (
            <NotionBlockRenderer key={block.id} block={block} />
          ))}
        </ol>
      );
    case 'bulleted_list_item':
    case 'numbered_list_item':
      return (
        <li className="pl-0">
          <NotionText textItems={value.rich_text} />
          {!!value.children &&
            value.children.map((block: any) => (
              <NotionBlockRenderer key={block.id} block={block} />
            ))}
        </li>
      );
    case 'to_do':
      return (
        <div>
          <label htmlFor={id}>
            <input type="checkbox" id={id} defaultChecked={value.checked} />{' '}
            <NotionText textItems={value.rich_text} />
          </label>
        </div>
      );
    case 'toggle':
      return (
        <details>
          <summary>
            <NotionText textItems={value.rich_text} />
          </summary>
          {value.children?.map((block: any) => (
            <NotionBlockRenderer key={block.id} block={block} />
          ))}
        </details>
      );
    case 'child_page':
      return <p>{value.title}</p>;
    case 'image':
      const src = value.type === 'external' ? value.external.url : value.file.url;
      const caption = value.caption ? value.caption[0]?.plain_text : '';
      return (
        <figure>
          <Image
            className="object-cover"
            placeholder="blur"
            src={src}
            alt={caption}
            blurDataURL={value.placeholder}
            width={value.size.width}
            height={value.size.height}
          />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    case 'divider':
      return <hr key={id} />;
    case 'quote':
      return (
        <Quote
          key={id}
          quote={value.rich_text?.[0]?.plain_text ?? ''}
        />
      );
    case 'code':
      return (
        <pre className={`language-${value.language}`}>
          <code key={id}>{value.rich_text?.[0]?.plain_text ?? ''}</code>
        </pre>
      );
    case 'file':
      const src_file = value.type === 'external' ? value.external.url : value.file.url;
      const splitSourceArray = src_file.split('/');
      const lastElementInArray = splitSourceArray[splitSourceArray.length - 1];
      const caption_file = value.caption ? value.caption[0]?.plain_text : '';
      return (
        <figure>
          <div>
            📎{' '}
            <Link href={src_file} passHref>
              {lastElementInArray.split('?')[0]}
            </Link>
          </div>
          {caption_file && <figcaption>{caption_file}</figcaption>}
        </figure>
      );
    case 'table': {
      const hasColumnHeader = value.has_column_header;
      const hasRowHeader = value.has_row_header;
      const rows = value.children ?? [];
      const headerRows = hasColumnHeader ? rows.slice(0, 1) : [];
      const bodyRows = hasColumnHeader ? rows.slice(1) : rows;

      return (
        <div className="not-prose overflow-x-auto my-6 rounded-lg border border-zinc-200 dark:border-zinc-700/60">
          <table className="min-w-full text-sm">
            {headerRows.length > 0 && (
              <thead>
                {headerRows.map((row: any) => (
                  <tr key={row.id} className="border-b border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-800/60">
                    {row.table_row.cells.map((cell: any, cellIndex: number) => (
                      <th
                        key={`${row.id}-${cellIndex}`}
                        className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                      >
                        <NotionText textItems={cell} />
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
            )}
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {bodyRows.map((row: any, rowIndex: number) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                >
                  {row.table_row.cells.map((cell: any, cellIndex: number) => (
                    <td
                      key={`${row.id}-${cellIndex}`}
                      className={clsx(
                        'px-4 py-3 text-zinc-700 dark:text-zinc-300',
                        cellIndex === 0 && hasRowHeader && 'font-medium text-zinc-900 dark:text-zinc-100',
                      )}
                    >
                      <NotionText textItems={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'table_row':
      // table_row is handled inside the table case
      return null;
    case 'bookmark':
      const href = value.url;
      return (
        <a href={href} target="_brank">
          {href}
        </a>
      );
    default:
      return (
        <>❌ Unsupported block (${type === 'unsupported' ? 'unsupported by Notion API' : type})</>
      );
  }
};

const NotionText = ({ textItems }: { textItems: TextRichTextItemResponse[] }) => {
  if (!textItems) {
    return null;
  }

  return (
    <>
      {textItems.map((textItem) => {
        const {
          annotations: { bold, code, color, italic, strikethrough, underline },
          text,
        } = textItem;
        return (
          <span
            key={text.content}
            className={clsx({
              'font-bold': bold,
              'font-mono font-semibold bg-zinc-600 text-zinc-200 px-1 py-0.5 m-1 rounded-md': code,
              italic: italic,
              'line-through': strikethrough,
              underline: underline,
            })}
            style={color !== 'default' ? { color } : {}}
          >
            {text.link ? <a href={text.link.url}>{text.content}</a> : text.content}
          </span>
        );
      })}
    </>
  );
};
