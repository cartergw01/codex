export type SourceType = 'rss' | 'substack' | 'youtube' | 'hackernews' | 'x';

export interface Article {
  id: string;
  title: string;
  url: string;
  sourceId: string;
  sourceName: string;
  publishedAt: string;
  author?: string;
  summary?: string;
  contentSnippet?: string;
  tags: string[];
  imageUrl?: string;
  language?: string;
  raw?: unknown;
}

export interface Source {
  id: string;
  type: SourceType;
  name: string;
  url: string;
  folder?: string;
  enabled: boolean;
  lastFetchedAt?: string;
  icon?: string;
  error?: string;
}

export interface Preferences {
  interests: string[];
  customKeywords: string[];
  diverseViewpoints: boolean;
  sortMode: 'for-you' | 'latest' | 'discussed';
  aiSummaries: boolean;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'default' | 'large';
  density: 'comfy' | 'compact';
}

export interface SavedItem {
  articleId: string;
  tags: string[];
  note?: string;
  savedAt: string;
}
