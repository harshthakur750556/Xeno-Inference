import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';

interface ThinkingBlockProps {
  reasoning: string;
  isThinking?: boolean;
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({ reasoning, isThinking = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!reasoning && !isThinking) return null;

  return (
    <div className="mb-3 rounded-xl border border-purple-500/20 bg-purple-950/20 backdrop-blur-md overflow-hidden transition-all duration-200">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-mono text-purple-300/90 hover:bg-purple-900/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Brain className={`w-3.5 h-3.5 text-purple-400 ${isThinking ? 'animate-pulse' : ''}`} />
          <span className="font-semibold tracking-wide">
            {isThinking ? 'Thinking & Reasoning...' : 'Thought Process'}
          </span>
          {isThinking && (
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-purple-400/70">
          <span className="text-[10px]">{reasoning.length} chars</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Reasoning Text Body */}
      {isExpanded && (
        <div className="px-4 py-3 text-xs text-zinc-300 font-mono leading-relaxed border-t border-purple-500/15 bg-black/30 whitespace-pre-wrap">
          {reasoning}
          {isThinking && (
            <span className="inline-block w-1.5 h-3 ml-1 bg-purple-400 animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
};