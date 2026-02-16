import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAiCache, setAiCache } from '@/lib/server-cache';
import { summarizeFallback } from '@/lib/utils';

const rateMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, title, content } = body as { id: string; title: string; content: string };
  const cacheKey = `${id}:${title}`;

  const hit = getAiCache(cacheKey);
  if (hit) return NextResponse.json(hit);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ gist: summarizeFallback(content), bullets: [], tags: [], whyItMatters: 'Enable OPENAI_API_KEY for enhanced summaries.' });
  }

  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  const now = Date.now();
  const prev = rateMap.get(ip) ?? 0;
  if (now - prev < 1200) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  rateMap.set(ip, now);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: `Summarize this article:\nTitle: ${title}\nContent: ${content}\nReturn JSON with gist, bullets (3), tags (3-6), whyItMatters.` }],
    response_format: { type: 'json_object' }
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content ?? '{}');
  setAiCache(cacheKey, parsed);
  return NextResponse.json(parsed);
}
