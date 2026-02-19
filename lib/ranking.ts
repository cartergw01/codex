import { Article, Preferences } from './types';

interface RankingOptions {
  clickHistory: string[];
  savedIds: string[];
}

const decay = (publishedAt: string) => {
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60);
  return Math.exp(-ageHours / 48);
};

const keywordScore = (article: Article, prefs: Preferences) => {
  const text = `${article.title} ${article.summary ?? ''} ${article.tags.join(' ')}`.toLowerCase();
  const keywords = [...prefs.interests, ...prefs.customKeywords].map((x) => x.toLowerCase());
  return keywords.reduce((acc, kw) => (text.includes(kw) ? acc + 1 : acc), 0);
};

export function rankArticles(articles: Article[], prefs: Preferences, options: RankingOptions): Article[] {
  const scored = articles.map((article) => {
    const savedBoost = options.savedIds.includes(article.id) ? 2 : 0;
    const clickBoost = options.clickHistory.some((text) => article.title.toLowerCase().includes(text.toLowerCase())) ? 1.5 : 0;
    const score = decay(article.publishedAt) * 3 + keywordScore(article, prefs) + savedBoost + clickBoost;
    return { article, score };
  });

  scored.sort((a, b) => b.score - a.score);

  if (!prefs.diverseViewpoints) {
    return scored.map((s) => s.article);
  }

  const bucket = new Map<string, number>();
  return scored
    .sort((a, b) => {
      const aCount = bucket.get(a.article.sourceId) ?? 0;
      const bCount = bucket.get(b.article.sourceId) ?? 0;
      return (b.score - bCount * 0.4) - (a.score - aCount * 0.4);
    })
    .map((s) => {
      bucket.set(s.article.sourceId, (bucket.get(s.article.sourceId) ?? 0) + 1);
      return s.article;
    });
}
