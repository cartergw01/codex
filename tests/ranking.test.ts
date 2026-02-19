import { describe, expect, it } from 'vitest';
import { rankArticles } from '../lib/ranking';
import { Article, Preferences } from '../lib/types';

const prefs: Preferences = {
  interests: ['AI'],
  customKeywords: ['climate'],
  diverseViewpoints: false,
  sortMode: 'for-you',
  aiSummaries: false,
  theme: 'system',
  fontSize: 'default',
  density: 'comfy'
};

const articles: Article[] = [
  { id: '1', title: 'AI policy changes', url: 'https://a', sourceId: 's1', sourceName: 'One', publishedAt: new Date().toISOString(), tags: [], summary: '', contentSnippet: '' },
  { id: '2', title: 'Sports weekly', url: 'https://b', sourceId: 's2', sourceName: 'Two', publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), tags: [], summary: '', contentSnippet: '' }
];

describe('rankArticles', () => {
  it('ranks keyword and recency higher', () => {
    const ranked = rankArticles(articles, prefs, { clickHistory: [], savedIds: [] });
    expect(ranked[0].id).toBe('1');
  });
});
