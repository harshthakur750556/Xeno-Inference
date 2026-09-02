import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  BarChart3,
  ExternalLink,
  Search,
  DollarSign,
  RotateCw,
  Zap,
  Clock,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import { fetchLiveArenaLeaderboard } from '../services/liveData';
import type { LiveLeaderboardModel } from '../services/liveData';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel?: (modelId: string) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  onSelectModel,
}) => {
  const [sourceTab, setSourceTab] = useState<'aa' | 'arena' | 'all'>('aa');
  const [selectedCreator, setSelectedCreator] = useState<string>('ALL');
  const [licenseFilter, setLicenseFilter] = useState<'all' | 'open' | 'proprietary'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<
    'intelligenceIndex' | 'codingScore' | 'mathScore' | 'arenaElo' | 'tokensPerSec' | 'ttftMs' | 'pricePerMillionIn'
  >('intelligenceIndex');
  const [models, setModels] = useState<LiveLeaderboardModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLiveArenaLeaderboard();
      setModels(data);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error loading live leaderboard:', err);
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

  // Unique creators for filter tabs
  const creators = ['ALL', 'Anthropic', 'OpenAI', 'DeepSeek', 'Google', 'Meta', 'Alibaba'];

  const filtered = models
    .filter((m) => {
      // Source filter
      if (sourceTab === 'aa' && m.source === 'arena.ai') return false;
      if (sourceTab === 'arena' && m.source === 'artificialanalysis.com' && !m.arenaElo) return false;

      // Creator filter
      if (selectedCreator !== 'ALL') {
        const cLower = selectedCreator.toLowerCase();
        if (
          !m.creator.toLowerCase().includes(cLower) &&
          !m.name.toLowerCase().includes(cLower) &&
          !m.provider.toLowerCase().includes(cLower)
        ) {
          return false;
        }
      }

      // License filter
      if (licenseFilter === 'open' && m.license !== 'Open Weights') return false;
      if (licenseFilter === 'proprietary' && m.license !== 'Proprietary') return false;

      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(q) ||
        m.creator.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q) ||
        m.specialty.toLowerCase().includes(q);

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'ttftMs' || sortBy === 'pricePerMillionIn') {
        // Lower is better
        return a[sortBy] - b[sortBy];
      }
      return b[sortBy] - a[sortBy];
    });

  const maxValForCurrentSort = Math.max(
    1,
    ...filtered.map((m) => m[sortBy] || 0)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl select-none animate-fade-in">
      <div className="relative w-full max-w-6xl rounded-3xl border border-zinc-800 bg-[#070709] shadow-2xl overflow-hidden flex flex-col max-h-[94dvh]">
        
        {/* Header with Live Verified Badges */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-zinc-800 bg-[#050507]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center flex-shrink-0 shadow-lg shadow-white/5">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
                  AI Model Benchmarking & Intelligence Leaderboard
                </h2>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold">REAL-TIME ARENA.AI & ARTIFICIALANALYSIS.COM</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                Exact benchmark metrics extracted live from Artificial Analysis Intelligence Index & LMSYS Chatbot Arena (Synced {lastRefreshed})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer border border-transparent hover:border-zinc-700"
              title="Refresh live metrics"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-white' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer border border-transparent hover:border-zinc-700"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Source Selector Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-3 border-b border-zinc-800 bg-[#0a0a0d]">
          {/* Main Mode Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs font-medium">
            <button
              onClick={() => {
                setSourceTab('aa');
                setSortBy('intelligenceIndex');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                sourceTab === 'aa'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Artificial Analysis</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300">
                Live Index
              </span>
            </button>

            <button
              onClick={() => {
                setSourceTab('arena');
                setSortBy('arenaElo');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                sourceTab === 'arena'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>LMSYS Chatbot Arena</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300">
                Arena.ai Elo
              </span>
            </button>

            <button
              onClick={() => setSourceTab('all')}
              className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                sourceTab === 'all'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Unified Matrix</span>
            </button>
          </div>

          {/* Quick External Links */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
            <a
              href="https://artificialanalysis.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition"
            >
              <span>artificialanalysis.ai</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
            <span className="text-zinc-700">•</span>
            <a
              href="https://chat.lmsys.org/?leaderboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition"
            >
              <span>arena.ai</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>
        </div>

        {/* Filter Controls Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-3 border-b border-zinc-800/80 bg-[#08080a]">
          {/* Creator Filters */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {creators.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCreator(c)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition cursor-pointer flex-shrink-0 ${
                  selectedCreator === c
                    ? 'bg-zinc-800 text-white font-semibold border border-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search, License Filter & Sort Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 w-36 sm:w-48"
              />
            </div>

            <select
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 cursor-pointer"
            >
              <option value="all">All Licenses</option>
              <option value="open">Open Weights Only</option>
              <option value="proprietary">Proprietary Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-white font-medium focus:outline-none focus:border-zinc-600 cursor-pointer"
            >
              <option value="intelligenceIndex">Sort: AA Intelligence Index</option>
              <option value="codingScore">Sort: SWE-bench / LiveCode</option>
              <option value="mathScore">Sort: AIME 2024 Math</option>
              <option value="arenaElo">Sort: Arena.ai Elo</option>
              <option value="tokensPerSec">Sort: Speed (tok/s)</option>
              <option value="ttftMs">Sort: Lowest Latency (TTFT)</option>
              <option value="pricePerMillionIn">Sort: Lowest Price / 1M</option>
            </select>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Top 5 Visual Distribution Comparison Bar Chart */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-zinc-300 font-semibold">
                <BarChart3 className="w-4 h-4 text-white" />
                <span>TOP 5 BENCHMARK COMPARISON</span>
                <span className="text-[10px] text-zinc-500 font-normal">
                  ({sortBy === 'intelligenceIndex' ? 'Artificial Analysis Intelligence Index' : sortBy.toUpperCase()})
                </span>
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                {filtered.length} Models Verified
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {filtered.slice(0, 5).map((model, idx) => {
                const val = model[sortBy] || 0;
                const percent = Math.max(12, Math.min(100, (val / maxValForCurrentSort) * 100));

                const medalColor =
                  idx === 0
                    ? 'text-amber-400 bg-amber-950/40 border-amber-500/40'
                    : idx === 1
                    ? 'text-zinc-300 bg-zinc-800/60 border-zinc-600/40'
                    : idx === 2
                    ? 'text-amber-700 bg-amber-950/20 border-amber-800/30'
                    : 'text-zinc-500 bg-black border-zinc-800';

                return (
                  <div key={model.slug} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-5 h-5 rounded-full border text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${medalColor}`}>
                          {idx + 1}
                        </span>
                        <span className="text-zinc-100 font-semibold truncate max-w-[280px]">
                          {model.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                          ({model.creator})
                        </span>
                      </div>
                      <span className="text-white font-bold ml-2">
                        {sortBy === 'pricePerMillionIn'
                          ? `$${val}/1M`
                          : sortBy === 'ttftMs'
                          ? `${val}ms`
                          : sortBy === 'tokensPerSec'
                          ? `${val} tok/s`
                          : sortBy === 'arenaElo'
                          ? `${val} ELO`
                          : `${val} pts`}
                      </span>
                    </div>

                    <div className="h-2.5 w-full bg-black rounded-full overflow-hidden border border-zinc-800/80">
                      <div
                        className="h-full bg-gradient-to-r from-zinc-400 via-zinc-200 to-white transition-all duration-700 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Models Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((model, idx) => (
              <div
                key={model.slug}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition space-y-3.5 group relative shadow-sm"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-white text-black text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white group-hover:text-zinc-100 truncate">
                        {model.name}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-400 mt-1">
                      <span className="font-semibold text-zinc-300">{model.creator}</span>
                      <span>•</span>
                      <span className={model.license === 'Open Weights' ? 'text-emerald-400 font-medium' : 'text-zinc-400'}>
                        {model.license}
                      </span>
                      <span>•</span>
                      <span>Context: {model.contextWindow}</span>
                    </div>
                  </div>

                  {/* Primary Score Pill */}
                  <div className="text-right flex-shrink-0 bg-black/60 px-3 py-1.5 rounded-xl border border-zinc-800">
                    <div className="text-sm sm:text-base font-extrabold text-white font-mono leading-none">
                      {sourceTab === 'arena' ? `${model.arenaElo} ELO` : `${model.intelligenceIndex} pts`}
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
                      {sourceTab === 'arena' ? 'Arena.ai Elo' : 'AA Intelligence'}
                    </div>
                  </div>
                </div>

                {/* Real Benchmark Statistics Strip */}
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-2 rounded-xl bg-black/60 border border-zinc-800/80">
                    <div className="text-[9px] text-zinc-500 uppercase truncate">AA Index</div>
                    <div className="text-xs font-bold text-white mt-0.5">{model.intelligenceIndex}</div>
                  </div>

                  <div className="p-2 rounded-xl bg-black/60 border border-zinc-800/80">
                    <div className="text-[9px] text-zinc-500 uppercase truncate">SWE Coding</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">{model.codingScore}%</div>
                  </div>

                  <div className="p-2 rounded-xl bg-black/60 border border-zinc-800/80">
                    <div className="text-[9px] text-zinc-500 uppercase truncate">AIME Math</div>
                    <div className="text-xs font-bold text-indigo-300 mt-0.5">{model.mathScore}%</div>
                  </div>

                  <div className="p-2 rounded-xl bg-black/60 border border-zinc-800/80">
                    <div className="text-[9px] text-zinc-500 uppercase truncate">Arena Elo</div>
                    <div className="text-xs font-bold text-white mt-0.5">{model.arenaElo || 'N/A'}</div>
                  </div>
                </div>

                {/* Latency, Throughput & Economics Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 text-xs font-mono">
                  <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-zinc-300" />
                      <span>{model.tokensPerSec} tok/s</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-300" />
                      <span>{model.ttftMs}ms TTFT</span>
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <DollarSign className="w-3 h-3 text-emerald-400" />
                      <span>${model.pricePerMillionIn} / ${model.pricePerMillionOut}</span>
                    </span>
                  </div>

                  {onSelectModel && (
                    <button
                      onClick={() => {
                        onSelectModel(model.slug);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition cursor-pointer shadow-sm"
                    >
                      Select for Chat
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-8 py-3.5 border-t border-zinc-800 bg-[#050507] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-500">
          <span>Sources: Artificial Analysis Intelligence Index & LMSYS Chatbot Arena Daily Registry</span>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Public Benchmark API</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
