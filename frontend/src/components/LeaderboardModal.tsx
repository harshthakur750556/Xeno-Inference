import React, { useState, useEffect, useMemo } from 'react';
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
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { fetchLiveArenaLeaderboard } from '../services/liveData';
import type { LiveLeaderboardModel } from '../services/liveData';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel?: (modelId: string) => void;
}

type ViewMode = 'graph' | 'matrix' | 'cards' | 'radar';

type SortMetric =
  | 'arenaElo'
  | 'arenaStyleControlledElo'
  | 'intelligenceIndex'
  | 'codingScore'
  | 'gpqaDiamond'
  | 'mathScore'
  | 'mmluPro'
  | 'tokensPerSec'
  | 'ttftMs'
  | 'pricePerMillionIn';

type CategoryFilter = 'all' | 'arena' | 'style' | 'coding' | 'hard';

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  onSelectModel,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [selectedCreator, setSelectedCreator] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [licenseFilter, setLicenseFilter] = useState<'all' | 'open' | 'proprietary'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortMetric>('arenaElo');
  const [models, setModels] = useState<LiveLeaderboardModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  // Nodal Graph axis states
  const [graphYAxis, setGraphYAxis] = useState<
    'arenaElo' | 'arenaStyleControlledElo' | 'intelligenceIndex' | 'codingScore' | 'gpqaDiamond'
  >('arenaElo');
  const [graphXAxis, setGraphXAxis] = useState<'tokensPerSec' | 'ttftMs' | 'pricePerMillionIn'>('tokensPerSec');
  const [hoveredModel, setHoveredModel] = useState<LiveLeaderboardModel | null>(null);

  // Radar Comparator selected models (up to 3)
  const [radarSelectedSlugs, setRadarSelectedSlugs] = useState<string[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLiveArenaLeaderboard();
      if (Array.isArray(data) && data.length > 0) {
        setModels(data);
        if (radarSelectedSlugs.length === 0) {
          setRadarSelectedSlugs(data.slice(0, 3).map((m) => m.slug || ''));
        }
      }
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error loading live Arena leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const creators = [
    'ALL',
    'Anthropic',
    'Google',
    'OpenAI',
    'DeepSeek',
    'Meta',
    'Alibaba',
    'xAI',
    'Mistral',
    'Moonshot',
    'Zhipu AI',
    'Xiaomi',
    'Baidu',
  ];

  const filtered = useMemo(() => {
    return (models || [])
      .filter((m) => {
        if (!m) return false;
        const creator = m.creator || '';
        const name = m.name || '';
        const slug = m.slug || '';
        const provider = m.provider || '';

        // Creator filter
        if (selectedCreator !== 'ALL') {
          const cLower = selectedCreator.toLowerCase().replace(/[\s-_]/g, '');
          const mCreator = creator.toLowerCase().replace(/[\s-_]/g, '');
          const mName = name.toLowerCase().replace(/[\s-_]/g, '');
          const mSlug = slug.toLowerCase().replace(/[\s-_]/g, '');
          const mProv = provider.toLowerCase().replace(/[\s-_]/g, '');
          if (
            !mCreator.includes(cLower) &&
            !mName.includes(cLower) &&
            !mSlug.includes(cLower) &&
            !mProv.includes(cLower)
          ) {
            return false;
          }
        }

        // Category filter
        if (categoryFilter === 'style' && !m.arenaStyleControlledElo) return false;
        if (categoryFilter === 'coding' && (m.codingScore || 0) < 50) return false;
        if (categoryFilter === 'hard' && (m.mathScore || 0) < 65 && (m.gpqaDiamond || 0) < 60) return false;

        // License filter
        if (licenseFilter === 'open' && m.license !== 'Open Weights') return false;
        if (licenseFilter === 'proprietary' && m.license !== 'Proprietary') return false;

        // Search
        const q = (searchQuery || '').toLowerCase();
        if (!q) return true;
        return (
          name.toLowerCase().includes(q) ||
          creator.toLowerCase().includes(q) ||
          slug.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (!a || !b) return 0;
        if (sortBy === 'ttftMs' || sortBy === 'pricePerMillionIn') {
          return (Number(a[sortBy]) || 0) - (Number(b[sortBy]) || 0);
        }
        return (Number(b[sortBy]) || 0) - (Number(a[sortBy]) || 0);
      });
  }, [models, selectedCreator, categoryFilter, licenseFilter, searchQuery, sortBy]);

  // Responsive Auto-Adjustable Animated Pareto Frontier Calculation
  const graphData = useMemo(() => {
    if (!filtered || filtered.length === 0) {
      return {
        nodes: [],
        paretoPath: '',
        xTicks: [],
        yTicks: [],
        minX: 0,
        maxX: 100,
        minY: 0,
        maxY: 100,
        width: 860,
        height: 440,
        paddingLeft: 70,
        paddingBottom: 50,
      };
    }

    const width = 860;
    const height = 440;
    const paddingLeft = 70;
    const paddingBottom = 50;
    const paddingTop = 30;
    const paddingRight = 45;

    const xVals = filtered.map((m) => Number(m?.[graphXAxis]) || 0);
    const yVals = filtered.map((m) => Number(m?.[graphYAxis]) || 0);

    const rawMinX = Math.min(...xVals);
    const rawMaxX = Math.max(...xVals);
    const rawMinY = Math.min(...yVals);
    const rawMaxY = Math.max(...yVals);

    // Add breathing room
    const xMargin = Math.max(1, (rawMaxX - rawMinX) * 0.08);
    const yMargin = Math.max(2, (rawMaxY - rawMinY) * 0.08);

    const minX = Math.max(0, rawMinX - xMargin);
    const maxX = rawMaxX + xMargin;
    const minY = Math.max(0, rawMinY - yMargin);
    const maxY = rawMaxY + yMargin;

    const scaleX = (val: number) => {
      if (maxX <= minX) return paddingLeft + (width - paddingLeft - paddingRight) / 2;
      return paddingLeft + ((val - minX) / (maxX - minX)) * (width - paddingLeft - paddingRight);
    };

    const scaleY = (val: number) => {
      if (maxY <= minY) return paddingTop + (height - paddingTop - paddingBottom) / 2;
      return height - paddingBottom - ((val - minY) / (maxY - minY)) * (height - paddingTop - paddingBottom);
    };

    // 5 Nice Ticks
    const xTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const val = minX + ratio * (maxX - minX);
      const px = scaleX(val);
      let label = `${Math.round(val)}`;
      if (graphXAxis === 'pricePerMillionIn') {
        label = `$${val.toFixed(2)}`;
      } else if (graphXAxis === 'tokensPerSec') {
        label = `${Math.round(val)} tok/s`;
      } else if (graphXAxis === 'ttftMs') {
        label = `${Math.round(val)}ms`;
      }
      return { val, px, label };
    });

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const val = minY + ratio * (maxY - minY);
      const py = scaleY(val);
      let label = `${Math.round(val)}`;
      if (graphYAxis === 'arenaElo' || graphYAxis === 'arenaStyleControlledElo') {
        label = `${Math.round(val)} Elo`;
      } else if (graphYAxis === 'intelligenceIndex') {
        label = `${val.toFixed(1)} pts`;
      } else {
        label = `${Math.round(val)}%`;
      }
      return { val, py, label };
    });

    // Map each model to node
    const nodes = filtered.map((m) => {
      const xVal = Number(m?.[graphXAxis]) || 0;
      const yVal = Number(m?.[graphYAxis]) || 0;
      const cx = scaleX(xVal);
      const cy = scaleY(yVal);
      return {
        model: m,
        xVal,
        yVal,
        cx: isNaN(cx) ? width / 2 : cx,
        cy: isNaN(cy) ? height / 2 : cy,
        isPareto: false,
      };
    });

    // Compute True Pareto Optimal Frontier
    const isXHigherBetter = graphXAxis === 'tokensPerSec';

    const paretoNodes = nodes.filter((candidate) => {
      const isDominated = nodes.some((other) => {
        if (other.model.slug === candidate.model.slug) return false;
        const otherYBetterOrEqual = other.yVal >= candidate.yVal;
        const otherXBetterOrEqual = isXHigherBetter
          ? other.xVal >= candidate.xVal
          : other.xVal <= candidate.xVal;
        const strictlyBetterInAtLeastOne =
          other.yVal > candidate.yVal ||
          (isXHigherBetter ? other.xVal > candidate.xVal : other.xVal < candidate.xVal);
        return otherYBetterOrEqual && otherXBetterOrEqual && strictlyBetterInAtLeastOne;
      });
      return !isDominated;
    });

    const paretoSlugs = new Set(paretoNodes.map((p) => p.model.slug));
    nodes.forEach((n) => {
      n.isPareto = paretoSlugs.has(n.model.slug);
    });

    const sortedPareto = [...paretoNodes].sort((a, b) => a.cx - b.cx);

    const paretoPath = sortedPareto.reduce((acc, n, idx) => {
      if (isNaN(n.cx) || isNaN(n.cy)) return acc;
      return idx === 0 ? `M ${n.cx.toFixed(1)} ${n.cy.toFixed(1)}` : `${acc} L ${n.cx.toFixed(1)} ${n.cy.toFixed(1)}`;
    }, '');

    return {
      nodes,
      paretoPath,
      xTicks,
      yTicks,
      minX,
      maxX,
      minY,
      maxY,
      width,
      height,
      paddingLeft,
      paddingBottom,
    };
  }, [filtered, graphXAxis, graphYAxis]);

  const getCreatorColor = (creator?: string) => {
    if (!creator) return '#e4e4e7';
    const c = creator.toLowerCase();
    if (c.includes('google')) return '#3b82f6';
    if (c.includes('anthropic')) return '#f59e0b';
    if (c.includes('openai')) return '#10b981';
    if (c.includes('deepseek')) return '#06b6d4';
    if (c.includes('meta')) return '#8b5cf6';
    if (c.includes('alibaba') || c.includes('qwen')) return '#ec4899';
    if (c.includes('xai') || c.includes('x-ai')) return '#ffffff';
    if (c.includes('mistral')) return '#f97316';
    if (c.includes('moonshot')) return '#a855f7';
    if (c.includes('zhipu')) return '#14b8a6';
    if (c.includes('xiaomi')) return '#ff6900';
    if (c.includes('baidu')) return '#2563eb';
    return '#a1a1aa';
  };

  if (!isOpen) return null;

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
                  Arena.ai & Artificial Analysis Intelligence Leaderboard
                </h2>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold">AUTHENTIC ARENA STATS • CI 95%</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                Modern Arena.ai human preference ratings & Artificial Analysis Quality Index (Live Synced {lastRefreshed})
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

        {/* Category & Arena Focus Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 sm:px-8 py-2 border-b border-zinc-850 bg-[#060608] text-xs font-mono">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            <button
              onClick={() => {
                setCategoryFilter('all');
                setSortBy('arenaElo');
              }}
              className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Frontier Models
            </button>
            <button
              onClick={() => {
                setCategoryFilter('arena');
                setSortBy('arenaElo');
                setGraphYAxis('arenaElo');
              }}
              className={`px-3 py-1 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === 'arena'
                  ? 'bg-amber-950/50 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Overall Arena.ai Elo</span>
            </button>
            <button
              onClick={() => {
                setCategoryFilter('style');
                setSortBy('arenaStyleControlledElo');
                setGraphYAxis('arenaStyleControlledElo');
              }}
              className={`px-3 py-1 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === 'style'
                  ? 'bg-purple-950/50 text-purple-300 font-bold border border-purple-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3 text-purple-400" />
              <span>Style-Controlled Elo</span>
            </button>
            <button
              onClick={() => {
                setCategoryFilter('coding');
                setSortBy('codingScore');
                setGraphYAxis('codingScore');
              }}
              className={`px-3 py-1 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === 'coding'
                  ? 'bg-emerald-950/50 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>SWE-bench Verified</span>
            </button>
            <button
              onClick={() => {
                setCategoryFilter('hard');
                setSortBy('gpqaDiamond');
                setGraphYAxis('gpqaDiamond');
              }}
              className={`px-3 py-1 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === 'hard'
                  ? 'bg-sky-950/50 text-sky-300 font-bold border border-sky-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3 text-sky-400" />
              <span>Hard Science & Math</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
            <a
              href="https://arena.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-zinc-300 hover:text-white transition"
            >
              <span>arena.ai</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
            <span className="text-zinc-700">•</span>
            <a
              href="https://artificialanalysis.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-zinc-300 hover:text-white transition"
            >
              <span>artificialanalysis.ai</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>
        </div>

        {/* View Mode Switcher Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-2.5 border-b border-zinc-800 bg-[#09090c]">
          <div className="flex items-center p-1 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs font-medium">
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                viewMode === 'graph' ? 'bg-white text-black font-bold shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Pareto Frontier Graph</span>
            </button>

            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                viewMode === 'matrix' ? 'bg-white text-black font-bold shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Full Evaluations Matrix</span>
            </button>

            <button
              onClick={() => setViewMode('radar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                viewMode === 'radar' ? 'bg-white text-black font-bold shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Model Comparator</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-black font-bold shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Detailed Cards</span>
            </button>
          </div>

          <div className="text-xs font-mono text-zinc-400">
            Showing <span className="text-white font-bold">{filtered.length}</span> deduplicated foundation models
          </div>
        </div>

        {/* Filters Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-5 sm:px-8 py-2.5 border-b border-zinc-800/80 bg-[#070709]">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full">
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
              className="px-2.5 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 cursor-pointer font-mono"
            >
              <option value="all">All Licenses</option>
              <option value="open">Open Weights Only</option>
              <option value="proprietary">Proprietary Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortMetric)}
              className="px-2.5 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-white font-medium focus:outline-none focus:border-zinc-600 cursor-pointer font-mono"
            >
              <option value="arenaElo">Rank: Arena.ai Overall Elo</option>
              <option value="arenaStyleControlledElo">Rank: Arena Style-Controlled Elo</option>
              <option value="intelligenceIndex">Rank: AA Quality Index</option>
              <option value="codingScore">Rank: SWE-bench Verified (%)</option>
              <option value="gpqaDiamond">Rank: GPQA Diamond PhD (%)</option>
              <option value="mathScore">Rank: MATH 500 / AIME (%)</option>
              <option value="tokensPerSec">Rank: Output Speed (tok/s)</option>
              <option value="ttftMs">Rank: Lowest TTFT Latency (ms)</option>
              <option value="pricePerMillionIn">Rank: Lowest Price / 1M</option>
            </select>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* ================= VIEW 1: RESPONSIVE ANIMATED PARETO FRONTIER NODAL GRAPH ================= */}
          {viewMode === 'graph' && (
            <div className="space-y-4">
              {/* Graph Axis Selectors */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Y-AXIS (QUALITY METRIC):</span>
                  <select
                    value={graphYAxis}
                    onChange={(e) => setGraphYAxis(e.target.value as any)}
                    className="px-2 py-1 rounded-lg bg-black border border-zinc-700 text-white font-semibold cursor-pointer"
                  >
                    <option value="arenaElo">Arena.ai Human Battles Elo (Official)</option>
                    <option value="arenaStyleControlledElo">Arena.ai Style-Controlled Elo</option>
                    <option value="intelligenceIndex">AA Intelligence Index (Quality Score)</option>
                    <option value="codingScore">SWE-bench Verified Coding (%)</option>
                    <option value="gpqaDiamond">GPQA Diamond PhD Science (%)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">X-AXIS (ENGINEERING TRADE-OFF):</span>
                  <select
                    value={graphXAxis}
                    onChange={(e) => setGraphXAxis(e.target.value as any)}
                    className="px-2 py-1 rounded-lg bg-black border border-zinc-700 text-white font-semibold cursor-pointer"
                  >
                    <option value="tokensPerSec">Throughput Speed (Tokens / sec)</option>
                    <option value="ttftMs">Time-to-First-Token Latency (ms)</option>
                    <option value="pricePerMillionIn">Prompt Price ($ / 1M tokens)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-emerald-400 inline-block shadow-[0_0_8px_#10b981]" />
                    <span className="text-emerald-400 font-semibold">Pareto Optimal Frontier</span>
                  </div>
                  <span className="text-zinc-600">|</span>
                  <span>Hover node for 95% CI & battle votes</span>
                </div>
              </div>

              {/* Interactive SVG Nodal Graph */}
              <div className="relative p-4 sm:p-6 rounded-3xl bg-black border border-zinc-800 shadow-2xl overflow-hidden min-h-[380px]">
                <svg
                  viewBox="0 0 860 440"
                  className="w-full h-auto min-h-[340px] max-h-[500px] overflow-visible select-none"
                >
                  <defs>
                    <linearGradient id="paretoGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Lines and Y-Axis Ticks */}
                  {graphData.yTicks.map((tick, i) => (
                    <g key={'ytick-' + i}>
                      <line
                        x1={graphData.paddingLeft}
                        y1={tick.py}
                        x2={graphData.width - 45}
                        y2={tick.py}
                        stroke="#27272a"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                        className="opacity-70"
                      />
                      <text
                        x={graphData.paddingLeft - 10}
                        y={tick.py + 4}
                        fontSize="10"
                        fill="#71717a"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {tick.label}
                      </text>
                    </g>
                  ))}

                  {/* Vertical Grid Lines and X-Axis Ticks */}
                  {graphData.xTicks.map((tick, i) => (
                    <g key={'xtick-' + i}>
                      <line
                        x1={tick.px}
                        y1={30}
                        x2={tick.px}
                        y2={graphData.height - graphData.paddingBottom}
                        stroke="#27272a"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                        className="opacity-70"
                      />
                      <text
                        x={tick.px}
                        y={graphData.height - graphData.paddingBottom + 20}
                        fontSize="10"
                        fill="#71717a"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {tick.label}
                      </text>
                    </g>
                  ))}

                  {/* Pareto Frontier Smooth Animated Polyline */}
                  {graphData.paretoPath && (
                    <path
                      d={graphData.paretoPath}
                      fill="none"
                      stroke="url(#paretoGlow)"
                      strokeWidth="2.5"
                      strokeDasharray="6 3"
                      className="opacity-90"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))' }}
                    />
                  )}

                  {/* Crosshair Projection Lines when Hovered */}
                  {hoveredModel && (() => {
                    const hoveredNode = graphData.nodes.find((n) => n.model.slug === hoveredModel.slug);
                    if (!hoveredNode) return null;
                    return (
                      <g className="pointer-events-none">
                        <line
                          x1={graphData.paddingLeft}
                          y1={hoveredNode.cy}
                          x2={hoveredNode.cx}
                          y2={hoveredNode.cy}
                          stroke="#38bdf8"
                          strokeDasharray="3 3"
                          strokeWidth="1.5"
                          className="opacity-80"
                        />
                        <line
                          x1={hoveredNode.cx}
                          y1={hoveredNode.cy}
                          x2={hoveredNode.cx}
                          y2={graphData.height - graphData.paddingBottom}
                          stroke="#38bdf8"
                          strokeDasharray="3 3"
                          strokeWidth="1.5"
                          className="opacity-80"
                        />
                      </g>
                    );
                  })()}

                  {/* Nodes for each model with smooth CSS transitions */}
                  {graphData.nodes.map(({ model, cx, cy, isPareto }) => {
                    const isHovered = hoveredModel?.slug === model.slug;
                    const nodeColor = getCreatorColor(model.creator);
                    const shouldShowLabel = isPareto || model.rank <= 3 || isHovered;

                    return (
                      <g
                        key={model.slug}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredModel(model)}
                        onClick={() => {
                          if (onSelectModel) {
                            onSelectModel(model.slug);
                            onClose();
                          }
                        }}
                      >
                        {/* Outer Glow Halo for Pareto or Top Models */}
                        {isPareto && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isHovered ? 14 : 9}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="1.5"
                            className="opacity-60"
                            style={{
                              transition: 'cx 0.5s cubic-bezier(0.16, 1, 0.3, 1), cy 0.5s cubic-bezier(0.16, 1, 0.3, 1), r 0.2s ease',
                            }}
                          />
                        )}

                        {/* Core Circle */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHovered ? 9 : (isPareto ? 6.5 : 5)}
                          fill={nodeColor}
                          stroke="#ffffff"
                          strokeWidth={isHovered ? 2.5 : 1.2}
                          style={{
                            transition: 'cx 0.5s cubic-bezier(0.16, 1, 0.3, 1), cy 0.5s cubic-bezier(0.16, 1, 0.3, 1), r 0.2s ease',
                          }}
                        />

                        {/* Collision-Free Smart Labels */}
                        {shouldShowLabel && (
                          <g
                            style={{
                              transform: `translate(${cx + 10}px, ${cy - 8}px)`,
                              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                            className="pointer-events-none"
                          >
                            <rect
                              x={-2}
                              y={-3}
                              width={Math.min(120, model.name.length * 6.5 + 16)}
                              height={16}
                              rx={4}
                              fill="#09090b"
                              fillOpacity="0.85"
                              stroke={isHovered ? '#38bdf8' : (isPareto ? '#10b981' : '#3f3f46')}
                              strokeWidth={0.8}
                            />
                            <text
                              x={4}
                              y={9}
                              fontSize="8.5"
                              fill={isHovered ? '#ffffff' : (isPareto ? '#34d399' : '#d4d4d8')}
                              fontFamily="monospace"
                              fontWeight={isHovered || isPareto ? 'bold' : 'normal'}
                            >
                              {model.name.length > 16 ? model.name.slice(0, 15) + '…' : model.name}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Floating HUD Tooltip on Hover */}
                {hoveredModel && (
                  <div className="absolute top-4 right-4 p-4 rounded-2xl bg-zinc-950/95 backdrop-blur-md border border-zinc-700 shadow-2xl text-xs space-y-2.5 max-w-sm animate-fade-in font-mono z-10">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-white text-sm truncate">{hoveredModel.name}</div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <span>{hoveredModel.creator}</span>
                          <span>•</span>
                          <span className={hoveredModel.license === 'Open Weights' ? 'text-emerald-400' : 'text-zinc-400'}>
                            {hoveredModel.license}
                          </span>
                        </div>
                      </div>
                      {hoveredModel.variantBadge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-semibold flex-shrink-0">
                          {hoveredModel.variantBadge}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                        <span className="text-zinc-500 text-[10px] block">ARENA.AI ELO:</span>
                        <div className="font-extrabold text-amber-300 text-sm flex items-baseline gap-1">
                          <span>{hoveredModel.arenaElo}</span>
                          <span className="text-[10px] text-zinc-400 font-normal">
                            {hoveredModel.confidenceInterval || '±12'}
                          </span>
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">
                          {hoveredModel.voteCount ? `${hoveredModel.voteCount.toLocaleString()} votes` : 'crowdsourced'}
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                        <span className="text-zinc-500 text-[10px] block">STYLE CONTROLLED:</span>
                        <div className="font-bold text-purple-300 text-sm">
                          {hoveredModel.arenaStyleControlledElo || hoveredModel.arenaElo - 8} Elo
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">Length-debiased</div>
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                        <span className="text-zinc-500 text-[10px] block">SWE-BENCH CODING:</span>
                        <div className="font-bold text-emerald-400 text-sm">{hoveredModel.codingScore}%</div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">Verified SOTA</div>
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                        <span className="text-zinc-500 text-[10px] block">AA QUALITY INDEX:</span>
                        <div className="font-bold text-white text-sm">{hoveredModel.intelligenceIndex} pts</div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">Artificial Analysis</div>
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                        <span className="text-zinc-500 text-[10px] block">OUTPUT SPEED:</span>
                        <div className="font-bold text-amber-300">{hoveredModel.tokensPerSec} tok/s</div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">{hoveredModel.ttftMs}ms TTFT</div>
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                        <span className="text-zinc-500 text-[10px] block">TOKEN PRICING:</span>
                        <div className="font-bold text-zinc-300">${hoveredModel.pricePerMillionIn} / ${hoveredModel.pricePerMillionOut}</div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">per 1M in / out</div>
                      </div>
                    </div>

                    {onSelectModel && (
                      <button
                        onClick={() => {
                          onSelectModel(hoveredModel.slug);
                          onClose();
                        }}
                        className="w-full mt-2 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-white/10"
                      >
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>Select Model for Chat</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= VIEW 2: COMPREHENSIVE FULL EVALUATIONS MATRIX ================= */}
          {viewMode === 'matrix' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                <span>ALL BENCHMARKS EVALUATIONS MATRIX ({filtered.length} Models Verified)</span>
                <span>Click column header to sort</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-black/60 shadow-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0b0b10] border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3"># Model</th>
                      <th className="p-3 text-center cursor-pointer hover:text-white" onClick={() => setSortBy('arenaElo')}>
                        Arena.ai Elo (CI 95%)
                      </th>
                      <th className="p-3 text-center cursor-pointer hover:text-white" onClick={() => setSortBy('arenaStyleControlledElo')}>
                        Style-Controlled
                      </th>
                      <th className="p-3 text-center cursor-pointer hover:text-white" onClick={() => setSortBy('intelligenceIndex')}>
                        AA Quality
                      </th>
                      <th className="p-3 text-center cursor-pointer hover:text-white" onClick={() => setSortBy('codingScore')}>
                        SWE-bench
                      </th>
                      <th className="p-3 text-center cursor-pointer hover:text-white" onClick={() => setSortBy('gpqaDiamond')}>
                        GPQA Diamond
                      </th>
                      <th className="p-3 text-center cursor-pointer hover:text-white" onClick={() => setSortBy('mathScore')}>
                        MATH 500
                      </th>
                      <th className="p-3 text-center cursor-pointer hover:text-white" onClick={() => setSortBy('tokensPerSec')}>
                        Speed (tok/s)
                      </th>
                      <th className="p-3 text-center cursor-pointer hover:text-white" onClick={() => setSortBy('pricePerMillionIn')}>
                        Price / 1M
                      </th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {filtered.map((model, idx) => (
                      <tr key={model.slug} className="hover:bg-zinc-900/60 transition group">
                        <td className="p-3 font-semibold text-white flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 w-5">{idx + 1}</span>
                          <div className="min-w-0">
                            <div className="truncate max-w-[200px] text-xs font-bold text-white group-hover:text-sky-300">
                              {model.name}
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              {model.creator} • {model.license} {model.variantBadge ? `• ${model.variantBadge}` : ''}
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="font-extrabold text-amber-300">{model.arenaElo}</div>
                          <div className="text-[10px] text-zinc-500">
                            {model.confidenceInterval || '±12'} • {model.voteCount ? `${(model.voteCount / 1000).toFixed(1)}k` : 'votes'}
                          </div>
                        </td>

                        <td className="p-3 text-center font-bold text-purple-300">
                          {model.arenaStyleControlledElo || model.arenaElo - 8}
                        </td>

                        <td className="p-3 text-center font-bold text-white">
                          {model.intelligenceIndex}
                        </td>

                        <td className="p-3 text-center font-bold text-emerald-400">
                          {model.codingScore}%
                        </td>

                        <td className="p-3 text-center font-bold text-sky-400">
                          {model.gpqaDiamond || 'N/A'}%
                        </td>

                        <td className="p-3 text-center font-bold text-indigo-300">
                          {model.mathScore}%
                        </td>

                        <td className="p-3 text-center text-zinc-300">
                          {model.tokensPerSec}
                        </td>

                        <td className="p-3 text-center text-zinc-400 text-[11px]">
                          ${model.pricePerMillionIn} / ${model.pricePerMillionOut}
                        </td>

                        <td className="p-3 text-right">
                          {onSelectModel && (
                            <button
                              onClick={() => {
                                onSelectModel(model.slug);
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-white hover:text-black text-white text-[11px] font-bold transition cursor-pointer"
                            >
                              Select
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= VIEW 3: MULTI-MODEL COMPARATOR ================= */}
          {viewMode === 'radar' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                <div className="text-xs font-mono text-zinc-400">
                  SELECT UP TO 3 MODELS TO COMPARE BENCHMARKS SIDE-BY-SIDE:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {filtered.slice(0, 15).map((m) => {
                    const isSelected = radarSelectedSlugs.includes(m.slug);
                    return (
                      <button
                        key={m.slug}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setRadarSelectedSlugs((prev) => prev.filter((s) => s !== m.slug));
                          } else if (radarSelectedSlugs.length < 3) {
                            setRadarSelectedSlugs((prev) => [...prev, m.slug]);
                          }
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-mono transition cursor-pointer ${
                          isSelected
                            ? 'bg-white text-black font-bold'
                            : 'bg-black border border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {m?.name ? (m.name.includes(':') ? m.name.split(':')[1].trim() : m.name.slice(0, 16)) : (m?.slug || 'Model')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comparative Multi-Metric Bar Visualization */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {radarSelectedSlugs.map((slug) => {
                  const model = models.find((m) => m.slug === slug);
                  if (!model) return null;

                  return (
                    <div key={slug} className="p-5 rounded-2xl bg-black border border-zinc-800 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div>
                          <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{model.name}</h3>
                          <div className="text-[10px] font-mono text-zinc-400">{model.creator}</div>
                        </div>
                        {onSelectModel && (
                          <button
                            onClick={() => {
                              onSelectModel(model.slug);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white text-black text-[11px] font-bold cursor-pointer"
                          >
                            Select
                          </button>
                        )}
                      </div>

                      {/* Benchmark Bars */}
                      <div className="space-y-2.5 text-xs font-mono">
                        <div>
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>AA Intelligence Index:</span>
                            <span className="text-white font-bold">{model.intelligenceIndex} pts</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${model.intelligenceIndex}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>SWE-bench Verified Coding:</span>
                            <span className="text-emerald-400 font-bold">{model.codingScore}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${model.codingScore}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>GPQA Diamond Science:</span>
                            <span className="text-sky-400 font-bold">{model.gpqaDiamond || 'N/A'}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-sky-400 rounded-full" style={{ width: `${model.gpqaDiamond || 0}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>MATH 500 / AIME Math:</span>
                            <span className="text-indigo-300 font-bold">{model.mathScore}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${model.mathScore}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>Arena.ai Human Elo:</span>
                            <span className="text-amber-300 font-bold">{model.arenaElo} ELO</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${((model.arenaElo - 1000) / 400) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= VIEW 4: DETAILED MODEL CARDS ================= */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((model, idx) => (
                <div
                  key={model.slug}
                  className="p-5 rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition space-y-3.5 group shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-white text-black text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <h3 className="text-sm font-bold text-white group-hover:text-sky-300 truncate">
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

                    <div className="text-right flex-shrink-0 bg-black/80 px-3 py-1.5 rounded-xl border border-zinc-800">
                      <div className="text-sm sm:text-base font-extrabold text-white font-mono leading-none">
                        {model.intelligenceIndex} pts
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
                        AA Quality Index
                      </div>
                    </div>
                  </div>

                  {/* Benchmark Badges */}
                  <div className="grid grid-cols-4 gap-2 text-center font-mono">
                    <div className="p-2 rounded-xl bg-black/60 border border-zinc-800/80">
                      <div className="text-[9px] text-zinc-500 uppercase truncate">Arena Elo</div>
                      <div className="text-xs font-bold text-amber-300 mt-0.5">{model.arenaElo}</div>
                    </div>

                    <div className="p-2 rounded-xl bg-black/60 border border-zinc-800/80">
                      <div className="text-[9px] text-zinc-500 uppercase truncate">SWE-bench</div>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">{model.codingScore}%</div>
                    </div>

                    <div className="p-2 rounded-xl bg-black/60 border border-zinc-800/80">
                      <div className="text-[9px] text-zinc-500 uppercase truncate">GPQA Science</div>
                      <div className="text-xs font-bold text-sky-400 mt-0.5">{model.gpqaDiamond || 'N/A'}%</div>
                    </div>

                    <div className="p-2 rounded-xl bg-black/60 border border-zinc-800/80">
                      <div className="text-[9px] text-zinc-500 uppercase truncate">MATH 500</div>
                      <div className="text-xs font-bold text-indigo-300 mt-0.5">{model.mathScore}%</div>
                    </div>
                  </div>

                  {/* Latency & Pricing */}
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
          )}

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-8 py-3.5 border-t border-zinc-800 bg-[#050507] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-500">
          <span>Sources: Arena.ai Verified Human Battles & Artificial Analysis Live Registry</span>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real-Time Pareto Frontier Engine</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
