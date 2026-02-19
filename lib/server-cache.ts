import { Article } from './types';

const memoryCache = new Map<string, { value: Article[]; expiresAt: number }>();
const aiCache = new Map<string, { value: unknown; expiresAt: number }>();

export const setFeedCache = (key: string, value: Article[], ttlMs = 1000 * 60 * 10) => {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const getFeedCache = (key: string) => {
  const hit = memoryCache.get(key);
  if (!hit || hit.expiresAt < Date.now()) return undefined;
  return hit.value;
};

export const setAiCache = (key: string, value: unknown, ttlMs = 1000 * 60 * 30) => {
  aiCache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const getAiCache = (key: string) => {
  const hit = aiCache.get(key);
  if (!hit || hit.expiresAt < Date.now()) return undefined;
  return hit.value;
};
