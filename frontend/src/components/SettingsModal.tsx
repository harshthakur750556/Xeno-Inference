import React from 'react';
import { X, Sliders, Server, Key, Sparkles, Brain, Cpu } from 'lucide-react';
import type { InferenceConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: InferenceConfig;
  onChange: (newConfig: InferenceConfig) => void;
}

const SYSTEM_PROMPTS = [
  {
    name: 'Neural AI Specialist',
    prompt: 'You are XENO, an ultra-advanced AI reasoning engine. Provide rigorous, structured, deeply insightful, and technically accurate responses.',
  },
  {
    name: 'Senior Systems Architect',
    prompt: 'You are an expert Systems Architect specializing in Rust, high-throughput networking, SIMD optimizations, and concurrent asynchronous runtimes.',
  },
  {
    name: 'Logic & Proof Engine',
    prompt: 'You are a formal logic and mathematical proofing engine. State axioms clearly, show every step of deduction, and verify theorems rigorously.',
  },
  {
    name: 'Concise Assistant',
    prompt: 'Answer questions directly, concisely, and with maximum clarity without unnecessary fluff.',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl rounded-2xl border border-white/10 bg-[#09090b] shadow-2xl overflow-hidden flex flex-col max-h-[88dvh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Sliders className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide">
              Inference Parameters
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 text-xs sm:text-sm">
          
          {/* Backend Connection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              <Server className="w-3.5 h-3.5 text-zinc-400" />
              Rust Backend Endpoint (Axum HTTP/SSE)
            </label>
            <input
              type="text"
              value={config.rustBackendUrl}
              onChange={(e) => onChange({ ...config, rustBackendUrl: e.target.value })}
              placeholder="http://127.0.0.1:3001"
              className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/10 text-zinc-200 font-mono text-xs focus:outline-none focus:border-white transition"
            />
            <p className="text-[11px] text-zinc-500">
              Default local Rust server port: 3001. Fallbacks to client neural simulation if offline.
            </p>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                Temperature (Sampling Entropy)
              </span>
              <span className="font-mono text-white">{config.temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.5"
              step="0.05"
              value={config.temperature}
              onChange={(e) => onChange({ ...config, temperature: parseFloat(e.target.value) })}
              className="w-full accent-white cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0.0 (Deterministic)</span>
              <span>0.7 (Balanced)</span>
              <span>1.5 (Creative)</span>
            </div>
          </div>

          {/* Top-P Nucleus Sampling */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-2 uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                Top-P (Nucleus Cutoff)
              </span>
              <span className="font-mono text-white">{config.topP.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={config.topP}
              onChange={(e) => onChange({ ...config, topP: parseFloat(e.target.value) })}
              className="w-full accent-white cursor-pointer"
            />
          </div>

          {/* Max Generation Tokens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span className="uppercase tracking-wider">Max Output Tokens</span>
              <span className="font-mono text-white">{config.maxTokens}</span>
            </div>
            <input
              type="range"
              min="256"
              max="8192"
              step="256"
              value={config.maxTokens}
              onChange={(e) => onChange({ ...config, maxTokens: parseInt(e.target.value) })}
              className="w-full accent-white cursor-pointer"
            />
          </div>

          {/* Deep Reasoning Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <Brain className="w-4 h-4 text-zinc-400" />
                Deep Reasoning (Chain of Thought)
              </div>
              <p className="text-[11px] text-zinc-400">
                Shows real-time thought traces before presenting final answers.
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.enableReasoning}
              onChange={(e) => onChange({ ...config, enableReasoning: e.target.checked })}
              className="w-4 h-4 accent-white rounded cursor-pointer"
            />
          </div>

          {/* System Prompt Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              System Instruction Prompt
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SYSTEM_PROMPTS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onChange({ ...config, systemPrompt: preset.prompt })}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={config.systemPrompt}
              onChange={(e) => onChange({ ...config, systemPrompt: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-zinc-200 text-xs font-mono focus:outline-none focus:border-white transition resize-none"
            />
          </div>

          {/* Optional External API Key */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              <Key className="w-3.5 h-3.5 text-zinc-400" />
              API Key (Optional / OpenAI, Anthropic, Ollama Proxy)
            </label>
            <input
              type="password"
              value={config.apiKey || ''}
              onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/10 text-zinc-200 font-mono text-xs focus:outline-none focus:border-white transition"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-xs font-semibold text-black transition cursor-pointer shadow-lg"
          >
            Apply Changes
          </button>
        </div>

      </div>
    </div>
  );
};