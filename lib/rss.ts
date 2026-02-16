import Parser from 'rss-parser';
import { Article, Source } from './types';
import { detectLanguage, summarizeFallback, toSubstackFeedUrl, deriveYouTubeRss } from './utils';

const parser = new Parser({ timeout: 9000, customFields: { item: ['media:content'] } });

export const normalizeSourceUrl = (source: Source) => {
  if (source.type === 'substack') return toSubstackFeedUrl(source.url);
  if (source.type === 'youtube') return deriveYouTubeRss(source.url) ?? source.url;
  return source.url;
};

export async function fetchRssArticles(source: Source): Promise<Article[]> {
  const normalizedUrl = normalizeSourceUrl(source);
  const feed = await parser.parseURL(normalizedUrl);
  return (feed.items || []).map((item) => ({
    id: `${source.id}:${item.guid || item.link || item.title}`,
    title: item.title || 'Untitled',
    url: item.link || normalizedUrl,
    sourceId: source.id,
    sourceName: source.name,
    publishedAt: item.pubDate || new Date().toISOString(),
    author: item.creator || item.author,
    summary: summarizeFallback(item.contentSnippet || item.content || item.summary),
    contentSnippet: item.contentSnippet || item.content || item.summary,
    tags: item.categories || [],
    imageUrl: typeof item.enclosure?.url === 'string' ? item.enclosure.url : undefined,
    language: detectLanguage(item.contentSnippet || item.title || ''),
    raw: item
  }));
}

export async function fetchHackerNews(mode: 'top' | 'new' = 'top'): Promise<Article[]> {
  const endpoint = `https://hn.algolia.com/api/v1/search?tags=${mode === 'new' ? 'story' : 'front_page'}`;
  const res = await fetch(endpoint);
  const json = await res.json();
  return (json.hits || []).map((hit: Record<string, string>) => ({
    id: `hn:${hit.objectID}`,
    title: hit.title || hit.story_title || 'HN Post',
    url: hit.url || hit.story_url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    sourceId: 'hackernews',
    sourceName: 'Hacker News',
    publishedAt: hit.created_at,
    author: hit.author,
    summary: summarizeFallback(hit.story_text || hit.comment_text || hit.title),
    contentSnippet: hit.story_text || hit.comment_text || hit.title,
    tags: ['hackernews'],
    language: 'en',
    raw: hit
  }));
}
