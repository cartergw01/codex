import { Preferences, SavedItem, Source, Article } from './types';

const defaults: Preferences = {
  interests: ['Technology', 'Science', 'Business'],
  customKeywords: [],
  diverseViewpoints: false,
  sortMode: 'for-you',
  aiSummaries: false,
  theme: 'system',
  fontSize: 'default',
  density: 'comfy'
};

export const storageKeys = {
  preferences: 'newsloom.preferences',
  sources: 'newsloom.sources',
  saved: 'newsloom.saved',
  cachedArticles: 'newsloom.cachedArticles',
  clickHistory: 'newsloom.clickHistory'
};

export const getPreferences = (): Preferences => {
  if (typeof window === 'undefined') return defaults;
  const raw = localStorage.getItem(storageKeys.preferences);
  return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
};

export const setPreferences = (prefs: Preferences) => localStorage.setItem(storageKeys.preferences, JSON.stringify(prefs));
export const getSources = (): Source[] => JSON.parse(localStorage.getItem(storageKeys.sources) || '[]');
export const setSources = (sources: Source[]) => localStorage.setItem(storageKeys.sources, JSON.stringify(sources));
export const getSaved = (): SavedItem[] => JSON.parse(localStorage.getItem(storageKeys.saved) || '[]');
export const setSaved = (saved: SavedItem[]) => localStorage.setItem(storageKeys.saved, JSON.stringify(saved));
export const getCachedArticles = (): Article[] => JSON.parse(localStorage.getItem(storageKeys.cachedArticles) || '[]');
export const setCachedArticles = (articles: Article[]) => localStorage.setItem(storageKeys.cachedArticles, JSON.stringify(articles));
