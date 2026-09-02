import React, { useState } from 'react';
import { X, Play, Gauge, Zap, CheckCircle2, Clock, HardDrive } from 'lucide-react';
import type { BenchmarkResult } from '../types';
import { runMicroBenchmark } from '../services/api';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  rustBackendUrl: string;
  activeModel: string;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({
  isOpen,
  onClose,
  rustBackendUrl,
  activeModel,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BenchmarkResult | null>(null);

  if (!isOpen) return null;

  const handleStartBenchmark = async () => {
    setIsRunning(true);
    try {
      const res = await runMicroBenchmark(rustBackendUrl, activeModel);
      setResult(res);
    } catch (err) {
      console.error('Benchmark execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0c0c16] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white tracking-wide">
              Neural Throughput Micro-Benchmark
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-sm">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Measures raw forward-pass token emission latency, Memory Bandwidth saturation, and Time-To-First-Token (TTFT) across the Rust Axum engine.
          </p>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 font-mono text-xs text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-500">TARGET MODEL:</span>
              <span className="text-purple-300 font-bold">{activeModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">BATCH SIZE / CONCURRENCY:</span>
              <span className="text-cyan-300">1 Client (Sequential Micro-pass)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">EVAL TOKEN RUN:</span>
              <span className="text-zinc-200">250 tokens</span>
            </div>
          </div>

          {/* Results Box */}
          {result && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/30 to-cyan-950/30 border border-purple-500/20 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Benchmark Complete
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-black/50 border border-white/5 text-center">
                  <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> SPEED
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                    {result.tokensPerSec}
                  </div>
                  <div className="text-[10px] text-zinc-500">tok/s</div>
                </div>

                <div className="p-3 rounded-lg bg-black/50 border border-white/5 text-center">
                  <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> TTFT
                  </div>
                  <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                    {result.ttftMs}
                  </div>
                  <div className="text-[10px] text-zinc-500">ms</div>
                </div>

                <div className="p-3 rounded-lg bg-black/50 border border-white/5 text-center">
                  <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-center gap-1">
                    <HardDrive className="w-3 h-3 text-pink-400" /> ALLOC
                  </div>
                  <div className="text-xl font-bold font-mono text-pink-300 mt-1">
                    {result.memoryAllocatedMb}
                  </div>
                  <div className="text-[10px] text-zinc-500">MB</div>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={isRunning}
            onClick={handleStartBenchmark}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50 shadow-lg shadow-purple-500/20"
          >
            {isRunning ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Benchmarking Tensor Core...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Hardware Benchmark</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};