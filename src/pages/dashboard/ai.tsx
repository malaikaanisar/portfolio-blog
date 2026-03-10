import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import clsx from 'clsx';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import {
  SparklesIcon,
  LightBulbIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftEllipsisIcon,
  MegaphoneIcon,
  HashtagIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  ClockIcon,
  CpuChipIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

/* ── Constants ───────────────────────────────────────── */
const MODEL_OPTIONS = [
  { id: 'auto', label: 'Auto (smart fallback)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
] as const;

const TABS = [
  { id: 'blog',      label: 'Blog Writer',      icon: PencilSquareIcon,            desc: 'Full AI blog posts' },
  { id: 'ideas',     label: 'Content Ideas',     icon: LightBulbIcon,               desc: 'Blog post title ideas' },
  { id: 'outline',   label: 'Blog Outline',      icon: DocumentTextIcon,            desc: 'Full post structure' },
  { id: 'seo',       label: 'SEO Optimizer',     icon: MagnifyingGlassIcon,         desc: 'Title, meta & keywords' },
  { id: 'social',    label: 'Social Captions',   icon: ChatBubbleLeftEllipsisIcon,  desc: 'IG, FB, LinkedIn, X' },
  { id: 'ad',        label: 'Ad Copy',           icon: MegaphoneIcon,               desc: 'Meta & Google Ads' },
  { id: 'hashtags',  label: 'Hashtags',          icon: HashtagIcon,                 desc: 'Strategic tag sets' },
  { id: 'email',     label: 'Email Newsletter',  icon: EnvelopeIcon,                desc: 'Full email drafts' },
  { id: 'scheduled', label: 'Scheduled',         icon: ClockIcon,                   desc: 'Manage queue' },
] as const;

type TabId = (typeof TABS)[number]['id'];
type ApiError = { error: string };

const TONES_BLOG = ['Professional & Insightful', 'Casual & Friendly', 'Data-Driven', 'Storytelling', 'Educational', 'Persuasive'];

/* ── Helpers ─────────────────────────────────────────── */
async function callAI<T>(body: object): Promise<T> {
  const res = await fetch('/api/dashboard/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as ApiError).error || 'AI request failed');
  return data as T;
}

async function callPublish(body: object) {
  const res = await fetch('/api/dashboard/ai/publish-to-notion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Publish failed');
  return data;
}

async function callScheduled(method: string, params?: object) {
  const url = '/api/dashboard/ai/scheduled-posts' + (method === 'DELETE' && params && 'id' in params ? `?id=${(params as any).id}` : '');
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(method !== 'GET' && method !== 'DELETE' ? { body: JSON.stringify(params) } : {}),
  });
  return res.json();
}

/* ── Shared UI Components ────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-0.5 rounded hover:bg-zinc-800"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl px-4 py-3 text-sm bg-red-500/10 text-red-400 border border-red-500/20">
      {message}
    </div>
  );
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900" />;
}

function SubmitBtn({ loading, label = 'Generate' }: { loading: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {loading ? <><Spinner /> Generating...</> : label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ModelBadge({ model }: { model: string | null }) {
  if (!model) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/60 px-2.5 py-0.5 text-[10px] font-medium text-zinc-400">
      <CpuChipIcon className="w-3 h-3" />
      {model}
    </span>
  );
}

const inputCls = 'w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors';
const selectCls = 'w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors';

/* ── Main Page ───────────────────────────────────────── */
export default function AiToolsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('blog');
  const [selectedModel, setSelectedModel] = useState('auto');
  const ActiveIcon = TABS.find(t => t.id === activeTab)!.icon;

  const modelForApi = selectedModel === 'auto' ? undefined : selectedModel;

  return (
    <DashboardLayout title="AI Tools">
      <Head><title>AI Tools — Dashboard</title></Head>
      <div className="max-w-4xl space-y-6">

        {/* Header with model selector */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20">
              <SparklesIcon className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">AI Marketing Tools</h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                Powered by Google Gemini — auto-rotating models to avoid quota limits.
              </p>
            </div>
          </div>
          {/* Model selector */}
          <div className="flex items-center gap-2">
            <CpuChipIcon className="w-4 h-4 text-zinc-500" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-all',
                activeTab === id
                  ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700',
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium leading-tight">{label}</span>
            </button>
          ))}
        </div>

        {/* Active tool panel heading */}
        <div className="flex items-center gap-2 mb-1">
          <ActiveIcon className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-zinc-300">{TABS.find(t => t.id === activeTab)!.label}</h2>
          <span className="text-xs text-zinc-600">— {TABS.find(t => t.id === activeTab)!.desc}</span>
        </div>

        {activeTab === 'blog'      && <BlogWriter model={modelForApi} />}
        {activeTab === 'ideas'     && <ContentIdeas model={modelForApi} />}
        {activeTab === 'outline'   && <OutlineBuilder model={modelForApi} />}
        {activeTab === 'seo'       && <SeoOptimizer model={modelForApi} />}
        {activeTab === 'social'    && <SocialCaptions model={modelForApi} />}
        {activeTab === 'ad'        && <AdCopyGenerator model={modelForApi} />}
        {activeTab === 'hashtags'  && <HashtagGenerator model={modelForApi} />}
        {activeTab === 'email'     && <EmailNewsletter model={modelForApi} />}
        {activeTab === 'scheduled' && <ScheduledPosts />}
      </div>
    </DashboardLayout>
  );
}

/* ═══════════════════════════════════════════════════════
   0. FULL BLOG WRITER (NEW)
   ═══════════════════════════════════════════════════════ */
function BlogWriter({ model }: { model?: string }) {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [tone, setTone] = useState(TONES_BLOG[0]);
  const [blogContent, setBlogContent] = useState('');
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<{ url: string; scheduledFor?: string | null } | null>(null);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [autoPublish, setAutoPublish] = useState(true);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setBlogContent(''); setPublishResult(null); setModelUsed(null);
    try {
      const data = await callAI<{ blogContent: string; modelUsed: string }>({
        action: 'write-blog',
        title,
        tags: tags || undefined,
        tone,
        model,
      });
      setBlogContent(data.blogContent);
      setModelUsed(data.modelUsed);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
    setLoading(false);
  };

  const handlePublish = async () => {
    setPublishing(true); setError(null); setPublishResult(null);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      const result = await callPublish({
        title,
        description: `AI-generated blog post about ${title}`,
        content: blogContent,
        tags: tagList.length > 0 ? tagList : ['Digital Marketing'],
        published: scheduleMode ? false : autoPublish,
        scheduleAt: scheduleMode && scheduleDate ? new Date(scheduleDate).toISOString() : undefined,
      });
      setPublishResult({ url: result.url, scheduledFor: result.scheduledFor });
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
    setPublishing(false);
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
      <p className="text-sm text-zinc-500">
        Enter a blog title and let AI write a complete, publish-ready blog post.
        It automatically adds a footer with your LinkedIn, email, and portfolio links.
      </p>

      <form onSubmit={handleGenerate} className="space-y-3">
        <Field label="Blog Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. 10 Meta Ad Strategies That Tripled My ROAS in 2024"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Tags (comma-separated)">
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Meta Ads, ROAS, Digital Marketing"
              className={inputCls}
            />
          </Field>
          <Field label="Writing Tone">
            <select value={tone} onChange={(e) => setTone(e.target.value)} className={selectCls}>
              {TONES_BLOG.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex items-center justify-between">
          <SubmitBtn loading={loading} label="Write Blog Post" />
          {modelUsed && <ModelBadge model={modelUsed} />}
        </div>
      </form>

      {error && <ErrorBox message={error} />}

      {blogContent && (
        <div className="space-y-4">
          {/* Preview */}
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Blog Preview (Markdown)</span>
              <CopyButton text={blogContent} />
            </div>
            <div className="max-h-[500px] overflow-y-auto p-4">
              <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">{blogContent}</pre>
            </div>
          </div>

          {/* Publish controls */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4 space-y-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Publish to Notion</p>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPublish && !scheduleMode}
                  onChange={(e) => { setAutoPublish(e.target.checked); if (e.target.checked) setScheduleMode(false); }}
                  className="rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500"
                />
                Publish immediately
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleMode}
                  onChange={(e) => { setScheduleMode(e.target.checked); if (e.target.checked) setAutoPublish(false); }}
                  className="rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500"
                />
                Schedule for later
              </label>
            </div>

            {scheduleMode && (
              <Field label="Schedule Date & Time">
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className={inputCls}
                  required
                />
              </Field>
            )}

            <button
              onClick={handlePublish}
              disabled={publishing || (scheduleMode && !scheduleDate)}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {publishing ? <><Spinner /> Publishing...</> : scheduleMode ? 'Schedule Post' : 'Publish to Notion'}
            </button>

            {publishResult && (
              <div className="rounded-xl px-4 py-3 text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  {publishResult.scheduledFor
                    ? `Scheduled for ${new Date(publishResult.scheduledFor).toLocaleString()}`
                    : 'Published successfully!'}
                </div>
                <a href={publishResult.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-300 hover:underline">
                  {publishResult.url}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   1. CONTENT IDEAS
   ═══════════════════════════════════════════════════════ */
function ContentIdeas({ model }: { model?: string }) {
  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setIdeas([]); setModelUsed(null);
    try {
      const data = await callAI<{ ideas: string[]; modelUsed: string }>({ action: 'ideas', topic, model });
      setIdeas(data.ideas);
      setModelUsed(data.modelUsed);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
    setLoading(false);
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
      <p className="text-sm text-zinc-500">Get 7 digital marketing blog post ideas tailored to attract brand owners and fellow marketers.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input value={topic} onChange={e => setTopic(e.target.value)} required placeholder="e.g. Instagram Ads ROI, content batching, Shopify SEO" className={clsx(inputCls, 'flex-1')} />
        <SubmitBtn loading={loading} />
      </form>
      {modelUsed && <ModelBadge model={modelUsed} />}
      {error && <ErrorBox message={error} />}
      {ideas.length > 0 && (
        <div className="space-y-2">
          {ideas.map((idea, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-3 group">
              <div className="flex items-start gap-3 min-w-0">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-[10px] font-bold text-violet-400">{i + 1}</span>
                <span className="text-sm text-zinc-200 leading-snug">{idea}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <CopyButton text={idea} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   2. BLOG OUTLINE
   ═══════════════════════════════════════════════════════ */
interface Outline {
  title: string;
  intro: string;
  sections: { heading: string; points: string[] }[];
  conclusion: string;
}

function OutlineBuilder({ model }: { model?: string }) {
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState<Outline | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setOutline(null); setModelUsed(null);
    try {
      const data = await callAI<{ outline: Outline; modelUsed: string }>({ action: 'outline', topic, model });
      setOutline(data.outline);
      setModelUsed(data.modelUsed);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
    setLoading(false);
  };

  const outlineText = outline ? [
    `# ${outline.title}`,
    `\nIntro: ${outline.intro}`,
    ...outline.sections.flatMap(s => [`\n## ${s.heading}`, ...s.points.map(p => `- ${p}`)]),
    `\nConclusion: ${outline.conclusion}`,
  ].join('\n') : '';

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
      <p className="text-sm text-zinc-500">Generate a structured blog post outline tailored for a digital marketing audience.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input value={topic} onChange={e => setTopic(e.target.value)} required placeholder="e.g. How to run Meta Ads for an e-commerce brand" className={clsx(inputCls, 'flex-1')} />
        <SubmitBtn loading={loading} />
      </form>
      {modelUsed && <ModelBadge model={modelUsed} />}
      {error && <ErrorBox message={error} />}
      {outline && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">{outline.title}</h3>
            <CopyButton text={outlineText} />
          </div>
          <ResultBlock label="Introduction"><p className="text-sm text-zinc-300">{outline.intro}</p></ResultBlock>
          {outline.sections.map((s, i) => (
            <ResultBlock key={i} label={s.heading}>
              <ul className="space-y-1">{s.points.map((p, j) => (
                <li key={j} className="flex items-start gap-2 text-xs text-zinc-400">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-zinc-600" />{p}
                </li>
              ))}</ul>
            </ResultBlock>
          ))}
          <ResultBlock label="Conclusion"><p className="text-sm text-zinc-300">{outline.conclusion}</p></ResultBlock>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   3. SEO OPTIMIZER
   ═══════════════════════════════════════════════════════ */
interface SeoResult { seoTitle: string; metaDescription: string; keywords: string[]; }

function SeoOptimizer({ model }: { model?: string }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<SeoResult | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null); setModelUsed(null);
    try {
      const data = await callAI<{ seo: SeoResult; modelUsed: string }>({ action: 'seo', title, description, model });
      setResult(data.seo);
      setModelUsed(data.modelUsed);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
    setLoading(false);
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
      <p className="text-sm text-zinc-500">Optimise your blog post for search with an SEO title, meta description, and keyword set.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Post title (required)" className={inputCls} />
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Brief post description (optional)" className={clsx(inputCls, 'resize-none')} />
        <div className="flex items-center justify-between">
          <SubmitBtn loading={loading} label="Optimise" />
          {modelUsed && <ModelBadge model={modelUsed} />}
        </div>
      </form>
      {error && <ErrorBox message={error} />}
      {result && (
        <div className="space-y-3">
          <ResultBlock label="SEO Title" meta={`${result.seoTitle.length}/60`} metaWarn={result.seoTitle.length > 60} copyText={result.seoTitle}>
            <p className="text-sm text-zinc-200">{result.seoTitle}</p>
          </ResultBlock>
          <ResultBlock label="Meta Description" meta={`${result.metaDescription.length}/155`} metaWarn={result.metaDescription.length > 155} copyText={result.metaDescription}>
            <p className="text-sm text-zinc-300 leading-relaxed">{result.metaDescription}</p>
          </ResultBlock>
          <ResultBlock label="Keywords">
            <div className="flex flex-wrap gap-2">
              {result.keywords.map((kw, i) => <span key={i} className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300">{kw}</span>)}
            </div>
          </ResultBlock>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   4. SOCIAL MEDIA CAPTIONS
   ═══════════════════════════════════════════════════════ */
const PLATFORMS = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter/X', 'TikTok'];
const TONES = ['Professional', 'Casual & Fun', 'Inspirational', 'Urgency / FOMO', 'Educational', 'Storytelling'];
const GOALS = ['Drive Engagement', 'Generate Sales', 'Build Brand Awareness', 'Drive Website Traffic', 'Promote a Product', 'Share a Tip'];

function SocialCaptions({ model }: { model?: string }) {
  const [platform, setPlatform] = useState('Instagram');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [goal, setGoal] = useState('Drive Engagement');
  const [caption, setCaption] = useState('');
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setCaption(''); setModelUsed(null);
    try {
      const data = await callAI<{ caption: string; modelUsed: string }>({ action: 'social-caption', platform, topic, tone, goal, model });
      setCaption(data.caption);
      setModelUsed(data.modelUsed);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
    setLoading(false);
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
      <p className="text-sm text-zinc-500">Generate a platform-optimised social media post caption for any of your brand campaigns.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Platform">
            <select value={platform} onChange={e => setPlatform(e.target.value)} className={selectCls}>
              {PLATFORMS.map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Tone">
            <select value={tone} onChange={e => setTone(e.target.value)} className={selectCls}>
              {TONES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Goal">
            <select value={goal} onChange={e => setGoal(e.target.value)} className={selectCls}>
              {GOALS.map(g => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>
        <Field label="What is the post about?">
          <textarea value={topic} onChange={e => setTopic(e.target.value)} required rows={2} placeholder="e.g. New toy collection launch at Bacha Toys, 20% off this weekend only" className={clsx(inputCls, 'resize-none')} />
        </Field>
        <div className="flex items-center justify-between">
          <SubmitBtn loading={loading} />
          {modelUsed && <ModelBadge model={modelUsed} />}
        </div>
      </form>
      {error && <ErrorBox message={error} />}
      {caption && (
        <ResultBlock label={`${platform} Caption`} copyText={caption}>
          <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{caption}</p>
        </ResultBlock>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   5. AD COPY GENERATOR
   ═══════════════════════════════════════════════════════ */
interface AdCopy { headline: string; primaryText: string; description: string; cta: string; hookVariants: string[]; }
const AD_PLATFORMS = ['Meta (Facebook/Instagram)', 'Google Search Ads', 'Google Display Ads', 'TikTok Ads', 'LinkedIn Ads'];
const AD_OBJECTIVES = ['Conversions / Sales', 'Traffic to Website', 'Brand Awareness', 'App Installs', 'Lead Generation', 'Retargeting'];

function AdCopyGenerator({ model }: { model?: string }) {
  const [platform, setPlatform] = useState('Meta (Facebook/Instagram)');
  const [objective, setObjective] = useState('Conversions / Sales');
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [usp, setUsp] = useState('');
  const [result, setResult] = useState<AdCopy | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null); setModelUsed(null);
    try {
      const data = await callAI<{ adCopy: AdCopy; modelUsed: string }>({ action: 'ad-copy', platform, objective, product, audience, usp, model });
      setResult(data.adCopy);
      setModelUsed(data.modelUsed);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
    setLoading(false);
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
      <p className="text-sm text-zinc-500">Generate conversion-focused ad copy for your paid campaigns with headlines, body text, and CTA variants.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Ad Platform">
            <select value={platform} onChange={e => setPlatform(e.target.value)} className={selectCls}>
              {AD_PLATFORMS.map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Campaign Objective">
            <select value={objective} onChange={e => setObjective(e.target.value)} className={selectCls}>
              {AD_OBJECTIVES.map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Product / Service being advertised">
          <input value={product} onChange={e => setProduct(e.target.value)} required placeholder="e.g. Premium toy collection for kids aged 2-10" className={inputCls} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Target Audience">
            <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Pakistani parents, ages 25-40" className={inputCls} />
          </Field>
          <Field label="Unique Selling Point (USP)">
            <input value={usp} onChange={e => setUsp(e.target.value)} placeholder="e.g. Pakistan's #1 toy store, fast delivery" className={inputCls} />
          </Field>
        </div>
        <div className="flex items-center justify-between">
          <SubmitBtn loading={loading} />
          {modelUsed && <ModelBadge model={modelUsed} />}
        </div>
      </form>
      {error && <ErrorBox message={error} />}
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResultBlock label="Headline" meta={`${result.headline.length}/40`} metaWarn={result.headline.length > 40} copyText={result.headline}>
              <p className="text-sm font-semibold text-zinc-100">{result.headline}</p>
            </ResultBlock>
            <ResultBlock label="Description" meta={`${result.description.length}/30`} metaWarn={result.description.length > 30} copyText={result.description}>
              <p className="text-sm text-zinc-300">{result.description}</p>
            </ResultBlock>
            <ResultBlock label="CTA Button" copyText={result.cta}>
              <span className="inline-flex items-center rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-1 text-sm font-semibold text-blue-300">{result.cta}</span>
            </ResultBlock>
          </div>
          <ResultBlock label="Primary Ad Text" copyText={result.primaryText}>
            <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{result.primaryText}</p>
          </ResultBlock>
          <ResultBlock label="Hook Variants (A/B test these)">
            <div className="space-y-2">
              {result.hookVariants.map((h, i) => (
                <div key={i} className="flex items-center justify-between gap-3 bg-zinc-900 rounded-lg px-3 py-2">
                  <span className="text-xs text-zinc-300">{h}</span>
                  <CopyButton text={h} />
                </div>
              ))}
            </div>
          </ResultBlock>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   6. HASHTAG GENERATOR
   ═══════════════════════════════════════════════════════ */
interface HashtagResult { highVolume: string[]; midVolume: string[]; niche: string[]; branded: string[]; }

function HashtagGenerator({ model }: { model?: string }) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [niche, setNiche] = useState('');
  const [result, setResult] = useState<HashtagResult | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null); setModelUsed(null);
    try {
      const data = await callAI<{ hashtags: HashtagResult; modelUsed: string }>({ action: 'hashtags', topic, platform, niche, model });
      setResult(data.hashtags);
      setModelUsed(data.modelUsed);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
    setLoading(false);
  };

  const allTags = result ? [...result.highVolume, ...result.midVolume, ...result.niche, ...result.branded].join(' ') : '';

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
      <p className="text-sm text-zinc-500">Get a strategic hashtag set split by volume tier — maximise reach without looking spammy.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Platform">
            <select value={platform} onChange={e => setPlatform(e.target.value)} className={selectCls}>
              {PLATFORMS.map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Post Topic">
            <input value={topic} onChange={e => setTopic(e.target.value)} required placeholder="e.g. Toy sale, Meta Ads tips" className={inputCls} />
          </Field>
          <Field label="Your Niche / Industry">
            <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. e-commerce, digital marketing" className={inputCls} />
          </Field>
        </div>
        <div className="flex items-center justify-between">
          <SubmitBtn loading={loading} />
          {modelUsed && <ModelBadge model={modelUsed} />}
        </div>
      </form>
      {error && <ErrorBox message={error} />}
      {result && (
        <div className="space-y-4">
          <div className="flex justify-end"><CopyButton text={allTags} /></div>
          {([
            { key: 'highVolume', label: 'High Volume', color: 'text-red-400 border-red-500/20 bg-red-500/10' },
            { key: 'midVolume',  label: 'Mid Volume',  color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' },
            { key: 'niche',      label: 'Niche',       color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
            { key: 'branded',    label: 'Branded',     color: 'text-violet-400 border-violet-500/20 bg-violet-500/10' },
          ] as const).map(({ key, label, color }) => (
            <div key={key}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">{label}</p>
              <div className="flex flex-wrap gap-2">
                {result[key].map((tag, i) => (
                  <span key={i} className={clsx('rounded-full border px-3 py-1 text-xs font-medium cursor-pointer', color)}
                    onClick={() => navigator.clipboard.writeText(tag)}
                    title="Click to copy"
                  >{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   7. EMAIL NEWSLETTER
   ═══════════════════════════════════════════════════════ */
interface EmailResult { subjectLine: string; preheader: string; greeting: string; body: string; cta: string; signOff: string; }
const EMAIL_GOALS = ['Educate & Engage', 'Promote a Product / Sale', 'Share a Case Study', 'Weekly Newsletter', 'Announce New Content', 'Re-engagement Campaign'];

function EmailNewsletter({ model }: { model?: string }) {
  const [subject, setSubject] = useState('');
  const [goal, setGoal] = useState('Educate & Engage');
  const [keyPoints, setKeyPoints] = useState('');
  const [audience, setAudience] = useState('');
  const [result, setResult] = useState<EmailResult | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null); setModelUsed(null);
    try {
      const data = await callAI<{ email: EmailResult; modelUsed: string }>({ action: 'email-newsletter', subject, goal, keyPoints, audience, model });
      setResult(data.email);
      setModelUsed(data.modelUsed);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
    setLoading(false);
  };

  const fullEmail = result ? `Subject: ${result.subjectLine}\nPreheader: ${result.preheader}\n\n${result.greeting}\n\n${result.body}\n\n${result.cta}\n\n${result.signOff}` : '';

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
      <p className="text-sm text-zinc-500">Draft a complete marketing email in seconds — subject line, body copy, CTA and sign-off included.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Email Subject / Topic">
            <input value={subject} onChange={e => setSubject(e.target.value)} required placeholder="e.g. 5 Meta Ad mistakes costing you sales" className={inputCls} />
          </Field>
          <Field label="Email Goal">
            <select value={goal} onChange={e => setGoal(e.target.value)} className={selectCls}>
              {EMAIL_GOALS.map(g => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Key Points to Cover">
          <textarea value={keyPoints} onChange={e => setKeyPoints(e.target.value)} rows={2} placeholder="e.g. Mention our free audit offer, link to the blog post, include a limited-time 20% discount" className={clsx(inputCls, 'resize-none')} />
        </Field>
        <Field label="Target Audience">
          <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. small business owners, e-commerce brands in Pakistan" className={inputCls} />
        </Field>
        <div className="flex items-center justify-between">
          <SubmitBtn loading={loading} />
          {modelUsed && <ModelBadge model={modelUsed} />}
        </div>
      </form>
      {error && <ErrorBox message={error} />}
      {result && (
        <div className="space-y-3">
          <div className="flex justify-end"><CopyButton text={fullEmail} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ResultBlock label="Subject Line" copyText={result.subjectLine}>
              <p className="text-sm font-semibold text-zinc-100">{result.subjectLine}</p>
            </ResultBlock>
            <ResultBlock label="Preheader Text" copyText={result.preheader}>
              <p className="text-sm text-zinc-400">{result.preheader}</p>
            </ResultBlock>
          </div>
          <ResultBlock label="Email Body">
            <p className="text-xs text-zinc-500 mb-2">{result.greeting}</p>
            <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{result.body}</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex items-center rounded-lg bg-blue-500/20 border border-blue-500/30 px-4 py-2 text-sm font-semibold text-blue-300">{result.cta}</span>
              <CopyButton text={result.cta} />
            </div>
            <p className="mt-4 text-xs text-zinc-500">{result.signOff}</p>
          </ResultBlock>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   8. SCHEDULED POSTS
   ═══════════════════════════════════════════════════════ */
interface ScheduledPost {
  _id: string;
  title: string;
  slug: string;
  notionPageId: string;
  scheduledFor: string;
  status: 'pending' | 'published' | 'failed';
  error?: string;
  createdAt: string;
}

function ScheduledPosts() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      const data = await callScheduled('GET');
      setPosts(data.posts || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Cancel this scheduled post?')) return;
    await callScheduled('DELETE', { id });
    loadPosts();
  };

  const handleTriggerCron = async () => {
    setTriggerLoading(true); setTriggerResult(null);
    try {
      const res = await fetch('/api/dashboard/ai/schedule-cron', {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setTriggerResult(data.message || `Published: ${data.published}, Failed: ${data.failed}`);
      loadPosts();
    } catch (err: unknown) {
      setTriggerResult(err instanceof Error ? err.message : 'Error');
    }
    setTriggerLoading(false);
  };

  const statusColors: Record<string, string> = {
    pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    published: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    failed: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">View and manage scheduled blog posts. Pending posts will be published when their scheduled time arrives.</p>
        <button
          onClick={handleTriggerCron}
          disabled={triggerLoading}
          className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-40 flex items-center gap-1.5"
        >
          {triggerLoading ? <Spinner /> : <ClockIcon className="w-3.5 h-3.5" />}
          Run Publisher
        </button>
      </div>

      {triggerResult && (
        <div className="rounded-xl px-4 py-2.5 text-xs bg-zinc-800 text-zinc-300 border border-zinc-700">
          {triggerResult}
        </div>
      )}

      {error && <ErrorBox message={error} />}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-zinc-500"><Spinner /> Loading scheduled posts...</div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-zinc-600 text-center py-8">No scheduled posts yet. Use the Blog Writer to create and schedule a post.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post._id} className="rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-200 truncate">{post.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={clsx('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border', statusColors[post.status] || 'text-zinc-400')}>
                    {post.status}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {post.status === 'pending'
                      ? `Scheduled for ${new Date(post.scheduledFor).toLocaleString()}`
                      : `Created ${new Date(post.createdAt).toLocaleDateString()}`}
                  </span>
                  {post.error && <span className="text-[11px] text-red-400 truncate max-w-[200px]">{post.error}</span>}
                </div>
              </div>
              {post.status === 'pending' && (
                <button
                  onClick={() => handleDelete(post._id)}
                  className="text-xs text-zinc-500 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARED UI HELPER
   ═══════════════════════════════════════════════════════ */
function ResultBlock({ label, children, meta, metaWarn, copyText }: {
  label: string;
  children: React.ReactNode;
  meta?: string;
  metaWarn?: boolean;
  copyText?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
        <div className="flex items-center gap-2">
          {meta && <span className={clsx('text-[10px] tabular-nums', metaWarn ? 'text-amber-400' : 'text-zinc-600')}>{meta}</span>}
          {copyText && <CopyButton text={copyText} />}
        </div>
      </div>
      {children}
    </div>
  );
}
