const MARQUEE_LINES = [
  {
    text: 'Social Media Marketing  ·  Content Strategy  ·  Brand Growth  ·  Paid Advertising  ·  Audience Engagement  ·  Campaign Management',
    direction: 'left' as const,
  },
  {
    text: 'SEO Optimization  ·  E-Commerce  ·  Shopify  ·  Meta Ads  ·  Google Analytics  ·  Data-Driven Marketing',
    direction: 'right' as const,
  },
  {
    text: 'Creative Direction  ·  Storytelling  ·  Visual Branding  ·  Influencer Strategy  ·  Community Building  ·  Email Campaigns',
    direction: 'left' as const,
  },
];

const MarqueeLine = ({
  text,
  direction,
}: {
  text: string;
  direction: 'left' | 'right';
}) => {
  const repeated = `${text}  ·  `;

  return (
    <div className="overflow-hidden whitespace-nowrap py-2 select-none">
      <div
        className={
          direction === 'left'
            ? 'animate-marquee-left'
            : 'animate-marquee-right'
        }
      >
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            className="text-4xl font-extrabold uppercase tracking-tight text-zinc-900/[0.07] dark:text-white/[0.07] sm:text-5xl lg:text-7xl"
          >
            {repeated}
          </span>
        ))}
      </div>
    </div>
  );
};

export const ScrollingMarquee = () => {
  return (
    <div
      className="my-16 space-y-0 overflow-x-clip"
      aria-hidden="true"
    >
      {MARQUEE_LINES.map((line, i) => (
        <MarqueeLine key={i} text={line.text} direction={line.direction} />
      ))}
    </div>
  );
};
