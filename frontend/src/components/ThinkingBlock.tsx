import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface ThinkingBlockProps {
  reasoning: string;
  isThinking?: boolean;
  durationMs?: number;
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({
  reasoning,
  isThinking = false,
  durationMs,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!reasoning && !isThinking) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(reasoning);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const durationSec = durationMs ? (durationMs / 1000).toFixed(1) : null;

  return (
    <div className="mb-3 rounded-xl border border-zinc-800 bg-[#09090c] overflow-hidden transition-all duration-200">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-mono text-zinc-300 hover:bg-white/[0.03] transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Brain className={`w-3.5 h-3.5 text-white ${isThinking ? 'animate-pulse' : ''}`} />
          <span className="font-semibold tracking-wide text-zinc-200">
            {isThinking ? 'Thinking & Reasoning...' : 'Thought Process'}
          </span>
          {durationSec && !isThinking && (
            <span className="text-[10px] text-zinc-500 font-mono">({durationSec}s)</span>
          )}
          {isThinking && (
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-zinc-500">
          <button
            onClick={handleCopy}
            className="p-1 hover:text-white transition cursor-pointer"
            title="Copy thought process"
          >
            {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
          </button>
          <span className="text-[10px]">{reasoning.length} chars</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
        </div>
      </div>

      {/* Reasoning Text Body */}
      {isExpanded && (
        <div className="px-4 py-3 text-xs text-zinc-300 font-mono leading-relaxed border-t border-zinc-800 bg-black/60 whitespace-pre-wrap">
          {reasoning}
          {isThinking && (
            <span className="inline-block w-1.5 h-3 ml-1 bg-white animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
};