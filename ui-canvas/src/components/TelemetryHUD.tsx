import React from 'react';
import { Shield, Zap, Cpu, Sparkles } from 'lucide-react';

export const TelemetryHUD: React.FC = () => {
  return (
    <header className="w-full border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Brand Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-violet-500 to-fuchsia-500 p-[1px] shadow-[0_0_12px_rgba(0,245,212,0.4)] flex items-center justify-center">
            <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center font-roman font-bold text-xs text-cyan-300">
              XI
            </div>
          </div>
          <div>
            <div className="font-roman text-sm font-bold tracking-widest text-zinc-100 flex items-center gap-2">
              XENO INFERENCE
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-normal">
                v2.4-ONLINE
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 hidden sm:block">
              3301 CIPHER SPATIAL MATRIX
            </p>
          </div>
        </div>

        {/* Center Live Telemetry Pill Bar */}
        <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-full bg-zinc-950/80 border border-white/10 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400">ENGINE:</span>
            <span className="text-emerald-400 font-semibold">SYNCHRONIZED</span>
          </div>

          <span className="text-zinc-700">|</span>

          <div className="flex items-center gap-1.5 text-zinc-300">
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-zinc-400">VRAM:</span>
            <span className="text-violet-300 font-semibold">14.8 GB</span>
          </div>

          <span className="text-zinc-700">|</span>

          <div className="flex items-center gap-1.5 text-zinc-300">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-400">LATENCY:</span>
            <span className="text-cyan-300 font-semibold">14.2 ms</span>
          </div>

          <span className="text-zinc-700">|</span>

          <div className="flex items-center gap-1.5 text-zinc-300">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">AST:</span>
            <span className="text-amber-300 font-semibold">VERIFIED</span>
          </div>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600/80 to-cyan-600/80 hover:from-violet-500 hover:to-cyan-500 text-xs font-mono font-medium text-white border border-white/20 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>ENTER CHAT</span>
          </button>
        </div>

      </div>
    </header>
  );
};
