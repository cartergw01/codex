import { NextRequest, NextResponse } from 'next/server';
import { fetchHackerNews, fetchRssArticles } from '@/lib/rss';
import { getFeedCache, setFeedCache } from '@/lib/server-cache';
import { Source, Article } from '@/lib/types';

export async function POST(request: NextRequest) {
  const { sources } = (await request.json()) as { sources: Source[] };
  const errors: Record<string, string> = {};
  const all: Article[] = [];

  await Promise.all(
    (sources || []).map(async (source) => {
      try {
        const cacheKey = `${source.id}:${source.url}`;
        const cached = getFeedCache(cacheKey);
        const items = cached ?? (source.type === 'hackernews' ? await fetchHackerNews('top') : source.type === 'x' ? [{
          id: `${source.id}-embed`,
          title: `${source.name} timeline`,
          url: source.url,
          sourceId: `x:${source.id}`,
          sourceName: source.name,
          publishedAt: new Date().toISOString(),
          summary: 'Embedded X timeline',
          tags: ['x'],
          contentSnippet: 'Embedded X timeline'
        }] : await fetchRssArticles(source));
        setFeedCache(cacheKey, items);
        all.push(...items);
      } catch (error) {
        errors[source.id] = error instanceof Error ? error.message : 'Failed to fetch source';
      }
    })
  );

  const deduped = Object.values(Object.fromEntries(all.map((item) => [item.url, item])));

  return NextResponse.json({ articles: deduped, errors });
}
