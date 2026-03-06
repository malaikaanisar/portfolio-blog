import { Card } from '../Card';

export const Tool = ({
  title,
  href,
  logo,
  logoBg,
  children,
}: {
  title: string;
  href?: string;
  logo?: string;
  logoBg?: string;
  children: React.ReactNode;
}) => {
  return (
    <Card as="li">
      <div className="flex items-center gap-3">
        {logo && (
          <div
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:ring-zinc-700/50"
            style={{ backgroundColor: logoBg || '#f4f4f5' }}
          >
            <img
              src={logo}
              alt={`${title} logo`}
              className="h-6 w-6 rounded-sm"
              loading="lazy"
            />
          </div>
        )}
        <Card.Title as="h3" href={href}>
          {title}
        </Card.Title>
      </div>
      <Card.Description>{children}</Card.Description>
    </Card>
  );
};
