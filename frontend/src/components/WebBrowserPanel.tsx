import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Search,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  BookOpen,
  Compass,
  Home,
  Plus,
  Bookmark,
  Share2,
} from 'lucide-react';
import { fetchWebPageReader, fetchBrowserPageHtml } from '../services/liveData';
import type { LiveSearchResult, AiSearchSynthesis, WebPageReaderData } from '../services/liveData';
import { ParticleProximityCanvas } from './ParticleProximityCanvas';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  view: 'home' | 'search' | 'reader' | 'webpage';
  searchResults: LiveSearchResult[];
  aiSynthesis: AiSearchSynthesis | null;
  readerData: WebPageReaderData | null;
  pageHtml?: string;
  history: string[];
  historyIdx: number;
}

interface WebBrowserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertIntoPrompt?: (snippet: string) => void;
  initialQuery?: string;
}

const DEFAULT_BOOKMARKS = [
  { name: 'arXiv cs.AI', url: 'https://arxiv.org/list/cs.AI/recent', tag: 'Preprints', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  { name: 'Hugging Face', url: 'https://huggingface.co/papers', tag: 'Daily Papers', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { name: 'Artificial Analysis', url: 'https://artificialanalysis.ai', tag: 'Benchmarks', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { name: 'Arena.ai', url: 'https://arena.ai', tag: 'Leaderboard', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { name: 'DeepMind Research', url: 'https://deepmind.google/research/', tag: 'Frontier AI', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { name: 'Anthropic Research', url: 'https://anthropic.com/research', tag: 'Alignment', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  { name: 'OpenAI Research', url: 'https://openai.com/research', tag: 'Reasoning', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  { name: 'GitHub AI Trending', url: 'https://github.com/trending', tag: 'Open Source', color: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
];

const TRENDING_SEARCHES = [
  'Gemini 3.8 Flash technical specs',
  'Claude Fable 5.1 architecture',
  'DeepSeek R1 reasoning reinforcement learning',
  'arXiv latest multimodal LLM preprints',
  'Mixture of Experts routing optimizations',
];

export const WebBrowserPanel: React.FC<WebBrowserPanelProps> = ({
  isOpen,
  onClose,
  onInsertIntoPrompt,
  initialQuery = '',
}) => {
  // Tabs system
  const [tabs, setTabs] = useState<BrowserTab[]>(() => [
    {
      id: 'tab-1',
      title: initialQuery ? initialQuery.slice(0, 20) : 'New Tab',
      url: initialQuery || '',
      view: initialQuery ? 'search' : 'home',
      searchResults: [],
      aiSynthesis: null,
      readerData: null,
      history: initialQuery ? [initialQuery] : [],
      historyIdx: initialQuery ? 0 : -1,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  const [urlInput, setUrlInput] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const [isProxyOnline, setIsProxyOnline] = useState<boolean>(true);

  // Update input when active tab changes
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url);
    }
  }, [activeTabId]);

  // Check if backend proxy on 127.0.0.1:3001 is reachable
  useEffect(() => {
    let isMounted = true;
    fetch('http://127.0.0.1:3001/api/health', { signal: AbortSignal.timeout(1200) })
      .then((r) => {
        if (isMounted) setIsProxyOnline(r.ok);
      })
      .catch(() => {
        if (isMounted) setIsProxyOnline(false);
      });
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Interactive Navigation Bridge: Handles link clicks and form submits inside the browser iframe
  useEffect(() => {
    const handleBrowserBridgeMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'BROWSER_NAVIGATE' && data.url) {
        loadBrowserPage(data.url, true);
      } else if (data.type === 'BROWSER_PAGE_LOADED') {
        if (data.title) {
          updateActiveTab({ title: data.title });
        }
      }
    };

    window.addEventListener('message', handleBrowserBridgeMessage);
    return () => window.removeEventListener('message', handleBrowserBridgeMessage);
  }, [activeTabId]);

  // Execute initial query if opened with an explicit search prompt
  useEffect(() => {
    if (isOpen && initialQuery) {
      setUrlInput(initialQuery);
      performSearchOrNavigate(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const updateActiveTab = (updater: Partial<BrowserTab> | ((prev: BrowserTab) => BrowserTab)) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTabId) {
          return typeof updater === 'function' ? updater(tab) : { ...tab, ...updater };
        }
        return tab;
      })
    );
  };

  const loadBrowserPage = async (targetUrl: string, addToHistory: boolean = true) => {
    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) return;

    setIsLoading(true);
    setUrlInput(cleanUrl);

    if (addToHistory) {
      updateActiveTab((t) => ({
        ...t,
        url: cleanUrl,
        view: 'webpage',
        history: [...t.history.slice(0, t.historyIdx + 1), cleanUrl],
        historyIdx: t.historyIdx + 1,
      }));
    } else {
      updateActiveTab((t) => ({
        ...t,
        url: cleanUrl,
        view: 'webpage',
      }));
    }

    try {
      const { html, title } = await fetchBrowserPageHtml(cleanUrl);
      updateActiveTab({
        pageHtml: html,
        title: title || cleanUrl.replace(/^https?:\/\//, '').split('/')[0],
      });
    } catch (err) {
      console.error('Browser navigate error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearchOrNavigate = async (queryOrUrl: string) => {
    const clean = queryOrUrl.trim();
    if (!clean) return;

    const isUrl = /^https?:\/\//i.test(clean) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(clean);

    let targetUrl = clean;
    if (isUrl) {
      targetUrl = clean.startsWith('http') ? clean : `https://${clean}`;
    } else {
      // Real Web Search Engine: DuckDuckGo HTML Search
      targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(clean)}`;
    }

    await loadBrowserPage(targetUrl, true);
  };

  const handleCreateTab = () => {
    const newId = 'tab-' + Date.now();
    const newTab: BrowserTab = {
      id: newId,
      title: 'New Tab',
      url: '',
      view: 'home',
      searchResults: [],
      aiSynthesis: null,
      readerData: null,
      history: [],
      historyIdx: -1,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setUrlInput('');
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      // Don't close last tab, just reset to home
      updateActiveTab({
        title: 'New Tab',
        url: '',
        view: 'home',
        searchResults: [],
        aiSynthesis: null,
        readerData: null,
        pageHtml: undefined,
        history: [],
        historyIdx: -1,
      });
      setUrlInput('');
      return;
    }
    const filtered = tabs.filter((t) => t.id !== tabId);
    setTabs(filtered);
    if (activeTabId === tabId) {
      setActiveTabId(filtered[0].id);
      setUrlInput(filtered[0].url);
    }
  };

  const handleGoHome = () => {
    updateActiveTab({
      view: 'home',
      url: '',
      title: 'New Tab',
      pageHtml: undefined,
    });
    setUrlInput('');
  };

  const handleBack = () => {
    if (activeTab.historyIdx > 0) {
      const prev = activeTab.history[activeTab.historyIdx - 1];
      updateActiveTab((t) => ({
        ...t,
        historyIdx: t.historyIdx - 1,
        url: prev,
      }));
      setUrlInput(prev);
      loadBrowserPage(prev, false);
    }
  };

  const handleForward = () => {
    if (activeTab.historyIdx < activeTab.history.length - 1) {
      const next = activeTab.history[activeTab.historyIdx + 1];
      updateActiveTab((t) => ({
        ...t,
        historyIdx: t.historyIdx + 1,
        url: next,
      }));
      setUrlInput(next);
      loadBrowserPage(next, false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performSearchOrNavigate(urlInput);
  };

  const handleOpenLiveWebPage = async (url: string, _title?: string) => {
    await loadBrowserPage(url, true);
  };

  const handleOpenReader = async (result: LiveSearchResult) => {
    setIsLoading(true);
    updateActiveTab((t) => ({
      ...t,
      view: 'reader',
      url: result.url,
      title: result.title.slice(0, 24),
      history: [...t.history.slice(0, t.historyIdx + 1), result.url],
      historyIdx: t.historyIdx + 1,
    }));
    setUrlInput(result.url);

    try {
      const page = await fetchWebPageReader(result.url);
      updateActiveTab({ readerData: page });
    } catch (err) {
      console.error('Page reader error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleInsertSnippet = (title: string, url: string, snippet: string) => {
    if (onInsertIntoPrompt) {
      const citation = `[Live Citation: ${title}](${url})\n> ${snippet}\n\n`;
      onInsertIntoPrompt(citation);
    }
  };

  const handleInsertSynthesis = () => {
    if (onInsertIntoPrompt && activeTab.aiSynthesis) {
      const formatted = `### Web Research Synthesis: "${activeTab.aiSynthesis.query}"\n${activeTab.aiSynthesis.summary}\n\n**Key Findings:**\n${activeTab.aiSynthesis.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n\n`;
      onInsertIntoPrompt(formatted);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      className={`border-l border-zinc-800/80 bg-[#07070a] shadow-2xl flex flex-col flex-shrink-0 transition-all duration-300 select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-full h-full'
          : 'fixed inset-0 z-50 w-full h-full lg:relative lg:h-full lg:w-[480px] xl:w-[540px] 2xl:w-[580px] lg:max-w-[42vw] lg:z-20'
      }`}
    >
      {/* 1. Browser Tabs Bar */}
      <div className="flex items-center justify-between px-2 pt-2 border-b border-zinc-800 bg-[#040406] flex-shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 max-w-[calc(100%-80px)]">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-medium cursor-pointer transition max-w-[140px] truncate border-t border-x ${
                  isActive
                    ? 'bg-[#09090d] border-zinc-700 text-white shadow-sm'
                    : 'bg-zinc-900/40 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                }`}
              >
                <Globe className="w-3 h-3 flex-shrink-0 text-zinc-400" />
                <span className="truncate flex-1 text-[11px]">{tab.title}</span>
                <button
                  type="button"
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="hover:bg-zinc-800 p-0.5 rounded text-zinc-500 hover:text-white"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleCreateTab}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Open new tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Close browser panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Omnibar & Navigation Bar */}
      <div className="p-2.5 border-b border-zinc-800 bg-[#060609] space-y-2 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-zinc-500">
            <button
              type="button"
              onClick={handleBack}
              disabled={activeTab.historyIdx <= 0}
              className="p-1 hover:text-white transition disabled:opacity-30 cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleForward}
              disabled={activeTab.historyIdx >= activeTab.history.length - 1}
              className="p-1 hover:text-white transition disabled:opacity-30 cursor-pointer"
              title="Forward"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => performSearchOrNavigate(urlInput)}
              className="p-1 hover:text-white transition cursor-pointer"
              title="Reload"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-white' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleGoHome}
              className="p-1 hover:text-white transition cursor-pointer"
              title="Browser Home"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 relative flex items-center">
            <Lock className="w-3 h-3 absolute left-2.5 text-emerald-400" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search live web, arXiv preprints, or enter URL..."
              className="w-full pl-7 pr-8 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
            />
            <button
              type="submit"
              className="absolute right-2 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Search / Navigate"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* View Switcher Chips (Only shown when not in home) */}
        {activeTab.view !== 'home' && (
          <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
            <div className="flex items-center gap-1">
              {activeTab.searchResults.length > 0 && (
                <button
                  type="button"
                  onClick={() => updateActiveTab({ view: 'search' })}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    activeTab.view === 'search'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Search className="w-3 h-3" />
                  <span>Search ({activeTab.searchResults.length})</span>
                </button>
              )}

              {activeTab.url && (
                <button
                  type="button"
                  onClick={() => updateActiveTab({ view: 'webpage' })}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    activeTab.view === 'webpage'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>Live Web View</span>
                </button>
              )}

              {activeTab.url && (
                <button
                  type="button"
                  onClick={async () => {
                    updateActiveTab({ view: 'reader' });
                    if (!activeTab.readerData) {
                      setIsLoading(true);
                      try {
                        const page = await fetchWebPageReader(activeTab.url);
                        updateActiveTab({ readerData: page });
                      } finally {
                        setIsLoading(false);
                      }
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    activeTab.view === 'reader'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Reader View</span>
                </button>
              )}

              {activeTab.url && (
                <a
                  href={activeTab.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-zinc-500 hover:text-white transition"
                  title="Open externally in new tab"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={handleGoHome}
              className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-[10px] cursor-pointer"
            >
              <Home className="w-3 h-3" />
              <span>Start Page</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Main Browser Viewport */}
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
        
        {/* ================= VIEW 1: BROWSER HOME PAGE WITH PARTICLE PROXIMITY LINES ================= */}
        {activeTab.view === 'home' && (
          <div className="relative min-h-full flex flex-col justify-between p-5 sm:p-6 overflow-hidden">
            {/* Interactive Particle Canvas Background */}
            <ParticleProximityCanvas className="opacity-80" />

            {/* Home Content Foreground */}
            <div className="relative z-10 space-y-6 pt-4">
              {/* Brand Emblem */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xl">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-extrabold text-white tracking-wide">
                  XENO WEB NAVIGATOR
                </h1>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Autonomous AI-driven web navigation, real-time arXiv preprint discovery, and deep research synthesis.
                </p>
              </div>

              {/* Centered Search Omnibar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  performSearchOrNavigate(urlInput);
                }}
                className="relative max-w-md mx-auto"
              >
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Enter web address or search AI research..."
                  className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white shadow-2xl"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Quick Access Bookmarks Grid */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-zinc-400 px-1">
                  <Bookmark className="w-3 h-3 text-zinc-400" />
                  <span>Research Hubs & Bookmarks</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DEFAULT_BOOKMARKS.map((bm) => (
                    <button
                      key={bm.name}
                      type="button"
                      onClick={() => {
                        setUrlInput(bm.url);
                        performSearchOrNavigate(bm.url);
                      }}
                      className="p-3 rounded-2xl bg-black/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-600 transition text-left backdrop-blur-sm cursor-pointer group shadow-sm flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <Globe className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition" />
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${bm.color}`}>
                          {bm.tag}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-white group-hover:text-zinc-100 truncate">
                          {bm.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate mt-0.5 font-mono">
                          {bm.url.replace('https://', '')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Topics Pill Chips */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-zinc-400 px-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Trending AI Inquiries</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCHES.map((query) => (
                    <button
                      key={query}
                      type="button"
                      onClick={() => {
                        setUrlInput(query);
                        performSearchOrNavigate(query);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Search className="w-2.5 h-2.5 text-zinc-500" />
                      <span>{query}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Telemetry */}
            <div className="relative z-10 pt-6 text-center text-[10px] font-mono text-zinc-600">
              Interactive Proximity Network Engine • Real-Time Web Crawler
            </div>
          </div>
        )}

        {/* ================= VIEW 2: SEARCH RESULTS & AI SYNTHESIS ================= */}
        {activeTab.view === 'search' && (
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-xs font-mono text-zinc-400">
                <RotateCw className="w-5 h-5 animate-spin text-white" />
                <span>Searching live internet and extracting research papers...</span>
              </div>
            ) : (
              <>
                {/* AI Research Synthesis Card */}
                {activeTab.aiSynthesis && (
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-700/80 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>AI Research Synthesis</span>
                      </div>
                      {onInsertIntoPrompt && (
                        <button
                          onClick={handleInsertSynthesis}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black text-[11px] font-semibold transition cursor-pointer"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Insert into Chat</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {activeTab.aiSynthesis.summary}
                    </p>

                    {activeTab.aiSynthesis.keyTakeaways.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-zinc-800">
                        <div className="text-[10px] font-mono uppercase text-zinc-400">
                          Verified Key Findings:
                        </div>
                        <ul className="space-y-1 text-xs text-zinc-300">
                          {activeTab.aiSynthesis.keyTakeaways.map((takeaway, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-white font-bold">•</span>
                              <span>{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Search Results List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                    <span className="font-semibold text-white">SEARCH RESULTS ({activeTab.searchResults.length})</span>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Engine: Live Multi-Source (DuckDuckGo + arXiv + Wikipedia)</span>
                    </span>
                  </div>

                  {activeTab.searchResults.length === 0 ? (
                    <div className="text-center py-12 text-xs text-zinc-500 font-mono">
                      No results found for this query. Try a different query or enter a direct URL.
                    </div>
                  ) : (
                    activeTab.searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-zinc-400 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-zinc-500" />
                            <span>{result.source || result.url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                            {result.date && <span>• {result.date}</span>}
                          </span>
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-white transition flex items-center gap-1"
                            title="Open in new window"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <h3
                          onClick={() => handleOpenLiveWebPage(result.url, result.title)}
                          className="text-xs sm:text-sm font-bold text-white hover:text-sky-300 transition cursor-pointer leading-snug line-clamp-2"
                        >
                          {result.title}
                        </h3>

                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                          {result.snippet}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-500 border-t border-zinc-800/50">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenLiveWebPage(result.url, result.title)}
                              className="text-white hover:text-sky-300 font-medium flex items-center gap-1 cursor-pointer bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded-lg"
                            >
                              <Globe className="w-3 h-3 text-emerald-400" />
                              <span>Browse Web Page</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenReader(result)}
                              className="text-zinc-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer px-2 py-1"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>Reader</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(idx, result.url)}
                              className="hover:text-white transition flex items-center gap-1 cursor-pointer"
                              title="Copy URL"
                            >
                              {copiedIdx === idx ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>Copy Link</span>
                            </button>

                            {onInsertIntoPrompt && (
                              <button
                                type="button"
                                onClick={() => handleInsertSnippet(result.title, result.url, result.snippet)}
                                className="hover:text-white transition flex items-center gap-1 cursor-pointer"
                                title="Insert into chat prompt"
                              >
                                <Share2 className="w-3 h-3" />
                                <span>Cite</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= VIEW 3: DISTRACTION-FREE PAGE READER VIEW ================= */}
        {activeTab.view === 'reader' && (
          <div className="p-5 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-xs font-mono text-zinc-400">
                <RotateCw className="w-5 h-5 animate-spin text-white" />
                <span>Extracting clean markdown reader view...</span>
              </div>
            ) : activeTab.readerData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">{activeTab.readerData.domain}</span>
                    <span>•</span>
                    <span>{activeTab.readerData.wordCount} words</span>
                  </div>
                  {onInsertIntoPrompt && (
                    <button
                      onClick={() => {
                        const snippet = `### Extracted Article: "${activeTab.readerData?.title}"\nSource: ${activeTab.readerData?.url}\n\n${activeTab.readerData?.content.slice(0, 1500)}...\n\n`;
                        onInsertIntoPrompt(snippet);
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Quote in Chat</span>
                    </button>
                  )}
                </div>

                <h1 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {activeTab.readerData.title}
                </h1>

                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                  {activeTab.readerData.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-zinc-500 font-mono">
                Unable to extract clean reader content for this page.
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 4: EMBEDDED LIVE WEBPAGE (FULL WEB BROWSING IN PANEL) ================= */}
        {activeTab.view === 'webpage' && (
          <div className="flex-1 w-full h-full min-h-[500px] relative bg-[#09090d] flex flex-col overflow-hidden">
            {/* Action Bar for Embedded Pages */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#0b0b10] border-b border-zinc-800 text-xs font-mono">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="truncate text-zinc-200 font-semibold max-w-[200px] sm:max-w-md">{activeTab.title || activeTab.url}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => loadBrowserPage(activeTab.url, false)}
                  className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                  title="Reload Page"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-white' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenReader({
                      title: activeTab.title || 'Reader View',
                      url: activeTab.url,
                      snippet: '',
                      source: 'Direct URL',
                    })
                  }
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] sm:text-xs transition cursor-pointer"
                  title="Switch to Distraction-Free Reader View"
                >
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>Reader</span>
                </button>
                <a
                  href={activeTab.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] sm:text-xs transition cursor-pointer"
                  title="Open directly in new browser window"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden sm:inline">External</span>
                </a>
              </div>
            </div>

            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-xs font-mono text-zinc-300 gap-3">
                <RotateCw className="w-6 h-6 animate-spin text-white" />
                <span className="font-semibold">Loading live interactive page...</span>
                <span className="text-[11px] text-zinc-500 max-w-xs text-center truncate">{activeTab.url}</span>
              </div>
            )}

            {activeTab.pageHtml ? (
              <iframe
                key={activeTab.url}
                srcDoc={activeTab.pageHtml}
                className="w-full h-full border-0 flex-1 bg-white min-h-[480px]"
                title={activeTab.title}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                onLoad={() => setIsLoading(false)}
              />
            ) : activeTab.url ? (
              <iframe
                key={activeTab.url}
                src={
                  isProxyOnline
                    ? `http://127.0.0.1:3001/api/proxy?url=${encodeURIComponent(activeTab.url)}`
                    : `/api/proxy?url=${encodeURIComponent(activeTab.url)}`
                }
                className="w-full h-full border-0 flex-1 bg-white min-h-[480px]"
                title={activeTab.title}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                onLoad={() => setIsLoading(false)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 font-mono text-xs text-zinc-400">
                <Compass className="w-8 h-8 text-zinc-500 animate-pulse" />
                <span>No active URL loaded in this tab.</span>
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="px-3 py-1.5 rounded-xl bg-white text-black font-semibold cursor-pointer"
                >
                  Return to Start Page
                </button>
              </div>
            )}

            {/* Bottom Status Bar */}
            <div className="px-3 sm:px-4 py-1.5 bg-[#07070a] border-t border-zinc-800 text-[10px] sm:text-[11px] font-mono text-zinc-500 flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-zinc-400 font-medium">Interactive Web Engine</span>
                <span>•</span>
                <span className="truncate">{activeTab.url}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(999, activeTab.url)}
                  className="text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1"
                  title="Copy Page URL"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
