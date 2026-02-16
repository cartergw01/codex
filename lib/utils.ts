import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const estimateReadingTime = (text?: string) => {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
};

export const summarizeFallback = (text?: string) => {
  if (!text) return 'No summary available yet.';
  const parts = text.replace(/<[^>]*>/g, '').split(/(?<=[.!?])\s+/).filter(Boolean);
  return parts.slice(0, 3).join(' ');
};

export const detectLanguage = (text: string) => {
  if (!text) return 'unknown';
  if (/\b(the|and|with|from|that|this)\b/i.test(text)) return 'en';
  if (/\b(el|la|de|que|con)\b/i.test(text)) return 'es';
  return 'unknown';
};

export const toSubstackFeedUrl = (url: string) => {
  const cleaned = url.trim().replace(/\/$/, '');
  if (cleaned.endsWith('/feed')) return cleaned;
  return `${cleaned}/feed`;
};

export const deriveYouTubeRss = (url: string) => {
  const channelMatch = url.match(/youtube\.com\/channel\/([A-Za-z0-9_-]+)/);
  if (channelMatch) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelMatch[1]}`;
  }
  const userMatch = url.match(/youtube\.com\/@([A-Za-z0-9_.-]+)/);
  if (userMatch) return undefined;
  return undefined;
};

export const isXUrl = (url: string) => /^(https?:\/\/)?(www\.)?(x|twitter)\.com\//.test(url);
