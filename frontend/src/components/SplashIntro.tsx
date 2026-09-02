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
      className={`fixed inset-0 z-50 bg-[#000000] text-white flex flex-col justify-between overflow-y-auto lg:overflow-hidden min-h-[100dvh] w-full transition-all duration-500 ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top Header (Logo + Status only, fully responsive) */}
      <header className="relative z-20 flex-shrink-0 flex items-center justify-between px-5 sm:px-10 lg:px-14 py-5 sm:py-7 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <XenoLogo size={24} />
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono tracking-widest text-zinc-400">
            <span>XENO-CORE</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">RUST AXUM</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
          <span className="tracking-widest hidden xs:inline">INITIALIZING</span>
        </div>
      </header>

      {/* MAIN SPLIT PAGE DESIGN - AUTO RESPONSIVE GRID (NEVER OVERLAPPING) */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-items-center lg:justify-items-stretch w-full gap-8 sm:gap-12 lg:gap-16">
          
          {/* LEFT COLUMN: App Name in Two Lines + Unboxed 3-Line Rolling Commands */}
          <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8 lg:space-y-10 w-full max-w-xl">
            
            {/* APPLICATION TITLE - TWO LINES, FLUIDLY RESPONSIVE */}
            <div className="space-y-1 w-full">
              {/* Line 1: XENO */}
              <h1 className="font-roman text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold tracking-[0.18em] sm:tracking-[0.22em] text-white uppercase drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] leading-none select-none transition-all duration-700">
                XENO
              </h1>

              {/* Line 2: Inference in Calligraphy cursive */}
              <div className="font-calligraphy text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-normal text-zinc-200 drop-shadow-[0_0_20px_rgba(255,255,255,0.25)] animate-calligraphy leading-none select-none lg:pl-1">
                Inference
              </div>

              <p className="text-[10px] sm:text-xs md:text-sm font-light text-zinc-400 tracking-[0.25em] sm:tracking-[0.35em] uppercase pt-2 sm:pt-3">
                High-Throughput Neural AI Acceleration
              </p>
            </div>

            {/* UNBOXED 3-LINE ROLLING COMMAND STREAM WITH INLINE PROGRESS/GRAPHS */}
            <div className="w-full relative pt-1 text-left">
              {/* Soft subtle blurry gradient backdrop */}
              <div className="absolute -inset-4 bg-radial from-white/[0.03] to-transparent blur-2xl pointer-events-none" />

              {/* Exactly 3 Lines Stream with Disappearing Animation */}
              <div className="relative space-y-2 sm:space-y-3 font-mono text-[11px] sm:text-xs md:text-[13px] min-h-[90px] sm:min-h-[105px] flex flex-col justify-end overflow-hidden">
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
                      className={`flex items-center gap-2 transition-all duration-500 transform ${opacityClass}`}
                    >
                      <span className="text-zinc-500 select-none text-[10px] sm:text-xs flex-shrink-0">&gt;</span>
                      <span className="truncate break-all sm:break-normal">{COMMAND_SEQUENCE[idx].text}</span>
                      {isNewest && (
                        <span className="inline-block w-1.5 h-3 sm:h-3.5 bg-white animate-pulse select-none ml-1 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* MINIMALIST PROGRESS HAIRLINE BAR */}
              <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
                  <span className="text-zinc-500 tracking-wider">BOOTSTRAP PROGRESS</span>
                  <span className="font-semibold text-white tabular-nums tracking-wider">
                    {progress}%
                  </span>
                </div>

                {/* Responsive hairline track */}
                <div className="h-[2px] w-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Minimalist Feature Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-[10px] sm:text-xs text-zinc-500 font-mono tracking-wide">
              <span className="text-zinc-400">Rust Axum Core</span>
              <span>•</span>
              <span>Zero-Latency SSE</span>
              <span>•</span>
              <span>128K KV Cache</span>
            </div>

          </div>

          {/* RIGHT COLUMN: Razor-Sharp Vector Butterfly (Auto-Adjustable & Responsive) */}
          <div className="flex flex-col items-center justify-center relative select-none w-full max-w-[220px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[440px] aspect-[1104/1380]">
            {/* Soft white ambient glow */}
            <div className="absolute inset-0 rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />
            
            {/* Fluid Razor Sharp Butterfly */}
            <ButterflySvg className="w-full h-full" />

            {/* Slogan below butterfly */}
            <div className="mt-3 sm:mt-4 text-center space-y-0.5 sm:space-y-1">
              <div className="text-[9px] sm:text-[11px] uppercase font-mono tracking-[0.25em] sm:tracking-[0.3em] text-zinc-400">
                Neural AI Synthesis
              </div>
              <div className="text-[9px] sm:text-[10px] text-zinc-600 font-mono">
                Designed with TypeScript & Rust
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer Accent */}
      <footer className="relative z-10 flex-shrink-0 px-5 sm:px-10 lg:px-14 py-4 sm:py-6 w-full max-w-7xl mx-auto flex items-center justify-between text-[9px] sm:text-[11px] font-mono text-zinc-600">
        <span>XENO INFERENCE © 2026</span>
        <span>LATENCY: &lt; 0.4ms // TTFT: 118ms</span>
      </footer>

    </div>
  );
};