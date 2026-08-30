import React, { useEffect, useState } from "react";

export const PuzzleBoxLoader: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = "" }) => {
  const [activeCell, setActiveCell] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCell((prev) => (prev + 1) % 9);
    }, 180);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* 3x3 Puzzle Box Matrix */}
      <div 
        style={{ width: `${size}px`, height: `${size}px` }} 
        className="grid grid-cols-3 grid-rows-3 gap-1 p-1 bg-black/60 rounded-xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)] relative overflow-hidden backdrop-blur-md"
      >
        {Array.from({ length: 9 }).map((_, idx) => {
          const isActive = activeCell === idx;
          const isAdjacent = (activeCell + 1) % 9 === idx || (activeCell + 8) % 9 === idx;

          return (
            <div
              key={idx}
              className={`rounded-sm transition-all duration-200 ${
                isActive
                  ? "bg-amber-400 shadow-[0_0_8px_#f59e0b] scale-105 z-10 opacity-100"
                  : isAdjacent
                  ? "bg-cyan-500/60 shadow-[0_0_5px_#06b6d4] opacity-75"
                  : "bg-stone-800/60 opacity-35"
              }`}
            />
          );
        })}

        {/* Diagonal Scanline Effect */}
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-amber-400/10 to-transparent pointer-events-none animate-pulse" />
      </div>
    </div>
  );
};
