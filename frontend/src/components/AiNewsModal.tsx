import React, { useState, useEffect } from 'react';
import {
  X,
  Newspaper,
  ExternalLink,
  Calendar,
  CheckCircle2,
  ArrowRight,
  RotateCw,
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
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

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

  if (!isOpen) return null;

  const categories = ['ALL', 'RELEASE', 'REASONING', 'OPEN SOURCE', 'BENCHMARK', 'RESEARCH'];

  const filtered = articles.filter((item) =>
    activeCategory === 'ALL' ? true : item.category === activeCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-5xl rounded-3xl border border-zinc-800 bg-[#09090c] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-zinc-800 bg-[#060608]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  AI Intelligence & Model Releases
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE RELEASES & PAPERS FEED</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Real-time releases, papers from Hugging Face Daily & AI research labs (Updated {lastRefreshed})
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
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 px-5 sm:px-7 py-3 border-b border-zinc-800/80 bg-[#07070a] overflow-x-auto">
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
              {cat}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-xs font-mono text-zinc-400">
              <RotateCw className="w-4 h-4 animate-spin text-white" />
              <span>Fetching live AI releases & research papers...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-600 transition flex flex-col justify-between cursor-pointer group shadow-sm"
                >
                  <div className="space-y-3">
                    {/* Company & Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-white text-black text-xs font-extrabold flex items-center justify-center">
                          {article.companyBadge}
                        </span>
                        <span className="text-xs font-semibold text-zinc-300 truncate max-w-[120px]">
                          {article.company}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {article.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-white group-hover:text-zinc-100 leading-snug line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 mt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-300 group-hover:text-white font-sans font-medium">
                      <span>Read Report</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3 border-t border-zinc-800 bg-[#060608] flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>XENO LIVE INTELLIGENCE FEED • Real-Time Research & Release Feeds</span>
          <span>Updated Live</span>
        </div>

      </div>

      {/* ARTICLE FULL REPORT MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg select-text">
          <div className="relative w-full max-w-3xl rounded-3xl border border-zinc-700 bg-[#0c0c10] shadow-2xl overflow-hidden flex flex-col max-h-[88dvh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#08080a]">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-white text-black font-extrabold text-sm flex items-center justify-center">
                  {selectedArticle.companyBadge}
                </span>
                <div>
                  <div className="text-xs font-semibold text-white">{selectedArticle.company}</div>
                  <div className="text-[10px] font-mono text-zinc-400">{selectedArticle.date} • {selectedArticle.category}</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Article Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {selectedArticle.title}
              </h2>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                {selectedArticle.summary}
              </div>

              {/* Benchmark Highlights */}
              {selectedArticle.benchmarkHighlights && selectedArticle.benchmarkHighlights.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Verified Benchmark Results
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

              {/* Capabilities List */}
              {selectedArticle.capabilities && selectedArticle.capabilities.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Key Capabilities & Features
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedArticle.capabilities.map((cap, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white flex-shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Breakdown */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-800">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Technical Architecture
                </h4>
                <div className="text-xs sm:text-sm text-zinc-300 whitespace-pre-line leading-relaxed font-sans">
                  {selectedArticle.fullContent}
                </div>
              </div>

            </div>

            {/* Actions Footer */}
            <div className="px-6 py-3.5 border-t border-zinc-800 bg-[#08080a] flex items-center justify-between">
              <a
                href={selectedArticle.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
              >
                <span>Read Official Announcement</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {selectedArticle.modelIdLink && onSelectModel && (
                <button
                  onClick={() => {
                    onSelectModel(selectedArticle.modelIdLink!);
                    setSelectedArticle(null);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition cursor-pointer"
                >
                  Load This Model
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
