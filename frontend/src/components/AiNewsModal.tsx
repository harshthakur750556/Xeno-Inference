import React, { useState, useEffect } from 'react';
import {
  X,
  Newspaper,
  ExternalLink,
  Calendar,
  CheckCircle2,
  ArrowRight,
  RotateCw,
  Search,
  Sparkles,
  BookOpen,
  Share2,
  Check,
} from 'lucide-react';
import { fetchLiveAiNews } from '../services/liveData';
import type { LiveNewsItem } from '../services/liveData';

interface AiNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel?: (modelId: string) => void;
}

export const AiNewsModal: React.FC<AiNewsModalProps> = ({
  isOpen,
  onClose,
  onSelectModel,
}) => {
  const [articles, setArticles] = useState<LiveNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<LiveNewsItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [copiedLink, setCopiedLink] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLiveAiNews();
      setArticles(data);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error loading live AI news:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Handle escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedArticle) {
          setSelectedArticle(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedArticle]);

  if (!isOpen) return null;

  const categories = ['ALL', 'MODEL RELEASE', 'RESEARCH', 'BREAKTHROUGH'];

  const filtered = articles.filter((item) => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch =
      searchFilter === '' ||
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.company.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const renderThumbnailBadge = (article: LiveNewsItem) => {
    const b = article.companyBadge;
    const c = article.company.toLowerCase();

    if (b === 'GOOG' || c.includes('google')) {
      return (
        <div className="h-36 w-full rounded-t-2xl bg-gradient-to-br from-blue-950/80 via-zinc-900 to-black p-4 flex flex-col justify-between border-b border-zinc-800 relative overflow-hidden group-hover:from-blue-900/60 transition duration-300">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              GOOGLE DEEPMIND
            </span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase bg-zinc-800/80 px-2 py-0.5 rounded-md">
              {article.category}
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-base font-extrabold text-white tracking-wide">
              {article.title.split('Launched')[0].split('Officially')[0].trim()}
            </div>
            <div className="text-[10px] font-mono text-blue-300/80">
              Frontier Multimodal & Reasoning Infrastructure
            </div>
          </div>
        </div>
      );
    }

    if (b === 'ANTH' || c.includes('anthropic')) {
      return (
        <div className="h-36 w-full rounded-t-2xl bg-gradient-to-br from-amber-950/80 via-zinc-900 to-black p-4 flex flex-col justify-between border-b border-zinc-800 relative overflow-hidden group-hover:from-amber-900/60 transition duration-300">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              ANTHROPIC CLAUDE
            </span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase bg-zinc-800/80 px-2 py-0.5 rounded-md">
              {article.category}
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-base font-extrabold text-white tracking-wide">
              {article.title.split('Launched')[0].split('Officially')[0].trim()}
            </div>
            <div className="text-[10px] font-mono text-amber-300/80">
              Constitutional AI & Frontier Reasoning Architecture
            </div>
          </div>
        </div>
      );
    }

    if (b === 'META' || c.includes('meta')) {
      return (
        <div className="h-36 w-full rounded-t-2xl bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-black p-4 flex flex-col justify-between border-b border-zinc-800 relative overflow-hidden group-hover:from-indigo-900/60 transition duration-300">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              META FAIR
            </span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase bg-zinc-800/80 px-2 py-0.5 rounded-md">
              {article.category}
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-base font-extrabold text-white tracking-wide">
              {article.title.split('Launched')[0].split('Officially')[0].trim()}
            </div>
            <div className="text-[10px] font-mono text-indigo-300/80">
              Open Weights Frontier Intelligence
            </div>
          </div>
        </div>
      );
    }

    if (b === 'ARX' || c.includes('arxiv')) {
      return (
        <div className="h-36 w-full rounded-t-2xl bg-gradient-to-br from-rose-950/80 via-zinc-900 to-black p-4 flex flex-col justify-between border-b border-zinc-800 relative overflow-hidden group-hover:from-rose-900/60 transition duration-300">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <BookOpen className="w-3 h-3 text-rose-400" />
              arXiv cs.AI PREPRINT
            </span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase bg-zinc-800/80 px-2 py-0.5 rounded-md">
              Peer Research
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-white line-clamp-2">
              {article.title}
            </div>
            <div className="text-[10px] font-mono text-rose-300/80">
              {article.company}
            </div>
          </div>
        </div>
      );
    }

    // Default Lab Banner
    return (
      <div className="h-36 w-full rounded-t-2xl bg-gradient-to-br from-zinc-800/80 via-zinc-900 to-black p-4 flex flex-col justify-between border-b border-zinc-800 relative overflow-hidden group-hover:from-zinc-700/60 transition duration-300">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-zinc-700/40 text-zinc-300 border border-zinc-600">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {article.company}
          </span>
          <span className="text-[9px] font-mono text-zinc-400 uppercase bg-zinc-800/80 px-2 py-0.5 rounded-md">
            {article.category}
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-bold text-white line-clamp-2">
            {article.title}
          </div>
          <div className="text-[10px] font-mono text-zinc-400">
            {article.company} • {article.date}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none">
        <div className="relative w-full max-w-5xl rounded-3xl border border-zinc-800 bg-[#09090c] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-zinc-800 bg-[#060608]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    Live AI Releases, Frontier Models & arXiv Research
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>REAL-TIME FEED</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Newest foundation model releases, official architecture specifications & daily arXiv preprints (Updated {lastRefreshed})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={isLoading}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                title="Refresh live news"
              >
                <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-white' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-5 sm:px-7 py-3 border-b border-zinc-800/80 bg-[#07070a]">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex-shrink-0 ${
                    activeCategory === cat
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {cat === 'ALL' ? 'All Intelligence' : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-shrink-0 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by lab, model, or paper..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
              />
            </div>
          </div>

          {/* News Grid */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-4 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 gap-2 text-xs font-mono text-zinc-400">
                <RotateCw className="w-5 h-5 animate-spin text-white" />
                <span>Pulling newest frontier releases & live arXiv papers...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-xs font-mono text-zinc-500 space-y-2">
                <p>No reports match your active filter.</p>
                <button
                  onClick={() => { setActiveCategory('ALL'); setSearchFilter(''); }}
                  className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-600 transition flex flex-col justify-between cursor-pointer group shadow-sm overflow-hidden"
                  >
                    {/* Official Thumbnail Banner */}
                    {renderThumbnailBadge(article)}

                    {/* Card Content Body */}
                    <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-white group-hover:text-zinc-100 leading-snug line-clamp-2">
                          {article.title}
                        </h3>

                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                          {article.summary}
                        </p>
                      </div>

                      {/* Footer Action */}
                      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span>{article.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sky-400 group-hover:text-sky-300 font-sans font-semibold">
                          <span>View Full Article</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Telemetry */}
          <div className="px-5 sm:px-7 py-3 border-t border-zinc-800 bg-[#060608] flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Aggregated from OpenRouter Live Mesh, arXiv API & Hugging Face</span>
            <span>{filtered.length} Reports Indexed</span>
          </div>

        </div>
      </div>

      {/* ================= FULL ARTICLE READER POPUP MODAL (CLICK-TO-POPUP) ================= */}
      {selectedArticle && (
        <div
          onClick={() => setSelectedArticle(null)}
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl select-text animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl rounded-3xl border border-zinc-700 bg-[#0b0b0f] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#07070a]">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-white text-black font-extrabold text-xs flex items-center justify-center">
                  {selectedArticle.companyBadge}
                </span>
                <div>
                  <div className="text-xs font-bold text-white">{selectedArticle.company}</div>
                  <div className="text-[10px] font-mono text-zinc-400">
                    {selectedArticle.date} • {selectedArticle.category}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                title="Close article"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Article Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                {selectedArticle.title}
              </h1>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs sm:text-sm text-zinc-300 leading-relaxed font-serif">
                {selectedArticle.summary}
              </div>

              {/* Benchmark Highlights */}
              {selectedArticle.benchmarkHighlights && selectedArticle.benchmarkHighlights.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Verified Technical Specifications</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {selectedArticle.benchmarkHighlights.map((b, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-black border border-zinc-800 text-center font-mono">
                        <div className="text-[11px] text-zinc-400">{b.metric}</div>
                        <div className="text-base font-extrabold text-white mt-0.5">{b.score}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{b.comparison}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Capabilities */}
              {selectedArticle.capabilities && selectedArticle.capabilities.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Key Features & Release Highlights
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedArticle.capabilities.map((cap, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Technical Article Content */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-800">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Full Technical Overview & Preprint Abstract
                </h4>
                <div className="text-xs sm:text-sm text-zinc-300 whitespace-pre-line leading-relaxed font-sans bg-black/40 p-4 rounded-2xl border border-zinc-800/80">
                  {selectedArticle.fullContent}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="px-6 py-4 border-t border-zinc-800 bg-[#07070a] flex items-center justify-between">
              <a
                href={selectedArticle.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition font-medium"
              >
                <span>Read Official Source / Preprint</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedArticle.sourceUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied' : 'Share'}</span>
                </button>

                {selectedArticle.modelIdLink && onSelectModel && (
                  <button
                    onClick={() => {
                      onSelectModel(selectedArticle.modelIdLink!);
                      setSelectedArticle(null);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition cursor-pointer shadow-lg"
                  >
                    Select Model for Chat
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
