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
  Send,
  Maximize2,
  Minimize2,
  Sparkles,
  BookOpen,
  Compass,
} from 'lucide-react';
import { fetchLiveWebSearch, fetchWebPageReader } from '../services/liveData';
import type { LiveSearchResult, AiSearchSynthesis, WebPageReaderData } from '../services/liveData';

interface WebBrowserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertIntoPrompt?: (snippet: string) => void;
  initialQuery?: string;
}

export const WebBrowserPanel: React.FC<WebBrowserPanelProps> = ({
  isOpen,
  onClose,
  onInsertIntoPrompt,
  initialQuery = 'DeepSeek R1 reasoning architecture',
}) => {
  const [urlInput, setUrlInput] = useState(initialQuery);
  const [activeView, setActiveView] = useState<'search' | 'reader'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<LiveSearchResult[]>([]);
  const [aiSynthesis, setAiSynthesis] = useState<AiSearchSynthesis | null>(null);
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');
  const [readerData, setReaderData] = useState<WebPageReaderData | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  // Perform initial search on mount or when query changes
  useEffect(() => {
    if (isOpen && initialQuery && initialQuery !== lastSearchedQuery) {
      setUrlInput(initialQuery);
      performSearchOrNavigate(initialQuery);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const performSearchOrNavigate = async (queryOrUrl: string) => {
    const clean = queryOrUrl.trim();
    if (!clean) return;

    // Check if input is a direct URL
    const isUrl = /^https?:\/\//i.test(clean) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(clean);

    if (isUrl) {
      const fullUrl = clean.startsWith('http') ? clean : `https://${clean}`;
      setIsLoading(true);
      setActiveView('reader');
      try {
        const page = await fetchWebPageReader(fullUrl);
        setReaderData(page);
        pushHistory(fullUrl);
      } catch (err) {
        console.error('Reader error:', err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Otherwise perform AI Web Search
    setIsLoading(true);
    setActiveView('search');
    setLastSearchedQuery(clean);
    pushHistory(clean);

    try {
      const { results, synthesis } = await fetchLiveWebSearch(clean);
      setSearchResults(results);
      setAiSynthesis(synthesis);
    } catch (err) {
      console.error('Live search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const pushHistory = (item: string) => {
    setHistory((prev) => [...prev.slice(0, historyIdx + 1), item]);
    setHistoryIdx((prev) => prev + 1);
  };

  const handleBack = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setHistoryIdx(historyIdx - 1);
      setUrlInput(prev);
      performSearchOrNavigate(prev);
    }
  };

  const handleForward = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setHistoryIdx(historyIdx + 1);
      setUrlInput(next);
      performSearchOrNavigate(next);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performSearchOrNavigate(urlInput);
  };

  const handleOpenReader = async (result: LiveSearchResult) => {
    setIsLoading(true);
    setActiveView('reader');
    setUrlInput(result.url);
    pushHistory(result.url);
    try {
      const page = await fetchWebPageReader(result.url);
      setReaderData(page);
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
    if (onInsertIntoPrompt && aiSynthesis) {
      const formatted = `### Web Research Synthesis: "${aiSynthesis.query}"\n${aiSynthesis.summary}\n\n**Key Findings:**\n${aiSynthesis.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n\n`;
      onInsertIntoPrompt(formatted);
    }
  };

  return (
    <aside
      className={`border-l border-zinc-800/80 bg-[#07070a] shadow-2xl flex flex-col flex-shrink-0 transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-full h-full'
          : 'fixed inset-0 z-50 w-full h-full lg:relative lg:h-full lg:w-[420px] xl:w-[460px] 2xl:w-[500px] lg:max-w-[38vw] lg:z-20'
      }`}
    >
      {/* Omnibar & Top Navigation Bar */}
      <div className="p-3 border-b border-zinc-800 bg-[#040406] space-y-2 flex-shrink-0">
        
        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Back to Chat on Mobile/Tablet */}
            <button
              onClick={onClose}
              className="lg:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition cursor-pointer"
              title="Back to Chat"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="font-semibold">Chat</span>
            </button>

            <div className="hidden sm:flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            </div>
            <span className="text-xs font-bold text-white ml-0.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-white" />
              <span>AI Web Search</span>
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
              LIVE
            </span>
          </div>

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

        {/* Address Omnibar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-zinc-500">
            <button
              type="button"
              onClick={handleBack}
              disabled={historyIdx <= 0}
              className="p-1 hover:text-white transition disabled:opacity-30 cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleForward}
              disabled={historyIdx >= history.length - 1}
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
          </div>

          <div className="flex-1 relative flex items-center">
            <Lock className="w-3 h-3 absolute left-2.5 text-emerald-400" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search live web, arXiv papers, or enter URL..."
              className="w-full pl-7 pr-8 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
            />
            <button
              type="submit"
              className="absolute right-2 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* View Switcher Tabs (Search vs Reader) */}
        <div className="flex items-center gap-1 pt-1 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setActiveView('search')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer ${
              activeView === 'search'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search className="w-3 h-3" />
            <span>Search Results ({searchResults.length})</span>
          </button>

          {readerData && (
            <button
              type="button"
              onClick={() => setActiveView('reader')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer ${
                activeView === 'reader'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Reader View</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-2.5 text-xs font-mono text-zinc-400">
            <RotateCw className="w-5 h-5 animate-spin text-white" />
            <span>Connecting to live web index & synthesizing AI overview...</span>
          </div>
        )}

        {/* ================= SEARCH RESULTS VIEW ================= */}
        {!isLoading && activeView === 'search' && (
          <div className="space-y-4">
            
            {/* AI Search Synthesis ("AI Overview") */}
            {aiSynthesis && (
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-700/80 space-y-3 shadow-lg">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-white font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI SEARCH SYNTHESIS</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleInsertSynthesis}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white hover:bg-zinc-200 text-black text-[10px] font-bold transition cursor-pointer"
                    title="Send synthesis to chat"
                  >
                    <Send className="w-2.5 h-2.5" />
                    <span>Send to Chat</span>
                  </button>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {aiSynthesis.summary}
                </p>

                {/* Key Takeaways */}
                {aiSynthesis.keyTakeaways.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-xs">
                    <div className="text-[10px] font-mono uppercase text-zinc-500">Key Takeaways:</div>
                    {aiSynthesis.keyTakeaways.map((point, i) => (
                      <div key={i} className="text-zinc-300 flex items-start gap-1.5 leading-snug">
                        <span className="text-zinc-500 font-mono mt-0.5">•</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Citation Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {aiSynthesis.citations.map((c) => (
                    <a
                      key={c.index}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black border border-zinc-800 hover:border-zinc-600 text-[10px] font-mono text-zinc-300 hover:text-white transition"
                    >
                      <span className="w-3 h-3 rounded-full bg-zinc-800 text-[9px] flex items-center justify-center font-bold">
                        {c.index}
                      </span>
                      <span className="truncate max-w-[120px]">{c.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span>LIVE WEB RESULTS ({searchResults.length})</span>
              </span>
              <span className="truncate max-w-[160px]">"{lastSearchedQuery}"</span>
            </div>

            {/* Real Search Cards List (No Fake Thumbnails!) */}
            <div className="space-y-3">
              {searchResults.map((res, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition space-y-2.5 group shadow-sm"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                        {res.source}
                      </span>
                      {res.date && <span>• {res.date}</span>}
                    </span>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-white transition flex items-center gap-1"
                      title="Open external website"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Title & Clickable Reader Trigger */}
                  <h4
                    onClick={() => handleOpenReader(res)}
                    className="text-xs sm:text-sm font-bold text-white group-hover:text-zinc-100 leading-snug cursor-pointer hover:underline"
                  >
                    {res.title}
                  </h4>

                  {/* Snippet Content */}
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {res.snippet}
                  </p>

                  {/* Actions Tray */}
                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-500 truncate max-w-[160px] text-[10px]">
                      {res.url}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenReader(res)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition cursor-pointer"
                        title="Read full article"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Read</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(idx, res.snippet)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
                        title="Copy snippet"
                      >
                        {copiedIdx === idx ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                      </button>

                      {onInsertIntoPrompt && (
                        <button
                          type="button"
                          onClick={() => handleInsertSnippet(res.title, res.url, res.snippet)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold transition cursor-pointer"
                          title="Send citation into chat"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= IN-PANEL WEB READER VIEW ================= */}
        {!isLoading && activeView === 'reader' && readerData && (
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveView('search')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Search</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={readerData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition"
                >
                  <span>Open Full Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {onInsertIntoPrompt && (
                  <button
                    type="button"
                    onClick={() => {
                      const excerpt = readerData.content.slice(0, 1200);
                      onInsertIntoPrompt(
                        `### [Source: ${readerData.title}](${readerData.url})\n> ${excerpt}\n\n`
                      );
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send to Chat</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2">
                <span>{readerData.domain}</span>
                <span>•</span>
                <span>~{readerData.wordCount} words</span>
                {readerData.date && <span>• {readerData.date}</span>}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                {readerData.title}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap pt-2 border-t border-zinc-800/60">
              {readerData.content}
            </div>
          </div>
        )}

      </div>

      {/* Browser Footer Info */}
      <div className="p-2.5 border-t border-zinc-800 bg-[#040406] flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <span>XENO LIVE AI SEARCH RUNTIME</span>
        <span>CORS-FREE PROXY // REAL-TIME INDEX</span>
      </div>

    </aside>
  );
};
