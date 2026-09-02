import React, { useEffect, useState } from 'react';
import { ButterflySvg } from './ButterflySvg';
import { XenoLogo } from './XenoLogo';

interface SplashIntroProps {
  onComplete: () => void;
}

// Helper to generate dynamic ASCII progress bar
const renderAsciiBar = (percent: number, length = 14): string => {
  const clamped = Math.max(0, Math.min(100, percent));
  const filledCount = Math.round((clamped / 100) * length);
  const emptyCount = length - filledCount;
  return `[${'█'.repeat(filledCount)}${'░'.repeat(emptyCount)}] ${clamped.toFixed(0)}%`;
};

// Dynamic sparkline frame generator
const SPARKLINE_FRAMES = [
  ' ▂▃▅▆▇█▇▆▅▃ ',
  '▂▃▅▆▇█▇▆▅▃ ▂',
  '▃▅▆▇█▇▆▅▃ ▂▃',
  '▅▆▇█▇▆▅▃ ▂▃▅',
  '▆▇█▇▆▅▃ ▂▃▅▆',
  '▇█▇▆▅▃ ▂▃▅▆▇',
  '█▇▆▅▃ ▂▃▅▆▇█',
];

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 15000; // 15 seconds total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedMs(elapsed);
      const currentProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(currentProgress);

      if (elapsed >= duration - 400) {
        setIsFadingOut(true);
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 150);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Compute live real-time dynamic command lines based on current elapsed time (15-second timeline)
  const getDynamicCommands = (elapsed: number) => {
    const list: { id: number; text: string; isReady: boolean }[] = [];

    // Step 0: Kernel init (0ms -> 1800ms)
    if (elapsed >= 100) {
      list.push({
        id: 0,
        text: '[KERNEL] Bootstrapping Xeno Neural Architecture v4.2...',
        isReady: elapsed > 1800,
      });
    }

    // Step 1: KV-Cache Dynamic Allocation (1800ms -> 4300ms)
    if (elapsed >= 1800) {
      const stepPct = Math.min(100, Math.max(0, ((elapsed - 1800) / 2500) * 100));
      const allocatedGb = ((stepPct / 100) * 16.0).toFixed(1);
      const bar = renderAsciiBar(stepPct, 12);
      list.push({
        id: 1,
        text: `[VRAM] KV-Cache Allocation: ${bar} (${allocatedGb}/16.0 GB)`,
        isReady: stepPct >= 100,
      });
    }

    // Step 2: PagedAttention Buffer (4200ms -> 6900ms)
    if (elapsed >= 4200) {
      const stepPct = Math.min(100, Math.max(0, ((elapsed - 4200) / 2700) * 100));
      const allocatedGb = (16.0 + (stepPct / 100) * 16.0).toFixed(1);
      const bar = renderAsciiBar(stepPct, 12);
      list.push({
        id: 2,
        text: `[VRAM] PagedAttention Buffer: ${bar} (${allocatedGb}/32.0 GB Total)`,
        isReady: stepPct >= 100,
      });
    }

    // Step 3: Quantization Calibration (6800ms -> 9600ms)
    if (elapsed >= 6800) {
      const stepPct = Math.min(100, Math.max(0, ((elapsed - 6800) / 2800) * 100));
      const bar = renderAsciiBar(stepPct, 12);
      list.push({
        id: 3,
        text: `[QUANT] Calibrating BF16 / FP8 Tensor Cores: ${bar} (SIMD Active)`,
        isReady: stepPct >= 100,
      });
    }

    // Step 4: Sparse Attention Density Sparkline (9500ms -> 12200ms)
    if (elapsed >= 9500) {
      const frameIdx = Math.floor(elapsed / 160) % SPARKLINE_FRAMES.length;
      const sparkline = SPARKLINE_FRAMES[frameIdx];
      const stepPct = Math.min(100, Math.max(0, ((elapsed - 9500) / 2700) * 100));
      list.push({
        id: 4,
        text: `[SPARSE] Attention Density: ${sparkline} (${stepPct.toFixed(0)}% mapped / 128k context)`,
        isReady: stepPct >= 100,
      });
    }

    // Step 5: Rust Daemon IPC Zero-Copy Channel (12000ms -> 14100ms)
    if (elapsed >= 12000) {
      const stepPct = Math.min(100, Math.max(0, ((elapsed - 12000) / 2100) * 100));
      const bar = renderAsciiBar(stepPct, 12);
      list.push({
        id: 5,
        text: `[BRIDGE] Zero-Copy IPC with Rust Daemon: ${bar} (<0.4ms latency)`,
        isReady: stepPct >= 100,
      });
    }

    // Step 6: Final Ready (14000ms+)
    if (elapsed >= 14000) {
      list.push({
        id: 6,
        text: '[ONLINE] Neural Inference Pipeline Active. Ready for input.',
        isReady: true,
      });
    }

    return list;
  };

  const dynamicCommands = getDynamicCommands(elapsedMs);
  const visibleCommands = dynamicCommands.slice(-3); // Always get the latest 3 lines

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

      {/* MAIN SPLIT PAGE DESIGN - AUTO RESPONSIVE GRID WITH ENLARGED VECTOR ARTWORK */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-items-center lg:justify-items-stretch w-full gap-8 sm:gap-12 lg:gap-14">
          
          {/* LEFT COLUMN: App Name in Two Lines + Unboxed Real-Time Dynamic Commands */}
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

            {/* UNBOXED 3-LINE ROLLING COMMAND STREAM WITH LIVE DYNAMIC ASCII PROGRESS */}
            <div className="w-full relative pt-1 text-left">
              {/* Soft subtle blurry gradient backdrop */}
              <div className="absolute -inset-4 bg-radial from-white/[0.03] to-transparent blur-2xl pointer-events-none" />

              {/* Exactly 3 Lines Stream with Disappearing Animation & Live Real-Time Updating ASCII Bars */}
              <div className="relative space-y-2 sm:space-y-3 font-mono text-[11px] sm:text-xs md:text-[13px] min-h-[90px] sm:min-h-[105px] flex flex-col justify-end overflow-hidden">
                {visibleCommands.map((cmd, pos) => {
                  const isNewest = pos === visibleCommands.length - 1;
                  const isOldest = pos === 0 && visibleCommands.length === 3;
                  const isMiddle = pos === 1 && visibleCommands.length === 3;

                  let opacityClass = 'opacity-100 text-white font-medium';
                  if (isOldest) opacityClass = 'opacity-25 text-zinc-500 scale-[0.98]';
                  else if (isMiddle) opacityClass = 'opacity-65 text-zinc-400';

                  return (
                    <div
                      key={cmd.id}
                      className={`flex items-center gap-2 transition-all duration-300 transform ${opacityClass}`}
                    >
                      <span className="text-zinc-500 select-none text-[10px] sm:text-xs flex-shrink-0">&gt;</span>
                      <span className="truncate break-all sm:break-normal font-mono">{cmd.text}</span>
                      {isNewest && (
                        <span className="inline-block w-1.5 h-3 sm:h-3.5 bg-white animate-pulse select-none ml-1 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* MINIMALIST PROGRESS HAIRLINE BAR (LIVE ANIMATED ACROSS 15 SECONDS) */}
              <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
                  <span className="text-zinc-500 tracking-wider">BOOTSTRAP PROGRESS</span>
                  <span className="font-semibold text-white tabular-nums tracking-wider">
                    {progress}%
                  </span>
                </div>

                {/* Real-time responsive hairline track */}
                <div className="h-[2px] w-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-75 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
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

          {/* RIGHT COLUMN: SLIGHTLY ENLARGED Razor-Sharp Vector Butterfly */}
          <div className="flex flex-col items-center justify-center relative select-none w-full max-w-[270px] sm:max-w-[370px] md:max-w-[450px] lg:max-w-[520px] xl:max-w-[560px] aspect-[1104/1380]">
            {/* Soft white ambient glow */}
            <div className="absolute inset-0 rounded-full bg-white/[0.03] blur-3xl pointer-events-none" />
            
            {/* Fluid Razor Sharp Butterfly (Enlarged and crystal clear) */}
            <ButterflySvg className="w-full h-full" />

            {/* Slogan below butterfly */}
            <div className="mt-3 sm:mt-4 text-center space-y-0.5 sm:space-y-1">
              <div className="text-[10px] sm:text-xs uppercase font-mono tracking-[0.25em] sm:tracking-[0.3em] text-zinc-300">
                Neural AI Synthesis
              </div>
              <div className="text-[9px] sm:text-[10px] text-zinc-500 font-mono">
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