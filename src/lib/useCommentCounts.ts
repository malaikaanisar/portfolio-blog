import { useState, useEffect } from 'react';

export function useCommentCounts(slugs: string[]) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (slugs.length === 0) return;

    const fetchCounts = async () => {
      try {
        const res = await fetch(
          `/api/comment-counts?slugs=${encodeURIComponent(slugs.join(','))}`
        );
        if (res.ok) {
          const data = await res.json();
          setCounts(data);
        }
      } catch (err) {
        console.error('Failed to fetch comment counts:', err);
      }
    };

    fetchCounts();
  }, [slugs.join(',')]);

  return counts;
}
