'use client';

import { useMemo, useState } from 'react';
import { Article, Preferences, SavedItem, Source } from '@/lib/types';
import { getCachedArticles, getPreferences, getSaved, getSources, setCachedArticles, setPreferences, setSaved, setSources } from '@/lib/storage';
import { rankArticles } from '@/lib/ranking';

export function useNewsState() {
  const [sources, setSourcesState] = useState<Source[]>(() => getSources());
  const [articles, setArticles] = useState<Article[]>(() => getCachedArticles());
  const [preferences, setPrefs] = useState<Preferences>(() => getPreferences());
  const [saved, setSavedState] = useState<SavedItem[]>(() => getSaved());
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const updateSources = (next: Source[]) => { setSourcesState(next); setSources(next); };
  const updatePrefs = (next: Preferences) => { setPrefs(next); setPreferences(next); };
  const updateSaved = (next: SavedItem[]) => { setSavedState(next); setSaved(next); };
  const updateArticles = (next: Article[]) => { setArticles(next); setCachedArticles(next); };

  const feed = useMemo(() => {
    const searched = query
      ? articles.filter((a) => `${a.title} ${a.summary}`.toLowerCase().includes(query.toLowerCase()))
      : articles;
    if (preferences.sortMode === 'latest') return searched.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    if (preferences.sortMode === 'discussed') return searched.filter((a) => a.sourceId === 'hackernews').concat(searched.filter((a) => a.sourceId !== 'hackernews'));
    return rankArticles(searched, preferences, { clickHistory: [], savedIds: saved.map((x) => x.articleId) });
  }, [articles, preferences, query, saved]);

  const selectedArticle = feed.find((x) => x.id === selectedArticleId) ?? feed[0];

  return {
    sources,
    articles,
    preferences,
    saved,
    feed,
    selectedArticle,
    query,
    setQuery,
    setSelectedArticleId,
    updateSources,
    updatePrefs,
    updateSaved,
    updateArticles
  };
}
