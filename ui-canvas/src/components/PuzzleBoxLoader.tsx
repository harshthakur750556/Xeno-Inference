import React, { useEffect, useState } from 'react';

interface PuzzleBoxLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const PuzzleBoxLoader: React.FC<PuzzleBoxLoaderProps> = ({ 
  size = 'md',
  label = 'SYNCHRONIZING'
}) => {
  const [activeTileIndex, setActiveTileIndex] = useState(0);
  const [solvedState, setSolvedState] = useState(false);

  // Cycle through shifting puzzle grid positions
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTileIndex((prev) => (prev + 1) % 9);
      if (Math.random() > 0.8) {
        setSolvedState((s) => !s);
      }
    }, 450);
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }[size];

  const gridClasses = {
    sm: 'gap-0.5 p-0.5',
    md: 'gap-1 p-1',
    lg: 'gap-1.5 p-1.5',
  }[size];

  return (
    <div className="inline-flex items-center gap-3 select-none">
      {/* Square Puzzle Reloading Box */}
      <div className={`relative ${sizeClasses} rounded-lg bg-black/60 border border-violet-500/40 p-1 shadow-[0_0_20px_rgba(139,92,246,0.3)] backdrop-blur-md overflow-hidden group`}>
        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

        {/* 3x3 Puzzle Shifting Grid */}
        <div className={`grid grid-cols-3 grid-rows-3 w-full h-full ${gridClasses}`}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
            const isCenter = index === 4;
            const isActive = activeTileIndex === index;
            const isCorner = index === 0 || index === 2 || index === 6 || index === 8;

            let tileBg = 'bg-zinc-800/60 border-zinc-700/50';
            if (isActive) {
              tileBg = 'bg-cyan-400 border-cyan-300 shadow-[0_0_10px_#00f5d4] scale-95';
            } else if (isCenter) {
              tileBg = solvedState 
                ? 'bg-violet-500 border-violet-300 shadow-[0_0_8px_#8b5cf6]' 
                : 'bg-emerald-500/80 border-emerald-400 shadow-[0_0_8px_#10b981]';
            } else if (isCorner && !solvedState) {
              tileBg = 'bg-fuchsia-600/70 border-fuchsia-400';
            }

            return (
              <div
                key={index}
                className={`w-full h-full rounded-[2px] border transition-all duration-300 transform ${tileBg} ${
                  isActive ? 'rotate-12' : 'rotate-0'
                }`}
              />
            );
          })}
        </div>

        {/* Rotating Outer Corner Accent Brackets */}
        <div className="absolute -inset-0.5 rounded-lg border border-cyan-400/20 pointer-events-none animate-spin-slow" />
      </div>

      {/* Optional Reloading Label with Matrix Status */}
      {label && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase font-semibold">
              {label}
            </span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500 tracking-wider">
            CIPHER-PUZZLE :: SHIFT #{activeTileIndex + 1}
          </span>
        </div>
      )}
    </div>
  );
};
