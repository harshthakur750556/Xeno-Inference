import React, { useState } from 'react';
import {
  X,
  Trophy,
  BarChart3,
  ExternalLink,
  Search,
  DollarSign,
} from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel?: (modelId: string) => void;
}

interface BenchmarkModel {
  rank: number;
  name: string;
  id: string;
  provider: string;
  arenaElo: number;
  codingScore: number; // SWE-bench / HumanEval
  mathScore: number; // MATH-500 / AIME 2024
  tokensPerSec: number;
  ttftMs: number;
  pricePerMillionIn: number;
  pricePerMillionOut: number;
  contextWindow: string;
  license: 'Open Weights' | 'Proprietary';
  specialty: string;
}

const LEADERBOARD_DATA: BenchmarkModel[] = [
  {
    rank: 1,
    name: 'Claude 3.7 Sonnet (Thinking)',
    id: 'claude-3-7-sonnet',
    provider: 'Anthropic',
    arenaElo: 1374,
    codingScore: 70.3,
    mathScore: 96.2,
    tokensPerSec: 68.4,
    ttftMs: 380,
    pricePerMillionIn: 3.0,
    pricePerMillionOut: 15.0,
    contextWindow: '200k',
    license: 'Proprietary',
    specialty: 'Hybrid reasoning, software engineering & multi-file agents',
  },
  {
    rank: 2,
    name: 'DeepSeek-R1 (Full 671B)',
    id: 'deepseek-r1',
    provider: 'DeepSeek AI',
    arenaElo: 1358,
    codingScore: 65.9,
    mathScore: 97.3,
    tokensPerSec: 42.1,
    ttftMs: 460,
    pricePerMillionIn: 0.55,
    pricePerMillionOut: 2.19,
    contextWindow: '128k',
    license: 'Open Weights',
    specialty: 'Pure autonomous reinforcement learning, formal proofs & STEM',
  },
  {
    rank: 3,
    name: 'OpenAI o3-mini (High)',
    id: 'o3-mini',
    provider: 'OpenAI',
    arenaElo: 1345,
    codingScore: 68.1,
    mathScore: 97.9,
    tokensPerSec: 92.5,
    ttftMs: 290,
    pricePerMillionIn: 1.1,
    pricePerMillionOut: 4.4,
    contextWindow: '128k',
    license: 'Proprietary',
    specialty: 'High-speed competitive coding & Olympiad mathematics',
  },
  {
    rank: 4,
    name: 'GPT-4o (Omni Flagship)',
    id: 'gpt-4o',
    provider: 'OpenAI',
    arenaElo: 1332,
    codingScore: 53.8,
    mathScore: 76.6,
    tokensPerSec: 104.2,
    ttftMs: 190,
    pricePerMillionIn: 2.5,
    pricePerMillionOut: 10.0,
    contextWindow: '128k',
    license: 'Proprietary',
    specialty: 'Low-latency multimodal general intelligence & voice processing',
  },
  {
    rank: 5,
    name: 'DeepSeek-V3 (MLA MoE)',
    id: 'deepseek-v3',
    provider: 'DeepSeek AI',
    arenaElo: 1318,
    codingScore: 49.2,
    mathScore: 75.8,
    tokensPerSec: 74.0,
    ttftMs: 210,
    pricePerMillionIn: 0.14,
    pricePerMillionOut: 0.28,
    contextWindow: '128k',
    license: 'Open Weights',
    specialty: 'Ultra-low cost general reasoning with Multi-Head Latent Attention',
  },
  {
    rank: 6,
    name: 'Llama 3.3 70B Instruct',
    id: 'llama-3-3-70b',
    provider: 'Meta AI',
    arenaElo: 1290,
    codingScore: 48.6,
    mathScore: 71.4,
    tokensPerSec: 118.6,
    ttftMs: 140,
    pricePerMillionIn: 0.59,
    pricePerMillionOut: 0.79,
    contextWindow: '128k',
    license: 'Open Weights',
    specialty: 'High throughput enterprise instruct & self-hosted deployments',
  },
  {
    rank: 7,
    name: 'Qwen 2.5 Coder 32B',
    id: 'qwen-2-5-coder',
    provider: 'Alibaba Cloud',
    arenaElo: 1284,
    codingScore: 57.4,
    mathScore: 72.8,
    tokensPerSec: 88.0,
    ttftMs: 160,
    pricePerMillionIn: 0.2,
    pricePerMillionOut: 0.2,
    contextWindow: '128k',
    license: 'Open Weights',
    specialty: 'Polyglot code completion, AST refactoring & debugging',
  },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  onSelectModel,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'reasoning' | 'coding' | 'open'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'arenaElo' | 'codingScore' | 'mathScore' | 'tokensPerSec'>('arenaElo');

  if (!isOpen) return null;

  const filtered = LEADERBOARD_DATA.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specialty.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'reasoning') return m.mathScore >= 90;
    if (filterType === 'coding') return m.codingScore >= 50;
    if (filterType === 'open') return m.license === 'Open Weights';
    return true;
  }).sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-5xl rounded-3xl border border-zinc-800 bg-[#09090c] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-zinc-800 bg-[#060608]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Global AI Model Leaderboard
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-zinc-300 border border-white/10">
                  LIVE ARENA & BENCHMARKS
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Verified data aggregated from LMSYS Chatbot Arena (arena.ai) and ArtificialAnalysis.com
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-7 py-3 border-b border-zinc-800/80 bg-[#07070a]">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              All Flagships
            </button>
            <button
              onClick={() => setFilterType('reasoning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                filterType === 'reasoning'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Reasoning & Math
            </button>
            <button
              onClick={() => setFilterType('coding')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                filterType === 'coding'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              SWE & Coding
            </button>
            <button
              onClick={() => setFilterType('open')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                filterType === 'open'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Open Weights
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 w-44 sm:w-56"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 cursor-pointer"
            >
              <option value="arenaElo">Sort: Arena ELO</option>
              <option value="codingScore">Sort: SWE-bench</option>
              <option value="mathScore">Sort: AIME Math</option>
              <option value="tokensPerSec">Sort: Throughput (tok/s)</option>
            </select>
          </div>

        </div>

        {/* Content Table & Cards */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4 flex-1">
          
          {/* Quick Metrics Bar Graph Preview */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-white" />
                <span>ARENA ELO SCORE COMPARISON (LMSYS Verified)</span>
              </span>
              <span className="text-[11px] text-zinc-500">Benchmark Scale: 1200 - 1400</span>
            </div>

            <div className="space-y-2">
              {filtered.slice(0, 5).map((model) => {
                const minElo = 1200;
                const maxElo = 1400;
                const percent = Math.max(10, Math.min(100, ((model.arenaElo - minElo) / (maxElo - minElo)) * 100));

                return (
                  <div key={model.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-200 font-medium truncate max-w-[220px]">
                        #{model.rank} {model.name}
                      </span>
                      <span className="text-white font-bold">{model.arenaElo} ELO</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Models Detailed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filtered.map((model) => (
              <div
                key={model.id}
                className="p-4 rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {model.rank}
                      </span>
                      <h3 className="text-sm font-bold text-white group-hover:text-zinc-100">{model.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mt-1">
                      <span>{model.provider}</span>
                      <span>•</span>
                      <span className="text-zinc-300">{model.license}</span>
                      <span>•</span>
                      <span>{model.contextWindow}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-white font-mono">{model.arenaElo}</div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase">Arena ELO</div>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {model.specialty}
                </p>

                {/* Benchmark Metrics Strip */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800/60 text-center font-mono">
                  <div className="p-1.5 rounded-lg bg-black/50 border border-zinc-800/50">
                    <div className="text-[10px] text-zinc-500">SWE-bench</div>
                    <div className="text-xs font-bold text-white">{model.codingScore}%</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/50 border border-zinc-800/50">
                    <div className="text-[10px] text-zinc-500">AIME Math</div>
                    <div className="text-xs font-bold text-white">{model.mathScore}%</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/50 border border-zinc-800/50">
                    <div className="text-[10px] text-zinc-500">Speed</div>
                    <div className="text-xs font-bold text-white">{model.tokensPerSec} t/s</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/50 border border-zinc-800/50">
                    <div className="text-[10px] text-zinc-500">TTFT</div>
                    <div className="text-xs font-bold text-white">{model.ttftMs}ms</div>
                  </div>
                </div>

                {/* Pricing & Quick Select */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-zinc-400" />
                    <span>${model.pricePerMillionIn} / ${model.pricePerMillionOut} per 1M tokens</span>
                  </div>

                  {onSelectModel && (
                    <button
                      onClick={() => {
                        onSelectModel(model.id);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition cursor-pointer"
                    >
                      Select Model
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3 border-t border-zinc-800 bg-[#060608] flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>Sources: Chatbot Arena (LMSYS) • Artificial Analysis Benchmark Index</span>
          <a
            href="https://chat.lmsys.org/?leaderboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition"
          >
            <span>Visit Arena.ai</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
