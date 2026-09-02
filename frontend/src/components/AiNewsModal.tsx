import React, { useState } from 'react';
import {
  X,
  Newspaper,
  ExternalLink,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface AiNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel?: (modelId: string) => void;
}

interface NewsArticle {
  id: string;
  title: string;
  company: string;
  companyBadge: string;
  date: string;
  category: 'RELEASE' | 'REASONING' | 'OPEN SOURCE' | 'BENCHMARK' | 'HARDWARE';
  summary: string;
  fullContent: string;
  capabilities: string[];
  benchmarkHighlights: { metric: string; score: string; comparison: string }[];
  modelIdLink?: string;
  sourceUrl: string;
}

const AI_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'claude-3-7-hybrid',
    title: 'Anthropic Releases Claude 3.7 Sonnet: First Hybrid Model with Dynamic Thinking Mode & Computer Use',
    company: 'Anthropic',
    companyBadge: 'A',
    date: 'February 2025',
    category: 'RELEASE',
    summary: 'Claude 3.7 Sonnet introduces dual-mode execution combining instant sub-second responses with extended multi-step reasoning, setting state-of-the-art results on SWE-bench.',
    fullContent: `Anthropic has officially launched Claude 3.7 Sonnet, the industry's first hybrid reasoning model capable of seamlessly toggling between instantaneous generation and extended chain-of-thought verification.

Key Architectural Breakthroughs:
1. Dynamic Extended Thinking: Users and developers can configure thinking budgets from 1 token to 128,000 tokens, allowing the model to adaptively allocate compute to hard problems.
2. SOTA Software Engineering: Sets a new benchmark on SWE-bench Verified with a 70.3% solve rate, capable of multi-file refactoring, debugging full repository ASTs, and executing bash tool calls.
3. Enhanced Computer Use: Native desktop GUI automation and API browser interaction with sub-50ms latency.`,
    capabilities: [
      'Configurable Thinking Token Budget (1 to 128k)',
      '70.3% SWE-bench Verified (World Record)',
      'Instant vs Deep-Thought Hybrid Switching',
      'Advanced Computer & Browser Automation',
    ],
    benchmarkHighlights: [
      { metric: 'SWE-bench Verified', score: '70.3%', comparison: '+12.4% over Claude 3.5' },
      { metric: 'AIME 2024 Math', score: '96.2%', comparison: 'Matches o1 / DeepSeek-R1' },
      { metric: 'GPQA Diamond', score: '68.5%', comparison: 'SOTA Graduate Science' },
    ],
    modelIdLink: 'claude-3-7-sonnet',
    sourceUrl: 'https://www.anthropic.com/news/claude-3-7-sonnet',
  },
  {
    id: 'deepseek-r1-release',
    title: 'DeepSeek-R1 Released: 671B MoE Open Reasoning Model with Pure Reinforcement Learning',
    company: 'DeepSeek AI',
    companyBadge: 'D',
    date: 'January 2025',
    category: 'REASONING',
    summary: 'DeepSeek-R1 open-weights release rivals proprietary reasoning engines at 1/20th the training cost, proving pure RL enables autonomous reasoning behaviors.',
    fullContent: `DeepSeek AI released DeepSeek-R1, an open-weights 671B MoE reasoning model trained using large-scale reinforcement learning without preliminary supervised fine-tuning (SFT) in the first phase (DeepSeek-R1-Zero).

Core Innovations:
1. Autonomous Chain-of-Thought Verification: Spontaneously develops self-reflection, backtracking, and exploration of alternative proof branches.
2. Distilled Small Models: Open distillation recipes provided for Qwen and Llama architectures ranging from 1.5B to 70B parameters.
3. Multi-Head Latent Attention (MLA): Ultra-compressed KV-cache footprint enabling 128k context on commodity GPU clusters.`,
    capabilities: [
      '671B MoE (37B active parameters per token)',
      'Open Weights under MIT License',
      'Autonomous Self-Correction & Verification',
      'Multi-Head Latent Attention (MLA) VRAM optimization',
    ],
    benchmarkHighlights: [
      { metric: 'AIME 2024', score: '97.3%', comparison: 'Equal to OpenAI o1' },
      { metric: 'MATH-500', score: '97.3%', comparison: 'SOTA in Mathematical Proofs' },
      { metric: 'Codeforces Percentile', score: '96.3th', comparison: 'Competitive Grandmaster' },
    ],
    modelIdLink: 'deepseek-r1',
    sourceUrl: 'https://github.com/deepseek-ai/DeepSeek-R1',
  },
  {
    id: 'openai-o3-mini-launch',
    title: 'OpenAI Launches o3-mini: Ultra-Fast Reasoning Optimized for STEM, Math, and Coding',
    company: 'OpenAI',
    companyBadge: 'O',
    date: 'January 2025',
    category: 'BENCHMARK',
    summary: 'o3-mini delivers high-speed competitive STEM reasoning with tiered reasoning effort (Low, Medium, High) and integrated function calling.',
    fullContent: `OpenAI introduced o3-mini, a cost-effective, high-throughput reasoning model specifically targeted at mathematical optimization, scientific discovery, and algorithmic programming.

Highlights:
1. Low Latency Reasoning: TTFT reduced by 60% compared to earlier o1 models with throughput exceeding 90 tokens/sec.
2. Developer Control: Native support for structured JSON outputs, streaming reasoning deltas, and multi-tool orchestration.
3. High-Tier Reasoning: Scores 97.9% on AIME 2024 under high effort mode.`,
    capabilities: [
      'High-Speed STEM Inference (92+ tok/s)',
      'Tiered Reasoning Effort Control',
      'Native Structured Outputs & Function Calling',
      'Sub-300ms Time-To-First-Token',
    ],
    benchmarkHighlights: [
      { metric: 'AIME 2024 Math', score: '97.9%', comparison: '+18% over o1-mini' },
      { metric: 'Codeforces', score: '2085 Elo', comparison: 'Top 1% human competitors' },
      { metric: 'SWE-bench Lite', score: '68.1%', comparison: 'Optimized developer runtime' },
    ],
    modelIdLink: 'o3-mini',
    sourceUrl: 'https://openai.com/index/openai-o3-mini/',
  },
  {
    id: 'meta-llama-3-3',
    title: 'Meta AI Open-Sources Llama 3.3 70B: Matching Llama 3.1 405B Performance at Fraction of Size',
    company: 'Meta AI',
    companyBadge: 'M',
    date: 'December 2024',
    category: 'OPEN SOURCE',
    summary: 'Llama 3.3 70B sets a new efficiency benchmark for open-weights models, offering 405B-class intelligence on a single GPU node.',
    fullContent: `Meta announced Llama 3.3 70B Instruct, utilizing advanced knowledge distillation and iterative online preference optimization from the 405B flagship.

Key Highlights:
1. Cost-Performance SOTA: Delivers 128k context window with dense 70B parameter efficiency runnable on two RTX 4090s or a single H100.
2. Tool Use & Instruction Following: Massive gains on BFCL function calling and multi-turn instruction adherence.`,
    capabilities: [
      'Dense 70B parameter architecture',
      '128K context window with RoPE scaling',
      '405B distillation efficiency',
      'Permissive commercial community license',
    ],
    benchmarkHighlights: [
      { metric: 'MMLU-Pro', score: '71.4%', comparison: 'Matches Llama 3.1 405B' },
      { metric: 'HumanEval', score: '88.4%', comparison: '+12% over Llama 3 70B' },
      { metric: 'BFCL Tool Calling', score: '88.5%', comparison: 'Leading open tool caller' },
    ],
    modelIdLink: 'llama-3-3-70b',
    sourceUrl: 'https://ai.meta.com/blog/llama-3-3-70b/',
  },
  {
    id: 'qwen-2-5-coder-release',
    title: 'Alibaba Cloud Releases Qwen 2.5 Coder 32B: Open-Source Coding SOTA',
    company: 'Alibaba Cloud',
    companyBadge: 'Q',
    date: 'November 2024',
    category: 'OPEN SOURCE',
    summary: 'Qwen 2.5 Coder 32B overtakes larger models across 40+ programming languages with deep syntax tree parsing and codebase comprehension.',
    fullContent: `Alibaba Cloud has open-sourced the Qwen 2.5 Coder family, spearheaded by the 32B variant that rivals GPT-4o in software engineering tasks.

Highlights:
1. Polyglot Mastery: Trained on over 5.5 trillion tokens of code, syntax trees, and documentation covering 92 languages.
2. Long-Context Code Completion: Full 128k repository level context window for repository-wide refactoring.`,
    capabilities: [
      '5.5T specialized code tokens training dataset',
      '128k token context window for full repo analysis',
      'SOTA on HumanEval & EvalPlus across 40 languages',
      'Apache 2.0 open license',
    ],
    benchmarkHighlights: [
      { metric: 'EvalPlus (Python)', score: '92.7%', comparison: 'Top tier coding accuracy' },
      { metric: 'SWE-bench Verified', score: '57.4%', comparison: 'Leading 32B parameter model' },
      { metric: 'MultiPL-E (Polyglot)', score: '85.2%', comparison: 'Outperforms GPT-4o on Java/Rust' },
    ],
    modelIdLink: 'qwen-2-5-coder',
    sourceUrl: 'https://qwenlm.github.io/blog/qwen2.5-coder/',
  },
  {
    id: 'hopper-flashattention-3',
    title: 'FlashAttention-3 Hopper FP8 Kernels Integrated: 1.8x Speedup on NVIDIA H100 / Blackwell',
    company: 'Hardware & Systems',
    companyBadge: 'H',
    date: '2025 Release',
    category: 'HARDWARE',
    summary: 'FlashAttention-3 leverages asynchronous Tensor Core hardware pipelines and FP8 matrix multiplication to deliver 1.8x inference throughput.',
    fullContent: `FlashAttention-3 has released native Hopper (H100) and Blackwell (B200) kernel optimizations.

Innovations:
1. Warp-Specialized Pipelines: Overlaps data movement between global memory and shared memory with Tensor Core computation.
2. FP8 Mixed-Precision Decoders: Reduces VRAM bandwidth pressure during autoregressive token generation by 50%.`,
    capabilities: [
      '1.8x throughput acceleration over FlashAttention-2',
      'Native FP8 low-precision tensor kernel support',
      'Zero accuracy degradation on long context retrieval',
      'Sub-5ms attention step on 128k KV sequences',
    ],
    benchmarkHighlights: [
      { metric: 'Speedup on H100', score: '1.8x', comparison: 'vs FlashAttention-2' },
      { metric: 'VRAM Footprint', score: '-50%', comparison: 'With FP8 KV Cache' },
      { metric: 'TFLOPs Efficiency', score: '75%', comparison: 'Theoretical hardware maximum' },
    ],
    sourceUrl: 'https://github.com/Dao-AILab/flash-attention',
  },
];

export const AiNewsModal: React.FC<AiNewsModalProps> = ({
  isOpen,
  onClose,
  onSelectModel,
}) => {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', 'RELEASE', 'REASONING', 'OPEN SOURCE', 'BENCHMARK', 'HARDWARE'];

  const filtered = AI_NEWS_ARTICLES.filter((item) =>
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
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-zinc-300 border border-white/10">
                  FACT-CHECKED FEED
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Official release notes, architectural breakdowns, and benchmark audits from leading AI labs
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
                      <span className="text-xs font-semibold text-zinc-300">{article.company}</span>
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
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3 border-t border-zinc-800 bg-[#060608] flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>XENO INTELLIGENCE FEED • Curated Fact-Checked Reports</span>
          <span>Updated Daily</span>
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
              {selectedArticle.benchmarkHighlights.length > 0 && (
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
