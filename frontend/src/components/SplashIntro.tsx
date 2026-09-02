import React, { useEffect, useState } from 'react';
import { ButterflySvg } from './ButterflySvg';
import { XenoLogo } from './XenoLogo';
import { ChevronRight } from 'lucide-react';

interface SplashIntroProps {
  onComplete: () => void;
}

const STREAM_COMMANDS = [
  '[KERNEL] Initializing Xeno Neural Architecture v4.2...',
  '[VRAM] Allocating 32GB dynamic KV-Cache & Multi-Head Attention...',
  '[QUANT] Calibrating BF16 / FP8 Tensor Core weights...',
  '[BRIDGE] Establishing zero-copy IPC channel with Rust Axum daemon...',
  '[SYNAPSE] Initializing 128k context sparse attention kernel...',
  '[TENSOR] Compiling SIMD vector pipelines for zero-latency inference...',
  '[ONLINE] Neural Inference Engine Active. Ready for input.',
];

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 3000; // 3 seconds total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedMs(Math.min(elapsed, duration));
      const currentProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(currentProgress);

      // Advance through commands proportionally
      const step = Math.min(
        Math.floor((elapsed / duration) * STREAM_COMMANDS.length),
        STREAM_COMMANDS.length - 1
      );
      setActiveStep(step);

      if (elapsed >= duration - 250) {
        setIsFadingOut(true);
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 120);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Derive exactly 3 visible lines (current, previous, older)
  const visibleIndices: number[] = [];
  if (activeStep >= 2) {
    visibleIndices.push(activeStep - 2);
    visibleIndices.push(activeStep - 1);
    visibleIndices.push(activeStep);
  } else if (activeStep === 1) {
    visibleIndices.push(0);
    visibleIndices.push(1);
  } else {
    visibleIndices.push(0);
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#000000] text-white flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top Header Controls (Logo, Timer & Skip Button) */}
      <div className="relative z-20 flex items-center justify-between px-8 sm:px-12 py-8 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <XenoLogo size={24} />
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-zinc-400">
            <span>XENO-CORE</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">RUST AXUM</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-zinc-500 tabular-nums">
            {(elapsedMs / 1000).toFixed(2)}s / 3.00s
          </div>
          <button
            onClick={onComplete}
            className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-zinc-200 transition-all cursor-pointer backdrop-blur-md"
          >
            <span>Skip</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* MAIN SPLIT PAGE DESIGN - PURE BLACK & WHITE AESTHETIC */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 items-center w-full max-w-7xl mx-auto px-8 sm:px-12 gap-10 lg:gap-16">
        
        {/* LEFT SIDE: App Name + Unboxed 3-Line Disappearing Command Stream */}
        <div className="flex flex-col justify-center items-start space-y-8 max-w-xl">
          
          {/* APPLICATION TITLE */}
          <div className="space-y-2">
            <div className="flex items-baseline flex-wrap gap-x-4 gap-y-1">
              {/* XENO in Roman Serif Font in pure white */}
              <h1 className="font-roman text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-[0.22em] text-white uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-700">
                XENO
              </h1>

              {/* INFERENCE in Calligraphy Font with graceful entrance transition */}
              <span className="font-calligraphy text-5xl sm:text-6xl md:text-7xl font-normal text-zinc-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.25)] animate-calligraphy">
                Inference
              </span>
            </div>

            <p className="text-xs sm:text-sm font-light text-zinc-400 tracking-[0.35em] uppercase pl-1">
              High-Throughput Neural AI Acceleration
            </p>
          </div>

          {/* UNBOXED 3-LINE DISAPPEARING COMMAND STREAM (NOT IN A BOX) */}
          <div className="w-full relative pt-2">
            {/* Soft blurry gradient blended into black background */}
            <div className="absolute -inset-4 bg-radial from-white/[0.04] to-transparent blur-2xl pointer-events-none" />

            {/* Exactly 3 Lines Stream with Disappearing Animation */}
            <div className="relative space-y-2.5 font-mono text-xs min-h-[96px] flex flex-col justify-end">
              {visibleIndices.map((idx, pos) => {
                const isNewest = pos === visibleIndices.length - 1;
                const isOldest = pos === 0 && visibleIndices.length === 3;
                const isMiddle = pos === 1 && visibleIndices.length === 3;

                let opacityClass = 'opacity-100 text-white font-medium';
                if (isOldest) opacityClass = 'opacity-30 text-zinc-500 scale-[0.98]';
                else if (isMiddle) opacityClass = 'opacity-65 text-zinc-400';

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 transition-all duration-300 transform ${opacityClass}`}
                  >
                    <span className="text-zinc-500 select-none text-[11px]">&gt;</span>
                    <span className="truncate">{STREAM_COMMANDS[idx]}</span>
                    {isNewest && (
                      <span className="inline-block w-1.5 h-3 bg-white animate-pulse select-none ml-0.5" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* MINIMALIST PROGRESS HAIRLINE BAR */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500 tracking-wider">BOOTSTRAP SEQUENCE</span>
                <span className="font-semibold text-white tabular-nums tracking-wider">
                  {progress}%
                </span>
              </div>

              {/* Ultra-clean hairline track */}
              <div className="h-[2px] w-full bg-zinc-900 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

          </div>

          {/* Minimalist Feature Accents */}
          <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono tracking-wide pt-1">
            <span className="text-zinc-400">Rust Axum Core</span>
            <span>•</span>
            <span>Zero-Latency SSE</span>
            <span>•</span>
            <span>128K KV Cache</span>
          </div>

        </div>

        {/* RIGHT SIDE: Exact Razor-Sharp Vector Butterfly (Static on Black Background) */}
        <div className="flex flex-col items-center justify-center relative select-none">
          {/* Subtle soft white ambient glow */}
          <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />
          
          {/* Razor Sharp Original Vector Butterfly */}
          <ButterflySvg size={420} />

          {/* Slogan below butterfly */}
          <div className="mt-4 text-center space-y-1">
            <div className="text-[11px] uppercase font-mono tracking-[0.3em] text-zinc-400">
              Neural AI Synthesis
            </div>
            <div className="text-[10px] text-zinc-600 font-mono">
              Designed with TypeScript & Rust
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Footer Accent */}
      <div className="relative z-10 px-8 sm:px-12 py-6 w-full max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono text-zinc-600">
        <span>XENO INFERENCE © 2026</span>
        <span>LATENCY: &lt; 0.4ms // TTFT: 118ms</span>
      </div>

    </div>
  );
};