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
} from 'lucide-react';
import { fetchLiveWebSearch } from '../services/liveData';
import type { LiveSearchResult } from '../services/liveData';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<LiveSearchResult[]>([]);
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');

  // Perform initial search on mount or when query changes
  useEffect(() => {
    if (isOpen && initialQuery && initialQuery !== lastSearchedQuery) {
      setUrlInput(initialQuery);
      performSearch(initialQuery);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const performSearch = async (query: string) => {
    const clean = query.trim();
    if (!clean) return;

    setIsLoading(true);
    setLastSearchedQuery(clean);

    try {
      const results = await fetchLiveWebSearch(clean);
      setSearchResults(results);
    } catch (err) {
      console.error('Live search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performSearch(urlInput);
  };

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetIdx(idx);
    setTimeout(() => setCopiedSnippetIdx(null), 2000);
  };

  const handleSendSnippet = (snippet: LiveSearchResult) => {
    if (onInsertIntoPrompt) {
      const formatted = `[Live Web Citation: ${snippet.title}](${snippet.url})\n> ${snippet.snippet}\n\n`;
      onInsertIntoPrompt(formatted);
    }
  };

  return (
    <aside
      className={`border-l border-zinc-800 bg-[#09090c] shadow-2xl flex flex-col flex-shrink-0 transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-full h-full'
          : 'relative h-full w-full sm:w-[460px] md:w-[500px] lg:w-[460px] xl:w-[540px] 2xl:w-[600px] z-30'
      }`}
    >
      {/* Browser Navigation Top Bar */}
      <div className="p-3 border-b border-zinc-800 bg-[#060608] space-y-2 flex-shrink-0">
        
        {/* Actions & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            </div>
            <span className="text-xs font-semibold text-zinc-200 ml-1">Live Split Web Browser</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
              REAL-TIME API
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
              title="Close browser"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Address Bar & Search Omnibar */}
        <form onSubmit={handleNavigate} className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-zinc-500">
            <button
              type="button"
              className="p-1 hover:text-white transition disabled:opacity-30"
              disabled
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1 hover:text-white transition disabled:opacity-30"
              disabled
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleNavigate()}
              className="p-1 hover:text-white transition"
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
              placeholder="Search live web, arXiv, or Wikipedia..."
              className="w-full pl-7 pr-8 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-mono"
            />
            <button
              type="submit"
              className="absolute right-2 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>

      {/* Browser Viewport Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8 gap-2 text-xs font-mono text-zinc-400">
            <RotateCw className="w-4 h-4 animate-spin text-white" />
            <span>Querying live web endpoints & citations...</span>
          </div>
        )}

        {/* Search Results Feed */}
        {!isLoading && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-white" />
                <span>LIVE WEB RESULTS ({searchResults.length})</span>
              </span>
              <span>Query: "{lastSearchedQuery}"</span>
            </div>

            {searchResults.map((res, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition space-y-2 group shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                    <span>{res.source}</span>
                    {res.date && <span>• {res.date}</span>}
                  </span>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white transition p-1 flex items-center gap-1 text-[10px] font-mono"
                    title="Open external link"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-zinc-100 leading-snug">
                  {res.title}
                </h4>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {res.snippet}
                </p>

                {/* Quick Actions Tray */}
                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500 truncate max-w-[180px]">{res.url}</span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(idx, res.snippet)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
                      title="Copy snippet"
                    >
                      {copiedSnippetIdx === idx ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSnippetIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>

                    {onInsertIntoPrompt && (
                      <button
                        type="button"
                        onClick={() => handleSendSnippet(res)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold transition cursor-pointer"
                        title="Send into chat prompt"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send to Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Browser Footer Info */}
      <div className="p-2.5 border-t border-zinc-800 bg-[#060608] flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <span>XENO LIVE WEB RUNTIME</span>
        <span>HTTPS // CORS-ENABLED</span>
      </div>

    </aside>
  );
};
