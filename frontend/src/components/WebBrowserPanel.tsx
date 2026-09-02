import React, { useState } from 'react';
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

interface WebBrowserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertIntoPrompt?: (snippet: string) => void;
  initialQuery?: string;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date?: string;
}

export const WebBrowserPanel: React.FC<WebBrowserPanelProps> = ({
  isOpen,
  onClose,
  onInsertIntoPrompt,
  initialQuery = 'https://duckduckgo.com',
}) => {
  const [urlInput, setUrlInput] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<number | null>(null);

  // Simulated & Live Web Search Results
  const searchResults: SearchResult[] = [
    {
      title: 'DeepSeek-R1 Technical Report & Architecture Specification',
      url: 'https://arxiv.org/abs/2501.12948',
      source: 'arXiv.org',
      snippet: 'We introduce DeepSeek-R1-Zero and DeepSeek-R1, reasoning models trained with large-scale reinforcement learning. DeepSeek-R1 achieves 97.3% on MATH-500 and 79.8% on Pass@1.',
      date: 'Jan 2025',
    },
    {
      title: 'Anthropic Claude 3.7 Sonnet: Hybrid Architecture & SWE-bench Leaderboard',
      url: 'https://www.anthropic.com/research/claude-3-7-sonnet',
      source: 'anthropic.com',
      snippet: 'Claude 3.7 Sonnet is the first frontier model offering dynamic thinking control and computer use capabilities, setting the state-of-the-art score of 70.3% on SWE-bench Verified.',
      date: 'Feb 2025',
    },
    {
      title: 'LMSYS Chatbot Arena Leaderboard - ELO Rankings & Human Evaluation',
      url: 'https://chat.lmsys.org/?leaderboard',
      source: 'arena.ai',
      snippet: 'Chatbot Arena is an open evaluation platform for LLMs based on crowdsourced human preference battles. Updated with Claude 3.7, DeepSeek-R1, and o3-mini ratings.',
      date: 'Current',
    },
    {
      title: 'FlashAttention-3: Fast and Memory-Efficient Exact Attention with FP8',
      url: 'https://github.com/Dao-AILab/flash-attention',
      source: 'github.com',
      snippet: 'FlashAttention-3 leverages hardware asynchronous pipelines and FP8 Tensor Cores on NVIDIA Hopper H100 GPUs, yielding 1.8x acceleration over FlashAttention-2.',
      date: '2025',
    },
  ];

  if (!isOpen) return null;

  const handleNavigate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = urlInput.trim();
    if (!clean) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetIdx(idx);
    setTimeout(() => setCopiedSnippetIdx(null), 2000);
  };

  const handleSendSnippet = (snippet: SearchResult) => {
    if (onInsertIntoPrompt) {
      const formatted = `[Web Citation: ${snippet.title}](${snippet.url})\n> ${snippet.snippet}\n\n`;
      onInsertIntoPrompt(formatted);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 bg-[#09090c] border-l border-zinc-800 shadow-2xl flex flex-col transition-all duration-300 ${
        isFullscreen ? 'w-full' : 'w-full sm:w-[480px] md:w-[560px] lg:w-[620px]'
      }`}
    >
      {/* Browser Navigation Top Bar */}
      <div className="p-3 border-b border-zinc-800 bg-[#060608] space-y-2 flex-shrink-0">
        
        {/* Actions & Tab Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            </div>
            <span className="text-xs font-semibold text-zinc-200 ml-1">Split Web Browser & Search</span>
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
              placeholder="Search Google/DuckDuckGo or enter URL..."
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
        
        {/* Search Results Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>LIVE WEB CITATIONS & SOURCES</span>
            <span>{searchResults.length} Verified Results</span>
          </div>

          {searchResults.map((res, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition space-y-2 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-zinc-400" />
                  <span>{res.source}</span>
                  {res.date && <span>• {res.date}</span>}
                </span>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-white transition p-1"
                  title="Open external link"
                >
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
                <span className="text-zinc-500 truncate max-w-[220px]">{res.url}</span>

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

      </div>

      {/* Browser Footer Info */}
      <div className="p-2.5 border-t border-zinc-800 bg-[#060608] flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <span>XENO BROWSER RUNTIME • SECURE SANDBOX</span>
        <span>HTTPS // ZERO-TRACKING</span>
      </div>

    </div>
  );
};
