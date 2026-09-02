import React, { useEffect, useState } from 'react';
import { ButterflySvg } from './ButterflySvg';
import { XenoLogo } from './XenoLogo';

interface SplashIntroProps {
  onComplete: () => void;
}

interface CommandItem {
  text: string;
  delayMs: number;
}

const COMMAND_SEQUENCE: CommandItem[] = [
  {
    text: '[KERNEL] Bootstrapping Xeno Neural Architecture v4.2...',
    delayMs: 200,
  },
  {
    text: '[VRAM] KV-Cache Allocation: [████████░░░░░░░░] 50% (16.0 GB)',
    delayMs: 1400,
  },
  {
    text: '[VRAM] PagedAttention Buffer: [████████████████] 100% (32.0 GB Ready)',
    delayMs: 2700,
  },
  {
    text: '[QUANT] Calibrating BF16 / FP8: [████████████░░░░] 75% (SIMD Active)',
    delayMs: 4200,
  },
  {
    text: '[SPARSE] Attention Density:  ▂▃▅▆▇█▇▆▅▃  (128k context verified)',
    delayMs: 5800,
  },
  {
    text: '[BRIDGE] IPC Channel with Rust Daemon: [████████████████] 100% (<0.4ms)',
    delayMs: 7300,
  },
  {
    text: '[ONLINE] Neural Inference Pipeline Active. Ready for input.',
    delayMs: 8700,
  },
];

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 10000; // 10 seconds total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(currentProgress);

      // Find the current active step based on realistic delays
      let currentStep = 0;
      for (let i = 0; i < COMMAND_SEQUENCE.length; i++) {
        if (elapsed >= COMMAND_SEQUENCE[i].delayMs) {
          currentStep = i;
        }
      }
      setActiveStep(currentStep);

      if (elapsed >= duration - 350) {
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
      className={`fixed inset-0 z-50 bg-[#000000] text-white flex flex-col justify-between overflow-hidden transition-all duration-500 ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top Minimalist Header (Logo only, no timer, no skip button) */}
      <div className="relative z-20 flex items-center justify-between px-8 sm:px-14 py-8 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <XenoLogo size={26} />
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-zinc-400">
            <span>XENO-CORE</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">RUST AXUM</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="tracking-widest">INITIALIZING</span>
        </div>
      </div>

      {/* MAIN SPLIT PAGE DESIGN - PURE BLACK & WHITE AESTHETIC */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 items-center w-full max-w-7xl mx-auto px-8 sm:px-14 gap-12 lg:gap-20">
        
        {/* LEFT SIDE: App Name in Two Large Lines + Unboxed 3-Line Rolling Commands */}
        <div className="flex flex-col justify-center items-start space-y-10 max-w-xl">
          
          {/* APPLICATION TITLE - TWO LINES, EXTRA LARGE */}
          <div className="space-y-1">
            {/* Line 1: XENO in Roman Serif */}
            <h1 className="font-roman text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-[0.22em] text-white uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.25)] leading-none select-none transition-all duration-700">
              XENO
            </h1>

            {/* Line 2: Inference in Calligraphy cursive */}
            <div className="font-calligraphy text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal text-zinc-200 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-calligraphy leading-none select-none pl-1">
              Inference
            </div>

            <p className="text-xs sm:text-sm font-light text-zinc-400 tracking-[0.35em] uppercase pl-1 pt-3">
              High-Throughput Neural AI Acceleration
            </p>
          </div>

          {/* UNBOXED 3-LINE ROLLING COMMAND STREAM WITH INLINE PROGRESS/GRAPHS */}
          <div className="w-full relative pt-2">
            {/* Soft subtle blurry gradient backdrop */}
            <div className="absolute -inset-4 bg-radial from-white/[0.04] to-transparent blur-2xl pointer-events-none" />

            {/* Exactly 3 Lines Stream with Disappearing Animation */}
            <div className="relative space-y-3 font-mono text-xs sm:text-[13px] min-h-[110px] flex flex-col justify-end">
              {visibleIndices.map((idx, pos) => {
                const isNewest = pos === visibleIndices.length - 1;
                const isOldest = pos === 0 && visibleIndices.length === 3;
                const isMiddle = pos === 1 && visibleIndices.length === 3;

                let opacityClass = 'opacity-100 text-white font-medium';
                if (isOldest) opacityClass = 'opacity-25 text-zinc-500 scale-[0.98]';
                else if (isMiddle) opacityClass = 'opacity-65 text-zinc-400';

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 transition-all duration-500 transform ${opacityClass}`}
                  >
                    <span className="text-zinc-500 select-none text-xs">&gt;</span>
                    <span className="truncate">{COMMAND_SEQUENCE[idx].text}</span>
                    {isNewest && (
                      <span className="inline-block w-1.5 h-3.5 bg-white animate-pulse select-none ml-1 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* MINIMALIST PROGRESS HAIRLINE BAR */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500 tracking-wider">BOOTSTRAP PROGRESS</span>
                <span className="font-semibold text-white tabular-nums tracking-wider">
                  {progress}%
                </span>
              </div>

              {/* 2px hairline track */}
              <div className="h-[2px] w-full bg-zinc-900 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

          </div>

          {/* Minimalist Feature Badges */}
          <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono tracking-wide">
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
          <ButterflySvg size={440} />

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
      <div className="relative z-10 px-8 sm:px-14 py-6 w-full max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono text-zinc-600">
        <span>XENO INFERENCE © 2026</span>
        <span>LATENCY: &lt; 0.4ms // TTFT: 118ms</span>
      </div>

    </div>
  );
};