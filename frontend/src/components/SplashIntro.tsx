import React, { useEffect, useState } from 'react';
import { ButterflySvg } from './ButterflySvg';
import { Terminal, Cpu, Zap, CheckCircle2, ChevronRight } from 'lucide-react';

interface SplashIntroProps {
  onComplete: () => void;
}

const COMMAND_LOGS = [
  { text: '[KERNEL] Bootstrapping Xeno Neural Architecture v4.2...', delay: 100 },
  { text: '[VRAM] Allocating 32GB dynamic KV-Cache & Multi-Head Attention...', delay: 700 },
  { text: '[QUANT] Calibrating BF16 / FP8 Tensor Core weights...', delay: 1400 },
  { text: '[BRIDGE] Establishing zero-copy IPC channel with Rust daemon...', delay: 2100 },
  { text: '[ONLINE] Neural Inference Pipeline Active. Ready for input.', delay: 2600 },
];

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [activeLogIndex, setActiveLogIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 3000; // 3 seconds exactly

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedMs(Math.min(elapsed, duration));
      const currentProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(currentProgress);

      // Advance logs based on elapsed time
      if (elapsed > 2600) setActiveLogIndex(4);
      else if (elapsed > 2100) setActiveLogIndex(3);
      else if (elapsed > 1400) setActiveLogIndex(2);
      else if (elapsed > 700) setActiveLogIndex(1);
      else setActiveLogIndex(0);

      if (elapsed >= duration - 250) {
        setIsFadingOut(true);
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 150);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#000000] text-white flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Starfield / Particle Subtle Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-purple-900/20 blur-[100px]" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-cyan-900/20 blur-[120px]" />
        <div className="absolute top-1/2 right-10 w-64 h-64 rounded-full bg-pink-900/15 blur-[90px]" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Top Header Controls (Skip Button & 3s Timer Badge) */}
      <div className="relative z-20 flex items-center justify-between px-8 py-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>XENO-CORE // RUST BACKEND</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-zinc-500 tabular-nums">
            {(elapsedMs / 1000).toFixed(2)}s / 3.00s
          </div>
          <button
            onClick={onComplete}
            className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium text-zinc-200 transition-all cursor-pointer backdrop-blur-md"
          >
            <span>Skip Intro</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* MAIN SPLIT PAGE DESIGN */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 items-center w-full max-w-7xl mx-auto px-6 sm:px-12 gap-8 lg:gap-16">
        
        {/* LEFT SIDE: App Name (XENO in Roman, INFERENCE in Calligraphy) + Command Animation with Blurry Gradient */}
        <div className="flex flex-col justify-center items-start space-y-7 max-w-xl">
          
          {/* APPLICATION TITLE */}
          <div className="space-y-1">
            <div className="flex items-baseline flex-wrap gap-x-4 gap-y-1">
              {/* XENO in Romanian / Roman Serif Font */}
              <h1 className="font-roman text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-[0.22em] text-white uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-700">
                XENO
              </h1>

              {/* INFERENCE in Calligraphy Font with graceful entrance transition */}
              <span className="font-calligraphy text-5xl sm:text-6xl md:text-7xl font-normal text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-cyan-200 drop-shadow-[0_0_25px_rgba(192,132,252,0.8)] animate-calligraphy">
                Inference
              </span>
            </div>

            <p className="text-xs sm:text-sm font-light text-zinc-400 tracking-[0.3em] uppercase pl-1 opacity-80">
              High-Throughput Neural AI Acceleration
            </p>
          </div>

          {/* COMMAND ANIMATION IN HALF BLURRY GRADIENT BLENDED IN BACKGROUND */}
          <div className="w-full relative group">
            {/* Blurry Gradient Glow Layer blended into pure black background */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/30 via-purple-600/30 to-cyan-500/25 blur-xl opacity-80 group-hover:opacity-100 transition duration-700" />
            
            {/* Glassmorphic Container */}
            <div className="relative rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 p-5 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.8)] overflow-hidden">
              
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    xeno-tensor-init.sh
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CUDA / AVX-512</span>
                </div>
              </div>

              {/* Real-Time Animated Command Logs */}
              <div className="space-y-1.5 font-mono text-xs text-zinc-300 min-h-[105px]">
                {COMMAND_LOGS.map((log, index) => {
                  const isVisible = index <= activeLogIndex;
                  const isCurrent = index === activeLogIndex;
                  if (!isVisible) return null;

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-2 transition-all duration-300 ${
                        isCurrent ? 'text-cyan-300 font-medium' : 'text-zinc-400 opacity-75'
                      }`}
                    >
                      <span className="text-purple-400 select-none">&gt;</span>
                      <span className="flex-1 break-all">{log.text}</span>
                      {isCurrent && (
                        <span className="inline-block w-2 h-3.5 bg-cyan-400 animate-pulse select-none" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ANIMATED PROGRESS BAR */}
              <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    BOOTSTRAP STATUS
                  </span>
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 tabular-nums">
                    {progress}% {progress === 100 ? 'COMPLETE' : 'LOADING'}
                  </span>
                </div>

                {/* Progress Track & Fill */}
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-75 ease-out shadow-[0_0_12px_rgba(168,85,247,0.8)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Badges */}
          <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Rust Axum Engine
            </span>
            <span>•</span>
            <span>Zero-Latency SSE</span>
            <span>•</span>
            <span>128K KV Cache</span>
          </div>

        </div>

        {/* RIGHT SIDE: SVG of Butterfly with Gradiented Colour Wings */}
        <div className="flex flex-col items-center justify-center relative select-none">
          {/* Subtle Ambient Radial Backlight */}
          <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-cyan-500/15 via-purple-600/20 to-pink-500/15 blur-3xl pointer-events-none animate-pulse" />
          
          {/* High Fidelity Animated Butterfly */}
          <ButterflySvg size={380} glow={true} animated={true} />

          {/* Slogan below butterfly */}
          <div className="mt-4 text-center space-y-1">
            <div className="text-xs uppercase font-mono tracking-[0.25em] text-zinc-400">
              Metamorphic AI Synthesis
            </div>
            <div className="text-[11px] text-zinc-600 font-mono">
              Designed with TypeScript & Rust
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Footer Accent */}
      <div className="relative z-10 px-8 py-4 w-full max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono text-zinc-600 border-t border-white/5">
        <span>XENO INFERENCE © 2026</span>
        <span>LATENCY: &lt; 0.4ms // TTFT: 118ms</span>
      </div>

    </div>
  );
};