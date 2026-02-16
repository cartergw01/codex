'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Plus, RefreshCcw, Rss, Search, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useNewsState } from '@/hooks/use-news-state';
import { Article, Source, SourceType } from '@/lib/types';
import { estimateReadingTime, isXUrl } from '@/lib/utils';

const navTabs = ['for-you', 'latest', 'sources', 'saved', 'settings'] as const;

export function AppShell() {
  const state = useNewsState();
  const [tab, setTab] = useState<(typeof navTabs)[number]>('for-you');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (state.preferences.theme === 'dark') root.classList.add('dark');
    else if (state.preferences.theme === 'light') root.classList.remove('dark');
  }, [state.preferences.theme]);

  const saveArticle = (article: Article) => {
    if (state.saved.some((s) => s.articleId === article.id)) return;
    state.updateSaved([...state.saved, { articleId: article.id, tags: [], savedAt: new Date().toISOString() }]);
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder="Search"]')?.focus();
      }
      if (event.key === 'j' || event.key === 'k') {
        const idx = state.feed.findIndex((item) => item.id === state.selectedArticle?.id);
        const next = event.key === 'j' ? Math.min(state.feed.length - 1, idx + 1) : Math.max(0, idx - 1);
        if (state.feed[next]) state.setSelectedArticleId(state.feed[next].id);
      }
      if (event.key === 's' && state.selectedArticle) saveArticle(state.selectedArticle);
      if (event.key === 'o' && state.selectedArticle) window.open(state.selectedArticle.url, '_blank');
      if (event.key === 'Escape') setTab('for-you');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.feed, state.selectedArticle]);

  const refreshSources = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/refresh', { method: 'POST', body: JSON.stringify({ sources: state.sources.filter((s) => s.enabled) }) });
      const json = await res.json();
      state.updateArticles(json.articles ?? []);
      const updated = state.sources.map((s: Source) => ({ ...s, lastFetchedAt: new Date().toISOString(), error: json.errors?.[s.id] }));
      state.updateSources(updated);
    } finally {
      setIsRefreshing(false);
    }
  };

  const activeSaved = useMemo(() => new Set(state.saved.map((s) => s.articleId)), [state.saved]);

  return (
    <div className="flex min-h-screen flex-col md:grid md:grid-cols-[260px_1fr_1fr]">
      <aside className="hidden border-r border-border p-4 md:block">
        <div className="mb-6 flex items-center gap-2 text-xl font-semibold"><Newspaper className="h-5 w-5 text-accent" /> NewsLoom</div>
        <nav className="space-y-2 text-sm">
          {['For You', 'Latest', 'Sources', 'Saved', 'Settings'].map((item) => (
            <button key={item} onClick={() => setTab(item.toLowerCase().replace(' ', '-') as (typeof navTabs)[number])} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 hover:bg-muted">
              <Compass className="h-4 w-4" /> {item}
            </button>
          ))}
        </nav>
      </aside>

      <section className="border-r border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex-1"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search" className="pl-8" value={state.query} onChange={(e) => state.setQuery(e.target.value)} /></div>
          <Button size="icon" variant="outline" onClick={refreshSources}><RefreshCcw className={isRefreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /></Button>
          <AddSourceModal onAdd={(s) => state.updateSources([...state.sources, s])} />
        </div>

        {state.feed.length === 0 ? <EmptyState sourcesCount={state.sources.length} /> : (
          <div className="space-y-3">
            {state.feed.map((article) => (
              <motion.div whileHover={{ y: -2 }} key={article.id}>
                <Card className="cursor-pointer p-4" onClick={() => state.setSelectedArticleId(article.id)}>
                  <div className="mb-2 text-xs text-muted-foreground">{article.sourceName} · {new Date(article.publishedAt).toLocaleString()}</div>
                  <h3 className="mb-1 line-clamp-2 text-base font-semibold">{article.title}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{article.summary}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{estimateReadingTime(article.contentSnippet)} min read</span>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); saveArticle(article); }}>{activeSaved.has(article.id) ? 'Saved' : 'Save'}</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="p-4 pb-20 md:pb-4">
        {tab === 'sources' ? <SourcesPanel sources={state.sources} onSourcesChange={state.updateSources} /> : tab === 'settings' ? <SettingsPanel state={state} /> : tab === 'saved' ? <SavedPanel state={state} /> : <ReadingPane article={state.selectedArticle} />}
      </section>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-2 md:hidden">
        <div className="grid grid-cols-5 gap-1 text-xs">
          {navTabs.map((item) => <button key={item} onClick={() => setTab(item)} className="rounded-lg px-2 py-1 capitalize hover:bg-muted">{item.replace('-', ' ')}</button>)}
        </div>
      </nav>
    </div>
  );
}

function EmptyState({ sourcesCount }: { sourcesCount: number }) {
  return <Card className="p-8 text-center text-sm text-muted-foreground">{sourcesCount === 0 ? 'No sources yet. Add RSS, Substack, YouTube, Hacker News, or X sources.' : 'Sources added. Tap refresh to fetch latest items.'}</Card>;
}

function ReadingPane({ article }: { article?: Article }) {
  if (!article) return <EmptyState sourcesCount={1} />;
  if (article.sourceId.startsWith('x:')) {
    return <XEmbed url={article.url} />;
  }
  return (
    <Card className="h-full p-6">
      <div className="mb-2 text-xs text-muted-foreground">{article.sourceName} · {new Date(article.publishedAt).toLocaleDateString()}</div>
      <h2 className="mb-3 text-2xl font-semibold leading-tight">{article.title}</h2>
      <div className="mb-4 text-xs text-muted-foreground">{estimateReadingTime(article.contentSnippet)} min read</div>
      <article className="prose-reader text-foreground/90">{article.contentSnippet || article.summary}</article>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => window.open(article.url, '_blank')}>Open original</Button>
        <Button variant="outline" onClick={() => navigator.clipboard.writeText(article.url)}>Copy link</Button>
      </div>
    </Card>
  );
}

function XEmbed({ url }: { url: string }) {
  return <Card className="h-full p-4"><iframe title="X timeline" className="h-[70vh] w-full rounded-xl" src={`https://twitframe.com/show?url=${encodeURIComponent(url)}`} /></Card>;
}

function SavedPanel({ state }: { state: ReturnType<typeof useNewsState> }) {
  const items = state.articles.filter((a) => state.saved.some((s) => s.articleId === a.id));
  return <div className="space-y-3">{items.length ? items.map((a) => <Card className="p-3" key={a.id}><div className="font-medium">{a.title}</div><div className="text-xs text-muted-foreground">{a.sourceName}</div></Card>) : <EmptyState sourcesCount={1} />}</div>;
}

function SourcesPanel({ sources, onSourcesChange }: { sources: Source[]; onSourcesChange: (sources: Source[]) => void }) {
  return <div className="space-y-3">{sources.map((s) => <Card key={s.id} className="p-3"><div className="flex items-center justify-between"><div><div className="font-medium">{s.name}</div><div className="text-xs text-muted-foreground">{s.type} · {s.lastFetchedAt ? `Updated ${new Date(s.lastFetchedAt).toLocaleTimeString()}` : 'Never refreshed'}</div>{s.error && <div className="text-xs text-red-500">{s.error}</div>}</div><Button size="sm" variant="ghost" onClick={() => onSourcesChange(sources.filter((x) => x.id !== s.id))}>Remove</Button></div></Card>)}{sources.length === 0 && <EmptyState sourcesCount={0} />}</div>;
}

function SettingsPanel({ state }: { state: ReturnType<typeof useNewsState> }) {
  return <Card className="space-y-4 p-4"><h3 className="text-lg font-semibold">Settings</h3><label className="flex items-center justify-between">Diverse viewpoints<Switch checked={state.preferences.diverseViewpoints} onCheckedChange={(v) => state.updatePrefs({ ...state.preferences, diverseViewpoints: v })} /></label><label className="flex items-center justify-between">AI summaries<Switch checked={state.preferences.aiSummaries} onCheckedChange={(v) => state.updatePrefs({ ...state.preferences, aiSummaries: v })} /></label><label className="flex items-center justify-between">Dark mode<Switch checked={state.preferences.theme === 'dark'} onCheckedChange={(v) => state.updatePrefs({ ...state.preferences, theme: v ? 'dark' : 'light' })} /></label><p className="text-xs text-muted-foreground">Enable OPENAI_API_KEY for enhanced summaries.</p></Card>;
}

function AddSourceModal({ onAdd }: { onAdd: (source: Source) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<SourceType>('rss');

  const submit = () => {
    const source: Source = {
      id: `${type}:${crypto.randomUUID()}`,
      type,
      name: name || url,
      url,
      enabled: true
    };
    if (type === 'x' && isXUrl(url)) onAdd(source);
    else if (type === 'hackernews') onAdd({ ...source, url: 'https://hn.algolia.com' });
    else onAdd(source);
    setOpen(false);
    setName('');
    setUrl('');
  };

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /></Button>
      {open && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Close add source modal" />
          <div className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-lg font-semibold">Add source</h3>
            <div className="space-y-3">
              <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
              <div className="grid grid-cols-5 gap-1 text-xs">{(['rss', 'substack', 'youtube', 'hackernews', 'x'] as SourceType[]).map((item) => <button key={item} onClick={() => setType(item)} className={`rounded-lg border p-2 ${type === item ? 'bg-accent text-accent-foreground' : 'border-border'}`}>{item}</button>)}</div>
              <Button className="w-full" onClick={submit} disabled={!url && type !== 'hackernews'}><Rss className="mr-2 h-4 w-4" />Add source</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
